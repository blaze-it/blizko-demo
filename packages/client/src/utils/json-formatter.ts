/**
 * Determines if JSON should be pretty-printed or kept compact
 * Compact: single-line objects with <= 2 keys and <= 50 chars
 */
export function shouldPrettyPrint(value: unknown): boolean {
	if (typeof value !== 'object' || value === null) return false

	const keys = Object.keys(value)
	const size = JSON.stringify(value).length

	// Keep compact if: <= 2 keys AND <= 50 chars
	return keys.length > 2 || size > 50
}

/**
 * Format JSON with proper indentation
 * Uses 2-space indent for pretty-printing, or compact for small objects
 */
export function formatJSON(value: unknown): string {
	if (shouldPrettyPrint(value)) {
		return JSON.stringify(value, null, 2)
	}
	return JSON.stringify(value)
}

/**
 * Interface for syntax highlighting tokens
 */
export interface SyntaxToken {
	type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation'
	value: string
}

/**
 * Tokenize JSON string for syntax highlighting
 * Returns array of {type, value} tokens
 */
export function tokenizeJSON(jsonString: string): SyntaxToken[] {
	const tokens: SyntaxToken[] = []
	const regex =
		/"([^"\\]|\\.)*"|true|false|null|-?\d+\.?\d*([eE][+-]?\d+)?|[{}[\]:,]/g

	let match: RegExpExecArray | null = regex.exec(jsonString)
	let lastIndex = 0

	while (match !== null) {
		// Add any whitespace before token
		if (match.index > lastIndex) {
			tokens.push({
				type: 'punctuation',
				value: jsonString.substring(lastIndex, match.index),
			})
		}

		const value = match[0]

		// Determine token type
		if (value.startsWith('"')) {
			// Check if it's a key (followed by colon after whitespace)
			const afterMatch = jsonString
				.substring(match.index + value.length)
				.trimStart()
			if (afterMatch.startsWith(':')) {
				tokens.push({ type: 'key', value })
			} else {
				tokens.push({ type: 'string', value })
			}
		} else if (value === 'true' || value === 'false') {
			tokens.push({ type: 'boolean', value })
		} else if (value === 'null') {
			tokens.push({ type: 'null', value })
		} else if (/^-?\d/.test(value)) {
			tokens.push({ type: 'number', value })
		} else {
			tokens.push({ type: 'punctuation', value })
		}

		lastIndex = match.index + value.length
		match = regex.exec(jsonString)
	}

	// Add any remaining whitespace
	if (lastIndex < jsonString.length) {
		tokens.push({
			type: 'punctuation',
			value: jsonString.substring(lastIndex),
		})
	}

	return tokens
}
