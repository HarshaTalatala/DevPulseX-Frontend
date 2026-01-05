import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status';
  status?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', status, className }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

  if (variant === 'status' && status) {
    const colors = getStatusColor(status);
    return (
      <span className={cn(baseStyles, colors.bg, colors.text, colors.border, className)}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn(baseStyles, 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600', className)}>
      {children}
    </span>
  );
};
