import type { BaseClient } from '../client.js'
import type { ChatInput, ChatResponse } from '../types.js'

interface LLMConfigResponse {
  provider: string
  models: string[]
  defaultModel: string
}

/**
 * LLM/AI resource for simple (non-streaming) chat.
 * For streaming, use the LLMClient class.
 */
export class LLM {
  constructor(private readonly client: BaseClient) {}

  /**
   * Sends a simple chat request (non-streaming).
   *
   * @example
   * ```typescript
   * const response = await levee.llm.chat({
   *   messages: [{ role: 'user', content: 'Hello!' }],
   *   model: 'sonnet',
   * })
   * console.log(response.content)
   * ```
   */
  async chat(input: ChatInput): Promise<ChatResponse> {
    return this.client.request<ChatResponse>('POST', '/llm/chat', input)
  }

  /**
   * Gets the LLM configuration for this org.
   */
  async getConfig(): Promise<LLMConfigResponse> {
    return this.client.request<LLMConfigResponse>('GET', '/llm/config')
  }
}
