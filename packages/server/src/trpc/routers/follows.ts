import { Errors } from '@zokoli/shared'
import { z } from 'zod'
import { EventStatus, NotificationType } from '../../generated/prisma/client.js'
import { newFollowerEmail } from '../../lib/email-templates.js'
import { env } from '../../utils/env.js'
import { ensureExists } from '../lib/crud-helpers.js'
import { protectedProcedure, publicProcedure, router } from '../trpc.js'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const followSchema = z.object({
	userId: z.string(),
})

const isFollowingSchema = z.object({
	userId: z.string(),
})

const getFollowersSchema = z.object({
	userId: z.string(),
	cursor: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
})

const getFollowingSchema = z.object({
	userId: z.string(),
	cursor: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
})

const getCountsSchema = z.object({
	userId: z.string(),
})

const getFeedSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
})

// =============================================================================
// ROUTER
// =============================================================================

export const followsRouter = router({
	/**
	 * Follow a user
	 * Creates a Follow record + Notification + sends email
	 */
	follow: protectedProcedure
		.input(followSchema)
		.mutation(async ({ ctx, input }) => {
			const { userId: followingId } = input

			// Cannot follow yourself
			if (followingId === ctx.userId) {
				throw Errors.validation('Nemůžete sledovat sami sebe')
			}

			// Check if user to follow exists
			const userToFollow = await ensureExists(
				ctx.prisma.user.findUnique({
					where: { id: followingId },
					select: { id: true, name: true, email: true },
				}),
				'User',
				followingId,
			)

			// Check if already following
			const existingFollow = await ctx.prisma.follow.findUnique({
				where: {
					followerId_followingId: {
						followerId: ctx.userId,
						followingId,
					},
				},
			})

			if (existingFollow) {
				throw Errors.conflict('Tohoto uživatele již sledujete')
			}

			// Get follower info for notification and email
			const follower = await ctx.prisma.user.findUnique({
				where: { id: ctx.userId },
				select: { id: true, name: true },
			})

			// Create follow
			const follow = await ctx.prisma.follow.create({
				data: {
					followerId: ctx.userId,
					followingId,
				},
			})

			// Create notification for the followed user
			await ctx.prisma.notification.create({
				data: {
					type: NotificationType.NEW_FOLLOWER,
					title: 'Nový sledující',
					body: `${follower?.name || 'Někdo'} vás nyní sleduje`,
					data: { followerId: ctx.userId, followerName: follower?.name },
					userId: followingId,
				},
			})

			// Send email notification
			const appUrl =
				env.CLIENT_URL || env.FRONTEND_URL || 'http://localhost:5173'
			await newFollowerEmail({
				to: userToFollow.email,
				userName: userToFollow.name || 'uživateli',
				followerName: follower?.name || 'Někdo',
				followerProfileUrl: `${appUrl}/users/${ctx.userId}`,
			})

			return follow
		}),

	/**
	 * Unfollow a user
	 */
	unfollow: protectedProcedure
		.input(followSchema)
		.mutation(async ({ ctx, input }) => {
			const { userId: followingId } = input

			const follow = await ctx.prisma.follow.findUnique({
				where: {
					followerId_followingId: {
						followerId: ctx.userId,
						followingId,
					},
				},
			})

			if (!follow) {
				throw Errors.notFound('Follow')
			}

			await ctx.prisma.follow.delete({
				where: {
					followerId_followingId: {
						followerId: ctx.userId,
						followingId,
					},
				},
			})

			return { success: true }
		}),

	/**
	 * Check if current user follows someone
	 */
	isFollowing: protectedProcedure
		.input(isFollowingSchema)
		.query(async ({ ctx, input }) => {
			const { userId: followingId } = input

			const follow = await ctx.prisma.follow.findUnique({
				where: {
					followerId_followingId: {
						followerId: ctx.userId,
						followingId,
					},
				},
			})

			return { isFollowing: !!follow }
		}),

	/**
	 * Get list of followers for a user
	 */
	getFollowers: publicProcedure
		.input(getFollowersSchema)
		.query(async ({ ctx, input }) => {
			const { userId, cursor, limit } = input

			const followers = await ctx.prisma.follow.findMany({
				where: {
					followingId: userId,
					...(cursor && { id: { gt: cursor } }),
				},
				orderBy: { createdAt: 'desc' },
				take: limit + 1,
				include: {
					follower: {
						select: { id: true, name: true, neighborhood: true },
					},
				},
			})

			const hasMore = followers.length > limit
			const items = hasMore ? followers.slice(0, limit) : followers
			const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

			return {
				items: items.map((f) => f.follower),
				nextCursor,
			}
		}),

	/**
	 * Get list of users that a user follows
	 */
	getFollowing: publicProcedure
		.input(getFollowingSchema)
		.query(async ({ ctx, input }) => {
			const { userId, cursor, limit } = input

			const following = await ctx.prisma.follow.findMany({
				where: {
					followerId: userId,
					...(cursor && { id: { gt: cursor } }),
				},
				orderBy: { createdAt: 'desc' },
				take: limit + 1,
				include: {
					following: {
						select: { id: true, name: true, neighborhood: true },
					},
				},
			})

			const hasMore = following.length > limit
			const items = hasMore ? following.slice(0, limit) : following
			const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

			return {
				items: items.map((f) => f.following),
				nextCursor,
			}
		}),

	/**
	 * Get follower/following counts for a user
	 */
	getCounts: publicProcedure
		.input(getCountsSchema)
		.query(async ({ ctx, input }) => {
			const { userId } = input

			const [followersCount, followingCount] = await Promise.all([
				ctx.prisma.follow.count({ where: { followingId: userId } }),
				ctx.prisma.follow.count({ where: { followerId: userId } }),
			])

			return {
				followersCount,
				followingCount,
			}
		}),

	/**
	 * Get feed of upcoming events from followed organizers
	 */
	getFeed: protectedProcedure
		.input(getFeedSchema)
		.query(async ({ ctx, input }) => {
			const { cursor, limit } = input

			// Get list of users that the current user follows
			const following = await ctx.prisma.follow.findMany({
				where: { followerId: ctx.userId },
				select: { followingId: true },
			})

			const followingIds = following.map((f) => f.followingId)

			if (followingIds.length === 0) {
				return { items: [], nextCursor: undefined }
			}

			// Get upcoming published events from followed organizers
			const events = await ctx.prisma.event.findMany({
				where: {
					organizerId: { in: followingIds },
					status: EventStatus.PUBLISHED,
					date: { gte: new Date() },
					...(cursor && { id: { gt: cursor } }),
				},
				orderBy: { date: 'asc' },
				take: limit + 1,
				include: {
					organizer: { select: { id: true, name: true } },
					_count: { select: { participants: true } },
				},
			})

			const hasMore = events.length > limit
			const items = hasMore ? events.slice(0, limit) : events
			const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

			return { items, nextCursor }
		}),
})
