import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '../types';
import { BookEditorPage, BooksPage } from './BooksWorkflowPages';

const mocks = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn(),
}));

vi.mock('../api/client', () => ({ adminApi: mocks }));
vi.mock('../api/uploads', () => ({ uploadPrivateFile: mocks.upload }));

const draft = (changes: Partial<Book> = {}): Book => ({
  id: 'book-1', version: 1, title: 'A Story', shortDescription: '', coverUrl: '',
  publicationMonth: 10, publicationYear: 2026, price: { amountMinor: 0, currency: 'INR' }, status: 'DRAFT',
  purchaseCount: 0, revenue: { amountMinor: 0, currency: 'INR' }, contentFileName: 'story.epub', contentStatus: 'PROCESSING',
  prebook: { enabled: false, discountPercent: 15, count: 0 }, catalogStatus: 'NOT_CONFIGURED',
  actions: { canEdit: true, canPublish: false, canArchive: false, canDelete: true, publishBlockedReason: 'EPUB processing is still in progress.' },
  createdAt: '2026-10-10T00:00:00Z', updatedAt: '2026-10-10T00:00:00Z', ...changes,
});

function Destination() { const location = useLocation(); return <div>destination {location.search}</div>; }
const renderRoute = (element: React.ReactNode, path = '/books/new') => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><MemoryRouter initialEntries={[path]}><Routes><Route path="/books/new" element={element}/><Route path="/books" element={path.startsWith('/books?') ? element : <Destination/>}/></Routes></MemoryRouter></QueryClientProvider>);

describe('simplified book workflow', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('requires a title and completed EPUB upload, then saves and redirects to Drafts', async () => {
    const user = userEvent.setup();
    mocks.upload.mockResolvedValue({ uploadRef: 'upload-1', status: 'UPLOADED' });
    mocks.post.mockResolvedValue(draft());
    renderRoute(<BookEditorPage/>);

    const save = screen.getByRole('button', { name: /save draft/i });
    expect(save).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Enter book title'), 'A Story');
    expect(save).toBeDisabled();
    await user.upload(screen.getByLabelText(/choose epub/i), new File(['epub'], 'story.epub', { type: 'application/epub+zip' }));
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    await waitFor(() => expect(screen.getByText('destination ?status=DRAFT')).toBeInTheDocument());
    expect(mocks.post).toHaveBeenCalledWith('/admin/books', { title: 'A Story', contentUploadRef: 'upload-1', publicationMonth: expect.any(Number), publicationYear: expect.any(Number) });
  });

  it('shows server-provided disabled action reasons', async () => {
    mocks.get.mockResolvedValue({ items: [draft({ actions: { canEdit: true, canPublish: false, canArchive: false, canDelete: false, publishBlockedReason: 'Still processing.', deleteBlockedReason: 'Reader history requires retention.' } })] });
    renderRoute(<BooksPage/>, '/books?status=DRAFT');
    await userEvent.click(await screen.findByLabelText('Actions for A Story'));
    expect(screen.getByRole('button', { name: 'Publish' })).toHaveAttribute('title', 'Still processing.');
    expect(screen.getByRole('button', { name: /Delete permanently/ })).toHaveAttribute('title', 'Reader history requires retention.');
  });
});
