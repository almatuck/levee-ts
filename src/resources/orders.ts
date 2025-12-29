import type { BaseClient } from '../client.js'
import type { OrderInput, OrderResponse } from '../types.js'

/**
 * Order and checkout creation resource.
 */
export class Orders {
  constructor(private readonly client: BaseClient) {}

  /**
   * Creates an order with a checkout session.
   * Returns a checkout URL to redirect the user to.
   */
  async create(input: OrderInput): Promise<OrderResponse> {
    return this.client.request<OrderResponse>('POST', '/orders', input)
  }
}
