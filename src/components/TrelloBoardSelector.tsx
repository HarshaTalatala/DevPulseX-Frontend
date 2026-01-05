"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { useProject } from '@/hooks/useProjects';
import { useTrelloBoards } from '@/hooks/useTrello';
import { useAuthStore } from '@/stores/auth';

interface Props {
  projectId: number;
}

export default function TrelloBoardSelector({ projectId }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);

  const { data: boards, isLoading, error, refetch, isFetching } = useTrelloBoards();

  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

  useEffect(() => {
    if (project?.trelloBoardId) {
      setSelectedBoardId(project.trelloBoardId);
    }
  }, [project?.trelloBoardId]);
  
  const updateProjectMutation = useMutation({
    mutationFn: async (boardId: string | null) => {
      if (!project) return;
      const payload = { name: project.name, teamId: project.teamId, trelloBoardId: boardId ?? null } as any;
      return projectsApi.update(project.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['trello', 'project', projectId] });
    },
  });

  const handleSave = async () => {
    await updateProjectMutation.mutateAsync(selectedBoardId ?? null);
  };

  const boardOptions = useMemo(() => {
    if (!boards || !Array.isArray(boards)) return [] as Array<{ id: string; name: string }>;
    return boards.map((b: any) => ({ id: b.id, name: b.name }));
  }, [boards]);

  if (!isTrelloLinked) {
    return (
      <div className="w-full p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">Trello Account Not Linked</h4>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Please link your Trello account in the Accounts tab to select boards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Trello Boards</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Uses your linked Trello account</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="px-3 py-2 rounded-md bg-gray-900 text-white dark:bg-white dark:text-black text-sm disabled:opacity-50"
          >
            {isFetching ? 'Loading…' : 'Reload'}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-xs text-red-700 dark:text-red-300">
            <div className="font-medium mb-1">Failed to load boards:</div>
            <div>{(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}</div>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading boards…</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trello Board</label>
            <select
              className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100"
              value={selectedBoardId || ''}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              disabled={boardOptions.length === 0}
            >
              <option value="">
                {boardOptions.length === 0 ? 'No boards available' : 'Select a board…'}
              </option>
              {boardOptions.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={updateProjectMutation.isPending || !selectedBoardId}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProjectMutation.isPending ? 'Saving…' : 'Save to Project'}
          </button>
          {project?.trelloBoardId && (
            <button
              onClick={() => updateProjectMutation.mutate(null)}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              Unlink Board
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
