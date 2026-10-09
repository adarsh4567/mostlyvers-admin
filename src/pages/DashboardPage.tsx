import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, CircleDollarSign, MessageSquareText, Phone, ShoppingBag, Sparkles, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { DashboardData } from '../types';
import { money } from '../types';
import { Card, ErrorState, Loading, PageHeader } from '../components/Ui';
import { useAuth } from '../auth/AuthContext';

const metricIcons = [BookOpen, Sparkles, Users, ShoppingBag, CircleDollarSign, Phone, MessageSquareText, Trophy];
export function DashboardPage() {
  const { session } = useAuth();
  const query = useQuery({ queryKey: ['dashboard'], queryFn: () => adminApi.get<DashboardData>('/admin/dashboard') });
  if (query.isPending) return <Loading label="Preparing your dashboard…" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const { metrics, salesSeries, topBooks, recentTransactions, recentFeedback } = query.data;
  const metricData = [
    ['Total Books', metrics.totalBooks], ['Published Books', metrics.publishedBooks], ['Upcoming Books', metrics.upcomingBooks], ['Total Readers', metrics.totalReaders],
    ['Total Purchases', metrics.totalPurchases.toLocaleString('en-IN')], ['Total Revenue', money(metrics.totalRevenue)], ['Device Changes', metrics.deviceChanges], ['New Feedback', metrics.newFeedback],
  ];
  return <><PageHeader title={`Welcome back, ${session?.owner.name || 'Owner'}`} subtitle="Here’s what’s happening with MOSTLYVERS today." action={<div className="quick-actions"><Link className="btn btn-outline" to="/sales">VIEW SALES</Link><Link className="btn btn-primary" to="/books/new">+ ADD BOOK</Link></div>} />
    <div className="metrics-grid">{metricData.map(([label, value], index) => { const Icon = metricIcons[index]; return <Card className="metric-card" key={label}><div className={`metric-icon metric-${index}`}><Icon /></div><div><strong>{value}</strong><span>{label}</span></div></Card>; })}</div>
    <div className="dashboard-grid"><Card className="sales-chart"><div className="card-heading"><div><h2>Sales Overview</h2><strong>{money(metrics.totalRevenue)}</strong><span>Total Revenue</span></div><select aria-label="Sales period"><option>This Month</option><option>Last 3 Months</option></select></div><ResponsiveContainer width="100%" height={250}><AreaChart data={salesSeries}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b88a52" stopOpacity={0.35}/><stop offset="100%" stopColor="#b88a52" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eee4d9" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickFormatter={value => `₹${Math.round(value / 100000)}k`} tickLine={false} axisLine={false}/><Tooltip formatter={value => `₹${Number(value).toLocaleString('en-IN')}`} /><Area type="monotone" dataKey="revenueMinor" stroke="#8f642d" strokeWidth={2.5} fill="url(#salesFill)" /></AreaChart></ResponsiveContainer></Card>
      <Card><div className="card-title-row"><h2>Top Selling Books</h2><Link to="/sales">View All ›</Link></div><div className="rank-list">{topBooks.map((book, index) => <Link to={`/books/${book.id}`} className="rank-item" key={book.id}><b>{index + 1}</b><img src={book.coverUrl}/><div><strong>{book.title}</strong><span>{book.purchases} purchases</span></div><em>{money(book.revenue)}</em></Link>)}</div></Card>
    </div>
    <div className="dashboard-grid bottom-grid"><Card><div className="card-title-row"><h2>Recent Purchases</h2><Link to="/sales">View All ›</Link></div>{recentTransactions.map(transaction => <div className="compact-row" key={transaction.id}><div className="row-icon"><ShoppingBag /></div><div><strong>{transaction.bookTitle || 'Device Change'}</strong><span>by {transaction.readerName}</span></div><em>{money(transaction.amount)}</em></div>)}</Card><Card><div className="card-title-row"><h2>Recent Feedback</h2><Link to="/feedback">View All ›</Link></div>{recentFeedback.map(item => <Link to="/feedback" className="feedback-row" key={item.id}><div className="avatar">{item.readerName[0]}</div><div><strong>{item.bookTitle}</strong><span>{item.text}</span><small>By {item.readerName}</small></div></Link>)}</Card></div>
  </>;
}
