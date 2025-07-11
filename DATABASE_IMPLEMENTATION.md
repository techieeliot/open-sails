# Database Service Implementation with Drizzle ORM

## Overview

This implementation replaces the JSON file-based data storage with a proper SQL database using Drizzle ORM and SQLite. The schema has been refactored to remove `userId` from collections and use proper relational design.

## Schema Design

### Tables

#### Users

- `id` (Primary Key, Auto-increment)
- `name` (String, Required)
- `email` (String, Required, Unique)
- `role` (Enum: 'admin' | 'user', Default: 'user')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### Collections

- `id` (Primary Key, Auto-increment)
- `name` (String, Required)
- `descriptions` (String, Optional)
- `price` (Integer, Required)
- `stocks` (Integer, Required)
- `status` (Enum: 'open' | 'closed', Default: 'open')
- `owner_id` (Foreign Key → users.id)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### Bids

- `id` (Primary Key, Auto-increment)
- `price` (Integer, Required)
- `collection_id` (Foreign Key → collections.id)
- `user_id` (Foreign Key → users.id)
- `status` (Enum: 'pending' | 'accepted' | 'rejected' | 'cancelled', Default: 'pending')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Relations

- **Users → Collections**: One-to-Many (a user can own multiple collections)
- **Collections → Bids**: One-to-Many (a collection can have multiple bids)
- **Users → Bids**: One-to-Many (a user can place multiple bids)

## Key Improvements

### 1. Normalized Schema

- **Removed `userId` from collections**: Collections now only reference their owner through `owner_id`
- **Proper foreign key relationships**: Enforced data integrity through database constraints
- **Indexed relationships**: Optimized queries with proper indexing

### 2. Database Service Layer

```typescript
// Collection operations
await CollectionService.findAll();
await CollectionService.findById(id);
await CollectionService.findByOwnerId(ownerId);
await CollectionService.create(data);
await CollectionService.update(id, data);
await CollectionService.delete(id);

// Enhanced queries with joins
await CollectionService.findAllWithOwner();

// Bid operations with transaction support
await BidService.acceptBid(bidId, collectionId); // Atomic accept/reject operation
```

### 3. Type Safety

- **Inferred types from schema**: Types are automatically generated from the database schema
- **Strict TypeScript integration**: Full type safety across the application
- **Separate Insert/Select types**: Different types for creating vs reading data

## Usage

### Database Initialization

The database is automatically initialized on first API call:

```typescript
import { ensureDatabaseInitialized } from '@/lib/db-init';

// In API routes
await ensureDatabaseInitialized();
```

### Migration from JSON

Existing JSON data is automatically migrated:

```typescript
import { migrateFromJSON } from '@/db';

await migrateFromJSON(); // Migrates users.json, collections.json, bids.json
```

### Service Layer Usage

```typescript
import { CollectionService, BidService, UserService } from '@/lib/db-service';

// Get collections with owner information
const collectionsWithOwners = await CollectionService.findAllWithOwner();

// Get bids with user and collection details
const detailedBids = await BidService.findByCollectionIdWithDetails(collectionId);

// Accept a bid (automatically rejects others)
await BidService.acceptBid(bidId, collectionId);
```

## Development Commands

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database UI)
npm run db:studio
```

## API Routes Updated

All API routes have been refactored to use the new database service:

- `/api/collections` - Now uses `CollectionService`
- `/api/bids` - Now uses `BidService`
- `/api/users` - Now uses `UserService`

### Enhanced Features

1. **Automatic database initialization** on first request
2. **Transaction support** for complex operations (like accepting bids)
3. **Relational queries** with proper joins
4. **Better error handling** with database constraints
5. **Performance optimization** with proper indexing

## Configuration

Database configuration in `drizzle.config.ts`:

```typescript
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: './database.sqlite', // Use file for production
  },
});
```

## Benefits

1. **Scalability**: SQL database scales better than JSON files
2. **Data Integrity**: Foreign key constraints prevent orphaned records
3. **Performance**: Indexed queries and optimized operations
4. **Transactions**: Atomic operations for data consistency
5. **Type Safety**: Full TypeScript integration with inferred types
6. **Developer Experience**: Drizzle Studio for database visualization

## Migration Strategy

The implementation maintains backward compatibility:

1. **Automatic migration**: JSON data is automatically imported on initialization
2. **Type compatibility**: New types export the same interface structure
3. **API compatibility**: All existing API endpoints work unchanged
4. **Gradual adoption**: Can be deployed without breaking existing functionality
