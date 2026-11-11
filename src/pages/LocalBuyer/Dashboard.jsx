import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Bell, ArrowRight } from 'lucide-react';

// ── KPI Summary Cards ─────────────────────────────────────────────────────────
const SUMMARY_CARDS = [
  { label: 'TOTAL OPEN ORDERS', value: 18, sub: 'All active orders',            variant: 'neutral'  },
  { label: 'NEEDS DECISION',    value: 4,  sub: 'Buyer action required',        variant: 'warning'  },
  { label: 'AT RISK',           value: 2,  sub: 'Late or threatened delivery',  variant: 'critical' },
  { label: 'ON TRACK',          value: 12, sub: 'No immediate action required', variant: 'success'  },
];

// ── Open Orders Data ───────────────────────────────────────────────────────────
const OPEN_ORDERS = [
  { id: 'PO-2841', greenId: 'Gd-09', greenName: 'Ethiopia Yirgacheffe', needBy: 'Nov 08', eta: 'Nov 07', etaRisk: false, status: 'auto-reserved',     statusLabel: 'Auto-reserved',     bell: false },
  { id: 'PO-2842', greenId: 'Gc-11', greenName: 'Brazil Cerrado',        needBy: 'Nov 09', eta: 'Nov 08', etaRisk: false, status: 'needs-signoff',      statusLabel: 'Needs sign-off',    bell: true  },
  { id: 'PO-2843', greenId: 'Gb-04', greenName: 'Colombia Supremo',      needBy: 'Nov 10', eta: 'Nov 12', etaRisk: true,  status: 'at-risk',            statusLabel: 'At risk',           bell: true  },
  { id: 'PO-2844', greenId: 'Gf-22', greenName: 'Guatemala Antigua',     needBy: 'Nov 07', eta: 'Nov 07', etaRisk: false, status: 'awaiting-approval',  statusLabel: 'Awaiting approval', bell: true  },
  { id: 'PO-2845', greenId: 'Ga-17', greenName: 'Kenya AA Nyeri',        needBy: 'Nov 11', eta: 'Nov 10', etaRisk: false, status: 'reserved',           statusLabel: 'Reserved',          bell: false },
  { id: 'PO-2846', greenId: 'Ge-31', greenName: 'Sumatra Mandheling',    needBy: 'Nov 12', eta: '—',      etaRisk: false, status: 'no-option',          statusLabel: 'No option',         bell: true  },
  { id: 'PO-2847', greenId: 'Gh-08', greenName: 'Costa Rica Tarrazu',    needBy: 'Nov 13', eta: 'Nov 14', etaRisk: true,  status: 'at-risk',            statusLabel: 'At risk',           bell: true  },
  { id: 'PO-2848', greenId: 'Gd-09', greenName: 'Ethiopia Yirgacheffe',  needBy: 'Nov 14', eta: 'Nov 13', etaRisk: false, status: 'needs-signoff',      statusLabel: 'Needs sign-off',    bell: false },
];

// ── Greens to Watch ────────────────────────────────────────────────────────────
const GREENS_WATCH = [
  { id: 'Gd-09', current: 350,  min: 700,  status: 'critical' },
  { id: 'Gb-04', current: 500,  min: 1300, status: 'critical' },
  { id: 'Gf-22', current: 980,  min: 1150, status: 'low'      },
  { id: 'Gc-11', current: 3300, min: 2000, status: 'healthy'  },
  { id: 'Ga-17', current: 3400, min: 2500, status: 'healthy'  },
];

// ── Arriving Soon ──────────────────────────────────────────────────────────────
const ARRIVING_SOON = [
  { order: 'PO-2841', greenId: 'Gd-09', greenName: 'Ethiopia Yirgacheffe Natural', qty: '1,200 kg', source: 'Site 1054 · Reserved',      eta: 'Nov 07', etaRisk: false, needBy: 'Nov 08', deliveryStatus: 'On track', deliveryVariant: 'success',  alert: '—',     alertVariant: 'none'     },
  { order: 'PO-2844', greenId: 'Gc-14', greenName: 'Guatemala Antigua SHB',         qty: '600 kg',   source: 'Warehouse 1055 · Central', eta: 'Nov 07', etaRisk: false, needBy: 'Nov 07', deliveryStatus: 'On track', deliveryVariant: 'success',  alert: '—',     alertVariant: 'none'     },
  { order: 'PO-2843', greenId: 'Gc-04', greenName: 'Colombia Supremo Washed',       qty: '1,200 kg', source: 'Warehouse 1055 · Central', eta: 'Nov 10', etaRisk: false, needBy: 'Nov 10', deliveryStatus: 'On track', deliveryVariant: 'success',  alert: '—',     alertVariant: 'none'     },
];

// ── Tab filters ────────────────────────────────────────────────────────────────
const TAB_FILTERS = [
  { key: 'decision', label: 'Needs decision', count: 4,  statuses: ['needs-signoff', 'awaiting-approval'] },
  { key: 'risk',     label: 'At risk',        count: 2,  statuses: ['at-risk'] },
  { key: 'track',    label: 'On track',       count: 12, statuses: ['auto-reserved', 'reserved'] },
  { key: 'all',      label: 'All',            count: 18, statuses: null },
];

// ── Shared tokens ──────────────────────────────────────────────────────────────
const C = {
  text:    '#30272B',
  muted:   '#746970',
  subtle:  '#9CA3AF',
  border:  '#E6DCE2',
  divider: '#F0EAEE',
  hover:   '#FDFBFC',
  rose:    '#D83F79',
  success: '#27A348',
  warn:    '#E07000',
  crit:    '#D83040',
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, label }) {
  const map = {
    'auto-reserved':     { bg: '#EDF7F1', color: '#1E8A3C', border: '#B4DDBD' },
    'needs-signoff':     { bg: '#FFF7E6', color: '#B86A00', border: '#F5D68A' },
    'at-risk':           { bg: '#FEF0F2', color: '#C02030', border: '#F0B8C0' },
    'awaiting-approval': { bg: '#FFFAE8', color: '#8A6200', border: '#EDD98A' },
    'reserved':          { bg: '#EDF7F1', color: '#1E8A3C', border: '#B4DDBD' },
    'no-option':         { bg: '#FEF0F2', color: '#C02030', border: '#F0B8C0' },
  };
  const s = map[status] || { bg: '#F5F3FF', color: '#6B7280', border: '#E5E7EB' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, lineHeight: '16px',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Delivery badge ────────────────────────────────────────────────────────────
function DeliveryBadge({ label, variant }) {
  const map = {
    success:  { bg: '#EDF7F1', color: '#1E8A3C' },
    critical: { bg: '#FEF0F2', color: '#C02030' },
    warning:  { bg: '#FFF7E6', color: '#B86A00' },
  };
  const s = map[variant] || { bg: 'transparent', color: C.subtle };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, lineHeight: '16px',
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Alert chip ────────────────────────────────────────────────────────────────
function AlertChip({ label, variant }) {
  if (variant === 'none' || label === '—') {
    return <span style={{ color: C.subtle, fontSize: 11 }}>—</span>;
  }
  const map = {
    warning:  { bg: '#FFF7E6', color: '#B86A00', border: '#F5D68A' },
    critical: { bg: '#FEF0F2', color: '#C02030', border: '#F0B8C0' },
  };
  const s = map[variant] || map.critical;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 6px', borderRadius: 3,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.3px',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Green inventory bar ───────────────────────────────────────────────────────
function GreenBar({ id, current, min, status }) {
  const max      = Math.max(current, min) * 1.18;
  const fillPct  = Math.min((current / max) * 100, 100);
  const minPct   = Math.min((min    / max) * 100, 100);
  const barColor = { critical: '#E53955', low: '#E7B83D', healthy: '#56A82F' }[status] || '#56A82F';
  const tagStyle = {
    critical: { bg: '#FEF0F2', color: '#C02030' },
    low:      { bg: '#FFF7E6', color: '#B86A00' },
    healthy:  { bg: '#EDF7F1', color: '#1E8A3C' },
  }[status] || { bg: '#EDF7F1', color: '#1E8A3C' };
  const tagLabel = { critical: 'Critical', low: 'Low', healthy: 'Healthy' }[status];

  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{id}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: C.muted }}>
            {current.toLocaleString()} / {min.toLocaleString()} kg
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
            background: tagStyle.bg, color: tagStyle.color,
          }}>
            {tagLabel}
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 6, background: '#EDE6EB', borderRadius: 999 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${fillPct}%`, background: barColor,
          borderRadius: 999, transition: 'width 0.5s ease',
        }} />
        <div style={{
          position: 'absolute', top: -3, bottom: -3,
          left: `${minPct}%`, width: 1.5,
          background: '#9CA3AF', borderRadius: 2,
          transform: 'translateX(-50%)',
        }} />
      </div>
    </div>
  );
}

// ── Link button ───────────────────────────────────────────────────────────────
function LinkBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 600, color: C.rose,
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      whiteSpace: 'nowrap', lineHeight: 1,
    }}>
      {children}
    </button>
  );
}

// ── Card shell ────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      boxShadow: '0 1px 2px rgba(59,45,52,0.06)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const tabConfig     = TAB_FILTERS.find(t => t.key === activeTab);
  const filteredOrders = tabConfig?.statuses
    ? OPEN_ORDERS.filter(o => tabConfig.statuses.includes(o.status))
    : OPEN_ORDERS;

  const TH = { padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', whiteSpace: 'nowrap', background: '#FDFBFC' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1300, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Austin Local · Site 04 · Thu, Oct 29
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.25, letterSpacing: '-0.3px' }}>
            Good morning, Maya.
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
            4 orders need a decision. 2 are at risk of late delivery.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <span style={{ fontSize: 10, color: C.subtle }}>Last updated 10:42 AM</span>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, color: '#16A6D1', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, fontWeight: 500,
            }}>
              <RefreshCw size={9} /> Refresh
            </button>
          </div>
        </div>

        {/* OTF card */}
        <div style={{
          background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '12px 16px',
          textAlign: 'right', flexShrink: 0,
          boxShadow: '0 1px 2px rgba(59,45,52,0.06)',
        }}>
          <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
            OTIF - Last 30 days
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#56A82F', lineHeight: 1 }}>92%</div>
          <LinkBtn onClick={() => navigate('/analytics')}>
            Analytics <ArrowRight size={9} />
          </LinkBtn>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {SUMMARY_CARDS.map(card => {
          const vs = {
            neutral:  { bg: '#fff',     border: C.border,  label: C.muted,   val: C.text,     sub: C.subtle  },
            warning:  { bg: '#FFFCF2',  border: '#EDD98A', label: '#8A6200', val: '#B86A00',  sub: '#B86A00' },
            critical: { bg: '#FFF5F6',  border: '#F0B8C0', label: '#902030', val: '#C02030',  sub: '#902030' },
            success:  { bg: '#F4FBF0',  border: '#B4DDBD', label: '#1E6630', val: '#1E8A3C',  sub: '#1E6630' },
          }[card.variant];
          return (
            <Card key={card.label} style={{ background: vs.bg, border: `1px solid ${vs.border}`, borderRadius: 8 }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: vs.label, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: vs.val, lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 10, color: vs.sub, marginTop: 4, lineHeight: 1.4 }}>
                  {card.sub}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 252px', gap: 12, alignItems: 'start' }}>

        {/* Open Orders */}
        <Card>
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Open orders</div>
                <div style={{ fontSize: 10, color: C.subtle, marginTop: 2 }}>
                  Prioritised by buyer action and delivery risk · Select an order to view details.
                </div>
              </div>
              <LinkBtn onClick={() => navigate('/orders')}>
                View all orders <ArrowRight size={10} />
              </LinkBtn>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, borderBottom: `1px solid ${C.divider}` }}>
              {TAB_FILTERS.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '5px 10px',
                      fontSize: 11, fontWeight: isActive ? 600 : 400,
                      color: isActive ? C.text : C.muted,
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: isActive ? `2px solid ${C.text}` : '2px solid transparent',
                      marginBottom: -1, transition: 'color 0.1s',
                    }}
                  >
                    {tab.label}
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      padding: '1px 4px', borderRadius: 8,
                      background: isActive ? C.text : '#EDE6EB',
                      color: isActive ? '#fff' : C.muted,
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <th style={TH}>ORDER ID</th>
                  <th style={TH}>GREEN ID</th>
                  <th style={TH}>GREEN NAME</th>
                  <th style={TH}>NEED-BY</th>
                  <th style={TH}>ETA</th>
                  <th style={TH}>STATUS</th>
                  <th style={{ ...TH, width: 24 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate('/orders')}
                    style={{
                      borderBottom: i < filteredOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: C.rose }}>{order.id}</span>
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.text, fontWeight: 500 }}>{order.greenId}</td>
                    <td style={{ padding: '9px 16px', fontSize: 12, color: C.text }}>{order.greenName}</td>
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>{order.needBy}</td>
                    <td style={{ padding: '9px 16px', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {order.eta === '—'
                        ? <span style={{ color: C.subtle }}>—</span>
                        : <span style={{ color: order.etaRisk ? C.crit : C.text, fontWeight: order.etaRisk ? 600 : 400 }}>{order.eta}</span>
                      }
                    </td>
                    <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={order.status} label={order.statusLabel} />
                    </td>
                    <td style={{ padding: '9px 10px 9px 4px', textAlign: 'center', width: 24 }}>
                      {order.bell && <Bell size={11} style={{ color: '#E7B83D' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Greens to Watch */}
        <Card>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Greens to watch</div>
              <LinkBtn onClick={() => navigate('/inventory')}>
                View inventory <ArrowRight size={9} />
              </LinkBtn>
            </div>
            <div style={{ fontSize: 10, color: C.subtle, marginBottom: 10 }}>
              Available stock vs each green's minimum
            </div>

            {/* Gradient bar */}
            <div style={{ height: 5, borderRadius: 999, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
              <div style={{ flex: 15, background: '#E53955' }} />
              <div style={{ flex: 15, background: '#E7B83D' }} />
              <div style={{ flex: 70, background: '#56A82F' }} />
            </div>

            <div style={{ fontSize: 10, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Closest to minimum
            </div>

            {GREENS_WATCH.map(g => <GreenBar key={g.id} {...g} />)}

            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.divider}` }}>
              <span style={{ fontSize: 9, color: C.subtle, fontStyle: 'italic' }}>
                Opens Inventory filtered to the selected green.
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Arriving Soon ── */}
      <Card>
        <div style={{ padding: '12px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Arriving soon</div>
            <div style={{ fontSize: 10, color: C.subtle, marginTop: 2 }}>
              Upcoming inbound shipments and local reserved deliveries
            </div>
          </div>
          <LinkBtn onClick={() => navigate('/inventory?tab=incoming')}>
            View incoming <ArrowRight size={10} />
          </LinkBtn>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
                {['ORDER', 'GREEN', 'QUANTITY', 'SOURCE', 'ETA', 'NEED-BY', 'DELIVERY STATUS', 'ALERT'].map(col => (
                  <th key={col} style={TH}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ARRIVING_SOON.map((row, i) => (
                <tr
                  key={row.order}
                  onClick={() => navigate('/inventory?tab=incoming')}
                  style={{
                    borderBottom: i < ARRIVING_SOON.length - 1 ? `1px solid ${C.divider}` : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: C.rose }}>{row.order}</span>
                  </td>
                  <td style={{ padding: '9px 16px', fontSize: 11, whiteSpace: 'nowrap' }}>
                    <span style={{ color: C.text, fontWeight: 500 }}>{row.greenId}</span>
                    <span style={{ color: C.muted }}> · {row.greenName}</span>
                  </td>
                  <td style={{ padding: '9px 16px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>{row.qty}</td>
                  <td style={{ padding: '9px 16px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{row.source}</td>
                  <td style={{ padding: '9px 16px', fontSize: 11, whiteSpace: 'nowrap' }}>
                    <span style={{ color: row.etaRisk ? C.crit : C.text, fontWeight: row.etaRisk ? 600 : 400 }}>{row.eta}</span>
                  </td>
                  <td style={{ padding: '9px 16px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>{row.needBy}</td>
                  <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                    <DeliveryBadge label={row.deliveryStatus} variant={row.deliveryVariant} />
                  </td>
                  <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                    <AlertChip label={row.alert} variant={row.alertVariant} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.divider}` }}>
          <span style={{ fontSize: 9, color: C.subtle, fontStyle: 'italic' }}>
            Alert flags appear here and in the header notification bell.
          </span>
        </div>
      </Card>

    </div>
  );
}
