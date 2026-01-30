import Stripe from 'stripe'
import { env } from '../utils/env.js'

export const stripe = env.STRIPE_SECRET_KEY
	? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' })
	: null

export const PLATFORM_FEE_PERCENT = 10

export function calculatePlatformFee(amount: number): number {
	return Math.round((amount * PLATFORM_FEE_PERCENT) / 100)
}
