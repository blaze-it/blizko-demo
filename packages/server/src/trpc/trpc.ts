import { AppError, appErrorToTrpcCode, Errors } from '@blizko/shared'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context.js'

const t = initTRPC.context<Context>().create({
	transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

/**
 * Error handling middleware - converts AppError to TRPCError
 */
const errorHandler = middleware(async ({ next }) => {
	try {
		return await next()
	} catch (error) {
		if (error instanceof AppError) {
			throw new TRPCError({
				code: appErrorToTrpcCode(error.code),
				message: error.message,
				cause: error,
			})
		}
		if (error instanceof TRPCError) {
			throw error
		}
		const message =
			error instanceof Error ? error.message : 'An unexpected error occurred'
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message,
			cause: error,
		})
	}
})

// Auth middleware
const isAuthed = middleware(async ({ ctx, next }) => {
	if (!ctx.userId) {
		throw Errors.unauthorized('You must be logged in')
	}
	return next({
		ctx: { ...ctx, userId: ctx.userId },
	})
})

const baseProcedure = t.procedure.use(errorHandler)
export const protectedProcedure = baseProcedure.use(isAuthed)
