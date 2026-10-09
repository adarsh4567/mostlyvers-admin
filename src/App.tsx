import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppShell } from './components/AppShell';
const LoginPage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.LoginPage })));
const PasswordResetPage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.PasswordResetPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const BooksPage = lazy(() => import('./pages/BooksPages').then(module => ({ default: module.BooksPage })));
const BookEditorPage = lazy(() => import('./pages/BooksPages').then(module => ({ default: module.BookEditorPage })));
const ReadersPage = lazy(() => import('./pages/ReadersPages').then(module => ({ default: module.ReadersPage })));
const ReaderDetailPage = lazy(() => import('./pages/ReadersPages').then(module => ({ default: module.ReaderDetailPage })));
const SalesPage = lazy(() => import('./pages/SalesPage').then(module => ({ default: module.SalesPage })));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage').then(module => ({ default: module.FeedbackPage })));
const SongsPage = lazy(() => import('./pages/SongsPage').then(module => ({ default: module.SongsPage })));
const ContentPage = lazy(() => import('./pages/SettingsPages').then(module => ({ default: module.ContentPage })));
const OwnerProfilePage = lazy(() => import('./pages/SettingsPages').then(module => ({ default: module.OwnerProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPages').then(module => ({ default: module.SettingsPage })));
const PaymentSettingsPage = lazy(() => import('./pages/SettingsPages').then(module => ({ default: module.PaymentSettingsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));

function Protected() {
  const { session, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="brand-spinner">M</div><p>Opening the owner dashboard…</p></div>;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return <BrowserRouter><Suspense fallback={<div className="app-loading"><div className="brand-spinner">M</div><p>Loading…</p></div>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<PasswordResetPage />} />
    <Route element={<Protected />}><Route element={<AppShell />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/new" element={<BookEditorPage />} />
      <Route path="/books/:bookId" element={<BookEditorPage />} />
      <Route path="/upcoming" element={<BooksPage status="UPCOMING" title="Upcoming Books" />} />
      <Route path="/latest" element={<BooksPage status="PUBLISHED" title="Latest Releases" latest />} />
      <Route path="/readers" element={<ReadersPage />} />
      <Route path="/readers/:readerId" element={<ReaderDetailPage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/songs-qr" element={<SongsPage />} />
      <Route path="/author" element={<ContentPage kind="author" />} />
      <Route path="/contact" element={<ContentPage kind="contact" />} />
      <Route path="/owner-profile" element={<OwnerProfilePage />} />
      <Route path="/payment-settings" element={<PaymentSettingsPage />} />
      <Route path="/app-settings" element={<SettingsPage />} />
	  <Route path="/notifications" element={<NotificationsPage />} />
	  <Route path="/jobs" element={<JobsPage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Suspense></BrowserRouter>;
}
