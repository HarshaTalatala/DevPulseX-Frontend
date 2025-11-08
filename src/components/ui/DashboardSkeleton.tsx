import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-neutral-950 rounded-xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="animate-pulse space-y-3 sm:space-y-4">
      <div className="h-3 sm:h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
      <div className="h-6 sm:h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
    </div>
  </div>
);

const SkeletonStat = () => (
  <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 rounded-xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="animate-pulse space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 sm:h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-20 sm:w-24"></div>
        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-neutral-300 dark:bg-neutral-700 rounded-lg"></div>
      </div>
      <div className="h-8 sm:h-10 bg-neutral-300 dark:bg-neutral-700 rounded w-16 sm:w-20"></div>
      <div className="h-2.5 sm:h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-28 sm:w-32"></div>
    </div>
  </div>
);

const SkeletonChart = ({ height = 'h-64 sm:h-80' }: { height?: string }) => (
  <div className="bg-white dark:bg-neutral-950 rounded-xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="animate-pulse space-y-3 sm:space-y-4">
      <div className="h-4 sm:h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 sm:w-1/4"></div>
      <div className={`${height} bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-end justify-around gap-1.5 sm:gap-2 p-3 sm:p-4`}>
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
      className="space-y-4 sm:space-y-6"
    >
      {/* Header Skeleton */}
      <div className="animate-pulse space-y-2">
        <div className="h-6 sm:h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-48 sm:w-64"></div>
        <div className="h-3 sm:h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-64 sm:w-96"></div>
      </div>

      {/* Profile Card Skeleton */}
      <div className="bg-white dark:bg-neutral-950 rounded-xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-neutral-300 dark:bg-neutral-700 rounded-full flex-shrink-0"></div>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-28 sm:w-32"></div>
                <div className="h-3 sm:h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-36 sm:w-48"></div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="space-y-2 text-center">
                  <div className="h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-8 sm:w-12 mx-auto"></div>
                  <div className="h-2.5 sm:h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-12 sm:w-16"></div>
                </div>
                <div className="space-y-2 text-center">
                  <div className="h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-8 sm:w-12 mx-auto"></div>
                  <div className="h-2.5 sm:h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-12 sm:w-16"></div>
                </div>
              </div>
              <div className="h-8 sm:h-10 bg-neutral-300 dark:bg-neutral-700 rounded w-24 sm:w-32"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      {/* Activity Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <SkeletonChart height="h-72 sm:h-96" />
      </div>
    </motion.div>
  );
}

export { SkeletonCard, SkeletonStat, SkeletonChart };
