import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LockKeyhole, MessageSquareText } from 'lucide-react';
import { adminApi } from '../api/client';
import type { CursorPage, Feedback } from '../types';
import { Card, Empty, ErrorState, Loading, Modal, PageHeader, SearchBox } from '../components/Ui';

export function FeedbackPage() {
  const [search, setSearch] = useState(''); const [selected, setSelected] = useState<Feedback | null>(null); const query = useQuery({ queryKey: ['feedback'], queryFn: () => adminApi.get<CursorPage<Feedback>>('/admin/feedback') });
  if (query.isPending) return <Loading />; if (query.isError) return <ErrorState error={query.error} />; const items = query.data.items.filter(item => `${item.bookTitle} ${item.readerName} ${item.text}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageHeader title="Private Feedback" subtitle="Only the submitting reader and owner can access these messages." /><Card className="privacy-banner"><LockKeyhole/><div><strong>Feedback is private</strong><span>There is no public publishing action. Creation and edit dates remain preserved.</span></div></Card><Card className="toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Filter by book, reader or feedback…" /></Card>{items.length ? <div className="feedback-grid">{items.map(item => <Card className="feedback-card" key={item.id}><div className="feedback-head"><div className="avatar">{item.readerName[0]}</div><div><strong>{item.bookTitle}</strong><span>By {item.readerName}</span></div><MessageSquareText/></div><blockquote>{item.text}</blockquote><footer><span>Created {new Date(item.createdAt).toLocaleString('en-IN')}</span>{item.updatedAt !== item.createdAt && <span>Edited {new Date(item.updatedAt).toLocaleString('en-IN')}</span>}<button className="btn btn-small btn-outline" onClick={() => setSelected(item)}>VIEW</button></footer></Card>)}</div> : <Empty message="No private feedback found." />}{selected && <Modal title={selected.bookTitle} onClose={() => setSelected(null)}><div className="feedback-detail"><p>{selected.text}</p><dl><div><dt>Reader</dt><dd>{selected.readerName}</dd></div><div><dt>Created</dt><dd>{new Date(selected.createdAt).toLocaleString('en-IN')}</dd></div><div><dt>Updated</dt><dd>{new Date(selected.updatedAt).toLocaleString('en-IN')}</dd></div></dl></div></Modal>}</>;
}
