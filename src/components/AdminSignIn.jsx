import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import BrandMark from './BrandMark.jsx';
import './adminSignIn.css';

export default function AdminSignIn({ checking = false, password = '', onPasswordChange, onSubmit, busy = false, error = '' }) {
  const [showPassword, setShowPassword] = useState(false);
  const disabled = checking || busy;
  return <div className="admin-signin-shell">
    <section className="admin-signin-panel" aria-labelledby="admin-signin-title" aria-busy={disabled}>
      <header className="admin-signin-nav">
        <Link to="/" className="site-brand admin-signin-brand"><BrandMark />SchedSnap</Link>
        <Link to="/" className="admin-signin-back"><ArrowLeft size={16} aria-hidden="true" />Back to website</Link>
      </header>
      <div className="admin-signin-form">
        <h1 id="admin-signin-title">Admin sign in</h1>
        <p>Manage your designs and see how they’re doing.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="admin-password">Password</label>
          <div className="admin-signin-password">
            <input id="admin-password" className="field-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => onPasswordChange?.(event.target.value)} required maxLength={256} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? 'admin-signin-error' : undefined} />
            <button type="button" className="admin-signin-reveal" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} disabled={disabled} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
          </div>
          {error && <p id="admin-signin-error" className="admin-signin-error" role="alert">{error}</p>}
          <button type="submit" className="button-primary" disabled={disabled || !password}>{disabled && <LoaderCircle size={17} className="motion-safe:animate-spin" aria-hidden="true" />}{checking ? 'Checking session…' : busy ? 'Signing in…' : 'Sign in'}</button>
          {checking && <span className="sr-only" role="status">Checking your admin session.</span>}
        </form>
      </div>
    </section>
    <aside className="admin-signin-art" aria-hidden="true">
      <img src="/images/hero/hero-phones.webp" alt="" width="1448" height="1086" />
      <div><h2>A home for your designs.</h2><p>Create, preview, and publish in one place.</p></div>
    </aside>
  </div>;
}
