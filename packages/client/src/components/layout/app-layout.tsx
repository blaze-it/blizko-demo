import { Navigate, Outlet } from 'react-router-dom'
import { AppSideBar } from '@/components/app-sidebar'
import { ThemeSelector } from '@/components/theme-selector'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Unauthorized } from '@/components/unauthorized'
import { useAuth } from '@/contexts/auth-context'
import { trpc } from '@/trpc/client'

function AppLayoutContent() {
	return (
		<div className="flex min-h-screen flex-col justify-between w-full">
			<div className="flex min-h-screen w-full">
				<AppSideBar />
				<div className="flex-1 flex flex-col">
					<header className="container py-6">
						<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
							<SidebarTrigger />
							<div className="flex items-center gap-2">
								<ThemeSelector />
							</div>
						</nav>
					</header>
					<main className="flex-1 pb-16">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	)
}

export function AppLayout() {
	const { isUnauthorized } = useAuth()
	const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
		retry: false,
	})

	if (isUnauthorized) {
		return <Unauthorized />
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		)
	}

	if (!user) {
		return <Navigate to="/login" replace />
	}

	return <AppLayoutContent />
}
