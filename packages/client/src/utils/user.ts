import { trpc } from '@/trpc/client'

export function useOptionalUser() {
	const { data: user } = trpc.user.me.useQuery(undefined, {
		retry: false,
	})
	return user ?? undefined
}

export function useUser() {
	const user = useOptionalUser()
	if (!user) {
		throw new Error(
			'User is required but not found. Make sure you are using this within an authenticated route.',
		)
	}
	return user
}
