import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Send } from 'lucide-react';
import { adminApi } from '../api/client';
import { Card, Empty, ErrorState, Loading, PageHeader } from '../components/Ui';
import type { CursorPage } from '../types';

type NotificationRecord = { title: string; body: string; createdAt: string; recipientCount: number };

export default function NotificationsPage() {
	const client = useQueryClient();
	const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [message, setMessage] = useState('');
	const records = useQuery({ queryKey: ['notifications'], queryFn: () => adminApi.get<CursorPage<NotificationRecord>>('/admin/notifications') });
	const send = useMutation({ mutationFn: () => adminApi.post<{ recipientCount: number }>('/admin/notifications', { title, body, data: {} }), onSuccess: result => { setMessage(`Sent to ${result.recipientCount} reader${result.recipientCount === 1 ? '' : 's'}.`); setTitle(''); setBody(''); client.invalidateQueries({ queryKey: ['notifications'] }); } });
	return <><PageHeader title="Notifications" subtitle="Send a real in-app and push notification to active readers." />
		<div className="settings-grid"><Card><h2><Bell size={18}/> New notification</h2><label className="field"><span>Title</span><input maxLength={120} value={title} onChange={event => setTitle(event.target.value)} /></label><label className="field"><span>Message</span><textarea rows={5} maxLength={500} value={body} onChange={event => setBody(event.target.value)} /></label><button className="btn btn-primary" disabled={!title.trim() || !body.trim() || send.isPending} onClick={() => send.mutate()}><Send size={16}/>{send.isPending ? 'SENDING…' : 'SEND TO ALL READERS'}</button>{message && <p>{message}</p>}{send.isError && <div className="toast-error">{send.error.message}</div>}</Card>
		<Card><h2>Recent notifications</h2>{records.isPending ? <Loading label="Loading notifications…"/> : records.isError ? <ErrorState error={records.error}/> : records.data.items.length === 0 ? <Empty message="No notifications sent yet."/> : <div className="notification-list">{records.data.items.map((item, index) => <article key={`${item.createdAt}-${index}`}><strong>{item.title}</strong><p>{item.body}</p><small>{new Date(item.createdAt).toLocaleString()} · {item.recipientCount} recipients</small></article>)}</div>}</Card></div>
	</>;
}
