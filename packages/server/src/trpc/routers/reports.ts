import { Errors } from '@zokoli/shared'
import { z } from 'zod'
import { ensureExists } from '../lib/crud-helpers.js'
import { protectedProcedure, router } from '../trpc.js'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const reportEventSchema = z.object({
	eventId: z.string(),
	reason: z.string().min(1, 'Reason is required'),
})

const reportReviewSchema = z.object({
	reviewId: z.string(),
	reason: z.string().min(1, 'Reason is required'),
})

// =============================================================================
// ROUTER
// =============================================================================

export const reportsRouter = router({
	/**
	 * Report an event
	 */
	reportEvent: protectedProcedure
		.input(reportEventSchema)
		.mutation(async ({ ctx, input }) => {
			const { eventId, reason } = input

			// Check event exists
			await ensureExists(
				ctx.prisma.event.findUnique({ where: { id: eventId } }),
				'Event',
				eventId,
			)

			// Check if user already reported this event
			const existingReport = await ctx.prisma.report.findFirst({
				where: {
					reporterId: ctx.userId,
					eventId,
				},
			})

			if (existingReport) {
				throw Errors.conflict('Tuto událost jste již nahlásili')
			}

			// Create report
			const report = await ctx.prisma.report.create({
				data: {
					reporterId: ctx.userId,
					eventId,
					reason,
				},
			})

			return report
		}),

	/**
	 * Report a review
	 */
	reportReview: protectedProcedure
		.input(reportReviewSchema)
		.mutation(async ({ ctx, input }) => {
			const { reviewId, reason } = input

			// Check review exists
			await ensureExists(
				ctx.prisma.review.findUnique({ where: { id: reviewId } }),
				'Review',
				reviewId,
			)

			// Check if user already reported this review
			const existingReport = await ctx.prisma.report.findFirst({
				where: {
					reporterId: ctx.userId,
					reviewId,
				},
			})

			if (existingReport) {
				throw Errors.conflict('Toto hodnocení jste již nahlásili')
			}

			// Create report
			const report = await ctx.prisma.report.create({
				data: {
					reporterId: ctx.userId,
					reviewId,
					reason,
				},
			})

			return report
		}),
})
