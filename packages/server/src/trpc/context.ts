import { auth, type Session } from '../lib/auth.js'
import { prisma } from '../utils/db.js'

export interface CreateContextOptions {
	request: Request
}

export async function createContext({ request }: CreateContextOptions) {
	let userId: string | null = null
	let session: Session | null = null

	try {
		const result = await auth.api.getSession({
			headers: request.headers,
			query: { disableCookieCache: true },
		})
		if (result) {
			session = result
			userId = result.user?.id ?? null
		}
	} catch {
		// Session fetch failed — treat as unauthenticated
	}

	return {
		request,
		prisma,
		userId,
		session,
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>
