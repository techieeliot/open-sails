import { pgTable, text, integer, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations, InferModel } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['admin', 'user'] })
    .notNull()
    .default('user'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Collections table (removed userId to normalize)
export const collections = pgTable('collections', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  descriptions: text('descriptions'),
  price: integer('price').notNull(),
  stocks: integer('stocks').notNull(),
  status: text('status', { enum: ['open', 'closed'] })
    .notNull()
    .default('open'),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Bids table
export const bids = pgTable('bids', {
  id: serial('id').primaryKey().notNull(),
  price: integer('price').notNull(),
  collectionId: integer('collection_id')
    .notNull()
    .references(() => collections.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'cancelled'] })
    .notNull()
    .default('pending'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedCollections: many(collections),
  bids: many(bids),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(users, {
    fields: [collections.ownerId],
    references: [users.id],
  }),
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  collection: one(collections, {
    fields: [bids.collectionId],
    references: [collections.id],
  }),
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
}));

export const schema = {
  users,
  collections,
  bids,
  usersRelations,
  collectionsRelations,
  bidsRelations,
};

// Type definitions
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;
export type Collection = InferModel<typeof collections>;
export type NewCollection = InferModel<typeof collections, 'insert'>;
export type Bid = InferModel<typeof bids>;
export type NewBid = InferModel<typeof bids, 'insert'>;
