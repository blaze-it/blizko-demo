import { Errors } from '@zokoli/shared'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc.js'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const listSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	unreadOnly: z.boolean().optional(),
})

const markAsReadSchema = z.object({
	id: z.string(),
})

const deleteSchema = z.object({
	id: z.string(),
})

// =============================================================================
// ROUTER
// =============================================================================

export const notificationsRouter = router({
	/**
	 * List paginated notifications for current user
	 */
	list: protectedProcedure.input(listSchema).query(async ({ ctx, input }) => {
		const { cursor, limit, unreadOnly } = input

		const notifications = await ctx.prisma.notification.findMany({
			where: {
				userId: ctx.userId,
				...(unreadOnly && { read: false }),
				...(cursor && { id: { lt: cursor } }),
			},
			orderBy: { createdAt: 'desc' },
			take: limit + 1,
		})

		const hasMore = notifications.length > limit
		const items = hasMore ? notifications.slice(0, limit) : notifications
		const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

		return {
			items,
			nextCursor,
		}
	}),

	/**
	 * Get count of unread notifications
	 */
	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		const count = await ctx.prisma.notification.count({
			where: {
				userId: ctx.userId,
				read: false,
			},
		})

		return { count }
	}),

	/**
	 * Mark a single notification as read
	 */
	markAsRead: protectedProcedure
		.input(markAsReadSchema)
		.mutation(async ({ ctx, input }) => {
			const { id } = input

			const notification = await ctx.prisma.notification.findUnique({
				where: { id },
			})

			if (!notification) {
				throw Errors.notFound('Notification')
			}

			if (notification.userId !== ctx.userId) {
				throw Errors.forbidden('Nemáte oprávnění k této notifikaci')
			}

			await ctx.prisma.notification.update({
				where: { id },
				data: { read: true },
			})

			return { success: true }
		}),

	/**
	 * Mark all notifications as read
	 */
	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.prisma.notification.updateMany({
			where: {
				userId: ctx.userId,
				read: false,
			},
			data: { read: true },
		})

		return { success: true }
	}),

	/**
	 * Delete a notification
	 */
	delete: protectedProcedure
		.input(deleteSchema)
		.mutation(async ({ ctx, input }) => {
			const { id } = input

			const notification = await ctx.prisma.notification.findUnique({
				where: { id },
			})

			if (!notification) {
				throw Errors.notFound('Notification')
			}

			if (notification.userId !== ctx.userId) {
				throw Errors.forbidden('Nemáte oprávnění k této notifikaci')
			}

			await ctx.prisma.notification.delete({
				where: { id },
			})

			return { success: true }
		}),
})
