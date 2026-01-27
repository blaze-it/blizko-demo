/**
 * Shared date utilities
 */

import type { TaskDue } from '../types/task.js'

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Format a Date object to ISO datetime string
 */
export function formatDateTime(date: Date): string {
	return date.toISOString()
}

/**
 * Get today's date at midnight (local time)
 */
export function getToday(): Date {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	return today
}

/**
 * Get tomorrow's date at midnight (local time)
 */
export function getTomorrow(): Date {
	const tomorrow = getToday()
	tomorrow.setDate(tomorrow.getDate() + 1)
	return tomorrow
}

/**
 * Check if a date string represents today or is overdue
 */
export function isOverdueOrToday(dateStr: string): boolean {
	const dueDate = new Date(dateStr)
	dueDate.setHours(0, 0, 0, 0)
	const today = getToday()
	return dueDate <= today
}

/**
 * Check if a date string represents an overdue date (before today)
 */
export function isOverdue(dateStr: string): boolean {
	const dueDate = new Date(dateStr)
	dueDate.setHours(0, 0, 0, 0)
	const today = getToday()
	return dueDate < today
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr: string): boolean {
	const dueDate = new Date(dateStr)
	dueDate.setHours(0, 0, 0, 0)
	return dueDate.getTime() === getToday().getTime()
}

/**
 * Check if a date string represents tomorrow
 */
export function isTomorrow(dateStr: string): boolean {
	const dueDate = new Date(dateStr)
	dueDate.setHours(0, 0, 0, 0)
	return dueDate.getTime() === getTomorrow().getTime()
}

export interface DueDateInfo {
	text: string
	isOverdue: boolean
}

/**
 * Format a TaskDue object to a human-readable string with overdue status
 * Returns relative dates like "Today", "Tomorrow", weekday for this week,
 * or formatted date for other dates.
 */
export function formatDueDate(
	due: TaskDue | null | undefined,
): DueDateInfo | null {
	if (!due?.date) return null

	const dueDate = new Date(due.date)
	const today = getToday()
	const tomorrow = getTomorrow()

	const dueDay = new Date(dueDate)
	dueDay.setHours(0, 0, 0, 0)

	const overdueStatus = dueDay < today

	// Today
	if (dueDay.getTime() === today.getTime()) {
		return { text: 'Today', isOverdue: false }
	}

	// Tomorrow
	if (dueDay.getTime() === tomorrow.getTime()) {
		return { text: 'Tomorrow', isOverdue: false }
	}

	// Overdue - show short date
	if (overdueStatus) {
		return {
			text: dueDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			}),
			isOverdue: true,
		}
	}

	// Check if within this week - show weekday
	const endOfWeek = new Date(today)
	endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))

	if (dueDay <= endOfWeek) {
		return {
			text: dueDate.toLocaleDateString('en-US', { weekday: 'short' }),
			isOverdue: false,
		}
	}

	// Other dates - show short date
	return {
		text: dueDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		}),
		isOverdue: false,
	}
}

/**
 * Format a date string for display (weekday, month day)
 * Example: "Thu, Jan 16"
 */
export function formatDateDisplay(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	})
}

/**
 * Format a date for short display (month day, year)
 * Example: "Jan 16, 2025"
 */
export function formatDateShort(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

/**
 * Format a date for long display (weekday, month day, year)
 * Example: "Thu, Jan 16, 2025"
 */
export function formatDateLong(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

/**
 * Format a date with time (weekday, month day, time)
 * Example: "Thu, Jan 16, 10:30 AM"
 */
export function formatDateWithTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

/**
 * Format a date for full display (full weekday, full month day, year)
 * Example: "Thursday, January 16, 2025"
 */
export function formatDateFull(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

/**
 * Format a date/time shortly (month day, year, hour:minute)
 * Example: "Jan 16, 2025, 10:30 AM"
 */
export function formatDateTimeShort(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

/**
 * Format a date/time with full details (month day, year, hour:minute:second)
 * Example: "Jan 16, 2025, 10:30:45 AM"
 */
export function formatDateTimeFull(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

/**
 * Format a date showing only month and year
 * Example: "Jan 2025"
 */
export function formatMonthYear(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric',
	})
}

/**
 * Format a date compactly (month day only, no year)
 * Example: "Jan 16"
 */
export function formatDateCompact(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	})
}

/**
 * Format a date for full display with time (full weekday, full month day, year, time)
 * Example: "Thursday, January 16, 2025, 10:30 AM"
 */
export function formatDateFullWithTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

/**
 * Convert a Date to ISO date string (YYYY-MM-DD format) in UTC timezone.
 * Note: This uses UTC, not local timezone. For local timezone, use formatDate().
 *
 * @param date - Date object to format
 * @returns ISO date string (e.g., "2025-01-16")
 */
export function toDateString(date: Date): string {
	return date.toISOString().split('T')[0]
}

/**
 * Get today's date as ISO string (YYYY-MM-DD) in UTC timezone.
 * Note: This uses UTC, not local timezone.
 */
export function todayString(): string {
	return toDateString(new Date())
}
