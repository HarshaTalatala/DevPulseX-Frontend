"use client";

import { useMemo } from 'react';
import { useProjectTrello } from '@/hooks/useTrello';
import { useAuthStore } from '@/stores/auth';

interface Props {
  projectId: number;
}

export default function TrelloBoardViewer({ projectId }: Props) {
  const { user } = useAuthStore();
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);
  const { data, isLoading, error } = useProjectTrello(projectId);

  if (!isTrelloLinked) {
    return (
      <div className="p-8 text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
        <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100 mb-2">Trello Account Not Linked</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Link your Trello account in the <strong>Accounts</strong> tab to view board data here.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 animate-pulse h-64"></div>
        ))}
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error';
    return (
      <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
        <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Failed to Load Trello Data</h3>
        <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
        <p className="text-xs text-red-600 dark:text-red-500 mt-2">
          Make sure you have linked a Trello board to this project in the selector above.
        </p>
      </div>
    );
  }

  const lists = useMemo(() => data?.lists || [], [data]);

  if (!lists || lists.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-gray-300 dark:border-white/10">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">No Trello data to display</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Link your Trello account and select a board for this project to see lists and cards.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {lists.map((list: any) => (
          <div key={list.listId} className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-lg p-3">
            <div className="mb-3 px-2 py-1 rounded-md bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-100 text-sm font-semibold">
              {list.listName}
            </div>
            <div className="space-y-3">
              {list.cards?.map((card: any) => (
                <div key={card.id} className="p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{card.name}</div>
                  {card.desc && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{card.desc}</div>
                  )}
                  {(card.labels?.length || 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {card.labels.map((label: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[11px]">
                          {label || 'Label'}
                        </span>
                      ))}
                    </div>
                  )}
                  {(card.memberIds?.length || 0) > 0 && (
                    <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                      Assignees: {card.memberIds.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {(!list.cards || list.cards.length === 0) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-md">
                  No cards
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
