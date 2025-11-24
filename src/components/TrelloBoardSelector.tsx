"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { useProject } from '@/hooks/useProjects';
import { useTrelloBoards } from '@/hooks/useTrello';

interface Props {
  projectId: number;
  trelloUserId?: string; // Trello member id/username; if not provided, show input field
}

export default function TrelloBoardSelector({ projectId, trelloUserId: initialUserId }: Props) {
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const [trelloUserId, setTrelloUserId] = useState<string | undefined>(initialUserId);
  const { data: boards, isLoading, refetch, isFetching } = useTrelloBoards(trelloUserId);

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

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg">
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trello User ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. your Trello member ID"
              value={trelloUserId || ''}
              onChange={(e) => setTrelloUserId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => refetch()}
              disabled={!trelloUserId || isLoading || isFetching}
              className="px-3 py-2 rounded-md bg-gray-900 text-white dark:bg-white dark:text-black text-sm disabled:opacity-50"
            >
              {isFetching ? 'Loading…' : 'Load Boards'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trello Board</label>
          <select
            className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100"
            value={selectedBoardId || ''}
            onChange={(e) => setSelectedBoardId(e.target.value)}
          >
            <option value="">Select a board…</option>
            {boardOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={updateProjectMutation.isPending}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
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
