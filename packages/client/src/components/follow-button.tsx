import { UserMinus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'

interface FollowButtonProps {
	userId: string
	className?: string
}

export function FollowButton({ userId, className }: FollowButtonProps) {
	const utils = trpc.useUtils()

	const { data: isFollowingData, isLoading: isCheckingFollow } =
		trpc.follows.isFollowing.useQuery({ userId })

	const followMutation = trpc.follows.follow.useMutation({
		onSuccess: () => {
			toast.success('Nyni sledujete tohoto uzivatele')
			utils.follows.isFollowing.invalidate({ userId })
			utils.follows.getCounts.invalidate({ userId })
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodarilo se sledovat uzivatele')
		},
	})

	const unfollowMutation = trpc.follows.unfollow.useMutation({
		onSuccess: () => {
			toast.success('Prestali jste sledovat tohoto uzivatele')
			utils.follows.isFollowing.invalidate({ userId })
			utils.follows.getCounts.invalidate({ userId })
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodarilo se prestat sledovat uzivatele')
		},
	})

	const isFollowing = isFollowingData?.isFollowing ?? false
	const isPending = followMutation.isPending || unfollowMutation.isPending

	const handleClick = () => {
		if (isFollowing) {
			unfollowMutation.mutate({ userId })
		} else {
			followMutation.mutate({ userId })
		}
	}

	if (isCheckingFollow) {
		return (
			<Button variant="outline" disabled className={className}>
				<UserPlus className="mr-2 h-4 w-4" />
				Nacitani...
			</Button>
		)
	}

	return (
		<Button
			variant={isFollowing ? 'outline' : 'default'}
			onClick={handleClick}
			disabled={isPending}
			className={className}
		>
			{isFollowing ? (
				<>
					<UserMinus className="mr-2 h-4 w-4" />
					{isPending ? 'Zpracovani...' : 'Prestat sledovat'}
				</>
			) : (
				<>
					<UserPlus className="mr-2 h-4 w-4" />
					{isPending ? 'Zpracovani...' : 'Sledovat'}
				</>
			)}
		</Button>
	)
}
