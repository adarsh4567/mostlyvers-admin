import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Download, Mail, Phone, Smartphone, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Book, CursorPage, Feedback, Reader, Transaction } from '../types';
import { money } from '../types';
import { Card, Empty, ErrorState, Loading, PageHeader, SearchBox, Status } from '../components/Ui';

export function ReadersPage() {
  const [search, setSearch] = useState(''); const query = useQuery({ queryKey: ['readers'], queryFn: () => adminApi.get<CursorPage<Reader>>('/admin/readers') });
  if (query.isPending) return <Loading label="Loading readers…" />; if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const items = query.data.items.filter(reader => `${reader.name} ${reader.email} ${reader.phone}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageHeader title="Readers" subtitle="Reader accounts, ownership and authorized device information." /><Card className="toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search name, email or phone…" /><span className="result-count">{items.length} readers</span></Card>{items.length ? <Card className="table-card"><div className="data-table readers-table"><div className="table-head"><span>Reader</span><span>Contact</span><span>Joined</span><span>Books</span><span>Device</span><span>Changes</span><span>Action</span></div>{items.map(reader => <div className="table-row" key={reader.id}><div className="reader-cell"><div className="avatar">{reader.name[0]}</div><div><strong>{reader.name}</strong><small>{reader.age} · {reader.gender}</small></div></div><span>{reader.email}<small>{reader.phone}</small></span><span>{new Date(reader.createdAt).toLocaleDateString('en-IN')}</span><b>{reader.purchasedBooks}</b><span>{reader.currentDevice || 'None'}</span><span>{reader.changesUsed} used · {reader.changesRemaining} left</span><Link className="btn btn-small btn-outline" to={`/readers/${reader.id}`}>VIEW</Link></div>)}</div></Card> : <Empty message="No matching readers." />}</>;
}

type ReaderDetail = Reader & { transactions: Transaction[]; feedback: Feedback[]; books: Book[] };
export function ReaderDetailPage() {
  const { readerId } = useParams(); const query = useQuery({ queryKey: ['reader', readerId], queryFn: () => adminApi.get<ReaderDetail>(`/admin/readers/${readerId}`) });
  if (query.isPending) return <Loading />; if (query.isError) return <ErrorState error={query.error} />; const reader = query.data;
  return <><PageHeader title={reader.name} subtitle="Reader details are read-only. Owner impersonation is not permitted." /><div className="detail-grid"><Card className="profile-summary"><div className="large-avatar">{reader.name[0]}</div><h2>{reader.name}</h2><p>{reader.age} years · {reader.gender}</p><dl><div><Mail/><dt>Email</dt><dd>{reader.email}</dd></div><div><Phone/><dt>Phone</dt><dd>{reader.phone}</dd></div><div><CalendarDays/><dt>Joined</dt><dd>{new Date(reader.createdAt).toLocaleDateString('en-IN')}</dd></div></dl></Card><div className="stack"><Card><h2>Device Access</h2><div className="device-summary"><Smartphone/><div><strong>{reader.currentDevice || 'No authorized device'}</strong><span>{reader.changesUsed} changes used · {reader.changesRemaining} remaining</span></div></div></Card><Card><h2>Account Summary</h2><div className="mini-metrics"><div><BookIcon/><b>{reader.purchasedBooks}</b><span>Purchased books</span></div><div><Download/><b>{reader.downloads}</b><span>Downloads</span></div><div><UserRound/><b>{reader.feedback.length}</b><span>Feedback</span></div></div></Card></div></div>
    <Card><h2>Purchased Books</h2><div className="book-strip">{reader.books.map(book => <Link to={`/books/${book.id}`} key={book.id}><img src={book.coverUrl}/><span>{book.title}</span></Link>)}</div></Card><Card><h2>Payment History</h2><div className="simple-list">{reader.transactions.map(item => <div key={item.id}><div><strong>{item.bookTitle || 'Device Change'}</strong><span>{new Date(item.createdAt).toLocaleString('en-IN')}</span></div><b>{money(item.amount)}</b><Status value={item.status}/></div>)}</div></Card>
  </>;
}
function BookIcon() { return <span className="book-glyph">▣</span>; }
