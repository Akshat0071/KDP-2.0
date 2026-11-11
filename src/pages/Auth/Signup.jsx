import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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
  crit:      '#D83040',
  critBg:    '#FEF0F2',
  critBorder:'#F5B8C0',
};

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Local Buyer',
    site: 'Austin Local — Site 04',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please provide your first and last name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid work email.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = signup(formData);
      setIsLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Failed to create account.');
      }
    }, 450);
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
        maxWidth: 480,
        background: '#FFFFFF',
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        boxShadow: '0 12px 36px rgba(48,39,43,0.1), 0 2px 6px rgba(48,39,43,0.04)',
        padding: '32px 30px',
        animation: 'fadeInMenu 0.18s ease-out',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
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
            Register Procurement Account
          </h1>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 3 }}>
            KDP GreenSource · Enterprise Onboarding
          </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                First Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  placeholder="Maya"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                placeholder="Torres"
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
          </div>

          {/* Work Email */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
              Enterprise Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="maya.torres@kdpgreensource.com"
                required
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
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
          </div>

          {/* Role & Site */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Procurement Role
              </label>
              <select
                value={formData.role}
                onChange={e => handleChange('role', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  fontSize: 11.5,
                  color: C.text,
                  background: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Local Buyer">Local Buyer</option>
                <option value="Senior Sourcing Specialist">Senior Sourcing Specialist</option>
                <option value="Central Warehouse Buyer">Central Warehouse Buyer</option>
                <option value="Procurement Operations">Procurement Operations</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Primary Site Facility
              </label>
              <select
                value={formData.site}
                onChange={e => handleChange('site', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  fontSize: 11.5,
                  color: C.text,
                  background: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Austin Local — Site 04">Austin Local — Site 04</option>
                <option value="Dallas Local — Site 02">Dallas Local — Site 02</option>
                <option value="Portland Local — Site 01">Portland Local — Site 01</option>
                <option value="Chicago Local — Site 05">Chicago Local — Site 05</option>
              </select>
            </div>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                Password (min 6)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="••••••••"
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
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 8,
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
            {isLoading ? 'Creating Account…' : 'Register & Enter Workspace'}
            {!isLoading && <ArrowRight size={13} />}
          </button>
        </form>

        {/* Existing account link */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${C.divider}`,
          fontSize: 11.5,
          color: C.muted,
        }}>
          Already have an enterprise account?{' '}
          <Link
            to="/login"
            style={{ color: C.rose, fontWeight: 700, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>

        {/* Security badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 16,
          fontSize: 10,
          color: C.subtle,
        }}>
          <ShieldCheck size={12} color={C.success} />
          <span>Keurig Dr Pepper Enterprise Single Sign-On Verified</span>
        </div>
      </div>
    </div>
  );
}
