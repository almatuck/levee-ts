# Levee SDK for TypeScript

Official TypeScript SDK for integrating [Levee](https://levee.com) into your TypeScript/JavaScript applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [LLM/AI Chat](#llmai-chat)
- [Content/CMS](#contentcms)
- [Site Configuration](#site-configuration)
- [Contacts](#contacts)
- [Email Lists](#email-lists)
- [Transactional Emails](#transactional-emails)
- [Email Sequences](#email-sequences)
- [Orders & Checkout](#orders--checkout)
- [Customer Billing History](#customer-billing-history)
- [Custom Event Tracking](#custom-event-tracking)
- [Products](#products)
- [Events](#events)
- [Funnels](#funnels)
- [Offers](#offers)
- [Quizzes](#quizzes)
- [Workshops](#workshops)
- [Billing](#billing)
- [Webhooks](#webhooks)
- [Stats & Analytics](#stats--analytics)
- [Error Handling](#error-handling)
- [Complete Example](#complete-example)
- [API Reference](#api-reference)

## Installation

```bash
npm install @levee/sdk
# or
pnpm add @levee/sdk
# or
bun add @levee/sdk
```

## Quick Start

```typescript
import { Levee } from '@levee/sdk'

// Initialize the client with your API key
const levee = new Levee(process.env.LEVEE_API_KEY!)

// Create a contact
const contact = await levee.contacts.create({
  email: 'user@example.com',
  name: 'John Doe',
})

console.log('Contact created:', contact.id)
```

## Auto-Generated Code

The following files in `src/` are auto-generated from the Levee API definition and should not be edited manually:

- **`types.ts`** - All TypeScript interfaces and types
- **`client.ts`** - The main Levee client class with all resource methods

To regenerate these files when the API changes, run `make gen-sdk` from the main Levee backend directory.

---

## Configuration

### Basic Configuration

```typescript
// Default configuration - connects to https://levee.com/sdk/v1
const levee = new Levee('lv_your_api_key')
```

### Custom Base URL

For self-hosted instances or development environments:

```typescript
const levee = new Levee('lv_your_api_key', {
  baseURL: 'https://your-domain.com/sdk/v1',
})
```

### Custom Timeout

For longer-running requests:

```typescript
const levee = new Levee('lv_your_api_key', {
  timeout: 60000, // 60 seconds (default: 30s)
})
```

### Custom Fetch

For custom HTTP handling or testing:

```typescript
const levee = new Levee('lv_your_api_key', {
  fetch: customFetchImplementation,
})
```

---

## Authentication

The SDK provides customer authentication endpoints for building login/signup flows in your application. These endpoints are for your end-users (customers), not for SDK API access.

### Register a Customer

```typescript
const result = await levee.auth.register({
  orgSlug: 'your-org',
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe', // optional
})

console.log('Token:', result.token)
console.log('Refresh Token:', result.refreshToken)
console.log('Expires At:', result.expiresAt)
console.log('Customer:', result.customer)
// Customer includes: id, email, name, emailVerified, createdAt
```

### Login

```typescript
const result = await levee.auth.login({
  orgSlug: 'your-org',
  email: 'user@example.com',
  password: 'securePassword123',
})

console.log('Token:', result.token)
console.log('Customer:', result.customer.email)
```

### Refresh Token

```typescript
const result = await levee.auth.refreshToken({
  refreshToken: 'current_refresh_token',
})

console.log('New Token:', result.token)
console.log('New Refresh Token:', result.refreshToken)
```

### Forgot Password

Initiates a password reset flow by sending a reset email to the customer.

```typescript
await levee.auth.forgotPassword({
  orgSlug: 'your-org',
  email: 'user@example.com',
})
// Email with reset link will be sent
```

### Reset Password

Completes the password reset using the token from the email.

```typescript
await levee.auth.resetPassword({
  token: 'reset_token_from_email',
  password: 'newSecurePassword123',
  confirmPassword: 'newSecurePassword123',
})
```

### Verify Email

Verifies a customer's email address using the token from the verification email.

```typescript
await levee.auth.verifyEmail({
  token: 'verification_token_from_email',
})
```

### Change Password

Change password while logged in (requires current password).

```typescript
const result = await levee.auth.changePassword({
  orgSlug: 'your-org',
  email: 'user@example.com',
  currentPassword: 'currentPassword123',
  newPassword: 'newSecurePassword456',
})

if (result.success) {
  console.log('Password changed successfully')
} else {
  console.log('Error:', result.message)
}
```

---

## LLM/AI Chat

The SDK provides access to Levee's LLM gateway for AI-powered chat capabilities. Supports both simple request/response and streaming via gRPC.

### Simple Chat (Non-Streaming)

```typescript
const response = await levee.llm.chat({
  messages: [
    { role: 'user', content: 'What is the capital of France?' },
  ],
  model: 'sonnet', // 'haiku', 'sonnet', or 'opus'
  maxTokens: 1024,
  temperature: 0.7,
})

console.log('Response:', response.content)
console.log(`Tokens: ${response.inputTokens} in, ${response.outputTokens} out`)
console.log(`Cost: $${response.costUsd?.toFixed(4)}`)
```

### Streaming Chat (gRPC)

For streaming responses, use the separate `LLMClient`:

```typescript
import { LLMClient } from '@levee/sdk'

const llm = new LLMClient('lv_your_api_key', {
  grpcAddress: 'llm.levee.com:9889', // optional, this is the default
})

// Stream with async iterator
for await (const chunk of llm.chatStream({
  messages: [{ role: 'user', content: 'Tell me a story' }],
  systemPrompt: 'You are a helpful assistant.',
  model: 'sonnet',
  maxTokens: 2048,
})) {
  process.stdout.write(chunk.content) // Print each token as it arrives
}

// Don't forget to close when done
llm.close()
```

### Convenience Streaming Method

```typescript
const response = await llm.chatStreamCallback(
  {
    messages: [{ role: 'user', content: 'Explain quantum computing' }],
    model: 'haiku',
    maxTokens: 1024,
  },
  (chunk) => {
    process.stdout.write(chunk.content)
  }
)

console.log(`\nTotal tokens: ${response.outputTokens}`)
```

---

## Content/CMS

Access published content for your static site or application. Perfect for static site generation (SSG).

### List Posts

```typescript
const posts = await levee.content.listPosts({
  page: 1,
  pageSize: 10,
  categorySlug: 'tutorials', // Optional: filter by category
})

for (const post of posts.posts) {
  console.log(`${post.slug}: ${post.title}`)
}
console.log(`Total posts: ${posts.total}`)
```

### Get a Post

```typescript
const post = await levee.content.getPost('getting-started-guide')

console.log('Title:', post.title)
console.log('Content:', post.content)
console.log('Category:', post.categoryName)
console.log('Published:', post.publishedAt)
```

### List Pages

```typescript
const pages = await levee.content.listPages({
  page: 1,
  pageSize: 20,
})

for (const page of pages.pages) {
  console.log(`${page.slug}: ${page.title} (template: ${page.templateName})`)
}
```

### Get a Page

```typescript
const page = await levee.content.getPage('about-us')

console.log('Title:', page.title)
console.log('Content:', page.content)
console.log('Meta Title:', page.metaTitle)
```

### List Categories

```typescript
const categories = await levee.content.listCategories()

for (const cat of categories.categories) {
  console.log(`${cat.slug}: ${cat.name}`)
}
```

---

## Site Configuration

Access site settings, navigation menus, and author information for building your frontend.

### Get Site Settings

```typescript
const settings = await levee.site.getSettings()

console.log(`Site: ${settings.siteName} - ${settings.tagline}`)
console.log('Logo:', settings.logoUrl)
console.log('Contact:', settings.contactEmail)
console.log('Social:', settings.socialLinks) // Record<string, string>
console.log('Default Meta:', settings.defaultMetaTitle)
```

### List Navigation Menus

```typescript
// Get all menus
const menus = await levee.site.listMenus()

// Filter by location (header, footer, sidebar)
const headerMenus = await levee.site.listMenus({ location: 'header' })

for (const menu of menus.menus) {
  console.log(`Menu: ${menu.name} (${menu.location})`)
  for (const item of menu.items) {
    console.log(`  - ${item.label}: ${item.url}`)
    for (const child of item.children ?? []) {
      console.log(`    - ${child.label}: ${child.url}`)
    }
  }
}
```

### Get a Menu by Slug

```typescript
const menu = await levee.site.getMenu('main-nav')

for (const item of menu.items) {
  console.log(`${item.label} -> ${item.url}`)
}
```

### List Authors

```typescript
const authors = await levee.site.listAuthors()

for (const author of authors.authors) {
  console.log(`${author.displayName}: ${author.bio}`)
}
```

### Get Author by ID

```typescript
const author = await levee.site.getAuthor('author-123')

console.log('Name:', author.displayName)
console.log('Bio:', author.bio)
console.log('Avatar:', author.avatarUrl)
console.log('Twitter:', `@${author.twitterHandle}`)
```

---

## Contacts

Contacts are the core of Levee. Create and manage contacts when users sign up, submit forms, or interact with your application.

### Create a Contact

```typescript
const contact = await levee.contacts.create({
  email: 'user@example.com',
  name: 'John Doe',
})
```

### Get a Contact

```typescript
// Get by ID or email
const contact = await levee.contacts.get('user@example.com')

console.log(`Contact: ${contact.name}, Status: ${contact.status}, Tags: ${contact.tags}`)
console.log(`Emails sent: ${contact.emailsSent}, opened: ${contact.emailsOpened}, clicked: ${contact.emailsClicked}`)
```

### Update a Contact

```typescript
const contact = await levee.contacts.update('user@example.com', {
  name: 'John Smith',
  phone: '+1-555-123-4567',
  company: 'Acme Inc',
  customFields: {
    plan: 'enterprise',
  },
})
```

### Manage Contact Tags

```typescript
// Add tags
await levee.contacts.addTags('user@example.com', ['vip', 'enterprise'])

// Remove tags
await levee.contacts.removeTags('user@example.com', ['trial'])
```

### View Contact Activity

```typescript
const activities = await levee.contacts.listActivity('user@example.com', 50)

for (const activity of activities) {
  console.log(`${activity.timestamp}: ${activity.event} - ${activity.details}`)
}
```

### Global Unsubscribe

```typescript
// Unsubscribe from all communications
await levee.contacts.globalUnsubscribe('user@example.com', 'User requested to stop all emails')
```

---

## Email Lists

Manage email list subscriptions for newsletters, updates, and marketing.

### Subscribe to a List

```typescript
await levee.lists.subscribe('newsletter', 'user@example.com', 'John Doe')
```

### Unsubscribe from a List

```typescript
await levee.lists.unsubscribe('newsletter', 'user@example.com')
```

---

## Transactional Emails

Send transactional emails for receipts, notifications, password resets, and more.

### Send an Email

```typescript
// Using a template
const result = await levee.emails.send({
  to: 'user@example.com',
  templateSlug: 'welcome-email',
  variables: {
    name: 'John',
    loginUrl: 'https://app.example.com/login',
  },
})

// Custom email
const result = await levee.emails.send({
  to: 'user@example.com',
  subject: 'Your order has shipped!',
  body: '<h1>Order Shipped</h1><p>Your order #12345 is on its way.</p>',
  textBody: 'Order Shipped\n\nYour order #12345 is on its way.',
  fromName: 'Acme Store',
  tags: ['shipping', 'order-12345'],
})

console.log(`Email sent, message ID: ${result.messageId}, status: ${result.status}`)
```

### Check Email Status

```typescript
const status = await levee.emails.getStatus(messageId)

console.log(`Email to ${status.to}: ${status.status}`)
console.log(`Sent: ${status.sentAt}, Delivered: ${status.deliveredAt}, Opened: ${status.openedAt}`)
console.log(`Opens: ${status.opens}, Clicks: ${status.clicks}`)
```

### Get Email Events

```typescript
const events = await levee.emails.listEvents(messageId)

for (const event of events) {
  console.log(`${event.timestamp}: ${event.event} ${event.data ?? ''}`)
}
// Output:
// 2024-01-15T10:00:00Z: sent
// 2024-01-15T10:00:02Z: delivered
// 2024-01-15T10:15:30Z: opened
// 2024-01-15T10:16:45Z: clicked https://example.com/link
```

---

## Email Sequences

Enroll contacts in automated email sequences for onboarding, nurturing, and drip campaigns.

### Enroll in a Sequence

```typescript
const result = await levee.sequences.enroll({
  sequenceSlug: 'onboarding',
  email: 'user@example.com',
  variables: {
    firstName: 'John',
    plan: 'Pro',
  },
})

console.log(`Enrollment ID: ${result.enrollmentId}, Status: ${result.status}`)
```

### Get Sequence Enrollments

```typescript
// Get all enrollments for an email
const enrollments = await levee.sequences.getEnrollments('user@example.com')

// Get specific sequence enrollment
const enrollments = await levee.sequences.getEnrollments('user@example.com', 'onboarding')

for (const e of enrollments) {
  console.log(`Sequence: ${e.sequenceName}, Step ${e.currentStep}/${e.totalSteps}, Status: ${e.status}`)
  console.log(`Next email at: ${e.nextEmailAt}`)
}
```

### Unenroll from Sequences

```typescript
// Unenroll from specific sequence
await levee.sequences.unenroll('user@example.com', 'onboarding')

// Unenroll from all sequences
await levee.sequences.unenroll('user@example.com')
```

### Pause and Resume

```typescript
// Pause enrollment
await levee.sequences.pause('user@example.com', 'onboarding')

// Resume enrollment
await levee.sequences.resume('user@example.com', 'onboarding')
```

---

## Orders & Checkout

Create checkout sessions for products, courses, or any purchasable items.

### Create an Order

```typescript
const order = await levee.orders.create({
  email: 'user@example.com',
  productSlug: 'pro-plan',
  successUrl: 'https://yourapp.com/success',
  cancelUrl: 'https://yourapp.com/cancel',
})

// Redirect user to checkout
// In Express: res.redirect(order.checkoutUrl)
// In Next.js: redirect(order.checkoutUrl)
```

---

## Customer Billing History

Access customer billing data including invoices, orders, subscriptions, and payments. Perfect for building customer account pages.

### Get Customer Info

```typescript
const customer = await levee.customers.getByEmail('user@example.com')

console.log('Customer:', customer.name)
console.log(`Total spent: $${(customer.totalSpent / 100).toFixed(2)}`)
console.log(`Orders: ${customer.orderCount}, Subscriptions: ${customer.subscriptionCount}`)
```

### List Invoices

```typescript
const invoices = await levee.customers.listInvoices('user@example.com', 10)

for (const inv of invoices) {
  console.log(`Invoice #${inv.number}: $${(inv.amountPaid / 100).toFixed(2)} ${inv.status}`)
  if (inv.invoicePdfUrl) {
    console.log(`  PDF: ${inv.invoicePdfUrl}`)
  }
}
```

### List Orders

```typescript
const orders = await levee.customers.listOrders('user@example.com', 10)

for (const order of orders) {
  console.log(`Order ${order.orderNumber}: $${(order.totalCents / 100).toFixed(2)} ${order.status}`)
  for (const item of order.items) {
    console.log(`  - ${item.productName} x${item.quantity}: $${(item.totalPrice / 100).toFixed(2)}`)
  }
}
```

### List Subscriptions

```typescript
const subs = await levee.customers.listSubscriptions('user@example.com')

for (const sub of subs) {
  console.log(`Subscription: ${sub.productName} - ${sub.status} ($${(sub.amountCents / 100).toFixed(2)}/${sub.interval})`)
  console.log(`  Current period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}`)
}
```

### List Payments

```typescript
const payments = await levee.customers.listPayments('user@example.com', 20)

for (const p of payments) {
  console.log(`Payment: $${(p.amountCents / 100).toFixed(2)} ${p.status} via ${p.paymentMethod}`)
  if (p.receiptUrl) {
    console.log(`  Receipt: ${p.receiptUrl}`)
  }
}
```

### Update Customer

Update customer profile information.

```typescript
const customer = await levee.customers.updateCustomer('customer-123', {
  name: 'John Smith',
  phone: '+1-555-123-4567',
  avatarUrl: 'https://example.com/avatar.jpg',
  status: 'active',
  metadata: JSON.stringify({ tier: 'premium' }),
})

console.log('Updated customer:', customer.name)
```

### Delete Customer

Permanently delete a customer (GDPR compliance, hard delete).

```typescript
const result = await levee.customers.deleteCustomer('customer-123')

if (result.success) {
  console.log('Customer deleted successfully')
} else {
  console.log('Error:', result.message)
}
```

---

## Custom Event Tracking

Track custom events for analytics, automation triggers, and user behavior analysis.

### Track Events

```typescript
await levee.tracking.track({
  event: 'purchase_completed',
  email: 'user@example.com',
  properties: {
    product: 'pro-plan',
    amount: '99.00',
    currency: 'usd',
  },
})
```

---

## Products

Access product information and pricing.

### Get a Product

```typescript
const product = await levee.products.getProduct('pro-plan')

console.log('Name:', product.name)
console.log('Description:', product.description)
console.log('Type:', product.type)
console.log('Category:', product.category)
console.log('Active:', product.active)

// Access pricing
for (const price of product.prices ?? []) {
  console.log(`Price: $${(price.unitAmountCents / 100).toFixed(2)} ${price.currency}`)
  if (price.recurringInterval) {
    console.log(`  Recurring: every ${price.recurringIntervalCount} ${price.recurringInterval}`)
  }
}

// Access features
for (const feature of product.features ?? []) {
  console.log(`Feature: ${feature.name} - ${feature.included ? 'Included' : 'Not included'}`)
}
```

---

## Events

Track custom events for analytics and automation triggers.

### Track an Event

```typescript
await levee.events.trackEvent({
  event: 'page_view',
  email: 'user@example.com',
  visitorId: 'visitor-123',
  sessionId: 'session-456',
  page: '/pricing',
  referrer: 'https://google.com',
  properties: {
    source: 'organic',
  },
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'spring-sale',
})
```

---

## Funnels

Access sales funnel information for building multi-step checkout flows.

### Get a Funnel Step

```typescript
const step = await levee.funnels.getFunnelStep('checkout-step-1')

console.log('Step Type:', step.stepType)
console.log('Title:', step.title)
console.log('Headline:', step.headline)
console.log('Product:', step.product?.name)

// Check for order bump
if (step.orderBumpProduct) {
  console.log('Order Bump:', step.orderBumpProduct.name)
  console.log('Order Bump Headline:', step.orderBumpHeadline)
}
```

---

## Offers

Process offer accepts/declines in sales funnels (upsells, downsells, order bumps).

### Process an Offer

```typescript
const result = await levee.offers.processOffer({
  sessionId: 'checkout-session-123',
  stepSlug: 'upsell-step',
  accept: true,
})

if (result.success) {
  console.log('Offer accepted!')
  console.log('Next URL:', result.nextUrl)
} else {
  console.log('Message:', result.message)
}
```

---

## Quizzes

Access and submit quiz responses for lead qualification and segmentation.

### Get a Quiz

```typescript
const quiz = await levee.quizzes.getQuiz('lead-qualification')

console.log('Title:', quiz.title)
console.log('Description:', quiz.description)

for (const question of quiz.questions) {
  console.log(`Q: ${question.question} (${question.type})`)
  for (const option of question.options ?? []) {
    console.log(`  - ${option.label}: ${option.value}`)
  }
}
```

### Submit Quiz Answers

```typescript
const result = await levee.quizzes.submitQuiz('lead-qualification', {
  quizSlug: 'lead-qualification',
  email: 'user@example.com',
  name: 'John Doe',
  answers: {
    q1: 'answer1',
    q2: 'answer2',
  },
})

console.log('Segments:', result.segments)
console.log('Redirect URL:', result.redirectUrl)
console.log('Lead ID:', result.leadId)
```

---

## Workshops

Access workshop and event information.

### Get a Workshop

```typescript
const workshop = await levee.workshops.getWorkshop('spring-bootcamp')

console.log('Title:', workshop.title)
console.log('Dates:', `${workshop.startDate} to ${workshop.endDate}`)
console.log('Time:', `${workshop.startTime} - ${workshop.endTime} ${workshop.timezone}`)
console.log('Location:', workshop.locationType, workshop.locationDetails)
console.log(`Price: $${(workshop.priceCents / 100).toFixed(2)} ${workshop.currency}`)
console.log(`Seats: ${workshop.seatsRemaining} of ${workshop.maxSeats} remaining`)

// Agenda
for (const day of workshop.agenda) {
  console.log(`Day ${day.day}: ${day.title}`)
  for (const item of day.items) {
    console.log(`  - ${item}`)
  }
}
```

### Get Workshop by Product

```typescript
const workshop = await levee.workshops.getWorkshopByProduct('bootcamp-product')

console.log('Workshop:', workshop.title)
```

---

## Billing

Full Stripe billing integration for customers, subscriptions, and usage-based billing.

### Create a Customer

```typescript
const customer = await levee.billing.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
})
```

### Create a Checkout Session

```typescript
const checkout = await levee.billing.createCheckout({
  customerEmail: 'user@example.com',
  lineItems: [
    { priceId: 'price_xxx', quantity: 1 },
  ],
  mode: 'subscription',
  successUrl: 'https://yourapp.com/success',
  cancelUrl: 'https://yourapp.com/cancel',
})

// Redirect to checkout.checkoutUrl
```

### Cancel a Subscription

```typescript
await levee.billing.cancelSubscription('sub_123')
```

### Record Metered Usage

```typescript
await levee.billing.recordUsage({
  subscriptionItemId: 'si_xxx',
  quantity: 150,
})
```

### Customer Portal

```typescript
const portal = await levee.billing.getPortal({
  customerId: 'cust_123',
  returnUrl: 'https://yourapp.com/settings',
})

// Redirect to portal.portalUrl
```

---

## Webhooks

Register webhook endpoints to receive real-time events from Levee.

### Register a Webhook

```typescript
import { WebhookEvents } from '@levee/sdk'

const result = await levee.webhooks.register({
  url: 'https://yourapp.com/webhooks/levee',
  events: [
    WebhookEvents.ContactCreated,
    WebhookEvents.EmailOpened,
    WebhookEvents.PaymentSucceeded,
    WebhookEvents.SubscriptionCreated,
  ],
})

console.log('Webhook ID:', result.webhookId)
console.log('Secret:', result.secret, '(save this for signature verification!)')
```

### Available Webhook Events

```typescript
import { WebhookEvents } from '@levee/sdk'

// Contact events
WebhookEvents.ContactCreated      // 'contact.created'
WebhookEvents.ContactUpdated      // 'contact.updated'
WebhookEvents.ContactUnsubscribed // 'contact.unsubscribed'
WebhookEvents.ContactBounced      // 'contact.bounced'

// Email events
WebhookEvents.EmailSent       // 'email.sent'
WebhookEvents.EmailDelivered  // 'email.delivered'
WebhookEvents.EmailOpened     // 'email.opened'
WebhookEvents.EmailClicked    // 'email.clicked'
WebhookEvents.EmailBounced    // 'email.bounced'
WebhookEvents.EmailComplained // 'email.complained'

// Sequence events
WebhookEvents.SequenceEnrolled  // 'sequence.enrolled'
WebhookEvents.SequenceCompleted // 'sequence.completed'
WebhookEvents.SequencePaused    // 'sequence.paused'
WebhookEvents.SequenceResumed   // 'sequence.resumed'

// Payment events
WebhookEvents.PaymentSucceeded // 'payment.succeeded'
WebhookEvents.PaymentFailed    // 'payment.failed'
WebhookEvents.PaymentRefunded  // 'payment.refunded'

// Subscription events
WebhookEvents.SubscriptionCreated   // 'subscription.created'
WebhookEvents.SubscriptionUpdated   // 'subscription.updated'
WebhookEvents.SubscriptionCancelled // 'subscription.cancelled'
WebhookEvents.SubscriptionRenewed   // 'subscription.renewed'

// Order events
WebhookEvents.OrderCreated   // 'order.created'
WebhookEvents.OrderCompleted // 'order.completed'
WebhookEvents.OrderRefunded  // 'order.refunded'
```

### List Webhooks

```typescript
const webhooks = await levee.webhooks.list()

for (const wh of webhooks) {
  console.log(`Webhook ${wh.id}: ${wh.url}`)
  console.log(`  Events: ${wh.events.join(', ')}`)
  console.log(`  Success rate: ${wh.deliveriesSuccess}/${wh.deliveriesTotal}`)
}
```

### Update a Webhook

```typescript
const wh = await levee.webhooks.update(webhookId, {
  events: [
    WebhookEvents.PaymentSucceeded,
    WebhookEvents.PaymentFailed,
  ],
  active: true,
})
```

### Test a Webhook

```typescript
const result = await levee.webhooks.test(webhookId)

if (result.success) {
  console.log(`Webhook test succeeded! Status: ${result.statusCode}`)
} else {
  console.log(`Webhook test failed: ${result.error}`)
}
```

### View Webhook Logs

```typescript
const logs = await levee.webhooks.listLogs(webhookId, 20)

for (const log of logs) {
  console.log(`${log.deliveredAt}: ${log.event} (status ${log.statusCode}, ${log.durationMs}ms)`)
}
```

### Delete a Webhook

```typescript
await levee.webhooks.delete(webhookId)
```

---

## Stats & Analytics

Access statistics and analytics for your organization.

### Overview Stats

```typescript
const stats = await levee.stats.getOverview({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
})

console.log(`Contacts: ${stats.totalContacts} total, ${stats.newContacts} new, ${stats.activeContacts} active`)
console.log(`Emails: ${stats.emailsSent} sent, ${stats.openRate.toFixed(1)}% open rate, ${stats.clickRate.toFixed(1)}% click rate`)
console.log(`Revenue: $${(stats.totalRevenue / 100).toFixed(2)} from ${stats.orderCount} orders`)
```

### Email Stats

```typescript
const emailStats = await levee.stats.getEmailStats({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  groupBy: 'day', // 'day', 'week', or 'month'
})

console.log(`Totals: ${emailStats.totalSent} sent, ${emailStats.avgOpenRate.toFixed(1)}% open rate, ${emailStats.avgClickRate.toFixed(1)}% click rate`)

for (const day of emailStats.stats) {
  console.log(`${day.date}: ${day.sent} sent, ${day.opened} opened (${day.openRate.toFixed(1)}%)`)
}
```

### Revenue Stats

```typescript
const revenueStats = await levee.stats.getRevenueStats({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  groupBy: 'week',
})

console.log(`Total revenue: $${(revenueStats.totalRevenue / 100).toFixed(2)}`)
console.log(`MRR: $${(revenueStats.mrr / 100).toFixed(2)}`)
console.log(`Orders: ${revenueStats.totalOrders}, Subscriptions: ${revenueStats.totalSubscriptions}, Churned: ${revenueStats.totalChurned}`)
```

### Contact Stats

```typescript
const contactStats = await levee.stats.getContactStats({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  groupBy: 'day',
})

console.log(`Active: ${contactStats.totalActive}, Unsubscribed: ${contactStats.totalUnsubscribed}, Net growth: ${contactStats.netGrowth}`)
```

---

## Error Handling

The SDK provides typed error classes for different error scenarios.

```typescript
import {
  APIError,
  BadRequestError,
  AuthenticationError,
  NotFoundError,
  RateLimitError
} from '@levee/sdk'

try {
  await levee.contacts.get('nonexistent@example.com')
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Contact not found')
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key')
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}ms`)
  } else if (error instanceof BadRequestError) {
    console.log('Bad request:', error.message)
  } else if (error instanceof APIError) {
    console.log(`API error (${error.status}): ${error.message}`)
  } else {
    throw error
  }
}
```

---

## Complete Example

A complete SaaS application integration with SvelteKit:

```typescript
// src/lib/server/levee.ts
import { Levee } from '@levee/sdk'
import { LEVEE_API_KEY } from '$env/static/private'

export const levee = new Levee(LEVEE_API_KEY)
```

```typescript
// src/routes/+layout.server.ts
import { levee } from '$lib/server/levee'

export async function load() {
  const [settings, menu] = await Promise.all([
    levee.site.getSettings(),
    levee.site.getMenu('header'),
  ])

  return { settings, menu }
}
```

```typescript
// src/routes/blog/+page.server.ts
import { levee } from '$lib/server/levee'

export async function load({ url }) {
  const page = parseInt(url.searchParams.get('page') ?? '1')

  const posts = await levee.content.listPosts({
    page,
    pageSize: 10,
  })

  return { posts: posts.posts, total: posts.total }
}
```

```typescript
// src/routes/api/signup/+server.ts
import { json } from '@sveltejs/kit'
import { levee } from '$lib/server/levee'

export async function POST({ request }) {
  const { email, name } = await request.json()

  // Create contact and enroll in onboarding sequence
  const contact = await levee.contacts.create({
    email,
    name,
    funnelSlug: 'signup',
    tags: ['trial'],
  })

  // Enroll in onboarding sequence
  await levee.sequences.enroll({
    sequenceSlug: 'onboarding',
    email,
    variables: { firstName: name },
  })

  // Send welcome email
  await levee.emails.send({
    to: email,
    templateSlug: 'welcome',
    variables: { name },
  })

  return json({ contactId: contact.id })
}
```

---

## API Reference

All methods use the resource-based pattern: `levee.resource.method(...)`

| Resource.Method | Description |
|-----------------|-------------|
| **Client** | |
| `new Levee(apiKey, options?)` | Create a new client |
| `options.baseURL` | Custom API base URL |
| `options.timeout` | Request timeout in milliseconds |
| `options.fetch` | Custom fetch implementation |
| **Auth** | |
| `auth.register(input)` | Register a new customer |
| `auth.login(input)` | Login a customer |
| `auth.refreshToken(input)` | Refresh authentication token |
| `auth.forgotPassword(input)` | Initiate password reset |
| `auth.resetPassword(input)` | Complete password reset |
| `auth.verifyEmail(input)` | Verify customer email |
| `auth.changePassword(input)` | Change password while logged in |
| **Contacts** | |
| `contacts.create(input)` | Create or get a contact |
| `contacts.get(idOrEmail)` | Get contact details |
| `contacts.update(idOrEmail, input)` | Update a contact |
| `contacts.addTags(idOrEmail, tags)` | Add tags to contact |
| `contacts.removeTags(idOrEmail, tags)` | Remove tags from contact |
| `contacts.listActivity(idOrEmail, limit?)` | Get contact activity |
| `contacts.globalUnsubscribe(email, reason?)` | Unsubscribe from all |
| **Lists** | |
| `lists.subscribe(listSlug, email, name?)` | Subscribe to list |
| `lists.unsubscribe(listSlug, email)` | Unsubscribe from list |
| **Emails** | |
| `emails.send(input)` | Send transactional email |
| `emails.getStatus(messageId)` | Get email delivery status |
| `emails.listEvents(messageId)` | Get email tracking events |
| **Sequences** | |
| `sequences.enroll(input)` | Enroll in sequence |
| `sequences.getEnrollments(email, sequenceSlug?)` | Get enrollments |
| `sequences.unenroll(email, sequenceSlug?)` | Unenroll from sequence |
| `sequences.pause(email, sequenceSlug)` | Pause enrollment |
| `sequences.resume(email, sequenceSlug)` | Resume enrollment |
| **Orders** | |
| `orders.create(input)` | Create checkout session |
| **Customers (Billing History)** | |
| `customers.getByEmail(email)` | Get customer info |
| `customers.listInvoices(email, limit?)` | List invoices |
| `customers.listOrders(email, limit?)` | List orders |
| `customers.listSubscriptions(email)` | List subscriptions |
| `customers.listPayments(email, limit?)` | List payments |
| `customers.updateCustomer(id, input)` | Update customer profile |
| `customers.deleteCustomer(id)` | Delete customer (GDPR) |
| **Products** | |
| `products.getProduct(slug)` | Get product info |
| **Events** | |
| `events.trackEvent(input)` | Track a custom event |
| **Funnels** | |
| `funnels.getFunnelStep(slug)` | Get funnel step info |
| **Offers** | |
| `offers.processOffer(input)` | Accept/decline an offer |
| **Quizzes** | |
| `quizzes.getQuiz(slug)` | Get quiz info |
| `quizzes.submitQuiz(slug, input)` | Submit quiz answers |
| **Workshops** | |
| `workshops.getWorkshop(slug)` | Get workshop info |
| `workshops.getWorkshopByProduct(productSlug)` | Get workshop by product |
| **Billing** | |
| `billing.createCustomer(input)` | Create billing customer |
| `billing.createCheckout(input)` | Create Stripe checkout |
| `billing.createSubscription(input)` | Create subscription |
| `billing.cancelSubscription(subscriptionId)` | Cancel subscription |
| `billing.recordUsage(input)` | Record metered usage |
| `billing.getPortal(input)` | Get portal URL |
| **Webhooks** | |
| `webhooks.register(input)` | Register webhook |
| `webhooks.list()` | List webhooks |
| `webhooks.get(webhookId)` | Get webhook details |
| `webhooks.update(webhookId, input)` | Update webhook |
| `webhooks.delete(webhookId)` | Delete webhook |
| `webhooks.test(webhookId)` | Send test event |
| `webhooks.listLogs(webhookId, limit?)` | Get delivery logs |
| **Stats** | |
| `stats.getOverview(options?)` | Get overview stats |
| `stats.getEmailStats(options?)` | Get email stats |
| `stats.getRevenueStats(options?)` | Get revenue stats |
| `stats.getContactStats(options?)` | Get contact stats |
| **Tracking** | |
| `tracking.track(input)` | Track custom event |
| **LLM/AI (HTTP)** | |
| `llm.chat(input)` | Simple chat (non-streaming) |
| `llm.getConfig()` | Get LLM configuration |
| **LLMClient (gRPC Streaming)** | |
| `new LLMClient(apiKey, options?)` | Create LLM streaming client |
| `chatStream(input)` | Stream chat (async generator) |
| `chatStreamCallback(input, callback)` | Stream chat with callback |
| `chat(input)` | Simple chat via gRPC |
| `close()` | Close gRPC connection |
| **Content/CMS** | |
| `content.listPosts(options?)` | List published posts |
| `content.getPost(slug)` | Get post by slug |
| `content.listPages(options?)` | List published pages |
| `content.getPage(slug)` | Get page by slug |
| `content.listCategories()` | List content categories |
| **Site Configuration** | |
| `site.getSettings()` | Get site branding/settings |
| `site.listMenus(options?)` | List navigation menus |
| `site.getMenu(slug)` | Get menu by slug |
| `site.listAuthors()` | List all authors |
| `site.getAuthor(id)` | Get author by ID |

---

## Requirements

- Node.js 18+ (for native fetch)
- TypeScript 5.0+ (recommended)

## License

MIT License - see [LICENSE](LICENSE) for details.
