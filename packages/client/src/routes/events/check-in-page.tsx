import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Search,
	UserCheck,
	Users,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

export function CheckInPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const utils = trpc.useUtils()
	const [searchQuery, setSearchQuery] = useState('')
	const [manualInput, setManualInput] = useState('')

	const { data: event, isLoading: loadingEvent } = trpc.events.getById.useQuery(
		{ id: id! },
		{ enabled: !!id },
	)

	const { data: participants, isLoading: loadingParticipants } =
		trpc.events.getParticipants.useQuery(
			{ eventId: id! },
			{ enabled: !!id },
		)

	const checkInMutation = trpc.events.checkIn.useMutation({
		onSuccess: (data) => {
			toast.success(`${data.user.name || 'Ucastnik'} uspesne odbaven/a`)
			utils.events.getParticipants.invalidate({ eventId: id! })
			setManualInput('')
		},
		onError: (error) => {
			toast.error(error.message || 'Chyba pri odbaveni')
		},
	})

	usePageTitle(event?.title ? `Odbaveni - ${event.title}` : 'Odbaveni')

	if (loadingEvent || loadingParticipants) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		)
	}

	if (!event || !participants) {
		return (
			<div className="container text-center py-12">
				<p className="text-muted-foreground">Udalost nenalezena</p>
				<Button variant="ghost" onClick={() => navigate('/my-events')}>
					Zpet na moje udalosti
				</Button>
			</div>
		)
	}

	// Parse ZOKOLI:xxx format or use raw ID
	const parseQrOrId = (input: string): string => {
		const match = input.match(/^ZOKOLI:(.+)$/)
		return match ? match[1] : input
	}

	const handleManualCheckIn = () => {
		if (!manualInput.trim()) return
		const participantId = parseQrOrId(manualInput.trim())
		checkInMutation.mutate({ participantId })
	}

	const handleCheckIn = (participantId: string) => {
		checkInMutation.mutate({ participantId })
	}

	// Filter participants by search
	const filteredParticipants = participants.filter((p) => {
		if (!searchQuery) return true
		const q = searchQuery.toLowerCase()
		return (
			p.user.name?.toLowerCase().includes(q) ||
			p.user.email.toLowerCase().includes(q) ||
			p.id.toLowerCase().includes(q)
		)
	})

	// Stats
	const confirmedCount = participants.filter(
		(p) => p.status === 'CONFIRMED',
	).length
	const checkedInCount = participants.filter((p) => p.checkedInAt).length

	return (
		<div className="container max-w-4xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate(`/events/${id}`)}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Zpet na udalost
			</Button>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-xl">{event.title}</CardTitle>
					<p className="text-muted-foreground">
						{new Date(event.date).toLocaleDateString('cs-CZ', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}{' '}
						v {event.startTime}
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							<span>
								{confirmedCount} potvrzenych ucastniku
							</span>
						</div>
						<div className="flex items-center gap-2">
							<UserCheck className="h-5 w-5 text-green-500" />
							<span>
								{checkedInCount} odbavenych
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Manual Check-in Input */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-lg">Rucni odbaveni</CardTitle>
					<p className="text-sm text-muted-foreground">
						Zadejte ID vstupenky nebo naskenujte QR kod (format ZOKOLI:xxx)
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Input
							placeholder="ID vstupenky nebo ZOKOLI:xxx"
							value={manualInput}
							onChange={(e) => setManualInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleManualCheckIn()
							}}
							className="flex-1"
						/>
						<Button
							onClick={handleManualCheckIn}
							disabled={!manualInput.trim() || checkInMutation.isPending}
						>
							<UserCheck className="h-4 w-4 mr-2" />
							{checkInMutation.isPending ? 'Odbavuji...' : 'Odbavit'}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Participants List */}
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-lg">Seznam ucastniku</CardTitle>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Hledat ucastnika..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{filteredParticipants.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">
							{searchQuery
								? 'Zadny ucastnik neodpovida hledani'
								: 'Zatim zadni ucastnici'}
						</p>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Ucastnik</TableHead>
										<TableHead className="hidden sm:table-cell">Status</TableHead>
										<TableHead className="hidden sm:table-cell">Odbaveni</TableHead>
										<TableHead className="text-right">Akce</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredParticipants.map((p) => (
										<TableRow key={p.id}>
											<TableCell>
												<div>
													<p className="font-medium">
														{p.user.name || 'Anonymni'}
													</p>
													<p className="text-sm text-muted-foreground">
														{p.user.email}
													</p>
													{/* Show status on mobile */}
													<div className="flex gap-2 mt-1 sm:hidden">
														<ParticipantStatusBadge status={p.status} />
														{p.checkedInAt && (
															<Badge
																variant="secondary"
																className="bg-green-100 text-green-700"
															>
																<CheckCircle className="h-3 w-3 mr-1" />
																Odbaven/a
															</Badge>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell className="hidden sm:table-cell">
												<ParticipantStatusBadge status={p.status} />
											</TableCell>
											<TableCell className="hidden sm:table-cell">
												{p.checkedInAt ? (
													<div className="flex items-center gap-2 text-green-600">
														<CheckCircle className="h-4 w-4" />
														<span className="text-sm">
															{new Date(p.checkedInAt).toLocaleTimeString(
																'cs-CZ',
																{
																	hour: '2-digit',
																	minute: '2-digit',
																},
															)}
														</span>
													</div>
												) : (
													<div className="flex items-center gap-2 text-muted-foreground">
														<Clock className="h-4 w-4" />
														<span className="text-sm">Ceka</span>
													</div>
												)}
											</TableCell>
											<TableCell className="text-right">
												{p.checkedInAt ? (
													<Badge
														variant="secondary"
														className="bg-green-100 text-green-700"
													>
														<CheckCircle className="h-3 w-3 mr-1" />
														Hotovo
													</Badge>
												) : p.status === 'CANCELLED' ? (
													<Badge variant="destructive">Zruseno</Badge>
												) : (
													<Button
														size="sm"
														onClick={() => handleCheckIn(p.id)}
														disabled={checkInMutation.isPending}
													>
														<UserCheck className="h-4 w-4 mr-1" />
														Odbavit
													</Button>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

function ParticipantStatusBadge({ status }: { status: string }) {
	if (status === 'CONFIRMED') {
		return (
			<Badge variant="secondary" className="bg-blue-100 text-blue-700">
				Potvrzen
			</Badge>
		)
	}
	if (status === 'WAITLISTED') {
		return (
			<Badge variant="secondary" className="bg-amber-100 text-amber-700">
				Cekaci listina
			</Badge>
		)
	}
	if (status === 'CANCELLED') {
		return <Badge variant="destructive">Zruseno</Badge>
	}
	return <Badge variant="secondary">{status}</Badge>
}
