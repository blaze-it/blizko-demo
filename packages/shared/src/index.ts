// Shared Zod schemas
export * from './schemas/index.js'

// Utilities
export { cn } from './utils/cn.js'
export {
	calculatePercentage,
	formatCompactNumber,
	formatDuration,
	formatDurationColon,
	formatDurationColonSafe,
	formatDurationSafe,
	formatHoursAndMinutes,
	formatNumber,
	formatPercentage,
	formatTaskDuration,
	getErrorMessage,
	limitData,
	sortByValue,
} from './utils/common.js'

export type { DueDateInfo } from './utils/date.js'
export {
	formatDate,
	formatDateCompact,
	formatDateDisplay,
	formatDateFull,
	formatDateFullWithTime,
	formatDateLong,
	formatDateShort,
	formatDateTime,
	formatDateTimeFull,
	formatDateTimeShort,
	formatDateWithTime,
	formatDueDate,
	formatMonthYear,
	getToday,
	getTomorrow,
	isOverdue,
	isOverdueOrToday,
	isToday,
	isTomorrow,
	toDateString,
	todayString,
} from './utils/date.js'

// Error handling
export type { ErrorCode, Result } from './utils/errors.js'
export {
	AppError,
	appErrorToTrpcCode,
	Errors,
	err,
	isOperationalError,
	ok,
	toAppError,
	tryCatch,
	tryCatchSync,
} from './utils/errors.js'

// Timezone
export type { CommonTimezone, ValidatedTimezone } from './utils/timezone.js'
export {
	assertValidTimezone,
	COMMON_TIMEZONES,
	formatTimezoneCompact,
	formatTimezoneDisplay,
	getBrowserTimezone,
	getDefaultTimezone,
	getTimezoneAbbreviation,
	getTimezoneName,
	getTimezoneOffset,
	isValidTimezone,
	nowLocalDateTime,
	optionalTimezoneSchema,
	parseLocalDateTime,
	timezoneSchema,
	toLocalDateTime,
} from './utils/timezone.js'

// tRPC invalidation helpers
export type {
	InvalidationHelpers,
	QueryGroup,
} from './utils/trpc-invalidation.js'
export {
	createInvalidationHelpers,
	QUERY_GROUPS,
} from './utils/trpc-invalidation.js'
