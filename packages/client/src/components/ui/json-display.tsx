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
				return 'text-emerald' // hsl(158 64% 32%)
			case 'string':
				return 'text-amber' // hsl(38 92% 50%)
			case 'number':
				return 'text-emerald-light' // hsl(158 55% 42%)
			case 'boolean':
				return 'text-amber-light' // hsl(38 95% 60%)
			case 'null':
				return 'text-muted-foreground' // hsl(160 10% 55%)
			case 'punctuation':
				return 'text-cream/70' // hsl(45 20% 92% / 0.7)
			default:
				return 'text-cream'
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
