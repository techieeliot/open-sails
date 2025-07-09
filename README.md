# Document how to run the code (on the README)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

This is a full-stack bidding system built with Next.js 15, TypeScript, and TailwindCSS. The application allows users to view collections, place bids, and manage bidding activities through a clean, responsive interface.

### Key Features

- Collections management with CRUD operations
- Bidding system with real-time status updates
- User authentication (mockable)
- Responsive design with Shadcn UI components
- TypeScript for type safety
- JSON-based data storage (easily replaceable with a database)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Application Architecture & Engineering Questions

### 1. How would you monitor the application to ensure it is running smoothly?

**Current Implementation:**

- Basic error handling in API routes with try-catch blocks
- TypeScript for compile-time error prevention
- ESLint and Prettier for code quality

**Production Monitoring Strategy:**

**Application Performance Monitoring (APM):**

- TODOS

**Health Checks:**

```typescript
// /api/health endpoint
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

**Logging Strategy:**

- **Centralized Logging**: Integrate a structured logging service like **Datadog, Logtail, or Pino**. This would involve creating a logger utility that captures not just errors but also key application events (e.g., bid placed, collection created, user login). Logs should be enriched with context like request IDs and user IDs to make debugging easier.
- **Alerting**: Configure alerts in our monitoring service (e.g., Sentry, Datadog) for critical issues. Key alerts would include:
  - **High Error Rate**: Trigger if the API error rate exceeds a certain threshold (e.g., >1% of requests).
  - **High Latency**: Notify if API response times for key endpoints (like fetching collections or placing bids) degrade.
  - **Health Check Failures**: An immediate alert if the `/api/health` endpoint fails.

### 2. How would you address scalability and performance?

**Current Implementation & Recent Improvements:**

- **JSON file-based data storage**: Suitable for development and rapid prototyping.
- **Client-side Pagination**: Implemented for both the collections and bids lists. Instead of loading all items at once, the UI now displays 10 items initially and includes a "Load More" button. This significantly improves initial page load and rendering performance, providing a much better user experience.
- **Refactored API Routes**: Centralized data access logic into `utils.ts` files, improving code maintainability and consistency.
- **Health Check Endpoint**: A dedicated `/api/health` route for monitoring application status.

**Scalability & Performance Strategy for Production:**

**Database & Backend:**

- **Migrate to a Relational Database**: Transition from JSON files to a robust database like **PostgreSQL** using an ORM like **Prisma**. This provides data integrity, concurrent access handling, and powerful querying capabilities.
- **Database Indexing**: Create indexes on frequently queried columns, such as `collectionId` on the `bids` table and `status` on both `bids` and `collections`.
- **Caching Layer**: Implement a caching strategy with **Redis** or a similar in-memory data store. This is ideal for caching frequently accessed, semi-static data like collection details or user profiles.

**API & Server Optimization:**

- **API Rate Limiting**: Protect the API from abuse and ensure fair usage by implementing rate limiting on a per-user or per-IP basis.
- **Server-Side Caching**: Leverage Next.js's built-in data caching for server-rendered pages to reduce database hits for repeated requests.
- **Asynchronous Job Processing**: For non-time-critical operations like sending email notifications after a bid is accepted, use a background job queue (e.g., BullMQ, RabbitMQ) to avoid blocking the main request thread.

**Frontend Performance:**

- **Optimistic UI Updates**: For actions like placing a bid or updating a status, update the UI immediately before the API call completes. Revert the change if the API call fails. This makes the application feel instantaneous.
- **Code Splitting & Lazy Loading**: Continue to leverage Next.js's automatic code splitting and consider manually lazy-loading heavy components that are not critical for the initial view.
- **Bundle Analysis**: Regularly use a tool like `@next/bundle-analyzer` to inspect the application's JavaScript bundles and identify opportunities for optimization.

### 3. Trade-offs and Future Improvements

**Decisions & Trade-offs Made During the Challenge:**

**Data Storage:**

- **Choice**: Used **JSON files** for data persistence.
- **Trade-off**: This was a deliberate choice for rapid development and to avoid the overhead of setting up a database. However, it lacks data integrity, transaction support, and cannot handle concurrent writes, making it unsuitable for production.
- **Future**: The clear path forward is migrating to **PostgreSQL with Prisma**, which would provide a strongly-typed, robust data layer.

**Authentication:**

- **Choice**: Implemented a **mocked authentication** system where the user's role is hard-coded.
- **Trade-off**: This allowed for focusing on core application features without the complexity of a full authentication flow. The obvious downside is the complete lack of security.
- **Future**: Integrate **NextAuth.js** to provide a complete, secure authentication solution with support for various providers (e.g., credentials, OAuth) and role-based access control (RBAC).

**State Management:**

- **Choice**: Relied on **local component state (`useState`, `useEffect`)** and prop drilling.
- **Trade-off**: This approach is simple and sufficient for the current application size. As the application grows, managing shared state across deeply nested components would become cumbersome and lead to performance issues from excessive re-renders.
- **Future**: Introduce a dedicated state management library. **TanStack Query (React Query)** would be an excellent choice for managing server state (caching, refetching), while **Jotai** could handle global client state.

**Real-time Updates:**

- **Choice**: The UI is updated by **manually refetching data** after a mutation (e.g., creating a bid).
- **Trade-off**: This is a simple and reliable pattern but does not provide a real-time experience. If another user places a bid, others will not see it without a page refresh.
- **Future**: For a true real-time bidding experience, implement **WebSockets** or **Server-Sent Events (SSE)**. This would allow the server to push updates to all connected clients instantly when a new bid is placed or a collection's status changes.

**With More Time & Resources, I Would Prioritize:**

1. **Database Migration**: Move from JSON files to PostgreSQL with Prisma or Drizzle.
2. **Full Authentication**: Implement NextAuth.js with user roles and protected routes.
3. **End-to-End Testing**: Write a comprehensive test suite using Jest and Playwright to ensure application reliability.
4. **Input Validation**: Use **Zod** for robust schema validation on both the client and server to prevent bad data and improve security.
5. **Real-time Bid Updates**: Integrate WebSockets to push live data to clients.
6. **Advanced UI States**: Add more comprehensive loading skeletons, error boundaries, and toast notifications for a polished user experience.
7. **CI/CD Pipeline**: Set up a GitHub Actions workflow to automate testing and deployment.
