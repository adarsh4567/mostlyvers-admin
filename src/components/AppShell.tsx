import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, BookOpen, ChevronDown, CircleDollarSign, Contact, Gauge, Library, ListTodo, LogOut, Menu, MessageSquareText, Music2, PenTool, Settings, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/mostlyvers-logo.png';
import { Modal } from './Ui';

const links = [
  ['Dashboard', '/dashboard', Gauge], ['Books', '/books', BookOpen], ['Upcoming', '/upcoming', Sparkles], ['Latest', '/latest', Library],
  ['Readers', '/readers', Users], ['Sales', '/sales', CircleDollarSign], ['Feedback', '/feedback', MessageSquareText], ['Songs & QR', '/songs-qr', Music2],
	['About Author', '/author', PenTool], ['Contact', '/contact', Contact], ['Owner Profile', '/owner-profile', Users], ['Payment Settings', '/payment-settings', SlidersHorizontal], ['App Settings', '/app-settings', Settings], ['Notifications', '/notifications', Bell], ['Background Jobs', '/jobs', ListTodo],
] as const;

export function AppShell() {
  const [open, setOpen] = useState(false); const [logoutOpen, setLogoutOpen] = useState(false);
  const { session, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const title = links.find(([, path]) => location.pathname.startsWith(path))?.[0] || 'Dashboard';
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button><div className="side-brand"><img src={logo} /><div><strong>MOSTLYVERS</strong><small>OWNER DASHBOARD</small></div></div><nav>{links.map(([label, path, Icon]) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{label}</span></NavLink>)}</nav><button className="logout-link" onClick={() => setLogoutOpen(true)}><LogOut size={18} />Log Out</button></aside>
    {open && <button className="nav-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <div className="main-area"><header className="top-header"><button className="icon-btn menu-toggle" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button><div className="header-wordmark"><img src={logo} /><span>MOSTLYVERS</span></div><div className="header-actions"><button className="icon-btn notification" aria-label="Notifications" onClick={() => navigate('/notifications')}><Bell size={20} /></button><button className="owner-chip" onClick={() => navigate('/owner-profile')}><img src={session?.owner.profilePictureUrl || logo} /><span><strong>{session?.owner.name}</strong><small>Owner</small></span><ChevronDown size={14} /></button></div></header><main><div className="crumb"><BarChart3 size={15} /> {title}</div><Outlet /></main></div>
    {logoutOpen && <Modal title="Log out of MOSTLYVERS?" onClose={() => setLogoutOpen(false)}><div className="logout-confirm"><div className="logout-symbol"><LogOut /></div><p>You will need to sign in again to access the owner dashboard.</p><div className="dialog-actions"><button className="btn btn-outline" onClick={() => setLogoutOpen(false)}>CANCEL</button><button className="btn btn-danger" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>LOG OUT</button></div></div></Modal>}
  </div>;
}
