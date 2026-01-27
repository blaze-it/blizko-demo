import { useEffect, useState } from 'react'

/**
 * Hook that debounces a value by the specified delay.
 * Useful for search inputs where you want to delay API calls
 * until the user stops typing.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(timer)
		}
	}, [value, delay])

	return debouncedValue
}
