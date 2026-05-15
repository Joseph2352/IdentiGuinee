import React from 'react';
import { Skeleton } from './Skeleton';

interface DashboardCardsSkeletonProps {
  count?: number;
}

export const DashboardCardsSkeleton: React.FC<DashboardCardsSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border-l-4 border-stone-200 flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <div className="flex items-end justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
