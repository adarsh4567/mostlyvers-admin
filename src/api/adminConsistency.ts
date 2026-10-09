import type { QueryClient } from '@tanstack/react-query';

type Navigate = (to: string, options: { replace: boolean }) => void;

export async function refreshBookViews(client: QueryClient, bookId?: string): Promise<void> {
  const invalidations = [
    client.invalidateQueries({ queryKey: ['books'], refetchType: 'active' }),
    client.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'active' }),
    client.invalidateQueries({ queryKey: ['youtube-assets'], refetchType: 'active' }),
  ];
  if (bookId) invalidations.push(client.invalidateQueries({ queryKey: ['book', bookId], refetchType: 'active' }));
  await Promise.all(invalidations);
}

export async function completeBookPublish(client: QueryClient, bookId: string, navigate: Navigate): Promise<void> {
  await refreshBookViews(client, bookId);
  navigate('/books', { replace: true });
}
