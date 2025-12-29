# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Levee SDK for TypeScript - Official SDK for integrating the Levee API into TypeScript/JavaScript applications.

- **Package**: `@levee/sdk`
- **Runtime**: Node.js 18+, Bun, Deno, Edge runtimes
- **Server-side only**: API keys must never be exposed to browsers

## Commands

```bash
pnpm build        # Build with tsup (ESM + CJS + types)
pnpm dev          # Build in watch mode
pnpm test         # Run tests with vitest
pnpm test:run     # Run tests once
pnpm typecheck    # Type check without emitting
```

## Architecture

### Project Structure

```
src/
├── index.ts              # Main exports
├── client.ts             # Levee class - HTTP client with resource namespaces
├── errors.ts             # Error class hierarchy (APIError, NotFoundError, etc.)
├── types.ts              # All TypeScript interfaces
├── resources/            # API resource modules
│   ├── contacts.ts       # Contact CRUD, tags, activity
│   ├── emails.ts         # Transactional emails
│   ├── sequences.ts      # Drip campaigns
│   ├── billing.ts        # Stripe integration
│   ├── customers.ts      # Billing history (read-only)
│   ├── webhooks.ts       # Webhook management
│   ├── stats.ts          # Analytics
│   ├── content.ts        # CMS (posts, pages, categories)
│   ├── site.ts           # Site config (settings, menus, authors)
│   ├── lists.ts          # Email list subscriptions
│   ├── orders.ts         # Order creation
│   ├── tracking.ts       # Custom event tracking
│   └── llm.ts            # LLM HTTP client (non-streaming)
└── streaming/
    └── llm.ts            # LLMClient - gRPC streaming
proto/
└── llm.proto             # gRPC proto for LLM service
```

### Key Patterns

**Resource Namespaces**: API methods organized by resource:
```typescript
levee.contacts.create()
levee.emails.send()
levee.content.listPosts()
```

**Native Fetch**: Zero HTTP dependencies, works in all modern runtimes.

**Case Conversion**: Automatic camelCase (TypeScript) ↔ snake_case (API).

**Error Hierarchy**: Typed errors by HTTP status:
```typescript
APIError → BadRequestError (400)
        → AuthenticationError (401)
        → NotFoundError (404)
        → RateLimitError (429)
        → InternalServerError (500+)
```

**gRPC Streaming**: LLM client uses @grpc/grpc-js with dynamic proto loading.

## API Parity with Go SDK

| Go SDK | TypeScript SDK |
|--------|----------------|
| `client.CreateContact()` | `levee.contacts.create()` |
| `client.SendEmail()` | `levee.emails.send()` |
| `client.ListPosts()` | `levee.content.listPosts()` |
| `client.GetSiteSettings()` | `levee.site.getSettings()` |
| `llm.ChatStream()` | `llmClient.chatStream()` (async generator) |

## Dependencies

- `@grpc/grpc-js` - gRPC client for LLM streaming
- `@grpc/proto-loader` - Dynamic proto loading

## Adding New Resources

1. Create interface in `src/types.ts`
2. Create resource class in `src/resources/`
3. Add to `Levee` class in `src/client.ts`
4. Export from `src/index.ts`

## Build

tsup builds ESM + CJS with TypeScript declarations. The proto file is copied to `dist/proto/` for runtime loading.
