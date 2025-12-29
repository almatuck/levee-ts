import type { BaseClient } from '../client.js'
import type {
  ContactInput,
  ContactResponse,
  ContactInfo,
  UpdateContactInput,
  ContactActivity,
} from '../types.js'

/**
 * Contact management resource.
 */
export class Contacts {
  constructor(private readonly client: BaseClient) {}

  /**
   * Creates a new contact or returns existing if email already exists.
   */
  async create(input: ContactInput): Promise<ContactResponse> {
    return this.client.request<ContactResponse>('POST', '/contacts', input)
  }

  /**
   * Gets a contact by ID or email.
   */
  async get(idOrEmail: string): Promise<ContactInfo> {
    return this.client.request<ContactInfo>(
      'GET',
      `/contacts/${encodeURIComponent(idOrEmail)}`
    )
  }

  /**
   * Updates a contact.
   */
  async update(idOrEmail: string, input: UpdateContactInput): Promise<ContactInfo> {
    return this.client.request<ContactInfo>(
      'PUT',
      `/contacts/${encodeURIComponent(idOrEmail)}`,
      input
    )
  }

  /**
   * Adds tags to a contact.
   */
  async addTags(idOrEmail: string, tags: string[]): Promise<void> {
    await this.client.requestVoid(
      'POST',
      `/contacts/${encodeURIComponent(idOrEmail)}/tags`,
      { tags }
    )
  }

  /**
   * Removes tags from a contact.
   */
  async removeTags(idOrEmail: string, tags: string[]): Promise<void> {
    await this.client.requestVoid(
      'DELETE',
      `/contacts/${encodeURIComponent(idOrEmail)}/tags`,
      { tags }
    )
  }

  /**
   * Lists activity for a contact.
   */
  async listActivity(idOrEmail: string, limit?: number): Promise<ContactActivity[]> {
    const query = limit ? `?limit=${limit}` : ''
    return this.client.request<ContactActivity[]>(
      'GET',
      `/contacts/${encodeURIComponent(idOrEmail)}/activity${query}`
    )
  }

  /**
   * Globally unsubscribes a contact from all communications.
   */
  async globalUnsubscribe(email: string, reason?: string): Promise<void> {
    await this.client.requestVoid('POST', '/contacts/unsubscribe', { email, reason })
  }
}
