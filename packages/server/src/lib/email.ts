import { Resend } from 'resend'
import { env } from '../utils/env.js'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export interface SendEmailOptions {
	to: string
	subject: string
	html: string
	text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
	if (!resend) {
		console.log('[Email] Resend not configured, skipping:', options.subject)
		return false
	}

	try {
		await resend.emails.send({
			from: 'Blizko <noreply@blizko.cz>',
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
		})
		return true
	} catch (error) {
		console.error('[Email] Failed to send:', error)
		return false
	}
}
