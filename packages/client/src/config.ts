// API base URL - in production this points to the separate API domain
const apiUrl = import.meta.env.VITE_API_URL

// Validate API URL is set in production
if (import.meta.env.PROD && !apiUrl) {
	console.error(
		'[Config] VITE_API_URL is not set. API requests will fail. ' +
			'Please set VITE_API_URL environment variable.',
	)
}

export const API_URL = apiUrl ?? ''
