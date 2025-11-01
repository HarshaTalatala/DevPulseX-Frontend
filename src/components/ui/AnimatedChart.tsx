'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card as TremorCard } from '@tremor/react';
import { cn } from '@/lib/utils';

interface AnimatedChartProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  title,
  description,
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('h-full', className)}
    >
      <TremorCard className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        >
          {children}
        </motion.div>
      </TremorCard>
    </motion.div>
  );
};
