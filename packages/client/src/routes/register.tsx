import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePageTitle } from '@/hooks/use-page-title'
import { signUp } from '@/lib/auth-client'

const RegisterSchema = z.object({
	name: z.string().min(1, 'Jméno je povinné'),
	username: z.string().min(3, 'Uživatelské jméno musí mít alespoň 3 znaky'),
	email: z.string().email('Neplatná e-mailová adresa'),
	password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
})

type RegisterFormData = z.infer<typeof RegisterSchema>

export function RegisterPage() {
	usePageTitle('Registrace')
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(RegisterSchema),
	})

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true)
		setError(null)

		try {
			const result = await signUp.email({
				name: data.name,
				username: data.username,
				email: data.email,
				password: data.password,
			})

			if (result.error) {
				setError(result.error.message || 'Registrace selhala')
				return
			}

			navigate('/events')
		} catch (_err) {
			setError('Došlo k chybě. Zkuste to prosím znovu.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background">
			<div className="w-full max-w-md px-4">
				{/* Logo */}
				<div className="text-center mb-8">
					<Link to="/" className="inline-flex items-center gap-1.5 group">
						<span className="font-display font-bold text-3xl tracking-tight">
							blizko
						</span>
						<span className="w-2.5 h-2.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
					</Link>
				</div>

				<Card className="border-border shadow-warm-lg">
					<CardHeader className="space-y-1 text-center pb-2">
						<h1 className="font-display font-bold text-2xl">
							Přidejte se k Blizko
						</h1>
						<p className="text-sm text-muted-foreground">
							Vytvořte si účet a objevujte a organizujte lokální události
						</p>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Celé jméno</Label>
								<Input
									id="name"
									type="text"
									autoComplete="name"
									autoFocus
									placeholder="Vaše jméno"
									{...register('name')}
								/>
								{errors.name && (
									<p className="text-destructive text-sm">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="username">Uživatelské jméno</Label>
								<Input
									id="username"
									type="text"
									autoComplete="username"
									placeholder="Zvolte uživatelské jméno"
									{...register('username')}
								/>
								{errors.username && (
									<p className="text-destructive text-sm">
										{errors.username.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="vas@email.cz"
									{...register('email')}
								/>
								{errors.email && (
									<p className="text-destructive text-sm">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Heslo</Label>
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder="Alespoň 8 znaků"
									{...register('password')}
								/>
								{errors.password && (
									<p className="text-destructive text-sm">
										{errors.password.message}
									</p>
								)}
							</div>

							{error && (
								<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
									<p className="text-destructive text-sm">{error}</p>
								</div>
							)}

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Vytváření účtu...' : 'Vytvořit účet'}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
						<p className="text-sm text-muted-foreground">
							Už máte účet?{' '}
							<Link
								to="/login"
								className="text-primary font-medium hover:underline"
							>
								Přihlásit se
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}
