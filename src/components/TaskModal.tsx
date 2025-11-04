"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TaskDto, TaskStatus, ProjectDto, UserDto } from '@/types';
import { Calendar, X } from 'lucide-react';

export type TaskFormValues = Omit<TaskDto, 'id'>;

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  initial?: Partial<TaskDto> | null;
  projects: ProjectDto[] | undefined;
  users: UserDto[] | undefined;
}

const statusOptions = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.REVIEW, label: 'Review' },
  { value: TaskStatus.DONE, label: 'Done' },
  { value: TaskStatus.BLOCKED, label: 'Blocked' },
];

export default function TaskModal({ open, onClose, onSubmit, initial, projects, users }: TaskModalProps) {
  const [values, setValues] = useState<TaskFormValues>({
    title: '',
    description: '',
    projectId: projects?.[0]?.id ?? 0,
    assignedUserId: undefined,
    status: TaskStatus.TODO,
    dueDate: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setValues((prev) => ({
        ...prev,
        title: initial.title ?? '',
        description: initial.description ?? '',
        projectId: initial.projectId ?? projects?.[0]?.id ?? 0,
        assignedUserId: initial.assignedUserId,
        status: initial.status ?? TaskStatus.TODO,
        dueDate: initial.dueDate,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, projects]);

  const handleChange = (field: keyof TaskFormValues, value: any) => {
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Card (Vercel-ish glass) */}
          <motion.div
            role="dialog"
            aria-modal
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Accent gradient bar */}
            <div className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_60%)]" />

            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {initial?.id ? 'Edit Task' : 'Create Task'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Define task details, ownership, and timeline.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Implement authentication flow"
                  required
                  value={values.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    rows={3}
                    placeholder="Add context, acceptance criteria, links..."
                    value={values.description ?? ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Project"
                    value={values.projectId}
                    onChange={(e) => handleChange('projectId', Number(e.target.value))}
                    options={(projects ?? []).map((p) => ({ value: p.id, label: p.name }))}
                  />

                  <Select
                    label="Assignee"
                    value={values.assignedUserId ?? ''}
                    onChange={(e) => handleChange('assignedUserId', e.target.value ? Number(e.target.value) : undefined)}
                    options={[{ value: '', label: 'Unassigned' }, ...(users ?? []).map((u) => ({ value: u.id, label: u.name }))]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Status"
                    value={values.status}
                    onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
                    options={statusOptions}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due date</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        value={values.dueDate ?? ''}
                        onChange={(e) => handleChange('dueDate', e.target.value || undefined)}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button type="submit" isLoading={submitting}>
                    {initial?.id ? 'Save changes' : 'Create task'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
