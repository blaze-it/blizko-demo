/**
 * Error handling utilities and types
 */

import { getErrorMessage } from './common.js'

/**
 * Application error codes for categorization
 */
export type ErrorCode =
	| 'UNKNOWN'
	| 'VALIDATION'
	| 'NOT_FOUND'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'CONFLICT'
	| 'RATE_LIMITED'
	| 'TIMEOUT'
	| 'NETWORK'
	| 'DATABASE'
	| 'EXTERNAL_SERVICE'
	| 'INTERNAL'

/**
 * Application error with additional context
 */
export class AppError extends Error {
	readonly code: ErrorCode
	readonly statusCode: number
	readonly isOperational: boolean
	readonly context?: Record<string, unknown>

	constructor(
		message: string,
		code: ErrorCode = 'UNKNOWN',
		options?: {
			statusCode?: number
			isOperational?: boolean
			context?: Record<string, unknown>
			cause?: Error
		},
	) {
		super(message, { cause: options?.cause })
		this.name = 'AppError'
		this.code = code
		this.statusCode = options?.statusCode ?? getDefaultStatusCode(code)
		this.isOperational = options?.isOperational ?? true
		this.context = options?.context

		// Maintains proper stack trace for where error was thrown
		Error.captureStackTrace?.(this, this.constructor)
	}

	toJSON(options?: { includeStack?: boolean }): Record<string, unknown> {
		const json: Record<string, unknown> = {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			context: this.context,
		}

		// Only include stack trace when explicitly requested (for debugging)
		if (options?.includeStack) {
			json.stack = this.stack
		}

		return json
	}
}

/**
 * Get default HTTP status code for error code
 */
function getDefaultStatusCode(code: ErrorCode): number {
	const statusCodes: Record<ErrorCode, number> = {
		UNKNOWN: 500,
		VALIDATION: 400,
		NOT_FOUND: 404,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		CONFLICT: 409,
		RATE_LIMITED: 429,
		TIMEOUT: 408,
		NETWORK: 502,
		DATABASE: 500,
		EXTERNAL_SERVICE: 502,
		INTERNAL: 500,
	}
	return statusCodes[code]
}

/**
 * Result type for operations that can fail
 * Use instead of try/catch for explicit error handling
 */
export type Result<T, E = AppError> =
	| { ok: true; value: T }
	| { ok: false; error: E }

/**
 * Create a successful result
 */
export function ok<T>(value: T): Result<T, never> {
	return { ok: true, value }
}

/**
 * Create a failed result
 */
export function err<E>(error: E): Result<never, E> {
	return { ok: false, error }
}

/**
 * Wrap a promise to return a Result
 */
export async function tryCatch<T>(
	promise: Promise<T>,
): Promise<Result<T, Error>> {
	try {
		const value = await promise
		return { ok: true, value }
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error : new Error(getErrorMessage(error)),
		}
	}
}

/**
 * Wrap a synchronous function to return a Result
 */
export function tryCatchSync<T>(fn: () => T): Result<T, Error> {
	try {
		const value = fn()
		return { ok: true, value }
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error : new Error(getErrorMessage(error)),
		}
	}
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(
	error: unknown,
	defaultCode: ErrorCode = 'UNKNOWN',
): AppError {
	if (error instanceof AppError) {
		return error
	}

	if (error instanceof Error) {
		return new AppError(error.message, defaultCode, {
			cause: error,
		})
	}

	return new AppError(getErrorMessage(error), defaultCode)
}

/**
 * Check if error is an operational error (expected, can be handled gracefully)
 * vs programming error (bug, should crash and restart)
 */
export function isOperationalError(error: unknown): boolean {
	if (error instanceof AppError) {
		return error.isOperational
	}
	return false
}

/**
 * Error factory functions for common error types
 */
export const Errors = {
	validation: (message: string, context?: Record<string, unknown>) =>
		new AppError(message, 'VALIDATION', { context }),

	/** Validation error for required fields */
	required: (field: string) =>
		new AppError(`${field} is required`, 'VALIDATION', {
			context: { field, rule: 'required' },
		}),

	/** Validation error for invalid field values */
	invalid: (field: string, reason?: string) =>
		new AppError(
			reason ? `${field}: ${reason}` : `Invalid ${field}`,
			'VALIDATION',
			{ context: { field, reason } },
		),

	notFound: (resource: string, id?: string) =>
		new AppError(
			id ? `${resource} with id '${id}' not found` : `${resource} not found`,
			'NOT_FOUND',
			{ context: { resource, id } },
		),

	unauthorized: (message = 'Authentication required') =>
		new AppError(message, 'UNAUTHORIZED'),

	forbidden: (message = 'Access denied') => new AppError(message, 'FORBIDDEN'),

	/** Forbidden error for ownership verification failures */
	notOwned: (resource: string, id?: string) =>
		new AppError(
			id
				? `${resource} '${id}' not found or access denied`
				: `${resource} not found or access denied`,
			'FORBIDDEN',
			{ context: { resource, id } },
		),

	conflict: (message: string, context?: Record<string, unknown>) =>
		new AppError(message, 'CONFLICT', { context }),

	/** Conflict error for duplicate entries */
	duplicate: (resource: string, field?: string) =>
		new AppError(
			field
				? `${resource} with this ${field} already exists`
				: `${resource} already exists`,
			'CONFLICT',
			{ context: { resource, field } },
		),

	rateLimited: (retryAfter?: number) =>
		new AppError('Too many requests', 'RATE_LIMITED', {
			context: { retryAfter },
		}),

	timeout: (operation: string, timeoutMs: number) =>
		new AppError(
			`Operation '${operation}' timed out after ${timeoutMs}ms`,
			'TIMEOUT',
			{
				context: { operation, timeoutMs },
			},
		),

	network: (message: string, cause?: Error) =>
		new AppError(message, 'NETWORK', { cause }),

	database: (message: string, cause?: Error) =>
		new AppError(message, 'DATABASE', { cause, isOperational: false }),

	externalService: (service: string, message: string, cause?: Error) =>
		new AppError(`${service}: ${message}`, 'EXTERNAL_SERVICE', {
			cause,
			context: { service },
		}),

	/** External service not configured */
	serviceNotConfigured: (service: string) =>
		new AppError(
			`${service} integration is not configured`,
			'EXTERNAL_SERVICE',
			{
				context: { service, configured: false },
			},
		),

	internal: (message: string, cause?: Error) =>
		new AppError(message, 'INTERNAL', { cause, isOperational: false }),

	/** Empty response from external service */
	emptyResponse: (service: string, operation?: string) =>
		new AppError(
			operation
				? `Empty response from ${service} during ${operation}`
				: `Empty response from ${service}`,
			'EXTERNAL_SERVICE',
			{ context: { service, operation, emptyResponse: true } },
		),
}

/**
 * Map AppError code to tRPC error code
 */
export function appErrorToTrpcCode(
	code: ErrorCode,
):
	| 'BAD_REQUEST'
	| 'NOT_FOUND'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'CONFLICT'
	| 'TOO_MANY_REQUESTS'
	| 'TIMEOUT'
	| 'INTERNAL_SERVER_ERROR' {
	const mapping: Record<
		ErrorCode,
		| 'BAD_REQUEST'
		| 'NOT_FOUND'
		| 'UNAUTHORIZED'
		| 'FORBIDDEN'
		| 'CONFLICT'
		| 'TOO_MANY_REQUESTS'
		| 'TIMEOUT'
		| 'INTERNAL_SERVER_ERROR'
	> = {
		UNKNOWN: 'INTERNAL_SERVER_ERROR',
		VALIDATION: 'BAD_REQUEST',
		NOT_FOUND: 'NOT_FOUND',
		UNAUTHORIZED: 'UNAUTHORIZED',
		FORBIDDEN: 'FORBIDDEN',
		CONFLICT: 'CONFLICT',
		RATE_LIMITED: 'TOO_MANY_REQUESTS',
		TIMEOUT: 'TIMEOUT',
		NETWORK: 'INTERNAL_SERVER_ERROR',
		DATABASE: 'INTERNAL_SERVER_ERROR',
		EXTERNAL_SERVICE: 'INTERNAL_SERVER_ERROR',
		INTERNAL: 'INTERNAL_SERVER_ERROR',
	}
	return mapping[code]
}
