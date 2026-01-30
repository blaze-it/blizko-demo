import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { env } from '../utils/env.js'

const isConfigured =
	env.R2_ACCOUNT_ID &&
	env.R2_ACCESS_KEY_ID &&
	env.R2_SECRET_ACCESS_KEY &&
	env.R2_BUCKET_NAME

const s3Client = isConfigured
	? new S3Client({
			region: 'auto',
			endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.R2_ACCESS_KEY_ID!,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
			},
		})
	: null

export interface UploadFileOptions {
	key: string
	body: Buffer
	contentType: string
}

export interface UploadResult {
	success: boolean
	url?: string
	error?: string
}

/**
 * Upload a file to R2 storage
 */
export async function uploadFile(
	options: UploadFileOptions,
): Promise<UploadResult> {
	if (!s3Client || !env.R2_BUCKET_NAME) {
		console.log('[Storage] R2 not configured, skipping upload:', options.key)
		return { success: false, error: 'Storage not configured' }
	}

	try {
		const command = new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: options.key,
			Body: options.body,
			ContentType: options.contentType,
		})

		await s3Client.send(command)

		const url = env.R2_PUBLIC_URL
			? `${env.R2_PUBLIC_URL}/${options.key}`
			: `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${options.key}`

		return { success: true, url }
	} catch (error) {
		console.error('[Storage] Failed to upload:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Upload failed',
		}
	}
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFile(key: string): Promise<boolean> {
	if (!s3Client || !env.R2_BUCKET_NAME) {
		console.log('[Storage] R2 not configured, skipping delete:', key)
		return false
	}

	try {
		const command = new DeleteObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: key,
		})

		await s3Client.send(command)
		return true
	} catch (error) {
		console.error('[Storage] Failed to delete:', error)
		return false
	}
}

/**
 * Check if storage is configured
 */
export function isStorageConfigured(): boolean {
	return s3Client !== null
}

/**
 * Extract key from a full R2 URL
 */
export function getKeyFromUrl(url: string): string | null {
	if (!env.R2_PUBLIC_URL) {
		return null
	}

	if (url.startsWith(env.R2_PUBLIC_URL)) {
		return url.slice(env.R2_PUBLIC_URL.length + 1)
	}

	return null
}
