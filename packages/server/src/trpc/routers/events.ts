import { Errors } from '@blizko/shared'
import { z } from 'zod'
import {
	EventCategory,
	EventStatus,
	ParticipantStatus,
} from '../../generated/prisma/client.js'
import { ensureExists } from '../lib/crud-helpers.js'
import { protectedProcedure, publicProcedure, router } from '../trpc.js'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const listEventsSchema = z.object({
	category: z.nativeEnum(EventCategory).optional(),
	date: z.string().optional(),
	search: z.string().optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
	radiusKm: z.number().optional(),
	priceMin: z.number().optional(),
	priceMax: z.number().optional(),
	freeOnly: z.boolean().optional(),
	cursor: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
})

const createEventSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	category: z.nativeEnum(EventCategory),
	date: z.coerce.date(),
	startTime: z.string(),
	endTime: z.string().optional(),
	durationMinutes: z.number().int().positive().optional(),
	locationName: z.string().min(1, 'Location name is required'),
	address: z.string().min(1, 'Address is required'),
	latitude: z.number(),
	longitude: z.number(),
	price: z.number().int().nonnegative().default(0),
	currency: z.string().default('CZK'),
	capacity: z.number().int().positive(),
	imageUrl: z.string().url().optional(),
})

const updateEventSchema = z.object({
	id: z.string(),
	title: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	category: z.nativeEnum(EventCategory).optional(),
	date: z.coerce.date().optional(),
	startTime: z.string().optional(),
	endTime: z.string().optional(),
	durationMinutes: z.number().int().positive().optional(),
	locationName: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	price: z.number().int().nonnegative().optional(),
	currency: z.string().optional(),
	capacity: z.number().int().positive().optional(),
	imageUrl: z.string().url().optional(),
	status: z.nativeEnum(EventStatus).optional(),
})

// =============================================================================
// ROUTER
// =============================================================================

export const eventsRouter = router({
	list: publicProcedure
		.input(listEventsSchema)
		.query(async ({ ctx, input }) => {
			const {
				category,
				date,
				search,
				lat,
				lng,
				radiusKm,
				priceMin,
				priceMax,
				freeOnly,
				cursor,
				limit,
			} = input

			// Build search filter - enhanced fulltext search across title, description, locationName, and address
			const searchFilter = search
				? {
						OR: [
							{ title: { contains: search, mode: 'insensitive' as const } },
							{
								description: {
									contains: search,
									mode: 'insensitive' as const,
								},
							},
							{
								locationName: {
									contains: search,
									mode: 'insensitive' as const,
								},
							},
							{
								address: {
									contains: search,
									mode: 'insensitive' as const,
								},
							},
						],
					}
				: {}

			// Build price filter
			const priceFilter = freeOnly
				? { price: 0 }
				: {
						...(priceMin !== undefined && { price: { gte: priceMin } }),
						...(priceMax !== undefined && {
							price: { ...(priceMin !== undefined ? { gte: priceMin } : {}), lte: priceMax },
						}),
					}

			// If geo filter is requested, use raw SQL for Haversine distance
			if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
				const nearbyIds = await ctx.prisma.$queryRaw<Array<{ id: string }>>`
					SELECT id FROM "Event"
					WHERE status = 'PUBLISHED'
					AND (
						6371 * acos(
							cos(radians(${lat})) * cos(radians("latitude"))
							* cos(radians("longitude") - radians(${lng}))
							+ sin(radians(${lat})) * sin(radians("latitude"))
						)
					) < ${radiusKm}
				`

				const nearbyIdList = nearbyIds.map((r) => r.id)
				if (nearbyIdList.length === 0) {
					return { items: [], nextCursor: undefined }
				}

				const events = await ctx.prisma.event.findMany({
					where: {
						id: { in: nearbyIdList },
						status: EventStatus.PUBLISHED,
						...(category && { category }),
						...(date && {
							date: {
								gte: new Date(date),
								lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
							},
						}),
						...searchFilter,
						...priceFilter,
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
			}

			// Standard query without geo filter
			const events = await ctx.prisma.event.findMany({
				where: {
					status: EventStatus.PUBLISHED,
					...(category && { category }),
					...(date && {
						date: {
							gte: new Date(date),
							lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
						},
					}),
					...searchFilter,
					...priceFilter,
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

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const event = await ensureExists(
				ctx.prisma.event.findFirst({
					where: { id: input.id },
					include: {
						organizer: { select: { id: true, name: true, image: true } },
						participants: {
							include: {
								user: { select: { name: true } },
							},
						},
					},
				}),
				'Event',
				input.id,
			)

			return event
		}),

	create: protectedProcedure
		.input(createEventSchema)
		.mutation(async ({ ctx, input }) => {
			const event = await ctx.prisma.event.create({
				data: {
					...input,
					organizerId: ctx.userId,
					status: EventStatus.PUBLISHED,
				},
			})

			return event
		}),

	update: protectedProcedure
		.input(updateEventSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input

			const existing = await ensureExists(
				ctx.prisma.event.findFirst({ where: { id } }),
				'Event',
				id,
			)

			if (existing.organizerId !== ctx.userId) {
				throw Errors.forbidden('You can only update your own events')
			}

			const event = await ctx.prisma.event.update({
				where: { id },
				data,
			})

			return event
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ensureExists(
				ctx.prisma.event.findFirst({ where: { id: input.id } }),
				'Event',
				input.id,
			)

			if (existing.organizerId !== ctx.userId) {
				throw Errors.forbidden('You can only delete your own events')
			}

			await ctx.prisma.event.delete({ where: { id: input.id } })

			return { success: true }
		}),

	join: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const event = await ensureExists(
				ctx.prisma.event.findFirst({
					where: { id: input.eventId, status: EventStatus.PUBLISHED },
					include: { _count: { select: { participants: true } } },
				}),
				'Event',
				input.eventId,
			)

			// Check if already joined
			const existingParticipant = await ctx.prisma.eventParticipant.findUnique({
				where: {
					eventId_userId: {
						eventId: input.eventId,
						userId: ctx.userId,
					},
				},
			})

			if (existingParticipant) {
				throw Errors.conflict('You have already joined this event')
			}

			// Determine status based on capacity
			const isFull = event._count.participants >= event.capacity
			const status = isFull
				? ParticipantStatus.WAITLISTED
				: ParticipantStatus.CONFIRMED

			const participant = await ctx.prisma.eventParticipant.create({
				data: {
					eventId: input.eventId,
					userId: ctx.userId,
					status,
				},
			})

			return participant
		}),

	leave: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const participant = await ctx.prisma.eventParticipant.findUnique({
				where: {
					eventId_userId: {
						eventId: input.eventId,
						userId: ctx.userId,
					},
				},
			})

			if (!participant) {
				throw Errors.notFound('EventParticipant')
			}

			await ctx.prisma.eventParticipant.delete({
				where: {
					eventId_userId: {
						eventId: input.eventId,
						userId: ctx.userId,
					},
				},
			})

			return { success: true }
		}),

	myEvents: protectedProcedure.query(async ({ ctx }) => {
		const events = await ctx.prisma.event.findMany({
			where: { organizerId: ctx.userId },
			orderBy: { date: 'asc' },
			include: {
				_count: { select: { participants: true } },
			},
		})

		return events
	}),

	myParticipations: protectedProcedure.query(async ({ ctx }) => {
		const participations = await ctx.prisma.eventParticipant.findMany({
			where: { userId: ctx.userId },
			include: {
				event: {
					include: {
						organizer: { select: { id: true, name: true } },
						_count: { select: { participants: true } },
					},
				},
			},
			orderBy: { event: { date: 'asc' } },
		})

		return participations
	}),
})
