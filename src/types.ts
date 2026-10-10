export type Money = { amountMinor: number; currency: 'INR' | string };
export type BookStatus = 'DRAFT' | 'UPCOMING' | 'PUBLISHED' | 'ARCHIVED';
export type CatalogStatus = 'NOT_CONFIGURED' | 'SYNCING' | 'ACTIVE' | 'FAILED';
export type ContentStatus = 'MISSING' | 'PROCESSING' | 'VALID' | 'FAILED';

export interface AdminBookActions {
  canEdit: boolean; canPublish: boolean; canArchive: boolean; canDelete: boolean;
  publishBlockedReason?: string; deleteBlockedReason?: string;
}

export interface Owner {
  id: string; name: string; email: string; phone: string; profilePictureUrl?: string;
}

export interface AdminSession {
  accessToken: string; accessTokenExpiresAt: string; csrfToken: string;
  owner: Owner; capabilities: string[];
}

export interface Book {
  id: string; version: number; title: string; shortDescription: string; coverUrl: string;
  publicationMonth: number; publicationYear: number; price: Money; status: BookStatus;
  purchaseCount: number; revenue: Money; contentFileName?: string; contentStatus: ContentStatus;
  contentProgress?: number; contentErrorCode?: string; actions: AdminBookActions;
  youtubeAsset?: { songName: string; youtubeUrl: string; qrStatus: 'ACTIVE' | 'PENDING' | 'FAILED' };
  prebook: { enabled: boolean; discountPercent: number; count: number };
  catalogStatus: CatalogStatus; createdAt: string; updatedAt: string;
  coverUploadRef?: string; contentUploadRef?: string;
}

export interface Reader {
  id: string; name: string; age: number; gender: string; email: string; phone: string;
  profilePictureUrl?: string; createdAt: string; purchasedBooks: number;
  currentDevice?: string; changesUsed: number; changesRemaining: number; downloads: number;
}

export interface Transaction {
  id: string; type: 'BOOK_PURCHASE' | 'PREBOOK' | 'DEVICE_TRANSFER'; status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  readerName: string; bookTitle?: string; amount: Money; provider: 'GOOGLE_PLAY' | 'ALTERNATIVE'; createdAt: string;
}

export interface Feedback {
  id: string; bookId: string; bookTitle: string; readerId: string; readerName: string;
  readerAvatar?: string; text: string; createdAt: string; updatedAt: string;
}

export interface DashboardData {
  metrics: { totalBooks: number; publishedBooks: number; upcomingBooks: number; totalReaders: number; totalPurchases: number; totalRevenue: Money; deviceChanges: number; newFeedback: number };
  salesSeries: Array<{ label: string; revenueMinor: number }>;
  topBooks: Array<{ id: string; title: string; coverUrl: string; purchases: number; price: Money; revenue: Money }>;
  recentTransactions: Transaction[]; recentFeedback: Feedback[];
}

export interface AppSettings {
  version?: number;
  welcomeMessage: string; thankYouMessage: string; aboutApp: string;
  deviceChangeFee: Money; maximumDeviceChanges: number; defaultPrebookDiscount: number; latestDurationMonths: number;
}

export interface AuthorContent { version?: number; name: string; shortBio: string; fullBio: string; photoUrl: string; photoUploadRef?: string; socialLinks: Array<{ label: string; url: string }> }
export interface ContactContent { version?: number; instagramUsername: string; instagramUrl: string; youtubeName: string; youtubeUrl: string; officialEmail: string; supportEmail?: string }
export interface CursorPage<T> { items: T[]; nextCursor?: string | null; total?: number }
export interface ApiErrorBody { error: { code: string; message: string; requestId: string; details?: Record<string, unknown> } }

export const money = (value?: Money) => value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: value.currency, maximumFractionDigits: value.amountMinor % 100 ? 2 : 0 }).format(value.amountMinor / 100) : '—';
export const bookPrice = (value?: Money) => value?.amountMinor === 0 ? 'Free' : money(value);
export const monthYear = (month: number, year: number) => new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date(Date.UTC(year, month - 1, 1)));
