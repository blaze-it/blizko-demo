import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app'
import { ConfirmationProvider } from './components/confirm-dialog'
import { ErrorBoundary } from './components/error-boundary'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import { trpc, trpcClient } from './trpc/client'
import './styles/tailwind.css'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0,
			retry: 1,
		},
	},
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ErrorBoundary>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<BrowserRouter>
						<ThemeProvider>
							<AuthProvider>
								<ConfirmationProvider>
									<App />
								</ConfirmationProvider>
							</AuthProvider>
						</ThemeProvider>
					</BrowserRouter>
				</QueryClientProvider>
			</trpc.Provider>
		</ErrorBoundary>
	</React.StrictMode>,
)
