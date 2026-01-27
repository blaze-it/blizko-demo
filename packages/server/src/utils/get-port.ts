/**
 * Simple utility to find an available port.
 * Replaces the 'get-port' package.
 */

import { createServer } from 'node:net'

/**
 * Check if a port is available.
 */
function isPortAvailable(port: number): Promise<boolean> {
	return new Promise((resolve) => {
		const server = createServer()
		server.once('error', () => resolve(false))
		server.once('listening', () => {
			server.close(() => resolve(true))
		})
		server.listen(port)
	})
}

/**
 * Find an available port, starting from the preferred port.
 * @param options.port - Preferred port or array of ports to try
 * @returns The first available port
 */
export async function getPort(options?: {
	port?: number | Iterable<number>
}): Promise<number> {
	const ports = options?.port
		? typeof options.port === 'number'
			? [options.port]
			: [...options.port]
		: [0]

	for (const port of ports) {
		if (await isPortAvailable(port)) {
			return port
		}
	}

	// Fallback: let the OS assign a port
	return new Promise((resolve, reject) => {
		const server = createServer()
		server.once('error', reject)
		server.once('listening', () => {
			const address = server.address()
			const port = typeof address === 'object' && address ? address.port : 0
			server.close(() => resolve(port))
		})
		server.listen(0)
	})
}

/**
 * Generate a range of port numbers.
 * @param from - Start port (inclusive)
 * @param to - End port (inclusive)
 */
export function portNumbers(from: number, to: number): Iterable<number> {
	return {
		*[Symbol.iterator]() {
			for (let port = from; port <= to; port++) {
				yield port
			}
		},
	}
}
