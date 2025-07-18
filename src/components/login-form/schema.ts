import z from 'zod'

export const formSchema = z.object({
	userId: z.string().min(1, 'Please select a user'),
})
