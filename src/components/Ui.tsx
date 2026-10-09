import type { ReactNode } from 'react';
import { AlertCircle, Inbox, LoaderCircle, Search } from 'lucide-react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-header"><div><h1>{title}<span className="gold-star" aria-hidden="true">✦</span></h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section>; }
export function Status({ value }: { value: string }) { return <span className={`status status-${value.toLowerCase().replaceAll('_', '-')}`}>{value.replaceAll('_', ' ')}</span>; }
export function Loading({ label = 'Loading…' }: { label?: string }) { return <div className="state"><LoaderCircle className="spin" /><p>{label}</p></div>; }
export function Empty({ message }: { message: string }) { return <div className="state"><Inbox /><p>{message}</p></div>; }
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) { return <div className="state error-state"><AlertCircle /><p>{error instanceof Error ? error.message : 'Something went wrong.'}</p>{retry && <button className="btn btn-outline" onClick={retry}>TRY AGAIN</button>}</div>; }
export function SearchBox({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="search-box"><Search size={18} /><input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></div>{children}</div></div>; }
