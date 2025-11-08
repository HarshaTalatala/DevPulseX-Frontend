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
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200"
    >
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {name}
            </p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white"
              >
                {value.toLocaleString()}
              </motion.p>
              {trend && (
                <span className={cn(
                  'text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full',
                  trend.isPositive
                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-white/5 transition-all duration-200 group-hover:bg-gray-200 dark:group-hover:bg-white/10 group-hover:scale-105">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
