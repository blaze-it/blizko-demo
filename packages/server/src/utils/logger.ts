export const logger = {
	debug(message: string, ...args: unknown[]) {
		console.debug(`[DEBUG] ${message}`, ...args)
	},
	info(message: string, ...args: unknown[]) {
		console.log(`[INFO] ${message}`, ...args)
	},
	warn(message: string, ...args: unknown[]) {
		console.warn(`[WARN] ${message}`, ...args)
	},
	error(message: string, ...args: unknown[]) {
		console.error(`[ERROR] ${message}`, ...args)
	},
}
