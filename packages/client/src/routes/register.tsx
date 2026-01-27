import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePageTitle } from '@/hooks/use-page-title'
import { signUp } from '@/lib/auth-client'

const RegisterSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	username: z.string().min(3, 'Username must be at least 3 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterFormData = z.infer<typeof RegisterSchema>

export function RegisterPage() {
	usePageTitle('Register')
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
				setError(result.error.message || 'Registration failed')
				return
			}

			navigate('/events')
		} catch (_err) {
			setError('An error occurred. Please try again.')
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
						<h1 className="font-display font-bold text-2xl">Join Blizko</h1>
						<p className="text-sm text-muted-foreground">
							Create an account to discover and organize local events
						</p>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									type="text"
									autoComplete="name"
									autoFocus
									placeholder="Your name"
									{...register('name')}
								/>
								{errors.name && (
									<p className="text-destructive text-sm">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									type="text"
									autoComplete="username"
									placeholder="Choose a username"
									{...register('username')}
								/>
								{errors.username && (
									<p className="text-destructive text-sm">
										{errors.username.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="your@email.com"
									{...register('email')}
								/>
								{errors.email && (
									<p className="text-destructive text-sm">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder="At least 8 characters"
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
								{isLoading ? 'Creating account...' : 'Create Account'}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
						<p className="text-sm text-muted-foreground">
							Already have an account?{' '}
							<Link to="/login" className="text-primary font-medium hover:underline">
								Sign in
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}
