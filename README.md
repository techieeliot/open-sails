# Luxor Full-stack Applications Challenge: Bidding System

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

This is a full-stack bidding system built with Next.js 15, TypeScript, and TailwindCSS. The application allows users to view collections of Bitcoin mining hardware, place bids, and manage their bidding activities through a clean, real-time, and responsive interface.

### Key Features

- **Full CRUD for Collections & Bids**: Create, read, update, and delete hardware collections and bids.
- **Real-time UI Updates**: The interface updates in real-time without full page reloads, powered by Jotai for state management.
- **Role-Based UI**: The UI dynamically changes based on whether the user is the owner of a collection or a bidder.
- **Modern Forms**: Forms are built with `react-hook-form` and `zod` for robust validation and a smooth user experience.
- **Mocked Data**: Uses JSON files for mock data, allowing for rapid development and easy setup.
- **Component-Based Architecture**: Built with reusable components, including Shadcn UI primitives.
- **TypeScript & Modern Tools**: Leverages TypeScript for type safety, along with ESLint and Prettier for code quality.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application uses a simple user-switching mechanism at the top of the page to simulate different users and roles.

## Application Architecture & Engineering Questions

### 1. How would you monitor the application to ensure it is running smoothly?

**Current Implementation:**

- **Health Check Endpoint**: A `/api/health` route is available to confirm the application is running.
- **Basic Error Handling**: API routes include `try-catch` blocks to prevent crashes.
- **Static Typing & Linting**: TypeScript, ESLint, and Prettier are used to catch errors and maintain code quality before deployment.

**Production Monitoring Strategy:**

A robust monitoring strategy would involve a combination of tools to cover different aspects of the application:

1. **Application Performance Monitoring (APM)**:
   - **Tools**: Integrate an APM tool like **Sentry**, **Datadog**, or **New Relic**.
   - **Purpose**: To automatically capture and report frontend and backend errors, track performance metrics (like API latency and transaction traces), and provide detailed context for debugging. Sentry is particularly strong for frontend error monitoring.

2. **Logging**:
   - **Tools**: Use a structured logging library like **Pino** and a log aggregation service like **Logtail**, **Datadog Logs**, or **AWS CloudWatch**.
   - **Purpose**: To create a centralized and searchable stream of application events. Logs should include request IDs, user IDs, and other contextual information to trace issues across the stack.

3. **Health Checks & Uptime Monitoring**:
   - **Tools**: Use an external service like **UptimeRobot** or **Pingdom**.
   - **Purpose**: To continuously poll the `/api/health` endpoint and other critical pages. This provides immediate alerts if the application becomes unresponsive.

4. **Frontend Performance & Web Vitals**:
   - **Tools**: Vercel Analytics (if deploying on Vercel) or Google Analytics.
   - **Purpose**: To monitor Core Web Vitals (LCP, FID, CLS) and other user-centric performance metrics. This helps ensure a good user experience.

5. **Alerting**:
   - **Configuration**: Set up alerts in the chosen APM or logging service (e.g., Sentry, Datadog) for:
     - **High Error Rates**: When the percentage of failed requests exceeds a threshold.
     - **Performance Degradation**: When API response times or page load times spike.
     - **Health Check Failures**: Immediate notification if the application is down.

### 2. How would you address scalability and performance?

**Current Implementation & Recent Improvements:**

- **Client-side Pagination**: The collections and bids lists use a "Load More" button, preventing the initial payload from being too large and improving initial page load time.
- **Efficient State Management**: **Jotai** is used for atomic and decentralized state management, which helps prevent unnecessary re-renders and keeps the UI fast.
- **Optimized API Data Flow**: API routes were refactored to use centralized utility functions, ensuring consistent and optimized data handling.

**Scalability & Performance Strategy for Production:**

1. **Database**:
   - **Action**: Replace the JSON file data store with a robust, production-grade database like **PostgreSQL**.
   - **Benefit**: Improves data integrity, enables concurrent transactions, and allows for complex, indexed queries that are far more performant at scale than reading/writing files. An ORM like **Prisma** would be used for type-safe database access.

2. **Caching**:
   - **Action**: Implement a caching layer with **Redis** or a similar in-memory data store.
   - **Benefit**: Cache frequently accessed data, such as collection lists or user profiles. This would dramatically reduce database load and lower API latency. Next.js's built-in Data Cache could also be leveraged for this.

3. **API & Backend Optimization**:
   - **Action**: Move long-running tasks (like sending notifications after a bid is accepted) to a background job queue (e.g., using **BullMQ** or **AWS SQS**).
   - **Benefit**: Prevents blocking the main thread and keeps the API responsive.

4. **Frontend Performance**:
   - **Action**: Continue leveraging Next.js features like automatic code splitting, image optimization (`next/image`), and static generation for pages where possible.
   - **Benefit**: Ensures the client-side application remains lean and fast.

5. **Infrastructure & Deployment**:
   - **Action**: Deploy on a scalable platform like **Vercel**, which handles serverless function scaling automatically. For more complex needs, use **AWS** or **Google Cloud** with auto-scaling groups for backend services and a CDN (like CloudFront) for static assets.

### 3. Trade-offs you had to choose when doing this challenge

Given the time constraints, several trade-offs were made. With more time and resources, I would have approached certain aspects differently.

1. **Data Storage (JSON vs. Database)**:
   - **Trade-off**: Used JSON files for data storage as permitted by the challenge. This was faster to set up and iterate on than a full database.
   - **What I'd Do Differently**: In a production environment, I would have started with PostgreSQL and Prisma from the beginning. The file-based approach lacks transactions, scalability, and efficient querying, which are critical for a real-world application.

2. **Authentication (Mocked vs. Real)**:
   - **Trade-off**: Implemented a simple user switcher to mock authentication. This allowed me to focus on the core application logic and role-based UI features without the overhead of a full auth system.
   - **What I'd Do Differently**: I would implement a secure authentication solution like **NextAuth.js** or **Clerk**. This would provide proper session management, password handling, and protection for sensitive API routes.

3. **Testing**:
   - **Trade-off**: No automated tests were written in order to deliver the core features within the timeframe. The application was tested manually.
   - **What I'd Do Differently**: I would implement a comprehensive testing suite, including:
     - **Unit Tests** (Vitest/Jest) for utility functions and individual React components.
     - **Integration Tests** to verify that components work together correctly.
     - **End-to-End Tests** (Cypress/Playwright) to simulate user flows and catch regressions.

4. **Error Handling & User Feedback**:
   - **Trade-off**: Error handling is present, but user feedback is often limited to simple `alert()` messages or console logs.
   - **What I'd Do Differently**: I would use a more sophisticated notification system (e.g., "toast" messages) to provide users with clearer, non-blocking feedback on the success or failure of their actions. Error boundaries would also be used to prevent component crashes from breaking the entire UI.
