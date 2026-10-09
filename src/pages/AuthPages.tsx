import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, HelpCircle, LockKeyhole, Mail } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { adminApi } from '../api/client';
import logo from '../assets/mostlyvers-logo.png';

const loginSchema = z.object({ email: z.email('Enter a valid owner email'), password: z.string().min(1, 'Enter your password'), rememberMe: z.boolean() });
type LoginFields = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { session, login } = useAuth(); const navigate = useNavigate(); const [show, setShow] = useState(false); const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', rememberMe: false } });
  if (session) return <Navigate to="/dashboard" replace />;
  const submit = handleSubmit(async fields => { try { setServerError(''); await login(fields.email, fields.password, fields.rememberMe); navigate('/dashboard', { replace: true }); } catch (error) { setServerError(error instanceof Error ? error.message : 'Login failed.'); } });
  return <div className="login-page"><div className="login-art"><div className="botanical botanical-left">⌇❧⌇</div><div className="botanical botanical-right">⌇❧⌇</div><div className="login-brand"><img src={logo} alt="MOSTLYVERS" /><h1>MOSTLYVERS</h1><div className="owner-rule"><span />OWNER LOGIN<span /></div><p>Welcome back, Owner.<br />Access your dashboard and manage your stories.</p></div><div className="book-stack"><span /><span /><span /></div></div>
    <div className="login-side"><div className="login-card"><div className="mobile-brand"><img src={logo} /><h1>MOSTLYVERS</h1></div><h2>OWNER LOGIN</h2><p className="login-intro">Secure access to your books, readers and business.</p><form onSubmit={submit}>
      <label className="field"><span>Owner Email</span><div className="input-with-icon"><Mail size={18} /><input {...register('email')} type="email" autoComplete="username" placeholder="Owner Email" /></div>{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
      <label className="field"><span>Password</span><div className="input-with-icon"><LockKeyhole size={18} /><input {...register('password')} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Password" /><button type="button" className="password-toggle" onClick={() => setShow(value => !value)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small className="field-error">{errors.password.message}</small>}</label>
      <div className="form-split"><label className="check"><input {...register('rememberMe')} type="checkbox" />Remember me</label><Link to="/forgot-password">Forgot Password?</Link></div>{serverError && <div className="form-error">{serverError}</div>}<button className="btn btn-primary btn-block" disabled={isSubmitting}>{isSubmitting ? 'SIGNING IN…' : 'LOGIN'}</button>
    </form><div className="secure-note"><LockKeyhole size={15} />Secure Owner Access Only</div></div><footer><HelpCircle size={15} />Need help? Contact <b>hello@mostlyvers.com</b></footer></div>
  </div>;
}

export function PasswordResetPage() {
	const [params] = useSearchParams(); const token = params.get('token');
	const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('');
	const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { if (token) { if (password !== confirm) throw new Error('Passwords do not match.'); await adminApi.post('/admin/auth/password-reset/confirm', { token, password }); setMessage('Password updated. You can now return to owner login.'); } else { await adminApi.post('/admin/auth/password-reset/request', { email }); setMessage('If an owner account exists, reset instructions have been sent.'); } } catch (value) { setError(value instanceof Error ? value.message : 'The request failed.'); } };
	return <div className="simple-auth"><div className="login-card"><img className="reset-logo" src={logo} /><h2>Reset Owner Password</h2><p>{token ? 'Choose a new secure password.' : 'Enter the verified owner email address.'}</p><form onSubmit={submit}>{token ? <><label className="field"><span>New Password</span><div className="input-with-icon"><LockKeyhole size={18}/><input type="password" required minLength={10} value={password} onChange={event => setPassword(event.target.value)}/></div></label><label className="field"><span>Confirm Password</span><div className="input-with-icon"><LockKeyhole size={18}/><input type="password" required minLength={10} value={confirm} onChange={event => setConfirm(event.target.value)}/></div></label></> : <label className="field"><span>Owner Email</span><div className="input-with-icon"><Mail size={18} /><input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></div></label>}{error && <div className="form-error">{error}</div>}{message && <div className="success-box">{message}</div>}<button className="btn btn-primary btn-block">{token ? 'UPDATE PASSWORD' : 'SEND RESET LINK'}</button></form><Link className="back-link" to="/login">← Back to owner login</Link></div></div>;
}
