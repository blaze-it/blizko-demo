/**
 * Shared Zod schemas for common validation patterns
 * These schemas reduce duplication across tRPC routers
 */
import { z } from 'zod'

// ============================================================================
// Pagination Schemas
// ============================================================================

/**
 * Standard cursor-based pagination input
 * Use for infinite scroll / load more patterns
 */
export const cursorPaginationSchema = z.object({
	limit: z.number().min(1).max(100).default(20),
	cursor: z.string().optional(),
})

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>

/**
 * Standard offset-based pagination input
 * Use for traditional page navigation
 */
export const offsetPaginationSchema = z.object({
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
})

export type OffsetPaginationInput = z.infer<typeof offsetPaginationSchema>

/**
 * Cursor pagination result wrapper
 */
export interface CursorPaginationResult<T> {
	items: T[]
	nextCursor: string | null
	hasMore: boolean
}

// ============================================================================
// Date Range Schemas
// ============================================================================

/**
 * Date range filter with optional bounds
 */
export const dateRangeSchema = z.object({
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
})

export type DateRangeInput = z.infer<typeof dateRangeSchema>

/**
 * Date range with required bounds
 */
export const requiredDateRangeSchema = z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
})

export type RequiredDateRangeInput = z.infer<typeof requiredDateRangeSchema>

/**
 * Days-based lookback filter
 */
export const daysFilterSchema = z.object({
	days: z.number().min(1).default(30),
})

export type DaysFilterInput = z.infer<typeof daysFilterSchema>

// ============================================================================
// ID Schemas
// ============================================================================

/**
 * Single ID input
 */
export const idSchema = z.object({
	id: z.string().min(1),
})

export type IdInput = z.infer<typeof idSchema>

/**
 * Multiple IDs input
 */
export const idsSchema = z.object({
	ids: z.array(z.string().min(1)).min(1),
})

export type IdsInput = z.infer<typeof idsSchema>

// ============================================================================
// Search Schemas
// ============================================================================

/**
 * Basic search with term
 */
export const searchSchema = z.object({
	searchTerm: z.string().optional(),
})

export type SearchInput = z.infer<typeof searchSchema>

/**
 * Search with pagination
 */
export const searchWithPaginationSchema =
	cursorPaginationSchema.merge(searchSchema)

export type SearchWithPaginationInput = z.infer<
	typeof searchWithPaginationSchema
>

// ============================================================================
// Tags Schemas
// ============================================================================

/**
 * Tags array schema
 */
export const tagsSchema = z.object({
	tags: z.array(z.string()).default([]),
})

export type TagsInput = z.infer<typeof tagsSchema>

/**
 * Tags filter (for querying)
 */
export const tagsFilterSchema = z.object({
	tags: z.array(z.string()).optional(),
})

export type TagsFilterInput = z.infer<typeof tagsFilterSchema>

// ============================================================================
// Common Field Schemas
// ============================================================================

/**
 * Title with length constraints
 */
export const titleSchema = z.string().min(1, 'Title is required').max(200)

/**
 * Optional title
 */
export const optionalTitleSchema = z.string().min(1).max(200).optional()

/**
 * Content/description field
 */
export const contentSchema = z.string().min(1, 'Content is required')

/**
 * Optional content
 */
export const optionalContentSchema = z.string().min(1).optional()

/**
 * Notes field (optional by default)
 */
export const notesSchema = z.string().nullish()

/**
 * Color field (hex or named)
 */
export const colorSchema = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$|^[a-z]+$/i)
	.optional()

// ============================================================================
// Numeric Schemas
// ============================================================================

/**
 * Positive number (> 0)
 */
export const positiveNumberSchema = z.number().positive()

/**
 * Non-negative number (>= 0)
 */
export const nonNegativeNumberSchema = z.number().min(0)

/**
 * Rating 1-5
 */
export const ratingSchema = z.number().min(1).max(5)

/**
 * Percentage 0-100
 */
export const percentageSchema = z.number().min(0).max(100)

/**
 * Priority p1-p4 (p1 highest)
 */
export const prioritySchema = z.enum(['p1', 'p2', 'p3', 'p4'])

export type Priority = z.infer<typeof prioritySchema>

// ============================================================================
// Mood Schema
// ============================================================================

/**
 * Standard mood values
 */
export const moodSchema = z.enum([
	'TERRIBLE',
	'BAD',
	'NEUTRAL',
	'GOOD',
	'GREAT',
])

export type Mood = z.infer<typeof moodSchema>

// ============================================================================
// Sorting Schemas
// ============================================================================

/**
 * Sort direction
 */
export const sortDirectionSchema = z.enum(['asc', 'desc'])

export type SortDirection = z.infer<typeof sortDirectionSchema>

/**
 * Generic sort input
 */
export const sortSchema = z.object({
	sortBy: z.string().optional(),
	sortDirection: sortDirectionSchema.default('desc'),
})

export type SortInput = z.infer<typeof sortSchema>

// ============================================================================
// Combined Common Schemas
// ============================================================================

/**
 * Standard list query with search, pagination, and date range
 */
export const standardListSchema = cursorPaginationSchema
	.merge(searchSchema)
	.merge(dateRangeSchema)
	.merge(tagsFilterSchema)

export type StandardListInput = z.infer<typeof standardListSchema>

/**
 * Standard list query with days-based lookback
 */
export const standardListWithDaysSchema = cursorPaginationSchema
	.merge(searchSchema)
	.merge(daysFilterSchema)

export type StandardListWithDaysInput = z.infer<
	typeof standardListWithDaysSchema
>
