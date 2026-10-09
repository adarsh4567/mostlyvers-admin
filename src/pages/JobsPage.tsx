import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '../api/client';
import { Card, Empty, ErrorState, Loading, PageHeader, Status } from '../components/Ui';
import type { CursorPage } from '../types';

type Job = { id: string; kind: string; status: string; attempts: number; maxAttempts: number; lastError?: string; createdAt: string };

export default function JobsPage() {
	const jobs = useQuery({ queryKey: ['jobs'], queryFn: () => adminApi.get<CursorPage<Job>>('/admin/jobs'), refetchInterval: query => query.state.data?.items.some(item => item.status === 'PENDING' || item.status === 'RUNNING') ? 3_000 : false });
	return <><PageHeader title="Background Jobs" subtitle="EPUB processing, cleanup and account-deletion work from the durable queue." action={<button className="btn btn-outline" onClick={() => jobs.refetch()}><RefreshCw size={16}/> REFRESH</button>}/>{jobs.isPending ? <Loading label="Loading jobs…"/> : jobs.isError ? <ErrorState error={jobs.error} retry={() => jobs.refetch()}/> : jobs.data.items.length === 0 ? <Empty message="No background jobs yet."/> : <Card className="table-card"><div className="data-table jobs-table"><div className="table-head"><span>Job</span><span>Type</span><span>Status</span><span>Attempts</span><span>Created</span><span>Error</span></div>{jobs.data.items.map(job => <div className="table-row" key={job.id}><code>{job.id.slice(0,8)}</code><strong>{job.kind}</strong><Status value={job.status}/><span>{job.attempts}/{job.maxAttempts}</span><span>{new Date(job.createdAt).toLocaleString()}</span><small>{job.lastError || '—'}</small></div>)}</div></Card>}</>;
}
