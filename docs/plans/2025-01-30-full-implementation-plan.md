# Zokoli Full Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement complete event platform with Stripe payments, discovery features, rating system, and social functionality.

**Architecture:** Extend existing Hono+tRPC backend with new routers for payments, reviews, follows, notifications. Add Stripe Connect for marketplace payments. Extend React frontend with new pages and components.

**Tech Stack:** Hono, tRPC, Prisma, PostgreSQL, Stripe (Connect + Checkout), React 19, React Router 7, Leaflet, Resend (email)

---

## Workstream Overview

This plan is divided into 5 parallel workstreams that can be executed by independent agents:

| Workstream | Description | Dependencies |
|------------|-------------|--------------|
| **WS1** | Infrastructure (Email, File Storage) | None |
| **WS2** | Stripe Payments | WS1 (email for receipts) |
| **WS3** | Discovery & Search | None |
| **WS4** | Reviews & Trust | None |
| **WS5** | Social Features | WS1 (email for notifications) |

---

# WORKSTREAM 1: INFRASTRUCTURE

## Task 1.1: Email Service Setup (Resend)

**Files:**
- Create: `packages/server/src/lib/email.ts`
- Create: `packages/server/src/lib/email-templates.ts`
- Modify: `packages/server/src/utils/env.ts`
- Modify: `.env.example`

**Step 1: Add environment variable**

In `packages/server/src/utils/env.ts`, add to schema:
```typescript
RESEND_API_KEY: z.string().optional(),
```

**Step 2: Create email service**

Create `packages/server/src/lib/email.ts`:
```typescript
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
      from: 'Zokoli <noreply@zokoli.cz>',
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
```

**Step 3: Create email templates**

Create `packages/server/src/lib/email-templates.ts`:
```typescript
export function eventJoinedEmail(params: {
  userName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventUrl: string
}) {
  return {
    subject: `Potvrzení účasti: ${params.eventTitle}`,
    html: `
      <h1>Ahoj ${params.userName}!</h1>
      <p>Tvá účast na akci <strong>${params.eventTitle}</strong> byla potvrzena.</p>
      <p><strong>Kdy:</strong> ${params.eventDate}</p>
      <p><strong>Kde:</strong> ${params.eventLocation}</p>
      <p><a href="${params.eventUrl}">Zobrazit detail akce</a></p>
    `,
    text: `Ahoj ${params.userName}! Tvá účast na akci ${params.eventTitle} byla potvrzena. Kdy: ${params.eventDate}. Kde: ${params.eventLocation}.`,
  }
}

export function eventCancelledEmail(params: {
  userName: string
  eventTitle: string
  organizerName: string
}) {
  return {
    subject: `Akce zrušena: ${params.eventTitle}`,
    html: `
      <h1>Ahoj ${params.userName},</h1>
      <p>Akce <strong>${params.eventTitle}</strong> od organizátora ${params.organizerName} byla bohužel zrušena.</p>
    `,
    text: `Ahoj ${params.userName}, akce ${params.eventTitle} od organizátora ${params.organizerName} byla bohužel zrušena.`,
  }
}

export function paymentConfirmationEmail(params: {
  userName: string
  eventTitle: string
  amount: number
  currency: string
  eventUrl: string
}) {
  return {
    subject: `Potvrzení platby: ${params.eventTitle}`,
    html: `
      <h1>Děkujeme za platbu!</h1>
      <p>Ahoj ${params.userName},</p>
      <p>Tvá platba za akci <strong>${params.eventTitle}</strong> byla úspěšně zpracována.</p>
      <p><strong>Částka:</strong> ${params.amount} ${params.currency}</p>
      <p><a href="${params.eventUrl}">Zobrazit vstupenku</a></p>
    `,
    text: `Ahoj ${params.userName}, tvá platba ${params.amount} ${params.currency} za akci ${params.eventTitle} byla úspěšně zpracována.`,
  }
}

export function newFollowerEmail(params: {
  userName: string
  followerName: string
  profileUrl: string
}) {
  return {
    subject: `${params.followerName} tě sleduje`,
    html: `
      <h1>Máš nového sledujícího!</h1>
      <p>Ahoj ${params.userName},</p>
      <p><strong>${params.followerName}</strong> tě začal sledovat na Zokoli.</p>
      <p><a href="${params.profileUrl}">Zobrazit profil</a></p>
    `,
    text: `Ahoj ${params.userName}, ${params.followerName} tě začal sledovat na Zokoli.`,
  }
}
```

**Step 4: Install Resend**

Run: `pnpm add resend --filter @zokoli/server`

**Step 5: Update .env.example**

Add: `RESEND_API_KEY=re_xxxxxxxxxxxx`

**Step 6: Commit**

```bash
git add packages/server/src/lib/email.ts packages/server/src/lib/email-templates.ts packages/server/src/utils/env.ts .env.example
git commit -m "feat: add Resend email service with templates"
```

---

## Task 1.2: File Storage Setup (Cloudflare R2)

**Files:**
- Create: `packages/server/src/lib/storage.ts`
- Modify: `packages/server/src/utils/env.ts`
- Modify: `.env.example`

**Step 1: Add environment variables**

In `packages/server/src/utils/env.ts`, add:
```typescript
R2_ACCOUNT_ID: z.string().optional(),
R2_ACCESS_KEY_ID: z.string().optional(),
R2_SECRET_ACCESS_KEY: z.string().optional(),
R2_BUCKET_NAME: z.string().optional(),
R2_PUBLIC_URL: z.string().optional(),
```

**Step 2: Create storage service**

Create `packages/server/src/lib/storage.ts`:
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../utils/env.js'
import { randomUUID } from 'crypto'

const s3 = env.R2_ACCOUNT_ID ? new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  },
}) : null

export async function uploadFile(
  file: Buffer,
  contentType: string,
  folder: string = 'uploads'
): Promise<string | null> {
  if (!s3 || !env.R2_BUCKET_NAME) {
    console.log('[Storage] R2 not configured, skipping upload')
    return null
  }

  const ext = contentType.split('/')[1] || 'bin'
  const key = `${folder}/${randomUUID()}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  }))

  return `${env.R2_PUBLIC_URL}/${key}`
}

export async function deleteFile(url: string): Promise<boolean> {
  if (!s3 || !env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
    return false
  }

  const key = url.replace(`${env.R2_PUBLIC_URL}/`, '')

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }))
    return true
  } catch {
    return false
  }
}
```

**Step 3: Install AWS SDK**

Run: `pnpm add @aws-sdk/client-s3 --filter @zokoli/server`

**Step 4: Update .env.example**

Add:
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=zokoli
R2_PUBLIC_URL=https://cdn.zokoli.cz
```

**Step 5: Commit**

```bash
git add packages/server/src/lib/storage.ts packages/server/src/utils/env.ts .env.example
git commit -m "feat: add Cloudflare R2 file storage service"
```

---

## Task 1.3: Image Upload Endpoint

**Files:**
- Create: `packages/server/src/trpc/routers/upload.ts`
- Modify: `packages/server/src/trpc/routers/index.ts`

**Step 1: Create upload router**

Create `packages/server/src/trpc/routers/upload.ts`:
```typescript
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc.js'
import { uploadFile, deleteFile } from '../../lib/storage.js'
import { Errors } from '@zokoli/shared'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const uploadRouter = router({
  uploadImage: protectedProcedure
    .input(z.object({
      base64: z.string(),
      contentType: z.string(),
      folder: z.enum(['events', 'profiles']).default('events'),
    }))
    .mutation(async ({ input }) => {
      if (!ALLOWED_TYPES.includes(input.contentType)) {
        throw Errors.validation('Invalid image type. Allowed: JPEG, PNG, WebP')
      }

      const buffer = Buffer.from(input.base64, 'base64')

      if (buffer.length > MAX_FILE_SIZE) {
        throw Errors.validation('Image too large. Max 5MB.')
      }

      const url = await uploadFile(buffer, input.contentType, input.folder)

      if (!url) {
        throw Errors.unknown('Failed to upload image')
      }

      return { url }
    }),

  deleteImage: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      await deleteFile(input.url)
      return { success: true }
    }),
})
```

**Step 2: Register router**

In `packages/server/src/trpc/routers/index.ts`, add:
```typescript
import { uploadRouter } from './upload.js'

export const appRouter = router({
  events: eventsRouter,
  user: userRouter,
  upload: uploadRouter,
})
```

**Step 3: Commit**

```bash
git add packages/server/src/trpc/routers/upload.ts packages/server/src/trpc/routers/index.ts
git commit -m "feat: add image upload endpoint with R2 storage"
```

---

# WORKSTREAM 2: STRIPE PAYMENTS

## Task 2.1: Database Schema for Payments

**Files:**
- Modify: `packages/server/prisma/schema.prisma`

**Step 1: Add payment models**

Add to `packages/server/prisma/schema.prisma`:
```prisma
// Add to User model:
model User {
  // ... existing fields
  stripeCustomerId  String?   @unique
  stripeAccountId   String?   @unique
  stripeOnboarded   Boolean   @default(false)

  // ... existing relations
  payments          Payment[]
  payouts           Payout[]
}

// New models:
model Payment {
  id                    String        @id @default(cuid())
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  amount                Int           // in smallest currency unit (haléře)
  currency              String        @default("CZK")
  status                PaymentStatus @default(PENDING)
  stripePaymentIntentId String?       @unique
  stripeSessionId       String?       @unique
  eventId               String
  userId                String

  event   Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
}

model Payout {
  id               String       @id @default(cuid())
  createdAt        DateTime     @default(now())
  amount           Int
  currency         String       @default("CZK")
  status           PayoutStatus @default(PENDING)
  stripeTransferId String?      @unique
  organizerId      String
  eventId          String?

  organizer User   @relation(fields: [organizerId], references: [id], onDelete: Cascade)
  event     Event? @relation(fields: [eventId], references: [id], onDelete: SetNull)
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
}

// Update Event model - add relation:
model Event {
  // ... existing fields
  payments     Payment[]
  payouts      Payout[]
}
```

**Step 2: Generate and push**

Run:
```bash
cd packages/server && pnpm prisma generate && pnpm prisma db push
```

**Step 3: Commit**

```bash
git add packages/server/prisma/schema.prisma
git commit -m "feat: add Payment and Payout models for Stripe"
```

---

## Task 2.2: Stripe SDK Setup

**Files:**
- Create: `packages/server/src/lib/stripe.ts`
- Modify: `packages/server/src/utils/env.ts`

**Step 1: Add environment variables**

In `packages/server/src/utils/env.ts`, add:
```typescript
STRIPE_SECRET_KEY: z.string().optional(),
STRIPE_WEBHOOK_SECRET: z.string().optional(),
STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
```

**Step 2: Create Stripe service**

Create `packages/server/src/lib/stripe.ts`:
```typescript
import Stripe from 'stripe'
import { env } from '../utils/env.js'

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export const PLATFORM_FEE_PERCENT = 10 // 10% platform fee

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENT / 100)
}
```

**Step 3: Install Stripe**

Run: `pnpm add stripe --filter @zokoli/server`

**Step 4: Update .env.example**

Add:
```
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_CONNECT_CLIENT_ID=ca_xxxx
```

**Step 5: Commit**

```bash
git add packages/server/src/lib/stripe.ts packages/server/src/utils/env.ts .env.example
git commit -m "feat: add Stripe SDK setup"
```

---

## Task 2.3: Stripe Connect Onboarding Router

**Files:**
- Create: `packages/server/src/trpc/routers/stripe.ts`
- Modify: `packages/server/src/trpc/routers/index.ts`

**Step 1: Create Stripe router**

Create `packages/server/src/trpc/routers/stripe.ts`:
```typescript
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc.js'
import { stripe, calculatePlatformFee } from '../../lib/stripe.js'
import { Errors } from '@zokoli/shared'
import { env } from '../../utils/env.js'

export const stripeRouter = router({
  // Get Connect onboarding link
  createConnectAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!stripe) throw Errors.unknown('Stripe not configured')

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
      })

      let accountId = user?.stripeAccountId

      // Create account if doesn't exist
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'CZ',
          email: user?.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })
        accountId = account.id

        await ctx.prisma.user.update({
          where: { id: ctx.userId },
          data: { stripeAccountId: accountId },
        })
      }

      // Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${env.FRONTEND_URL}/profile?stripe=refresh`,
        return_url: `${env.FRONTEND_URL}/profile?stripe=success`,
        type: 'account_onboarding',
      })

      return { url: accountLink.url }
    }),

  // Check onboarding status
  getConnectStatus: protectedProcedure
    .query(async ({ ctx }) => {
      if (!stripe) return { onboarded: false, canReceivePayments: false }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { stripeAccountId: true, stripeOnboarded: true },
      })

      if (!user?.stripeAccountId) {
        return { onboarded: false, canReceivePayments: false }
      }

      const account = await stripe.accounts.retrieve(user.stripeAccountId)
      const canReceivePayments = account.charges_enabled && account.payouts_enabled

      // Update onboarded status if changed
      if (canReceivePayments !== user.stripeOnboarded) {
        await ctx.prisma.user.update({
          where: { id: ctx.userId },
          data: { stripeOnboarded: canReceivePayments },
        })
      }

      return {
        onboarded: canReceivePayments,
        canReceivePayments,
        detailsSubmitted: account.details_submitted,
      }
    }),

  // Create Stripe dashboard link
  createDashboardLink: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!stripe) throw Errors.unknown('Stripe not configured')

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { stripeAccountId: true },
      })

      if (!user?.stripeAccountId) {
        throw Errors.validation('No Stripe account found')
      }

      const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId)
      return { url: loginLink.url }
    }),

  // Create checkout session for event
  createCheckoutSession: protectedProcedure
    .input(z.object({
      eventId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!stripe) throw Errors.unknown('Stripe not configured')

      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
        include: { organizer: true },
      })

      if (!event) throw Errors.notFound('Event', input.eventId)
      if (event.price === 0) throw Errors.validation('This event is free')
      if (!event.organizer.stripeAccountId) {
        throw Errors.validation('Organizer has not set up payments')
      }

      // Check if already paid
      const existingPayment = await ctx.prisma.payment.findUnique({
        where: { eventId_userId: { eventId: input.eventId, userId: ctx.userId } },
      })
      if (existingPayment?.status === 'SUCCEEDED') {
        throw Errors.conflict('You have already paid for this event')
      }

      const platformFee = calculatePlatformFee(event.price)

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: event.currency.toLowerCase(),
            product_data: {
              name: event.title,
              description: `Vstupné na akci: ${event.title}`,
            },
            unit_amount: event.price,
          },
          quantity: 1,
        }],
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: event.organizer.stripeAccountId,
          },
        },
        success_url: `${env.FRONTEND_URL}/events/${event.id}?payment=success`,
        cancel_url: `${env.FRONTEND_URL}/events/${event.id}?payment=cancelled`,
        metadata: {
          eventId: event.id,
          userId: ctx.userId,
        },
      })

      // Create pending payment record
      await ctx.prisma.payment.upsert({
        where: { eventId_userId: { eventId: input.eventId, userId: ctx.userId } },
        create: {
          eventId: input.eventId,
          userId: ctx.userId,
          amount: event.price,
          currency: event.currency,
          status: 'PENDING',
          stripeSessionId: session.id,
        },
        update: {
          stripeSessionId: session.id,
          status: 'PENDING',
        },
      })

      return { url: session.url }
    }),

  // Get payment status
  getPaymentStatus: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { eventId_userId: { eventId: input.eventId, userId: ctx.userId } },
      })
      return {
        hasPaid: payment?.status === 'SUCCEEDED',
        status: payment?.status || null,
      }
    }),

  // Get organizer earnings
  getEarnings: protectedProcedure
    .query(async ({ ctx }) => {
      const payments = await ctx.prisma.payment.findMany({
        where: {
          event: { organizerId: ctx.userId },
          status: 'SUCCEEDED',
        },
        include: { event: true },
      })

      const total = payments.reduce((sum, p) => sum + p.amount, 0)
      const platformFees = payments.reduce((sum, p) => sum + calculatePlatformFee(p.amount), 0)
      const netEarnings = total - platformFees

      return {
        totalRevenue: total,
        platformFees,
        netEarnings,
        paymentCount: payments.length,
      }
    }),
})
```

**Step 2: Register router**

In `packages/server/src/trpc/routers/index.ts`, add:
```typescript
import { stripeRouter } from './stripe.js'

export const appRouter = router({
  events: eventsRouter,
  user: userRouter,
  upload: uploadRouter,
  stripe: stripeRouter,
})
```

**Step 3: Commit**

```bash
git add packages/server/src/trpc/routers/stripe.ts packages/server/src/trpc/routers/index.ts
git commit -m "feat: add Stripe Connect onboarding and checkout"
```

---

## Task 2.4: Stripe Webhook Handler

**Files:**
- Modify: `packages/server/src/index.ts`

**Step 1: Add webhook endpoint**

In `packages/server/src/index.ts`, add before tRPC handler:
```typescript
import { stripe } from './lib/stripe.js'
import { sendEmail } from './lib/email.js'
import { paymentConfirmationEmail } from './lib/email-templates.js'

// Stripe webhook - must be before body parsing
app.post('/api/webhooks/stripe', async (c) => {
  if (!stripe) {
    return c.json({ error: 'Stripe not configured' }, 500)
  }

  const signature = c.req.header('stripe-signature')
  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: 'Missing signature' }, 400)
  }

  const body = await c.req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { eventId, userId } = session.metadata || {}

    if (eventId && userId) {
      // Update payment status
      await prisma.payment.update({
        where: { eventId_userId: { eventId, userId } },
        data: {
          status: 'SUCCEEDED',
          stripePaymentIntentId: session.payment_intent as string,
        },
      })

      // Add user as participant
      await prisma.eventParticipant.upsert({
        where: { eventId_userId: { eventId, userId } },
        create: { eventId, userId, status: 'CONFIRMED' },
        update: { status: 'CONFIRMED' },
      })

      // Send confirmation email
      const payment = await prisma.payment.findUnique({
        where: { eventId_userId: { eventId, userId } },
        include: { user: true, event: true },
      })

      if (payment?.user.email) {
        const emailContent = paymentConfirmationEmail({
          userName: payment.user.name || 'uživateli',
          eventTitle: payment.event.title,
          amount: payment.amount / 100,
          currency: payment.currency,
          eventUrl: `${env.FRONTEND_URL}/events/${eventId}`,
        })
        await sendEmail({ to: payment.user.email, ...emailContent })
      }
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const paymentIntentId = charge.payment_intent as string

    if (paymentIntentId) {
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: 'REFUNDED' },
      })
    }
  }

  return c.json({ received: true })
})
```

**Step 2: Add Stripe import to index.ts**

At the top:
```typescript
import Stripe from 'stripe'
```

**Step 3: Commit**

```bash
git add packages/server/src/index.ts
git commit -m "feat: add Stripe webhook handler for payment confirmation"
```

---

## Task 2.5: Frontend - Stripe Connect Onboarding

**Files:**
- Modify: `packages/client/src/routes/profile/index.tsx`

**Step 1: Add Connect onboarding UI**

Add to ProfilePage component:
```typescript
// Add to imports
import { useSearchParams } from 'react-router-dom'

// Inside component:
const [searchParams] = useSearchParams()
const stripeStatus = searchParams.get('stripe')

const { data: connectStatus } = trpc.stripe.getConnectStatus.useQuery()
const createConnectMutation = trpc.stripe.createConnectAccount.useMutation({
  onSuccess: (data) => {
    window.location.href = data.url
  },
})
const createDashboardMutation = trpc.stripe.createDashboardLink.useMutation({
  onSuccess: (data) => {
    window.open(data.url, '_blank')
  },
})

// Show toast on return from Stripe
useEffect(() => {
  if (stripeStatus === 'success') {
    toast.success('Stripe účet byl úspěšně propojen!')
  } else if (stripeStatus === 'refresh') {
    toast.info('Prosím dokončete nastavení Stripe účtu')
  }
}, [stripeStatus])

// Add to JSX after profile section:
<Card className="mt-6">
  <CardHeader>
    <CardTitle>Příjem plateb</CardTitle>
    <CardDescription>
      Propojte svůj Stripe účet pro příjem plateb za placené akce
    </CardDescription>
  </CardHeader>
  <CardContent>
    {connectStatus?.onboarded ? (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Stripe účet je aktivní</span>
        </div>
        <Button
          variant="outline"
          onClick={() => createDashboardMutation.mutate()}
          disabled={createDashboardMutation.isPending}
        >
          Otevřít Stripe Dashboard
        </Button>
      </div>
    ) : (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Pro příjem plateb za placené akce je potřeba propojit Stripe účet.
        </p>
        <Button
          onClick={() => createConnectMutation.mutate()}
          disabled={createConnectMutation.isPending}
        >
          {createConnectMutation.isPending ? 'Přesměrování...' : 'Propojit Stripe účet'}
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

**Step 2: Commit**

```bash
git add packages/client/src/routes/profile/index.tsx
git commit -m "feat: add Stripe Connect onboarding to profile"
```

---

## Task 2.6: Frontend - Checkout Button

**Files:**
- Modify: `packages/client/src/routes/events/events-detail-page.tsx`

**Step 1: Add payment handling**

Add to EventsDetailPage:
```typescript
// Add query and mutation
const { data: paymentStatus } = trpc.stripe.getPaymentStatus.useQuery(
  { eventId: id! },
  { enabled: !!id && !!user && event?.price > 0 }
)

const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
  onSuccess: (data) => {
    if (data.url) window.location.href = data.url
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// Update join button logic
const isPaidEvent = event.price > 0
const hasPaid = paymentStatus?.hasPaid

// In JSX - replace join button:
{!isParticipant && !isOrganizer && (
  isPaidEvent ? (
    hasPaid ? (
      <Badge variant="success">Zaplaceno</Badge>
    ) : (
      <Button
        onClick={() => checkoutMutation.mutate({ eventId: id! })}
        disabled={checkoutMutation.isPending}
      >
        Zaplatit {event.price / 100} {event.currency}
      </Button>
    )
  ) : (
    <Button
      onClick={() => joinMutation.mutate({ eventId: id! })}
      disabled={joinMutation.isPending || isFull}
    >
      {isFull ? 'Plná kapacita' : 'Přihlásit se'}
    </Button>
  )
)}
```

**Step 2: Handle payment success**

Add useEffect:
```typescript
const [searchParams] = useSearchParams()
const paymentResult = searchParams.get('payment')

useEffect(() => {
  if (paymentResult === 'success') {
    toast.success('Platba proběhla úspěšně!')
    utils.events.getById.invalidate({ id: id! })
    utils.stripe.getPaymentStatus.invalidate({ eventId: id! })
  } else if (paymentResult === 'cancelled') {
    toast.info('Platba byla zrušena')
  }
}, [paymentResult])
```

**Step 3: Commit**

```bash
git add packages/client/src/routes/events/events-detail-page.tsx
git commit -m "feat: add Stripe checkout to event detail page"
```

---

# WORKSTREAM 3: DISCOVERY & SEARCH

## Task 3.1: Enhanced Map with Clustering

**Files:**
- Create: `packages/client/src/components/event-map.tsx`
- Modify: `packages/client/src/routes/events/events-page.tsx`

**Step 1: Install Leaflet clustering**

Run: `pnpm add react-leaflet-cluster --filter @zokoli/client`

**Step 2: Create EventMap component**

Create `packages/client/src/components/event-map.tsx`:
```typescript
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Icon, LatLngBounds } from 'leaflet'
import { Event } from '@zokoli/shared'
import { Link } from 'react-router-dom'
import { formatDate } from '@zokoli/shared'

interface EventMapProps {
  events: Event[]
  center?: [number, number]
  zoom?: number
  onBoundsChange?: (bounds: LatLngBounds) => void
}

const eventIcon = new Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapEvents({ onBoundsChange }: { onBoundsChange?: (bounds: LatLngBounds) => void }) {
  const map = useMap()

  useEffect(() => {
    if (!onBoundsChange) return

    const handleMoveEnd = () => {
      onBoundsChange(map.getBounds())
    }

    map.on('moveend', handleMoveEnd)
    return () => { map.off('moveend', handleMoveEnd) }
  }, [map, onBoundsChange])

  return null
}

export function EventMap({ events, center = [50.0755, 14.4378], zoom = 12, onBoundsChange }: EventMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-[400px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onBoundsChange={onBoundsChange} />
      <MarkerClusterGroup chunkedLoading>
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={eventIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <Link to={`/events/${event.id}`} className="font-semibold hover:underline">
                  {event.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.date)}
                </p>
                <p className="text-sm">
                  {event.price === 0 ? 'Zdarma' : `${event.price / 100} ${event.currency}`}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
```

**Step 3: Update EventsPage to use EventMap**

Replace map section in events-page.tsx:
```typescript
import { EventMap } from '@/components/event-map'

// In component:
const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null)

// In query - add bounds filter:
const { data } = trpc.events.list.useQuery({
  // ... existing filters
  ...(mapBounds && {
    minLat: mapBounds.getSouth(),
    maxLat: mapBounds.getNorth(),
    minLng: mapBounds.getWest(),
    maxLng: mapBounds.getEast(),
  }),
})

// In JSX:
<EventMap
  events={data?.items || []}
  onBoundsChange={setMapBounds}
/>
```

**Step 4: Commit**

```bash
git add packages/client/src/components/event-map.tsx packages/client/src/routes/events/events-page.tsx
git commit -m "feat: add clustered event map with bounds filtering"
```

---

## Task 3.2: Geolocation "Events Near Me"

**Files:**
- Modify: `packages/client/src/routes/events/events-page.tsx`

**Step 1: Add geolocation hook**

Add to EventsPage:
```typescript
const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
const [geoError, setGeoError] = useState<string | null>(null)

const requestLocation = () => {
  if (!navigator.geolocation) {
    setGeoError('Geolokace není podporována')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      setGeoError(null)
    },
    (error) => {
      setGeoError('Nepodařilo se získat polohu')
    }
  )
}

// Update query to use location:
const { data } = trpc.events.list.useQuery({
  // ... existing filters
  ...(userLocation && {
    lat: userLocation.lat,
    lng: userLocation.lng,
    radiusKm: 10,
  }),
})

// Add button to UI:
<Button
  variant="outline"
  onClick={requestLocation}
  className="gap-2"
>
  <MapPin className="h-4 w-4" />
  Akce poblíž
</Button>
{geoError && <p className="text-sm text-destructive">{geoError}</p>}
```

**Step 2: Commit**

```bash
git add packages/client/src/routes/events/events-page.tsx
git commit -m "feat: add geolocation for nearby events"
```

---

## Task 3.3: Fulltext Search with PostgreSQL

**Files:**
- Modify: `packages/server/src/trpc/routers/events.ts`
- Modify: `packages/server/prisma/schema.prisma`

**Step 1: Add search vector (optional - for better performance)**

The current implementation already does ILIKE search. For better fulltext, update the list query:

```typescript
// In events.ts list procedure, update WHERE clause:
...(input.search && {
  OR: [
    { title: { contains: input.search, mode: 'insensitive' } },
    { description: { contains: input.search, mode: 'insensitive' } },
    { locationName: { contains: input.search, mode: 'insensitive' } },
    { address: { contains: input.search, mode: 'insensitive' } },
  ],
}),
```

**Step 2: Commit**

```bash
git add packages/server/src/trpc/routers/events.ts
git commit -m "feat: enhance fulltext search to include location"
```

---

## Task 3.4: Price Filter

**Files:**
- Modify: `packages/server/src/trpc/routers/events.ts`
- Modify: `packages/client/src/routes/events/events-page.tsx`

**Step 1: Add price filter to backend**

In events.ts list schema:
```typescript
const listEventsSchema = z.object({
  // ... existing
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  freeOnly: z.boolean().optional(),
})

// In WHERE clause:
...(input.freeOnly && { price: 0 }),
...(input.priceMin !== undefined && { price: { gte: input.priceMin } }),
...(input.priceMax !== undefined && { price: { lte: input.priceMax } }),
```

**Step 2: Add price filter UI**

In events-page.tsx:
```typescript
const [freeOnly, setFreeOnly] = useState(false)

// In query:
const { data } = trpc.events.list.useQuery({
  // ... existing
  freeOnly: freeOnly || undefined,
})

// In UI:
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={freeOnly}
    onChange={(e) => setFreeOnly(e.target.checked)}
  />
  Pouze zdarma
</label>
```

**Step 3: Commit**

```bash
git add packages/server/src/trpc/routers/events.ts packages/client/src/routes/events/events-page.tsx
git commit -m "feat: add price filter to event search"
```

---

# WORKSTREAM 4: REVIEWS & TRUST

## Task 4.1: Review Database Model

**Files:**
- Modify: `packages/server/prisma/schema.prisma`

**Step 1: Add Review model**

```prisma
model Review {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  rating      Int      // 1-5
  comment     String?
  eventId     String
  reviewerId  String

  event    Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  reviewer User  @relation("ReviewsWritten", fields: [reviewerId], references: [id], onDelete: Cascade)

  @@unique([eventId, reviewerId])
}

// Update User model:
model User {
  // ... existing
  reviewsWritten  Review[] @relation("ReviewsWritten")
}

// Update Event model:
model Event {
  // ... existing
  reviews Review[]
}
```

**Step 2: Generate and push**

Run: `cd packages/server && pnpm prisma generate && pnpm prisma db push`

**Step 3: Commit**

```bash
git add packages/server/prisma/schema.prisma
git commit -m "feat: add Review model"
```

---

## Task 4.2: Reviews Router

**Files:**
- Create: `packages/server/src/trpc/routers/reviews.ts`
- Modify: `packages/server/src/trpc/routers/index.ts`

**Step 1: Create reviews router**

Create `packages/server/src/trpc/routers/reviews.ts`:
```typescript
import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc.js'
import { Errors } from '@zokoli/shared'

export const reviewsRouter = router({
  // Create review (only past participants)
  create: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user participated
      const participation = await ctx.prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: { eventId: input.eventId, userId: ctx.userId }
        },
        include: { event: true },
      })

      if (!participation) {
        throw Errors.forbidden('Můžete hodnotit pouze akce, kterých jste se zúčastnili')
      }

      // Check if event has ended
      if (participation.event.date > new Date()) {
        throw Errors.validation('Akci lze hodnotit až po jejím skončení')
      }

      // Check if already reviewed
      const existing = await ctx.prisma.review.findUnique({
        where: { eventId_reviewerId: { eventId: input.eventId, reviewerId: ctx.userId } },
      })

      if (existing) {
        throw Errors.conflict('Tuto akci jste již hodnotili')
      }

      return ctx.prisma.review.create({
        data: {
          eventId: input.eventId,
          reviewerId: ctx.userId,
          rating: input.rating,
          comment: input.comment,
        },
      })
    }),

  // Get reviews for event
  getByEvent: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { eventId: input.eventId },
        include: {
          reviewer: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

      return { reviews, avgRating, count: reviews.length }
    }),

  // Get organizer rating
  getOrganizerRating: publicProcedure
    .input(z.object({ organizerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { event: { organizerId: input.organizerId } },
      })

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

      return { avgRating, count: reviews.length }
    }),

  // Check if user can review
  canReview: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const participation = await ctx.prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId: input.eventId, userId: ctx.userId } },
        include: { event: true },
      })

      if (!participation) return { canReview: false, reason: 'not_participant' }
      if (participation.event.date > new Date()) return { canReview: false, reason: 'not_ended' }

      const existing = await ctx.prisma.review.findUnique({
        where: { eventId_reviewerId: { eventId: input.eventId, reviewerId: ctx.userId } },
      })

      if (existing) return { canReview: false, reason: 'already_reviewed' }

      return { canReview: true }
    }),

  // Delete own review
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.id },
      })

      if (!review) throw Errors.notFound('Review', input.id)
      if (review.reviewerId !== ctx.userId) {
        throw Errors.forbidden('Můžete smazat pouze vlastní hodnocení')
      }

      await ctx.prisma.review.delete({ where: { id: input.id } })
      return { success: true }
    }),
})
```

**Step 2: Register router**

In index.ts:
```typescript
import { reviewsRouter } from './reviews.js'

export const appRouter = router({
  // ... existing
  reviews: reviewsRouter,
})
```

**Step 3: Commit**

```bash
git add packages/server/src/trpc/routers/reviews.ts packages/server/src/trpc/routers/index.ts
git commit -m "feat: add reviews router"
```

---

## Task 4.3: Review UI Components

**Files:**
- Create: `packages/client/src/components/reviews/review-form.tsx`
- Create: `packages/client/src/components/reviews/review-list.tsx`
- Modify: `packages/client/src/routes/events/events-detail-page.tsx`

**Step 1: Create ReviewForm**

Create `packages/client/src/components/reviews/review-form.tsx`:
```typescript
import { useState } from 'react'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/ui/star-rating'
import { toast } from 'sonner'

interface ReviewFormProps {
  eventId: string
  onSuccess?: () => void
}

export function ReviewForm({ eventId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const utils = trpc.useUtils()

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success('Děkujeme za hodnocení!')
      utils.reviews.getByEvent.invalidate({ eventId })
      utils.reviews.canReview.invalidate({ eventId })
      onSuccess?.()
    },
    onError: (error) => toast.error(error.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Vyberte hodnocení')
      return
    }
    createMutation.mutate({ eventId, rating, comment: comment || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Hodnocení</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Komentář (volitelný)</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Napište svůj komentář..."
          rows={3}
        />
      </div>
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Odesílám...' : 'Odeslat hodnocení'}
      </Button>
    </form>
  )
}
```

**Step 2: Create ReviewList**

Create `packages/client/src/components/reviews/review-list.tsx`:
```typescript
import { trpc } from '@/trpc/client'
import { StarRating } from '@/components/ui/star-rating'
import { formatDate } from '@zokoli/shared'

interface ReviewListProps {
  eventId: string
}

export function ReviewList({ eventId }: ReviewListProps) {
  const { data, isLoading } = trpc.reviews.getByEvent.useQuery({ eventId })

  if (isLoading) return <div>Načítám hodnocení...</div>
  if (!data || data.reviews.length === 0) return <p className="text-muted-foreground">Zatím žádná hodnocení</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StarRating value={Math.round(data.avgRating || 0)} readonly />
        <span className="text-sm text-muted-foreground">
          ({data.avgRating?.toFixed(1)}) · {data.count} hodnocení
        </span>
      </div>
      <div className="space-y-4">
        {data.reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{review.reviewer.name || review.reviewer.username}</span>
              <StarRating value={review.rating} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
            {review.comment && <p>{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Add to EventDetailPage**

In events-detail-page.tsx:
```typescript
import { ReviewForm } from '@/components/reviews/review-form'
import { ReviewList } from '@/components/reviews/review-list'

// In component:
const { data: canReviewData } = trpc.reviews.canReview.useQuery(
  { eventId: id! },
  { enabled: !!id && !!user }
)

// In JSX, after participants section:
<section className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Hodnocení</h2>
  {canReviewData?.canReview && (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Ohodnoťte akci</h3>
      <ReviewForm eventId={id!} />
    </div>
  )}
  <ReviewList eventId={id!} />
</section>
```

**Step 4: Commit**

```bash
git add packages/client/src/components/reviews packages/client/src/routes/events/events-detail-page.tsx
git commit -m "feat: add review UI components"
```

---

# WORKSTREAM 5: SOCIAL FEATURES

## Task 5.1: Follow Database Model

**Files:**
- Modify: `packages/server/prisma/schema.prisma`

**Step 1: Add Follow model**

```prisma
model Follow {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  followerId  String
  followingId String

  follower  User @relation("Followers", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
}

// Update User model:
model User {
  // ... existing
  followers  Follow[] @relation("Following")
  following  Follow[] @relation("Followers")
}
```

**Step 2: Generate and push**

Run: `cd packages/server && pnpm prisma generate && pnpm prisma db push`

**Step 3: Commit**

```bash
git add packages/server/prisma/schema.prisma
git commit -m "feat: add Follow model"
```

---

## Task 5.2: Notification Database Model

**Files:**
- Modify: `packages/server/prisma/schema.prisma`

**Step 1: Add Notification model**

```prisma
model Notification {
  id        String           @id @default(cuid())
  createdAt DateTime         @default(now())
  type      NotificationType
  title     String
  body      String
  data      Json?
  read      Boolean          @default(false)
  userId    String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  NEW_FOLLOWER
  EVENT_FROM_FOLLOWING
  EVENT_REMINDER
  EVENT_CANCELLED
  EVENT_UPDATED
  PAYMENT_CONFIRMED
  REVIEW_RECEIVED
}

// Update User:
model User {
  // ... existing
  notifications Notification[]
}
```

**Step 2: Generate and push**

Run: `cd packages/server && pnpm prisma generate && pnpm prisma db push`

**Step 3: Commit**

```bash
git add packages/server/prisma/schema.prisma
git commit -m "feat: add Notification model"
```

---

## Task 5.3: Follow Router

**Files:**
- Create: `packages/server/src/trpc/routers/follows.ts`
- Modify: `packages/server/src/trpc/routers/index.ts`

**Step 1: Create follows router**

Create `packages/server/src/trpc/routers/follows.ts`:
```typescript
import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc.js'
import { Errors } from '@zokoli/shared'
import { sendEmail } from '../../lib/email.js'
import { newFollowerEmail } from '../../lib/email-templates.js'
import { env } from '../../utils/env.js'

export const followsRouter = router({
  // Follow user
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.userId) {
        throw Errors.validation('Nemůžete sledovat sami sebe')
      }

      const existing = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.userId,
            followingId: input.userId,
          },
        },
      })

      if (existing) {
        throw Errors.conflict('Tohoto uživatele již sledujete')
      }

      const follow = await ctx.prisma.follow.create({
        data: {
          followerId: ctx.userId,
          followingId: input.userId,
        },
        include: {
          follower: { select: { name: true, username: true } },
          following: { select: { email: true, name: true } },
        },
      })

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: input.userId,
          type: 'NEW_FOLLOWER',
          title: 'Nový sledující',
          body: `${follow.follower.name || follow.follower.username} vás začal sledovat`,
          data: { followerId: ctx.userId },
        },
      })

      // Send email
      if (follow.following.email) {
        const emailContent = newFollowerEmail({
          userName: follow.following.name || 'uživateli',
          followerName: follow.follower.name || follow.follower.username || 'Někdo',
          profileUrl: `${env.FRONTEND_URL}/users/${ctx.userId}`,
        })
        await sendEmail({ to: follow.following.email, ...emailContent })
      }

      return follow
    }),

  // Unfollow user
  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const follow = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.userId,
            followingId: input.userId,
          },
        },
      })

      if (!follow) {
        throw Errors.notFound('Follow')
      }

      await ctx.prisma.follow.delete({
        where: { id: follow.id },
      })

      return { success: true }
    }),

  // Check if following
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const follow = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.userId,
            followingId: input.userId,
          },
        },
      })
      return { isFollowing: !!follow }
    }),

  // Get followers
  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const followers = await ctx.prisma.follow.findMany({
        where: { followingId: input.userId },
        include: {
          follower: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return followers.map((f) => f.follower)
    }),

  // Get following
  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const following = await ctx.prisma.follow.findMany({
        where: { followerId: input.userId },
        include: {
          following: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return following.map((f) => f.following)
    }),

  // Get follow counts
  getCounts: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [followers, following] = await Promise.all([
        ctx.prisma.follow.count({ where: { followingId: input.userId } }),
        ctx.prisma.follow.count({ where: { followerId: input.userId } }),
      ])
      return { followers, following }
    }),
})
```

**Step 2: Register router**

```typescript
import { followsRouter } from './follows.js'

export const appRouter = router({
  // ... existing
  follows: followsRouter,
})
```

**Step 3: Commit**

```bash
git add packages/server/src/trpc/routers/follows.ts packages/server/src/trpc/routers/index.ts
git commit -m "feat: add follows router with notifications"
```

---

## Task 5.4: Notifications Router

**Files:**
- Create: `packages/server/src/trpc/routers/notifications.ts`
- Modify: `packages/server/src/trpc/routers/index.ts`

**Step 1: Create notifications router**

Create `packages/server/src/trpc/routers/notifications.ts`:
```typescript
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc.js'

export const notificationsRouter = router({
  // Get notifications
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
      unreadOnly: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.userId,
          ...(input.unreadOnly && { read: false }),
        },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
      })

      const hasMore = notifications.length > input.limit
      const items = hasMore ? notifications.slice(0, -1) : notifications

      return {
        items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
      }
    }),

  // Get unread count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const count = await ctx.prisma.notification.count({
        where: { userId: ctx.userId, read: false },
      })
      return { count }
    }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.updateMany({
        where: { id: input.id, userId: ctx.userId },
        data: { read: true },
      })
      return { success: true }
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.prisma.notification.updateMany({
        where: { userId: ctx.userId, read: false },
        data: { read: true },
      })
      return { success: true }
    }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.deleteMany({
        where: { id: input.id, userId: ctx.userId },
      })
      return { success: true }
    }),
})
```

**Step 2: Register router**

```typescript
import { notificationsRouter } from './notifications.js'

export const appRouter = router({
  // ... existing
  notifications: notificationsRouter,
})
```

**Step 3: Commit**

```bash
git add packages/server/src/trpc/routers/notifications.ts packages/server/src/trpc/routers/index.ts
git commit -m "feat: add notifications router"
```

---

## Task 5.5: Notification Bell Component

**Files:**
- Create: `packages/client/src/components/notification-bell.tsx`
- Modify: `packages/client/src/components/layout/app-layout.tsx`

**Step 1: Create NotificationBell**

Create `packages/client/src/components/notification-bell.tsx`:
```typescript
import { useState } from 'react'
import { Bell } from 'lucide-react'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@zokoli/shared'
import { Link } from 'react-router-dom'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const utils = trpc.useUtils()

  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30s
  })

  const { data: notifications } = trpc.notifications.list.useQuery(
    { limit: 10 },
    { enabled: open }
  )

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate()
      utils.notifications.list.invalidate()
    },
  })

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate()
      utils.notifications.list.invalidate()
    },
  })

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) {
      markAsReadMutation.mutate({ id })
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount?.count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              {unreadCount.count > 9 ? '9+' : unreadCount.count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5 border-b">
          <span className="font-semibold">Oznámení</span>
          {unreadCount?.count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              Označit vše jako přečtené
            </Button>
          )}
        </div>
        {notifications?.items.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Žádná oznámení
          </div>
        ) : (
          notifications?.items.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                !notification.read ? 'bg-muted/50' : ''
              }`}
              onClick={() => handleNotificationClick(notification.id, notification.read)}
            >
              <span className="font-medium">{notification.title}</span>
              <span className="text-sm text-muted-foreground">{notification.body}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(notification.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Step 2: Add to AppLayout header**

In app-layout.tsx, add to header:
```typescript
import { NotificationBell } from '@/components/notification-bell'

// In header section:
<div className="flex items-center gap-2">
  <NotificationBell />
  {/* existing user menu */}
</div>
```

**Step 3: Commit**

```bash
git add packages/client/src/components/notification-bell.tsx packages/client/src/components/layout/app-layout.tsx
git commit -m "feat: add notification bell component"
```

---

## Task 5.6: Follow Button Component

**Files:**
- Create: `packages/client/src/components/follow-button.tsx`

**Step 1: Create FollowButton**

Create `packages/client/src/components/follow-button.tsx`:
```typescript
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  className?: string
}

export function FollowButton({ userId, className }: FollowButtonProps) {
  const utils = trpc.useUtils()

  const { data: followStatus, isLoading } = trpc.follows.isFollowing.useQuery({ userId })

  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      toast.success('Uživatel sledován')
      utils.follows.isFollowing.invalidate({ userId })
      utils.follows.getCounts.invalidate({ userId })
    },
    onError: (error) => toast.error(error.message),
  })

  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => {
      toast.success('Sledování zrušeno')
      utils.follows.isFollowing.invalidate({ userId })
      utils.follows.getCounts.invalidate({ userId })
    },
    onError: (error) => toast.error(error.message),
  })

  if (isLoading) return null

  const isFollowing = followStatus?.isFollowing
  const isPending = followMutation.isPending || unfollowMutation.isPending

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      className={className}
      disabled={isPending}
      onClick={() => {
        if (isFollowing) {
          unfollowMutation.mutate({ userId })
        } else {
          followMutation.mutate({ userId })
        }
      }}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Přestat sledovat
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Sledovat
        </>
      )}
    </Button>
  )
}
```

**Step 2: Commit**

```bash
git add packages/client/src/components/follow-button.tsx
git commit -m "feat: add follow button component"
```

---

## Task 5.7: Public User Profile Page

**Files:**
- Create: `packages/client/src/routes/users/user-profile-page.tsx`
- Modify: `packages/client/src/app.tsx`

**Step 1: Create UserProfilePage**

Create `packages/client/src/routes/users/user-profile-page.tsx`:
```typescript
import { useParams } from 'react-router-dom'
import { trpc } from '@/trpc/client'
import { useAuth } from '@/contexts/auth-context'
import { FollowButton } from '@/components/follow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { usePageTitle } from '@/hooks/use-page-title'

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()

  const { data: user, isLoading } = trpc.user.getById.useQuery({ id: id! })
  const { data: followCounts } = trpc.follows.getCounts.useQuery({ userId: id! })
  const { data: organizerRating } = trpc.reviews.getOrganizerRating.useQuery({ organizerId: id! })
  const { data: events } = trpc.events.list.useQuery({ organizerId: id!, limit: 5 })

  usePageTitle(user?.name || 'Profil uživatele')

  if (isLoading) return <Skeleton className="h-96" />
  if (!user) return <div>Uživatel nenalezen</div>

  const isOwnProfile = currentUser?.id === id

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{user.name || user.username}</CardTitle>
              {user.neighborhood && (
                <p className="text-muted-foreground">{user.neighborhood}</p>
              )}
            </div>
            {!isOwnProfile && currentUser && (
              <FollowButton userId={id!} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {user.bio && <p className="mb-4">{user.bio}</p>}

          <div className="flex gap-6 mb-6">
            <div>
              <span className="font-semibold">{followCounts?.followers || 0}</span>
              <span className="text-muted-foreground ml-1">sledujících</span>
            </div>
            <div>
              <span className="font-semibold">{followCounts?.following || 0}</span>
              <span className="text-muted-foreground ml-1">sleduje</span>
            </div>
            {organizerRating?.count > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(organizerRating.avgRating || 0)} readonly size="sm" />
                <span className="text-sm text-muted-foreground">
                  ({organizerRating.count} hodnocení)
                </span>
              </div>
            )}
          </div>

          {events && events.items.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Akce od tohoto organizátora</h3>
              <ul className="space-y-2">
                {events.items.map((event) => (
                  <li key={event.id}>
                    <a href={`/events/${event.id}`} className="hover:underline">
                      {event.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Add user.getById to user router**

In `packages/server/src/trpc/routers/user.ts`:
```typescript
getById: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        neighborhood: true,
        createdAt: true,
      },
    })
    if (!user) throw Errors.notFound('User', input.id)
    return user
  }),
```

**Step 3: Add route**

In app.tsx:
```typescript
const UserProfilePage = lazy(() =>
  import('@/routes/users/user-profile-page').then((m) => ({
    default: m.UserProfilePage,
  }))
)

// In routes:
<Route path="/users/:id" element={<UserProfilePage />} />
```

**Step 4: Commit**

```bash
git add packages/client/src/routes/users/user-profile-page.tsx packages/server/src/trpc/routers/user.ts packages/client/src/app.tsx
git commit -m "feat: add public user profile page with follow"
```

---

## Task 5.8: Share Event Component

**Files:**
- Create: `packages/client/src/components/share-event.tsx`
- Modify: `packages/client/src/routes/events/events-detail-page.tsx`

**Step 1: Create ShareEvent**

Create `packages/client/src/components/share-event.tsx`:
```typescript
import { Share2, Facebook, MessageCircle, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShareEventProps {
  eventId: string
  eventTitle: string
}

export function ShareEvent({ eventId, eventTitle }: ShareEventProps) {
  const [copied, setCopied] = useState(false)
  const eventUrl = `${window.location.origin}/events/${eventId}`
  const encodedUrl = encodeURIComponent(eventUrl)
  const encodedTitle = encodeURIComponent(eventTitle)

  const copyLink = async () => {
    await navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    toast.success('Odkaz zkopírován')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      '_blank'
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Sdílet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={copyLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          Kopírovat odkaz
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Step 2: Add to EventDetailPage**

In events-detail-page.tsx:
```typescript
import { ShareEvent } from '@/components/share-event'

// In JSX header:
<ShareEvent eventId={id!} eventTitle={event.title} />
```

**Step 3: Commit**

```bash
git add packages/client/src/components/share-event.tsx packages/client/src/routes/events/events-detail-page.tsx
git commit -m "feat: add share event component"
```

---

# Final Steps

## Install All Dependencies

Run at project root:
```bash
pnpm install
```

## Generate Prisma Client

```bash
cd packages/server && pnpm prisma generate && pnpm prisma db push
```

## Final Commit

```bash
git add -A
git commit -m "chore: final cleanup and dependency updates"
```

---

**Plan complete and saved to `docs/plans/2025-01-30-full-implementation-plan.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
