import { useState, useMemo } from 'react';
import {
  History,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useOrders, getOrderStatusMeta, ORDER_LIFECYCLE } from '../../context/OrdersContext';
import OrderLifecycleStepper from '../../components/ui/OrderLifecycleStepper';

const C = {
  bg: '#FDFBFD',
  card: '#FFFFFF',
  text: '#1F171B',
  muted: '#71656B',
  subtle: '#A0949B',
  border: '#E6DCE2',
  divider: '#F0EAEE',
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

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

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

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const safePage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  const handleTypeChange = (type) => {
    setOrderTypeFilter(type);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>

      {/* ── Page Header (aligned with Dashboard & Inventory) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Site 1054 Plano Roasting · Enterprise Audit Records
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#30272B',
              color: '#FFFFFF',
            }}>
              <History size={15} />
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
              Order History & Audit Trail
            </h1>
          </div>
          <p style={{ fontSize: 11.5, color: C.muted, margin: '4px 0 0' }}>
            Comprehensive chronological record of production fulfillment and site safety threshold replenishment orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            background: '#FAF0F5',
            color: C.rose,
            border: '1px solid #F3D2E2',
          }}>
            Site 1054 · Plano Roasting
          </span>
        </div>
      </div>

      {/* ── Key Metrics Overview Deck (Same card tokens as Dashboard) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(59,45,52,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Total Orders Logged
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 3 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Production + Replenishment
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(59,45,52,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Production Roasting
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0284C7', marginTop: 3 }}>
            {stats.production}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Finished Goods Demand
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(59,45,52,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Safety Replenishments
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16A34A', marginTop: 3 }}>
            {stats.replenishment}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Restocked Green Thresholds
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(59,45,52,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Active In Transit
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706', marginTop: 3 }}>
            {stats.inTransit}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Warehouse Hub Dispatches
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(59,45,52,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6B46C1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Received & Closed
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#6B46C1', marginTop: 3 }}>
            {stats.closed}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Booked into Local Stock
          </div>
        </div>
      </div>

      {/* ── Filters Bar (Same card tokens as Dashboard) ── */}
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>

          {/* Primary Order Type Switcher */}
          <div style={{ display: 'flex', gap: 6, background: '#F8F4F6', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => handleTypeChange('all')}
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
              onClick={() => handleTypeChange('PRODUCTION')}
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
              onClick={() => handleTypeChange('REPLENISHMENT')}
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
              onChange={e => handleSearchChange(e.target.value)}
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
            onClick={() => handleStatusChange('all')}
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
                onClick={() => handleStatusChange(statusKey)}
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

      {/* ── Master Orders History Table (Full page width) ── */}
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
        width: '100%',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FDFBFC', borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Order #
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Order Type
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Green Material
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase', textAlign: 'right' }}>
                Quantity
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Optimal Sourcing Mode
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Linked Shipment
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase', textAlign: 'right' }}>
                Landed Cost
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase', textAlign: 'center' }}>
                Lifecycle Status
              </th>
              <th style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: C.subtle, letterSpacing: '0.4px', textTransform: 'uppercase', textAlign: 'center' }}>
                Audit Stepper
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 36, textAlign: 'center', color: C.muted, fontSize: 12 }}>
                  No orders match the selected filters or search query.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((ord, idx) => {
                const meta = getOrderStatusMeta(ord.status);
                const isReplenish = ord.orderType === 'REPLENISHMENT';

                return (
                  <tr
                    key={ord.id}
                    style={{
                      borderBottom: idx < paginatedOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    {/* Column 1: Order Number */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.plum }}>
                        {ord.id}
                      </span>
                    </td>

                    {/* Column 2: Order Type */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      {isReplenish ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 600,
                          background: '#EDF7F1',
                          color: '#16A34A',
                          border: '1px solid #B4DDBD',
                        }}>
                          Replenishment
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 600,
                          background: '#F0F9FF',
                          color: '#0284C7',
                          border: '1px solid #BAE6FD',
                        }}>
                          Production
                        </span>
                      )}
                    </td>

                    {/* Column 3: Green Material */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {ord.greenName || '—'}
                      </div>
                      <div style={{ fontSize: 10.5, color: C.muted }}>
                        {ord.greenId || '—'}
                        {ord.fgMaterialDescription && ` · ${ord.fgMaterialDescription}`}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                        {ord.quantityStr || `${(ord.orderQuantity || 0).toLocaleString()} kg`}
                      </span>
                    </td>

                    {/* Sourcing Source */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {ord.isLocalFulfilled
                          ? 'Local Inventory (Site 1054)'
                          : (ord.selectedOption?.sourceName || (ord.options && ord.options[0]?.sourceName) || ord.warehouse || 'Warehouse 1055')}
                      </div>
                      <div style={{ fontSize: 10, color: ord.isLocalFulfilled ? '#16A34A' : C.plum, fontWeight: 600 }}>
                        {ord.isLocalFulfilled ? '$0 Freight' : `$${ord.shippingCost || 589} Fixed Freight`}
                      </div>
                    </td>

                    {/* Linked Shipment */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
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
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.plum }}>
                        ${(ord.totalDelivered || (ord.orderQuantity * (ord.unitPrice || 4.10))).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9.5, color: C.muted }}>
                        ${(ord.unitPrice || 4.10).toFixed(2)}/kg
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 600,
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
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedOrderForModal(ord)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 10.5,
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

        {/* Pagination Bar matching Inventory */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderTop: `1px solid ${C.divider}`,
          background: '#FAF8F9',
        }}>
          <span style={{ fontSize: 10.5, color: C.muted }}>
            Showing <strong>{filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> orders
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: page <= 1 ? C.subtle : C.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page <= 1 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft size={13} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const isActive = pageNum === page;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: 'none',
                    background: isActive ? C.plum : 'transparent',
                    color: isActive ? '#FFFFFF' : C.text,
                    fontSize: 10.5,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: page >= totalPages ? C.subtle : C.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page >= totalPages ? 'default' : 'pointer',
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Order Status History Modal (Spacious Full Page Modal) ── */}
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
              borderRadius: 10,
              padding: 24,
              maxWidth: 960,
              width: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                    {selectedOrderForModal.id}
                  </span>
                  {selectedOrderForModal.orderType === 'REPLENISHMENT' ? (
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#EDF7F1', color: '#16A34A', border: '1px solid #B4DDBD' }}>
                      THRESHOLD REPLENISHMENT
                    </span>
                  ) : (
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                      PRODUCTION FULFILLMENT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>
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

            {/* Stepper Component (Spacious horizontal lifecycle) */}
            <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>
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
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>
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
