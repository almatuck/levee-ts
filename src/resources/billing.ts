import type { BaseClient } from '../client.js'
import type {
  CustomerInput,
  CustomerResponse,
  CheckoutInput,
  CheckoutResponse,
  SubscriptionInput,
  SubscriptionResponse,
  UsageInput,
  PortalInput,
  PortalResponse,
} from '../types.js'

/**
 * Stripe billing integration resource.
 */
export class Billing {
  constructor(private readonly client: BaseClient) {}

  /**
   * Creates a billing customer.
   */
  async createCustomer(input: CustomerInput): Promise<CustomerResponse> {
    return this.client.request<CustomerResponse>('POST', '/billing/customers', input)
  }

  /**
   * Creates a Stripe checkout session.
   */
  async createCheckout(input: CheckoutInput): Promise<CheckoutResponse> {
    return this.client.request<CheckoutResponse>('POST', '/billing/checkout', input)
  }

  /**
   * Creates a subscription directly.
   */
  async createSubscription(input: SubscriptionInput): Promise<SubscriptionResponse> {
    return this.client.request<SubscriptionResponse>(
      'POST',
      '/billing/subscriptions',
      input
    )
  }

  /**
   * Cancels a subscription.
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.requestVoid(
      'POST',
      `/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`
    )
  }

  /**
   * Records metered usage for a subscription item.
   */
  async recordUsage(input: UsageInput): Promise<void> {
    await this.client.requestVoid('POST', '/billing/usage', input)
  }

  /**
   * Gets a Stripe customer portal URL.
   */
  async getPortal(input: PortalInput): Promise<PortalResponse> {
    return this.client.request<PortalResponse>('POST', '/billing/portal', input)
  }
}
