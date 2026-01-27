/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string
	readonly VITE_SENTRY_DSN?: string
	readonly PROD: boolean
	readonly DEV: boolean
	readonly MODE: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module '*.svg' {
	const content: string
	export default content
}
