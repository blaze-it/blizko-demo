import { z } from 'zod'

export const weightEntrySchema = z.object({
	weight: z
		.string()
		.min(1, 'Weight is required')
		.refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
			message: 'Weight must be greater than 0',
		}),
	measuredAt: z.string().min(1, 'Date and time is required'),
	unit: z.enum(['kg', 'lbs']),
	notes: z.string().optional(),
})

export type WeightEntryFormData = z.infer<typeof weightEntrySchema>

export const weightSettingsSchema = z.object({
	targetWeight: z
		.string()
		.optional()
		.refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0), {
			message: 'Target weight must be greater than 0',
		}),
	unit: z.enum(['kg', 'lbs']),
})

export type WeightSettingsFormData = z.infer<typeof weightSettingsSchema>
