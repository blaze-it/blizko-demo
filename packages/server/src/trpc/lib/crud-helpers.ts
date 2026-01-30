import { Errors } from '@zokoli/shared'

/**
 * Ensures a record exists. Throws NOT_FOUND if null.
 */
export async function ensureExists<T>(
	query: Promise<T | null>,
	resourceName: string,
	id?: string,
): Promise<T> {
	const result = await query
	if (!result) {
		throw Errors.notFound(resourceName, id)
	}
	return result
}
