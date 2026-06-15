"use client";

import { useTrelloBoardAggregate, useSyncTrelloTasks } from '@/hooks/useTrello';
import { useAuthStore } from '@/stores/auth';
import { useProject } from '@/hooks/useProjects';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  User, 
  Tag, 
  Layers, 
  Kanban,
  ClipboardList,
  DatabaseZap,
  ArrowRightLeft
} from 'lucide-react';

interface Props {
  projectId?: number;
  boardId?: string;
}

export default function TrelloBoardViewer({ projectId, boardId }: Props) {
  const { user } = useAuthStore();
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);
  const canSync = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const { data: project } = useProject(projectId);
  const effectiveBoardId = boardId ?? project?.trelloBoardId ?? undefined;

  const { data, isLoading, error, refetch, isFetching } = useTrelloBoardAggregate(effectiveBoardId);
  const syncMutation = useSyncTrelloTasks();

  const handleSync = async () => {
    if (!projectId) {
      toast.error('Please select a project first to sync tasks.');
      return;
    }
    
    try {
      const result = await syncMutation.mutateAsync(projectId);
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm">Sync Completed Successfully!</span>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Created {result.created} new tasks, ignored {result.ignored} duplicates.
          </span>
        </div>
      );
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Sync failed';
      toast.error(`Sync failed: ${errorMsg}`);
    }
  };

  if (!isTrelloLinked) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl"
      >
        <div className="inline-flex p-3 rounded-full bg-amber-100 dark:bg-amber-500/10 mb-3">
          <AlertCircle className="h-6 w-6 text-amber-700 dark:text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100 mb-2">Trello Account Not Linked</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300 max-w-md mx-auto">
          Please link your Trello account in the <strong>Accounts</strong> tab first to view and sync board data.
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800/40 rounded-xl animate-pulse border border-gray-200/50 dark:border-white/5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50/60 dark:bg-gray-800/30 border border-gray-200/50 dark:border-white/5 animate-pulse h-80 flex flex-col gap-3">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error';
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-500/20"
      >
        <div className="flex items-center gap-2 text-red-800 dark:text-red-400 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-sm font-semibold">Failed to Load Trello Data</h3>
        </div>
        <p className="text-sm text-red-700 dark:text-red-400 font-mono text-xs p-2 bg-red-100/50 dark:bg-red-950/20 rounded border border-red-200/30">{errorMessage}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
          Make sure your server credentials are correct and that you have linked a Trello board to this project in the selector above.
        </p>
      </motion.div>
    );
  }

  const lists = data?.lists || [];
  const totalCards = lists.reduce((count: number, list: any) => count + (list.cards?.length || 0), 0);

  if (!lists || lists.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 text-center bg-gray-50/50 dark:bg-white/[0.01] rounded-xl border border-dashed border-gray-300 dark:border-white/10"
      >
        <Kanban className="h-8 w-8 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No Trello board selected</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {projectId
            ? 'Select a board for this project in the mapping settings to see its lists and cards.'
            : 'Choose a Trello board above to preview lists and cards from your linked account.'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics & Sync Controller */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Left Side: Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Lists
            </span>
            <span className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{lists.length}</span>
          </div>

          <div className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Cards
            </span>
            <span className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{totalCards}</span>
          </div>

          <div className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Integration
            </span>
            <span className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected
            </span>
          </div>
        </div>

        {/* Right Side: Sync Controls Box */}
        <div className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-900/60 dark:to-gray-950/40 backdrop-blur-md p-4 flex flex-col justify-center gap-3 lg:w-96 shadow-sm">
          {projectId ? (
            <>
              {canSync ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Tasks Sync Engine</span>
                    <button
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                      Refresh Trello
                    </button>
                  </div>
                  <button
                    onClick={handleSync}
                    disabled={syncMutation.isPending || isFetching}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 hover:from-black dark:hover:from-gray-200 text-white dark:text-black font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-gray-900/10 dark:hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 border-0"
                  >
                    {syncMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Syncing Tasks…
                      </>
                    ) : (
                      <>
                        <DatabaseZap className="h-4 w-4" />
                        Sync Board to Local Tasks
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-normal">
                    Imports Trello cards into your local DevPulseX Kanban board as tasks and auto-maps status columns.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Only **Admins** or **Managers** have permission to synchronize Trello boards to local project tasks.</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-500/5 border border-gray-500/10 rounded-lg p-3 flex gap-2 justify-center items-center text-center">
              <Sparkles className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>Select a project in the <strong>Project Scope</strong> dropdown to enable database task syncing.</span>
            </div>
          )}
        </div>
      </div>

      {/* Board Kanban Board Column Layout */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        <div className="min-w-[900px] flex items-stretch gap-4">
          <AnimatePresence>
            {lists.map((list: any, listIdx: number) => (
              <motion.div 
                key={list.listId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: listIdx * 0.05 }}
                className="w-80 flex-shrink-0 rounded-2xl border border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 p-3 flex flex-col"
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 shadow-sm">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{list.listName}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm">
                    {list.cards?.length || 0}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800">
                  {list.cards?.map((card: any, cardIdx: number) => (
                    <motion.div 
                      key={card.id} 
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-md cursor-default relative overflow-hidden"
                    >
                      {/* Vercel-style color strip for decorative purposes */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200/80 to-gray-300/80 dark:from-white/10 dark:to-white/5" />

                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug break-words">{card.name}</div>
                      
                      {card.desc && (
                        <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed break-words">
                          {card.desc}
                        </div>
                      )}

                      {/* Card Labels */}
                      {(card.labels?.length || 0) > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {card.labels.map((label: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[9px] font-semibold border border-gray-200/50 dark:border-white/5 flex items-center gap-1"
                            >
                              <Tag className="h-2 w-2 text-gray-400" />
                              {label || 'Label'}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Members */}
                      {(card.memberIds?.length || 0) > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center gap-1.5 flex-wrap">
                          <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-wrap gap-1">
                            {card.memberIds.map((member: string, idx: number) => (
                              <span 
                                key={idx} 
                                className="px-1.5 py-0.5 rounded bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 text-[9px] font-mono border border-gray-200/30 dark:border-white/5"
                              >
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {(!list.cards || list.cards.length === 0) && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center py-8 border border-dashed border-gray-200/60 dark:border-white/5 rounded-xl bg-white/20 dark:bg-black/10">
                      Empty List
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
