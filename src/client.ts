import { createAPIError, type APIError } from './errors.js'
import { Contacts } from './resources/contacts.js'
import { Emails } from './resources/emails.js'
import { Sequences } from './resources/sequences.js'
import { Billing } from './resources/billing.js'
import { Customers } from './resources/customers.js'
import { Webhooks } from './resources/webhooks.js'
import { Stats } from './resources/stats.js'
import { Content } from './resources/content.js'
import { Site } from './resources/site.js'
import { Lists } from './resources/lists.js'
import { Orders } from './resources/orders.js'
import { Tracking } from './resources/tracking.js'
import { LLM } from './resources/llm.js'

const DEFAULT_BASE_URL = 'https://levee.com/sdk/v1'
const DEFAULT_TIMEOUT = 30000

export interface ClientOptions {
  baseURL?: string
  timeout?: number
  fetch?: typeof fetch
}

/**
 * Internal interface for making HTTP requests.
 * Used by resource classes.
 */
export interface BaseClient {
  request<T>(method: string, path: string, body?: unknown): Promise<T>
  requestVoid(method: string, path: string, body?: unknown): Promise<void>
}

/**
 * Converts camelCase keys to snake_case for API requests.
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * Recursively converts object keys from camelCase to snake_case.
 */
function toSnakeCaseKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toSnakeCaseKeys)
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toSnakeCase(key)] = toSnakeCaseKeys(value)
    }
    return result
  }
  return obj
}

/**
 * Converts snake_case keys to camelCase for API responses.
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * Recursively converts object keys from snake_case to camelCase.
 */
function toCamelCaseKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toCamelCaseKeys)
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = toCamelCaseKeys(value)
    }
    return result
  }
  return obj
}

/**
 * Main Levee SDK client.
 *
 * @example
 * ```typescript
 * const levee = new Levee('lv_your_api_key')
 *
 * // Create a contact
 * const contact = await levee.contacts.create({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 * })
 *
 * // Get site settings for SSG
 * const settings = await levee.site.getSettings()
 * ```
 */
export class Levee implements BaseClient {
  private readonly apiKey: string
  private readonly baseURL: string
  private readonly timeout: number
  private readonly _fetch: typeof fetch

  /** Contact management */
  readonly contacts: Contacts
  /** Transactional emails */
  readonly emails: Emails
  /** Drip campaign sequences */
  readonly sequences: Sequences
  /** Stripe billing integration */
  readonly billing: Billing
  /** Customer billing history (read-only) */
  readonly customers: Customers
  /** Webhook management */
  readonly webhooks: Webhooks
  /** Analytics and statistics */
  readonly stats: Stats
  /** CMS content (posts, pages, categories) */
  readonly content: Content
  /** Site configuration (settings, menus, authors) */
  readonly site: Site
  /** Email list subscriptions */
  readonly lists: Lists
  /** Order creation with checkout */
  readonly orders: Orders
  /** Custom event tracking */
  readonly tracking: Tracking
  /** LLM/AI chat (non-streaming) */
  readonly llm: LLM

  constructor(apiKey: string, options: ClientOptions = {}) {
    if (!apiKey) {
      throw new Error('API key is required')
    }

    this.apiKey = apiKey
    this.baseURL = options.baseURL ?? DEFAULT_BASE_URL
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT
    this._fetch = options.fetch ?? fetch

    // Initialize resource namespaces
    this.contacts = new Contacts(this)
    this.emails = new Emails(this)
    this.sequences = new Sequences(this)
    this.billing = new Billing(this)
    this.customers = new Customers(this)
    this.webhooks = new Webhooks(this)
    this.stats = new Stats(this)
    this.content = new Content(this)
    this.site = new Site(this)
    this.lists = new Lists(this)
    this.orders = new Orders(this)
    this.tracking = new Tracking(this)
    this.llm = new LLM(this)
  }

  /**
   * Makes an HTTP request to the Levee API.
   *
   * @internal
   */
  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseURL}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await this._fetch(url, {
        method,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body ? JSON.stringify(toSnakeCaseKeys(body)) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorBody = await response.text()
        let message = `API request failed with status ${response.status}`
        try {
          const errorJson = JSON.parse(errorBody) as { message?: string; error?: string }
          message = errorJson.message ?? errorJson.error ?? message
        } catch {
          if (errorBody) message = errorBody
        }

        const requestId = response.headers.get('x-request-id') ?? undefined
        throw createAPIError(message, response.status, response.headers, requestId)
      }

      const data = (await response.json()) as unknown
      return toCamelCaseKeys(data) as T
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.timeout}ms`)
      }
      throw error
    }
  }

  /**
   * Makes an HTTP request that doesn't return a body.
   *
   * @internal
   */
  async requestVoid(method: string, path: string, body?: unknown): Promise<void> {
    const url = `${this.baseURL}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await this._fetch(url, {
        method,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body ? JSON.stringify(toSnakeCaseKeys(body)) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorBody = await response.text()
        let message = `API request failed with status ${response.status}`
        try {
          const errorJson = JSON.parse(errorBody) as { message?: string; error?: string }
          message = errorJson.message ?? errorJson.error ?? message
        } catch {
          if (errorBody) message = errorBody
        }

        const requestId = response.headers.get('x-request-id') ?? undefined
        throw createAPIError(message, response.status, response.headers, requestId)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.timeout}ms`)
      }
      throw error
    }
  }
}
