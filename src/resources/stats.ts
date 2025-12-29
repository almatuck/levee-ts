import type { BaseClient } from '../client.js'
import type {
  StatsOptions,
  StatsOverview,
  EmailStats,
  RevenueStats,
  ContactStats,
} from '../types.js'

/**
 * Analytics and statistics resource.
 */
export class Stats {
  constructor(private readonly client: BaseClient) {}

  private buildQuery(options?: StatsOptions): string {
    if (!options) return ''
    const params = new URLSearchParams()
    if (options.startDate) params.set('start_date', options.startDate)
    if (options.endDate) params.set('end_date', options.endDate)
    if (options.groupBy) params.set('group_by', options.groupBy)
    const query = params.toString()
    return query ? `?${query}` : ''
  }

  /**
   * Gets overview statistics.
   */
  async getOverview(options?: StatsOptions): Promise<StatsOverview> {
    return this.client.request<StatsOverview>(
      'GET',
      `/stats/overview${this.buildQuery(options)}`
    )
  }

  /**
   * Gets email statistics.
   */
  async getEmailStats(options?: StatsOptions): Promise<EmailStats> {
    return this.client.request<EmailStats>(
      'GET',
      `/stats/emails${this.buildQuery(options)}`
    )
  }

  /**
   * Gets revenue statistics.
   */
  async getRevenueStats(options?: StatsOptions): Promise<RevenueStats> {
    return this.client.request<RevenueStats>(
      'GET',
      `/stats/revenue${this.buildQuery(options)}`
    )
  }

  /**
   * Gets contact statistics.
   */
  async getContactStats(options?: StatsOptions): Promise<ContactStats> {
    return this.client.request<ContactStats>(
      'GET',
      `/stats/contacts${this.buildQuery(options)}`
    )
  }
}
