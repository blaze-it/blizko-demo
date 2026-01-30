import { router } from '../trpc.js'
import { eventsRouter } from './events.js'
import { followsRouter } from './follows.js'
import { notificationsRouter } from './notifications.js'
import { reportsRouter } from './reports.js'
import { reviewsRouter } from './reviews.js'
import { stripeRouter } from './stripe.js'
import { uploadRouter } from './upload.js'
import { userRouter } from './user.js'

export const appRouter = router({
	events: eventsRouter,
	follows: followsRouter,
	notifications: notificationsRouter,
	reports: reportsRouter,
	reviews: reviewsRouter,
	stripe: stripeRouter,
	upload: uploadRouter,
	user: userRouter,
})

export type AppRouter = typeof appRouter
