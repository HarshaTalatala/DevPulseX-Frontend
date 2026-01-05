import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hover = false, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#0a0a0a] border border-gray-200/60 dark:border-white/10 rounded-xl shadow-sm',
        'transition-all duration-200',
        hover && 'hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-white/5', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-4 py-4 sm:px-6 sm:py-5', className)} {...props}>
      {children}
    </div>
  );
};
