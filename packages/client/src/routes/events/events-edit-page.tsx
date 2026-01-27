import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

const CATEGORIES = [
	{ value: 'WORKOUT', label: 'Workout' },
	{ value: 'WORKSHOP', label: 'Workshop' },
	{ value: 'KIDS', label: 'Kids' },
	{ value: 'MEETUP', label: 'Meetup' },
	{ value: 'LECTURE', label: 'Lecture' },
	{ value: 'LEISURE', label: 'Leisure' },
	{ value: 'OTHER', label: 'Other' },
]

const EditEventSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().min(1).max(5000),
	category: z.string().min(1),
	date: z.string().min(1),
	startTime: z.string().min(1),
	endTime: z.string().optional(),
	durationMinutes: z.coerce.number().int().positive().optional(),
	locationName: z.string().min(1).max(200),
	address: z.string().min(1).max(500),
	latitude: z.coerce.number().min(-90).max(90),
	longitude: z.coerce.number().min(-180).max(180),
	price: z.coerce.number().int().min(0),
	capacity: z.coerce.number().int().positive(),
})

type EditEventFormData = z.infer<typeof EditEventSchema>

export function EventsEditPage() {
	usePageTitle('Edit Event')
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	const { data: event, isLoading } = trpc.events.getById.useQuery(
		{ id: id! },
		{ enabled: !!id },
	)

	const updateMutation = trpc.events.update.useMutation({
		onSuccess: () => {
			utils.events.getById.invalidate({ id: id! })
			navigate(`/events/${id}`)
		},
	})

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<EditEventFormData>({
		resolver: zodResolver(EditEventSchema) as never,
	})

	useEffect(() => {
		if (event) {
			reset({
				title: event.title,
				description: event.description,
				category: event.category,
				date: new Date(event.date).toISOString().split('T')[0],
				startTime: event.startTime,
				endTime: event.endTime || '',
				durationMinutes: event.durationMinutes || undefined,
				locationName: event.locationName,
				address: event.address,
				latitude: event.latitude,
				longitude: event.longitude,
				price: event.price,
				capacity: event.capacity,
			})
		}
	}, [event, reset])

	const onSubmit = (data: EditEventFormData) => {
		updateMutation.mutate({
			id: id!,
			...data,
			category: data.category as never,
			endTime: data.endTime || undefined,
			durationMinutes: data.durationMinutes || undefined,
		})
	}

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		)
	}

	return (
		<div className="container max-w-2xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate(`/events/${id}`)}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to event
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Edit Event</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input id="title" {...register('title')} />
							{errors.title && (
								<p className="text-destructive text-sm">{errors.title.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description" rows={4} {...register('description')} />
							{errors.description && (
								<p className="text-destructive text-sm">{errors.description.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label>Category</Label>
							<Select
								defaultValue={event?.category}
								onValueChange={(value) => setValue('category', value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat.value} value={cat.value}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="date">Date</Label>
								<Input id="date" type="date" {...register('date')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="startTime">Start Time</Label>
								<Input id="startTime" type="time" {...register('startTime')} />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="endTime">End Time</Label>
								<Input id="endTime" type="time" {...register('endTime')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="durationMinutes">Duration (min)</Label>
								<Input id="durationMinutes" type="number" {...register('durationMinutes')} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="locationName">Location Name</Label>
							<Input id="locationName" {...register('locationName')} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Address</Label>
							<Input id="address" {...register('address')} />
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="latitude">Latitude</Label>
								<Input id="latitude" type="number" step="any" {...register('latitude')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="longitude">Longitude</Label>
								<Input id="longitude" type="number" step="any" {...register('longitude')} />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="price">Price (CZK)</Label>
								<Input id="price" type="number" min={0} {...register('price')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="capacity">Capacity</Label>
								<Input id="capacity" type="number" min={1} {...register('capacity')} />
							</div>
						</div>

						{updateMutation.error && (
							<div className="p-3 rounded-lg bg-destructive/20 border border-destructive/30">
								<p className="text-destructive text-sm">{updateMutation.error.message}</p>
							</div>
						)}

						<Button type="submit" className="w-full" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
