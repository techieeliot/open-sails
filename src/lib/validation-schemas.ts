import { z } from 'zod';

// Bid status validation schema
export const BidStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be pending, accepted, or rejected',
  }),
});

// Collection status validation schema
export const CollectionStatusUpdateSchema = z.object({
  status: z.enum(['open', 'closed'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be open or closed',
  }),
});

// Place bid validation schema
export const PlaceBidSchema = z.object({
  price: z.number().positive('Price must be a positive number'),
  collectionId: z.number().positive('Collection ID must be a positive number'),
  userId: z.number().positive('User ID must be a positive number'),
});

// Create collection validation schema
export const CreateCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startingPrice: z.number().positive('Starting price must be a positive number'),
  ownerId: z.number().positive('Owner ID must be a positive number'),
  status: z.enum(['open', 'closed']).default('open'),
});

export type BidStatusUpdate = z.infer<typeof BidStatusUpdateSchema>;
export type CollectionStatusUpdate = z.infer<typeof CollectionStatusUpdateSchema>;
export type PlaceBid = z.infer<typeof PlaceBidSchema>;
export type CreateCollection = z.infer<typeof CreateCollectionSchema>;
