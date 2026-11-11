import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, ChevronDown, Check, Building2, User, ArrowRight, KeyRound, LogOut } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '../../context/AuthContext';
import { LOCAL_SITES } from '../../data/mockData';

const SITES = LOCAL_SITES.map(s => ({
  id: s.id,
  name: s.name,
  region: `${s.city} · Assigned WH ${s.assignedWarehouse} ($${s.shippingCost} Freight)`,
  status: 'Online',
}));

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);
  const bellButtonRef = useRef(null);

  // Site selector dropdown state - default to Site 1054 (Plano Roasting)
  const [selectedSiteId, setSelectedSiteId] = useState('1054');
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const siteMenuRef = useRef(null);

  // Profile popover state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close menus on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (siteMenuRef.current && !siteMenuRef.current.contains(e.target)) {
        setIsSiteMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsSiteMenuOpen(false);
        setIsProfileOpen(false);
      }
    }
    if (isSiteMenuOpen || isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSiteMenuOpen, isProfileOpen]);

  const activeSite = SITES.find(s => s.id === selectedSiteId) || SITES[0];

  return (
    <header className="topbar">
      {/* Site Selector Dropdown */}
      <div ref={siteMenuRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsSiteMenuOpen(prev => !prev)}
          className="site-selector"
          style={{
            borderColor: isSiteMenuOpen ? '#D83F79' : 'var(--color-border)',
            background: isSiteMenuOpen ? '#FAF2F6' : '#FFFFFF',
            boxShadow: isSiteMenuOpen ? '0 0 0 3px rgba(216, 63, 121, 0.12)' : 'none',
          }}
        >
          <MapPin size={12} className="site-selector-pin" />
          <span>{activeSite.name}</span>
          <ChevronDown
            size={12}
            style={{
              color: isSiteMenuOpen ? '#D83F79' : '#9CA3AF',
              transform: isSiteMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.18s ease, color 0.15s ease',
            }}
          />
        </button>

        {isSiteMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: 260,
              background: '#FFFFFF',
              border: '1px solid #E6DCE2',
              borderRadius: 8,
              boxShadow: '0 6px 20px rgba(48, 39, 43, 0.12), 0 2px 4px rgba(48, 39, 43, 0.04)',
              padding: '6px',
              zIndex: 70,
              animation: 'fadeInMenu 0.12s ease-out',
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: '#9CA3AF',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                padding: '4px 8px 6px',
              }}
            >
              Switch Local Facility
            </div>

            {SITES.map(site => {
              const isSelected = site.id === selectedSiteId;
              return (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedSiteId(site.id);
                    setIsSiteMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isSelected ? '#FAF2F6' : 'transparent',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#FDFBFC';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: isSelected ? 'rgba(216,63,121,0.1)' : '#F5EFF3',
                        color: isSelected ? '#D83F79' : '#746970',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={13} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#D83F79' : '#30272B',
                        }}
                      >
                        {site.name}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#746970', marginTop: 1 }}>
                        {site.region}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={13} style={{ color: '#D83F79', strokeWidth: 2.5, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="topbar-spacer" />

      {/* Actions (Notifications Trigger & Dropdown) */}
      <div className="topbar-actions" style={{ position: 'relative' }}>
        <button
          ref={bellButtonRef}
          className="topbar-icon-btn"
          onClick={() => {
            setIsProfileOpen(false);
            setIsSiteMenuOpen(false);
            setIsNotificationsOpen(prev => !prev);
          }}
          title="Notifications & Alerts"
          aria-expanded={isNotificationsOpen}
          aria-haspopup="true"
          style={{
            position: 'relative',
            background: isNotificationsOpen ? '#FAF5F7' : '#FFFFFF',
            borderColor: isNotificationsOpen ? '#D83F79' : '#E6DCE2',
          }}
        >
          <Bell size={14} style={{ color: isNotificationsOpen ? '#D83F79' : '#746970' }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 15,
                height: 15,
                padding: '0 4px',
                borderRadius: 10,
                background: '#E53955',
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: 700,
                lineHeight: '15px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(229,57,85,0.4)',
                border: '1.5px solid #FFFFFF',
                pointerEvents: 'none',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        <NotificationsDropdown
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          triggerRef={bellButtonRef}
          onUnreadCountChange={setUnreadCount}
        />
      </div>

      {/* User Profile Trigger & Popover */}
      <div ref={profileMenuRef} style={{ position: 'relative' }}>
        <div
          className="topbar-user"
          role="button"
          tabIndex={0}
          aria-expanded={isProfileOpen}
          aria-haspopup="true"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsSiteMenuOpen(false);
            setIsProfileOpen(prev => !prev);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsNotificationsOpen(false);
              setIsSiteMenuOpen(false);
              setIsProfileOpen(prev => !prev);
            }
          }}
          style={{
            background: isProfileOpen ? '#FAF2F6' : undefined,
            borderRadius: 8,
            padding: '4px 8px',
            border: `1px solid ${isProfileOpen ? '#D83F79' : 'transparent'}`,
            transition: 'all 0.15s ease',
          }}
        >
          <div className="topbar-avatar">{user?.initials || 'M'}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name || 'Maya Torres'}</span>
            <span className="topbar-user-role">{user?.role || 'Local Buyer'}</span>
          </div>
          <ChevronDown
            size={11}
            style={{
              color: isProfileOpen ? '#D83F79' : '#9CA3AF',
              transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.18s ease',
              marginLeft: 2,
            }}
          />
        </div>

        {/* Profile Popover Card */}
        {isProfileOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 252,
              background: '#FFFFFF',
              border: '1px solid #E6DCE2',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(48, 39, 43, 0.14), 0 2px 6px rgba(48, 39, 43, 0.05)',
              padding: 12,
              zIndex: 80,
              animation: 'fadeInMenu 0.12s ease-out',
            }}
          >
            {/* Identity Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid #F0EAEE' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#D83F79',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {user?.initials || 'M'}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: '#1E8A3C',
                    border: '1.5px solid #FFFFFF',
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#30272B', lineHeight: 1.2 }}>
                  {user?.name || 'Maya Torres'}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#D83F79', marginTop: 1 }}>
                  {user?.title || 'Local Buyer · Lead Sourcing'}
                </div>
                <div style={{ fontSize: 9.5, color: '#746970', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'maya.torres@kdpgreensource.com'}
                </div>
              </div>
            </div>

            {/* Active Site Pill */}
            <div
              style={{
                marginTop: 9,
                marginBottom: 9,
                padding: '6px 8px',
                borderRadius: 6,
                background: '#FAF8F9',
                border: '1px solid #F0EAEE',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                color: '#746970',
              }}
            >
              <MapPin size={11} style={{ color: '#D83F79', flexShrink: 0 }} />
              <span style={{ color: '#30272B', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.site || activeSite.name}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Visit Profile */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#FAF2F6',
                  color: '#30272B',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#D83F79';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FAF2F6';
                  e.currentTarget.style.color = '#30272B';
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <User size={13} />
                  Visit Profile Page
                </span>
                <ArrowRight size={12} />
              </button>

              {/* Change Password */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/change-password');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#FAF8F9',
                  color: '#30272B',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F0EAEE';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FAF8F9';
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <KeyRound size={13} style={{ color: '#D83F79' }} />
                  Change Password
                </span>
                <ArrowRight size={12} style={{ color: '#9CA3AF' }} />
              </button>

              {/* Sign Out / Logout */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: 6,
                  border: '1px solid #F5D0D6',
                  background: '#FEF0F2',
                  color: '#C02030',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 3,
                  transition: 'all 0.12s ease',
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <LogOut size={13} />
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
