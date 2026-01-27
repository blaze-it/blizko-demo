import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
	children: ReactNode
	fallback?: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Error boundary caught:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback
			return (
				<div className="flex min-h-screen items-center justify-center p-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-2">Něco se pokazilo</h1>
						<p className="text-muted-foreground mb-4">
							{this.state.error?.message}
						</p>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => this.setState({ hasError: false, error: null })}
						>
							Zkusit znovu
						</button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}
