import QRCode from 'qrcode'

/**
 * Generates a QR code as a base64-encoded PNG data URL
 * @param participantId The event participant ID to encode
 * @returns Promise<string> Base64 data URL of the QR code PNG
 */
export async function generateTicketQRCode(
	participantId: string,
): Promise<string> {
	const content = `ZOKOLI:${participantId}`

	const dataUrl = await QRCode.toDataURL(content, {
		errorCorrectionLevel: 'M',
		type: 'image/png',
		width: 300,
		margin: 2,
		color: {
			dark: '#000000',
			light: '#FFFFFF',
		},
	})

	return dataUrl
}

/**
 * Generates a QR code as a PNG buffer
 * @param participantId The event participant ID to encode
 * @returns Promise<Buffer> PNG buffer of the QR code
 */
export async function generateTicketQRCodeBuffer(
	participantId: string,
): Promise<Buffer> {
	const content = `ZOKOLI:${participantId}`

	const buffer = await QRCode.toBuffer(content, {
		errorCorrectionLevel: 'M',
		type: 'png',
		width: 300,
		margin: 2,
		color: {
			dark: '#000000',
			light: '#FFFFFF',
		},
	})

	return buffer
}
