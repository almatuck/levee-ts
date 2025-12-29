import type { BaseClient } from '../client.js'
import type {
  SiteSettings,
  NavigationMenu,
  Author,
  ListMenusOptions,
  ListMenusResponse,
  ListAuthorsResponse,
} from '../types.js'

/**
 * Site configuration resource (read-only).
 * Ideal for static site generation.
 */
export class Site {
  constructor(private readonly client: BaseClient) {}

  /**
   * Gets site settings (branding, contact info, social links).
   */
  async getSettings(): Promise<SiteSettings> {
    return this.client.request<SiteSettings>('GET', '/site/settings')
  }

  /**
   * Lists navigation menus.
   *
   * @param options - Filter by location (header, footer, sidebar)
   */
  async listMenus(options?: ListMenusOptions): Promise<ListMenusResponse> {
    const params = new URLSearchParams()
    if (options?.location) params.set('location', options.location)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.client.request<ListMenusResponse>('GET', `/site/menus${query}`)
  }

  /**
   * Gets a menu by slug.
   */
  async getMenu(slug: string): Promise<NavigationMenu> {
    return this.client.request<NavigationMenu>(
      'GET',
      `/site/menus/${encodeURIComponent(slug)}`
    )
  }

  /**
   * Lists all authors.
   */
  async listAuthors(): Promise<ListAuthorsResponse> {
    return this.client.request<ListAuthorsResponse>('GET', '/site/authors')
  }

  /**
   * Gets an author by ID.
   */
  async getAuthor(id: string): Promise<Author> {
    return this.client.request<Author>(
      'GET',
      `/site/authors/${encodeURIComponent(id)}`
    )
  }
}
