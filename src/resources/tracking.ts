import type { BaseClient } from '../client.js'
import type { TrackEventInput } from '../types.js'

/**
 * Custom event tracking resource.
 */
export class Tracking {
  constructor(private readonly client: BaseClient) {}

  /**
   * Tracks a custom event.
   *
   * @example
   * ```typescript
   * await levee.tracking.track({
   *   event: 'purchase_completed',
   *   email: 'user@example.com',
   *   properties: {
   *     product: 'pro-plan',
   *     amount: '99.00',
   *   },
   * })
   * ```
   */
  async track(input: TrackEventInput): Promise<void> {
    await this.client.requestVoid('POST', '/events', input)
  }
}
