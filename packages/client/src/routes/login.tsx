import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePageTitle } from '@/hooks/use-page-title'
import { signIn } from '@/lib/auth-client'

const LoginSchema = z.object({
	username: z.string().min(1, 'Uživatelské jméno je povinné'),
	password: z.string().min(1, 'Heslo je povinné'),
})

type LoginFormData = z.infer<typeof LoginSchema>

export function LoginPage() {
	usePageTitle('Přihlášení')
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo') || '/events'
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(LoginSchema),
	})

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true)
		setError(null)

		try {
			const usernameResult = await signIn.username({
				username: data.username,
				password: data.password,
			})

			if (usernameResult.error && data.username.includes('@')) {
				const emailResult = await signIn.email({
					email: data.username,
					password: data.password,
				})
				if (emailResult.error) {
					setError(emailResult.error.message || 'Přihlášení selhalo')
					return
				}
			} else if (usernameResult.error) {
				setError(usernameResult.error.message || 'Přihlášení selhalo')
				return
			}

			navigate(redirectTo)
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
						<h1 className="font-display font-bold text-2xl">Vítejte zpět</h1>
						<p className="text-sm text-muted-foreground">
							Přihlaste se a objevujte lokální události
						</p>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="username">Uživatelské jméno nebo e-mail</Label>
								<Input
									id="username"
									type="text"
									autoComplete="username"
									autoFocus
									placeholder="Zadejte uživatelské jméno nebo e-mail"
									{...register('username')}
								/>
								{errors.username && (
									<p className="text-destructive text-sm">
										{errors.username.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Heslo</Label>
								<Input
									id="password"
									type="password"
									autoComplete="current-password"
									placeholder="Zadejte heslo"
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
								{isLoading ? 'Přihlašování...' : 'Přihlásit se'}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
						<p className="text-sm text-muted-foreground">
							Nemáte účet?{' '}
							<Link
								to="/register"
								className="text-primary font-medium hover:underline"
							>
								Zaregistrovat se
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}
