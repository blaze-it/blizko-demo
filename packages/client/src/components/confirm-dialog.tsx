import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

// ============================================
// TYPES
// ============================================

export interface ConfirmOptions {
	/** Dialog title - shown prominently at top */
	title: string

	/**
	 * Dialog description - can be string or React node for rich content
	 * @example "Are you sure you want to delete this task?"
	 * @example <span>Delete <strong>{taskName}</strong>?</span>
	 */
	description: string | ReactNode

	/**
	 * Action button label
	 * @default "Confirm"
	 */
	actionLabel?: string

	/**
	 * Action button variant (maps to Button variant)
	 * @default "destructive"
	 */
	actionVariant?: ButtonProps['variant']

	/**
	 * Cancel button label
	 * @default "Cancel"
	 */
	cancelLabel?: string

	/**
	 * Icon component to display in header
	 * @default Trash2 for destructive, AlertTriangle otherwise
	 */
	icon?: LucideIcon

	/**
	 * Whether this is a destructive action (applies red styling to icon)
	 * @default true
	 */
	destructive?: boolean
}

interface ConfirmationContextValue {
	confirm: (options: ConfirmOptions) => Promise<boolean>
}

// ============================================
// CONTEXT
// ============================================

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null)

// ============================================
// PROVIDER
// ============================================

interface ConfirmationProviderProps {
	children: ReactNode
}

export function ConfirmationProvider({ children }: ConfirmationProviderProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [options, setOptions] = useState<ConfirmOptions | null>(null)

	// Store the promise resolver so we can resolve it when user confirms/cancels
	const resolverRef = useRef<((value: boolean) => void) | null>(null)

	// Cleanup on unmount - resolve any pending promise as cancelled
	useEffect(() => {
		return () => {
			if (resolverRef.current) {
				resolverRef.current(false)
				resolverRef.current = null
			}
		}
	}, [])

	const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
		// Resolve any pending promise as cancelled before opening new dialog
		if (resolverRef.current) {
			resolverRef.current(false)
			resolverRef.current = null
		}

		setOptions(opts)
		setIsOpen(true)

		return new Promise<boolean>((resolve) => {
			resolverRef.current = resolve
		})
	}, [])

	const handleConfirm = useCallback(() => {
		setIsOpen(false)
		resolverRef.current?.(true)
		resolverRef.current = null
	}, [])

	const handleCancel = useCallback(() => {
		setIsOpen(false)
		resolverRef.current?.(false)
		resolverRef.current = null
	}, [])

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				handleCancel()
			}
		},
		[handleCancel],
	)

	const contextValue = useMemo(() => ({ confirm }), [confirm])

	// Determine icon and styling
	const destructive = options?.destructive ?? true
	const Icon = options?.icon ?? (destructive ? Trash2 : AlertTriangle)
	const actionVariant =
		options?.actionVariant ?? (destructive ? 'destructive' : 'default')

	return (
		<ConfirmationContext.Provider value={contextValue}>
			{children}

			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Icon
								className={`h-5 w-5 ${destructive ? 'text-destructive' : 'text-amber'}`}
							/>
							{options?.title}
						</DialogTitle>
						<DialogDescription asChild>
							<div className="text-sm text-muted-foreground">
								{options?.description}
							</div>
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancel}>
							{options?.cancelLabel ?? 'Cancel'}
						</Button>
						<Button
							type="button"
							variant={actionVariant}
							onClick={handleConfirm}
						>
							{options?.actionLabel ?? 'Confirm'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</ConfirmationContext.Provider>
	)
}

// ============================================
// HOOK
// ============================================

export interface UseConfirmReturn {
	/**
	 * Show confirmation dialog and wait for user response
	 * @returns Promise that resolves to true if confirmed, false if cancelled
	 */
	confirm: (options: ConfirmOptions) => Promise<boolean>

	/**
	 * Quick helper for delete confirmations
	 * @param itemType - Type of item being deleted (e.g., "task", "comment", "entry")
	 * @param itemName - Name/identifier of the item (optional)
	 */
	confirmDelete: (itemType: string, itemName?: string) => Promise<boolean>

	/**
	 * Quick helper for dangerous/warning actions
	 */
	confirmDangerous: (
		title: string,
		description: string | ReactNode,
	) => Promise<boolean>
}

/**
 * Hook to show confirmation dialogs imperatively
 *
 * @example
 * const { confirm, confirmDelete } = useConfirm()
 *
 * // Simple delete confirmation
 * const handleDelete = async () => {
 *   if (await confirmDelete('task')) {
 *     deleteMutation.mutate({ id })
 *   }
 * }
 *
 * // Custom confirmation
 * const handleAction = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Task',
 *     description: 'Are you sure? This cannot be undone.',
 *     actionLabel: 'Delete',
 *     icon: Trash2,
 *   })
 *   if (confirmed) {
 *     mutation.mutate()
 *   }
 * }
 */
export function useConfirm(): UseConfirmReturn {
	const context = useContext(ConfirmationContext)

	if (!context) {
		throw new Error('useConfirm must be used within a ConfirmationProvider')
	}

	const confirmDelete = useCallback(
		(itemType: string, itemName?: string): Promise<boolean> => {
			const description = itemName ? (
				<>
					Are you sure you want to delete{' '}
					<span className="font-semibold text-foreground">{itemName}</span>?
					This action cannot be undone.
				</>
			) : (
				`Are you sure you want to delete this ${itemType}? This action cannot be undone.`
			)

			return context.confirm({
				title: `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
				description,
				actionLabel: 'Delete',
				actionVariant: 'destructive',
				icon: Trash2,
				destructive: true,
			})
		},
		[context],
	)

	const confirmDangerous = useCallback(
		(title: string, description: string | ReactNode): Promise<boolean> => {
			return context.confirm({
				title,
				description,
				actionLabel: 'Confirm',
				actionVariant: 'destructive',
				icon: AlertTriangle,
				destructive: true,
			})
		},
		[context],
	)

	return {
		confirm: context.confirm,
		confirmDelete,
		confirmDangerous,
	}
}
