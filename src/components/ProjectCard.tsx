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
        <div className="relative rounded-xl p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-white/5 text-gray-300 border border-white/10 flex-shrink-0">
                <FolderKanban className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                {repo.name}
              </h3>
            </div>
            {repo.description && (
              <p className="mt-2 text-xs sm:text-sm text-gray-400 line-clamp-2">
                {repo.description}
              </p>
            )}
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
              {repo.language && (
                <Badge className="text-[10px] sm:text-xs bg-white/10 text-gray-300 border-white/15">
                  {repo.language}
                </Badge>
              )}
              {repo.private && (
                <Badge className="text-[10px] sm:text-xs bg-white/10 text-gray-300 border-white/15">
                  Private
                </Badge>
              )}
            </div>
          </div>
          <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 group-hover:text-white group-hover:border-white/20 transition-colors flex-shrink-0">
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-2 sm:mb-3">
          <div className="text-center rounded-lg bg-white/5 border border-white/10 p-1.5 sm:p-2">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-sm md:text-base font-semibold text-gray-200">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
              <span className="tabular-nums">{repo.stargazers_count || 0}</span>
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-0.5">Stars</div>
          </div>
          <div className="text-center rounded-lg bg-white/5 border border-white/10 p-1.5 sm:p-2">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-sm md:text-base font-semibold text-gray-200">
              <GitFork className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
              <span className="tabular-nums">{repo.forks_count || 0}</span>
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-0.5">Forks</div>
          </div>
          <div className="text-center rounded-lg bg-white/5 border border-white/10 p-1.5 sm:p-2">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-sm md:text-base font-semibold text-gray-200">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
              <span className="tabular-nums">{repo.open_issues_count || 0}</span>
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-0.5">Issues</div>
          </div>
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 sm:gap-1.5">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/5 text-gray-300 border border-white/10"
              >
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 text-gray-500">
                +{repo.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10 text-[10px] sm:text-xs text-gray-400 tabular-nums">
          Updated {new Date(repo.updated_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        </div>
      </div>
    </motion.a>
  );
};

export default ProjectCard;
