import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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

const CreateEventSchema = z.object({
	title: z.string().min(1, 'Název je povinný').max(200),
	description: z.string().min(1, 'Popis je povinný').max(5000),
	category: z.string().min(1, 'Kategorie je povinná'),
	date: z.string().min(1, 'Datum je povinné'),
	startTime: z.string().min(1, 'Čas začátku je povinný'),
	endTime: z.string().optional(),
	durationMinutes: z.preprocess(
		(val) => (val === '' || val === undefined ? undefined : val),
		z.coerce.number().int().positive().optional(),
	),
	locationName: z.string().min(1, 'Název místa je povinný').max(200),
	address: z.string().min(1, 'Adresa je povinná').max(500),
	latitude: z.coerce.number().min(-90).max(90),
	longitude: z.coerce.number().min(-180).max(180),
	price: z.coerce.number().int().min(0).default(0),
	capacity: z.coerce.number().int().positive('Kapacita musí být kladné číslo'),
})

type CreateEventFormData = z.infer<typeof CreateEventSchema>

export function EventsNewPage() {
	usePageTitle('Vytvořit událost')
	const navigate = useNavigate()

	const createMutation = trpc.events.create.useMutation({
		onSuccess: (event) => {
			navigate(`/events/${event.id}`)
		},
	})

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateEventFormData>({
		resolver: zodResolver(CreateEventSchema) as never,
		defaultValues: {
			price: 0,
			latitude: 50.0755, // Prague default
			longitude: 14.4378,
		},
	})

	const onSubmit = (data: CreateEventFormData) => {
		createMutation.mutate({
			...data,
			category: data.category as never,
			endTime: data.endTime || undefined,
			durationMinutes: data.durationMinutes || undefined,
		})
	}

	return (
		<div className="container max-w-2xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate('/events')}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Zpět na události
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Vytvořit novou událost</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Název</Label>
							<Input
								id="title"
								placeholder="např. Ranní jóga v parku"
								{...register('title')}
							/>
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
								placeholder="Popište svou událost..."
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
							<Select onValueChange={(value) => setValue('category', value)}>
								<SelectTrigger>
									<SelectValue placeholder="Vyberte kategorii" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat.value} value={cat.value}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.category && (
								<p className="text-destructive text-sm">
									{errors.category.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="date">Datum</Label>
								<Input id="date" type="date" {...register('date')} />
								{errors.date && (
									<p className="text-destructive text-sm">
										{errors.date.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="startTime">Čas začátku</Label>
								<Input id="startTime" type="time" {...register('startTime')} />
								{errors.startTime && (
									<p className="text-destructive text-sm">
										{errors.startTime.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="endTime">Čas konce (nepovinné)</Label>
								<Input id="endTime" type="time" {...register('endTime')} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="durationMinutes">Délka (min, nepovinné)</Label>
								<Input
									id="durationMinutes"
									type="number"
									placeholder="60"
									{...register('durationMinutes')}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="locationName">Název místa</Label>
							<Input
								id="locationName"
								placeholder="např. Dvůr na Vinohradské 12"
								{...register('locationName')}
							/>
							{errors.locationName && (
								<p className="text-destructive text-sm">
									{errors.locationName.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Adresa</Label>
							<Input
								id="address"
								placeholder="Celá adresa"
								{...register('address')}
							/>
							{errors.address && (
								<p className="text-destructive text-sm">
									{errors.address.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="latitude">Zeměpisná šířka</Label>
								<Input
									id="latitude"
									type="number"
									step="any"
									{...register('latitude')}
								/>
								{errors.latitude && (
									<p className="text-destructive text-sm">
										{errors.latitude.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="longitude">Zeměpisná délka</Label>
								<Input
									id="longitude"
									type="number"
									step="any"
									{...register('longitude')}
								/>
								{errors.longitude && (
									<p className="text-destructive text-sm">
										{errors.longitude.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="price">Cena (Kč, 0 = zdarma)</Label>
								<Input
									id="price"
									type="number"
									min={0}
									{...register('price')}
								/>
								{errors.price && (
									<p className="text-destructive text-sm">
										{errors.price.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="capacity">Kapacita</Label>
								<Input
									id="capacity"
									type="number"
									min={1}
									placeholder="10"
									{...register('capacity')}
								/>
								{errors.capacity && (
									<p className="text-destructive text-sm">
										{errors.capacity.message}
									</p>
								)}
							</div>
						</div>

						{createMutation.error && (
							<div className="p-3 rounded-lg bg-destructive/20 border border-destructive/30">
								<p className="text-destructive text-sm">
									{createMutation.error.message}
								</p>
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending
								? 'Vytváření události...'
								: 'Vytvořit událost'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
