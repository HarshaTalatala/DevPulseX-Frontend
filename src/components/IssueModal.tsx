"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { IssueDto, IssueStatus, ProjectDto, UserDto } from '@/types';
import { X, AlertTriangle } from 'lucide-react';

export type IssueFormValues = Omit<IssueDto, 'id'>;

interface IssueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IssueFormValues) => Promise<void> | void;
  initial?: Partial<IssueDto> | null;
  projects: ProjectDto[] | undefined;
  users: UserDto[] | undefined;
}

const statusOptions = [
  { value: IssueStatus.OPEN, label: 'Open' },
  { value: IssueStatus.IN_PROGRESS, label: 'In Progress' },
  { value: IssueStatus.RESOLVED, label: 'Resolved' },
  { value: IssueStatus.CLOSED, label: 'Closed' },
];

export default function IssueModal({ open, onClose, onSubmit, initial, projects, users }: IssueModalProps) {
  const [values, setValues] = useState<IssueFormValues>({
    description: '',
    projectId: projects?.[0]?.id ?? 0,
    userId: users?.[0]?.id ?? 0,
    status: IssueStatus.OPEN,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setValues((prev) => ({
        ...prev,
        description: initial.description ?? '',
        projectId: initial.projectId ?? projects?.[0]?.id ?? 0,
        userId: initial.userId ?? users?.[0]?.id ?? 0,
        status: initial.status ?? IssueStatus.OPEN,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, projects, users]);

  const handleChange = (field: keyof IssueFormValues, value: any) => {
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
            <div className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.35),transparent_60%)]" />

            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {initial?.id ? 'Edit Issue' : 'Report Issue'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track bugs, tasks, or blockers.</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    rows={4}
                    placeholder="Describe the issue, bug, or blocker..."
                    required
                    value={values.description}
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
                    label="Reporter"
                    value={values.userId}
                    onChange={(e) => handleChange('userId', Number(e.target.value))}
                    options={(users ?? []).map((u) => ({ value: u.id, label: u.name }))}
                  />
                </div>

                <Select
                  label="Status"
                  value={values.status}
                  onChange={(e) => handleChange('status', e.target.value as IssueStatus)}
                  options={statusOptions}
                />

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button type="submit" isLoading={submitting} variant="danger">
                    {initial?.id ? 'Save changes' : 'Report issue'}
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
