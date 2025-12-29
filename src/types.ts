// ============================================================================
// Contacts
// ============================================================================

export interface ContactInput {
  email: string
  name?: string
  phone?: string
  company?: string
  employees?: string
  message?: string
  source?: string
  tags?: string[]
  funnelSlug?: string
  listSlug?: string
  score?: boolean
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  meta?: Record<string, string>
}

export interface ContactResponse {
  id: string
  email: string
  name: string
}

export interface ContactInfo {
  id: string
  email: string
  name: string
  phone?: string
  company?: string
  status: string
  emailVerified: boolean
  tags: string[]
  lists: string[]
  customFields?: Record<string, string>
  leadScore?: number
  source?: string
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  lastEmailAt?: string
  lastOpenAt?: string
  lastClickAt?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateContactInput {
  name?: string
  phone?: string
  company?: string
  customFields?: Record<string, string>
}

export interface ContactActivity {
  event: string
  timestamp: string
  details?: string
}

// ============================================================================
// Emails
// ============================================================================

export interface SendEmailInput {
  to: string
  templateSlug?: string
  subject?: string
  body?: string
  textBody?: string
  fromName?: string
  fromEmail?: string
  replyTo?: string
  variables?: Record<string, string>
  tags?: string[]
  meta?: Record<string, string>
}

export interface SendEmailResponse {
  success: boolean
  messageId: string
  status: string
  message?: string
}

export interface EmailStatus {
  messageId: string
  to: string
  subject: string
  status: string
  sentAt?: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  bouncedAt?: string
  bounceType?: string
  opens: number
  clicks: number
}

export interface EmailEvent {
  event: string
  timestamp: string
  data?: string
}

// ============================================================================
// Sequences
// ============================================================================

export interface EnrollSequenceInput {
  sequenceSlug: string
  email: string
  variables?: Record<string, string>
  startAtStep?: number
  scheduledFor?: string
}

export interface EnrollSequenceResponse {
  success: boolean
  enrollmentId: string
  status: string
  message?: string
}

export interface SequenceEnrollment {
  enrollmentId: string
  sequenceSlug: string
  sequenceName: string
  status: string
  currentStep: number
  totalSteps: number
  enrolledAt: string
  nextEmailAt?: string
  completedAt?: string
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
}

// ============================================================================
// Billing
// ============================================================================

export interface CustomerInput {
  email: string
  name?: string
  phone?: string
  meta?: Record<string, string>
}

export interface CustomerResponse {
  id: string
  stripeCustomerId: string
  email: string
  name: string
}

export interface CheckoutItem {
  priceId: string
  quantity: number
}

export interface CheckoutInput {
  customerEmail: string
  lineItems: CheckoutItem[]
  mode: 'payment' | 'subscription'
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResponse {
  sessionId: string
  checkoutUrl: string
}

export interface SubscriptionInput {
  customerId: string
  priceIds: string[]
}

export interface SubscriptionResponse {
  id: string
  stripeSubscriptionId: string
  status: string
}

export interface UsageInput {
  subscriptionItemId: string
  quantity: number
}

export interface PortalInput {
  customerId: string
  returnUrl: string
}

export interface PortalResponse {
  portalUrl: string
}

// ============================================================================
// Customers (Read-Only Billing History)
// ============================================================================

export interface CustomerInfo {
  id: string
  email: string
  name: string
  phone?: string
  stripeCustomerId?: string
  status: string
  /** Total amount spent in cents */
  totalSpent: number
  orderCount: number
  subscriptionCount: number
  createdAt: string
}

export interface Invoice {
  id: string
  stripeInvoiceId?: string
  number: string
  status: string
  /** Amount due in cents */
  amountDue: number
  /** Amount paid in cents */
  amountPaid: number
  currency: string
  description?: string
  invoicePdfUrl?: string
  hostedUrl?: string
  dueDate?: string
  paidAt?: string
  createdAt: string
}

export interface OrderItem {
  productName: string
  quantity: number
  /** Unit price in cents */
  unitPrice: number
  /** Total price in cents */
  totalPrice: number
}

export interface CustomerOrder {
  id: string
  orderNumber: string
  status: string
  /** Total amount in cents */
  totalCents: number
  currency: string
  items: OrderItem[]
  paymentMethod?: string
  paidAt?: string
  fulfilledAt?: string
  createdAt: string
}

export interface Subscription {
  id: string
  stripeSubscriptionId?: string
  productName: string
  priceName?: string
  status: string
  /** Amount in cents */
  amountCents: number
  currency: string
  interval: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  createdAt: string
}

export interface Payment {
  id: string
  stripePaymentId?: string
  /** Amount in cents */
  amountCents: number
  currency: string
  status: string
  description?: string
  paymentMethod?: string
  receiptUrl?: string
  refundedAt?: string
  createdAt: string
}

// ============================================================================
// Webhooks
// ============================================================================

export const WebhookEvents = {
  // Contact events
  ContactCreated: 'contact.created',
  ContactUpdated: 'contact.updated',
  ContactUnsubscribed: 'contact.unsubscribed',
  ContactBounced: 'contact.bounced',

  // Email events
  EmailSent: 'email.sent',
  EmailDelivered: 'email.delivered',
  EmailOpened: 'email.opened',
  EmailClicked: 'email.clicked',
  EmailBounced: 'email.bounced',
  EmailComplained: 'email.complained',

  // Sequence events
  SequenceEnrolled: 'sequence.enrolled',
  SequenceCompleted: 'sequence.completed',
  SequencePaused: 'sequence.paused',
  SequenceResumed: 'sequence.resumed',

  // Payment events
  PaymentSucceeded: 'payment.succeeded',
  PaymentFailed: 'payment.failed',
  PaymentRefunded: 'payment.refunded',

  // Subscription events
  SubscriptionCreated: 'subscription.created',
  SubscriptionUpdated: 'subscription.updated',
  SubscriptionCancelled: 'subscription.cancelled',
  SubscriptionRenewed: 'subscription.renewed',

  // Order events
  OrderCreated: 'order.created',
  OrderCompleted: 'order.completed',
  OrderRefunded: 'order.refunded',
} as const

export type WebhookEvent = (typeof WebhookEvents)[keyof typeof WebhookEvents]

export interface RegisterWebhookInput {
  url: string
  events: WebhookEvent[]
  secret?: string
  active?: boolean
}

export interface RegisterWebhookResponse {
  success: boolean
  webhookId: string
  secret: string
  message?: string
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  createdAt: string
  deliveriesTotal: number
  deliveriesSuccess: number
  deliveriesFailed: number
  lastDeliveryAt?: string
  lastStatus?: number
}

export interface UpdateWebhookInput {
  url?: string
  events?: WebhookEvent[]
  active?: boolean
}

export interface TestWebhookResponse {
  success: boolean
  statusCode: number
  response?: string
  error?: string
}

export interface WebhookLog {
  id: string
  event: string
  payload: string
  statusCode: number
  response?: string
  error?: string
  durationMs: number
  deliveredAt: string
}

// ============================================================================
// Stats
// ============================================================================

export interface StatsOptions {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}

export interface StatsOverview {
  totalContacts: number
  newContacts: number
  activeContacts: number
  emailsSent: number
  emailsDelivered: number
  emailsOpened: number
  emailsClicked: number
  emailsBounced: number
  openRate: number
  clickRate: number
  bounceRate: number
  /** Total revenue in cents */
  totalRevenue: number
  orderCount: number
  /** Average order value in cents */
  avgOrderValue: number
  newSubscriptions: number
}

export interface EmailStatsPoint {
  date: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  openRate: number
  clickRate: number
}

export interface EmailStats {
  stats: EmailStatsPoint[]
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  avgOpenRate: number
  avgClickRate: number
}

export interface RevenueStatsPoint {
  date: string
  /** Revenue in cents */
  revenue: number
  orderCount: number
  newSubscriptions: number
  churned: number
}

export interface RevenueStats {
  stats: RevenueStatsPoint[]
  /** Total revenue in cents */
  totalRevenue: number
  totalOrders: number
  totalSubscriptions: number
  totalChurned: number
  /** Monthly recurring revenue in cents */
  mrr: number
}

export interface ContactStatsPoint {
  date: string
  newContacts: number
  unsubscribed: number
  bounced: number
  netGrowth: number
}

export interface ContactStats {
  stats: ContactStatsPoint[]
  totalActive: number
  totalUnsubscribed: number
  totalBounced: number
  netGrowth: number
}

// ============================================================================
// Content (CMS)
// ============================================================================

export interface ContentPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: string
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
  categoryName?: string
  categorySlug?: string
  authorId?: string
  createdAt: string
  publishedAt?: string
}

export interface ContentPage {
  id: string
  title: string
  slug: string
  content: string
  status: string
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
  templateName?: string
  templateSlug?: string
  createdAt: string
  publishedAt?: string
}

export interface ContentCategory {
  id: string
  name: string
  slug: string
  description?: string
}

export interface ListPostsOptions {
  page?: number
  pageSize?: number
  categorySlug?: string
}

export interface ListPostsResponse {
  posts: ContentPost[]
  total: number
}

export interface ListPagesOptions {
  page?: number
  pageSize?: number
}

export interface ListPagesResponse {
  pages: ContentPage[]
  total: number
}

export interface ListCategoriesResponse {
  categories: ContentCategory[]
}

// ============================================================================
// Site Configuration
// ============================================================================

export interface SiteSettings {
  siteName?: string
  tagline?: string
  logoUrl?: string
  faviconUrl?: string
  contactEmail?: string
  contactPhone?: string
  socialLinks?: Record<string, string>
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  ogImageUrl?: string
}

export interface NavigationItem {
  id: string
  label: string
  url?: string
  target?: string
  icon?: string
  isActive: boolean
  children?: NavigationItem[]
}

export interface NavigationMenu {
  id: string
  name: string
  slug: string
  location: string
  items: NavigationItem[]
}

export interface ListMenusOptions {
  location?: string
}

export interface ListMenusResponse {
  menus: NavigationMenu[]
}

export interface Author {
  id: string
  displayName: string
  bio?: string
  avatarUrl?: string
  websiteUrl?: string
  twitterHandle?: string
  linkedinUrl?: string
  githubHandle?: string
}

export interface ListAuthorsResponse {
  authors: Author[]
}

// ============================================================================
// Orders
// ============================================================================

export interface OrderInput {
  email: string
  name?: string
  company?: string
  productSlug?: string
  funnelStepSlug?: string
  workshopId?: number
  includeBump?: boolean
  amountCents?: number
  currency?: string
  successUrl?: string
  cancelUrl?: string
  meta?: Record<string, string>
}

export interface OrderResponse {
  success: boolean
  checkoutUrl?: string
  sessionId?: string
  message?: string
}

// ============================================================================
// Tracking
// ============================================================================

export interface TrackEventInput {
  event: string
  email?: string
  properties?: Record<string, string>
}

// ============================================================================
// LLM / AI Chat
// ============================================================================

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export type ChatModel = 'haiku' | 'sonnet' | 'opus'

export interface ChatInput {
  messages: ChatMessage[]
  systemPrompt?: string
  model?: ChatModel
  maxTokens?: number
  temperature?: number
}

export interface ChatResponse {
  content: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
  latencyMs?: number
  stopReason?: string
}

export interface StreamChunk {
  content: string
  index: number
}

// ============================================================================
// Internal Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean
  message?: string
  data?: T
}
