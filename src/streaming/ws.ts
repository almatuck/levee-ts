import type { LLMClient } from './llm.js'
import type { ChatMessage, StreamChunk, ChatResponse } from '../types.js'

// ============================================================================
// WebSocket Message Types (matching Go ws.go)
// ============================================================================

export const WSMessageType = {
  Start: 'start',
  Message: 'message',
  Abort: 'abort',
  Chunk: 'chunk',
  Completion: 'completion',
  Error: 'error',
  Started: 'started',
  ToolCall: 'tool_call',
  ToolResult: 'tool_result',
} as const

export type WSMessageType = (typeof WSMessageType)[keyof typeof WSMessageType]

// ============================================================================
// WebSocket Message Interfaces
// ============================================================================

/**
 * Base WebSocket message envelope.
 */
export interface WSMessage<T = unknown> {
  type: WSMessageType
  data?: T
}

/**
 * Start request - initiates a new chat session.
 */
export interface WSStartRequest {
  systemPrompt?: string
  model?: string // "haiku", "sonnet", "opus"
  maxTokens?: number
  temperature?: number
  messages?: ChatMessage[]
}

/**
 * User message - sends a user message to the chat.
 */
export interface WSUserMessage {
  content: string
}

/**
 * Abort request - aborts the current generation.
 */
export interface WSAbortRequest {
  reason?: string
}

/**
 * Tool result - provides a tool call result.
 */
export interface WSToolResult {
  toolCallId: string
  result: string
  isError?: boolean
}

/**
 * Started response - confirms session started.
 */
export interface WSStartedResponse {
  sessionId: string
  provider: string
  model: string
}

/**
 * Chunk response - streams content chunks.
 */
export interface WSChunkResponse {
  content: string
  index: number
}

/**
 * Tool call response - indicates LLM wants to call a tool.
 */
export interface WSToolCallResponse {
  toolCallId: string
  name: string
  argumentsJson: string
}

/**
 * Completion response - indicates generation complete.
 */
export interface WSCompletionResponse {
  fullContent: string
  stopReason: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  latencyMs: number
}

/**
 * Error response - indicates an error.
 */
export interface WSErrorResponse {
  code: string
  message: string
  retryable: boolean
}

// ============================================================================
// WebSocket Handler Configuration
// ============================================================================

/**
 * Configuration options for the WebSocket handler.
 */
export interface WSHandlerOptions {
  /**
   * Check if the origin is allowed.
   * If not provided, all origins are allowed.
   */
  checkOrigin?: (origin: string) => boolean
}

// ============================================================================
// WebSocket Interface (works with ws library or native WebSocket)
// ============================================================================

/**
 * Minimal WebSocket interface that works with both 'ws' library and native WebSocket.
 */
export interface WebSocketLike {
  send(data: string): void
  close(code?: number, reason?: string): void
  on?(event: 'message', listener: (data: Buffer | string) => void): void
  on?(event: 'close', listener: () => void): void
  on?(event: 'error', listener: (error: Error) => void): void
  addEventListener?(type: 'message', listener: (event: { data: unknown }) => void): void
  addEventListener?(type: 'close', listener: () => void): void
  addEventListener?(type: 'error', listener: (event: { error: Error }) => void): void
  readyState: number
}

// WebSocket ready states
const WS_OPEN = 1

// ============================================================================
// WebSocket Session
// ============================================================================

/**
 * Manages a single WebSocket chat session, bridging to gRPC.
 */
class WSSession {
  private readonly ws: WebSocketLike
  private readonly llm: LLMClient
  private started = false
  private abortController: AbortController | null = null

  constructor(ws: WebSocketLike, llm: LLMClient) {
    this.ws = ws
    this.llm = llm
  }

  /**
   * Start the session - begin listening for WebSocket messages.
   */
  async run(): Promise<void> {
    // Set up message handler using either 'ws' library style or browser style
    if (this.ws.on) {
      this.ws.on('message', (data: Buffer | string) => {
        const message = typeof data === 'string' ? data : data.toString()
        this.handleMessage(message)
      })
      this.ws.on('close', () => this.cleanup())
      this.ws.on('error', () => this.cleanup())
    } else if (this.ws.addEventListener) {
      this.ws.addEventListener('message', (event: { data: unknown }) => {
        const message = typeof event.data === 'string' ? event.data : String(event.data)
        this.handleMessage(message)
      })
      this.ws.addEventListener('close', () => this.cleanup())
      this.ws.addEventListener('error', () => this.cleanup())
    }
  }

  private handleMessage(raw: string): void {
    let msg: WSMessage
    try {
      msg = JSON.parse(raw) as WSMessage
    } catch {
      this.sendError('invalid_json', 'Invalid JSON message', false)
      return
    }

    switch (msg.type) {
      case WSMessageType.Start:
        this.handleStart(msg.data as WSStartRequest)
        break
      case WSMessageType.Message:
        this.handleUserMessage(msg.data as WSUserMessage)
        break
      case WSMessageType.Abort:
        this.handleAbort(msg.data as WSAbortRequest)
        break
      case WSMessageType.ToolResult:
        this.handleToolResult(msg.data as WSToolResult)
        break
      default:
        this.sendError('unknown_type', `Unknown message type: ${msg.type}`, false)
    }
  }

  private async handleStart(req: WSStartRequest): Promise<void> {
    if (this.started) {
      this.sendError('already_started', 'Session already started', false)
      return
    }

    try {
      this.abortController = new AbortController()

      // Start the chat stream
      const stream = this.llm.chatStream({
        messages: req.messages ?? [],
        systemPrompt: req.systemPrompt,
        model: req.model as 'haiku' | 'sonnet' | 'opus' | undefined,
        maxTokens: req.maxTokens,
        temperature: req.temperature,
      })

      this.started = true

      // Send started response (simulated since we don't have session ID from gRPC yet)
      this.send(WSMessageType.Started, {
        sessionId: crypto.randomUUID(),
        provider: 'anthropic',
        model: req.model ?? 'sonnet',
      } satisfies WSStartedResponse)

      // Read from the stream and forward to WebSocket
      this.readStreamResponses(stream)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.sendError('start_failed', message, true)
    }
  }

  private async readStreamResponses(
    stream: AsyncGenerator<StreamChunk, ChatResponse, unknown>
  ): Promise<void> {
    try {
      let fullContent = ''

      // Iterate through all yielded chunks
      for await (const chunk of stream) {
        fullContent += chunk.content
        this.send(WSMessageType.Chunk, {
          content: chunk.content,
          index: chunk.index,
        } satisfies WSChunkResponse)
      }

      // After the loop completes, send completion
      // The generator has returned, meaning the stream is done
      this.send(WSMessageType.Completion, {
        fullContent,
        stopReason: 'end_turn',
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        latencyMs: 0,
      } satisfies WSCompletionResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.sendError('stream_error', message, false)
    }
  }

  private handleUserMessage(msg: WSUserMessage): void {
    if (!this.started) {
      this.sendError('not_started', 'Session not started', false)
      return
    }

    // For now, we need to start a new stream for each message
    // The Go implementation uses bidirectional streaming which we're simulating
    this.sendError('not_implemented', 'Multi-turn streaming not yet supported in TypeScript SDK', false)
  }

  private handleAbort(_req: WSAbortRequest): void {
    if (!this.started) {
      return
    }

    if (this.abortController) {
      this.abortController.abort()
    }
  }

  private handleToolResult(_result: WSToolResult): void {
    if (!this.started) {
      this.sendError('not_started', 'Session not started', false)
      return
    }

    // Tool results are handled by the gRPC stream
    this.sendError('not_implemented', 'Tool results not yet supported in TypeScript SDK', false)
  }

  private send<T>(type: WSMessageType, data: T): void {
    if (this.ws.readyState !== WS_OPEN) {
      return
    }

    const msg: WSMessage<T> = { type, data }
    this.ws.send(JSON.stringify(msg))
  }

  private sendError(code: string, message: string, retryable: boolean): void {
    this.send(WSMessageType.Error, {
      code,
      message,
      retryable,
    } satisfies WSErrorResponse)
  }

  private cleanup(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    this.started = false
  }
}

// ============================================================================
// WebSocket Handler
// ============================================================================

/**
 * WebSocket handler for LLM chat that bridges WebSocket to gRPC.
 */
export class WebSocketHandler {
  private readonly llm: LLMClient
  private readonly options: WSHandlerOptions

  constructor(llm: LLMClient, options: WSHandlerOptions = {}) {
    this.llm = llm
    this.options = options
  }

  /**
   * Handle a WebSocket connection.
   * Use this with the 'ws' library:
   *
   * @example
   * ```typescript
   * const wss = new WebSocketServer({ port: 8080 })
   * wss.on('connection', (ws) => wsHandler.handleConnection(ws))
   * ```
   */
  handleConnection(ws: WebSocketLike): void {
    const session = new WSSession(ws, this.llm)
    session.run()
  }

  /**
   * Attach to an HTTP server with the 'ws' library.
   * This creates a WebSocketServer and handles connections on the specified path.
   *
   * @example
   * ```typescript
   * const server = http.createServer()
   * await wsHandler.attach(server, '/ws/chat')
   * server.listen(8080)
   * ```
   *
   * @param server - The HTTP server to attach to
   * @param path - The path to handle WebSocket connections on (default: '/ws/chat')
   * @returns The WebSocketServer instance
   */
  async attach(
    server: { on(event: string, handler: (...args: never[]) => void): void },
    path = '/ws/chat'
  ): Promise<unknown> {
    // Dynamic import to make 'ws' optional
    const wsLib = await import('ws')
    const { WebSocketServer } = wsLib

    const wss = new WebSocketServer({ noServer: true })
    const handler = this

    wss.on('connection', (socket: WebSocketLike) => {
      handler.handleConnection(socket)
    })

    const upgradeHandler = (request: unknown, socket: unknown, head: unknown): void => {
      const req = request as { url?: string; headers?: Record<string, string> }
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname

      if (pathname !== path) {
        return
      }

      // Check origin if configured
      if (handler.options.checkOrigin) {
        const origin = req.headers?.origin ?? ''
        if (!handler.options.checkOrigin(origin)) {
          (socket as { destroy?: () => void }).destroy?.()
          return
        }
      }

      wss.handleUpgrade(request as never, socket as never, head as never, (ws: WebSocketLike) => {
        wss.emit('connection', ws, request)
      })
    }

    server.on('upgrade', upgradeHandler as never)

    return wss
  }
}

/**
 * Create a WebSocket handler for LLM chat.
 *
 * @example
 * ```typescript
 * import { createWebSocketHandler, LLMClient } from '@levee/sdk'
 *
 * const llm = new LLMClient('api-key')
 * const wsHandler = createWebSocketHandler(llm, {
 *   checkOrigin: (origin) => origin === 'https://myapp.com'
 * })
 *
 * // With ws library
 * const wss = new WebSocketServer({ port: 8080 })
 * wss.on('connection', (ws) => wsHandler.handleConnection(ws))
 *
 * // Or attach to HTTP server
 * const server = http.createServer()
 * await wsHandler.attach(server, '/ws/chat')
 * server.listen(8080)
 * ```
 *
 * @param llm - The LLM client to use for chat
 * @param options - Handler options
 * @returns A WebSocket handler
 */
export function createWebSocketHandler(
  llm: LLMClient,
  options: WSHandlerOptions = {}
): WebSocketHandler {
  return new WebSocketHandler(llm, options)
}
