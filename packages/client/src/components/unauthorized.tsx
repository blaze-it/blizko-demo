import { ShieldAlert } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

export function Unauthorized() {
	const navigate = useNavigate()

	const handleSignOut = async () => {
		await signOut()
		navigate('/login')
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center max-w-md px-6">
				<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
					<ShieldAlert className="h-8 w-8 text-destructive" />
				</div>
				<h1 className="text-3xl font-bold text-cream">Session Expired</h1>
				<p className="mt-3 text-muted-foreground">
					Your session has expired or you are not authorized to access this
					page. Please log in again to continue.
				</p>
				<div className="mt-8 flex flex-col gap-3">
					<Button asChild>
						<Link to="/login">Log In</Link>
					</Button>
					<Button variant="ghost" onClick={handleSignOut}>
						Log Out & Clear Session
					</Button>
				</div>
			</div>
		</div>
	)
}
