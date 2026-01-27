import { logger } from './logger.js'

type ShutdownHandler = (options: { err?: Error }) => Promise<void>

export function onShutdown(handler: ShutdownHandler): void {
	let isShuttingDown = false

	const shutdown = async (err?: Error) => {
		if (isShuttingDown) return
		isShuttingDown = true

		const timer = setTimeout(() => {
			logger.error('Shutdown timed out, forcing exit')
			process.exit(1)
		}, 30_000)
		timer.unref()

		try {
			await handler({ err })
		} catch (e) {
			logger.error('Error during shutdown', e)
		}

		clearTimeout(timer)
		process.exit(err ? 1 : 0)
	}

	process.on('SIGTERM', () => shutdown())
	process.on('SIGINT', () => shutdown())
	process.on('uncaughtException', (err) => shutdown(err))
	process.on('unhandledRejection', (reason) => {
		shutdown(reason instanceof Error ? reason : new Error(String(reason)))
	})
}
