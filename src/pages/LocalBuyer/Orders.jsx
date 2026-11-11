import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Truck, RefreshCw } from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
import OrderLifecycleStepper from '../../components/ui/OrderLifecycleStepper';
import { useOrders, getOrderStatusMeta, ORDER_LIFECYCLE } from '../../context/OrdersContext';

// ── Color tokens ─────────────────────────────────────────────────────────────
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
  success:   '#1E8A3C',
  warn:      '#B86A00',
  crit:      '#D83040',
};

// ── Status Badge Component ───────────────────────────────────────────────────
function QueueStatusBadge({ status }) {
  const meta = getOrderStatusMeta(status);
  return (
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
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dotBg }} />
      {meta.label}
    </span>
  );
}

// ── Main Orders Page Component ────────────────────────────────────────────────
export default function Orders() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const {
    orders,
    buyerApprove,
    buyerRequestTransfer,
    systemDeliver,
    buyerReceive,
    buyerClose,
    resetOrders,
  } = useOrders();

  // Filter orders for active site (Site 1054)
  const siteOrders = useMemo(() => {
    return orders.filter(o => o.siteId === '1054');
  }, [orders]);

  // Selected order state
  const initialOrderId = paramId || (siteOrders[0]?.id || 'PO-2846');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Status Filter Tabs
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency');
  const [sourcingSort, setSourcingSort] = useState('cost');

  // History modal toggle
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const triggerNotice = (msg, variant = 'success') => {
    setActionNotice({ msg, variant });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Status tab counts
  const statusCounts = useMemo(() => {
    const counts = { all: siteOrders.length };
    ORDER_LIFECYCLE.forEach(s => {
      counts[s] = siteOrders.filter(o => o.status === s).length;
    });
    return counts;
  }, [siteOrders]);

  // Filtered orders for queue
  const filteredOrders = useMemo(() => {
    return siteOrders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.greenId.toLowerCase().includes(q) ||
          order.greenName.toLowerCase().includes(q) ||
          order.fgMaterialDescription?.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency') return (a.urgencyRank || 99) - (b.urgencyRank || 99);
      if (sortBy === 'needBy') return a.needBy.localeCompare(b.needBy);
      return a.id.localeCompare(b.id);
    });
  }, [siteOrders, statusFilter, searchQuery, sortBy]);

  // Current selected order
  const currentOrder = useMemo(() => {
    return siteOrders.find(o => o.id === selectedOrderId) || siteOrders[0] || {};
  }, [siteOrders, selectedOrderId]);

  // Sourcing options
  const sortedOptions = useMemo(() => {
    if (!currentOrder.options || currentOrder.options.length === 0) return [];
    return [...currentOrder.options].sort((a, b) => {
      if (sourcingSort === 'cost') {
        const costA = parseInt(String(a.totalPrice || '').replace(/[^0-9]/g, ''), 10) || 0;
        const costB = parseInt(String(b.totalPrice || '').replace(/[^0-9]/g, ''), 10) || 0;
        return costA - costB;
      }
      if (sourcingSort === 'eta') {
        return String(a.eta || '').localeCompare(String(b.eta || ''));
      }
      return 0;
    });
  }, [currentOrder, sourcingSort]);

  // Currently chosen fulfillment option inside the selected order
  const currentOption = useMemo(() => {
    if (sortedOptions.length === 0) return null;
    return sortedOptions[selectedOptionIndex] || sortedOptions[0];
  }, [sortedOptions, selectedOptionIndex]);

  // Handle order selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setSelectedOptionIndex(0);
  };

  // Actions for Local Buyer
  const handleBuyerApprove = () => {
    buyerApprove(currentOrder.id, currentOption);
    triggerNotice(`Order ${currentOrder.id} approved by Local Buyer.`);
  };

  const handleBuyerRequest = () => {
    buyerRequestTransfer(currentOrder.id, currentOption);
    triggerNotice(`Transfer request submitted to Central Warehouse Manager for ${currentOrder.id}.`);
  };

  const handleSimulateDelivery = () => {
    systemDeliver(currentOrder.id);
    triggerNotice(`Carrier arrived at Site 1054 dock for ${currentOrder.id}.`);
  };

  const handleBuyerReceive = () => {
    buyerReceive(currentOrder.id, { notes: 'Bags inspected at dock, moisture 10.8% OK.' });
    triggerNotice(`Order ${currentOrder.id} marked received & inspected at dock.`);
  };

  const handleBuyerClose = () => {
    buyerClose(currentOrder.id);
    triggerNotice(`Order ${currentOrder.id} closed and booked into available inventory.`);
  };

  const handleProceedToConfirm = () => {
    if (!currentOption) return;
    navigate('/confirm-order', {
      state: {
        order: currentOrder,
        option: {
          greenName: currentOption.optionName,
          source: currentOption.tag,
          arrivalDate: currentOption.eta,
          totalDelivered: parseInt(String(currentOption.totalPrice).replace(/[^0-9]/g, '')),
          isAlternate: currentOption.tag?.includes('ALTERNATE'),
          costBreakdown: currentOption.breakdown,
        },
      },
    });
  };

  const currentMeta = getOrderStatusMeta(currentOrder.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1360, margin: '0 auto' }}>

      {/* Top Flash Notice */}
      {actionNotice && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: actionNotice.variant === 'crit' ? '#FEF0F2' : actionNotice.variant === 'warn' ? '#FFF7E6' : '#EDF7F1',
          color: actionNotice.variant === 'crit' ? '#D83040' : actionNotice.variant === 'warn' ? '#B86A00' : '#1E8A3C',
          border: `1px solid ${actionNotice.variant === 'crit' ? '#F5B8C0' : actionNotice.variant === 'warn' ? '#F5D68A' : '#B4DDBD'}`,
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{actionNotice.msg}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Header Section ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Orders
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.4 }}>
              Site 1054 Plano Roasting · Manage the 9 order lifecycle stages from new demand to dock receiving and stock closure.
            </p>
          </div>

          <button
            onClick={resetOrders}
            title="Reset demo data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: '#FFFFFF',
              color: C.muted,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            Reset Orders
          </button>
        </div>

        {/* ── Status Lifecycle Filter Pills ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: statusFilter === 'all' ? 700 : 500,
              background: statusFilter === 'all' ? '#30272B' : '#FFFFFF',
              color: statusFilter === 'all' ? '#FFFFFF' : C.text,
              border: `1px solid ${statusFilter === 'all' ? '#30272B' : C.border}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.12s ease',
            }}
          >
            <span>All Orders</span>
            <span style={{
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 10,
              background: statusFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#F0EAEE',
            }}>
              {statusCounts.all}
            </span>
          </button>

          {ORDER_LIFECYCLE.map(statusKey => {
            const meta = getOrderStatusMeta(statusKey);
            const isActive = statusFilter === statusKey;
            const count = statusCounts[statusKey] || 0;
            return (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? meta.color : meta.bg,
                  color: isActive ? '#FFFFFF' : meta.color,
                  border: `1px solid ${isActive ? meta.color : meta.border}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: isActive ? '#FFFFFF' : meta.dotBg,
                }} />
                <span style={{ textTransform: 'capitalize' }}>{statusKey}</span>
                <span style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : meta.color,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, alignItems: 'start' }}>

        {/* ── LEFT COLUMN: Order Queue ── */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Queue Header */}
          <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.divider}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Order queue</div>
                <div style={{ fontSize: 10, color: C.subtle, marginTop: 1 }}>
                  {filteredOrders.length} shown · Site 1054
                </div>
              </div>

              {/* Sort selector */}
              <ThemedSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'urgency', label: 'Urgency' },
                  { value: 'needBy', label: 'Need-by' },
                  { value: 'id', label: 'Order ID' },
                ]}
                prefix="Sort: "
                size="sm"
                align="right"
              />
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search order ID or green"
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 28px',
                  fontSize: 11,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  outline: 'none',
                  color: C.text,
                  background: '#FAF8F9',
                }}
              />
            </div>
          </div>

          {/* Queue Order List */}
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: C.subtle, fontSize: 11 }}>
                No orders found for this status.
              </div>
            ) : (
              filteredOrders.map((order, idx) => {
                const isSelected = order.id === selectedOrderId;
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order.id)}
                    style={{
                      padding: '10px 14px',
                      borderBottom: idx < filteredOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                      background: isSelected ? '#FAF5F7' : '#FFFFFF',
                      borderLeft: isSelected ? `3px solid ${C.rose}` : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = C.hover;
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    {/* Top Line: Order ID & Diamond Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                        {order.id}
                      </span>
                      <span style={{ fontSize: 10, color: C.subtle, fontWeight: 500 }}>
                        {order.quantityStr || `${order.orderQuantity} kg`}
                      </span>
                    </div>

                    {/* Middle Line: Green ID and Name */}
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: C.text, marginRight: 6 }}>{order.greenId}</span>
                      <span>{order.greenName}</span>
                    </div>

                    {/* Bottom Line: Need By date & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: C.subtle }}>
                        Need by {order.needBy}
                      </span>
                      <QueueStatusBadge status={order.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Queue Footer */}
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.divider}`, background: '#FAF8F9' }}>
            <span style={{ fontSize: 9, color: C.subtle, fontStyle: 'italic' }}>
              Select an order to inspect lifecycle and trigger buyer transitions.
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Order Details & Actions Panel ── */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>

          {/* Section 1: Order Details Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>
                  ORDER DETAILS · SITE 1054
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>
                  {currentOrder.id}
                </div>
              </div>
              <QueueStatusBadge status={currentOrder.status} />
            </div>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
              {currentOrder.fgMaterialDescription} · {currentOrder.brand} ({currentOrder.brandType})
            </div>

            {/* ── 9-STEP ORDER LIFECYCLE STEPPER ── */}
            <div style={{
              padding: '12px 14px',
              background: '#FAF8F9',
              borderRadius: 8,
              border: `1px solid ${C.divider}`,
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.plum, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                Order Lifecycle (9 Stages)
              </div>
              <OrderLifecycleStepper status={currentOrder.status} />
            </div>

            {/* 4 Metadata Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              padding: '12px 14px',
              background: '#FAF8F9',
              borderRadius: 8,
              border: `1px solid ${C.divider}`,
            }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  GREEN MATERIAL
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.greenId}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>{currentOrder.greenName}</div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  ORDER QUANTITY
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.quantityStr || `${currentOrder.orderQuantity} kg`}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>Unit: kg</div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  NEED-BY DATE
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.needByFull || currentOrder.needBy}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>Roasting schedule</div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  ASSIGNED HUB / ROUTE
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.warehouse || 'Warehouse 1055'}
                </div>
                <div style={{ fontSize: 10, color: '#1E8A3C', fontWeight: 600 }}>
                  ${currentOrder.shippingCost || 589} freight (Lowest cost)
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cascade or Current Sourcing Status */}
          {currentOrder.cascade && currentOrder.cascade.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
                HOW THE SOURCING CASCADE RAN
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 6 }}>
                {currentOrder.cascade.map((step, sIdx) => {
                  const isSuccess = step.status === 'pass';
                  const isFail = step.status === 'fail';
                  return (
                    <div
                      key={sIdx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: isSuccess ? '1px solid #B4DDBD' : `1px solid ${C.border}`,
                        background: isSuccess ? '#F4FBF0' : '#FFFFFF',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                        {step.step}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: isSuccess ? '#1E8A3C' : (isFail ? '#D83040' : C.subtle),
                        fontWeight: isSuccess ? 600 : 400,
                      }}>
                        {step.note}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentOrder.cascadeNote && (
                <div style={{ fontSize: 10, color: C.subtle, fontStyle: 'italic', lineHeight: 1.4 }}>
                  {currentOrder.cascadeNote}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Sourcing Options OR Active Lifecycle Progress Status */}
          {currentOrder.options && currentOrder.options.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 14, alignItems: 'start' }}>

              {/* Left Inner: Sourcing options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      Available sourcing options
                    </div>
                    <div style={{ fontSize: 10, color: C.subtle }}>
                      {currentOrder.options.length} feasible option{currentOrder.options.length > 1 ? 's' : ''} · full quantity covered
                    </div>
                  </div>

                  <ThemedSelect
                    value={sourcingSort}
                    onChange={val => {
                      setSourcingSort(val);
                      setSelectedOptionIndex(0);
                    }}
                    options={[
                      { value: 'cost', label: 'Lowest total cost' },
                      { value: 'eta', label: 'Earliest arrival' },
                    ]}
                    prefix="Sort: "
                    size="sm"
                    align="right"
                  />
                </div>

                {sortedOptions.map((opt, oIdx) => {
                  const isOptSelected = selectedOptionIndex === oIdx;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionIndex(oIdx)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: isOptSelected ? '1.5px solid #27A348' : `1px solid ${C.border}`,
                        borderLeft: isOptSelected ? '4px solid #27A348' : `1px solid ${C.border}`,
                        background: isOptSelected ? '#FBFCFA' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#27A348', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                          {opt.tag}
                        </span>
                        {opt.bestValue && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: '#EDF7F1',
                            color: '#1E8A3C',
                            border: '1px solid #B4DDBD',
                          }}>
                            BEST VALUE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 1 }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: 10, color: C.subtle, marginBottom: 8 }}>
                        {opt.subtitle}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{opt.totalPrice}</span>
                          <span style={{ fontSize: 10, color: C.subtle, marginLeft: 4 }}>({opt.perKg})</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#1E8A3C' }}>{opt.eta}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Inner: Selected Option Summary Card */}
              {currentOption && (
                <div style={{
                  background: '#FFFFFF',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 1px 2px rgba(59,45,52,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                      Selected Option
                    </span>
                    <span style={{
                      fontSize: 8,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 10,
                      background: '#EDF7F1',
                      color: '#1E8A3C',
                    }}>
                      RECOMMENDED
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                      {currentOption.optionName}
                    </div>
                    <div style={{ fontSize: 10, color: C.subtle }}>
                      {currentOption.optionSub}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0', borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
                    {currentOption.breakdown?.map((row, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                        <span style={{ color: C.muted }}>{row.label}</span>
                        <span style={{ fontWeight: 600, color: C.text }}>{row.val}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      TOTAL DELIVERED COST
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.1, marginTop: 2 }}>
                      {currentOption.totalDelivered}
                    </div>
                    <div style={{ fontSize: 10, color: C.subtle, marginTop: 1 }}>
                      {currentOption.totalPerKg}
                    </div>
                  </div>

                  <div style={{
                    padding: '5px',
                    borderRadius: 4,
                    background: '#EDF7F1',
                    color: '#1E8A3C',
                    fontSize: 10,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    {currentOption.savingsTag}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Lifecycle Status / Tracking Info for In-Flight Orders */
            <div style={{
              background: '#FAF8F9',
              border: `1px solid ${C.divider}`,
              borderRadius: 8,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={18} style={{ color: currentMeta.color }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      Fulfillment & Execution Status
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      Current State: <strong>{currentMeta.label}</strong> (Actor: {currentMeta.actor})
                    </div>
                  </div>
                </div>
                <QueueStatusBadge status={currentOrder.status} />
              </div>

              <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5, background: '#FFFFFF', padding: '10px 12px', borderRadius: 6, border: `1px solid ${C.border}` }}>
                {currentOrder.notes || currentMeta.desc}
              </div>

              {currentOrder.carrierName && (
                <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                  <div>
                    <span style={{ color: C.subtle }}>Carrier: </span>
                    <strong style={{ color: C.text }}>{currentOrder.carrierName}</strong>
                  </div>
                  {currentOrder.trackingNumber && (
                    <div>
                      <span style={{ color: C.subtle }}>Tracking: </span>
                      <strong style={{ color: C.rose, fontFamily: 'monospace' }}>{currentOrder.trackingNumber}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 4: Contextual Local Buyer Action Bar */}
          <div style={{
            borderTop: `1px solid ${C.divider}`,
            paddingTop: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setShowHistoryModal(true)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: '#FFFFFF',
                  color: C.text,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Audit Trail
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                {/* 1. If Status is 'new' */}
                {currentOrder.status === 'new' && (
                  <>
                    <button
                      onClick={handleBuyerApprove}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        background: '#FFFFFF',
                        color: C.text,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Approve Sourcing Option
                    </button>
                    <button
                      disabled={!currentOption}
                      onClick={handleProceedToConfirm}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 6,
                        border: 'none',
                        background: C.rose,
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: currentOption ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Proceed to Confirm
                    </button>
                  </>
                )}

                {/* 2. If Status is 'approved' */}
                {currentOrder.status === 'approved' && (
                  <button
                    onClick={handleBuyerRequest}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#D97706',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Submit Transfer Request to Central Hub
                  </button>
                )}

                {/* 3. If Status is 'requested' */}
                {currentOrder.status === 'requested' && (
                  <span style={{ fontSize: 11, color: '#B86A00', fontWeight: 600, padding: '6px 12px', background: '#FFF7E6', borderRadius: 6, border: '1px solid #F5D68A' }}>
                    ⏳ Awaiting Central Warehouse Manager Allocation
                  </span>
                )}

                {/* 4. If Status is 'accepted' */}
                {currentOrder.status === 'accepted' && (
                  <span style={{ fontSize: 11, color: '#1E8A3C', fontWeight: 600, padding: '6px 12px', background: '#EDF7F1', borderRadius: 6, border: '1px solid #B4DDBD' }}>
                    ✓ Accepted by Hub · Warehouse Staging & Dispatch in Progress
                  </span>
                )}

                {/* 5. If Status is 'dispatched' */}
                {currentOrder.status === 'dispatched' && (
                  <span style={{ fontSize: 11, color: '#4F46E5', fontWeight: 600, padding: '6px 12px', background: '#EEF2FF', borderRadius: 6, border: '1px solid #C7D2FE' }}>
                    📦 Dispatched from Warehouse · Ready for Carrier Handoff
                  </span>
                )}

                {/* 6. If Status is 'in transit' */}
                {currentOrder.status === 'in transit' && (
                  <button
                    onClick={handleSimulateDelivery}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 6,
                      border: '1px solid #0D9488',
                      background: '#F0FDFA',
                      color: '#0D9488',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Simulate Carrier Arrival at Dock
                  </button>
                )}

                {/* 7. If Status is 'delivered' - Local Buyer Receives */}
                {currentOrder.status === 'delivered' && (
                  <button
                    onClick={handleBuyerReceive}
                    style={{
                      padding: '8px 22px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#15803D',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(21,128,61,0.3)',
                    }}
                  >
                    Inspect & Mark Received at Dock
                  </button>
                )}

                {/* 8. If Status is 'received' - Local Buyer Closes */}
                {currentOrder.status === 'received' && (
                  <button
                    onClick={handleBuyerClose}
                    style={{
                      padding: '8px 22px',
                      borderRadius: 6,
                      border: 'none',
                      background: C.plum,
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(92,58,87,0.3)',
                    }}
                  >
                    Close Order & Book into Stock
                  </button>
                )}

                {/* 9. If Status is 'closed' */}
                {currentOrder.status === 'closed' && (
                  <span style={{ fontSize: 11, color: '#15803D', fontWeight: 700, padding: '6px 12px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                    ✓ Order Reconciled & Booked to Inventory
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Order History / Audit Trail Modal ── */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 20, 24, 0.45)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
        }}
        onClick={() => setShowHistoryModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              width: 520,
              maxWidth: '90vw',
              padding: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Order Audit Trail · {currentOrder.id}</div>
                <div style={{ fontSize: 10, color: C.subtle }}>Logged transitions across the 9 order lifecycle stages</div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: C.subtle }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {(currentOrder.timeline || []).map((log, lIdx) => (
                <div key={lIdx} style={{ display: 'flex', gap: 10, fontSize: 11, padding: '8px 0', borderBottom: `1px solid ${C.divider}` }}>
                  <div style={{ width: 100, color: C.subtle, whiteSpace: 'nowrap', fontSize: 10 }}>{log.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: C.text }}>{log.title}</div>
                    {log.actor && <div style={{ fontSize: 9, color: C.rose, marginTop: 1 }}>Actor: {log.actor}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
