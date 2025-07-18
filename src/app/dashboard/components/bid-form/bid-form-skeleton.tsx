import { Skeleton } from '@/components/ui/skeleton';

/*Skeleton loading component for different parts of the form
 * This component is used to show a loading state while the form data is being fetched or processed.
 */
export const BidFormSkeleton = ({ closeDialog }: { closeDialog: (() => void) | undefined }) => (
  <div className="space-y-6">
    {/* Collection Context Skeleton */}
    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2 bg-slate-700/70" />
          <Skeleton className="h-8 w-32 bg-slate-600/70" />
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-20 mb-2 bg-slate-700/70" />
          <Skeleton className="h-6 w-24 bg-slate-600/70" />
        </div>
      </div>
    </div>

    {/* Form Field Skeleton */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-slate-700/70" />
        <Skeleton className="h-5 w-32 bg-slate-600/70" />
      </div>
      <Skeleton className="h-14 w-full bg-slate-700/70" />
      <Skeleton className="h-4 w-64 bg-slate-700/70" />
    </div>

    {/* Button Skeleton */}
    <div className="flex gap-3 pt-4">
      {closeDialog && <Skeleton className="flex-1 h-12 bg-slate-700/70" />}
      <Skeleton className="flex-1 h-12 bg-slate-600/70" />
    </div>
  </div>
);
