import {
	ArrowLeft,
	Calendar,
	MapPin,
	Star,
	User,
	Users,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FollowButton } from '@/components/follow-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

export function UserProfilePage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const { data: currentUser } = trpc.user.me.useQuery()

	const { data: user, isLoading: isLoadingUser } = trpc.user.getById.useQuery(
		{ id: id! },
		{ enabled: !!id },
	)

	const { data: counts } =
		trpc.follows.getCounts.useQuery({ userId: id! }, { enabled: !!id })

	const { data: rating } = trpc.reviews.getOrganizerRating.useQuery(
		{ organizerId: id! },
		{ enabled: !!id },
	)

	const { data: eventsData } = trpc.events.list.useQuery({
		limit: 5,
	})

	// Filter events by this organizer (client-side for simplicity)
	const organizerEvents =
		eventsData?.items.filter((e) => e.organizerId === id) ?? []

	usePageTitle(user?.name ?? 'Profil uzivatele')

	const isOwnProfile = currentUser?.id === id

	if (isLoadingUser) {
		return (
			<div className="container py-8">
				<div className="mb-6">
					<Skeleton className="mb-4 h-9 w-32" />
					<div className="flex items-center gap-3">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div>
							<Skeleton className="h-9 w-48" />
							<Skeleton className="mt-1 h-5 w-64" />
						</div>
					</div>
				</div>
				<Skeleton className="h-48" />
			</div>
		)
	}

	if (!user) {
		return (
			<div className="container text-center py-12">
				<p className="text-muted-foreground">Uzivatel nenalezen</p>
				<Button variant="ghost" onClick={() => navigate('/events')}>
					Zpet na udalosti
				</Button>
			</div>
		)
	}

	const formatDate = (date: Date | string) => {
		return new Intl.DateTimeFormat('cs-CZ', {
			year: 'numeric',
			month: 'long',
		}).format(new Date(date))
	}

	return (
		<div className="container py-8 max-w-3xl">
			<Button variant="ghost" size="sm" asChild className="mb-4">
				<Link to="/events">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zpet na udalosti
				</Link>
			</Button>

			{/* Profile Header */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shrink-0">
								<User className="h-8 w-8 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">
									{user.name || 'Anonymni uzivatel'}
								</CardTitle>
								{user.neighborhood && (
									<CardDescription className="flex items-center gap-1 mt-1">
										<MapPin className="h-3.5 w-3.5" />
										{user.neighborhood}
									</CardDescription>
								)}
							</div>
						</div>
						{!isOwnProfile && currentUser && (
							<FollowButton userId={id!} />
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Bio */}
					{user.bio && (
						<div>
							<p className="text-muted-foreground">{user.bio}</p>
						</div>
					)}

					{/* Stats */}
					<div className="flex flex-wrap gap-6 pt-2">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-muted-foreground" />
							<div>
								<span className="font-semibold">
									{counts?.followersCount ?? 0}
								</span>
								<span className="text-muted-foreground ml-1">sledujicich</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-muted-foreground" />
							<div>
								<span className="font-semibold">
									{counts?.followingCount ?? 0}
								</span>
								<span className="text-muted-foreground ml-1">sleduje</span>
							</div>
						</div>
						{rating && rating.totalReviews > 0 && (
							<div className="flex items-center gap-2">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<div>
									<span className="font-semibold">{rating.avgRating}</span>
									<span className="text-muted-foreground ml-1">
										({rating.totalReviews} hodnoceni)
									</span>
								</div>
							</div>
						)}
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="h-5 w-5" />
							<span>Clenem od {formatDate(user.createdAt)}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Events */}
			{organizerEvents.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Udalosti od tohoto organizatora</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{organizerEvents.map((event) => (
								<Link
									key={event.id}
									to={`/events/${event.id}`}
									className="block p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
								>
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<div className="flex items-center gap-2 mb-1">
												<Badge variant="secondary">{event.category}</Badge>
												<h3 className="font-medium">{event.title}</h3>
											</div>
											<div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="h-3.5 w-3.5" />
													{new Date(event.date).toLocaleDateString('cs-CZ')}
												</span>
												<span className="flex items-center gap-1">
													<MapPin className="h-3.5 w-3.5" />
													{event.locationName}
												</span>
											</div>
										</div>
										<div className="text-right shrink-0">
											<p className="font-semibold text-primary">
												{event.price === 0
													? 'Zdarma'
													: `${event.price} ${event.currency}`}
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{organizerEvents.length === 0 && (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						Tento uzivatel zatim neorganizoval zadne udalosti.
					</CardContent>
				</Card>
			)}
		</div>
	)
}
