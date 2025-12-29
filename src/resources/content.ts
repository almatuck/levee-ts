import type { BaseClient } from '../client.js'
import type {
  ContentPost,
  ContentPage,
  ListPostsOptions,
  ListPostsResponse,
  ListPagesOptions,
  ListPagesResponse,
  ListCategoriesResponse,
} from '../types.js'

/**
 * CMS content resource (read-only).
 * Ideal for static site generation.
 */
export class Content {
  constructor(private readonly client: BaseClient) {}

  /**
   * Lists published posts with pagination.
   */
  async listPosts(options?: ListPostsOptions): Promise<ListPostsResponse> {
    const params = new URLSearchParams()
    if (options?.page) params.set('page', String(options.page))
    if (options?.pageSize) params.set('page_size', String(options.pageSize))
    if (options?.categorySlug) params.set('category', options.categorySlug)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.client.request<ListPostsResponse>('GET', `/content/posts${query}`)
  }

  /**
   * Gets a post by slug.
   */
  async getPost(slug: string): Promise<ContentPost> {
    return this.client.request<ContentPost>(
      'GET',
      `/content/posts/${encodeURIComponent(slug)}`
    )
  }

  /**
   * Lists published pages with pagination.
   */
  async listPages(options?: ListPagesOptions): Promise<ListPagesResponse> {
    const params = new URLSearchParams()
    if (options?.page) params.set('page', String(options.page))
    if (options?.pageSize) params.set('page_size', String(options.pageSize))
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.client.request<ListPagesResponse>('GET', `/content/pages${query}`)
  }

  /**
   * Gets a page by slug.
   */
  async getPage(slug: string): Promise<ContentPage> {
    return this.client.request<ContentPage>(
      'GET',
      `/content/pages/${encodeURIComponent(slug)}`
    )
  }

  /**
   * Lists all content categories.
   */
  async listCategories(): Promise<ListCategoriesResponse> {
    return this.client.request<ListCategoriesResponse>('GET', '/content/categories')
  }
}
