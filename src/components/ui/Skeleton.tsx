import { cn } from '../../utils/cn'

export interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({
  className,
  width = 'w-full',
  height = 'h-4',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        width,
        height,
        className,
      )}
      aria-hidden="true"
    />
  )
}

export default Skeleton