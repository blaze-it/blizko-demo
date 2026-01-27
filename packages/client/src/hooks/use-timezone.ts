import { getBrowserTimezone } from '@blizko/shared'
import { useMemo } from 'react'

/**
 * Hook to get the current browser timezone.
 * Returns the IANA timezone identifier (e.g., "Europe/Prague", "America/New_York")
 */
export function useTimezone(): string {
	return useMemo(() => getBrowserTimezone(), [])
}
