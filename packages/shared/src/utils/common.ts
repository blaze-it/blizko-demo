/**
 * Common utilities shared across all packages
 */

/**
 * Extract error message from unknown error type
 * Works with Error objects, strings, and objects with message property
 */
export function getErrorMessage(error: unknown): string {
	if (typeof error === 'string') return error
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message
	}
	console.error('Unable to get error message for error', error)
	return 'Unknown Error'
}

/**
 * Format milliseconds to hours and minutes string (e.g., "2h 30m")
 */
export function formatHoursAndMinutes(milliseconds: number): string {
	const totalMinutes = Math.floor(milliseconds / (1000 * 60))
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60

	let result = `${hours}h`
	if (minutes > 0) {
		result += ` ${minutes}m`
	}
	return result
}

/**
 * Format seconds to human-readable duration string (e.g., "2h 30m" or "45m")
 * Returns "0m" for 0 seconds
 */
export function formatDuration(seconds: number): string {
	if (seconds === 0) return '0m'

	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)

	if (hours > 0) {
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
	}
	return `${minutes}m`
}

/**
 * Format seconds to duration with null handling (e.g., "2h 30m" or "—")
 * Returns fallback string for null/undefined
 */
export function formatDurationSafe(
	seconds: number | null | undefined,
	fallback: string = '—',
): string {
	if (seconds == null) return fallback
	return formatDuration(seconds)
}

/**
 * Format seconds to colon notation (e.g., "2:30" or "1:05:30")
 * Useful for audio/video durations
 */
export function formatDurationColon(seconds: number): string {
	const hours = Math.floor(seconds / 3600)
	const mins = Math.floor((seconds % 3600) / 60)
	const secs = Math.floor(seconds % 60)

	if (hours > 0) {
		return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format seconds to colon notation with null handling (e.g., "2:30" or "--:--")
 * Useful for audio/video durations where value may be null
 */
export function formatDurationColonSafe(
	seconds: number | null | undefined,
	fallback: string = '--:--',
): string {
	if (seconds == null) return fallback
	return formatDurationColon(seconds)
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(value: number): string {
	return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Format a number in compact form (e.g., 1.2M, 45k)
 */
export function formatCompactNumber(value: number): string {
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(1)}M`
	}
	if (value >= 1000) {
		return `${Math.round(value / 1000)}k`
	}
	return value.toString()
}

/**
 * Format value as percentage of total
 */
export function formatPercentage(value: number, total: number): string {
	if (total === 0) return '0%'
	const percentage = ((value / total) * 100).toFixed(1)
	return `${percentage}%`
}

/**
 * Calculate percentage of value relative to total
 */
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0
	return (value / total) * 100
}

/**
 * Sort array of objects by value property
 */
export function sortByValue<T extends { value: number }>(
	data: T[],
	order: 'asc' | 'desc' = 'desc',
): T[] {
	return [...data].sort((a, b) =>
		order === 'desc' ? b.value - a.value : a.value - b.value,
	)
}

/**
 * Limit data array and aggregate remaining items into "Other"
 */
export function limitData<T extends Record<string, unknown>>(
	data: T[],
	limit: number,
	otherLabel = 'Other',
	valueKey: keyof T = 'value' as keyof T,
): T[] {
	if (data.length <= limit) return data

	const topItems = data.slice(0, limit - 1)
	const otherItems = data.slice(limit - 1)
	const otherValue = otherItems.reduce((sum, item) => {
		const val = item[valueKey]
		return sum + (typeof val === 'number' ? val : 0)
	}, 0)

	if (otherValue > 0) {
		return [
			...topItems,
			{ name: otherLabel, [valueKey]: otherValue } as unknown as T,
		]
	}

	return topItems
}

/**
 * Format task duration estimate to human-readable string
 * @param duration - Object with amount and unit ('minute' | 'day')
 * @returns Formatted string like "30m", "2h", "1d", etc.
 */
export function formatTaskDuration(
	duration: {
		amount: number
		unit: 'minute' | 'day'
	} | null,
): string | null {
	if (!duration) return null

	if (duration.unit === 'day') {
		return `${duration.amount}d`
	}

	// Unit is minute
	const hours = Math.floor(duration.amount / 60)
	const minutes = duration.amount % 60

	if (hours > 0 && minutes > 0) {
		return `${hours}h ${minutes}m`
	}
	if (hours > 0) {
		return `${hours}h`
	}
	return `${minutes}m`
}
