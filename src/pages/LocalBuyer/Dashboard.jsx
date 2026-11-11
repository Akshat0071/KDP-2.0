import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders, getOrderStatusMeta } from '../../context/OrdersContext';
import { evaluateItemStatus } from '../../data/localInventory';
import InfoTooltip from '../../components/ui/InfoTooltip';

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

// ── Greens to Watch Status Meta ───────────────────────────────────────────────
const WATCH_STATUS_META = {
  critical: { label: 'Critical', bar: '#D63345', bg: '#F9E6EA', color: '#D63345' },
  low:      { label: 'Low',      bar: '#CB8E1D', bg: '#FBF1D8', color: '#C28515' },
  healthy:  { label: 'Healthy',  bar: '#579D1C', bg: '#ECF5E4', color: '#579D1C' },
};

// ── Status badge ──────────────────────────────────────────────────────────────
function DynamicStatusBadge({ status }) {
  const meta = getOrderStatusMeta(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: 4,
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, lineHeight: '16px',
      background: meta.bg, color: meta.color,
      border: `1px solid ${meta.border}`,
      whiteSpace: 'nowrap',
      textTransform: 'capitalize',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dotBg }} />
      {meta.label}
    </span>
  );
}


// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

function LinkBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 600, color: C.rose,
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 0, textDecoration: 'none',
      }}
    >
      {children}
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { orders, localInventory } = useOrders();

  // Compute live Greens to Watch & Inventory Health Pie Chart from shared localInventory
  const inventoryStats = useMemo(() => {
    const evaluated = localInventory.map(item => {
      const st = evaluateItemStatus(item);
      const watchStatus = (st.key === 'critical' || st.key === 'short')
        ? 'critical'
        : st.key === 'tight'
          ? 'low'
          : 'healthy';
      return {
        id: item.id,
        current: item.available,
        min: item.minThreshold,
        ratio: item.available / (item.minThreshold || 1),
        status: watchStatus,
      };
    });

    const healthy = evaluated.filter(e => e.status === 'healthy').length;
    const low = evaluated.filter(e => e.status === 'low').length;
    const critical = evaluated.filter(e => e.status === 'critical').length;
    const sorted = [...evaluated].sort((a, b) => a.ratio - b.ratio);
    const watchList = sorted.slice(0, 5);
    const total = localInventory.length || 24;
    const healthyPct = Math.round((healthy / total) * 100);

    const healthChartData = [
      { key: 'covered',  name: 'Healthy',          value: healthy,  color: '#579D1C', bg: '#ECF5E4', filterParam: 'covered'  },
      { key: 'tight',    name: 'Low Stock',        value: low,      color: '#CB8E1D', bg: '#FBF1D8', filterParam: 'tight'    },
      { key: 'critical', name: 'Critical / Short', value: critical, color: '#D63345', bg: '#F9E6EA', filterParam: 'critical' },
    ];

    return { watchList, healthChartData, healthy, low, critical, total, healthyPct };
  }, [localInventory]);

  // Filter orders for active site (Site 1054)
  const siteOrders = useMemo(() => {
    return orders.filter(o => o.siteId === '1054');
  }, [orders]);

  const counts = useMemo(() => {
    return {
      total: siteOrders.length,
      decision: siteOrders.filter(o => o.status === 'new' || o.status === 'approved').length,
      fulfillment: siteOrders.filter(o => ['requested', 'accepted', 'dispatched', 'in transit'].includes(o.status)).length,
      dock: siteOrders.filter(o => ['delivered', 'received'].includes(o.status)).length,
      closed: siteOrders.filter(o => o.status === 'closed').length,
    };
  }, [siteOrders]);

  const TAB_FILTERS = [
    { key: 'all',         label: 'All Orders',       count: siteOrders.length, statuses: null },
    { key: 'decision',    label: 'Needs Decision',   count: counts.decision,   statuses: ['new', 'approved'] },
    { key: 'fulfillment', label: 'Hub Transfer',     count: counts.fulfillment,statuses: ['requested', 'accepted', 'dispatched', 'in transit'] },
    { key: 'dock',        label: 'Dock Receiving',   count: counts.dock,       statuses: ['delivered', 'received'] },
    { key: 'closed',      label: 'Closed',           count: counts.closed,     statuses: ['closed'] },
  ];

  const tabConfig = TAB_FILTERS.find(t => t.key === activeTab);
  const filteredOrders = tabConfig?.statuses
    ? siteOrders.filter(o => tabConfig.statuses.includes(o.status))
    : siteOrders;

  // In-flight shipments arriving soon
  const arrivingOrders = useMemo(() => {
    return siteOrders.filter(o => ['dispatched', 'in transit', 'delivered'].includes(o.status));
  }, [siteOrders]);

  const TH = { padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', whiteSpace: 'nowrap', background: '#FDFBFC' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1300, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Site 1054 Plano Roasting · Active Sourcing Hub
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.25, letterSpacing: '-0.3px' }}>
            Good morning, Maya.
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
            {counts.decision} orders need your decision. {counts.fulfillment} orders in central fulfillment transit.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <span style={{ fontSize: 10, color: C.subtle }}>Synced with Central Warehouse Hub 1055</span>
          </div>
        </div>

        {/* OTIF card */}
        <div style={{
          background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '12px 16px',
          textAlign: 'right', flexShrink: 0,
          boxShadow: '0 1px 2px rgba(59,45,52,0.06)',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
            fontSize: 9,
            color: C.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 2,
          }}>
            <span>OTIF - Site 1054</span>
            <InfoTooltip
              title="OTIF Delivery Fulfillment Rate"
              content="On-Time In-Full (OTIF) measures the percentage of green coffee orders delivered on or before the requested Need-By date with 100% of quantity fulfilled."
              formula="(On-Time & Full Deliveries ÷ Total Deliveries) × 100"
              align="right"
              position="bottom"
              size={11}
            />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#56A82F', lineHeight: 1 }}>94.8%</div>
          <LinkBtn onClick={() => navigate('/analytics')}>
            Analytics <ArrowRight size={9} />
          </LinkBtn>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          {
            label: 'TOTAL ACTIVE ORDERS',
            value: counts.total,
            sub: 'Site 1054 demand orders',
            variant: 'neutral',
            infoTitle: 'Total Active Sourcing Orders',
            infoDesc: 'All current open purchase orders originating from Site 1054 across the active canonical lifecycle stages (excluding closed & rejected orders).',
            infoStages: ['new', 'approved', 'requested', 'accepted', 'dispatched', 'in transit', 'delivered'],
          },
          {
            label: 'NEEDS DECISION',
            value: counts.decision,
            sub: 'New demand & approved options',
            variant: 'warning',
            infoTitle: 'Buyer Action Required',
            infoDesc: 'Orders pending Maya Torres\'s sign-off: new demand batches needing recipe/alternate verification, or approved options awaiting transfer requests.',
            infoStages: ['new', 'approved'],
          },
          {
            label: 'WAREHOUSE FULFILLMENT',
            value: counts.fulfillment,
            sub: 'Requested, accepted, or in transit',
            variant: 'purple',
            infoTitle: 'Central Logistics Pipeline',
            infoDesc: 'Orders actively processed by Central Warehouse 1055 or en route via carrier: transfer requests in queue, orders staged in warehouse bays, or in transit.',
            infoStages: ['requested', 'accepted', 'dispatched', 'in transit'],
          },
          {
            label: 'DOCK RECEIVING',
            value: counts.dock,
            sub: 'Delivered / ready for buyer inspection',
            variant: 'success',
            infoTitle: 'Dock Receiving & Inspection',
            infoDesc: 'Shipments arrived at Site 1054 receiving bay awaiting physical bag inspection, moisture check, lot verification, and final inventory booking.',
            infoStages: ['delivered', 'received'],
          },
        ].map((card, idx) => {
          const vs = {
            neutral: { bg: '#fff', border: C.border, label: C.muted, val: C.text, sub: C.subtle },
            warning: { bg: '#FFFCF2', border: '#EDD98A', label: '#8A6200', val: '#B86A00', sub: '#B86A00' },
            purple:  { bg: '#FAF5FF', border: '#E9D8FD', label: '#6B46C1', val: '#6B46C1', sub: '#746970' },
            success: { bg: '#F4FBF0', border: '#B4DDBD', label: '#1E6630', val: '#1E8A3C', sub: '#1E6630' },
          }[card.variant];
          return (
            <Card
              key={card.label}
              style={{
                background: vs.bg,
                border: `1px solid ${vs.border}`,
                borderRadius: 8,
                overflow: 'visible',
                position: 'relative',
              }}
            >
              <div style={{ padding: '12px 14px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 9,
                  fontWeight: 600,
                  color: vs.label,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 6,
                }}>
                  <span>{card.label}</span>
                  <InfoTooltip
                    title={card.infoTitle}
                    content={card.infoDesc}
                    stages={card.infoStages}
                    align={idx === 0 ? 'left' : idx === 3 ? 'right' : 'center'}
                    position="top"
                    size={11}
                    color={vs.label}
                  />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, alignItems: 'start' }}>

        {/* Open Orders */}
        <Card>
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Open orders</div>
                <div style={{ fontSize: 10, color: C.subtle, marginTop: 2 }}>
                  Synchronized across the 9 canonical lifecycle stages · Select an order to evaluate options.
                </div>
              </div>
              <LinkBtn onClick={() => navigate('/orders')}>
                View all orders <ArrowRight size={10} />
              </LinkBtn>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, borderBottom: `1px solid ${C.divider}`, gap: 4, overflowX: 'auto' }}>
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
                      whiteSpace: 'nowrap',
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
                  <th style={TH}>QUANTITY</th>
                  <th style={TH}>NEED-BY</th>
                  <th style={TH}>LIFECYCLE STATUS</th>
                  <th style={{ ...TH, width: 24 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
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
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.muted }}>{order.quantityStr || `${order.orderQuantity} kg`}</td>
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>{order.needBy}</td>
                    <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                      <DynamicStatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: '9px 10px 9px 4px', textAlign: 'center', width: 24 }}>
                      {order.status === 'delivered' && <Bell size={11} style={{ color: '#E7B83D' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right col: Greens to Watch + Inventory Health Pie Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card>
            <div style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Greens to watch</div>
                <LinkBtn onClick={() => navigate('/inventory')}>
                  View inventory <ArrowRight size={10} />
                </LinkBtn>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
                Available stock vs each green&apos;s minimum
              </div>

              {/* Segmented Health Summary Bar (Healthy · Low · Critical) */}
              <div style={{ display: 'flex', gap: 3, height: 5, marginBottom: 9 }}>
                {inventoryStats.healthy > 0 && (
                  <div style={{ flex: inventoryStats.healthy, background: '#579D1C', borderRadius: 999 }} title={`Healthy: ${inventoryStats.healthy} SKUs`} />
                )}
                {inventoryStats.low > 0 && (
                  <div style={{ flex: inventoryStats.low, background: '#CB8E1D', borderRadius: 999 }} title={`Low: ${inventoryStats.low} SKUs`} />
                )}
                {inventoryStats.critical > 0 && (
                  <div style={{ flex: inventoryStats.critical, background: '#D63345', borderRadius: 999 }} title={`Critical: ${inventoryStats.critical} SKUs`} />
                )}
              </div>

              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Closest to minimum
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {inventoryStats.watchList.map(g => {
                  const st = WATCH_STATUS_META[g.status] || WATCH_STATUS_META.healthy;
                  const pct = Math.min(100, Math.max(6, Math.round((g.current / (g.min || 1)) * 100)));

                  return (
                    <div
                      key={g.id}
                      onClick={() => navigate(`/inventory?green=${g.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '2px 4px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.hover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Left Progress Column */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text }}>{g.id}</span>
                          <span style={{ fontSize: 10, color: C.muted }}>
                            {g.current.toLocaleString()} / {g.min.toLocaleString()} kg
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 4.5,
                          borderRadius: 999,
                          background: '#EFEAEF',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: st.bar,
                            transition: 'width 0.25s ease',
                          }} />
                        </div>
                      </div>

                      {/* Right Pill Badge */}
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: st.bg,
                        color: st.color,
                        minWidth: 52,
                        textAlign: 'center',
                        flexShrink: 0,
                      }}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 9.5, color: C.muted, marginTop: 7 }}>
                Opens Inventory filtered to the selected green.
              </div>
            </div>
          </Card>

          {/* Compact Side-by-Side Inventory Health Pie Chart Card */}
          <Card style={{ overflow: 'visible' }}>
            <div style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Inventory health</div>
                  <InfoTooltip
                    title="Site 1054 Inventory Health"
                    content="Breakdown of all 24 green coffee SKUs at Site 1054 by availability against open roasting demand and minimum safety thresholds."
                    align="right"
                    position="top"
                    size={11}
                    color={C.muted}
                  />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: C.subtle }}>{inventoryStats.total} SKUs · Site 1054</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Compact Donut Chart on Left */}
                <div style={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryStats.healthChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={27}
                        outerRadius={42}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {inventoryStats.healthChartData.map(entry => (
                          <Cell
                            key={entry.key}
                            fill={entry.color}
                            style={{ cursor: 'pointer', outline: 'none' }}
                            onClick={() => navigate(`/inventory?status=${entry.filterParam}`)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val} SKUs (${Math.round((val / inventoryStats.total) * 100)}%)`, name]}
                        contentStyle={{
                          background: '#241820',
                          border: '1px solid #3D2835',
                          borderRadius: 6,
                          fontSize: 10.5,
                          color: '#FFFFFF',
                          padding: '5px 8px',
                        }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Readout */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text, lineHeight: 1 }}>{inventoryStats.healthyPct}%</div>
                    <div style={{ fontSize: 8.5, fontWeight: 600, color: C.muted, marginTop: 1 }}>Healthy</div>
                  </div>
                </div>

                {/* Compact Legend Rows on Right */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {inventoryStats.healthChartData.map(item => {
                    const share = Math.round((item.value / inventoryStats.total) * 100);
                    return (
                      <div
                        key={item.key}
                        onClick={() => navigate(`/inventory?status=${item.filterParam}`)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '3px 5px',
                          borderRadius: 5,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = C.hover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{item.value}</span>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 10,
                            background: item.bg,
                            color: item.color,
                          }}>
                            {share}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Arriving soon ── */}
      <Card>
        <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Arriving Soon / In Transit</div>
            <div style={{ fontSize: 10, color: C.subtle, marginTop: 2 }}>
              Orders currently staged, in transit, or docked at Site 1054 receiving bay.
            </div>
          </div>
          <LinkBtn onClick={() => navigate('/inventory?tab=incoming')}>
            Track deliveries <ArrowRight size={10} />
          </LinkBtn>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
                {['ORDER', 'GREEN', 'QUANTITY', 'SOURCE HUB', 'CARRIER / WAYBILL', 'LIFECYCLE STAGE', 'ACTION'].map(col => (
                  <th key={col} style={TH}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {arrivingOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: 'center', color: C.subtle, fontSize: 11 }}>
                    No shipments currently in transit.
                  </td>
                </tr>
              ) : (
                arrivingOrders.map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/orders/${row.id}`)}
                    style={{
                      borderBottom: i < arrivingOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: C.rose }}>{row.id}</span>
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 11, whiteSpace: 'nowrap' }}>
                      <strong style={{ color: C.plum }}>{row.greenId}</strong> · {row.greenName}
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                      {row.quantityStr || `${row.orderQuantity} kg`}
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>
                      {row.warehouse || 'Warehouse 1055'}
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                      {row.carrierName || 'GreenFreight Express'} {row.trackingNumber ? `(${row.trackingNumber})` : ''}
                    </td>
                    <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                      <DynamicStatusBadge status={row.status} />
                    </td>
                    <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                      {row.status === 'delivered' ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#15803D', background: '#F0FDF4', padding: '2px 8px', borderRadius: 4, border: '1px solid #BBF7D0' }}>
                          Inspect & Receive
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: C.subtle }}>In progress</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
