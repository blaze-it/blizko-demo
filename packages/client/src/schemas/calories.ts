import { z } from 'zod'

export const calorieEntrySchema = z.object({
	calories: z
		.string()
		.min(1, 'Calories is required')
		.refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
			message: 'Calories must be greater than 0',
		}),
	entryAt: z.string().min(1, 'Date and time is required'),
	mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
	notes: z.string().optional(),
})

export type CalorieEntryFormData = z.infer<typeof calorieEntrySchema>
