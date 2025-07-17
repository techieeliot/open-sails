# React Best Practices

## Project Architecture

This is a Next.js 15 application with TypeScript and TailwindCSS, focused on creating a bidding system for Bitcoin mining hardware collections. The application follows a component-based architecture with a focus on responsive design and real-time UI updates.

### Key Technologies & Patterns

- **Next.js App Router**: Uses the latest `/app` directory structure with React Server Components
- **State Management**: Jotai for atomic state management (`/src/lib/atoms.ts`)
- **Data Storage**: Currently using JSON files for development, with Drizzle ORM schema defined for PostgreSQL
- **UI Components**: Combination of Shadcn UI primitives and custom components
- **Data Fetching**: Custom hooks like `useFetchCollections` for data fetching
- **Responsive Design**: Mobile-first approach with card-based layouts for smaller screens
- **Form Handling**: React Hook Form with Zod validation

## Important File Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable UI components
  - `/components/ui` - Shadcn UI primitives
  - `/components/data-table` - Custom data table with responsive design
- `/src/lib` - Utility functions, Jotai atoms, and constants
- `/src/db` - Database schema and services
- `/src/hooks` - Custom React hooks
- `/src/types.ts` - TypeScript type definitions

## Key Patterns & Conventions

### Component Organization

Components follow a consistent pattern:

- Folder-based organization with index.tsx as the main export
- Component-specific subcomponents in the same folder
- Shadcn UI primitives extended with project-specific styling

Example from `data-table/index.tsx`:

```tsx
export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  meta,
}: DataTableProps<TData, TValue>) {
  // Component implementation
}
```

### State Management with Jotai

Data is managed using Jotai atoms in `src/lib/atoms.ts`, providing a centralized yet atomic state management solution:

```typescript
// Collections state
export const collectionsAtom = atom<Collection[]>([]);
export const expandedCollectionAtom = atom<number | null>(null);
export const collectionsLoadingAtom = atom<boolean>(false);
export const collectionsErrorAtom = atom<string | null>(null);

// Derived atoms
export const sortedCollectionsAtom = atom((get) => {
  const collections = get(collectionsAtom);
  return collections
    .slice()
    .sort((a, b) => compareAsc(parseISO(a.updatedAt), parseISO(b.updatedAt)));
});
```

### Responsive Design Strategy

The project uses a custom responsive table implementation that renders as traditional tables on larger screens and cards on mobile:

1. `src/components/ui/table.tsx` contains base table components with responsive logic
2. Tables switch to a card-based layout on mobile screens for better usability
3. Use `overflow-visible` instead of `overflow-hidden` to prevent content cutoff in mobile card views

### Mobile-First Conventions

When implementing UI components:

1. Start with mobile layout first
2. Use utility classes like `md:hidden` and `hidden md:block` to toggle between mobile/desktop views
3. Ensure action buttons are full-width on mobile with `md:w-auto w-full`
4. Add text labels beside icons on mobile views

## Common Development Workflows

### Adding a New Data Table

1. Create column definitions as in `bid-column-definition.tsx`
2. Import and use the `DataTable` component
3. Connect with Jotai atoms for state management
4. Add filtering and sorting capabilities through the table props

### Updating UI Components

When updating UI components, especially for mobile responsiveness:

1. Check both desktop and mobile views
2. Ensure overflow is handled correctly (use `overflow-visible` for buttons and labels)
3. Make action buttons touch-friendly with proper spacing
4. Add proper text labels beside icons for mobile views

### Data Flow Pattern

The typical data flow pattern in the application:

1. Define atoms in `atoms.ts`
2. Create custom hooks for data fetching (e.g., `useFetchCollections.ts`)
3. Use atoms with `useAtom` or `useAtomValue` in components
4. Update UI based on loading/error states from atoms

## React Best Practices

Following best practices from React experts (Kent C. Dodds, Josh W. Comeau, Dan Abramov, John Lindquist, Jhey Thompkins, Joe Previte, Jamund Ferguson, Elijah Manor, Michael Chan, Colby Fayock, and Tyler W. Clark):

1. **Colocation** (Kent C. Dodds): Keep components, styles, tests, and state as close to where they're used as possible, as seen in the folder structure of UI components. This makes components more maintainable and easier to understand.

2. **Separation of Concerns** (Dan Abramov): Separate UI rendering from data fetching using custom hooks like `useFetchCollections`.

3. **Component Composition** (Michael Chan): Favor composition over inheritance. Use smaller, focused components combined together, like how Shadcn components are composed.

4. **State Management** (Tyler W. Clark): Use atomic state patterns with Jotai to prevent unnecessary re-renders and improve performance.

5. **Accessibility First** (Elijah Manor): Notice how button.tsx includes proper ARIA attributes and keyboard focus states for all interactive elements.

6. **Defensive UI** (Josh W. Comeau): Handle loading/error states explicitly in all data-driven components, as seen in the loading skeleton patterns.

7. **Progressive Enhancement** (Jhey Thompkins): Build from core functionality outward, as seen in the responsive designs that work on mobile first.

8. **Performance Optimization** (Joe Previte): Avoid unnecessary re-renders with proper dependency arrays in useEffect hooks.

9. **Type Safety** (Jamund Ferguson): Leverage TypeScript for catching errors at build time rather than runtime, as shown in the extensive typing system.

10. **Interactive Patterns** (John Lindquist): Use familiar, consistent interaction patterns across the application, as shown in the standardized button variants.

11. **Visual Feedback** (Colby Fayock): Provide immediate visual feedback for all user interactions with hover/focus states and transitions.

### Kent C. Dodds' React Patterns

Following Kent C. Dodds' specific recommendations for React development:

1. **Custom Hook Patterns**: Extract reusable logic into custom hooks like `useFetchCollections.ts`. Follow Kent's hook naming convention with "use" prefix and clear purpose in the name.

2. **Destructuring Best Practices**: Use targeted destructuring to clearly show which props/values are being used. Prefer destructuring in function parameters for clarity and to avoid unused props.

```tsx
// Good example - clear destructuring
function BidCard({ bid, onAccept, isOwner }) {
  const { id, price, userId } = bid;
  // ...component implementation
}

// Avoid - overly nested destructuring
function BidCard({ bid: { id, price, userId }, onAccept, isOwner }) {
  // ...harder to trace props origin
}
```

3. **Testing Philosophy**: Follow Kent's "Testing Trophy" approach with emphasis on integration tests over unit tests. Tests should verify behavior users care about, not implementation details.

4. **Proper useEffect Dependencies**: Always specify all dependencies in useEffect's dependency array to avoid stale closures. Use the exhaustive-deps ESLint rule.

```tsx
// Good practice
useEffect(() => {
  const fetchData = async () => {
    // implementation
  };
  fetchData();
}, [collectionId, userId]); // All dependencies listed
```

5. **State Colocation**: Keep state as close as possible to where it's used. Only lift state when it truly needs to be shared.

Example implementation (from button.tsx):

```tsx
// Button uses consistent variants with proper accessibility patterns
function Button({
  className,
  variant,
  size,
  fullWidth = false,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}
```

### John Lindquist's TypeScript Guidelines

John Lindquist (egghead.io creator) recommends these TypeScript practices:

1. **Type Inference Over Explicit Types**: Let TypeScript infer types when obvious to reduce verbosity.

```tsx
// Good - type inference
const collections = await fetchCollections(); // TypeScript infers Collection[]

// Avoid unnecessary explicit typing
const collections: Collection[] = await fetchCollections();
```

2. **Use Discriminated Unions**: For complex state management, particularly with loading/error states.

```tsx
// Example of discriminated union for API state
type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

3. **Prefer Interfaces for Public APIs**: Use interfaces for components props and public APIs, as they're more extensible.

### Expert Insights for Modern React Development

1. **Smart Bundling** (Ken Wheeler): Use code splitting to keep initial bundle sizes small. Next.js handles this automatically with the App Router.

2. **Progressive Rendering** (Ben Ilegbodu): Consider component load order and user perception. Use skeleton loaders like in `BidsTable` when loading data.

3. **Developer Experience** (Wes Bos): Use consistent ESLint and Prettier configs to maintain code quality. Follow the project's established patterns.

4. **Continuous Learning** (Beau Carnes): Stay updated with framework changes, especially with Next.js's rapid evolution.

5. **Component API Design** (Sarah Drasner): Create consistent, predictable component APIs with sensible defaults and clear prop names.

6. **Performance Monitoring** (Addy Osmani): Measure the impact of changes on performance metrics like Core Web Vitals.

7. **SSR & Hydration** (Guillermo Rauch): Understand how server components and client components work together in the Next.js App Router.

8. **TypeScript Best Practices** (Swyx):
   - Use TypeScript's utility types like `Partial<T>`, `Pick<T>`, and `Omit<T>` to avoid duplication
   - Prefer type composition over inheritance
   - Use `as const` for literal types and object values that shouldn't change

9. **Accessibility Guidelines** (Marcy Sutton Todd):
   - Test keyboard navigation for all interactive elements
   - Maintain appropriate color contrast (at least 4.5:1)
   - Ensure proper ARIA attributes, as seen in button.tsx
   - Provide text alternatives for non-text content

10. **State Machine Patterns** (Brad Traversy):
    - Model complex UI states as explicit state machines
    - Use enums or string literals for clearly defined states

## Things to Watch Out For

1. **Mobile Overflow Issues**: Always check for overflow issues in mobile card views, especially with action buttons
2. **Component Reuse**: Leverage existing components before creating new ones
3. **Atomic State Updates**: Update Jotai atoms precisely to prevent unnecessary re-renders
4. **TypeScript Consistency**: Ensure proper typing, especially when working with table data
5. **Responsive Design**: Test all changes on both mobile and desktop viewports
