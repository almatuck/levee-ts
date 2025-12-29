import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ChatInput, ChatResponse, StreamChunk, ChatMessage } from '../types.js'

const DEFAULT_GRPC_ADDRESS = 'llm.levee.com:9889'

export interface LLMClientOptions {
  grpcAddress?: string
}

interface ProtoMessage {
  role: string
  content: string
}

interface StartChatRequest {
  apiKey: string
  systemPrompt?: string
  model?: string
  maxTokens?: number
  temperature?: number
  messages?: ProtoMessage[]
  requestId?: string
}

interface UserMessageRequest {
  content: string
}

interface AbortRequestMessage {
  reason?: string
}

interface ChatRequestMessage {
  start?: StartChatRequest
  message?: UserMessageRequest
  abort?: AbortRequestMessage
}

interface SessionStartedResponse {
  sessionId: string
  provider: string
  model: string
}

interface ContentChunkResponse {
  content: string
  index: number
}

interface CompletionResponseMessage {
  fullContent: string
  stopReason: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  latencyMs: number
}

interface ErrorResponseMessage {
  code: string
  message: string
  retryable: boolean
}

interface ChatResponseMessage {
  sessionStarted?: SessionStartedResponse
  chunk?: ContentChunkResponse
  completion?: CompletionResponseMessage
  error?: ErrorResponseMessage
  aborted?: { reason: string }
}

type StreamCallback = (chunk: StreamChunk) => void | Promise<void>

interface LLMServiceClient {
  Chat(): grpc.ClientDuplexStream<ChatRequestMessage, ChatResponseMessage>
  SimpleChat(
    request: {
      apiKey: string
      messages: ProtoMessage[]
      systemPrompt?: string
      model?: string
      maxTokens?: number
      temperature?: number
      requestId?: string
    },
    callback: (error: grpc.ServiceError | null, response: CompletionResponseMessage) => void
  ): void
}

/**
 * LLM Client for streaming chat via gRPC.
 *
 * @example
 * ```typescript
 * const llm = new LLMClient('lv_your_api_key')
 *
 * // Streaming chat
 * for await (const chunk of llm.chatStream({
 *   messages: [{ role: 'user', content: 'Tell me a story' }],
 *   model: 'sonnet',
 * })) {
 *   process.stdout.write(chunk.content)
 * }
 *
 * // Simple chat
 * const response = await llm.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * })
 * ```
 */
export class LLMClient {
  private readonly apiKey: string
  private readonly grpcAddress: string
  private client: LLMServiceClient | null = null

  constructor(apiKey: string, options: LLMClientOptions = {}) {
    if (!apiKey) {
      throw new Error('API key is required')
    }
    this.apiKey = apiKey
    this.grpcAddress = options.grpcAddress ?? DEFAULT_GRPC_ADDRESS
  }

  private async getClient(): Promise<LLMServiceClient> {
    if (this.client) return this.client

    // Get the proto file path relative to this module
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const protoPath = join(__dirname, '..', '..', 'proto', 'llm.proto')

    const packageDefinition = await protoLoader.load(protoPath, {
      keepCase: false,
      longs: Number,
      enums: String,
      defaults: true,
      oneofs: true,
    })

    const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as {
      llm: { LLMService: new (address: string, credentials: grpc.ChannelCredentials) => LLMServiceClient }
    }

    this.client = new proto.llm.LLMService(
      this.grpcAddress,
      grpc.credentials.createSsl()
    )

    return this.client
  }

  /**
   * Simple (non-streaming) chat using gRPC.
   */
  async chat(input: ChatInput): Promise<ChatResponse> {
    const client = await this.getClient()

    return new Promise((resolve, reject) => {
      client.SimpleChat(
        {
          apiKey: this.apiKey,
          messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: input.systemPrompt,
          model: input.model,
          maxTokens: input.maxTokens,
          temperature: input.temperature,
        },
        (error, response) => {
          if (error) {
            reject(new Error(error.message))
            return
          }
          resolve({
            content: response.fullContent,
            model: input.model,
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
            costUsd: response.costUsd,
            latencyMs: response.latencyMs,
            stopReason: response.stopReason,
          })
        }
      )
    })
  }

  /**
   * Streaming chat using gRPC.
   * Returns an async iterator that yields content chunks.
   *
   * @example
   * ```typescript
   * for await (const chunk of llm.chatStream({ messages, model: 'sonnet' })) {
   *   process.stdout.write(chunk.content)
   * }
   * ```
   */
  async *chatStream(input: ChatInput): AsyncGenerator<StreamChunk, ChatResponse, unknown> {
    const client = await this.getClient()
    const stream = client.Chat()

    // Send start request
    stream.write({
      start: {
        apiKey: this.apiKey,
        systemPrompt: input.systemPrompt,
        model: input.model,
        maxTokens: input.maxTokens,
        temperature: input.temperature,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
      },
    } as ChatRequestMessage)

    let completion: ChatResponse | null = null
    let error: Error | null = null

    // Create a promise-based iterator
    const chunks: StreamChunk[] = []
    let resolveNext: ((value: IteratorResult<StreamChunk, ChatResponse>) => void) | null = null
    let done = false

    stream.on('data', (response: ChatResponseMessage) => {
      if (response.chunk) {
        const chunk: StreamChunk = {
          content: response.chunk.content,
          index: response.chunk.index,
        }
        if (resolveNext) {
          resolveNext({ value: chunk, done: false })
          resolveNext = null
        } else {
          chunks.push(chunk)
        }
      } else if (response.completion) {
        completion = {
          content: response.completion.fullContent,
          inputTokens: response.completion.inputTokens,
          outputTokens: response.completion.outputTokens,
          costUsd: response.completion.costUsd,
          latencyMs: response.completion.latencyMs,
          stopReason: response.completion.stopReason,
        }
        done = true
        if (resolveNext) {
          resolveNext({ value: completion, done: true })
          resolveNext = null
        }
      } else if (response.error) {
        error = new Error(`${response.error.code}: ${response.error.message}`)
        done = true
        if (resolveNext) {
          resolveNext({ value: undefined as unknown as StreamChunk, done: true })
          resolveNext = null
        }
      }
    })

    stream.on('error', (err: Error) => {
      error = err
      done = true
      if (resolveNext) {
        resolveNext({ value: undefined as unknown as StreamChunk, done: true })
        resolveNext = null
      }
    })

    stream.on('end', () => {
      done = true
      if (resolveNext) {
        resolveNext({ value: completion as ChatResponse, done: true })
        resolveNext = null
      }
    })

    // Yield chunks as they arrive
    while (!done) {
      if (chunks.length > 0) {
        yield chunks.shift()!
      } else {
        const result = await new Promise<IteratorResult<StreamChunk, ChatResponse>>((resolve) => {
          resolveNext = resolve
        })
        if (result.done) {
          if (error) throw error
          return result.value as ChatResponse
        }
        yield result.value
      }
    }

    // Drain remaining chunks
    while (chunks.length > 0) {
      yield chunks.shift()!
    }

    if (error) throw error
    if (!completion) {
      throw new Error('Stream ended without completion')
    }
    return completion
  }

  /**
   * Streaming chat with callback.
   *
   * @example
   * ```typescript
   * const response = await llm.chatStreamCallback(
   *   { messages, model: 'sonnet' },
   *   (chunk) => process.stdout.write(chunk.content)
   * )
   * console.log('\\nDone:', response.outputTokens, 'tokens')
   * ```
   */
  async chatStreamCallback(
    input: ChatInput,
    onChunk: StreamCallback
  ): Promise<ChatResponse> {
    let response: ChatResponse | undefined
    for await (const chunk of this.chatStream(input)) {
      await onChunk(chunk)
    }
    // The generator returns the final response
    const gen = this.chatStream(input)
    let result = await gen.next()
    while (!result.done) {
      await onChunk(result.value)
      result = await gen.next()
    }
    return result.value
  }

  /**
   * Closes the gRPC client connection.
   */
  close(): void {
    if (this.client) {
      grpc.closeClient(this.client as unknown as grpc.Client)
      this.client = null
    }
  }
}
