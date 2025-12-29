import { describe, it, expect } from 'vitest'
import { Levee, LeveeError, APIError, AuthenticationError, NotFoundError } from '../src'

describe('Levee Client', () => {
  it('should create client with API key', () => {
    const client = new Levee('test_api_key')
    expect(client).toBeDefined()
    expect(client.contacts).toBeDefined()
    expect(client.emails).toBeDefined()
    expect(client.billing).toBeDefined()
    expect(client.content).toBeDefined()
    expect(client.site).toBeDefined()
  })

  it('should create client with custom options', () => {
    const client = new Levee('test_api_key', {
      baseURL: 'https://custom.levee.ai',
      timeout: 60000,
    })
    expect(client).toBeDefined()
  })

  it('should expose resource namespaces', () => {
    const client = new Levee('test_api_key')

    // All resource namespaces should be defined
    expect(client.contacts).toBeDefined()
    expect(client.emails).toBeDefined()
    expect(client.sequences).toBeDefined()
    expect(client.billing).toBeDefined()
    expect(client.customers).toBeDefined()
    expect(client.webhooks).toBeDefined()
    expect(client.stats).toBeDefined()
    expect(client.content).toBeDefined()
    expect(client.site).toBeDefined()
    expect(client.lists).toBeDefined()
    expect(client.orders).toBeDefined()
    expect(client.tracking).toBeDefined()
  })
})

describe('Error Classes', () => {
  it('should have proper error hierarchy', () => {
    const leveeError = new LeveeError('test error')
    expect(leveeError).toBeInstanceOf(Error)
    expect(leveeError.message).toBe('test error')
  })

  it('should create APIError with status', () => {
    const apiError = new APIError('API error', 500, new Headers())
    expect(apiError).toBeInstanceOf(LeveeError)
    expect(apiError.status).toBe(500)
  })

  it('should have typed error subclasses', () => {
    const authError = new AuthenticationError('Unauthorized', new Headers())
    expect(authError).toBeInstanceOf(APIError)
    expect(authError.status).toBe(401)

    const notFoundError = new NotFoundError('Not found', new Headers())
    expect(notFoundError).toBeInstanceOf(APIError)
    expect(notFoundError.status).toBe(404)
  })
})
