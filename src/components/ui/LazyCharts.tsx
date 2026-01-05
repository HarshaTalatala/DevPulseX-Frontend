'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from './DashboardSkeleton';

// Lazy load heavy chart library components
export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    ),
  }
);

export const LazyPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);

export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);

export const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);

// Lazy load the entire AnimatedChart component if it's heavy
export const LazyAnimatedChart = dynamic(
  () => import('./AnimatedChart').then((mod) => ({ default: mod.AnimatedChart })),
  {
    ssr: false,
    loading: () => <SkeletonChart />,
  }
);
