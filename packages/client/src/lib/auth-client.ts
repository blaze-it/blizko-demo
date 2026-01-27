import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { API_URL } from '@/config'

export const authClient = createAuthClient({
	baseURL: API_URL || undefined,
	plugins: [usernameClient()],
})

export const {
	signIn,
	signUp,
	signOut,
	useSession,
	getSession,
} = authClient
