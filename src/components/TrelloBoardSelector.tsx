"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { useProject } from '@/hooks/useProjects';
import { useTrelloBoards } from '@/hooks/useTrello';
import { useTrelloAuth } from '@/hooks/useTrelloAuth';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import { RefreshCw, Link2, Link2Off, AlertTriangle, KeyRound } from 'lucide-react';

interface Props {
  projectId?: number;
  onBoardChange?: (boardId?: string) => void;
}

export default function TrelloBoardSelector({ projectId, onBoardChange }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);
  const canLinkBoardToProject = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const { initiateTrelloLogin, loading: trelloAuthLoading } = useTrelloAuth();

  const { data: boards, isLoading, error, refetch, isFetching } = useTrelloBoards();

  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

  useEffect(() => {
    if (project?.trelloBoardId) {
      setSelectedBoardId(project.trelloBoardId);
    } else {
      setSelectedBoardId('');
    }
  }, [project?.trelloBoardId, projectId]);

  useEffect(() => {
    onBoardChange?.(selectedBoardId || undefined);
  }, [onBoardChange, selectedBoardId]);

  const updateProjectMutation = useMutation({
    mutationFn: async (boardId: string | null) => {
      if (!project || !projectId) return;
      const payload = { 
        name: project.name, 
        teamId: project.teamId, 
        trelloBoardId: boardId ?? null 
      } as any;
      return projectsApi.update(project.id, payload);
    },
    onSuccess: (_, boardId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        queryClient.invalidateQueries({ queryKey: ['trello', 'project', projectId] });
        queryClient.invalidateQueries({ queryKey: ['trello', 'board-aggregate'] });
      }
      if (boardId) {
        toast.success('Trello board linked to project successfully!');
      } else {
        toast.success('Trello board unlinked from project.');
      }
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Update failed';
      toast.error(`Failed to update board mapping: ${errMsg}`);
    }
  });

  const handleSave = async () => {
    if (!selectedBoardId) {
      toast.error('Please select a board to link.');
      return;
    }
    await updateProjectMutation.mutateAsync(selectedBoardId);
  };

  const handleUnlink = async () => {
    await updateProjectMutation.mutateAsync(null);
    setSelectedBoardId('');
  };

  const boardOptions = useMemo(() => {
    if (!boards || !Array.isArray(boards)) return [] as Array<{ id: string; name: string }>;
    return boards.map((b: any) => ({ id: b.id, name: b.name }));
  }, [boards]);

  const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error';
  const showRelinkAction = /token missing|re-link|reconnect/i.test(errorMessage);

  if (!isTrelloLinked) {
    return (
      <div className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-md">
        <div className="flex gap-3 items-start">
          <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">Trello Account Not Connected</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-normal">
              Go to the <strong>Accounts</strong> tab to link your Trello account to DevPulseX first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200/60 dark:border-white/5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              Trello Boards Selector
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {projectId ? 'Manage Trello board mapping for this project' : 'Select a board to preview its content'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
            title="Reload Trello Boards"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-300 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error panel */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-400">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              Failed to load boards:
            </div>
            <div className="font-mono text-[10px] break-all">{errorMessage}</div>
            {showRelinkAction && (
              <button
                onClick={() => initiateTrelloLogin()}
                disabled={trelloAuthLoading}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 border-0 shadow-sm"
              >
                {trelloAuthLoading ? 'Redirecting…' : 'Re-link Trello Account'}
              </button>
            )}
          </div>
        )}

        {/* Loading / dropdown selection */}
        {isLoading ? (
          <div className="py-4 text-center rounded-lg border border-dashed border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/10">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Fetching Trello Boards…</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trello Board</label>
            <select
              className="w-full px-3 py-2.5 rounded-lg bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-xs text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-white/10 transition-colors focus:ring-1 focus:ring-blue-500 outline-none"
              value={selectedBoardId || ''}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              disabled={boardOptions.length === 0}
            >
              <option value="">
                {boardOptions.length === 0 ? 'No boards found' : 'Choose a board…'}
              </option>
              {boardOptions.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Linking mapping actions */}
        {projectId && (
          <div className="flex flex-col gap-2">
            {canLinkBoardToProject ? (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={handleSave}
                  disabled={updateProjectMutation.isPending || !selectedBoardId || selectedBoardId === project?.trelloBoardId}
                  className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm border-0"
                >
                  {updateProjectMutation.isPending ? 'Saving…' : 'Link Board to Project'}
                </button>
                {project?.trelloBoardId && (
                  <button
                    onClick={handleUnlink}
                    disabled={updateProjectMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100 text-xs font-bold transition-all duration-300 flex items-center gap-1 border-0"
                  >
                    <Link2Off className="h-3.5 w-3.5" />
                    Unlink Board
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>You can preview boards, but only an **Admin** or **Manager** can link a board to this project.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
