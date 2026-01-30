import { CalendarDays, Home, LogOut, MapPin, Plus, Rss, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { signOut } from '@/lib/auth-client'
import { trpc } from '@/trpc/client'

const menuItems = [
	{ label: 'Domů', href: '/', icon: Home },
	{ label: 'Můj feed', href: '/feed', icon: Rss },
	{ label: 'Procházet události', href: '/events', icon: MapPin },
	{ label: 'Vytvořit událost', href: '/events/new', icon: Plus },
	{ label: 'Moje události', href: '/my-events', icon: CalendarDays },
	{ label: 'Profil', href: '/profile', icon: User },
]

export function AppSideBar() {
	const location = useLocation()
	const navigate = useNavigate()
	const { data: user } = trpc.user.me.useQuery()

	const handleSignOut = async () => {
		await signOut()
		navigate('/login')
	}

	return (
		<Sidebar>
			<SidebarHeader className="border-b border-border p-4">
				<Link to="/" className="inline-flex items-center gap-1.5 group">
					<span className="font-display font-bold text-xl tracking-tight">
						zokoli
					</span>
					<span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigace</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={location.pathname === item.href}
									>
										<Link to={item.href}>
											<item.icon className="h-4 w-4" />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-border p-4">
				{user && (
					<div className="flex items-center justify-between">
						<div className="text-sm">
							<p className="font-medium">{user.name || user.email}</p>
							<p className="text-muted-foreground text-xs">{user.email}</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleSignOut}
							title="Odhlásit se"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				)}
			</SidebarFooter>
		</Sidebar>
	)
}
