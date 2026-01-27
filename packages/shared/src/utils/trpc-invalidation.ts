/**
 * tRPC query invalidation configuration
 *
 * This module provides query group definitions that can be used
 * to invalidate related queries consistently across client and mobile.
 *
 * Usage:
 *   const invalidate = createInvalidationHelpers(utils)
 *   invalidate.tasks()
 *   invalidate.goals()
 */

/**
 * Query paths for each domain that should be invalidated together
 */
export const QUERY_GROUPS = {
	tasks: [
		'tasks.inbox',
		'tasks.today',
		'tasks.upcoming',
		'tasks.list',
		'tasks.stats',
		'tasks.byProject',
		'tasks.byLabel',
		'tasks.listProjects',
	],
	goals: ['goals.list'],
	wishlist: ['wishlist.listInfinite', 'wishlist.stats'],
	wheat: ['wheat.list', 'wheat.stats', 'wheat.strains'],
	trips: ['trips.list', 'trips.stats', 'trips.destinations'],
	gmail: ['gmail.listMessages', 'gmail.unreadCount'],
	crypto: ['crypto.list'],
	weight: ['weight.list', 'weight.stats', 'weight.settings'],
	steps: ['steps.list', 'steps.stats'],
	calories: ['calories.list', 'calories.stats', 'calories.settings'],
	journal: ['journal.list', 'journal.stats', 'journal.streaks', 'journal.tags'],
	notes: ['notes.list', 'notes.tags'],
	notificationPreferences: ['notificationPreferences.listGrouped'],
	caffeine: ['caffeine.list', 'caffeine.stats'],
	yoga: ['yoga.list', 'yoga.stats', 'yoga.settings'],
	recordings: ['recordings.list'],
	flights: ['flights.list', 'flights.stats'],
	contacts: ['contacts.list', 'contacts.tags'],
	books: ['books.list', 'books.stats'],
	timeEntries: [
		'timeEntries.getWeekEntries',
		'timeEntries.getProjects',
		'timeEntries.getClients',
		'timeEntries.stats',
	],
	dashboard: ['dashboard.summary'],
	pushups: ['pushups.list', 'pushups.stats'],
	audiobooks: ['audiobooks.list', 'audiobooks.stats'],
	invoices: ['invoices.list', 'invoices.stats'],
	expenses: ['expenses.list', 'expenses.stats'],
	debts: ['debts.list', 'debts.stats'],
	inventory: ['inventory.list', 'inventory.stats'],
	settings: ['settings.get'],
} as const

export type QueryGroup = keyof typeof QUERY_GROUPS

/**
 * Helper to get nested property from an object using dot notation
 */
function getNestedProperty(obj: unknown, path: string): unknown {
	return path.split('.').reduce((current, key) => {
		if (current && typeof current === 'object' && key in current) {
			return (current as Record<string, unknown>)[key]
		}
		return undefined
	}, obj)
}

/**
 * Creates invalidation helper functions for a given tRPC utils instance.
 * Works with any tRPC client (web or mobile) that has compatible router structure.
 *
 * @example
 * const utils = trpc.useUtils()
 * const invalidate = createInvalidationHelpers(utils)
 *
 * // After a task mutation:
 * invalidate.tasks()
 *
 * // After multiple related mutations:
 * invalidate.tasks()
 * invalidate.dashboard()
 */
export function createInvalidationHelpers<TUtils extends object>(
	utils: TUtils,
) {
	const invalidateGroup = (group: QueryGroup): void => {
		const paths = QUERY_GROUPS[group]
		for (const path of paths) {
			try {
				const queryObj = getNestedProperty(utils, path)
				if (
					queryObj &&
					typeof queryObj === 'object' &&
					'invalidate' in queryObj &&
					typeof (queryObj as { invalidate: unknown }).invalidate === 'function'
				) {
					;(queryObj as { invalidate: () => void }).invalidate()
				}
			} catch {
				// Query path doesn't exist in this client - skip silently
				// This allows the same config to work across web/mobile with different routers
			}
		}
	}

	// Create an invalidation function for each group
	const helpers = {} as Record<QueryGroup, () => void>
	for (const group of Object.keys(QUERY_GROUPS) as QueryGroup[]) {
		helpers[group] = () => invalidateGroup(group)
	}

	return helpers
}

/**
 * Type for the invalidation helpers object
 */
export type InvalidationHelpers = ReturnType<typeof createInvalidationHelpers>
