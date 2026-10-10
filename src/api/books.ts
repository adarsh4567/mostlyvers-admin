import type { Book } from '../types';

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

  if (!persisted.coverUrl) throw new Error('Upload a book cover before publishing.');
  if (persisted.contentStatus !== 'VALID') throw new Error('Wait for EPUB processing to finish before publishing.');

  await client.post(`/admin/books/${bookId}/publish`);
  return persisted;
}
