'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Star, GitFork, AlertCircle, FolderKanban } from 'lucide-react';

type Repo = {
  id: number | string;
  name: string;
  description?: string | null;
  language?: string | null;
  private?: boolean;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  topics?: string[];
  updated_at: string;
};

interface ProjectCardProps {
  repo: Repo;
  index?: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ repo, index = 0 }) => {
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group relative block rounded-xl overflow-hidden"
    >
      {/* Monochrome card wrapper */}
      <div className="rounded-xl border border-white/10 bg-neutral-950/60 dark:bg-black/50 backdrop-blur-sm transition-colors duration-300 group-hover:border-white/20">
        {/* Card body */}
        <div className="relative rounded-xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-gray-300 border border-white/10">
                <FolderKanban className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                {repo.name}
              </h3>
            </div>
            {repo.description && (
              <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                {repo.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {repo.language && (
                <Badge className="text-xs bg-white/10 text-gray-300 border-white/15">
                  {repo.language}
                </Badge>
              )}
              {repo.private && (
                <Badge className="text-xs bg-white/10 text-gray-300 border-white/15">
                  Private
                </Badge>
              )}
            </div>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 group-hover:text-white group-hover:border-white/20 transition-colors">
            <ExternalLink className="h-4 w-4" />
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          <div className="text-center rounded-lg bg-white/5 border border-white/10 p-2">
            <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-semibold text-gray-200">
              <Star className="h-4 w-4 text-gray-300" />
              {repo.stargazers_count || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">Stars</div>
          </div>
          <div className="text-center rounded-lg bg-white/5 border border-white/10 p-2">
            <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-semibold text-gray-200">
              <GitFork className="h-4 w-4 text-gray-300" />
              {repo.forks_count || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">Forks</div>
          </div>
          <div className="text-center rounded-lg bg-white/5 border border-white/10 p-2">
            <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-semibold text-gray-200">
              <AlertCircle className="h-4 w-4 text-gray-300" />
              {repo.open_issues_count || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">Issues</div>
          </div>
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[10px] sm:text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10"
              >
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[10px] sm:text-xs px-2 py-1 text-gray-500">
                +{repo.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
          Updated {new Date(repo.updated_at).toLocaleDateString()}
        </div>
        </div>
      </div>
    </motion.a>
  );
};

export default ProjectCard;
