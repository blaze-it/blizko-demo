import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'
import { Plus, MapPin, Calendar, Users } from 'lucide-react'

const CATEGORIES = [
	{ value: 'ALL', label: 'All Categories' },
	{ value: 'WORKOUT', label: 'Workout' },
	{ value: 'WORKSHOP', label: 'Workshop' },
	{ value: 'KIDS', label: 'Kids' },
	{ value: 'MEETUP', label: 'Meetup' },
	{ value: 'LECTURE', label: 'Lecture' },
	{ value: 'LEISURE', label: 'Leisure' },
	{ value: 'OTHER', label: 'Other' },
] as const

const CATEGORY_COLORS: Record<
	string,
	'default' | 'secondary' | 'accent' | 'outline'
> = {
	WORKOUT: 'default',
	WORKSHOP: 'accent',
	KIDS: 'secondary',
	MEETUP: 'default',
	LECTURE: 'accent',
	LEISURE: 'secondary',
	OTHER: 'outline',
}

export function EventsPage() {
	usePageTitle('Events')
	const navigate = useNavigate()
	const [search, setSearch] = useState('')
	const [category, setCategory] = useState('ALL')
	const [date, setDate] = useState('')

	const { data, isLoading } = trpc.events.list.useQuery({
		search: search || undefined,
		category: category !== 'ALL' ? (category as 'WORKOUT' | 'WORKSHOP' | 'KIDS' | 'MEETUP' | 'LECTURE' | 'LEISURE' | 'OTHER') : undefined,
		date: date || undefined,
	})
	const events = data?.items

	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr)
		return d.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		})
	}

	const formatTime = (dateStr: string) => {
		const d = new Date(dateStr)
		return d.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
				<h1 className="text-2xl font-bold text-foreground mb-6">Browse Events</h1>

				{/* Map Placeholder */}
				<div className="w-full h-64 rounded-xl bg-muted/50 border border-border flex items-center justify-center mb-6">
					<div className="text-center text-muted-foreground">
						<MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm font-medium">Map View</p>
						<p className="text-xs">Coming soon</p>
					</div>
				</div>

				{/* Filter Bar */}
				<div className="flex flex-col sm:flex-row gap-3 mb-6">
					<SearchInput value={search} onChange={setSearch} placeholder="Search events..." className="flex-1" />
					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger className="w-full sm:w-48">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-44" />
				</div>

				{/* Event List */}
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
						))}
					</div>
				) : !events?.length ? (
					<div className="text-center py-12 text-muted-foreground">
						<Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p className="text-lg font-medium">No events found</p>
						<p className="text-sm mt-1">Try adjusting your filters or create a new event</p>
					</div>
				) : (
					<div className="space-y-4">
						{events.map((event) => (
							<Link key={event.id} to={"/events/" + event.id}>
								<Card className="hover:border-emerald/30 transition-colors cursor-pointer">
									<CardContent className="p-4">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-semibold text-foreground truncate">{event.title}</h3>
													<Badge variant={CATEGORY_COLORS[event.category] || 'outline'}>{event.category}</Badge>
												</div>
												<div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
													<span className="flex items-center gap-1">
														<Calendar className="h-3.5 w-3.5" />
														{formatDate(event.startTime)} at {formatTime(event.startTime)}
													</span>
													<span className="flex items-center gap-1">
														<MapPin className="h-3.5 w-3.5" />
														{event.locationName}
													</span>
													{event.capacity && (
														<span className="flex items-center gap-1">
															<Users className="h-3.5 w-3.5" />
															{event._count?.participants ?? 0} / {event.capacity}
														</span>
													)}
												</div>
											</div>
											<div className="text-right shrink-0">
												<span className="text-sm font-semibold text-foreground">
													{event.price > 0 ? event.price + ' CZK' : 'Free'}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Floating Create Button */}
			<Button
				className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
				onClick={() => navigate('/events/new')}
			>
				<Plus className="h-6 w-6" />
			</Button>
		</div>
	)
}
