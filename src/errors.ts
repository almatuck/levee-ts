/**
 * Base error class for all Levee SDK errors.
 */
export class LeveeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LeveeError'
    Object.setPrototypeOf(this, LeveeError.prototype)
  }
}

/**
 * Error thrown when the API returns an error response.
 */
export class APIError extends LeveeError {
  readonly status: number
  readonly headers: Headers
  readonly requestId?: string

  constructor(
    message: string,
    status: number,
    headers: Headers,
    requestId?: string
  ) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.headers = headers
    this.requestId = requestId
    Object.setPrototypeOf(this, APIError.prototype)
  }
}

/**
 * Error thrown when the request is malformed (HTTP 400).
 */
export class BadRequestError extends APIError {
  constructor(message: string, headers: Headers, requestId?: string) {
    super(message, 400, headers, requestId)
    this.name = 'BadRequestError'
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

/**
 * Error thrown when authentication fails (HTTP 401).
 */
export class AuthenticationError extends APIError {
  constructor(message: string, headers: Headers, requestId?: string) {
    super(message, 401, headers, requestId)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Error thrown when access is forbidden (HTTP 403).
 */
export class PermissionError extends APIError {
  constructor(message: string, headers: Headers, requestId?: string) {
    super(message, 403, headers, requestId)
    this.name = 'PermissionError'
    Object.setPrototypeOf(this, PermissionError.prototype)
  }
}

/**
 * Error thrown when a resource is not found (HTTP 404).
 */
export class NotFoundError extends APIError {
  constructor(message: string, headers: Headers, requestId?: string) {
    super(message, 404, headers, requestId)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Error thrown when rate limit is exceeded (HTTP 429).
 */
export class RateLimitError extends APIError {
  readonly retryAfter?: number

  constructor(
    message: string,
    headers: Headers,
    requestId?: string,
    retryAfter?: number
  ) {
    super(message, 429, headers, requestId)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Error thrown when the server encounters an error (HTTP 500+).
 */
export class InternalServerError extends APIError {
  constructor(
    message: string,
    status: number,
    headers: Headers,
    requestId?: string
  ) {
    super(message, status, headers, requestId)
    this.name = 'InternalServerError'
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

/**
 * Creates the appropriate error class based on HTTP status code.
 */
export function createAPIError(
  message: string,
  status: number,
  headers: Headers,
  requestId?: string
): APIError {
  const retryAfter = headers.get('retry-after')
  const retryAfterMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined

  switch (status) {
    case 400:
      return new BadRequestError(message, headers, requestId)
    case 401:
      return new AuthenticationError(message, headers, requestId)
    case 403:
      return new PermissionError(message, headers, requestId)
    case 404:
      return new NotFoundError(message, headers, requestId)
    case 429:
      return new RateLimitError(message, headers, requestId, retryAfterMs)
    default:
      if (status >= 500) {
        return new InternalServerError(message, status, headers, requestId)
      }
      return new APIError(message, status, headers, requestId)
  }
}
