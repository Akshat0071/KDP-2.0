import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Truck,
  RefreshCw,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Building2,
  Send,
  Boxes,
  Award,
  Layers,
  Check,
  Leaf,
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
import { useOrders, getOrderStatusMeta, ORDER_LIFECYCLE } from '../../context/OrdersContext';
import { findCheapestLocalOption, generateSourcingScenarios } from '../../data/localInventory';

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
    localInventory,
    awardWarehouseQuote,
    allocateLocalOption,
    approveSplitOrder,
    buyerRequestTransfer,
    systemDeliver,
    buyerReceive,
    buyerClose,
    createOrder,
    resetOrders,
  } = useOrders();

  // New Demand Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newGreenId, setNewGreenId] = useState('Gh-08');
  const [newOrderQty, setNewOrderQty] = useState('500');
  const [newNeedBy, setNewNeedBy] = useState('Nov 16');

  // Active Sourcing Scenario Tab (for evaluating new demand & RFQ quotes)
  const [activeScenarioTab, setActiveScenarioTab] = useState('scen-3-wh-same');

  const newOrderPreview = useMemo(() => {
    const qty = parseInt(newOrderQty, 10) || 0;
    return findCheapestLocalOption(newGreenId, qty, localInventory);
  }, [newGreenId, newOrderQty, localInventory]);

  // Filter orders for active site (Site 1054) - excludes closed orders so they only appear in Order History
  const siteOrders = useMemo(() => {
    return orders.filter(o => o.siteId === '1054' && o.status !== 'closed');
  }, [orders]);

  // Active queue statuses (closed orders are moved to Order History)
  const queueStatuses = useMemo(() => ORDER_LIFECYCLE.filter(s => s !== 'closed'), []);

  // Selected order state
  const cleanParamId = paramId ? paramId.replace(/^PO-?/i, '') : null;
  const initialOrderId = cleanParamId || (siteOrders[0]?.id || '2846');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Status Filter Tabs
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency');

  // History modal toggle
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const triggerNotice = (msg, variant = 'success') => {
    setActionNotice({ msg, variant });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Status tab counts (for active queue)
  const statusCounts = useMemo(() => {
    const counts = { all: siteOrders.length };
    queueStatuses.forEach(s => {
      counts[s] = siteOrders.filter(o => o.status === s).length;
    });
    return counts;
  }, [siteOrders, queueStatuses]);

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
        const qClean = q.replace(/^po-?/i, '');
        return (
          order.id.toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(qClean) ||
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
    const cleanSelected = String(selectedOrderId).replace(/^PO-?/i, '');
    return siteOrders.find(o => o.id === selectedOrderId || o.id === cleanSelected) || siteOrders[0] || {};
  }, [siteOrders, selectedOrderId]);

  // Multi-Scenario Generator for current selected order (evaluates all 5 sourcing scenarios & 3 warehouse quotes)
  const currentScenarios = useMemo(() => {
    if (!currentOrder || !currentOrder.greenId) return null;
    return generateSourcingScenarios(
      currentOrder.greenId,
      currentOrder.orderQuantity,
      localInventory,
      currentOrder.needByFull || currentOrder.needBy
    );
  }, [currentOrder, localInventory]);

  // Sourcing options
  const sortedOptions = useMemo(() => {
    if (!currentOrder.options || currentOrder.options.length === 0) return [];
    return [...currentOrder.options].sort((a, b) => {
      const costA = parseInt(String(a.totalPrice || '').replace(/[^0-9]/g, ''), 10) || 0;
      const costB = parseInt(String(b.totalPrice || '').replace(/[^0-9]/g, ''), 10) || 0;
      return costA - costB;
    });
  }, [currentOrder]);

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
  const handleAwardWarehouse = (quote) => {
    awardWarehouseQuote(currentOrder.id, quote);
    triggerNotice(`Order ${currentOrder.id}: Awarded transfer contract to ${quote.warehouseName} ($${quote.freightCost} freight · Landed $${quote.landedPerKg}/kg).`);
  };

  const handleAllocateLocal = (scenarioType = 'LOCAL_SAME', altGreenId = null) => {
    allocateLocalOption(currentOrder.id, scenarioType, altGreenId);
    triggerNotice(`Order ${currentOrder.id}: Allocated 100% on-site stock from Site 1054 ($0 freight).`);
  };

  const handleApproveSplit = (localQty, warehouseQty, quote) => {
    approveSplitOrder(currentOrder.id, { localQty, warehouseQty, quote });
    triggerNotice(`Order ${currentOrder.id}: Approved split sourcing (${localQty.toLocaleString()} kg on-site + ${warehouseQty.toLocaleString()} kg from ${quote.warehouseName}).`);
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
    triggerNotice(`Order ${currentOrder.id} closed and reconciled in Site 1054 inventory.`);
  };

  const handleCreateDemandOrder = (e) => {
    e.preventDefault();
    const qty = Math.max(50, parseInt(newOrderQty, 10) || 500);
    const invItem = localInventory.find(i => i.id === newGreenId);
    const created = createOrder({
      greenId: newGreenId,
      greenName: invItem?.name || newGreenId,
      orderQuantity: qty,
      unitPrice: invItem?.price || 4.10,
      needBy: newNeedBy || 'Nov 16',
    });
    setShowNewOrderModal(false);
    setStatusFilter('all');
    setSelectedOrderId(created.id);
    setSelectedOptionIndex(0);

    if (created.autoApproved) {
      triggerNotice(
        `Order ${created.id} auto-approved by system using cheapest local option (${created.allocatedGreenId} · ${created.allocatedGreenName}, $${created.unitPrice.toFixed(2)}/kg) — ${qty.toLocaleString()} kg deducted from inventory.`
      );
    } else {
      triggerNotice(
        `Order ${created.id} created as New Demand (local stock & alternates insufficient — Central Hub review required).`,
        'warn'
      );
    }
  };

  const handleProceedToConfirm = () => {
    if (!currentOption) return;
    navigate('/confirm-order', {
      state: {
        order: currentOrder,
        option: {
          id: currentOption.id,
          greenId: currentOption.greenId,
          greenName: currentOption.optionName,
          source: currentOption.tag,
          arrivalDate: currentOption.eta,
          totalDelivered: parseInt(String(currentOption.totalPrice).replace(/[^0-9]/g, '')),
          isAlternate: currentOption.tag?.includes('ALTERNATE') || Boolean(currentOption.isLocalFulfilled),
          isLocalFulfilled: Boolean(currentOption.isLocalFulfilled) || currentOption.tag?.includes('LOCAL'),
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowNewOrderModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: C.rose,
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              New Demand Order
            </button>

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

          {queueStatuses.map(statusKey => {
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

          <button
            onClick={() => navigate('/order-history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 11px',
              borderRadius: 20,
              fontSize: 10.5,
              fontWeight: 600,
              background: '#FAF5F8',
              color: C.rose,
              border: '1px solid #F3D2E2',
              cursor: 'pointer',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            Closed Orders in History →
          </button>
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

                    {/* Bottom Line: Need By date, Shipment badge & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: C.subtle }}>
                          Need by {order.needBy}
                        </span>
                        {order.shipmentId && (
                          <span style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: C.rose,
                            background: '#FAF2F6',
                            padding: '1px 5px',
                            borderRadius: 4,
                            border: '1px solid #F2D8E4',
                          }}>
                            {order.shipmentId}
                          </span>
                        )}
                        {order.isLocalFulfilled && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 600,
                            color: '#1E8A3C',
                            background: '#EDF7F1',
                            padding: '1px 5px',
                            borderRadius: 4,
                            border: '1px solid #B4DDBD',
                          }}>
                            Local Stock
                          </span>
                        )}
                      </div>
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
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* ── SECTION 1: HEADER & SPECIFICATION STRIP (Aligned with Dashboard & Inventory) ── */}
          <div style={{
            padding: '16px 20px 14px',
            borderBottom: `1px solid ${C.divider}`,
            background: '#FFFFFF',
          }}>
            {/* Top Row: Location & Status Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <Building2 size={12} style={{ color: C.rose }} />
                  Site 1054 · Plano Roasting
                </span>
              </div>

              {/* Status & Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {currentOrder.autoApproved && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    background: '#EDF7F1',
                    color: '#1E8A3C',
                    border: '1px solid #B4DDBD',
                  }}>
                    <Sparkles size={10} />
                    Auto-Approved
                  </span>
                )}
                {currentOrder.isLocalFulfilled && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    background: '#FAF5FF',
                    color: '#6B21A8',
                    border: '1px solid #E9D5FF',
                  }}>
                    <Boxes size={10} />
                    Local Inventory
                  </span>
                )}
                <QueueStatusBadge status={currentOrder.status} />
              </div>
            </div>

            {/* Main Order ID Title & Subtitle */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                {currentOrder.id}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>
                {currentOrder.orderType === 'REPLENISHMENT' ? (
                  <span style={{ fontWeight: 600, color: '#16A34A' }}>
                    Safety Threshold Replenishment · Raw Green Coffee Restock
                  </span>
                ) : (
                  <span>
                    <strong style={{ color: C.text, fontWeight: 600 }}>{currentOrder.fgMaterialDescription || 'Finished Goods Roasting Batch'}</strong>
                    {currentOrder.brand ? ` · ${currentOrder.brand}` : ''}
                    {currentOrder.brandType ? ` (${currentOrder.brandType})` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Minimalist Professional Specs Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              background: '#FAF8F9',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              padding: '10px 14px',
            }}>
              {/* Metric 1: Green Material */}
              <div style={{ paddingRight: 12, borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  Green Material
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentOrder.greenId} · {currentOrder.greenName}
                </div>
              </div>

              {/* Metric 2: Quantity */}
              <div style={{ padding: '0 12px', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  Order Quantity
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                  {currentOrder.quantityStr || `${(currentOrder.orderQuantity || 0).toLocaleString()} kg`}
                </div>
              </div>

              {/* Metric 3: Need-By Target */}
              <div style={{ padding: '0 12px', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  Need-By Date
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                  {currentOrder.needByFull || currentOrder.needBy || 'On Schedule'}
                </div>
              </div>

              {/* Metric 4: Shipment Ref */}
              <div style={{ paddingLeft: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  Shipment Tracking
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: currentOrder.shipmentId ? C.rose : C.subtle }}>
                  {currentOrder.isLocalFulfilled ? (
                    <span style={{ color: '#16A34A', fontSize: 12 }}>Internal Bay Pull</span>
                  ) : currentOrder.shipmentId ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/inventory?tab=incoming&shipment=${currentOrder.shipmentId}`)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.rose,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {currentOrder.shipmentId}
                      <ArrowRight size={10} />
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Pending Dispatch</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── BODY AREA: Padding 16px 20px, Gap 14 (Same as Dashboard & Inventory) ── */}
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>

            {/* ── SECTION 2: SOURCING SCENARIOS vs ACTIVE LIFECYCLE TRACKING ── */}
            {currentOrder.status === 'new' && currentScenarios ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* ── Top Sourcing Scenario Tabs ── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  borderBottom: `1px solid ${C.divider}`,
                }}>
                  {[
                    {
                      id: 'scen-3-wh-same',
                      label: 'Scenario 3: Warehouse Transfer (3 Hubs)',
                      short: 'Warehouse Same Green',
                      icon: <Truck size={13} />,
                      badge: '3 LIVE QUOTES',
                      badgeColor: '#1E8A3C',
                      badgeBg: '#EDF7F1',
                    },
                    {
                      id: 'scen-1-local-same',
                      label: 'Scenario 1: Same Site, Same Green',
                      short: 'Local Same Green',
                      icon: <Building2 size={13} />,
                      badge: currentScenarios.scenario1_LocalSame.feasible ? 'FEASIBLE' : 'SHORT',
                      badgeColor: currentScenarios.scenario1_LocalSame.feasible ? '#1E8A3C' : '#D83040',
                      badgeBg: currentScenarios.scenario1_LocalSame.feasible ? '#EDF7F1' : '#FEF0F2',
                    },
                    {
                      id: 'scen-2-local-alt',
                      label: 'Scenario 2: Same Site, Alternate Green',
                      short: 'Local Alternate',
                      icon: <Leaf size={13} />,
                      badge: currentScenarios.scenario2_LocalAlt.feasible ? 'APPROVED ALT' : 'UNAVAILABLE',
                      badgeColor: currentScenarios.scenario2_LocalAlt.feasible ? '#0284C7' : '#9CA3AF',
                      badgeBg: currentScenarios.scenario2_LocalAlt.feasible ? '#F0F9FF' : '#F3F4F6',
                    },
                    {
                      id: 'scen-4-wh-alt',
                      label: 'Scenario 4: Warehouse Alternate',
                      short: 'Warehouse Alternate',
                      icon: <Sparkles size={13} />,
                      badge: 'HUB TRANSFER',
                      badgeColor: '#6B46C1',
                      badgeBg: '#FAF5FF',
                    },
                    {
                      id: 'scen-5-split',
                      label: 'Scenario 5: Split Fulfillment',
                      short: 'Split Sourcing',
                      icon: <Layers size={13} />,
                      badge: currentScenarios.scenario5_Split.feasible ? 'HYBRID' : 'N/A',
                      badgeColor: currentScenarios.scenario5_Split.feasible ? '#B86A00' : '#9CA3AF',
                      badgeBg: currentScenarios.scenario5_Split.feasible ? '#FFF7E6' : '#F3F4F6',
                    },
                  ].map(tab => {
                    const isActive = activeScenarioTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveScenarioTab(tab.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 12px',
                          borderRadius: 6,
                          border: isActive ? `1.5px solid ${C.rose}` : `1px solid ${C.border}`,
                          background: isActive ? '#FAF2F6' : '#FFFFFF',
                          color: isActive ? C.rose : C.text,
                          fontSize: 11,
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {tab.icon}
                        <span>{tab.short}</span>
                        <span style={{
                          fontSize: 8.5,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 8,
                          background: tab.badgeBg,
                          color: tab.badgeColor,
                        }}>
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ── TAB CONTENT ── */}
                {/* 1. SCENARIO 3: WAREHOUSE TRANSFER (3-WAREHOUSE COMPETITIVE QUOTES) */}
                {activeScenarioTab === 'scen-3-wh-same' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                          Scenario 3: Central Warehouse Competitive Quotations (3 Hubs)
                        </div>
                        <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
                          3 warehouses submitted formal capability, freight rate, and ETA quotes for {(currentOrder.orderQuantity || 0).toLocaleString()} kg of {currentOrder.greenName}.
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: '#EDF7F1',
                        color: '#1E8A3C',
                        border: '1px solid #B4DDBD',
                      }}>
                        LOWEST FREIGHT RULE APPLIED
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {currentScenarios.scenario3_WarehouseSame.quotes.map(q => {
                        const isOptimal = q.isDesignated && q.capability === 'FULL';
                        const isDeclined = q.capability === 'CANNOT_SUPPLY';

                        return (
                          <div
                            key={q.id}
                            style={{
                              border: isOptimal ? '1.5px solid #16A34A' : `1px solid ${C.border}`,
                              borderRadius: 8,
                              padding: '14px',
                              background: isOptimal ? '#FCFDFC' : isDeclined ? '#FAF9FA' : '#FFFFFF',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isOptimal ? '0 2px 8px rgba(22,163,74,0.08)' : 'none',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                                  {q.warehouseName.split('(')[0].trim()}
                                </div>
                                <span style={{
                                  fontSize: 8.5,
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: 10,
                                  background: isOptimal ? '#EDF7F1' : isDeclined ? '#FEF0F2' : '#FFF7E6',
                                  color: isOptimal ? '#1E8A3C' : isDeclined ? '#D83040' : '#B86A00',
                                  border: `1px solid ${isOptimal ? '#B4DDBD' : isDeclined ? '#F5B8C0' : '#F5D68A'}`,
                                }}>
                                  {q.badge}
                                </span>
                              </div>

                              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
                                {q.location}
                              </div>

                              {/* Capability badge */}
                              <div style={{ marginBottom: 10 }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: q.capability === 'FULL' ? '#1E8A3C' : '#D83040',
                                }}>
                                  {q.capability === 'FULL' ? '✓ ' : '✕ '}
                                  {q.capabilityLabel}
                                </span>
                                <div style={{ fontSize: 9.5, color: C.subtle, marginTop: 2 }}>
                                  Unreserved buffer: {q.availableStock.toLocaleString()} kg
                                </div>
                              </div>

                              {/* Pricing breakdown */}
                              {!isDeclined ? (
                                <div style={{
                                  padding: '8px 0',
                                  borderTop: `1px solid ${C.divider}`,
                                  borderBottom: `1px solid ${C.divider}`,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 4,
                                  fontSize: 10.5,
                                  marginBottom: 8,
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: C.muted }}>Bean Cost:</span>
                                    <span style={{ fontWeight: 600, color: C.text }}>${((currentOrder.orderQuantity || 0) * q.unitPrice).toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: C.muted }}>Fixed Freight:</span>
                                    <span style={{ fontWeight: 600, color: C.text }}>${q.freightCost}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2, borderTop: `1px dashed ${C.divider}` }}>
                                    <span style={{ fontWeight: 700, color: C.text }}>Delivered Total:</span>
                                    <strong style={{ color: isOptimal ? '#1E8A3C' : C.text, fontSize: 13 }}>
                                      ${q.totalCost?.toLocaleString()}
                                    </strong>
                                  </div>
                                  <div style={{ fontSize: 9.5, color: C.muted, textAlign: 'right' }}>
                                    (${q.landedPerKg} / kg landed)
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  padding: '10px 8px',
                                  background: '#FEF0F2',
                                  borderRadius: 6,
                                  border: '1px solid #F5B8C0',
                                  fontSize: 10,
                                  color: '#D83040',
                                  marginBottom: 8,
                                  lineHeight: 1.4,
                                }}>
                                  {q.reason}
                                </div>
                              )}

                              {/* ETA */}
                              {!isDeclined && (
                                <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>
                                  <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                                  Delivery ETA: <strong style={{ color: C.text }}>{q.eta}</strong>
                                </div>
                              )}
                            </div>

                            {/* Action Button */}
                            {!isDeclined ? (
                              <button
                                type="button"
                                onClick={() => handleAwardWarehouse(q)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: isOptimal ? '#15803D' : C.plum,
                                  color: '#FFFFFF',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 5,
                                  boxShadow: isOptimal ? '0 2px 6px rgba(21,128,61,0.25)' : 'none',
                                  transition: 'all 0.12s ease',
                                }}
                              >
                                <Award size={12} />
                                Award Quote & Transfer
                              </button>
                            ) : (
                              <button
                                disabled
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 6,
                                  border: `1px solid ${C.border}`,
                                  background: '#F3F4F6',
                                  color: C.subtle,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'not-allowed',
                                }}
                              >
                                Quote Declined
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. SCENARIO 1: SAME SITE, SAME GREEN */}
                {activeScenarioTab === 'scen-1-local-same' && (
                  <div style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: '16px',
                    background: currentScenarios.scenario1_LocalSame.feasible ? '#FCFDFC' : '#FAF9FA',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                          Scenario 1: Same Site, Same Green Fulfillment
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {currentScenarios.scenario1_LocalSame.note}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: currentScenarios.scenario1_LocalSame.feasible ? '#EDF7F1' : '#FEF0F2',
                        color: currentScenarios.scenario1_LocalSame.feasible ? '#1E8A3C' : '#D83040',
                        border: `1px solid ${currentScenarios.scenario1_LocalSame.feasible ? '#B4DDBD' : '#F5B8C0'}`,
                      }}>
                        {currentScenarios.scenario1_LocalSame.badge}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      background: '#FFFFFF',
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      padding: '10px 14px',
                    }}>
                      <div>
                        <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase' }}>Site 1054 Stock</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                          {currentScenarios.scenario1_LocalSame.availableStock.toLocaleString()} kg
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase' }}>Order Demand</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                          {(currentOrder.orderQuantity || 0).toLocaleString()} kg
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase' }}>Freight Cost</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>$0 (Local Stock)</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase' }}>Total Delivered</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                          ${currentScenarios.scenario1_LocalSame.totalCost.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {currentScenarios.scenario1_LocalSame.feasible ? (
                      <button
                        type="button"
                        onClick={() => handleAllocateLocal('LOCAL_SAME')}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '8px 18px',
                          borderRadius: 6,
                          border: 'none',
                          background: '#15803D',
                          color: '#FFFFFF',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 6px rgba(21,128,61,0.25)',
                        }}
                      >
                        <Check size={13} />
                        Allocate On-Site Stock ($0 Freight)
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.muted }}>
                        <span style={{ color: C.crit, fontWeight: 600 }}>Insufficient stock on-site.</span>
                        <span>Consider switching to</span>
                        <button
                          type="button"
                          onClick={() => setActiveScenarioTab('scen-3-wh-same')}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            border: `1px solid ${C.border}`,
                            background: '#FFFFFF',
                            color: C.rose,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: 10.5,
                          }}
                        >
                          Scenario 3 (Warehouse Quoting)
                        </button>
                        <span>or</span>
                        <button
                          type="button"
                          onClick={() => setActiveScenarioTab('scen-5-split')}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            border: `1px solid ${C.border}`,
                            background: '#FFFFFF',
                            color: C.plum,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: 10.5,
                          }}
                        >
                          Scenario 5 (Split Sourcing)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SCENARIO 2: SAME SITE, ALTERNATE GREEN */}
                {activeScenarioTab === 'scen-2-local-alt' && (
                  <div style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: '16px',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                          Scenario 2: Same Site, Alternate Green Substitution
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {currentScenarios.scenario2_LocalAlt.note}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: currentScenarios.scenario2_LocalAlt.feasible ? '#F0F9FF' : '#F3F4F6',
                        color: currentScenarios.scenario2_LocalAlt.feasible ? '#0284C7' : '#9CA3AF',
                        border: `1px solid ${currentScenarios.scenario2_LocalAlt.feasible ? '#BAE6FD' : '#E5E7EB'}`,
                      }}>
                        {currentScenarios.scenario2_LocalAlt.badge}
                      </span>
                    </div>

                    {currentScenarios.scenario2_LocalAlt.candidates?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {currentScenarios.scenario2_LocalAlt.candidates.map(cand => (
                          <div
                            key={cand.greenId}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              borderRadius: 6,
                              border: `1px solid ${C.border}`,
                              background: cand.feasible ? '#FCFDFC' : '#FAF9FA',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                                {cand.greenId} · {cand.greenName}
                              </div>
                              <div style={{ fontSize: 10.5, color: C.muted }}>
                                Available: {cand.available.toLocaleString()} kg · Unit Price: ${cand.unitPrice.toFixed(2)}/kg · $0 Freight
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                                  ${cand.totalCost.toLocaleString()}
                                </div>
                                <div style={{ fontSize: 9.5, color: '#16A34A', fontWeight: 600 }}>$0 Shipping</div>
                              </div>
                              {cand.feasible ? (
                                <button
                                  type="button"
                                  onClick={() => handleAllocateLocal('LOCAL_ALT', cand.greenId)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#0284C7',
                                    color: '#FFFFFF',
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Allocate Alternate
                                </button>
                              ) : (
                                <span style={{ fontSize: 10, color: C.crit, fontWeight: 600 }}>Insufficient Stock</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: C.muted }}>
                        No approved alternates mapped in recipe dimension table for {currentOrder.greenName}.
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SCENARIO 4: WAREHOUSE ALTERNATE GREEN */}
                {activeScenarioTab === 'scen-4-wh-alt' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                          Scenario 4: Central Transfer of Approved Alternate Green ({currentScenarios.scenario4_WarehouseAlt.greenName})
                        </div>
                        <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
                          Central warehouse quotes for recipe-approved substitution {currentScenarios.scenario4_WarehouseAlt.greenId}.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {currentScenarios.scenario4_WarehouseAlt.quotes.map(q => {
                        const isOptimal = q.isDesignated && q.capability === 'FULL';
                        const isDeclined = q.capability === 'CANNOT_SUPPLY';

                        return (
                          <div
                            key={q.id}
                            style={{
                              border: isOptimal ? '1.5px solid #16A34A' : `1px solid ${C.border}`,
                              borderRadius: 8,
                              padding: '12px',
                              background: isOptimal ? '#FCFDFC' : isDeclined ? '#FAF9FA' : '#FFFFFF',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                                  {q.warehouseName.split('(')[0].trim()}
                                </span>
                                <span style={{
                                  fontSize: 8.5,
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: 10,
                                  background: isOptimal ? '#EDF7F1' : isDeclined ? '#FEF0F2' : '#FFF7E6',
                                  color: isOptimal ? '#1E8A3C' : isDeclined ? '#D83040' : '#B86A00',
                                  border: `1px solid ${isOptimal ? '#B4DDBD' : isDeclined ? '#F5B8C0' : '#F5D68A'}`,
                                }}>
                                  {q.badge}
                                </span>
                              </div>
                              <div style={{ fontSize: 9.5, color: C.muted, marginBottom: 8 }}>{q.location}</div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: q.capability === 'FULL' ? '#1E8A3C' : '#D83040', marginBottom: 6 }}>
                                {q.capabilityLabel}
                              </div>
                              {!isDeclined ? (
                                <div style={{ fontSize: 11, marginBottom: 8 }}>
                                  Delivered: <strong>${q.totalCost?.toLocaleString()}</strong> (${q.landedPerKg}/kg) · ETA: {q.eta}
                                </div>
                              ) : (
                                <div style={{ fontSize: 9.5, color: '#D83040', marginBottom: 8 }}>{q.reason}</div>
                              )}
                            </div>
                            {!isDeclined && (
                              <button
                                type="button"
                                onClick={() => handleAwardWarehouse(q)}
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: isOptimal ? '#15803D' : C.plum,
                                  color: '#FFFFFF',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Award Alternate Transfer
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. SCENARIO 5: SPLIT FULFILLMENT */}
                {activeScenarioTab === 'scen-5-split' && (
                  <div style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: '16px',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                          Scenario 5: Split Order Sourcing (Local Partial Stock + Warehouse Transfer)
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {currentScenarios.scenario5_Split.note}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: currentScenarios.scenario5_Split.feasible ? '#FFF7E6' : '#F3F4F6',
                        color: currentScenarios.scenario5_Split.feasible ? '#B86A00' : '#9CA3AF',
                        border: `1px solid ${currentScenarios.scenario5_Split.feasible ? '#F5D68A' : '#E5E7EB'}`,
                      }}>
                        {currentScenarios.scenario5_Split.badge}
                      </span>
                    </div>

                    {currentScenarios.scenario5_Split.feasible ? (
                      <>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 12,
                          background: '#FAF8F9',
                          borderRadius: 6,
                          padding: '12px 14px',
                          border: `1px solid ${C.border}`,
                        }}>
                          <div>
                            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase' }}>1. Local Allocation (Site 1054)</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>
                              {currentScenarios.scenario5_Split.localQty.toLocaleString()} kg · $0 Freight
                            </div>
                            <div style={{ fontSize: 10, color: '#16A34A', marginTop: 2 }}>
                              Cost: ${currentScenarios.scenario5_Split.localCost.toLocaleString()} · Immediate on-site pull
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase' }}>2. Warehouse Transfer (WH 1055)</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>
                              {currentScenarios.scenario5_Split.warehouseQty.toLocaleString()} kg · $589 Freight
                            </div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                              Cost: ${currentScenarios.scenario5_Split.warehouseCost.toLocaleString()} · ETA Nov 11
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase' }}>Total Landed Sourcing</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginTop: 2 }}>
                              ${currentScenarios.scenario5_Split.totalCost.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                              (${currentScenarios.scenario5_Split.landedPerKg} / kg landed)
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApproveSplit(
                            currentScenarios.scenario5_Split.localQty,
                            currentScenarios.scenario5_Split.warehouseQty,
                            currentScenarios.scenario3_WarehouseSame.winningQuote
                          )}
                          style={{
                            alignSelf: 'flex-start',
                            padding: '8px 20px',
                            borderRadius: 6,
                            border: 'none',
                            background: C.plum,
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 6px rgba(92,58,87,0.25)',
                          }}
                        >
                          <Layers size={13} />
                          Approve Split Sourcing ({currentScenarios.scenario5_Split.localQty.toLocaleString()} kg Local + {currentScenarios.scenario5_Split.warehouseQty.toLocaleString()} kg Hub)
                        </button>
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                        Split sourcing applies when Site 1054 holds partial physical stock (greater than 0 kg but less than order demand).
                        Currently, on-site unreserved stock is {currentScenarios.scenario1_LocalSame.availableStock} kg.
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              /* Active Lifecycle Status / Tracking Info for In-Flight Orders */
              <div style={{
                background: '#FAF9FA',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: currentMeta.bg,
                      border: `1px solid ${currentMeta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentMeta.color,
                    }}>
                      <Truck size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                        Fulfillment & Execution Tracking
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                        Stage: <strong style={{ color: currentMeta.color }}>{currentMeta.label}</strong> · Assigned Actor: <strong>{currentMeta.actor}</strong>
                      </div>
                    </div>
                  </div>
                  <QueueStatusBadge status={currentOrder.status} />
                </div>

                {/* Sourcing Summary Card for In-Flight Order */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  background: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', marginBottom: 2 }}>Fulfillment Mode</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: currentOrder.isLocalFulfilled ? '#15803D' : C.plum }}>
                      {currentOrder.isLocalFulfilled ? 'On-Site Stock ($0 Freight)' : currentOrder.isSplit ? 'Split Local + Central' : `${currentOrder.warehouse || 'Warehouse 1055'} Transfer`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', marginBottom: 2 }}>Shipping Freight</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: currentOrder.isLocalFulfilled ? '#15803D' : C.text }}>
                      ${currentOrder.shippingCost || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', marginBottom: 2 }}>Total Delivered</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>
                      ${(currentOrder.totalDelivered || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', marginBottom: 2 }}>Target Bay</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text }}>
                      Site 1054 · Bay {currentOrder.stagingBay || 'Dock 2'}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: 11.5,
                  color: C.text,
                  lineHeight: 1.5,
                  background: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                }}>
                  {currentOrder.notes || currentMeta.desc}
                </div>

                {currentOrder.carrierName && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                    background: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 2, letterSpacing: '0.4px' }}>
                        Designated Carrier
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {currentOrder.carrierName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 2, letterSpacing: '0.4px' }}>
                        Waybill / Tracking No.
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.rose, fontFamily: 'monospace' }}>
                        {currentOrder.trackingNumber || 'DIRECT-SHUTTLE'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 2, letterSpacing: '0.4px' }}>
                        Destination Bay
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        Site 1054 · Roasting Dock 2
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SECTION 3: CONTEXTUAL LOCAL BUYER ACTION DOCK (BOTTOM BAR) ── */}
          <div style={{
            borderTop: `1px solid ${C.divider}`,
            padding: '12px 20px',
            background: '#FAF8F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={() => setShowHistoryModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: '#FFFFFF',
                color: C.text,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.hover}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              <Clock size={12} style={{ color: C.plum }} />
              View Audit Trail
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* 1. If Status is 'new' */}
              {currentOrder.status === 'new' && (
                <>
                  {currentScenarios?.scenario1_LocalSame?.feasible && (
                    <button
                      onClick={() => handleAllocateLocal('LOCAL_SAME')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid #16A34A',
                        background: '#EDF7F1',
                        color: '#15803D',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Check size={12} />
                      Allocate Local Stock ($0 Freight)
                    </button>
                  )}
                  {currentScenarios?.scenario3_WarehouseSame?.winningQuote && (
                    <button
                      onClick={() => handleAwardWarehouse(currentScenarios.scenario3_WarehouseSame.winningQuote)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 18px',
                        borderRadius: 6,
                        border: 'none',
                        background: C.rose,
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(216,63,121,0.25)',
                      }}
                    >
                      <Award size={12} />
                      Award {currentScenarios.scenario3_WarehouseSame.winningQuote.warehouseName.split('(')[0].trim()} ($589 Freight)
                    </button>
                  )}
                  {currentOption && (
                    <button
                      onClick={handleProceedToConfirm}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        background: '#FFFFFF',
                        color: C.text,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Confirm Sourcing
                      <ArrowRight size={11} />
                    </button>
                  )}
                </>
              )}

              {/* 2. If Status is 'approved' */}
              {currentOrder.status === 'approved' && (
                currentOrder.isLocalFulfilled ? (
                  <button
                    onClick={handleBuyerReceive}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 20px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#15803D',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(21,128,61,0.25)',
                    }}
                  >
                    <PackageCheck size={13} />
                    Verify & Receive Local Stock at Roasting Bay
                  </button>
                ) : (
                  <button
                    onClick={handleBuyerRequest}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 20px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#D97706',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(217,119,6,0.25)',
                    }}
                  >
                    <Send size={12} />
                    Submit Transfer Request to Central Hub
                  </button>
                )
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
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
                  <Truck size={13} />
                  Simulate Carrier Arrival at Dock
                </button>
              )}

              {/* 7. If Status is 'delivered' - Local Buyer Receives */}
              {currentOrder.status === 'delivered' && (
                <button
                  onClick={handleBuyerReceive}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
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
                  <CheckCircle2 size={13} />
                  Inspect & Mark Received at Dock
                </button>
              )}

              {/* 8. If Status is 'received' - Local Buyer Closes */}
              {currentOrder.status === 'received' && (
                <button
                  onClick={handleBuyerClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
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
                  <ShieldCheck size={13} />
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

      {/* ── New Demand Order Modal (with Live System Auto-Approval Cost Evaluation) ── */}
      {showNewOrderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30, 20, 24, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
          }}
          onClick={() => setShowNewOrderModal(false)}
        >
          <form
            onSubmit={handleCreateDemandOrder}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              width: 480,
              maxWidth: '92vw',
              padding: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>New Production Demand Order</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>
                  Auto-approved if Site 1054 same-green or approved alternate covers demand (cheapest option wins).
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: C.subtle }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Requested Green Material (Site 1054)
                </label>
                <select
                  value={newGreenId}
                  onChange={e => setNewGreenId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    color: C.text,
                    background: '#FFFFFF',
                  }}
                >
                  {localInventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} · {inv.name} ({inv.available.toLocaleString()} kg on-hand · ${inv.price.toFixed(2)}/kg)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    Order Quantity (kg)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={newOrderQty}
                    onChange={e => setNewOrderQty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      fontSize: 12,
                      color: C.text,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    Need-By Date
                  </label>
                  <input
                    type="text"
                    value={newNeedBy}
                    onChange={e => setNewNeedBy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      fontSize: 12,
                      color: C.text,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Cost Evaluation Preview */}
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: newOrderPreview.winner ? '#EDF7F1' : '#FFF7E6',
              border: `1px solid ${newOrderPreview.winner ? '#B4DDBD' : '#F5D68A'}`,
              fontSize: 11,
              lineHeight: 1.45,
            }}>
              {newOrderPreview.winner ? (
                <>
                  <div style={{ fontWeight: 700, color: '#1E8A3C', marginBottom: 2 }}>
                    ✓ System Auto-Approval Will Trigger ($0 freight)
                  </div>
                  <div style={{ color: C.text }}>
                    Cheapest local option: <strong>{newOrderPreview.winner.greenId} · {newOrderPreview.winner.greenName}</strong>{' '}
                    ({newOrderPreview.winner.mode === 'local-alternate' ? 'Approved Alternate' : 'Same Green'}) at{' '}
                    <strong>${newOrderPreview.winner.unitPrice.toFixed(2)}/kg</strong> (${newOrderPreview.winner.totalCost.toLocaleString()} total).
                    Local inventory will be deducted immediately.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: '#B86A00', marginBottom: 2 }}>
                    ⚠ Central Warehouse Review Needed (Status: New)
                  </div>
                  <div style={{ color: C.text }}>
                    Neither local {newGreenId} ({newOrderPreview.requestedItem?.available?.toLocaleString() || 0} kg) nor approved alternates cover{' '}
                    {(parseInt(newOrderQty, 10) || 0).toLocaleString()} kg. Order will enter <strong>new</strong> status for Warehouse 1055 transfer ($589 freight).
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
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
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: newOrderPreview.winner ? '#1E8A3C' : C.rose,
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {newOrderPreview.winner ? 'Create & Auto-Approve' : 'Create Demand Order'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
