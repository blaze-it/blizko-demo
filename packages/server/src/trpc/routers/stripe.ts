import { Errors } from '@zokoli/shared'
import { z } from 'zod'
import { PaymentStatus } from '../../generated/prisma/client.js'
import { calculatePlatformFee, stripe } from '../../lib/stripe.js'
import { env } from '../../utils/env.js'
import { ensureExists } from '../lib/crud-helpers.js'
import { protectedProcedure, router } from '../trpc.js'

// =============================================================================
// ROUTER
// =============================================================================

export const stripeRouter = router({
	/**
	 * Create a Stripe Connect Express account and return the onboarding link
	 */
	createConnectAccount: protectedProcedure.mutation(async ({ ctx }) => {
		if (!stripe) {
			throw Errors.internal('Stripe is not configured')
		}

		const user = await ensureExists(
			ctx.prisma.user.findUnique({ where: { id: ctx.userId } }),
			'User',
			ctx.userId,
		)

		// If already has an account, create a new onboarding link
		if (user.stripeAccountId) {
			const accountLink = await stripe.accountLinks.create({
				account: user.stripeAccountId,
				refresh_url: `${env.FRONTEND_URL || env.CLIENT_URL}/profile?stripe=refresh`,
				return_url: `${env.FRONTEND_URL || env.CLIENT_URL}/profile?stripe=success`,
				type: 'account_onboarding',
			})

			return { url: accountLink.url }
		}

		// Create new Express account
		const account = await stripe.accounts.create({
			type: 'express',
			country: 'CZ',
			email: user.email,
			capabilities: {
				card_payments: { requested: true },
				transfers: { requested: true },
			},
			business_type: 'individual',
		})

		// Save account ID
		await ctx.prisma.user.update({
			where: { id: ctx.userId },
			data: { stripeAccountId: account.id },
		})

		// Create onboarding link
		const accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: `${env.FRONTEND_URL || env.CLIENT_URL}/profile?stripe=refresh`,
			return_url: `${env.FRONTEND_URL || env.CLIENT_URL}/profile?stripe=success`,
			type: 'account_onboarding',
		})

		return { url: accountLink.url }
	}),

	/**
	 * Check if the user's Stripe Connect account is fully onboarded
	 */
	getConnectStatus: protectedProcedure.query(async ({ ctx }) => {
		if (!stripe) {
			return { hasAccount: false, isOnboarded: false }
		}

		const user = await ensureExists(
			ctx.prisma.user.findUnique({ where: { id: ctx.userId } }),
			'User',
			ctx.userId,
		)

		if (!user.stripeAccountId) {
			return { hasAccount: false, isOnboarded: false }
		}

		// Check account status from Stripe
		const account = await stripe.accounts.retrieve(user.stripeAccountId)
		const isOnboarded = account.charges_enabled && account.payouts_enabled

		// Update local flag if status changed
		if (isOnboarded !== user.stripeOnboarded) {
			await ctx.prisma.user.update({
				where: { id: ctx.userId },
				data: { stripeOnboarded: isOnboarded },
			})
		}

		return {
			hasAccount: true,
			isOnboarded,
			chargesEnabled: account.charges_enabled,
			payoutsEnabled: account.payouts_enabled,
		}
	}),

	/**
	 * Create a link to the Stripe Express dashboard
	 */
	createDashboardLink: protectedProcedure.mutation(async ({ ctx }) => {
		if (!stripe) {
			throw Errors.internal('Stripe is not configured')
		}

		const user = await ensureExists(
			ctx.prisma.user.findUnique({ where: { id: ctx.userId } }),
			'User',
			ctx.userId,
		)

		if (!user.stripeAccountId) {
			throw Errors.validation('No Stripe account found')
		}

		const loginLink = await stripe.accounts.createLoginLink(
			user.stripeAccountId,
		)

		return { url: loginLink.url }
	}),

	/**
	 * Create a Stripe Checkout session for a paid event
	 */
	createCheckoutSession: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!stripe) {
				throw Errors.internal('Stripe is not configured')
			}

			const event = await ensureExists(
				ctx.prisma.event.findUnique({
					where: { id: input.eventId },
					include: {
						organizer: true,
						_count: { select: { participants: true } },
					},
				}),
				'Event',
				input.eventId,
			)

			// Check if event is free
			if (event.price === 0) {
				throw Errors.validation('This event is free')
			}

			// Check capacity
			if (event._count.participants >= event.capacity) {
				throw Errors.validation('This event is full')
			}

			// Check if organizer has Stripe account
			if (!event.organizer.stripeAccountId) {
				throw Errors.validation('Organizer has not set up payment processing')
			}

			// Check if user already paid
			const existingPayment = await ctx.prisma.payment.findUnique({
				where: {
					eventId_userId: {
						eventId: input.eventId,
						userId: ctx.userId,
					},
				},
			})

			if (existingPayment?.status === PaymentStatus.SUCCEEDED) {
				throw Errors.conflict('You have already paid for this event')
			}

			const user = await ensureExists(
				ctx.prisma.user.findUnique({ where: { id: ctx.userId } }),
				'User',
				ctx.userId,
			)

			// Calculate platform fee
			const platformFee = calculatePlatformFee(event.price)

			// Create Checkout session with Connect
			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				customer_email: user.email,
				line_items: [
					{
						price_data: {
							currency: event.currency.toLowerCase(),
							product_data: {
								name: event.title,
								description: `Vstupné na akci ${event.title}`,
							},
							unit_amount: event.price,
						},
						quantity: 1,
					},
				],
				payment_intent_data: {
					application_fee_amount: platformFee,
					transfer_data: {
						destination: event.organizer.stripeAccountId,
					},
				},
				success_url: `${env.FRONTEND_URL || env.CLIENT_URL}/events/${event.id}?payment=success`,
				cancel_url: `${env.FRONTEND_URL || env.CLIENT_URL}/events/${event.id}?payment=cancelled`,
				metadata: {
					eventId: event.id,
					userId: ctx.userId,
				},
			})

			// Create or update payment record
			if (existingPayment) {
				await ctx.prisma.payment.update({
					where: { id: existingPayment.id },
					data: {
						stripeSessionId: session.id,
						status: PaymentStatus.PROCESSING,
					},
				})
			} else {
				await ctx.prisma.payment.create({
					data: {
						eventId: input.eventId,
						userId: ctx.userId,
						amount: event.price,
						currency: event.currency,
						stripeSessionId: session.id,
						status: PaymentStatus.PROCESSING,
					},
				})
			}

			return { url: session.url }
		}),

	/**
	 * Check if user has paid for an event
	 */
	getPaymentStatus: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			const payment = await ctx.prisma.payment.findUnique({
				where: {
					eventId_userId: {
						eventId: input.eventId,
						userId: ctx.userId,
					},
				},
			})

			if (!payment) {
				return { hasPaid: false, status: null }
			}

			return {
				hasPaid: payment.status === PaymentStatus.SUCCEEDED,
				status: payment.status,
			}
		}),

	/**
	 * Get organizer's total earnings
	 */
	getEarnings: protectedProcedure.query(async ({ ctx }) => {
		const payments = await ctx.prisma.payment.findMany({
			where: {
				event: { organizerId: ctx.userId },
				status: PaymentStatus.SUCCEEDED,
			},
			select: {
				amount: true,
				currency: true,
			},
		})

		// Group by currency
		const earningsByCurrency = payments.reduce(
			(acc, payment) => {
				const currency = payment.currency
				if (!acc[currency]) {
					acc[currency] = 0
				}
				// Calculate earnings after platform fee
				const platformFee = calculatePlatformFee(payment.amount)
				acc[currency] += payment.amount - platformFee
				return acc
			},
			{} as Record<string, number>,
		)

		const totalPayments = payments.length

		return {
			earningsByCurrency,
			totalPayments,
		}
	}),
})
