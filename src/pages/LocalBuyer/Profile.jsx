import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Shield, Bell, Check,
  Building2, KeyRound, Sliders, Award, Clock, Save, Lock, LogOut
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
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
  success:   '#1E8A3C',
  successBg: '#EDF7F1',
  successBorder: '#B4DDBD',
  warn:      '#B86A00',
  warnBg:    '#FFF7E6',
  warnBorder:'#F5D68A',
  sched:     '#6B46C1',
  schedBg:   '#FAF5FF',
  schedBorder:'#E9D8FD',
};

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 34,
        height: 19,
        borderRadius: 20,
        border: 'none',
        padding: 2,
        background: checked ? C.rose : '#D8CED4',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        transition: 'background 0.16s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(48,39,43,0.25)',
        }}
      />
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || 'Maya',
    lastName: user?.lastName || 'Torres',
    email: user?.email || 'maya.torres@kdpgreensource.com',
    phone: '+1 (512) 555-0148',
    title: user?.title || 'Local Buyer',
    department: 'Green Coffee Procurement',
    primarySite: user?.siteId || '1054',
    timezone: 'cst',
  });

  const [prefs, setPrefs] = useState({
    alternateSignoff: true,
    autoReserveExact: true,
    minThresholdAlert: true,
    prioritizeDelayed: true,
    bellCritical: true,
    dailyDigest: true,
    smsEscalation: false,
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const inputStyle = {
    width: '100%',
    padding: '7px 10px',
    fontSize: 11.5,
    color: C.text,
    background: '#FFFFFF',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    color: C.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1320, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 3px', letterSpacing: '-0.3px' }}>
            Profile & Account Settings
          </h1>
          <p style={{ fontSize: 11.5, color: C.muted, margin: 0 }}>
            Manage your buyer identity, assigned site permissions, sourcing rules, and notification preferences.
          </p>
        </div>

        {savedNotice && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            background: C.successBg,
            color: C.success,
            border: `1px solid ${C.successBorder}`,
            fontSize: 11,
            fontWeight: 600,
          }}>
            <Check size={13} strokeWidth={2.5} />
            Profile settings saved
          </div>
        )}
      </div>

      {/* ── Two-Column Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px minmax(0, 1fr)',
        gap: 14,
        alignItems: 'start',
      }}>

        {/* ── LEFT COLUMN: Identity, Site Authority & Snapshot ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Identity Card */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
            overflow: 'hidden',
          }}>
            {/* Subtle top plum banner */}
            <div style={{
              height: 54,
              background: 'linear-gradient(135deg, #3B2834 0%, #5C3A57 65%, #D83F79 140%)',
            }} />

            <div style={{ padding: '0 16px 16px', marginTop: -28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: C.rose,
                  color: '#FFFFFF',
                  border: '3px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 19,
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(48,39,43,0.16)',
                }}>
                  {form.firstName[0]}{form.lastName[0]}
                </div>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: C.successBg,
                  color: C.success,
                  border: `1px solid ${C.successBorder}`,
                  fontSize: 9.5,
                  fontWeight: 700,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />
                  Active Buyer
                </span>
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                {form.firstName} {form.lastName}
              </div>
              <div style={{ fontSize: 11, color: C.rose, fontWeight: 600, marginTop: 1 }}>
                {form.title} · {form.department}
              </div>

              <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${C.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                fontSize: 11,
                color: C.muted,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={12} style={{ color: C.subtle, flexShrink: 0 }} />
                  <span style={{ color: C.text, overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={12} style={{ color: C.subtle, flexShrink: 0 }} />
                  <span>{form.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={12} style={{ color: C.rose, flexShrink: 0 }} />
                  <span style={{ color: C.text, fontWeight: 600 }}>Site 1054 — Plano Roasting</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={12} style={{ color: C.subtle, flexShrink: 0 }} />
                  <span>Employee ID: <strong style={{ color: C.text }}>EMP-4092</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Site Permissions & Authority */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.text }}>
              <Building2 size={13} style={{ color: C.rose }} />
              <span>Facility Access & Limits</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 10.5 }}>
              <div style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: C.roseSoft,
                border: '1px solid #F3DCE7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.text }}>Site 1054 — Plano Roasting</div>
                  <div style={{ fontSize: 9.5, color: C.muted }}>Primary roasting facility (Assigned Hub: Warehouse 1055 · $589 fixed freight)</div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 12,
                  background: '#FFFFFF', color: C.rose, border: '1px solid #F3DCE7',
                }}>
                  Full Sign-off
                </span>
              </div>

              <div style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: '#FAF8F9',
                border: `1px solid ${C.divider}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.text }}>Warehouse 1055 — Central Hub</div>
                  <div style={{ fontSize: 9.5, color: C.muted }}>Designated lowest-freight supply hub</div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                  background: '#FFFFFF', color: C.muted, border: `1px solid ${C.border}`,
                }}>
                  Transfer Request
                </span>
              </div>

              <div style={{
                paddingTop: 6,
                borderTop: `1px solid ${C.divider}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: C.muted }}>PO Sign-off Authority</span>
                <strong style={{ color: C.text }}>Up to $25,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: C.muted }}>Alternate Substitution</span>
                <strong style={{ color: C.success }}>Approved</strong>
              </div>
            </div>
          </div>

          {/* 30-Day Performance Snapshot */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              <Clock size={13} style={{ color: C.plum }} />
              <span>30-Day Activity Summary</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center' }}>
              <div style={{ background: '#FAF8F9', border: `1px solid ${C.divider}`, borderRadius: 6, padding: '8px 4px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>42</div>
                <div style={{ fontSize: 9, color: C.muted }}>POs Reviewed</div>
              </div>
              <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 6, padding: '8px 4px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.success }}>92%</div>
                <div style={{ fontSize: 9, color: C.success }}>OTIF Rate</div>
              </div>
              <div style={{ background: C.schedBg, border: `1px solid ${C.schedBorder}`, borderRadius: 6, padding: '8px 4px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.sched }}>$6.4k</div>
                <div style={{ fontSize: 9, color: C.sched }}>Saved vs Plan</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Editable Settings & Preferences ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          {/* 1. Personal & Work Details Form */}
          <form
            onSubmit={handleSave}
            style={{
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
              padding: '16px 18px',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: `1px solid ${C.divider}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <User size={14} style={{ color: C.rose }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Personal & Work Details</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Used across purchase order approvals and warehouse transfers</div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: C.rose,
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(216,63,121,0.22)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.roseHover}
                onMouseLeave={e => e.currentTarget.style.background = C.rose}
              >
                <Save size={12} />
                Save Changes
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Work Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Role / Job Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Primary Assigned Site</label>
                <ThemedSelect
                  value={form.primarySite}
                  onChange={val => setForm(f => ({ ...f, primarySite: val }))}
                  options={[
                    { value: '1054', label: 'Site 1054 — Plano Roasting (Primary · Hub 1055)' },
                    { value: '1003', label: 'Site 1003 — Houston Roasting (Hub 1020)' },
                    { value: '1004', label: 'Site 1004 — Dallas Roasting (Hub 1055)' },
                    { value: '1006', label: 'Site 1006 — San Antonio Roasting (Hub 1021)' },
                    { value: '1009', label: 'Site 1009 — Austin Roasting (Hub 1055)' },
                    { value: '1102', label: 'Site 1102 — Fort Worth Roasting (Hub 1055)' },
                    { value: '1103', label: 'Site 1103 — El Paso Roasting (Hub 1055)' },
                  ]}
                  size="md"
                  style={{ width: '100%' }}
                  triggerStyle={{ width: '100%' }}
                  menuStyle={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Display Timezone</label>
                <ThemedSelect
                  value={form.timezone}
                  onChange={val => setForm(f => ({ ...f, timezone: val }))}
                  options={[
                    { value: 'cst', label: 'Central Time (CST · Plano / Dallas)' },
                    { value: 'pst', label: 'Pacific Time (PST)' },
                    { value: 'est', label: 'Eastern Time (EST)' },
                    { value: 'utc', label: 'UTC (Global Standard)' },
                  ]}
                  size="md"
                  style={{ width: '100%' }}
                  triggerStyle={{ width: '100%' }}
                  menuStyle={{ width: '100%' }}
                />
              </div>
            </div>
          </form>

          {/* 2. Sourcing & Notification Preferences */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Sourcing Rules */}
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.divider}`,
              }}>
                <Sliders size={14} style={{ color: C.plum }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Sourcing Workflow Rules</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Cascade evaluation & approval behavior</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { key: 'alternateSignoff', title: 'Require sign-off on alternates', sub: 'Pause POs for review when recommending approved substitutes' },
                  { key: 'autoReserveExact', title: 'Auto-reserve exact local match', sub: 'Reserve stock immediately when full local quantity is available' },
                  { key: 'minThresholdAlert', title: 'Flag min-threshold breaches', sub: 'Include safe minimum buffer warnings in stock status' },
                  { key: 'prioritizeDelayed', title: 'Prioritize delayed inbound POs', sub: 'Rank orders with incoming delays at top of queue' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{item.title}</div>
                      <div style={{ fontSize: 9.5, color: C.muted }}>{item.sub}</div>
                    </div>
                    <ToggleSwitch checked={prefs[item.key]} onChange={() => togglePref(item.key)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications & Security */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Notification Channels */}
              <div style={{
                background: '#FFFFFF',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
                padding: '16px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.divider}`,
                }}>
                  <Bell size={14} style={{ color: C.rose }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Notification Channels</div>
                    <div style={{ fontSize: 10, color: C.muted }}>Where urgent alerts and updates are delivered</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[
                    { key: 'bellCritical', title: 'In-app bell notifications', sub: 'Immediate alerts for stockouts & late shipments' },
                    { key: 'dailyDigest', title: 'Morning digest summary', sub: 'Daily 08:00 AM CST briefing via email' },
                    { key: 'smsEscalation', title: 'SMS delay escalations', sub: 'Text alerts for critical same-day exceptions' },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{item.title}</div>
                        <div style={{ fontSize: 9.5, color: C.muted }}>{item.sub}</div>
                      </div>
                      <ToggleSwitch checked={prefs[item.key]} onChange={() => togglePref(item.key)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & SSO */}
              <div style={{
                background: '#FFFFFF',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
                padding: '14px 16px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Shield size={14} style={{ color: C.success }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Security & Session</span>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 12,
                    background: C.successBg, color: C.success, border: `1px solid ${C.successBorder}`,
                  }}>
                    SSO · 2FA Active
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10.5, color: C.muted }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Identity Provider</span>
                    <strong style={{ color: C.text }}>Okta Enterprise SSO</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Current Session</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.text }}>
                      <KeyRound size={11} style={{ color: C.rose }} />
                      Plano, TX · Active now
                    </span>
                  </div>

                  {/* Actions: Change Password & Sign Out */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingTop: 10, borderTop: `1px solid ${C.divider}` }}>
                    <button
                      type="button"
                      onClick={() => navigate('/change-password')}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        background: '#FFFFFF',
                        color: C.text,
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      <Lock size={12} style={{ color: C.rose }} />
                      Change Password
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #F5D0D6',
                        background: '#FEF0F2',
                        color: '#C02030',
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#D83040';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#D83040';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#FEF0F2';
                        e.currentTarget.style.color = '#C02030';
                        e.currentTarget.style.borderColor = '#F5D0D6';
                      }}
                    >
                      <LogOut size={12} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

