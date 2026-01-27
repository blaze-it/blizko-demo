import { z } from 'zod'

export const stepEntrySchema = z.object({
	steps: z
		.string()
		.min(1, 'Steps is required')
		.refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
			message: 'Steps must be 0 or greater',
		}),
	entryDate: z.string().min(1, 'Date is required'),
	distance: z
		.string()
		.optional()
		.refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0), {
			message: 'Distance must be 0 or greater',
		}),
	calories: z
		.string()
		.optional()
		.refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0), {
			message: 'Calories must be 0 or greater',
		}),
	activeTime: z
		.string()
		.optional()
		.refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0), {
			message: 'Active time must be 0 or greater',
		}),
	notes: z.string().optional(),
})

export type StepEntryFormData = z.infer<typeof stepEntrySchema>

export const stepSettingsSchema = z.object({
	dailyGoal: z
		.string()
		.optional()
		.refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0), {
			message: 'Daily goal must be greater than 0',
		}),
})

export type StepSettingsFormData = z.infer<typeof stepSettingsSchema>
