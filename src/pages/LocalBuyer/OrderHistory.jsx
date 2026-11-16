import { useState, useMemo } from 'react';
import {
  History,
  Search,
  Clock,
} from 'lucide-react';
import { useOrders, getOrderStatusMeta, ORDER_LIFECYCLE } from '../../context/OrdersContext';
import OrderLifecycleStepper from '../../components/ui/OrderLifecycleStepper';

const C = {
  bg: '#FDFBFD',
  card: '#FFFFFF',
  text: '#1F171B',
  muted: '#71656B',
  subtle: '#A0949B',
  border: '#EDE5EA',
  divider: '#F5EFF3',
  plum: '#30272B',
  rose: '#D83F79',
  hover: '#FAF5F8',
};

export default function OrderHistory() {
  const { orders } = useOrders();

  // Filters
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // 'all' | 'PRODUCTION' | 'REPLENISHMENT'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  // Filter orders for active site (Site 1054)
  const siteOrders = useMemo(() => {
    return (orders || []).filter(o => o.siteId === '1054');
  }, [orders]);

  // Counts
  const stats = useMemo(() => {
    const total = siteOrders.length;
    const production = siteOrders.filter(o => (o.orderType || 'PRODUCTION') === 'PRODUCTION').length;
    const replenishment = siteOrders.filter(o => o.orderType === 'REPLENISHMENT').length;
    const closed = siteOrders.filter(o => o.status === 'closed' || o.status === 'received').length;
    const inTransit = siteOrders.filter(o => o.status === 'in transit' || o.status === 'dispatched').length;
    return { total, production, replenishment, closed, inTransit };
  }, [siteOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return siteOrders.filter(order => {
      // Type filter
      if (orderTypeFilter !== 'all') {
        const type = order.orderType || 'PRODUCTION';
        if (type !== orderTypeFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (order.id || '').toLowerCase().includes(q);
        const matchesGreen = (order.greenName || '').toLowerCase().includes(q) || (order.greenId || '').toLowerCase().includes(q);
        const matchesFg = (order.fgMaterialDescription || '').toLowerCase().includes(q);
        const matchesShipment = (order.shipmentId || '').toLowerCase().includes(q);
        const matchesBrand = (order.brand || '').toLowerCase().includes(q);
        if (!matchesId && !matchesGreen && !matchesFg && !matchesShipment && !matchesBrand) {
          return false;
        }
      }

      return true;
    });
  }, [siteOrders, orderTypeFilter, statusFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1440, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#30272B',
              color: '#FFFFFF',
            }}>
              <History size={16} />
            </span>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
                Order History & Audit Trail
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>
                Chronological record of production fulfillment transfers and site safety threshold replenishment orders.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6,
            background: '#FAF0F5',
            color: C.rose,
            border: '1px solid #F3D2E2',
          }}>
            Site 1054 · Plano Roasting
          </span>
        </div>
      </div>

      {/* ── Key Metrics Overview Deck ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Orders Logged
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 4 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Production + Replenishment
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Production Roasting
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>
            {stats.production}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Finished Goods Demand
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Safety Replenishments
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
            {stats.replenishment}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Restocked Green Thresholds
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active In Transit
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706', marginTop: 4 }}>
            {stats.inTransit}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Warehouse Hub Dispatches
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B46C1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Received & Closed
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#6B46C1', marginTop: 4 }}>
            {stats.closed}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Booked into Local Stock
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>

          {/* Primary Order Type Switcher */}
          <div style={{ display: 'flex', gap: 6, background: '#F8F4F6', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setOrderTypeFilter('all')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: orderTypeFilter === 'all' ? 700 : 500,
                background: orderTypeFilter === 'all' ? '#30272B' : 'transparent',
                color: orderTypeFilter === 'all' ? '#FFFFFF' : C.muted,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              All Types ({stats.total})
            </button>
            <button
              onClick={() => setOrderTypeFilter('PRODUCTION')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: orderTypeFilter === 'PRODUCTION' ? 700 : 500,
                background: orderTypeFilter === 'PRODUCTION' ? '#30272B' : 'transparent',
                color: orderTypeFilter === 'PRODUCTION' ? '#FFFFFF' : C.muted,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              Production Demand ({stats.production})
            </button>
            <button
              onClick={() => setOrderTypeFilter('REPLENISHMENT')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: orderTypeFilter === 'REPLENISHMENT' ? 700 : 500,
                background: orderTypeFilter === 'REPLENISHMENT' ? '#30272B' : 'transparent',
                color: orderTypeFilter === 'REPLENISHMENT' ? '#FFFFFF' : C.muted,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              Safety Replenishments ({stats.replenishment})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by order #, green bean, or shipment..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: 11,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                outline: 'none',
                color: C.text,
                background: '#FFFFFF',
              }}
            />
          </div>
        </div>

        {/* Status Lifecycle Pills */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', paddingTop: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', marginRight: 4 }}>
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              fontSize: 10.5,
              fontWeight: statusFilter === 'all' ? 700 : 500,
              background: statusFilter === 'all' ? '#30272B' : '#FFFFFF',
              color: statusFilter === 'all' ? '#FFFFFF' : C.text,
              border: `1px solid ${statusFilter === 'all' ? '#30272B' : C.border}`,
              cursor: 'pointer',
            }}
          >
            All ({siteOrders.length})
          </button>
          {ORDER_LIFECYCLE.map(statusKey => {
            const meta = getOrderStatusMeta(statusKey);
            const count = siteOrders.filter(o => o.status === statusKey).length;
            const isActive = statusFilter === statusKey;
            return (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 10.5,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? meta.color : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : C.text,
                  border: `1px solid ${isActive ? meta.color : C.border}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textTransform: 'capitalize',
                }}
              >
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: isActive ? '#FFFFFF' : meta.dotBg,
                }} />
                {statusKey}
                <span style={{ fontSize: 9.5, opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Master Orders History Table ── */}
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(48,39,43,0.04)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF8F9', borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                Order #
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                Order Type
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                Green Material
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', textAlign: 'right' }}>
                Quantity
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                Optimal Sourcing Mode
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                Linked Shipment
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', textAlign: 'right' }}>
                Landed Cost
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', textAlign: 'center' }}>
                Lifecycle Status
              </th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', textAlign: 'center' }}>
                Audit Stepper
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 36, textAlign: 'center', color: C.muted, fontSize: 12 }}>
                  No orders match the selected filters or search query.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord, idx) => {
                const meta = getOrderStatusMeta(ord.status);
                const isReplenish = ord.orderType === 'REPLENISHMENT';

                return (
                  <tr
                    key={ord.id}
                    style={{
                      borderBottom: idx < filteredOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    {/* Column 1: Order Number */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.plum }}>
                        {ord.id}
                      </span>
                    </td>

                    {/* Column 2: Order Type */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      {isReplenish ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: '#EDF7F1',
                          color: '#16A34A',
                          border: '1px solid #B4DDBD',
                        }}>
                          SAFETY REPLENISHMENT
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: '#F0F9FF',
                          color: '#0284C7',
                          border: '1px solid #BAE6FD',
                        }}>
                          PRODUCTION DEMAND
                        </span>
                      )}
                    </td>

                    {/* Green Material */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.plum }}>
                        {ord.greenId}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>
                        {ord.greenName}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                        {(ord.orderQuantity || 0).toLocaleString()} kg
                      </span>
                    </td>

                    {/* Sourcing Source */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
                        {ord.isLocalFulfilled
                          ? 'Local Inventory (Site 1054)'
                          : (ord.selectedOption?.sourceName || (ord.options && ord.options[0]?.sourceName) || ord.warehouse || 'Warehouse 1055')}
                      </div>
                      <div style={{ fontSize: 10, color: ord.isLocalFulfilled ? '#16A34A' : C.plum, fontWeight: 600 }}>
                        {ord.isLocalFulfilled ? '$0 Freight' : `$${ord.shippingCost || 589} Fixed Freight`}
                      </div>
                    </td>

                    {/* Linked Shipment */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      {ord.shipmentId ? (
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.rose }}>
                            {ord.shipmentId}
                          </span>
                          <div style={{ fontSize: 10, color: C.muted }}>
                            ETA: {ord.needBy || 'Scheduled'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: C.subtle }}>
                          {ord.isLocalFulfilled ? 'Local Pull (No Shipment)' : 'Pending Dispatch'}
                        </span>
                      )}
                    </td>

                    {/* Landed Cost */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.plum }}>
                        ${(ord.totalDelivered || (ord.orderQuantity * (ord.unitPrice || 4.10))).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9.5, color: C.muted }}>
                        ${(ord.unitPrice || 4.10).toFixed(2)}/kg
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        textTransform: 'capitalize',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dotBg }} />
                        {meta.label}
                      </span>
                    </td>

                    {/* Audit Stepper Button */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedOrderForModal(ord)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 600,
                          background: '#F8F4F6',
                          color: C.plum,
                          border: `1px solid ${C.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <Clock size={11} />
                        View Timeline
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Order Status History Modal ── */}
      {selectedOrderForModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(31,23,27,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}
        onClick={() => setSelectedOrderForModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 24,
              maxWidth: 620,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                    {selectedOrderForModal.id}
                  </span>
                  {selectedOrderForModal.orderType === 'REPLENISHMENT' ? (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#EDF7F1', color: '#16A34A', border: '1px solid #B4DDBD' }}>
                      THRESHOLD REPLENISHMENT
                    </span>
                  ) : (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                      PRODUCTION FULFILLMENT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {selectedOrderForModal.greenName} ({selectedOrderForModal.greenId}) · {(selectedOrderForModal.orderQuantity || 0).toLocaleString()} kg
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: C.subtle }}
              >
                ✕
              </button>
            </div>

            {/* Stepper Component */}
            <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Full Canonical 9-Stage Lifecycle Stepper
              </div>
              <OrderLifecycleStepper
                status={selectedOrderForModal.status}
                timeline={selectedOrderForModal.timeline}
                isLocalFulfilled={selectedOrderForModal.isLocalFulfilled}
              />
            </div>

            {/* Historical Audit Trail List */}
            <div style={{ marginTop: 20, borderTop: `1px solid ${C.divider}`, paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Status Transition Audit Trail (Fact_Table_Order_Status_History)
              </div>
              <OrderLifecycleStepper
                status={selectedOrderForModal.status}
                orientation="vertical"
                timeline={selectedOrderForModal.timeline}
                isLocalFulfilled={selectedOrderForModal.isLocalFulfilled}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: '#FFFFFF',
                  color: C.text,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Trail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
