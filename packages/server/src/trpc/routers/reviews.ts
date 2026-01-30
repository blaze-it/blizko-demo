import { Errors } from '@blizko/shared'
import { z } from 'zod'
import { EventStatus, ParticipantStatus } from '../../generated/prisma/client.js'
import { ensureExists } from '../lib/crud-helpers.js'
import { protectedProcedure, publicProcedure, router } from '../trpc.js'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const createReviewSchema = z.object({
	eventId: z.string(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().optional(),
})

const getByEventSchema = z.object({
	eventId: z.string(),
})

const getOrganizerRatingSchema = z.object({
	organizerId: z.string(),
})

const canReviewSchema = z.object({
	eventId: z.string(),
})

const deleteReviewSchema = z.object({
	eventId: z.string(),
})

// =============================================================================
// ROUTER
// =============================================================================

export const reviewsRouter = router({
	/**
	 * Create a review for an event
	 * Only past participants can review (event must be completed or past date)
	 */
	create: protectedProcedure
		.input(createReviewSchema)
		.mutation(async ({ ctx, input }) => {
			const { eventId, rating, comment } = input

			// Check event exists
			const event = await ensureExists(
				ctx.prisma.event.findUnique({ where: { id: eventId } }),
				'Event',
				eventId,
			)

			// Check if event is in the past or completed
			const isPastEvent =
				event.status === EventStatus.COMPLETED ||
				new Date(event.date) < new Date()

			if (!isPastEvent) {
				throw Errors.forbidden(
					'Hodnotit lze pouze uplynulé události',
				)
			}

			// Check if user participated in the event
			const participation = await ctx.prisma.eventParticipant.findUnique({
				where: {
					eventId_userId: {
						eventId,
						userId: ctx.userId,
					},
				},
			})

			if (!participation || participation.status !== ParticipantStatus.CONFIRMED) {
				throw Errors.forbidden(
					'Hodnotit mohou pouze potvrzení účastníci',
				)
			}

			// Check if user already reviewed
			const existingReview = await ctx.prisma.review.findUnique({
				where: {
					eventId_reviewerId: {
						eventId,
						reviewerId: ctx.userId,
					},
				},
			})

			if (existingReview) {
				throw Errors.conflict('Tuto událost jste již ohodnotili')
			}

			// Create review
			const review = await ctx.prisma.review.create({
				data: {
					eventId,
					reviewerId: ctx.userId,
					rating,
					comment: comment || null,
				},
				include: {
					reviewer: { select: { id: true, name: true } },
				},
			})

			return review
		}),

	/**
	 * Get all reviews for an event with average rating
	 */
	getByEvent: publicProcedure
		.input(getByEventSchema)
		.query(async ({ ctx, input }) => {
			const { eventId } = input

			// Verify event exists
			await ensureExists(
				ctx.prisma.event.findUnique({ where: { id: eventId } }),
				'Event',
				eventId,
			)

			const reviews = await ctx.prisma.review.findMany({
				where: { eventId },
				include: {
					reviewer: { select: { id: true, name: true } },
				},
				orderBy: { createdAt: 'desc' },
			})

			// Calculate average rating
			const avgRating =
				reviews.length > 0
					? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
					: null

			return {
				reviews,
				avgRating,
				count: reviews.length,
			}
		}),

	/**
	 * Get aggregate rating for an organizer across all their events
	 */
	getOrganizerRating: publicProcedure
		.input(getOrganizerRatingSchema)
		.query(async ({ ctx, input }) => {
			const { organizerId } = input

			// Get all reviews for events organized by this user
			const reviews = await ctx.prisma.review.findMany({
				where: {
					event: {
						organizerId,
					},
				},
				select: {
					rating: true,
				},
			})

			if (reviews.length === 0) {
				return {
					avgRating: null,
					totalReviews: 0,
				}
			}

			const avgRating =
				reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

			return {
				avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
				totalReviews: reviews.length,
			}
		}),

	/**
	 * Check if the current user can review an event
	 */
	canReview: protectedProcedure
		.input(canReviewSchema)
		.query(async ({ ctx, input }) => {
			const { eventId } = input

			// Check event exists
			const event = await ctx.prisma.event.findUnique({
				where: { id: eventId },
			})

			if (!event) {
				return { canReview: false, reason: 'event_not_found' as const }
			}

			// Check if event is in the past or completed
			const isPastEvent =
				event.status === EventStatus.COMPLETED ||
				new Date(event.date) < new Date()

			if (!isPastEvent) {
				return { canReview: false, reason: 'event_not_past' as const }
			}

			// Check if user participated
			const participation = await ctx.prisma.eventParticipant.findUnique({
				where: {
					eventId_userId: {
						eventId,
						userId: ctx.userId,
					},
				},
			})

			if (!participation || participation.status !== ParticipantStatus.CONFIRMED) {
				return { canReview: false, reason: 'not_participant' as const }
			}

			// Check if already reviewed
			const existingReview = await ctx.prisma.review.findUnique({
				where: {
					eventId_reviewerId: {
						eventId,
						reviewerId: ctx.userId,
					},
				},
			})

			if (existingReview) {
				return { canReview: false, reason: 'already_reviewed' as const }
			}

			return { canReview: true, reason: null }
		}),

	/**
	 * Delete own review
	 */
	delete: protectedProcedure
		.input(deleteReviewSchema)
		.mutation(async ({ ctx, input }) => {
			const { eventId } = input

			const review = await ctx.prisma.review.findUnique({
				where: {
					eventId_reviewerId: {
						eventId,
						reviewerId: ctx.userId,
					},
				},
			})

			if (!review) {
				throw Errors.notFound('Review')
			}

			await ctx.prisma.review.delete({
				where: {
					eventId_reviewerId: {
						eventId,
						reviewerId: ctx.userId,
					},
				},
			})

			return { success: true }
		}),
})
