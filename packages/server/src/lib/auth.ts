import bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { username } from 'better-auth/plugins'
import { prisma } from '../utils/db.js'
import { env } from '../utils/env.js'

const IS_PROD = env.NODE_ENV === 'production'
const AUTH_SECRET = env.SESSION_SECRET.split(',')[0]

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	user: {
		modelName: 'User',
	},
	session: {
		modelName: 'Session',
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},
	account: {
		modelName: 'Account',
	},
	verification: {
		modelName: 'Verification',
	},
	secret: AUTH_SECRET,
	baseURL: IS_PROD
		? env.BETTER_AUTH_URL || 'http://localhost:4000'
		: 'http://localhost:4000',
	trustedOrigins: IS_PROD
		? [env.FRONTEND_URL ?? '', env.BETTER_AUTH_URL ?? ''].filter(Boolean)
		: [
				'http://localhost:3000',
				'http://localhost:4000',
				'http://localhost:5173',
			],
	emailAndPassword: {
		enabled: true,
		disableSignUp: false, // Allow registration for events platform
		password: {
			hash: async (password: string) => {
				return bcrypt.hash(password, 12)
			},
			verify: async ({ password, hash }) => bcrypt.compare(password, hash),
		},
	},
	plugins: [username()],
	advanced: {
		cookiePrefix: 'blizko',
		useSecureCookies: IS_PROD,
		crossSubDomainCookies: {
			enabled: !!env.COOKIE_DOMAIN,
			domain: env.COOKIE_DOMAIN,
		},
	},
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
