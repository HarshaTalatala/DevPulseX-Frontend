import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-800', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <thead className={cn('bg-gray-50 dark:bg-gray-900/50', className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <tbody className={cn('bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800', className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <tr className={cn('hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100', className)} {...props}>
      {children}
    </td>
  );
};
