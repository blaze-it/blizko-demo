// Central color definitions for consistent styling across the app

// Source type colors for time tracking entries
export const SOURCE_COLORS = {
	wheat: '#22c55e', // Green
	calories: '#f97316', // Orange
	recording: '#8b5cf6', // Purple
	time_entry: '#6ee7b7', // Emerald
} as const

export type SourceType = keyof typeof SOURCE_COLORS

// Project-specific colors (override source colors)
export const PROJECT_COLORS: Record<string, string> = {
	Sleep: '#eab308', // Yellow
}

// Helper to get entry color (considers project name first, then source)
export function getEntryColor(
	source: SourceType,
	projectName?: string,
): string {
	if (projectName && PROJECT_COLORS[projectName]) {
		return PROJECT_COLORS[projectName]
	}
	return SOURCE_COLORS[source] ?? SOURCE_COLORS.time_entry
}

// Helper to get source color (legacy, use getEntryColor for full support)
export function getSourceColor(source: SourceType): string {
	return SOURCE_COLORS[source] ?? SOURCE_COLORS.time_entry
}
