'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  name: string;
  value: number;
  icon: LucideIcon;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  delay?: number;
  trend?: { value: number; isPositive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  name,
  value,
  icon: Icon,
  color,
  gradientFrom,
  gradientTo,
  delay = 0,
  trend,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
    >
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {name}
            </p>
            <div className="flex items-baseline gap-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="text-3xl font-semibold text-gray-900 dark:text-white"
              >
                {value.toLocaleString()}
              </motion.p>
              {trend && (
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  trend.isPositive
                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={cn(
            'flex-shrink-0 p-3 rounded-lg',
            color
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
