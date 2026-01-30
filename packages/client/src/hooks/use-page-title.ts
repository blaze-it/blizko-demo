import { useEffect } from 'react'

/**
 * Custom hook to set the document title.
 * Automatically appends "- Zokoli" suffix to the provided title.
 */
export function usePageTitle(title: string) {
	useEffect(() => {
		document.title = `${title} - Zokoli`
	}, [title])
}
