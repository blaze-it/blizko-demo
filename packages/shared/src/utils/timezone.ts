/**
 * Shared timezone utilities for consistent timezone handling across the app.
 *
 * TIMEZONE STRATEGY:
 * - Store: All timestamps stored in UTC in database
 * - Store: IANA timezone stored alongside timestamp (e.g., "Europe/Prague")
 * - Display: Convert to original timezone for display
 * - Auto-detect: Browser timezone used for new entries
 */

import { z } from 'zod'

/**
 * Branded type for validated IANA timezone identifiers.
 * Use isValidTimezone() type guard to narrow string to ValidatedTimezone.
 */
export type ValidatedTimezone = string & {
	readonly __brand: 'ValidatedTimezone'
}

/**
 * Common IANA timezone identifiers for quick reference.
 * Full list at: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
export const COMMON_TIMEZONES = [
	'UTC',
	'Europe/London',
	'Europe/Paris',
	'Europe/Berlin',
	'Europe/Prague',
	'Europe/Warsaw',
	'Europe/Moscow',
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'America/Toronto',
	'America/Sao_Paulo',
	'Asia/Tokyo',
	'Asia/Seoul',
	'Asia/Shanghai',
	'Asia/Hong_Kong',
	'Asia/Singapore',
	'Asia/Dubai',
	'Asia/Kolkata',
	'Australia/Sydney',
	'Australia/Melbourne',
	'Pacific/Auckland',
] as const

export type CommonTimezone = (typeof COMMON_TIMEZONES)[number]

/**
 * Validate if a string is a valid IANA timezone identifier.
 * Uses Intl.DateTimeFormat which is available in all modern browsers and Node.js.
 * This is a type guard that narrows string to ValidatedTimezone.
 */
export function isValidTimezone(
	timezone: string,
): timezone is ValidatedTimezone {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: timezone })
		return true
	} catch {
		return false
	}
}

/**
 * Validate timezone and throw if invalid.
 * Use this at boundaries where you want to fail fast.
 */
export function assertValidTimezone(
	timezone: string,
): asserts timezone is ValidatedTimezone {
	if (!isValidTimezone(timezone)) {
		throw new Error(
			`Invalid IANA timezone identifier: "${timezone}". ` +
				'Expected format like "America/New_York" or "Europe/London".',
		)
	}
}

/**
 * Shared Zod schema for timezone validation.
 * Use this in tRPC routers and MCP tools for consistent validation.
 */
export const timezoneSchema = z
	.string()
	.refine((tz): tz is ValidatedTimezone => isValidTimezone(tz), {
		message: 'Invalid IANA timezone identifier',
	})

/**
 * Optional timezone schema - validates if provided, allows undefined.
 */
export const optionalTimezoneSchema = timezoneSchema.optional()

/**
 * Get timezone abbreviation (e.g., "CET", "EST", "JST") for a given IANA timezone.
 * Note: Abbreviations can vary by date due to DST.
 */
export function getTimezoneAbbreviation(
	timezone: string,
	date: Date = new Date(),
): string {
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'short',
		})
		const parts = formatter.formatToParts(date)
		const tzPart = parts.find((part) => part.type === 'timeZoneName')
		return tzPart?.value ?? timezone
	} catch (error) {
		// Log when fallback is used - indicates a bug in caller
		console.warn(
			`[timezone] Failed to get abbreviation for "${timezone}", returning identifier as fallback`,
			error instanceof Error ? error.message : error,
		)
		return timezone
	}
}

/**
 * Get full timezone name (e.g., "Central European Time") for a given IANA timezone.
 */
export function getTimezoneName(
	timezone: string,
	date: Date = new Date(),
): string {
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'long',
		})
		const parts = formatter.formatToParts(date)
		const tzPart = parts.find((part) => part.type === 'timeZoneName')
		return tzPart?.value ?? timezone
	} catch (error) {
		console.warn(
			`[timezone] Failed to get name for "${timezone}", returning identifier as fallback`,
			error instanceof Error ? error.message : error,
		)
		return timezone
	}
}

/**
 * Get UTC offset string (e.g., "+01:00", "-05:00") for a given IANA timezone.
 * Note: Offset varies by date due to DST.
 *
 * WARNING: If this function returns the fallback "+00:00" for an invalid timezone,
 * times will be shifted by the full offset amount. Validate timezones at boundaries.
 */
export function getTimezoneOffset(
	timezone: string,
	date: Date = new Date(),
): string {
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'longOffset',
		})
		const parts = formatter.formatToParts(date)
		const tzPart = parts.find((part) => part.type === 'timeZoneName')
		// Returns something like "GMT+01:00", extract the offset part
		const value = tzPart?.value ?? 'GMT+00:00'
		return value.replace('GMT', '') || '+00:00'
	} catch (error) {
		// This is dangerous - returning +00:00 silently shifts times
		// Log at warning level to catch issues
		console.warn(
			`[timezone] Failed to get offset for "${timezone}", defaulting to +00:00. ` +
				'This may cause incorrect time display.',
			error instanceof Error ? error.message : error,
		)
		return '+00:00'
	}
}

/**
 * Format timezone for display (e.g., "Europe/Prague (CET, +01:00)").
 */
export function formatTimezoneDisplay(
	timezone: string,
	date: Date = new Date(),
): string {
	const abbr = getTimezoneAbbreviation(timezone, date)
	const offset = getTimezoneOffset(timezone, date)
	// Make the IANA ID more readable
	const displayName = timezone.replace(/_/g, ' ').replace('/', ' / ')
	return `${displayName} (${abbr}, ${offset})`
}

/**
 * Format timezone for compact display (e.g., "CET +01:00").
 */
export function formatTimezoneCompact(
	timezone: string,
	date: Date = new Date(),
): string {
	const abbr = getTimezoneAbbreviation(timezone, date)
	const offset = getTimezoneOffset(timezone, date)
	return `${abbr} ${offset}`
}

/**
 * Get the browser's current timezone.
 * Returns IANA timezone string (e.g., "Europe/Prague").
 * Falls back to "UTC" if detection fails.
 */
export function getBrowserTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	} catch (error) {
		console.warn(
			'[timezone] Failed to detect browser timezone, defaulting to UTC',
			error instanceof Error ? error.message : error,
		)
		return 'UTC'
	}
}

/**
 * Parse a local datetime string in a specific timezone and return UTC Date.
 * Input: "2024-01-18T09:00" (no Z suffix) + "Asia/Tokyo"
 * Output: UTC Date representing 9am Tokyo time
 *
 * This is useful for form inputs where user enters time in their local timezone.
 *
 * @throws Error if timezone is invalid or datetime string is malformed
 */
export function parseLocalDateTime(
	localDateTimeStr: string,
	timezone: string,
): Date {
	// Validate timezone first for clear error messages
	if (!isValidTimezone(timezone)) {
		throw new Error(
			`Invalid timezone identifier "${timezone}". ` +
				'Expected IANA format like "America/New_York".',
		)
	}

	// Parse the local datetime string
	const [datePart, timePart] = localDateTimeStr.split('T')
	if (!datePart) {
		throw new Error(`Invalid datetime string: ${localDateTimeStr}`)
	}

	const [year, month, day] = datePart.split('-').map(Number)
	const [hours, minutes, seconds] = (timePart ?? '00:00:00')
		.split(':')
		.map(Number)

	if (
		year === undefined ||
		month === undefined ||
		day === undefined ||
		hours === undefined ||
		minutes === undefined
	) {
		throw new Error(`Invalid datetime string: ${localDateTimeStr}`)
	}

	// Get the offset for this timezone at the given local time
	// We need to create a rough date first to get the correct offset
	const roughDate = new Date(year, month - 1, day, hours, minutes, seconds ?? 0)

	// Use Intl to get the offset
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	})

	// Calculate offset by comparing formatted time with UTC
	const utcDate = new Date(
		Date.UTC(year, month - 1, day, hours, minutes, seconds ?? 0),
	)
	const tzParts = formatter.formatToParts(utcDate)

	const tzYear = Number(tzParts.find((p) => p.type === 'year')?.value)
	const tzMonth = Number(tzParts.find((p) => p.type === 'month')?.value)
	const tzDay = Number(tzParts.find((p) => p.type === 'day')?.value)
	const tzHour = Number(tzParts.find((p) => p.type === 'hour')?.value)
	const tzMinute = Number(tzParts.find((p) => p.type === 'minute')?.value)

	// Calculate offset in minutes
	const tzTime = new Date(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute)
	const localTime = new Date(year, month - 1, day, hours, minutes)
	const offsetMs = roughDate.getTime() - tzTime.getTime()

	// Apply the offset to get UTC
	return new Date(localTime.getTime() - offsetMs)
}

/**
 * Convert a UTC Date to a local datetime string in a specific timezone.
 * Output format: "2024-01-18T09:00:00" (suitable for datetime-local inputs)
 *
 * @throws Error if timezone is invalid or date is invalid
 */
export function toLocalDateTime(utcDate: Date, timezone: string): string {
	// Validate inputs
	if (!isValidTimezone(timezone)) {
		throw new Error(`Invalid timezone: ${timezone}`)
	}
	if (Number.isNaN(utcDate.getTime())) {
		throw new Error('Invalid date provided to toLocalDateTime')
	}

	const formatter = new Intl.DateTimeFormat('sv-SE', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	})

	// sv-SE locale formats as YYYY-MM-DD HH:mm:ss
	const formatted = formatter.format(utcDate)
	// Convert to ISO-like format
	return formatted.replace(' ', 'T')
}

/**
 * Get the current local time as a datetime-local string in a specific timezone.
 *
 * @throws Error if timezone is invalid
 */
export function nowLocalDateTime(timezone: string): string {
	return toLocalDateTime(new Date(), timezone)
}

/**
 * Default timezone to use when none is specified.
 * In browser: detected from browser
 * In Node.js: process.env.TZ or UTC
 */
export function getDefaultTimezone(): string {
	// Check if running in browser (window exists and has Intl)
	if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
		return getBrowserTimezone()
	}
	// In Node.js, use TZ env var or fall back to UTC
	return process.env.TZ ?? 'UTC'
}
