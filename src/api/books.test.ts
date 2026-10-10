import { describe, expect, it, vi } from 'vitest';
import type { Book } from '../types';
import { saveThenPublishBook, toAdminBookInput } from './books';

describe('toAdminBookInput', () => {
  it('removes read-only dashboard fields rejected by the backend decoder', () => {
    const book: Partial<Book> = {
      id: 'book-id',
      version: 3,
      title: 'A Story',
      shortDescription: 'A description',
      coverUrl: 'blob:http://localhost/cover',
      publicationMonth: 9,
      publicationYear: 2026,
      price: { amountMinor: 19900, currency: 'INR' },
      status: 'DRAFT',
      purchaseCount: 0,
      revenue: { amountMinor: 0, currency: 'INR' },
      contentFileName: 'story.epub',
      contentStatus: 'VALID',
      prebook: { enabled: false, discountPercent: 15, count: 0 },
      catalogStatus: 'NOT_CONFIGURED',
      coverUploadRef: 'cover-upload',
      contentUploadRef: 'epub-upload',
      createdAt: '2026-09-30T00:00:00Z',
      updatedAt: '2026-09-30T00:00:00Z',
    };

    expect(toAdminBookInput(book)).toEqual({
      version: 3,
      title: 'A Story',
      shortDescription: 'A description',
      publicationMonth: 9,
      publicationYear: 2026,
      price: { amountMinor: 19900, currency: 'INR' },
      status: 'DRAFT',
      prebook: { enabled: false, discountPercent: 15 },
      coverUploadRef: 'cover-upload',
      contentUploadRef: 'epub-upload',
    });
  });
});

describe('saveThenPublishBook', () => {
  it('persists an uploaded cover before sending the publish request', async () => {
    const calls: string[] = [];
    const savedBook: Partial<Book> = {
      id: 'book-id', version: 4, title: 'A Story', coverUrl: 'https://images.example.test/cover.jpg', contentStatus: 'VALID',
    };
    const client = {
      patch: vi.fn(async (path: string, body: unknown) => {
        calls.push(`PATCH ${path}`);
        expect(body).toMatchObject({ coverUploadRef: 'cover-upload' });
        return savedBook;
      }),
      post: vi.fn(async (path: string) => {
        calls.push(`POST ${path}`);
        return { status: 'COMPLETED' };
      }),
    };

    const result = await saveThenPublishBook(client, 'book-id', {
      ...savedBook,
      coverUrl: 'blob:https://admin.example.test/local-cover',
      coverUploadRef: 'cover-upload',
    }, true);

    expect(result).toBe(savedBook);
    expect(calls).toEqual([
      'PATCH /admin/books/book-id',
      'POST /admin/books/book-id/publish',
    ]);
  });
});
