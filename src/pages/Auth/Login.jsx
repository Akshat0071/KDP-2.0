import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const C = {
  text:      '#30272B',
  plum:      '#5C3A57',
  muted:     '#746970',
  subtle:    '#9CA3AF',
  border:    '#E6DCE2',
  divider:   '#F0EAEE',
  hover:     '#FDFBFC',
  rose:      '#D83F79',
  roseHover: '#C4366B',
  roseSoft:  '#FAF2F6',
  roseBorder:'#F0D0DF',
  success:   '#1E8A3C',
  crit:      '#D83040',
  critBg:    '#FEF0F2',
  critBorder:'#F5B8C0',
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }, 400);
  };

  const handleDemoLogin = () => {
    setEmail('maya.torres@kdpgreensource.com');
    setPassword('AustinRoast2026!');
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      login('maya.torres@kdpgreensource.com', 'AustinRoast2026!');
      setIsLoading(false);
      navigate('/');
    }, 350);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FAF4F8 0%, #F5EEF3 50%, #EDE4EB 100%)',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#FFFFFF',
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        boxShadow: '0 12px 36px rgba(48,39,43,0.1), 0 2px 6px rgba(48,39,43,0.04)',
        padding: '32px 28px',
        animation: 'fadeInMenu 0.18s ease-out',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 10,
            background: C.plum,
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 12,
            boxShadow: '0 4px 12px rgba(92,58,87,0.25)',
          }}>
            K
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
            KDP GreenSource
          </h1>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 3 }}>
            Enterprise Inventory · Austin Local Site 04
          </div>
        </div>

        {/* Demo One-Click Access Banner */}
        <div style={{
          background: C.roseSoft,
          border: `1px solid ${C.roseBorder}`,
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.plum }}>Demo Quick Sign-In</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>Maya Torres · Local Buyer</div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            style={{
              padding: '5px 11px',
              borderRadius: 6,
              border: 'none',
              background: C.rose,
              color: '#FFFFFF',
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.roseHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.rose; }}
          >
            Instant Login
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: C.critBg,
            border: `1px solid ${C.critBorder}`,
            color: C.crit,
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11.5,
            fontWeight: 500,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Work Email */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@kdpgreensource.com"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                  color: C.text,
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.rose; e.target.style.boxShadow = '0 0 0 3px rgba(216,63,121,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: 10.5, fontWeight: 600, color: C.rose, textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your enterprise password"
                required
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 34px',
                  borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                  color: C.text,
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.rose; e.target.style.boxShadow = '0 0 0 3px rgba(216,63,121,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '2px 0' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: C.rose }}
            />
            <label htmlFor="remember" style={{ fontSize: 11, color: C.muted, cursor: 'pointer' }}>
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 4,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: C.rose,
              color: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(216,63,121,0.28)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = C.roseHover; }}
            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = C.rose; }}
          >
            {isLoading ? 'Signing In…' : 'Sign In to Workspace'}
            {!isLoading && <ArrowRight size={13} />}
          </button>
        </form>

        {/* Sign up prompt */}
        <div style={{
          textAlign: 'center',
          marginTop: 22,
          paddingTop: 16,
          borderTop: `1px solid ${C.divider}`,
          fontSize: 11.5,
          color: C.muted,
        }}>
          New procurement buyer?{' '}
          <Link
            to="/signup"
            style={{ color: C.rose, fontWeight: 700, textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </div>

        {/* SSO Footer info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 18,
          fontSize: 10,
          color: C.subtle,
        }}>
          <ShieldCheck size={12} color={C.success} />
          <span>Secured with Okta SSO & 256-bit TLS encryption</span>
        </div>
      </div>
    </div>
  );
}

