import { Errors } from '@zokoli/shared'
import { z } from 'zod'
import {
	deleteFile,
	getKeyFromUrl,
	isStorageConfigured,
	uploadFile,
} from '../../lib/storage.js'
import { protectedProcedure, router } from '../trpc.js'

// Allowed image MIME types
const ALLOWED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
] as const

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Validate base64 image data
function validateBase64Image(data: string): {
	valid: boolean
	mimeType?: string
	buffer?: Buffer
	error?: string
} {
	// Check for data URL format: data:image/type;base64,xxxxx
	const match = data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)

	if (!match) {
		return {
			valid: false,
			error: 'Invalid image format. Expected base64 data URL.',
		}
	}

	const mimeType = match[1]
	const base64Data = match[2]

	// Validate MIME type
	if (!ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number])) {
		return {
			valid: false,
			error: `Invalid image type: ${mimeType}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
		}
	}

	// Decode base64
	let buffer: Buffer
	try {
		buffer = Buffer.from(base64Data, 'base64')
	} catch {
		return { valid: false, error: 'Invalid base64 encoding' }
	}

	// Validate file size
	if (buffer.length > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
		}
	}

	return { valid: true, mimeType, buffer }
}

// Generate unique file key
function generateFileKey(userId: string, type: 'event' | 'profile'): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	return `${type}/${userId}/${timestamp}-${random}`
}

// Get file extension from MIME type
function getExtension(mimeType: string): string {
	const extensions: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/webp': '.webp',
		'image/gif': '.gif',
	}
	return extensions[mimeType] || '.jpg'
}

export const uploadRouter = router({
	/**
	 * Upload an image (event image or profile photo)
	 */
	uploadImage: protectedProcedure
		.input(
			z.object({
				data: z.string().min(1, 'Image data is required'),
				type: z.enum(['event', 'profile']).default('event'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if storage is configured
			if (!isStorageConfigured()) {
				throw Errors.serviceNotConfigured('File storage')
			}

			// Validate image
			const validation = validateBase64Image(input.data)
			if (!validation.valid || !validation.buffer || !validation.mimeType) {
				throw Errors.validation(validation.error || 'Invalid image')
			}

			// Generate unique key
			const extension = getExtension(validation.mimeType)
			const key = generateFileKey(ctx.userId, input.type) + extension

			// Upload to R2
			const result = await uploadFile({
				key,
				body: validation.buffer,
				contentType: validation.mimeType,
			})

			if (!result.success || !result.url) {
				throw Errors.externalService(
					'File storage',
					result.error || 'Upload failed',
				)
			}

			return { url: result.url }
		}),

	/**
	 * Delete an uploaded image
	 */
	deleteImage: protectedProcedure
		.input(
			z.object({
				url: z.string().url('Invalid URL'),
			}),
		)
		.mutation(async ({ input }) => {
			// Check if storage is configured
			if (!isStorageConfigured()) {
				throw Errors.serviceNotConfigured('File storage')
			}

			// Extract key from URL
			const key = getKeyFromUrl(input.url)
			if (!key) {
				throw Errors.validation('Invalid image URL')
			}

			// Delete from R2
			const success = await deleteFile(key)
			if (!success) {
				throw Errors.externalService('File storage', 'Delete failed')
			}

			return { success: true }
		}),
})
