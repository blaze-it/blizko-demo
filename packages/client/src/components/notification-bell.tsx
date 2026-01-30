import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/trpc/client'
import { cn } from '@/utils/misc'

export function NotificationBell() {
	const navigate = useNavigate()
	const utils = trpc.useUtils()

	const { data: unreadCountData } = trpc.notifications.getUnreadCount.useQuery(
		undefined,
		{
			refetchInterval: 30000, // Poll every 30 seconds
		},
	)

	const { data: notificationsData } = trpc.notifications.list.useQuery({
		limit: 10,
	})

	const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
		onSuccess: () => {
			utils.notifications.getUnreadCount.invalidate()
			utils.notifications.list.invalidate()
		},
	})

	const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
		onSuccess: () => {
			utils.notifications.getUnreadCount.invalidate()
			utils.notifications.list.invalidate()
		},
	})

	const deleteMutation = trpc.notifications.delete.useMutation({
		onSuccess: () => {
			utils.notifications.getUnreadCount.invalidate()
			utils.notifications.list.invalidate()
		},
	})

	const unreadCount = unreadCountData?.count ?? 0
	const notifications = notificationsData?.items ?? []

	const handleNotificationClick = (notification: (typeof notifications)[0]) => {
		if (!notification.read) {
			markAsReadMutation.mutate({ id: notification.id })
		}

		// Navigate based on notification type
		const data = notification.data as Record<string, string> | null
		if (notification.type === 'NEW_FOLLOWER' && data?.followerId) {
			navigate(`/users/${data.followerId}`)
		} else if (
			(notification.type === 'EVENT_FROM_FOLLOWING' ||
				notification.type === 'EVENT_REMINDER' ||
				notification.type === 'EVENT_CANCELLED' ||
				notification.type === 'EVENT_UPDATED') &&
			data?.eventId
		) {
			navigate(`/events/${data.eventId}`)
		}
	}

	const formatTime = (date: Date | string) => {
		const now = new Date()
		const notifDate = new Date(date)
		const diffMs = now.getTime() - notifDate.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return 'Nyni'
		if (diffMins < 60) return `${diffMins} min`
		if (diffHours < 24) return `${diffHours} h`
		if (diffDays < 7) return `${diffDays} d`
		return notifDate.toLocaleDateString('cs-CZ')
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
					<span className="sr-only">Notifikace</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifikace</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-1 text-xs"
							onClick={(e) => {
								e.preventDefault()
								markAllAsReadMutation.mutate()
							}}
						>
							<CheckCheck className="mr-1 h-3 w-3" />
							Oznacit vse jako prectene
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{notifications.length === 0 ? (
					<div className="py-6 text-center text-sm text-muted-foreground">
						Zadne notifikace
					</div>
				) : (
					<div className="max-h-80 overflow-y-auto">
						{notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								className={cn(
									'flex cursor-pointer flex-col items-start gap-1 p-3',
									!notification.read && 'bg-primary/5',
								)}
								onClick={() => handleNotificationClick(notification)}
							>
								<div className="flex w-full items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<p
											className={cn(
												'text-sm truncate',
												!notification.read && 'font-semibold',
											)}
										>
											{notification.title}
										</p>
										<p className="text-xs text-muted-foreground line-clamp-2">
											{notification.body}
										</p>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										<span className="text-xs text-muted-foreground">
											{formatTime(notification.createdAt)}
										</span>
										{!notification.read && (
											<span className="h-2 w-2 rounded-full bg-primary" />
										)}
									</div>
								</div>
								<div className="flex gap-1 mt-1">
									{!notification.read && (
										<Button
											variant="ghost"
											size="sm"
											className="h-6 px-2 text-xs"
											onClick={(e) => {
												e.stopPropagation()
												markAsReadMutation.mutate({ id: notification.id })
											}}
										>
											<Check className="mr-1 h-3 w-3" />
											Precteno
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										className="h-6 px-2 text-xs text-destructive hover:text-destructive"
										onClick={(e) => {
											e.stopPropagation()
											deleteMutation.mutate({ id: notification.id })
										}}
									>
										<Trash2 className="mr-1 h-3 w-3" />
										Smazat
									</Button>
								</div>
							</DropdownMenuItem>
						))}
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
