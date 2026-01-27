# Codebase Consolidation Review - January 2026

## Summary

A comprehensive review of the Jarvis codebase for consistency, maintainability, and production readiness.

## Completed Consolidations

### 1. Cron Job User-Iteration Pattern (`packages/server/src/cron/utils.ts`)

**Problem**: 8+ cron jobs had identical boilerplate for iterating over users with integrations.

**Solution**: Created `forEachUserWithIntegration` helper that:
- Gets users with specified integration type
- Logs when no users are configured
- Iterates with per-user error handling
- Supports parallel processing with concurrency limit
- Provides structured logging

**Also added**:
- `withRetry` - Exponential backoff retry wrapper for transient failures
- `isTransientError` - Helper to identify retryable errors (network, rate limits, etc.)

### 2. Dashboard Business Entity Helper (Applied)

**Problem**: Inline business entity lookup in dashboard.ts

**Solution**: Applied existing `getOwnedBusinessEntityIds` helper from `trpc/lib/crud-helpers.ts`

### 3. Audiobooks Error Handling (Fixed)

**Problem**: Generic try-catch blocks hiding error details

**Solution**: Applied `withPrismaError` wrapper for proper error translation

## Existing Good Patterns (Verified)

### Error Handling
- **AppError class** (`@jarvis/shared`) - Structured errors with codes, status, context
- **Errors factory** - Consistent error creation (validation, notFound, unauthorized, etc.)
- **withPrismaError** (`lib/prisma/errors.ts`) - Prisma error translation
- **ensureExists/ensureAffected** (`trpc/lib/crud-helpers.ts`) - CRUD result validation

### Time Utilities (`utils/time-constants.ts`)
- Time constants (MINUTES, HOURS, DAYS, etc.)
- Helper functions (daysAgo, hoursAgo, minutesAgo, sleep)
- `toDateString` for ISO date formatting

### Prisma Extensions (`lib/prisma/`)
- Soft delete extension (30+ models)
- Audit logging extension
- Error handling utilities

### tRPC Middleware
- errorHandler - Converts AppError to TRPCError
- isAuthed - Authentication check
- baseProcedure - Base with error handling
- protectedProcedure - Authenticated + authorized

### Tool Infrastructure (`tools/base/tool-base.ts`)
- JarvisTool base class
- Timeout handling
- Error categorization
- Structured ToolResult

## Areas for Future Improvement

### 1. Error Message Extraction (Low Priority)
**Pattern found 60+ times**: `error instanceof Error ? error.message : 'Unknown error'`

**Existing utility**: `getErrorMessage(error)` from `@jarvis/shared`

**Recommendation**: Gradually migrate to use the shared utility. Not urgent as the pattern works, just inconsistent.

### 2. Integration Base Class (Medium Priority)
**Exists**: `BaseIntegration` class in `lib/integrations/base-integration.ts`

**Status**: Well-designed with OAuth, rate limiting, retry logic, but NOT USED by existing integrations (Spotify, GitHub, Oura)

**Recommendation**: Consider migrating integrations to use BaseIntegration for:
- Automatic token refresh
- Rate limiting
- Retry with exponential backoff
- Structured error handling

### 3. Date Formatting (Low Priority)
**Pattern**: Various date formatting approaches (date-fns format, toISOString().split, etc.)

**Recommendation**: The `toDateString` utility exists but isn't consistently used. Consider documenting preferred patterns.

## Best Practices Confirmed (via Perplexity)

### Cron Jobs
- ✅ Try-catch with async/await
- ✅ Structured logging with job name, duration
- ✅ User-based iteration with error isolation
- ⬜ Could add: Overlap prevention, idempotency

### tRPC
- ✅ Router separation by domain
- ✅ Middleware composition
- ✅ Zod input validation
- ✅ Error formatting

### Hono.js Server Setup (`packages/server/src/index.ts`)
- ✅ Request ID middleware for distributed tracing
- ✅ Structured HTTP request logging with correlation
- ✅ Secure headers with CSP (production only)
- ✅ CORS configuration with mobile support (expo-origin)
- ✅ HTTPS redirect in production
- ✅ Rate limiting with admin awareness (20x multiplier)
- ✅ Health checks (liveness, readiness, comprehensive with metrics)
- ✅ tRPC integration with request ID propagation
- ✅ AppError handling with structured JSON responses
- ✅ 404 handler
- ✅ Graceful shutdown with queue cleanup

### Prisma Extensions (Verified)
- ✅ Soft delete: Filters findMany, findFirst, findUnique, count, aggregate, groupBy
- ✅ Audit logging: Write logging, slow query detection, sensitive field sanitization
- ✅ Extension composition: base → softDelete → auditLogging

### CRUD Helpers (`trpc/lib/crud-helpers.ts`)
- ✅ ensureExists/requireRecord/ensureAffected
- ✅ userOwned/userOwnedById where clause helpers
- ✅ softDelete helper
- ✅ Pagination helpers (paginate, paginatedResponse)
- ✅ dateRange filter
- ✅ ensureConfigured for service checks
- ✅ batchProcess/batchProcessParallel/chunkedFindMany
- ✅ Business entity helpers (getOwnedBusinessEntityIds, getAccessibleBusinessEntityIds)

### Prisma Error Handling (`lib/prisma/errors.ts`)
- ✅ Maps all Prisma error codes (P2xxx) to AppError
- ✅ withPrismaError wrapper
- ✅ Helpers: isUniqueConstraintError, isNotFoundError, isForeignKeyError, isRetryableError

## Files Modified This Session

1. `packages/server/src/cron/utils.ts` - NEW: Cron utilities
2. `packages/server/src/cron/jobs.ts` - Refactored to use forEachUserWithIntegration
3. `packages/server/src/trpc/routers/dashboard.ts` - Applied business entity helper
4. `packages/server/src/trpc/routers/audiobooks.ts` - Fixed error handling
5. `packages/server/src/trpc/routers/journal.ts` - Removed redundant try-catch blocks (service already throws AppError)
6. `packages/server/src/trpc/routers/chat.ts` - Removed redundant try-catch, added AppError passthrough pattern
7. `packages/server/src/trpc/routers/contacts.ts` - Simplified error handling in createInteraction and createReminder

## Production Readiness Verification (Completed)

All verified as properly implemented:

| Pattern | Status | Location |
|---------|--------|----------|
| Graceful shutdown | ✅ | `utils/graceful-shutdown.ts` - SIGTERM, SIGINT, uncaughtException, unhandledRejection |
| Health checks | ✅ | `index.ts` - `/health/live`, `/health/ready`, `/health` (comprehensive) |
| Query logging | ✅ | `lib/prisma/audit-logging.ts` - Slow query detection (200ms), request ID correlation |
| Soft delete | ✅ | `lib/prisma/soft-delete.ts` - Prisma Client Extension |
| Singleton DB | ✅ | `utils/db.ts` - Uses `remember` pattern |
| Time constants | ✅ | `utils/time-constants.ts` - MINUTES, HOURS, DAYS, daysAgo(), sleep() |
| Pagination | ✅ | `lib/pagination.ts` - cursorPaginationSchema, processCursorPagination |
| Error handling | ✅ | `@jarvis/shared` - AppError, Errors factory |

## Pagination Schema Usage

Some routers use shared `cursorPaginationSchema`, others define inline (both patterns work):
- **Using shared**: oura.ts, spotify.ts, github.ts, expenses.ts, business-entities.ts  
- **Inline**: books.ts, inventory.ts, journal.ts, trips.ts, etc.

Not a critical issue - patterns are functionally equivalent. Consider gradual migration to shared schema for consistency

8. `packages/server/src/lib/daily-report.ts` - Replaced 10 console.error calls with structured logger

### Redundant AppError Catch-Rethrow Pattern (FIXED)

**Problem**: Routers were catching errors from service layer, checking `error.message === 'X not found'`, and re-throwing `Errors.notFound()`.

**Reality**: Service layer already throws `Errors.notFound()` which is an AppError. The router try-catch was completely redundant.

**Fix Applied**: 
- journal.ts: Removed 2 redundant try-catch blocks for addAttachment and deleteAttachment
- chat.ts: 
  - sendMessage: Changed to check `error instanceof AppError` and let it pass through, wrap others in Errors.internal
  - addAttachment: Removed redundant try-catch
  - deleteAttachment: Removed redundant try-catch

**Best Practice**: When service layer throws AppError, routers should:
1. Let AppErrors pass through (they're already properly formatted)
2. Only catch to wrap non-AppErrors in appropriate error types
3. NEVER check `error.message` strings - use `error instanceof AppError && error.code === 'NOT_FOUND'` if needed

## tRPC Router Consistency (Verified)

All ~52 tRPC routers follow consistent patterns:

### Standard CRUD Routers (books, yoga, notes, inventory, caffeine, etc.)
- `list` - Cursor-based pagination with optional search/filters
- `getById` - Single record with `ensureExists` wrapper
- `stats` - Aggregated statistics (when applicable)
- `create` - Create mutation with Zod validation
- `update` - Update with `ensureAffected` check
- `delete` - Soft delete with `ensureAffected` check

### Integration Routers (spotify, github, oura)
- `hasIntegration` - Check if configured
- `syncState` - Get last sync timestamps
- `testConnection` - Test the integration
- `configure` - Save credentials
- `sync*` mutations - Trigger sync operations (all use `ensureConfigured`)
- `disconnect` - Remove integration

### Consistent Imports Across All Routers
```typescript
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc.js'
import { ensureAffected, ensureExists } from '../lib/crud-helpers.js'
// Service functions from ../../lib/
```

## Service Layer Consistency (Verified)

All service files in `lib/` follow consistent patterns:

### Naming Conventions
- `get<Resource>s()` - List with pagination
- `get<Resource>()` - Single by ID + userId
- `create<Resource>()` - Create with validation
- `update<Resource>()` - Update with ownership check
- `delete<Resource>()` - Soft delete
- `get<Resource>Stats()` - Statistics/aggregations
- `getUnique<Field>s()` - For autocomplete

### Pattern Implementation
- All use `Errors` from `@jarvis/shared` for validation
- All use pagination helpers from `./pagination.js`
- All use `prisma` from `../utils/db.js`
- All use `updateMany` for updates (returns count for `ensureAffected`)
- All include `deletedAt: null` in where clauses
- All use typed input interfaces

## Security Patterns Verification (Completed)

### SQL Injection Prevention ✅
- All `$queryRaw` uses template literals (parameterized) 
- No `$queryRawUnsafe` or `$executeRawUnsafe` in application code
- Examples: health check `SELECT 1`, inventory queries, portfolio queries

### Code Execution Safety ✅
- No `eval()` or `new Function()` in application code
- No `vm.*` dynamic execution patterns
- Only reference to eval/Function is in code-review skill documentation (patterns to warn about)

### XSS Prevention ✅
- `dangerouslySetInnerHTML` used in 2 acceptable places:
  - `email/message.tsx` - Gmail HTML body (from Gmail API, shown only to authenticated owner)
  - `chart.tsx` - Controlled theme CSS (not user input)

### Input Validation ✅
- 152+ `.input(z.*)` calls with Zod schemas
- All user inputs go through Zod validation
- Endpoints without input are context-only (stats, settings, disconnect)

### Authentication ✅
- `protectedProcedure` enforces auth via `isAuthed` middleware
- `ctx.userId` guaranteed to be string in protected procedures

### Error Handling Security
- AppError to TRPCError conversion in middleware
- **Potential improvement**: Add `errorFormatter` to sanitize detailed error messages in production
- Current: Error messages pass through (acceptable for personal project)

### Best Practices Confirmed (via Perplexity - tRPC v11 2025)
- ✅ Zod input validation on all procedures
- ✅ Authentication middleware composition
- ✅ AppError to TRPCError conversion
- ⬜ Output validation (not implemented - lower priority)
- ⬜ errorFormatter for production error sanitization (low priority)

## CRUD Helper Adoption Analysis

### userOwned/userOwnedById helpers
- **Available in**: `trpc/lib/crud-helpers.ts`
- **Used in**: 3 files (11 occurrences) - recordings.ts, files.ts
- **Raw pattern**: 14 files (37 occurrences) with inline `{ userId, deletedAt: null }`

**Recommendation**: Low priority migration. Both patterns work correctly. The helper adds `deletedAt: null` which is correct for soft-deleted models. Migration would improve consistency but isn't urgent.

## Recommendations for Future Ralph Loops

1. **Migrate integrations to BaseIntegration** - Would consolidate OAuth, retry, rate limiting (Medium Priority)
2. **Standardize error message extraction** - Use getErrorMessage() consistently (Low Priority)
3. **Add overlap prevention to cron jobs** - Use Redis locks or job queues (Low Priority)
4. **Document preferred patterns** - Add examples to CLAUDE.md for common operations
5. **Type daily-report tasks** - Replace `any[]` with proper Task types (Low Priority)
6. **Adopt userOwned helpers** - Migrate 37 occurrences to use userOwned/userOwnedById from crud-helpers.ts (Low Priority)

## Node.js 22 Compliance (Verified)

- ✅ `engines.node: "22"` in package.json
- ✅ ESM modules with `.js` extensions
- ✅ No legacy `node-fetch` dependency (using native fetch)
- ✅ No `glob` package (native fs.glob available)
- ✅ TypeScript 5.9.2 with modern target
- ✅ Top-level await compatible

## Type Safety Analysis

**`any` usage in application code**: ~40 occurrences (excluding generated Prisma)

Most are acceptable edge cases:
- SDK boundaries (MCP, OpenAI adapters - types restrictive)
- Complex Prisma relations (business-entities.ts)
- Error object property access (S3 client)
- Enum coercion (notification-logs.ts)

**Low priority improvements**:
- daily-report.ts: 8 `any[]` for tasks - should use Task types
- business-entities.ts: 14 casts for Prisma relations
