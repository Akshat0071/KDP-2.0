import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, AlertTriangle, XCircle, Info, CheckCircle,
  Check, CheckCheck, X, ArrowRight
} from 'lucide-react';
import { ALERTS } from '../../data/mockData';

// Initial activity items migrated from AlertsActivity page
const INITIAL_ACTIVITY = [
  {
    id: 'ACT-001',
    type: 'activity',
    severity: 'success',
    message: 'PO-2838 marked Received — Gc-11 2,000 kg',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    action: 'View order',
    actionLink: '/orders',
  },
  {
    id: 'ACT-002',
    type: 'activity',
    severity: 'info',
    message: 'Transfer TR-501 dispatched from Warehouse 1055',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    action: 'Track',
    actionLink: '/transfers',
  },
  {
    id: 'ACT-003',
    type: 'activity',
    severity: 'warning',
    message: 'Gf-22 stock fell below 2,000 kg minimum threshold',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    action: 'Inventory',
    actionLink: '/inventory',
  },
  {
    id: 'ACT-004',
    type: 'activity',
    severity: 'critical',
    message: 'PO-2839 evaluation: no feasible option found (4 scenarios tested)',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    action: 'Review',
    actionLink: '/orders',
  },
  {
    id: 'ACT-005',
    type: 'activity',
    severity: 'success',
    message: 'Gc-14 approved as alternate to Gb-04 in Local Inventory',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    action: 'Inventory',
    actionLink: '/inventory',
  },
];

// Combine alerts with activity items
const ALL_ITEMS = [
  ...ALERTS.map(a => ({ ...a, kind: 'alert' })),
  ...INITIAL_ACTIVITY.map(act => ({ ...act, kind: 'activity' })),
];

function formatTimeAgo(timestamp) {
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

export default function NotificationsDropdown({ isOpen, onClose, triggerRef, onUnreadCountChange }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [items, setItems] = useState(ALL_ITEMS);
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'activity'
  const [readIds, setReadIds] = useState(new Set());

  // Report unread count back to Topbar
  const unreadCount = items.filter(i => !readIds.has(i.id)).length;
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Click outside and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setReadIds(new Set(items.map(i => i.id)));
  };

  const toggleRead = (id, e) => {
    e.stopPropagation();
    setReadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeItem = (id, e) => {
    e.stopPropagation();
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAction = (item) => {
    setReadIds(prev => new Set(prev).add(item.id));
    onClose();
    if (item.actionLink) {
      navigate(item.actionLink);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (filter === 'critical') return item.severity === 'critical';
    if (filter === 'activity') return item.kind === 'activity';
    return true;
  });

  const criticalCount = items.filter(i => i.severity === 'critical' && !readIds.has(i.id)).length;
  const activityCount = items.filter(i => i.kind === 'activity').length;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 380,
        maxWidth: 'calc(100vw - 24px)',
        background: '#FFFFFF',
        border: '1px solid #E6DCE2',
        borderRadius: 12,
        boxShadow: '0 12px 36px -4px rgba(48, 39, 43, 0.2), 0 4px 14px -2px rgba(48, 39, 43, 0.08)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid #F0EAEE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#30272B', letterSpacing: '-0.2px' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: '#FEF0F2',
              color: '#D83040',
              padding: '1px 6px',
              borderRadius: 10,
              border: '1px solid #F5B8C0',
            }}>
              {unreadCount} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: '#D83F79',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '4px 6px',
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF0F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}

          <button
            onClick={onClose}
            title="Close"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 4,
              border: 'none',
              background: 'none',
              color: '#746970',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F0F3'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '8px 16px',
        background: '#FAF8F9',
        borderBottom: '1px solid #F0EAEE',
      }}>
        {[
          { key: 'all', label: 'All', count: items.length },
          { key: 'critical', label: 'Critical', count: criticalCount, isCrit: true },
          { key: 'activity', label: 'Activity', count: activityCount },
        ].map(tab => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 9px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: isActive ? 600 : 500,
                border: isActive
                  ? '1px solid #30272B'
                  : '1px solid #E6DCE2',
                background: isActive ? '#30272B' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#746970',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: isActive
                  ? '#FFFFFF'
                  : tab.isCrit && tab.count > 0 ? '#D83040' : '#9CA3AF',
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Scrollable Notifications List ── */}
      <div style={{
        maxHeight: 380,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {filteredItems.length === 0 ? (
          /* Empty State (YouTube-styled) */
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#746970',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F7F3F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              color: '#9CA3AF',
            }}>
              <Bell size={26} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#30272B', marginBottom: 4 }}>
              Your notifications live here
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', maxWidth: 220, lineHeight: 1.4 }}>
              You're all caught up! No notifications in this category.
            </div>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isRead = readIds.has(item.id);
            const isCritical = item.severity === 'critical';
            const isWarning = item.severity === 'warning';
            const isSuccess = item.severity === 'success';

            // Severity icon & styling
            let icon = <Info size={13} />;
            let iconBg = '#E8F8FD';
            let iconColor = '#16A6D1';

            if (isCritical) {
              icon = <XCircle size={13} />;
              iconBg = '#FEF0F2';
              iconColor = '#D83040';
            } else if (isWarning) {
              icon = <AlertTriangle size={13} />;
              iconBg = '#FFF8E8';
              iconColor = '#E07000';
            } else if (isSuccess) {
              icon = <CheckCircle size={13} />;
              iconBg = '#EDF7F1';
              iconColor = '#27A348';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleAction(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: index < filteredItems.length - 1 ? '1px solid #F5F0F3' : 'none',
                  background: isRead ? '#FFFFFF' : '#FDFAFB',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9F5F7'}
                onMouseLeave={e => e.currentTarget.style.background = isRead ? '#FFFFFF' : '#FDFAFB'}
              >
                {/* Unread indicator dot */}
                {!isRead && (
                  <div style={{
                    position: 'absolute',
                    left: 6,
                    top: 18,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: isCritical ? '#D83040' : '#D83F79',
                  }} />
                )}

                {/* Left Icon Pill */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: iconBg,
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {icon}
                </div>

                {/* Body Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: isRead ? 500 : 600,
                    color: '#30272B',
                    lineHeight: 1.35,
                    marginBottom: 3,
                  }}>
                    {item.message}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 10,
                    color: '#9CA3AF',
                  }}>
                    <span>{formatTimeAgo(item.timestamp)}</span>
                    {item.greenId && (
                      <>
                        <span>·</span>
                        <span style={{ fontWeight: 600, color: '#746970' }}>{item.greenId}</span>
                      </>
                    )}
                    {item.orderId && (
                      <>
                        <span>·</span>
                        <span style={{ fontWeight: 600, color: '#D83F79' }}>{item.orderId}</span>
                      </>
                    )}
                  </div>

                  {/* Quick Action Button */}
                  {item.action && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#D83F79',
                          background: '#FFF0F5',
                          border: '1px solid #F5C0D5',
                          borderRadius: 4,
                          padding: '2px 8px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#D83F79';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#FFF0F5';
                          e.currentTarget.style.color = '#D83F79';
                        }}
                      >
                        {item.action}
                        <ArrowRight size={9} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mark Read or Dismiss on Hover */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => toggleRead(item.id, e)}
                    title={isRead ? 'Mark as unread' : 'Mark as read'}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: 'none',
                      background: 'none',
                      color: isRead ? '#9CA3AF' : '#D83F79',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0.6,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                  >
                    <Check size={11} />
                  </button>
                  <button
                    onClick={(e) => removeItem(item.id, e)}
                    title="Dismiss notification"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: 'none',
                      background: 'none',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0.6,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '9px 16px',
        background: '#FAF8F9',
        borderTop: '1px solid #F0EAEE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 10,
        color: '#9CA3AF',
      }}>
        <span>Live alerts & activity stream</span>
        <button
          onClick={() => {
            setItems([]);
            setReadIds(new Set());
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#746970',
            fontSize: 10,
            cursor: 'pointer',
            padding: 0,
            fontWeight: 500,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#D83040'}
          onMouseLeave={e => e.currentTarget.style.color = '#746970'}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

