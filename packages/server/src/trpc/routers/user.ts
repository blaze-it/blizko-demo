import { z } from 'zod'
import { ensureExists } from '../lib/crud-helpers.js'
import { protectedProcedure, publicProcedure, router } from '../trpc.js'

export const userRouter = router({
	/**
	 * Get public user profile by ID
	 */
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ensureExists(
				ctx.prisma.user.findUnique({
					where: { id: input.id },
					select: {
						id: true,
						name: true,
						neighborhood: true,
						bio: true,
						createdAt: true,
					},
				}),
				'User',
				input.id,
			)

			return user
		}),

	me: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.userId) {
			return null
		}

		const user = await ctx.prisma.user.findUnique({
			select: {
				id: true,
				email: true,
				name: true,
				username: true,
				neighborhood: true,
				bio: true,
				createdAt: true,
			},
			where: { id: ctx.userId },
		})

		return user
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100).optional(),
				neighborhood: z.string().max(200).optional(),
				bio: z.string().max(500).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.update({
				where: { id: ctx.userId },
				data: input,
				select: { id: true, name: true, neighborhood: true, bio: true },
			})
			return user
		}),
})
