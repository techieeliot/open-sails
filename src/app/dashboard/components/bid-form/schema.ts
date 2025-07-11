import z from 'zod';

export const formSchema = z.object({
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
});
