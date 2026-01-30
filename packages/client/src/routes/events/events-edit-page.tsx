import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, Save, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
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
	{ value: 'WORKOUT', label: 'Cvičení' },
	{ value: 'WORKSHOP', label: 'Dílna' },
	{ value: 'KIDS', label: 'Děti' },
	{ value: 'MEETUP', label: 'Setkání' },
	{ value: 'LECTURE', label: 'Přednáška' },
	{ value: 'LEISURE', label: 'Volný čas' },
	{ value: 'OTHER', label: 'Ostatní' },
]

const EditEventSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().min(1).max(5000),
	category: z.string().min(1),
	date: z.string().min(1),
	startTime: z.string().min(1),
	endTime: z.string().optional(),
	durationMinutes: z.preprocess(
		(val) => (val === '' || val === undefined ? undefined : val),
		z.coerce.number().int().positive().optional(),
	),
	locationName: z.string().min(1).max(200),
	address: z.string().min(1).max(500),
	latitude: z.coerce.number().min(-90).max(90),
	longitude: z.coerce.number().min(-180).max(180),
	price: z.coerce.number().int().min(0),
	capacity: z.coerce.number().int().positive(),
})

type EditEventFormData = z.infer<typeof EditEventSchema>

export function EventsEditPage() {
	usePageTitle('Upravit událost')
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const utils = trpc.useUtils()
	const [submitAction, setSubmitAction] = useState<'save' | 'publish'>('save')

	const { data: event, isLoading } = trpc.events.getById.useQuery(
		{ id: id! },
		{ enabled: !!id },
	)

	const isDraft = event?.status === 'DRAFT'

	const updateMutation = trpc.events.update.useMutation({
		onSuccess: () => {
			toast.success('Změny byly uloženy')
			utils.events.getById.invalidate({ id: id! })
			navigate(isDraft ? `/events/${id}/preview` : `/events/${id}`)
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodařilo se uložit změny')
		},
	})

	const saveDraftMutation = trpc.events.saveDraft.useMutation({
		onSuccess: () => {
			toast.success('Koncept byl uložen')
			utils.events.getById.invalidate({ id: id! })
			navigate(`/events/${id}/preview`)
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodařilo se uložit koncept')
		},
	})

	const publishMutation = trpc.events.publish.useMutation({
		onSuccess: () => {
			toast.success('Událost byla publikována!')
			utils.events.getById.invalidate({ id: id! })
			navigate(`/events/${id}`)
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodařilo se publikovat událost')
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
		const eventData = {
			id: id!,
			...data,
			category: data.category as never,
			endTime: data.endTime || undefined,
			durationMinutes: data.durationMinutes || undefined,
		}

		if (isDraft) {
			if (submitAction === 'publish') {
				// Save changes first, then publish
				saveDraftMutation.mutate(eventData, {
					onSuccess: () => {
						publishMutation.mutate({ id: id! })
					},
				})
			} else {
				saveDraftMutation.mutate(eventData)
			}
		} else {
			updateMutation.mutate(eventData)
		}
	}

	const handleSave = () => {
		setSubmitAction('save')
	}

	const handlePublish = () => {
		setSubmitAction('publish')
	}

	const isPending =
		updateMutation.isPending ||
		saveDraftMutation.isPending ||
		publishMutation.isPending

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
				Zpět na událost
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Upravit událost</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Název</Label>
							<Input id="title" {...register('title')} />
							{errors.title && (
								<p className="text-destructive text-sm">
									{errors.title.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Popis</Label>
							<Textarea
								id="description"
								rows={4}
								{...register('description')}
							/>
							{errors.description && (
								<p className="text-destructive text-sm">
									{errors.description.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label>Kategorie</Label>
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

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="date">Datum</Label>
								<Input id="date" type="date" {...register('date')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="startTime">Čas začátku</Label>
								<Input id="startTime" type="time" {...register('startTime')} />
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="endTime">Čas konce</Label>
								<Input id="endTime" type="time" {...register('endTime')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="durationMinutes">Délka (min)</Label>
								<Input
									id="durationMinutes"
									type="number"
									{...register('durationMinutes')}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="locationName">Název místa</Label>
							<Input id="locationName" {...register('locationName')} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Adresa</Label>
							<Input id="address" {...register('address')} />
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="latitude">Zeměpisná šířka</Label>
								<Input
									id="latitude"
									type="number"
									step="any"
									{...register('latitude')}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="longitude">Zeměpisná délka</Label>
								<Input
									id="longitude"
									type="number"
									step="any"
									{...register('longitude')}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="price">Cena (Kč)</Label>
								<Input
									id="price"
									type="number"
									min={0}
									{...register('price')}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="capacity">Kapacita</Label>
								<Input
									id="capacity"
									type="number"
									min={1}
									{...register('capacity')}
								/>
							</div>
						</div>

						{(updateMutation.error ||
							saveDraftMutation.error ||
							publishMutation.error) && (
							<div className="p-3 rounded-lg bg-destructive/20 border border-destructive/30">
								<p className="text-destructive text-sm">
									{updateMutation.error?.message ||
										saveDraftMutation.error?.message ||
										publishMutation.error?.message}
								</p>
							</div>
						)}

						{isDraft ? (
							<>
								<div className="flex flex-col gap-3 sm:flex-row">
									<Button
										type="submit"
										variant="outline"
										className="flex-1"
										disabled={isPending}
										onClick={handleSave}
									>
										<Save className="h-4 w-4 mr-2" />
										{isPending && submitAction === 'save'
											? 'Ukládání...'
											: 'Uložit koncept'}
									</Button>
									<Button
										type="submit"
										className="flex-1"
										disabled={isPending}
										onClick={handlePublish}
									>
										<Send className="h-4 w-4 mr-2" />
										{isPending && submitAction === 'publish'
											? 'Publikování...'
											: 'Publikovat'}
									</Button>
								</div>
								<p className="text-sm text-muted-foreground text-center">
									<Eye className="inline h-4 w-4 mr-1" />
									Koncept můžete před publikováním zkontrolovat v náhledu
								</p>
							</>
						) : (
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
								onClick={handleSave}
							>
								{isPending ? 'Ukládání...' : 'Uložit změny'}
							</Button>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
