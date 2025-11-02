'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  hover?: boolean;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  hover = true,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'bg-white dark:bg-[#0a0a0a] border border-gray-200/60 dark:border-white/10 rounded-xl p-6',
        'shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const GradientCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-xl p-6',
        'bg-gradient-to-br from-gray-50 via-white to-gray-50',
        'dark:from-[#0a0a0a] dark:via-black dark:to-[#0a0a0a]',
        'border border-gray-200/60 dark:border-white/10',
        'shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-purple-500/[0.02] dark:from-blue-500/[0.03] dark:to-purple-500/[0.03]" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
