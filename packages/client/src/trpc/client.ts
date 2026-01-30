// Import the AppRouter type from the API package

import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import type { AppRouter } from '@zokoli/server/trpc'
import superjson from 'superjson'
import { API_URL } from '@/config'

export const trpc = createTRPCReact<AppRouter>()

// Callback for 401 errors - set by AuthProvider
let onUnauthorizedCallback: (() => void) | null = null

export function setOnUnauthorized(callback: (() => void) | null) {
	onUnauthorizedCallback = callback
}

export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: `${API_URL}/api/trpc`,
			transformer: superjson,
			async fetch(url, options) {
				const response = await fetch(url, {
					...options,
					credentials: 'include',
				})

				if (response.status === 401) {
					onUnauthorizedCallback?.()
				}

				return response
			},
		}),
	],
})
