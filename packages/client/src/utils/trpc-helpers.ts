/**
 * tRPC query invalidation helpers
 *
 * Uses the shared invalidation configuration from @blizko/shared.
 * This ensures consistent cache updates after mutations.
 */

import { createInvalidationHelpers } from '@blizko/shared'
import type { trpc } from '@/trpc/client'

type TrpcUtils = ReturnType<typeof trpc.useUtils>

/**
 * Create invalidation helpers for the given tRPC utils instance.
 *
 * @example
 * const utils = trpc.useUtils()
 * const invalidate = createInvalidate(utils)
 *
 * // After a task mutation:
 * invalidate.tasks()
 */
export function createInvalidate(utils: TrpcUtils) {
	return createInvalidationHelpers(utils)
}

// Legacy exports for backward compatibility
// These will be deprecated in favor of createInvalidate()

export function invalidateTaskQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).tasks()
}

export function invalidateGoalQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).goals()
}

export function invalidateWishlistQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).wishlist()
}

export function invalidateWheatQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).wheat()
}

export function invalidateTripQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).trips()
}

export function invalidateGmailQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).gmail()
}

export function invalidateCryptoQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).crypto()
}

export function invalidateWeightQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).weight()
}

export function invalidateStepsQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).steps()
}

export function invalidateCalorieQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).calories()
}

export function invalidateJournalQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).journal()
}

export function invalidateNotesQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).notes()
}

export function invalidateNotificationPreferencesQueries(
	utils: TrpcUtils,
): void {
	createInvalidationHelpers(utils).notificationPreferences()
}

export function invalidateCaffeineQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).caffeine()
}

export function invalidateYogaQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).yoga()
}

export function invalidateRecordingQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).recordings()
}

export function invalidateFlightQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).flights()
}

export function invalidateContactsQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).contacts()
}

export function invalidateBooksQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).books()
}

export function invalidateTimeEntryQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).timeEntries()
}

export function invalidateDashboardQueries(utils: TrpcUtils): void {
	createInvalidationHelpers(utils).dashboard()
}
