import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-secondary-soft via-surface-3 to-secondary-soft bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-[85%] max-w-md" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  )
}
