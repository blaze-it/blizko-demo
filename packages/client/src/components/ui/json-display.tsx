import { type SyntaxToken, tokenizeJSON } from '@/utils/json-formatter'
import { cn } from '@/utils/misc'

interface JSONDisplayProps {
	value: string // Pre-formatted JSON string
	className?: string
}

export function JSONDisplay({ value, className }: JSONDisplayProps) {
	const tokens = tokenizeJSON(value)

	const getTokenClassName = (type: SyntaxToken['type']): string => {
		switch (type) {
			case 'key':
				return 'text-terracotta-dark'
			case 'string':
				return 'text-coral'
			case 'number':
				return 'text-primary'
			case 'boolean':
				return 'text-coral-light'
			case 'null':
				return 'text-muted-foreground'
			case 'punctuation':
				return 'text-foreground/70'
			default:
				return 'text-foreground'
		}
	}

	return (
		<code
			className={cn(
				'font-mono text-xs block whitespace-pre overflow-x-auto',
				className,
			)}
		>
			{tokens.map((token, idx) => (
				<span key={idx} className={getTokenClassName(token.type)}>
					{token.value}
				</span>
			))}
		</code>
	)
}
