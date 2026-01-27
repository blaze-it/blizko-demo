import { router } from '../trpc.js'
import { eventsRouter } from './events.js'
import { userRouter } from './user.js'

export const appRouter = router({
	events: eventsRouter,
	user: userRouter,
})

export type AppRouter = typeof appRouter
