import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-neutral-950 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
      <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
    </div>
  </div>
);

const SkeletonStat = () => (
  <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-24"></div>
        <div className="h-10 w-10 bg-neutral-300 dark:bg-neutral-700 rounded-lg"></div>
      </div>
      <div className="h-10 bg-neutral-300 dark:bg-neutral-700 rounded w-20"></div>
      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-32"></div>
    </div>
  </div>
);

const SkeletonChart = ({ height = 'h-80' }: { height?: string }) => (
  <div className="bg-white dark:bg-neutral-950 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="animate-pulse space-y-4">
      <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
      <div className={`${height} bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-end justify-around gap-2 p-4`}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-neutral-300 dark:bg-neutral-700 rounded-t w-full"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-64 mb-2"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-96"></div>
      </div>

      {/* Profile Card Skeleton */}
      <div className="bg-white dark:bg-neutral-950 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-32"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-48"></div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-12"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div>
            </div>
            <div className="h-10 bg-neutral-300 dark:bg-neutral-700 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      {/* Activity Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SkeletonChart height="h-96" />
      </div>
    </motion.div>
  );
}

export { SkeletonCard, SkeletonStat, SkeletonChart };
