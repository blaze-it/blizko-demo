/**
 * Client-side hints utilities for SPA mode.
 * These return client-side values since there's no server loader.
 */

interface ClientHints {
	theme: 'light' | 'dark'
	timeZone: string
}

function getClientHints(): ClientHints {
	// Read theme from cookie or default to dark
	const cookieValue = typeof document !== 'undefined' ? document.cookie : ''
	const themeMatch = cookieValue.match(/CH-prefers-color-scheme=([^;]+)/)
	const theme = themeMatch?.[1] === 'light' ? 'light' : 'dark'

	// Get timezone from browser
	const timeZone =
		typeof Intl !== 'undefined'
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: 'UTC'

	return { theme, timeZone }
}

/**
 * Hook to get client hints (theme, timezone)
 */
export function useHints(): ClientHints {
	return getClientHints()
}
