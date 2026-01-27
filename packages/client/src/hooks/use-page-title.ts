import { useEffect } from 'react'

/**
 * Custom hook to set the document title.
 * Automatically appends "- Blizko" suffix to the provided title.
 */
export function usePageTitle(title: string) {
	useEffect(() => {
		document.title = `${title} - Blizko`
	}, [title])
}
