'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const CollectionFormLoadingSkeleton = ({
  hasIcon = false,
  isTextarea = false,
  isGridLayout = false,
}: {
  hasIcon?: boolean;
  isTextarea?: boolean;
  isGridLayout?: boolean;
}) => (
  <div className={isGridLayout ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
    {isGridLayout ? (
      <div>
        {/* Price Field Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Stock Field Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {hasIcon && <Skeleton className="h-4 w-4" />}
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className={`w-full ${isTextarea ? 'h-[120px]' : 'h-12'}`} />
        <div className={isTextarea ? 'flex justify-between' : ''}>
          <Skeleton className="h-4 w-48" />
          {isTextarea && <Skeleton className="h-4 w-20" />}
        </div>
      </div>
    )}
  </div>
);
