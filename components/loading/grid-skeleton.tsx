import { Skeleton } from "@/components/ui/skeleton"

interface GridSkeletonProps {
  cols?: 1 | 2 | 3 | 4
  rows?: number
}

export function GridSkeleton({ cols = 3, rows = 6 }: GridSkeletonProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={`grid ${colsClass[cols]} gap-4 sm:gap-6`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
