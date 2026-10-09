import { describe, expect, it } from 'vitest';
import type { Book } from '../types';
import { toAdminBookInput } from './books';

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
