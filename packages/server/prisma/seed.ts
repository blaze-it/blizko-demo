import bcrypt from 'bcryptjs'
import { ROLES } from '../src/utils/config.js'
import { prisma } from '../src/utils/db.js'
import { toDateString } from '../src/utils/time-constants.js'

const TEST_USER = {
	username: 'testuser',
	email: 'test@example.com',
	password: 'testpass123',
	name: 'Test User',
}

async function seed() {
	console.log('🌱 Seeding...')
	console.time('🌱 Database has been seeded')

	// Create roles if they don't exist
	console.time('👑 Creating roles...')
	await Promise.all(
		ROLES.map((roleName) =>
			prisma.role.upsert({
				where: { name: roleName },
				update: {},
				create: {
					name: roleName,
					description: `${roleName.charAt(0).toUpperCase()}${roleName.slice(1)} role`,
				},
			}),
		),
	)
	console.timeEnd('👑 Creating roles...')

	// Create test user if doesn't exist
	console.time('👤 Creating test user...')
	const existingUser = await prisma.user.findFirst({
		where: { username: TEST_USER.username },
	})

	let userId: string
	if (!existingUser) {
		const passwordHash = await bcrypt.hash(TEST_USER.password, 10)
		const user = await prisma.user.create({
			data: {
				username: TEST_USER.username,
				email: TEST_USER.email,
				name: TEST_USER.name,
				emailVerified: true,
			},
		})
		userId = user.id

		// Create account entry for better-auth credential auth
		await prisma.account.create({
			data: {
				userId: user.id,
				providerId: 'credential',
				accountId: user.id,
				password: passwordHash,
			},
		})

		// Assign user role
		const userRole = await prisma.role.findUnique({ where: { name: 'user' } })
		if (userRole) {
			await prisma.user.update({
				where: { id: user.id },
				data: { roles: { connect: { id: userRole.id } } },
			})
		}

		console.log(`  Created user: ${TEST_USER.username} / ${TEST_USER.password}`)
	} else {
		userId = existingUser.id
		// Ensure account exists with correct password
		const passwordHash = await bcrypt.hash(TEST_USER.password, 10)
		await prisma.account.upsert({
			where: {
				providerId_accountId: {
					providerId: 'credential',
					accountId: existingUser.id,
				},
			},
			update: { password: passwordHash },
			create: {
				userId: existingUser.id,
				providerId: 'credential',
				accountId: existingUser.id,
				password: passwordHash,
			},
		})
		console.log(
			`  User already exists: ${TEST_USER.username} (updated credentials)`,
		)
	}
	console.timeEnd('👤 Creating test user...')

	// Create sample projects and tasks
	console.time('📋 Creating sample tasks...')

	// Create inbox project if doesn't exist
	let inboxProject = await prisma.project.findFirst({
		where: { userId, inboxProject: true },
	})
	if (!inboxProject) {
		inboxProject = await prisma.project.create({
			data: {
				name: 'Inbox',
				inboxProject: true,
				userId,
			},
		})
	}

	// Create a sample project
	let sampleProject = await prisma.project.findFirst({
		where: { userId, name: 'Sample Project' },
	})
	if (!sampleProject) {
		sampleProject = await prisma.project.create({
			data: {
				name: 'Sample Project',
				color: '#3b82f6',
				userId,
			},
		})
	}

	// Create sample tasks with audit history
	// First, clear existing tasks (audit history is cascade-deleted)
	await prisma.task.deleteMany({ where: { userId } })

	{
		const today = new Date()

		// Task 1: A completed task with history
		const task1 = await prisma.task.create({
			data: {
				content: 'Review project requirements',
				description:
					'Go through all the project requirements and create a checklist',
				priority: 3,
				due: { date: toDateString(today) },
				projectId: sampleProject.id,
				userId,
				checked: true,
				completedAt: new Date(),
			},
		})

		// Add audit history for task1
		await prisma.taskAuditHistory.create({
			data: {
				taskId: task1.id,
				userId,
				action: 'CREATED',
				changes: {
					content: { old: null, new: 'Review project requirements' },
					priority: { old: null, new: 3 },
				},
				createdAt: new Date(Date.now() - 3600000 * 3), // 3 hours ago
			},
		})
		await prisma.taskAuditHistory.create({
			data: {
				taskId: task1.id,
				userId,
				action: 'UPDATED',
				changes: {
					description: {
						old: null,
						new: 'Go through all the project requirements and create a checklist',
					},
				},
				createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
			},
		})
		await prisma.taskAuditHistory.create({
			data: {
				taskId: task1.id,
				userId,
				action: 'COMPLETED',
				changes: { checked: { old: false, new: true } },
				createdAt: new Date(Date.now() - 3600000), // 1 hour ago
			},
		})

		// Task 2: An active task with updates
		const task2 = await prisma.task.create({
			data: {
				content: 'Implement task audit history',
				description:
					'Track all changes made to tasks including renames and status changes',
				priority: 4,
				due: { date: toDateString(new Date(today.getTime() + 86400000)) },
				projectId: sampleProject.id,
				labels: ['feature', 'backend'],
				userId,
			},
		})

		// Add audit history for task2
		await prisma.taskAuditHistory.create({
			data: {
				taskId: task2.id,
				userId,
				action: 'CREATED',
				changes: {
					content: { old: null, new: 'Add task history feature' },
					priority: { old: null, new: 2 },
				},
				createdAt: new Date(Date.now() - 7200000), // 2 hours ago
			},
		})
		await prisma.taskAuditHistory.create({
			data: {
				taskId: task2.id,
				userId,
				action: 'UPDATED',
				changes: {
					content: {
						old: 'Add task history feature',
						new: 'Implement task audit history',
					},
					priority: { old: 2, new: 4 },
				},
				createdAt: new Date(Date.now() - 3600000), // 1 hour ago
			},
		})
		await prisma.taskAuditHistory.create({
			data: {
				taskId: task2.id,
				userId,
				action: 'UPDATED',
				changes: {
					labels: { old: [], new: ['feature', 'backend'] },
				},
				createdAt: new Date(Date.now() - 1800000), // 30 min ago
			},
		})

		// Task 3: Simple inbox task
		const task3 = await prisma.task.create({
			data: {
				content: 'Buy groceries',
				priority: 1,
				due: { date: toDateString(today) },
				projectId: inboxProject.id,
				userId,
			},
		})

		await prisma.taskAuditHistory.create({
			data: {
				taskId: task3.id,
				userId,
				action: 'CREATED',
				changes: {
					content: { old: null, new: 'Buy groceries' },
				},
				createdAt: new Date(Date.now() - 600000), // 10 min ago
			},
		})

		console.log('  Created 3 sample tasks with audit history')
	}
	console.timeEnd('📋 Creating sample tasks...')

	console.timeEnd('🌱 Database has been seeded')
}

seed()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
