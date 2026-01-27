# Codebase Patterns Audit - January 2025

*Last updated: 2025-01-16*

## Session Summary

### Changes Applied
1. **Request ID Middleware** - Added `requestId()` middleware to index.ts for distributed tracing
2. **Structured Logger** - Replaced basic `hono/logger` with custom `structuredLogger()` for JSON logging
3. **tRPC Context Integration** - Updated context to accept requestId from Hono middleware, ensuring consistent correlation
4. **Middleware Order** - Fixed middleware order per Hono.js best practices:
   - Security headers now applied BEFORE CORS (protects before exposure)
   - Correct order: requestId → structuredLogger → secureHeaders → cors → rate limiting
5. **formatCurrency Consolidation** - Added generic `formatCurrency()` to shared package:
   - Replaced 10+ duplicate local functions across mobile files
   - **Fully migrated (2025-01-16)**:
     - expected-income.tsx, expenses.tsx, portfolio.tsx, debts.tsx, stocks.tsx
     - inventory.tsx, expected-outcome.tsx, invoices.tsx, invoice/[id].tsx
     - integrations.tsx
   - Only 2 files retain local formatCurrency (intentionally different - K/M abbreviation for widgets):
     - finances-widget.tsx, portfolio-widget.tsx

### Verified as Production-Ready
- Error handling: Consistent `Errors` factory usage (no raw throws)
- CRUD helpers: Widely adopted (41+ routers)
- Pagination: Cursor-based pattern used consistently  
- Prisma: Soft delete and audit logging extensions in place
- Security: Rate limiting, secure headers, CORS properly configured
- Health checks: Liveness, readiness, and full health endpoints

### Future Improvements (Not Applied)
- **BaseIntegration Migration** (High Priority): Move OAuth integrations to use BaseIntegration class
- **Wellness Router Factory** (Medium Priority): Migrate 7 wellness routers (~1200 lines) to factory pattern

---

## Summary

The codebase follows production-ready patterns with consistent abstractions throughout.

## Error Handling

**Location**: `packages/shared/src/utils/errors.ts`

- `AppError` class with error codes (`VALIDATION`, `NOT_FOUND`, `UNAUTHORIZED`, etc.)
- `Errors` factory with common error types:
  - `Errors.notFound(resource, id?)`
  - `Errors.validation(message, context?)`
  - `Errors.unauthorized(message?)`
  - `Errors.forbidden(message?)`
  - `Errors.serviceNotConfigured(service)`
  - `Errors.externalService(service, message, cause?)`
- tRPC middleware converts `AppError` to `TRPCError` automatically
- All routers use `Errors` factory consistently - no raw `throw new Error`

## Prisma Setup

**Location**: `packages/server/src/utils/db.ts`

- Singleton pattern using `remember()` utility
- Extensions applied in order:
  1. Soft delete (auto-filters `deletedAt: null`)
  2. Audit logging (slow query detection, structured logging)
- PrismaPg adapter for connection pooling

### Soft Delete Extension
**Location**: `packages/server/src/lib/prisma/soft-delete.ts`

- Automatically filters soft-deleted records
- Models list in `SOFT_DELETE_MODELS` Set
- `hasSoftDelete(model)` helper function

### Audit Logging Extension
**Location**: `packages/server/src/lib/prisma/audit-logging.ts`

- Logs write operations at debug level
- Slow query warnings (default: 200ms threshold)
- Sensitive field redaction (`password`, `accessToken`, etc.)

## CRUD Helpers

**Location**: `packages/server/src/trpc/lib/crud-helpers.ts`

Widely used (41+ routers):
- `ensureExists(query, resourceName, id?)` - throws NOT_FOUND if null
- `requireRecord(record, resourceName, id?)` - sync version
- `ensureAffected(count, resourceName, id?)` - for updateMany/deleteMany
- `ensureConfigured(checkFn, serviceName)` - for integration checks
- `softDelete(prisma, model, where)` - soft delete helper
- `userOwned(userId)` - base where clause
- `userOwnedById(userId, id)` - where clause with ID
- `batchProcess(items, batchSize, processor)` - sequential batching
- `batchProcessParallel(items, batchSize, processor)` - parallel batching
- `chunkedFindMany(model, args, chunkSize, processor)` - pagination iteration

## Pagination

**Location**: `packages/server/src/lib/pagination.ts`

### Cursor-based (Recommended)
- `cursorPaginationSchema` - Zod schema for inputs
- `processCursorPagination(items, limit)` - extracts nextCursor
- `buildPrismaCursor(cursor)` - builds cursor object
- `calculateSkip(cursor)` - returns 1 if cursor exists

### Offset-based (Legacy)
- `offsetPaginationSchema` (deprecated)
- `processOffsetPagination(items, total, limit, offset)`

### Utilities
- `buildDateRangeFilter(startDate?, endDate?, fieldName?)` - date filters
- `buildSearchFilter(searchTerm?, fields?)` - text search across fields

## Wellness Router Factory

**Location**: `packages/server/src/trpc/lib/wellness-router-factory.ts`

- Exists but not currently in use
- Creates standardized CRUD routers for wellness tracking
- Supports: list, getById, stats, create, update, delete
- Optional: settings, sync endpoints
- Reduces boilerplate for wellness routers

## Hono.js Setup

**Location**: `packages/server/src/index.ts`

Follows best practices:
- Middleware chain: requestId → structuredLogger → secureHeaders → cors → HTTPS redirect → rate limiting
- `secureHeaders()` with CSP (production only)
- `hono-rate-limiter` with admin multiplier (20x higher limits)
- Global `app.onError()` converts `AppError` to JSON responses
- `app.notFound()` returns structured 404
- Health endpoints: `/health/live`, `/health/ready`, `/health`
- Graceful shutdown via `onShutdown()`

## Time Utilities

**Location**: `packages/server/src/utils/time-constants.ts`

- Time constants: `ONE_SECOND`, `ONE_MINUTE`, `ONE_HOUR`, `ONE_DAY`, `FIFTEEN_MINUTES`
- Helper: `daysAgo(n)` - returns Date n days ago
- Helper: `sleep(ms)` - Promise-based delay

## Date String Utilities

**Location**: `packages/shared/src/utils/date.ts`

- `toDateString(date)` - ISO date string (YYYY-MM-DD)
- `todayString()` - today's date as ISO string

## Areas for Future Improvement

### High Priority: Integration Base Class Adoption

**Location**: `packages/server/src/lib/integrations/base-integration.ts`

A `BaseIntegration` class exists with excellent abstractions:
- OAuth token refresh with buffer time
- Rate limiting per user
- Retry logic with exponential backoff
- Credential management
- Authenticated HTTP requests (get, post, put, delete)
- Paginated API fetching

**Current Status**: NOT USED by any integration

**Integrations to migrate**:
- Spotify (`spotify/api.ts` - uses raw ky)
- Oura (`oura.ts` - uses raw ky)
- GitHub (`github.ts` - uses raw ky)
- Google Calendar (`google-calendar.ts`)
- Gmail (`gmail.ts`)
- Google Meet (`google-meet.ts`)
- League of Legends (`league.ts`)

**Benefits of migration**:
1. Automatic token refresh handling
2. Rate limiting protection
3. Consistent retry logic
4. Standardized error handling
5. Reduced code duplication

### Medium Priority

1. Wellness routers could use `createWellnessRouter` factory to reduce boilerplate
2. 2 instances could use `userOwnedById` helper in crypto router
3. ~~Migrate remaining mobile files to use shared `formatCurrency`~~ **COMPLETED (2025-01-16)**

### Low Priority

1. Consider extracting more Prisma calls from routers into service functions

## Observability

**Sentry**: `@sentry/node` v10 used for error tracking with tracing
- Configured in `packages/server/src/utils/logger.ts`
- `tracesSampleRate: 0.1` in production, `1.0` in development
- `captureError()` reports exceptions with context
- `addBreadcrumb()` for trace correlation

**Custom Middleware (Not Applied)**:

1. **Request ID Middleware** (`packages/server/src/middleware/request-id.ts`)
   - Generates/reads `X-Request-ID` header
   - Sets `requestId` on Hono context
   - Exposes in response headers
   - **Status**: Implemented but NOT applied in index.ts

2. **Structured Logger Middleware** (`packages/server/src/middleware/structured-logger.ts`)
   - JSON-structured request/response logging
   - Request ID correlation
   - Duration tracking
   - Skip paths for health checks
   - Log level based on status code
   - **Status**: Implemented but NOT applied in index.ts

**Issue**: The app uses basic `hono/logger` instead of the custom structured logger.
The tRPC context creates its own `requestId` from headers, but the Hono middleware
that would set it isn't applied, so request IDs aren't consistent.

**Fix Applied (2025-01-16)**: 
- Added `requestId()` and `structuredLogger()` middleware to index.ts
- Replaced basic `hono/logger` with custom structured logger
- Updated tRPC context to accept optional requestId from Hono context
- Now all HTTP logs and tRPC operations share the same request ID for correlation