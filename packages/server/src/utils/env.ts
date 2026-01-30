import { Errors } from '@zokoli/shared'
import { z } from 'zod'

const schema = z.object({
	// Core
	NODE_ENV: z.enum(['production', 'development', 'test'] as const),
	PORT: z.coerce.number().default(4000),
	DATABASE_URL: z.string(),

	// Runtime metadata (set by npm)
	npm_package_version: z.string().default('1.0.0'),

	// Security
	BETTER_AUTH_SECRET: z.string(),

	// URLs
	CLIENT_URL: z.string().optional(),
	FRONTEND_URL: z.string().optional(),
	BETTER_AUTH_URL: z.string().optional(),
	COOKIE_DOMAIN: z.string().optional(),

	// Monitoring (optional for PoC)
	SENTRY_DSN: z.string().optional(),

	// Email (Resend)
	RESEND_API_KEY: z.string().optional(),

	// File Storage (Cloudflare R2)
	R2_ACCOUNT_ID: z.string().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_BUCKET_NAME: z.string().optional(),
	R2_PUBLIC_URL: z.string().optional(),

	// Stripe
	STRIPE_SECRET_KEY: z.string().optional(),
	STRIPE_WEBHOOK_SECRET: z.string().optional(),
	STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
})

export type Env = z.infer<typeof schema>

const parsed = schema.safeParse(process.env)

if (parsed.success === false) {
	const flatErrors = z.flattenError(parsed.error).fieldErrors
	console.error('Invalid environment variables:', flatErrors)
	throw Errors.validation(
		`Invalid environment variables: ${JSON.stringify(flatErrors)}`,
	)
}

export const env: Env = parsed.data

export function init() {}

export function getValidatedEnv(): Env {
	return env
}

export function getEnv() {
	return {
		MODE: env.NODE_ENV,
		SENTRY_DSN: env.SENTRY_DSN,
		ALLOW_INDEXING: 'true',
	}
}

type ENV = ReturnType<typeof getEnv>

declare global {
	var ENV: ENV
	interface Window {
		ENV: ENV
	}
}
