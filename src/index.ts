// Main client
export { Levee, type ClientOptions, type BaseClient } from './client.js'

// LLM streaming client
export { LLMClient, type LLMClientOptions } from './streaming/llm.js'

// WebSocket handler for LLM chat
export {
  createWebSocketHandler,
  WebSocketHandler,
  WSMessageType,
  type WSMessage,
  type WSStartRequest,
  type WSUserMessage,
  type WSAbortRequest,
  type WSToolResult,
  type WSStartedResponse,
  type WSChunkResponse,
  type WSToolCallResponse,
  type WSCompletionResponse,
  type WSErrorResponse,
  type WSHandlerOptions,
  type WebSocketLike,
} from './streaming/ws.js'

// Error classes
export {
  LeveeError,
  APIError,
  BadRequestError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
  createAPIError,
} from './errors.js'

// Types
export type {
  // Contacts
  ContactInput,
  ContactResponse,
  ContactInfo,
  UpdateContactInput,
  ContactActivity,

  // Emails
  SendEmailInput,
  SendEmailResponse,
  EmailStatus,
  EmailEvent,

  // Sequences
  EnrollSequenceInput,
  EnrollSequenceResponse,
  SequenceEnrollment,

  // Billing
  CustomerInput,
  CustomerResponse,
  CheckoutItem,
  CheckoutInput,
  CheckoutResponse,
  SubscriptionInput,
  SubscriptionResponse,
  UsageInput,
  PortalInput,
  PortalResponse,

  // Customers (billing history)
  CustomerInfo,
  Invoice,
  OrderItem,
  CustomerOrder,
  Subscription,
  Payment,

  // Webhooks
  WebhookEvent,
  RegisterWebhookInput,
  RegisterWebhookResponse,
  Webhook,
  UpdateWebhookInput,
  TestWebhookResponse,
  WebhookLog,

  // Stats
  StatsOptions,
  StatsOverview,
  EmailStatsPoint,
  EmailStats,
  RevenueStatsPoint,
  RevenueStats,
  ContactStatsPoint,
  ContactStats,

  // Content (CMS)
  ContentPost,
  ContentPage,
  ContentCategory,
  ListPostsOptions,
  ListPostsResponse,
  ListPagesOptions,
  ListPagesResponse,
  ListCategoriesResponse,

  // Site
  SiteSettings,
  NavigationItem,
  NavigationMenu,
  ListMenusOptions,
  ListMenusResponse,
  Author,
  ListAuthorsResponse,

  // Orders
  OrderInput,
  OrderResponse,

  // Tracking
  TrackEventInput,

  // LLM
  ChatRole,
  ChatMessage,
  ChatModel,
  ChatInput,
  ChatResponse,
  StreamChunk,
} from './types.js'

// Webhook event constants
export { WebhookEvents } from './types.js'
