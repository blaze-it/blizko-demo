import { router } from '../trpc.js'
import { eventsRouter } from './events.js'
import { reviewsRouter } from './reviews.js'
import { uploadRouter } from './upload.js'
import { userRouter } from './user.js'

export const appRouter = router({
	events: eventsRouter,
	reviews: reviewsRouter,
	upload: uploadRouter,
	user: userRouter,
})

export type AppRouter = typeof appRouter
