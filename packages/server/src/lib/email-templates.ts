import { sendEmail } from './email.js'

/**
 * Email template for when a user joins an event
 */
export async function eventJoinedEmail(params: {
	to: string
	userName: string
	eventTitle: string
	eventDate: string
	eventLocation: string
	eventUrl: string
}): Promise<boolean> {
	const { to, userName, eventTitle, eventDate, eventLocation, eventUrl } =
		params

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .event-details { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Registrace potvrzena!</h1>
    </div>
    <div class="content">
      <p>Ahoj ${userName},</p>
      <p>Tvoje registrace na akci byla potvrzena.</p>
      <div class="event-details">
        <h2 style="margin-top: 0;">${eventTitle}</h2>
        <p><strong>Kdy:</strong> ${eventDate}</p>
        <p><strong>Kde:</strong> ${eventLocation}</p>
      </div>
      <a href="${eventUrl}" class="button">Zobrazit akci</a>
    </div>
    <div class="footer">
      <p>Blizko - Tvoje sousedská komunita</p>
    </div>
  </div>
</body>
</html>
`

	const text = `
Ahoj ${userName},

Tvoje registrace na akci byla potvrzena.

${eventTitle}
Kdy: ${eventDate}
Kde: ${eventLocation}

Zobrazit akci: ${eventUrl}

Blizko - Tvoje sousedská komunita
`

	return sendEmail({
		to,
		subject: `Registrace potvrzena: ${eventTitle}`,
		html,
		text,
	})
}

/**
 * Email template for when an event is cancelled
 */
export async function eventCancelledEmail(params: {
	to: string
	userName: string
	eventTitle: string
	eventDate: string
	organizerName: string
	reason?: string
}): Promise<boolean> {
	const { to, userName, eventTitle, eventDate, organizerName, reason } = params

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .event-details { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Akce zrušena</h1>
    </div>
    <div class="content">
      <p>Ahoj ${userName},</p>
      <p>Bohužel musíme oznámit, že následující akce byla zrušena:</p>
      <div class="event-details">
        <h2 style="margin-top: 0;">${eventTitle}</h2>
        <p><strong>Původní termín:</strong> ${eventDate}</p>
        <p><strong>Organizátor:</strong> ${organizerName}</p>
        ${reason ? `<p><strong>Důvod:</strong> ${reason}</p>` : ''}
      </div>
      <p>Omlouváme se za nepříjemnosti. Sleduj další akce v tvém okolí!</p>
    </div>
    <div class="footer">
      <p>Blizko - Tvoje sousedská komunita</p>
    </div>
  </div>
</body>
</html>
`

	const text = `
Ahoj ${userName},

Bohužel musíme oznámit, že následující akce byla zrušena:

${eventTitle}
Původní termín: ${eventDate}
Organizátor: ${organizerName}
${reason ? `Důvod: ${reason}` : ''}

Omlouváme se za nepříjemnosti. Sleduj další akce v tvém okolí!

Blizko - Tvoje sousedská komunita
`

	return sendEmail({
		to,
		subject: `Akce zrušena: ${eventTitle}`,
		html,
		text,
	})
}

/**
 * Email template for payment confirmation
 */
export async function paymentConfirmationEmail(params: {
	to: string
	userName: string
	eventTitle: string
	eventDate: string
	amount: number
	currency: string
	receiptUrl?: string
}): Promise<boolean> {
	const { to, userName, eventTitle, eventDate, amount, currency, receiptUrl } =
		params

	const formattedAmount = new Intl.NumberFormat('cs-CZ', {
		style: 'currency',
		currency: currency,
	}).format(amount / 100)

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .payment-details { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .amount { font-size: 24px; font-weight: bold; color: #059669; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Platba přijata</h1>
    </div>
    <div class="content">
      <p>Ahoj ${userName},</p>
      <p>Tvoje platba byla úspěšně zpracována.</p>
      <div class="payment-details">
        <h2 style="margin-top: 0;">${eventTitle}</h2>
        <p><strong>Datum akce:</strong> ${eventDate}</p>
        <p class="amount">${formattedAmount}</p>
      </div>
      ${receiptUrl ? `<a href="${receiptUrl}" class="button">Stáhnout potvrzení</a>` : ''}
      <p style="margin-top: 20px;">Děkujeme za tvou účast!</p>
    </div>
    <div class="footer">
      <p>Blizko - Tvoje sousedská komunita</p>
    </div>
  </div>
</body>
</html>
`

	const text = `
Ahoj ${userName},

Tvoje platba byla úspěšně zpracována.

${eventTitle}
Datum akce: ${eventDate}
Částka: ${formattedAmount}

${receiptUrl ? `Stáhnout potvrzení: ${receiptUrl}` : ''}

Děkujeme za tvou účast!

Blizko - Tvoje sousedská komunita
`

	return sendEmail({
		to,
		subject: `Platba potvrzena: ${eventTitle}`,
		html,
		text,
	})
}

/**
 * Email template for new follower notification
 */
export async function newFollowerEmail(params: {
	to: string
	userName: string
	followerName: string
	followerProfileUrl: string
}): Promise<boolean> {
	const { to, userName, followerName, followerProfileUrl } = params

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Nový sledující!</h1>
    </div>
    <div class="content">
      <p>Ahoj ${userName},</p>
      <p><strong>${followerName}</strong> tě nyní sleduje.</p>
      <p>Uživatel bude dostávat upozornění na tvoje nové akce.</p>
      <a href="${followerProfileUrl}" class="button">Zobrazit profil</a>
    </div>
    <div class="footer">
      <p>Blizko - Tvoje sousedská komunita</p>
    </div>
  </div>
</body>
</html>
`

	const text = `
Ahoj ${userName},

${followerName} tě nyní sleduje.

Uživatel bude dostávat upozornění na tvoje nové akce.

Zobrazit profil: ${followerProfileUrl}

Blizko - Tvoje sousedská komunita
`

	return sendEmail({
		to,
		subject: `${followerName} tě nyní sleduje`,
		html,
		text,
	})
}
