import type { BaseClient } from '../client.js'
import type {
  RegisterWebhookInput,
  RegisterWebhookResponse,
  Webhook,
  UpdateWebhookInput,
  TestWebhookResponse,
  WebhookLog,
} from '../types.js'

/**
 * Webhook management resource.
 */
export class Webhooks {
  constructor(private readonly client: BaseClient) {}

  /**
   * Registers a new webhook endpoint.
   */
  async register(input: RegisterWebhookInput): Promise<RegisterWebhookResponse> {
    return this.client.request<RegisterWebhookResponse>('POST', '/webhooks', input)
  }

  /**
   * Lists all registered webhooks.
   */
  async list(): Promise<Webhook[]> {
    return this.client.request<Webhook[]>('GET', '/webhooks')
  }

  /**
   * Gets a webhook by ID.
   */
  async get(webhookId: string): Promise<Webhook> {
    return this.client.request<Webhook>(
      'GET',
      `/webhooks/${encodeURIComponent(webhookId)}`
    )
  }

  /**
   * Updates a webhook.
   */
  async update(webhookId: string, input: UpdateWebhookInput): Promise<Webhook> {
    return this.client.request<Webhook>(
      'PUT',
      `/webhooks/${encodeURIComponent(webhookId)}`,
      input
    )
  }

  /**
   * Deletes a webhook.
   */
  async delete(webhookId: string): Promise<void> {
    await this.client.requestVoid(
      'DELETE',
      `/webhooks/${encodeURIComponent(webhookId)}`
    )
  }

  /**
   * Sends a test event to a webhook.
   */
  async test(webhookId: string): Promise<TestWebhookResponse> {
    return this.client.request<TestWebhookResponse>(
      'POST',
      `/webhooks/${encodeURIComponent(webhookId)}/test`
    )
  }

  /**
   * Lists delivery logs for a webhook.
   */
  async listLogs(webhookId: string, limit?: number): Promise<WebhookLog[]> {
    const query = limit ? `?limit=${limit}` : ''
    return this.client.request<WebhookLog[]>(
      'GET',
      `/webhooks/${encodeURIComponent(webhookId)}/logs${query}`
    )
  }
}
