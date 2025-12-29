import type { BaseClient } from '../client.js'
import type {
  EnrollSequenceInput,
  EnrollSequenceResponse,
  SequenceEnrollment,
} from '../types.js'

/**
 * Email sequence (drip campaign) resource.
 */
export class Sequences {
  constructor(private readonly client: BaseClient) {}

  /**
   * Enrolls a contact in a sequence.
   */
  async enroll(input: EnrollSequenceInput): Promise<EnrollSequenceResponse> {
    return this.client.request<EnrollSequenceResponse>(
      'POST',
      '/sequences/enroll',
      input
    )
  }

  /**
   * Gets sequence enrollments for a contact.
   *
   * @param email - Contact email
   * @param sequenceSlug - Optional filter by sequence slug
   */
  async getEnrollments(
    email: string,
    sequenceSlug?: string
  ): Promise<SequenceEnrollment[]> {
    const params = new URLSearchParams({ email })
    if (sequenceSlug) params.set('sequence_slug', sequenceSlug)
    return this.client.request<SequenceEnrollment[]>(
      'GET',
      `/sequences/enrollments?${params.toString()}`
    )
  }

  /**
   * Unenrolls a contact from a sequence.
   *
   * @param email - Contact email
   * @param sequenceSlug - Sequence slug, or empty to unenroll from all
   */
  async unenroll(email: string, sequenceSlug?: string): Promise<void> {
    await this.client.requestVoid('POST', '/sequences/unenroll', {
      email,
      sequenceSlug,
    })
  }

  /**
   * Pauses a sequence enrollment.
   */
  async pause(email: string, sequenceSlug: string): Promise<void> {
    await this.client.requestVoid('POST', '/sequences/pause', {
      email,
      sequenceSlug,
    })
  }

  /**
   * Resumes a paused sequence enrollment.
   */
  async resume(email: string, sequenceSlug: string): Promise<void> {
    await this.client.requestVoid('POST', '/sequences/resume', {
      email,
      sequenceSlug,
    })
  }
}
