import crypto from 'node:crypto'
import { serve } from '@hono/node-server'
import { trpcServer } from '@hono/trpc-server'
import { AppError } from '@zokoli/shared'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as pinoLogger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { init as initEnv } from './utils/env.js'
import { getPort, portNumbers } from './utils/get-port.js'
import { onShutdown } from './utils/graceful-shutdown.js'

initEnv()

import { ParticipantStatus, PaymentStatus } from './generated/prisma/client.js'
import { auth } from './lib/auth.js'
import { paymentConfirmationEmail } from './lib/email-templates.js'
import { generateTicketQRCode } from './lib/qrcode.js'
import { stripe } from './lib/stripe.js'
import { createContext } from './trpc/context.js'
import { appRouter } from './trpc/routers/index.js'
import { prisma } from './utils/db.js'
import { env } from './utils/env.js'
import { logger } from './utils/logger.js'

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
			: ['http://localhost:3000', env.FRONTEND_URL ?? ''].filter(Boolean),
		credentials: true,
		allowHeaders: ['Content-Type', 'Authorization'],
	}),
)

// Health check
app.get('/health', async (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// =============================================================================
// OG Meta Tags Route for Social Media Sharing
// =============================================================================
app.get('/og/events/:id', async (c) => {
	const eventId = c.req.param('id')
	const frontendUrl = env.FRONTEND_URL || env.CLIENT_URL || 'http://localhost:5173'

	try {
		const event = await prisma.event.findUnique({
			where: { id: eventId },
			select: {
				id: true,
				title: true,
				description: true,
				imageUrl: true,
				date: true,
				locationName: true,
			},
		})

		if (!event) {
			// Return fallback OG tags for non-existent events
			return c.html(`<!DOCTYPE html>
<html lang="cs">
<head>
	<meta charset="UTF-8">
	<meta property="og:title" content="Udalost nenalezena | Zokoli">
	<meta property="og:description" content="Tato udalost neexistuje nebo byla odstranena.">
	<meta property="og:type" content="website">
	<meta property="og:url" content="${frontendUrl}/events/${eventId}">
	<meta property="og:site_name" content="Zokoli">
	<meta name="twitter:card" content="summary">
	<meta http-equiv="refresh" content="0;url=${frontendUrl}/events/${eventId}">
	<title>Udalost nenalezena | Zokoli</title>
</head>
<body>
	<p>Presmerovani na <a href="${frontendUrl}/events/${eventId}">${frontendUrl}/events/${eventId}</a></p>
</body>
</html>`)
		}

		// Format date for display
		const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		}).format(new Date(event.date))

		// Truncate description for OG tag (recommended max ~200 chars)
		const truncatedDescription = event.description.length > 200
			? `${event.description.slice(0, 197)}...`
			: event.description

		const ogDescription = `${formattedDate} | ${event.locationName} - ${truncatedDescription}`

		// Default image if event has no image
		const ogImage = event.imageUrl || `${frontendUrl}/og-default.png`

		const eventUrl = `${frontendUrl}/events/${event.id}`

		return c.html(`<!DOCTYPE html>
<html lang="cs">
<head>
	<meta charset="UTF-8">
	<meta property="og:title" content="${escapeHtml(event.title)} | Zokoli">
	<meta property="og:description" content="${escapeHtml(ogDescription)}">
	<meta property="og:image" content="${escapeHtml(ogImage)}">
	<meta property="og:url" content="${eventUrl}">
	<meta property="og:type" content="website">
	<meta property="og:site_name" content="Zokoli">
	<meta property="og:locale" content="cs_CZ">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="${escapeHtml(event.title)} | Zokoli">
	<meta name="twitter:description" content="${escapeHtml(ogDescription)}">
	<meta name="twitter:image" content="${escapeHtml(ogImage)}">
	<meta http-equiv="refresh" content="0;url=${eventUrl}">
	<title>${escapeHtml(event.title)} | Zokoli</title>
</head>
<body>
	<p>Presmerovani na <a href="${eventUrl}">${eventUrl}</a></p>
</body>
</html>`)
	} catch (error) {
		logger.error('Error fetching event for OG tags', error)
		return c.html(`<!DOCTYPE html>
<html lang="cs">
<head>
	<meta charset="UTF-8">
	<meta property="og:title" content="Zokoli">
	<meta property="og:description" content="Objevujte a vytvářejte lokální mikro-události ve vašem okolí">
	<meta property="og:type" content="website">
	<meta property="og:url" content="${frontendUrl}">
	<meta property="og:site_name" content="Zokoli">
	<meta http-equiv="refresh" content="0;url=${frontendUrl}/events/${eventId}">
	<title>Zokoli</title>
</head>
<body>
	<p>Presmerovani na <a href="${frontendUrl}/events/${eventId}">${frontendUrl}/events/${eventId}</a></p>
</body>
</html>`)
	}
})

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

// =============================================================================
// Stripe Webhook Handler (before body parsing)
// =============================================================================
app.post('/api/webhooks/stripe', async (c) => {
	if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
		logger.warn('Stripe webhook received but Stripe is not configured')
		return c.json({ error: 'Stripe not configured' }, 400)
	}

	const signature = c.req.header('stripe-signature')
	if (!signature) {
		logger.warn('Stripe webhook missing signature')
		return c.json({ error: 'Missing signature' }, 400)
	}

	let event
	try {
		const rawBody = await c.req.text()
		event = stripe.webhooks.constructEvent(
			rawBody,
			signature,
			env.STRIPE_WEBHOOK_SECRET,
		)
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		logger.error(`Stripe webhook signature verification failed: ${message}`)
		return c.json({ error: 'Invalid signature' }, 400)
	}

	logger.info(`Stripe webhook received: ${event.type}`)

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object
				const eventId = session.metadata?.eventId
				const userId = session.metadata?.userId

				if (!eventId || !userId) {
					logger.error('Checkout session missing metadata')
					break
				}

				// Update payment status
				const payment = await prisma.payment.findUnique({
					where: { stripeSessionId: session.id },
				})

				if (payment) {
					await prisma.payment.update({
						where: { id: payment.id },
						data: {
							status: PaymentStatus.SUCCEEDED,
							stripePaymentIntentId:
								typeof session.payment_intent === 'string'
									? session.payment_intent
									: session.payment_intent?.id,
						},
					})

					// Create EventParticipant
					let participant = await prisma.eventParticipant.findUnique({
						where: {
							eventId_userId: { eventId, userId },
						},
					})

					if (!participant) {
						participant = await prisma.eventParticipant.create({
							data: {
								eventId,
								userId,
								status: ParticipantStatus.CONFIRMED,
							},
						})
					}

					// Send confirmation email with QR code
					const eventData = await prisma.event.findUnique({
						where: { id: eventId },
					})
					const user = await prisma.user.findUnique({
						where: { id: userId },
					})

					if (eventData && user && participant) {
						// Generate QR code for the ticket
						const qrCodeDataUrl = await generateTicketQRCode(participant.id)

						await paymentConfirmationEmail({
							to: user.email,
							userName: user.name || 'uzivateli',
							eventTitle: eventData.title,
							eventDate: new Intl.DateTimeFormat('cs-CZ', {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).format(new Date(eventData.date)),
							amount: payment.amount,
							currency: payment.currency,
							qrCodeDataUrl,
						})
					}

					logger.info(
						`Payment completed for event ${eventId} by user ${userId}`,
					)
				}
				break
			}

			case 'charge.refunded': {
				const charge = event.data.object
				const paymentIntentId =
					typeof charge.payment_intent === 'string'
						? charge.payment_intent
						: charge.payment_intent?.id

				if (paymentIntentId) {
					const payment = await prisma.payment.findUnique({
						where: { stripePaymentIntentId: paymentIntentId },
					})

					if (payment) {
						await prisma.payment.update({
							where: { id: payment.id },
							data: { status: PaymentStatus.REFUNDED },
						})
						logger.info(`Payment ${payment.id} refunded`)
					}
				}
				break
			}

			default:
				logger.info(`Unhandled webhook event type: ${event.type}`)
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		logger.error(`Error processing Stripe webhook: ${message}`)
		return c.json({ error: 'Webhook processing failed' }, 500)
	}

	return c.json({ received: true })
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
			error: IS_PROD
				? 'An unexpected error occurred'
				: err.message || 'Internal Server Error',
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
		logger.info(`Zokoli API server running on http://localhost:${info.port}`)
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
