# Shared Utilities Pattern

## Overview
Common utilities are centralized in `@jarvis/shared` package and imported by client, server, and mobile packages.

## Shared Utilities Location
`packages/shared/src/utils/common.ts` contains:
- `getErrorMessage(error: unknown)` - Extract error message from unknown error type
- `formatHoursAndMinutes(milliseconds: number)` - Format milliseconds to "Xh Ym" string
- `formatNumber(value: number)` - Format number with locale separators
- `formatCompactNumber(value: number)` - Format as 1.2M, 45k, etc.
- `formatPercentage(value: number, total: number)` - Format as percentage string
- `calculatePercentage(value: number, total: number)` - Calculate percentage number
- `sortByValue(data, order)` - Sort array by value property
- `limitData(data, limit, otherLabel, valueKey)` - Limit data and aggregate "Other"

## Shared Types Location
`packages/shared/src/types/chat-stream.ts` contains:
- `StreamCallbacks` - Callbacks for SSE chat stream events
- `StreamAttachment` - Attachment data for chat messages
- `StreamDoneData`, `ToolCallData`, `ToolResultData` - Helper types

## Import Pattern
```typescript
// In client/server/mobile packages:
import { getErrorMessage, formatHoursAndMinutes } from '@jarvis/shared'
```

## Re-export Pattern (for backwards compatibility)
When consolidating duplicates, re-export from local files for backwards compatibility:
```typescript
// In packages/client/src/utils/misc.tsx
export { formatHoursAndMinutes, getErrorMessage } from '@jarvis/shared'
```

## Platform-Specific Code
Some code cannot be fully unified due to platform differences:
- `auth-client.ts` - Web vs Expo authentication plugins
- UI components (`card.tsx`, `button.tsx`) - React vs React Native elements
- `cn()` utility - Different implementations for web/mobile styling

## Files to Keep in Sync
When updating similar code across packages, add comments:
```typescript
/**
 * Keep in sync with packages/mobile/src/lib/trpc-helpers.ts
 */
```

## Chart Utilities
Chart utilities in `client/components/charts/chart-utils.ts` and `mobile/components/charts/chart-utils.ts`:
- Re-export shared utilities from `@jarvis/shared`
- Keep platform-specific color definitions (HSL for web, hex for mobile)
- Keep platform-specific theme constants
