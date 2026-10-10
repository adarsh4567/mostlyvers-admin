import { describe, expect, it, vi } from 'vitest';
import type { Book } from '../types';
import { bookListStatusFromSearch, bookNeedsProcessingPoll, saveThenPublishBook, toAdminBookInput, toCreateBookInput } from './books';

describe('simplified draft creation', () => {
  it('sends only reader-entered creation fields and always leaves pricing to the backend', () => {
    expect(toCreateBookInput({
      title: '  A Story  ', contentUploadRef: 'epub-upload', shortDescription: '',
      price: { amountMinor: 13500, currency: 'INR' }, status: 'PUBLISHED',
    })).toEqual({ title: 'A Story', contentUploadRef: 'epub-upload' });
  });

  it('selects the Draft list from the redirect query and polls only active processing rows', () => {
    expect(bookListStatusFromSearch('?status=DRAFT')).toBe('DRAFT');
    expect(bookListStatusFromSearch('?status=INVALID')).toBe('');
    expect(bookNeedsProcessingPoll([{ contentStatus: 'PROCESSING' }])).toBe(true);
    expect(bookNeedsProcessingPoll([{ contentStatus: 'VALID' }, { contentStatus: 'FAILED' }])).toBe(false);
  });
});

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

  it('publishes a validated EPUB when no cover was uploaded', async () => {
    const client = { patch: vi.fn(), post: vi.fn(async () => ({ status: 'COMPLETED' })) };
    await expect(saveThenPublishBook(client, 'book-id', { title: 'Coverless', contentStatus: 'VALID' }, false)).resolves.toMatchObject({ title: 'Coverless' });
    expect(client.post).toHaveBeenCalledWith('/admin/books/book-id/publish');
  });
});
