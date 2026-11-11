import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const C = {
  text:      '#30272B',
  plum:      '#5C3A57',
  muted:     '#746970',
  subtle:    '#9CA3AF',
  border:    '#E6DCE2',
  divider:   '#F0EAEE',
  rose:      '#D83F79',
  roseHover: '#C4366B',
  roseSoft:  '#FAF2F6',
  roseBorder:'#F0D0DF',
  success:   '#1E8A3C',
  successBg: '#EDF7F1',
  successBorder: '#B4DDBD',
  crit:      '#D83040',
  critBg:    '#FEF0F2',
  critBorder:'#F5B8C0',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendLink = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your enterprise email.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      forgotPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 400);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      resetPassword(newPassword);
      setIsLoading(false);
      setResetSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    }, 400);
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
        {/* Back Link */}
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: C.rose,
            textDecoration: 'none',
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={12} /> Back to Sign In
        </Link>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
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
            marginBottom: 10,
            boxShadow: '0 4px 12px rgba(92,58,87,0.25)',
          }}>
            K
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
            Password Recovery
          </h1>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 3 }}>
            KDP GreenSource · Account Security
          </div>
        </div>

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

        {!isSubmitted ? (
          /* Step 1: Request Reset Link */
          <form onSubmit={handleSendLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 4px', lineHeight: 1.45 }}>
              Enter the work email address linked to your buyer profile. We'll generate a secure verification token to reset your password.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Work Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="maya.torres@kdpgreensource.com"
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

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 6,
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
              {isLoading ? 'Sending Token…' : 'Send Recovery Token'}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </form>
        ) : (
          /* Step 2: Instant Simulated Reset Form */
          <div>
            {resetSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: '20px 14px',
                background: C.successBg,
                border: `1px solid ${C.successBorder}`,
                borderRadius: 10,
                animation: 'fadeInMenu 0.15s ease-out',
              }}>
                <CheckCircle2 size={36} color={C.success} style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>
                  Password Reset Complete!
                </h3>
                <p style={{ fontSize: 11.5, color: C.muted, margin: 0 }}>
                  Redirecting you to the enterprise login screen in a moment…
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: C.successBg,
                  border: `1px solid ${C.successBorder}`,
                  fontSize: 11,
                  color: C.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                  <span>Recovery token generated for <strong>{email}</strong></span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                    New Enterprise Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 28px 8px 30px',
                        borderRadius: 7,
                        border: `1px solid ${C.border}`,
                        fontSize: 11.5,
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
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: C.muted,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 7,
                      border: `1px solid ${C.border}`,
                      fontSize: 11.5,
                      color: C.text,
                      background: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = C.rose; e.target.style.boxShadow = '0 0 0 3px rgba(216,63,121,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: 6,
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
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = C.roseHover; }}
                  onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = C.rose; }}
                >
                  {isLoading ? 'Updating Password…' : 'Set New Password'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

