import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({ rows = 4, className }) => {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
};

export default ListSkeleton;
