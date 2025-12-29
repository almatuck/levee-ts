import type { BaseClient } from '../client.js'

/**
 * Email list subscription resource.
 */
export class Lists {
  constructor(private readonly client: BaseClient) {}

  /**
   * Subscribes a contact to an email list.
   */
  async subscribe(listSlug: string, email: string, name?: string): Promise<void> {
    await this.client.requestVoid(
      'POST',
      `/lists/${encodeURIComponent(listSlug)}/subscribe`,
      { email, name }
    )
  }

  /**
   * Unsubscribes a contact from an email list.
   */
  async unsubscribe(listSlug: string, email: string): Promise<void> {
    await this.client.requestVoid(
      'POST',
      `/lists/${encodeURIComponent(listSlug)}/unsubscribe`,
      { email }
    )
  }
}
