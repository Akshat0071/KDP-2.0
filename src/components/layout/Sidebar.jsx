import { NavLink } from 'react-router-dom';
import { LayoutGrid, List, Package, BarChart2, Warehouse } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',  icon: LayoutGrid },
  { to: '/orders',    label: 'Orders',    icon: List       },
  { to: '/inventory', label: 'Inventory', icon: Package    },
  { to: '/analytics', label: 'Analytics', icon: BarChart2  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">K</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">KDP GreenSource</div>
          <div className="sidebar-logo-sub">Enterprise Inventory</div>
        </div>
      </div>

      {/* Workspace label */}
      <div style={{
        padding: '10px 16px 3px',
        fontSize: 9, fontWeight: 600,
        color: 'rgba(255,255,255,0.28)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
      }}>
        WORKSPACE
      </div>

      {/* Navigation */}
      <nav className="nav-section" style={{ padding: '2px 0 0' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={14} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Central Workspace footer */}
      <div style={{ padding: '10px' }}>
        <NavLink
          to="/central-orders"
          style={{ textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div style={{
              background: isActive ? 'rgba(216,63,121,0.18)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isActive ? '#D83F79' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Warehouse size={15} style={{ color: isActive ? '#D83F79' : '#FFFFFF', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                    Central Orders
                  </div>
                  <div style={{ fontSize: 9.5, color: isActive ? '#D83F79' : 'rgba(255,255,255,0.45)', marginTop: 1 }}>
                    Warehouse Portal
                  </div>
                </div>
              </div>
              <span style={{
                background: '#D83F79',
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 10,
              }}>
                3
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
