import { describe, it, expect } from 'vitest'
import { Levee } from '../src'

const TEST_BASE_URL = 'https://api.levee.test'

describe('Levee Client', () => {
  it('should create client with API key and baseURL', () => {
    const client = new Levee('test_api_key', TEST_BASE_URL)
    expect(client).toBeDefined()
    expect(client.contacts).toBeDefined()
    expect(client.emails).toBeDefined()
    expect(client.billing).toBeDefined()
    expect(client.content).toBeDefined()
    expect(client.site).toBeDefined()
  })

  it('should create client with custom options', () => {
    const client = new Levee('test_api_key', TEST_BASE_URL, {
      timeout: 60000,
    })
    expect(client).toBeDefined()
  })

  it('should expose resource namespaces', () => {
    const client = new Levee('test_api_key', TEST_BASE_URL)

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

  it('should throw if API key is missing', () => {
    expect(() => new Levee('', TEST_BASE_URL)).toThrow('API key is required')
  })

  it('should throw if baseURL is missing', () => {
    expect(() => new Levee('test_api_key', '')).toThrow('Base URL is required')
  })
})
