import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Calendar, Mail, Pencil, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageTitle } from '@/hooks/use-page-title'
import { trpc } from '@/trpc/client'

const updateProfileSchema = z.object({
	name: z
		.string()
		.min(1, 'Jméno je povinné')
		.max(100, 'Jméno je příliš dlouhé'),
})

type UpdateProfileData = z.infer<typeof updateProfileSchema>

export function ProfilePage() {
	usePageTitle('Profil')
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const utils = trpc.useUtils()
	const { data: user, isLoading } = trpc.user.me.useQuery()

	const updateProfileMutation = trpc.user.updateProfile.useMutation({
		onSuccess: () => {
			toast.success('Profil byl úspěšně aktualizován')
			setIsEditDialogOpen(false)
			utils.user.me.invalidate()
		},
		onError: (error) => {
			toast.error(error.message || 'Nepodařilo se aktualizovat profil')
		},
	})

	const form = useForm<UpdateProfileData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user?.name || '',
		},
	})

	const onSubmit = (data: UpdateProfileData) => {
		updateProfileMutation.mutate(data)
	}

	const handleOpenEditDialog = () => {
		form.reset({ name: user?.name || '' })
		setIsEditDialogOpen(true)
	}

	if (isLoading) {
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
			<div className="container py-8">
				<p className="text-muted-foreground">Nepodařilo se načíst profil</p>
			</div>
		)
	}

	const formatDate = (date: Date | string) => {
		return new Intl.DateTimeFormat('cs-CZ', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(new Date(date))
	}

	return (
		<div className="container py-8">
			<div className="mb-6">
				<Button variant="ghost" size="sm" asChild className="mb-4">
					<Link to="/events">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Zpět na události
					</Link>
				</Button>
				<div className="flex items-center gap-3">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<User className="h-8 w-8 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-bold">{user.name || 'Profil'}</h1>
						<p className="text-muted-foreground">{user.email}</p>
					</div>
				</div>
			</div>

			{/* Account Information */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5 text-blue-500" />
							Informace o účtu
						</CardTitle>
						<Button variant="ghost" size="sm" onClick={handleOpenEditDialog}>
							<Pencil className="mr-2 h-4 w-4" />
							Upravit
						</Button>
					</div>
					<CardDescription>Základní údaje vašeho účtu</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1">
						<label className="text-sm font-medium text-muted-foreground">
							Jméno
						</label>
						<p className="text-lg">{user.name || 'Nenastaveno'}</p>
					</div>
					<div className="space-y-1">
						<label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
							<Mail className="h-3.5 w-3.5" />
							E-mail
						</label>
						<p className="text-lg">{user.email}</p>
					</div>
					<div className="space-y-1">
						<label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
							<Calendar className="h-3.5 w-3.5" />
							Členem od
						</label>
						<p className="text-lg">{formatDate(user.createdAt)}</p>
					</div>
				</CardContent>
			</Card>

			{/* Edit Profile Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Upravit profil</DialogTitle>
						<DialogDescription>
							Aktualizujte své profilové údaje
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="name">Jméno</Label>
								<Input
									id="name"
									placeholder="Zadejte své jméno"
									{...form.register('name')}
								/>
								{form.formState.errors.name && (
									<p className="text-sm text-destructive">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsEditDialogOpen(false)}
							>
								Zrušit
							</Button>
							<Button type="submit" disabled={updateProfileMutation.isPending}>
								{updateProfileMutation.isPending ? 'Ukládání...' : 'Uložit'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
