import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { completeBookPublish } from './adminConsistency';

describe('admin book consistency', () => {
  it('invalidates every book-backed view and redirects after publication', async () => {
    const client = new QueryClient();
    const keys = [
      ['books'],
      ['books', 'UPCOMING', '', false],
      ['books', 'PUBLISHED', '', true],
      ['book', 'book-1'],
      ['dashboard'],
      ['youtube-assets'],
    ];
    keys.forEach(key => client.setQueryData(key, { cached: true }));
    const navigate = vi.fn();

    await completeBookPublish(client, 'book-1', navigate);

    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    expect(navigate).toHaveBeenCalledWith('/books', { replace: true });
  });
});
