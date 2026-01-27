import crypto from 'node:crypto'
import { serve } from '@hono/node-server'
import { trpcServer } from '@hono/trpc-server'
import { AppError } from '@blizko/shared'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger as pinoLogger } from 'hono/logger'
import { init as initEnv } from './utils/env.js'
import { getPort, portNumbers } from './utils/get-port.js'
import { onShutdown } from './utils/graceful-shutdown.js'

initEnv()

import { logger } from './utils/logger.js'
import { auth } from './lib/auth.js'
import { createContext } from './trpc/context.js'
import { appRouter } from './trpc/routers/index.js'
import { prisma } from './utils/db.js'
import { env } from './utils/env.js'

const MODE = env.NODE_ENV
const IS_PROD = MODE === 'production'
const IS_DEV = MODE === 'development'

const app = new Hono()

// Generate CSP nonce for each request
app.use('*', async (c, next) => {
	c.set('secureHeadersNonce', crypto.randomBytes(16).toString('hex'))
	await next()
})

// HTTP request logging
app.use('*', pinoLogger())

// Security headers
app.use(
	'*',
	secureHeaders({
		xXssProtection: '0',
		xContentTypeOptions: 'nosniff',
		referrerPolicy: 'strict-origin-when-cross-origin',
		xFrameOptions: 'DENY',
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: false,
	}),
)

// CORS
app.use(
	'*',
	cors({
		origin: IS_DEV
			? ['http://localhost:3000', 'http://localhost:5173']
			: [
					'http://localhost:3000',
					env.FRONTEND_URL ?? '',
				].filter(Boolean),
		credentials: true,
		allowHeaders: ['Content-Type', 'Authorization'],
	}),
)

// Health check
app.get('/health', async (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// tRPC API Route
app.use('/api/trpc/*', async (c, next) => {
	const handler = trpcServer({
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: ({ req }) =>
			createContext({
				request: req as unknown as Request,
			}),
		onError: ({ error, path }) => {
			logger.error(`tRPC error: ${path ?? 'unknown'}`, error)
		},
	})

	return handler(c, next)
})

// BetterAuth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Error handling
app.onError((err, c) => {
	if (err instanceof AppError) {
		logger.warn(`HTTP error: ${c.req.method} ${c.req.path}`)
		return c.json(
			{ error: err.message, code: err.code },
			err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500,
		)
	}

	logger.error(`HTTP error: ${c.req.method} ${c.req.path}`, err)
	return c.json(
		{
			error: IS_PROD ? 'An unexpected error occurred' : err.message || 'Internal Server Error',
			code: 'INTERNAL',
		},
		500,
	)
})

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404)
})

// Start server
const desiredPort = env.PORT
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})

const server = serve(
	{
		fetch: app.fetch,
		port: portToUse,
	},
	(info) => {
		logger.info(`Blizko API server running on http://localhost:${info.port}`)
	},
)

onShutdown(async ({ err }) => {
	logger.info('Shutting down server...')
	await prisma.$disconnect()
	server.close()
	if (err) {
		logger.error('Server shutdown error', err)
	}
	logger.info('Server shutdown complete')
})

export default app
