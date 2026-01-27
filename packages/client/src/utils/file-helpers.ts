/**
 * Validates if a file is an audio file.
 * Returns 'audio' if valid, null otherwise.
 */
export function getFileType(file: File): 'audio' | null {
	const ext = file.name.split('.').pop()?.toLowerCase()
	if (ext === 'mp3' || file.type.startsWith('audio/')) return 'audio'
	return null
}

/**
 * Converts a File to a base64 string.
 */
export async function fileToBase64(file: File): Promise<string> {
	const buffer = await file.arrayBuffer()
	return btoa(
		new Uint8Array(buffer).reduce(
			(data, byte) => data + String.fromCharCode(byte),
			'',
		),
	)
}

/**
 * Parses a recording date from a filename.
 * Expects format like "Recording 2024-01-15 at 10.30.mp3"
 * Returns current date if no date pattern found.
 */
export function parseRecordingDate(filename: string): Date {
	const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
	return dateMatch ? new Date(dateMatch[1]) : new Date()
}

/**
 * Generates a title from a filename by removing the extension.
 */
export function generateTitle(filename: string): string {
	return filename.replace(/\.[^/.]+$/, '')
}

/**
 * Formats file size in human-readable format.
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
