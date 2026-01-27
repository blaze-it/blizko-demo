/**
 * Utility for merging Tailwind CSS class names
 *
 * Combines clsx for conditional classes with tailwind-merge
 * to handle conflicting Tailwind utilities.
 *
 * @example
 * cn('px-2 py-1', condition && 'px-4', 'text-sm')
 * // Properly merges: 'py-1 px-4 text-sm' (px-4 overrides px-2)
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}
