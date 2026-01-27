import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export interface PageHeaderProps {
	/** Title to display in the header */
	title: string
	/** Icon component to display next to the title */
	icon?: LucideIcon
	/** CSS class for the icon color (e.g., "text-orange-600") */
	iconClassName?: string
	/** Path to navigate back to */
	backTo: string
	/** Label for the back button (e.g., "Back to Calorie Tracker") */
	backLabel: string
	/** Optional description below the title */
	description?: string
	/** Optional actions to display on the right side */
	actions?: React.ReactNode
}

/**
 * A reusable page header component with a back button, title, and optional icon.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Log Entry"
 *   icon={Flame}
 *   iconClassName="text-orange-600"
 *   backTo="/calories"
 *   backLabel="Back to Calorie Tracker"
 * />
 * ```
 */
export function PageHeader({
	title,
	icon: Icon,
	iconClassName,
	backTo,
	backLabel,
	description,
	actions,
}: PageHeaderProps) {
	const navigate = useNavigate()

	return (
		<div className="mb-6">
			<Button variant="ghost" onClick={() => navigate(backTo)} className="mb-4">
				<ArrowLeft className="h-4 w-4 mr-2" />
				{backLabel}
			</Button>
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
						{Icon && <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${iconClassName || ''}`} />}
						{title}
					</h1>
					{description && (
						<p className="text-muted-foreground mt-1">{description}</p>
					)}
				</div>
				{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
			</div>
		</div>
	)
}

export interface MainPageHeaderProps {
	/** Title to display in the header */
	title: string
	/** Icon component to display next to the title */
	icon?: LucideIcon
	/** CSS class for the icon color (e.g., "text-orange-600") */
	iconClassName?: string
	/** Optional description below the title */
	description?: string
	/** Optional actions to display on the right side */
	actions?: React.ReactNode
}

/**
 * A page header for main pages (no back button).
 *
 * @example
 * ```tsx
 * <MainPageHeader
 *   title="Calorie Tracker"
 *   icon={Flame}
 *   iconClassName="text-orange-600"
 *   description="Track your daily calorie intake"
 *   actions={<Button>Add Entry</Button>}
 * />
 * ```
 */
export function MainPageHeader({
	title,
	icon: Icon,
	iconClassName,
	description,
	actions,
}: MainPageHeaderProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
					{Icon && <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${iconClassName || ''}`} />}
					{title}
				</h1>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
		</div>
	)
}
