import z from 'zod';

export const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_()]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses',
    ),
  descriptions: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  price: z.coerce
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a valid number',
    })
    .positive({ message: 'Price must be a positive number' })
    .min(0.01, { message: 'Price must be at least $0.01' })
    .max(1000000, { message: 'Price cannot exceed $1,000,000' })
    .refine(
      (val) => {
        // Check if number has at most 2 decimal places
        const decimals = val.toString().split('.')[1];
        return !decimals || decimals.length <= 2;
      },
      { message: 'Price can have at most 2 decimal places' },
    ),
  stocks: z.coerce
    .number({
      required_error: 'Stock quantity is required',
      invalid_type_error: 'Stock quantity must be a valid number',
    })
    .int({ message: 'Stock quantity must be a whole number' })
    .positive({ message: 'Stock quantity must be a positive number' })
    .min(1, { message: 'Stock quantity must be at least 1' })
    .max(10000, { message: 'Stock quantity cannot exceed 10,000 units' }),
});
