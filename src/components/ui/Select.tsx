import React, { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-md',
          'bg-white dark:bg-black text-gray-900 dark:text-gray-100 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:border-gray-400 dark:hover:border-gray-600',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
