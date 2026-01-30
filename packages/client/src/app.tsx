import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/app-layout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

// Public routes
import { LoginPage } from '@/routes/login'
import { RegisterPage } from '@/routes/register'

// Landing
const LandingPage = lazy(() =>
	import('@/routes/landing/landing-page').then((m) => ({
		default: m.LandingPage,
	})),
)

// Legal
const TermsPage = lazy(() =>
	import('@/routes/terms').then((m) => ({ default: m.TermsPage })),
)
const PrivacyPage = lazy(() =>
	import('@/routes/privacy').then((m) => ({ default: m.PrivacyPage })),
)

// Events
const EventsPage = lazy(() =>
	import('@/routes/events').then((m) => ({ default: m.EventsPage })),
)
const EventsDetailPage = lazy(() =>
	import('@/routes/events').then((m) => ({ default: m.EventsDetailPage })),
)
const EventsNewPage = lazy(() =>
	import('@/routes/events').then((m) => ({ default: m.EventsNewPage })),
)
const EventsEditPage = lazy(() =>
	import('@/routes/events').then((m) => ({ default: m.EventsEditPage })),
)
const MyEventsPage = lazy(() =>
	import('@/routes/events').then((m) => ({ default: m.MyEventsPage })),
)

// Profile
const ProfilePage = lazy(() =>
	import('@/routes/profile').then((m) => ({ default: m.ProfilePage })),
)

// Users
const UserProfilePage = lazy(() =>
	import('@/routes/users').then((m) => ({ default: m.UserProfilePage })),
)

function PageLoader() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<LoadingSpinner />
		</div>
	)
}

function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold">404</h1>
				<p className="mt-2 text-muted-foreground">Stránka nenalezena</p>
			</div>
		</div>
	)
}

export default function App() {
	return (
		<TooltipProvider>
			<Suspense fallback={<PageLoader />}>
				<Routes>
					{/* Public routes */}
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />

					{/* Landing page */}
					<Route path="/" element={<LandingPage />} />

					{/* Legal */}
					<Route path="/terms" element={<TermsPage />} />
					<Route path="/privacy" element={<PrivacyPage />} />

					{/* Protected routes */}
					<Route
						element={
							<SidebarProvider>
								<AppLayout />
							</SidebarProvider>
						}
					>
						{/* Events */}
						<Route path="/events" element={<EventsPage />} />
						<Route path="/events/new" element={<EventsNewPage />} />
						<Route path="/events/:id" element={<EventsDetailPage />} />
						<Route path="/events/:id/edit" element={<EventsEditPage />} />
						<Route path="/my-events" element={<MyEventsPage />} />

						{/* Profile */}
						<Route path="/profile" element={<ProfilePage />} />

						{/* Users */}
						<Route path="/users/:id" element={<UserProfilePage />} />

						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</Suspense>
			<Toaster closeButton position="top-center" theme="dark" />
		</TooltipProvider>
	)
}
