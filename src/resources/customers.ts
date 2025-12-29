import type { BaseClient } from '../client.js'
import type {
  CustomerInfo,
  Invoice,
  CustomerOrder,
  Subscription,
  Payment,
} from '../types.js'

/**
 * Customer billing history resource (read-only).
 * Perfect for building customer account pages.
 */
export class Customers {
  constructor(private readonly client: BaseClient) {}

  /**
   * Gets customer info by email.
   */
  async getByEmail(email: string): Promise<CustomerInfo> {
    return this.client.request<CustomerInfo>(
      'GET',
      `/customers/${encodeURIComponent(email)}`
    )
  }

  /**
   * Lists invoices for a customer.
   */
  async listInvoices(email: string, limit?: number): Promise<Invoice[]> {
    const query = limit ? `?limit=${limit}` : ''
    return this.client.request<Invoice[]>(
      'GET',
      `/customers/${encodeURIComponent(email)}/invoices${query}`
    )
  }

  /**
   * Lists orders for a customer.
   */
  async listOrders(email: string, limit?: number): Promise<CustomerOrder[]> {
    const query = limit ? `?limit=${limit}` : ''
    return this.client.request<CustomerOrder[]>(
      'GET',
      `/customers/${encodeURIComponent(email)}/orders${query}`
    )
  }

  /**
   * Lists subscriptions for a customer.
   */
  async listSubscriptions(email: string): Promise<Subscription[]> {
    return this.client.request<Subscription[]>(
      'GET',
      `/customers/${encodeURIComponent(email)}/subscriptions`
    )
  }

  /**
   * Lists payments for a customer.
   */
  async listPayments(email: string, limit?: number): Promise<Payment[]> {
    const query = limit ? `?limit=${limit}` : ''
    return this.client.request<Payment[]>(
      'GET',
      `/customers/${encodeURIComponent(email)}/payments${query}`
    )
  }
}
