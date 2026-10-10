import type { Book } from '../types';

const bookStatuses = new Set(['DRAFT', 'UPCOMING', 'PUBLISHED', 'ARCHIVED']);

export const bookListStatusFromSearch = (search: string) => {
  const value = new URLSearchParams(search).get('status') || '';
  return bookStatuses.has(value) ? value as Book['status'] : '';
};

export const bookNeedsProcessingPoll = (books: Array<Pick<Book, 'contentStatus'>>) => books.some(book => book.contentStatus === 'PROCESSING');

export const toCreateBookInput = (book: Partial<Book>) => ({
  title: (book.title || '').trim(),
  contentUploadRef: book.contentUploadRef || '',
  ...(book.coverUploadRef ? { coverUploadRef: book.coverUploadRef } : {}),
  ...(book.shortDescription?.trim() ? { shortDescription: book.shortDescription.trim() } : {}),
  ...(book.publicationMonth ? { publicationMonth: book.publicationMonth } : {}),
  ...(book.publicationYear ? { publicationYear: book.publicationYear } : {}),
  ...(book.youtubeAsset?.songName.trim() && book.youtubeAsset.youtubeUrl.trim() ? { youtubeAsset: { songName: book.youtubeAsset.songName.trim(), youtubeUrl: book.youtubeAsset.youtubeUrl.trim() } } : {}),
});

export interface BookPublicationClient {
  patch: (path: string, body: unknown) => Promise<Partial<Book>>;
  post: (path: string) => Promise<unknown>;
}

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

export async function saveThenPublishBook(
  client: BookPublicationClient,
  bookId: string,
  book: Partial<Book>,
  hasUnsavedChanges: boolean,
): Promise<Partial<Book>> {
  const persisted = hasUnsavedChanges
    ? await client.patch(`/admin/books/${bookId}`, toAdminBookInput(book))
    : book;

  if (persisted.contentStatus !== 'VALID') throw new Error('Wait for EPUB processing to finish before publishing.');

  await client.post(`/admin/books/${bookId}/publish`);
  return persisted;
}
