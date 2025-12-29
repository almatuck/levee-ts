import type { BaseClient } from '../client.js'
import type {
  SendEmailInput,
  SendEmailResponse,
  EmailStatus,
  EmailEvent,
} from '../types.js'

/**
 * Transactional email resource.
 */
export class Emails {
  constructor(private readonly client: BaseClient) {}

  /**
   * Sends a transactional email.
   */
  async send(input: SendEmailInput): Promise<SendEmailResponse> {
    return this.client.request<SendEmailResponse>('POST', '/emails', input)
  }

  /**
   * Gets the delivery status of an email.
   */
  async getStatus(messageId: string): Promise<EmailStatus> {
    return this.client.request<EmailStatus>(
      'GET',
      `/emails/${encodeURIComponent(messageId)}`
    )
  }

  /**
   * Lists tracking events for an email.
   */
  async listEvents(messageId: string): Promise<EmailEvent[]> {
    return this.client.request<EmailEvent[]>(
      'GET',
      `/emails/${encodeURIComponent(messageId)}/events`
    )
  }
}
