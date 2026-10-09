import type { Book } from '../types';

export const toAdminBookInput = (book: Partial<Book>) => ({
  ...(book.version === undefined ? {} : { version: book.version }),
  title: book.title ?? '',
  shortDescription: book.shortDescription ?? '',
  publicationMonth: book.publicationMonth ?? 0,
  publicationYear: book.publicationYear ?? 0,
  price: book.price ?? { amountMinor: 0, currency: 'INR' },
  status: book.status ?? 'DRAFT',
  prebook: {
    enabled: book.prebook?.enabled ?? false,
    discountPercent: book.prebook?.discountPercent ?? 0,
  },
  ...(book.coverUploadRef ? { coverUploadRef: book.coverUploadRef } : {}),
  ...(book.contentUploadRef ? { contentUploadRef: book.contentUploadRef } : {}),
  ...(book.youtubeAsset ? {
    youtubeAsset: {
      songName: book.youtubeAsset.songName,
      youtubeUrl: book.youtubeAsset.youtubeUrl,
    },
  } : {}),
});
