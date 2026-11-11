import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Check, XCircle, ArrowRight, Clock, Warehouse,
  Package, Truck, AlertTriangle, ShieldCheck,
  CheckCircle2, MapPin, RefreshCw
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
import OrderLifecycleStepper from '../../components/ui/OrderLifecycleStepper';
import InfoTooltip from '../../components/ui/InfoTooltip';
import { useOrders, getOrderStatusMeta, ORDER_LIFECYCLE } from '../../context/OrdersContext';

const C = {
  text:          '#30272B',
  plum:          '#5C3A57',
  muted:         '#746970',
  subtle:        '#9CA3AF',
  border:        '#E6DCE2',
  divider:       '#F0EAEE',
  hover:         '#FDFBFC',
  rose:          '#D83F79',
  roseHover:     '#C4366B',
  roseSoft:      '#FAF2F6',
  roseBorder:    '#F0D0DF',
  success:       '#1E8A3C',
  successBg:     '#EDF7F1',
  successBorder: '#B4DDBD',
  warn:          '#B86A00',
  warnBg:        '#FFF7E6',
  warnBorder:    '#F5D68A',
  crit:          '#D83040',
  critBg:        '#FEF0F2',
  critBorder:    '#F5B8C0',
  purple:        '#6B46C1',
  purpleBg:      '#FAF5FF',
  purpleBorder:  '#E9D8FD',
};

const WAREHOUSE_OPTIONS = [
  { value: 'all',            label: 'All Central Warehouses' },
  { value: 'Warehouse 1055', label: 'Warehouse 1055 (Plano/Windsor Hub)' },
  { value: 'Warehouse 1020', label: 'Warehouse 1020 (Sumner Hub)' },
  { value: 'Warehouse 1021', label: 'Warehouse 1021 (Essex Hub)' },
];

export default function CentralOrders() {
  const navigate = useNavigate();

  const {
    orders,
    warehouseAccept,
    warehouseDispatch,
    warehouseInTransit,
    systemDeliver,
    warehouseReject,
    resetOrders,
  } = useOrders();

  // Filter orders that involve Central Warehouses (or have warehouse routing)
  const centralOrders = useMemo(() => {
    return orders.filter(o => o.warehouse && o.status !== 'new');
  }, [orders]);

  const [selectedOrderId, setSelectedOrderId] = useState('PO-2843');
  const [tabFilter, setTabFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialInputQty, setPartialInputQty] = useState('');
  const [partialReasonInput, setPartialReasonInput] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('Insufficient uncommitted buffer for delivery window');

  const [actionNotice, setActionNotice] = useState(null);

  const triggerNotice = (msg, variant = 'success') => {
    setActionNotice({ msg, variant });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Currently selected order
  const selectedOrder = useMemo(() => {
    return centralOrders.find(o => o.id === selectedOrderId) || centralOrders[0] || {};
  }, [centralOrders, selectedOrderId]);

  // Tab filter counts
  const counts = useMemo(() => {
    const res = { all: centralOrders.length };
    ORDER_LIFECYCLE.forEach(s => {
      res[s] = centralOrders.filter(o => o.status === s).length;
    });
    res.rejected = centralOrders.filter(o => o.status === 'rejected').length;
    return res;
  }, [centralOrders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return centralOrders.filter(order => {
      // Tab status filter
      if (tabFilter !== 'all' && order.status !== tabFilter) return false;

      // Warehouse hub filter
      if (warehouseFilter !== 'all' && !order.warehouse?.includes(warehouseFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.greenId.toLowerCase().includes(q) ||
          order.greenName.toLowerCase().includes(q) ||
          order.destinationSite?.toLowerCase().includes(q) ||
          order.buyerName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [centralOrders, tabFilter, warehouseFilter, searchQuery]);

  // ── 1. Warehouse Manager: Accept in Full ────────────────────────────────────
  const handleApproveFull = () => {
    if (!selectedOrder) return;
    warehouseAccept(selectedOrder.id, { acceptedQty: selectedOrder.orderQuantity });
    triggerNotice(`Order ${selectedOrder.id} accepted in full (${(selectedOrder.orderQuantity || 0).toLocaleString()} kg allocated from ${selectedOrder.warehouse})`);
  };

  // ── 2. Warehouse Manager: Partial Accept ───────────────────────────────────
  const handleConfirmPartial = (e) => {
    e.preventDefault();
    const qty = parseInt(partialInputQty, 10);
    if (!qty || qty <= 0 || qty >= selectedOrder.orderQuantity) {
      alert(`Please enter a valid partial quantity between 1 and ${(selectedOrder.orderQuantity || 1000) - 1} kg.`);
      return;
    }

    warehouseAccept(selectedOrder.id, {
      acceptedQty: qty,
      partialReason: partialReasonInput || 'Warehouse buffer allocation limit',
    });

    setShowPartialModal(false);
    setPartialInputQty('');
    setPartialReasonInput('');
    triggerNotice(`Order ${selectedOrder.id} partially accepted for ${qty.toLocaleString()} kg`, 'warn');
  };

  // ── 3. Warehouse Manager: Reject ───────────────────────────────────────────
  const handleConfirmReject = (e) => {
    e.preventDefault();
    warehouseReject(selectedOrder.id, { reason: rejectReasonInput });
    setShowRejectModal(false);
    triggerNotice(`Order ${selectedOrder.id} rejected: "${rejectReasonInput}"`, 'crit');
  };

  // ── 4. Warehouse Manager: Dispatch (Stage at Dock) ─────────────────────────
  const handleDispatch = () => {
    warehouseDispatch(selectedOrder.id, { bay: 'Bay 2' });
    triggerNotice(`Order ${selectedOrder.id} staged and dispatched to loading dock Bay 2.`);
  };

  // ── 5. Warehouse Manager: Mark In Transit (Handoff to Carrier) ─────────────
  const handleMarkInTransit = () => {
    warehouseInTransit(selectedOrder.id, {
      carrier: 'GreenFreight Express',
      trackingNumber: `TR-${Math.floor(500 + Math.random() * 90)}`,
    });
    triggerNotice(`Order ${selectedOrder.id} handed off to carrier and marked In Transit.`);
  };

  // ── 6. Carrier / Simulation: Dock Arrival ─────────────────────────────────
  const handleSimulateDelivery = () => {
    systemDeliver(selectedOrder.id);
    triggerNotice(`Carrier arrived at destination site dock for ${selectedOrder.id}.`);
  };

  const meta = getOrderStatusMeta(selectedOrder.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1360, margin: '0 auto' }}>

      {/* ── Top Header Section ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
              background: C.purpleBg,
              color: C.purple,
              border: `1px solid ${C.purpleBorder}`,
              letterSpacing: '0.5px',
            }}>
              CENTRAL WAREHOUSE OPERATIONS
            </span>
            <span style={{ fontSize: 11, color: C.subtle }}>
              Hub 1055 · Hub 1020 · Hub 1021
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Central Warehouse Orders
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
            Review transfer requests submitted by 7 local roasting sites. Central Warehouse Managers approve/reject, dispatch to bay, and hand off to freight carriers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemedSelect
            prefix="Warehouse:"
            value={warehouseFilter}
            onChange={setWarehouseFilter}
            options={WAREHOUSE_OPTIONS}
            size="sm"
            align="right"
          />

          <button
            onClick={() => navigate('/orders')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: '#FFFFFF',
              color: C.text,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Switch to Local Buyer View <ArrowRight size={11} />
          </button>

          <button
            onClick={resetOrders}
            title="Reset to default data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 8px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: '#FFFFFF',
              color: C.muted,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* ── Status Action Notice Banner ── */}
      {actionNotice && (
        <div style={{
          background: actionNotice.variant === 'crit' ? C.critBg : (actionNotice.variant === 'warn' ? C.warnBg : C.successBg),
          border: `1px solid ${actionNotice.variant === 'crit' ? C.critBorder : (actionNotice.variant === 'warn' ? C.warnBorder : C.successBorder)}`,
          color: actionNotice.variant === 'crit' ? C.crit : (actionNotice.variant === 'warn' ? C.warn : C.success),
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {actionNotice.variant === 'crit' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* ── 4 Top Operational KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        {[
          {
            label: 'PENDING HUB REVIEW',
            value: `${counts.requested || 0} Orders`,
            sub: 'Requires warehouse manager allocation',
            color: C.warn,
            bg: C.warnBg,
            border: C.warnBorder,
            icon: Clock,
            infoTitle: 'Pending Hub Review & Allocation',
            infoDesc: 'Transfer POs requested by local buyers that require Central Warehouse 1055 inventory reservation, approval, or partial accept.',
          },
          {
            label: 'ACCEPTED & STAGING',
            value: `${counts.accepted || 0} Orders`,
            sub: 'Allocated in warehouse staging bays',
            color: C.success,
            bg: C.successBg,
            border: C.successBorder,
            icon: Package,
            infoTitle: 'Accepted & Staged in Bays',
            infoDesc: 'Orders accepted by warehouse manager where green bags are physically allocated in Hub 1055 staging bays awaiting carrier pickup.',
          },
          {
            label: 'DISPATCHED & TRANSIT',
            value: `${(counts.dispatched || 0) + (counts['in transit'] || 0)} Shipments`,
            sub: 'Outbound on carrier routes',
            color: C.purple,
            bg: C.purpleBg,
            border: C.purpleBorder,
            icon: Truck,
            infoTitle: 'Outbound Carrier Transit',
            infoDesc: 'Orders loaded onto regional carriers and currently en route along assigned lowest-freight routes to destination roasting sites.',
          },
          {
            label: 'DELIVERED & RECEIVED',
            value: `${(counts.delivered || 0) + (counts.received || 0)} Fulfilled`,
            sub: 'Arrived at local roasting facilities',
            color: C.plum,
            bg: '#FFFFFF',
            border: C.border,
            icon: ShieldCheck,
            infoTitle: 'Delivered & Received at Site',
            infoDesc: 'Shipments that have reached destination roasting dock and completed physical inspection and inventory booking by local buyers.',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              style={{
                background: kpi.bg,
                border: `1px solid ${kpi.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                boxShadow: '0 1px 2px rgba(48,39,43,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: C.subtle, letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {kpi.label}
                  <InfoTooltip
                    title={kpi.infoTitle}
                    content={kpi.infoDesc}
                    align={idx === 0 ? 'left' : idx === 3 ? 'right' : 'center'}
                    position="top"
                    size={11}
                    color={C.subtle}
                  />
                </span>
                <Icon size={14} style={{ color: kpi.color }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: kpi.color }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Status Lifecycle Filter Tabs ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 4,
        borderBottom: `1px solid ${C.divider}`,
      }}>
        <button
          onClick={() => setTabFilter('all')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: tabFilter === 'all' ? 700 : 500,
            background: tabFilter === 'all' ? C.plum : '#FFFFFF',
            color: tabFilter === 'all' ? '#FFFFFF' : C.text,
            border: `1px solid ${tabFilter === 'all' ? C.plum : C.border}`,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span>All Transfer POs</span>
          <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 10, background: tabFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#F0EAEE' }}>
            {counts.all}
          </span>
        </button>

        {['requested', 'accepted', 'dispatched', 'in transit', 'delivered', 'received', 'closed', 'rejected'].map(statusKey => {
          const statusMeta = getOrderStatusMeta(statusKey);
          const isActive = tabFilter === statusKey;
          const count = counts[statusKey] || 0;
          return (
            <button
              key={statusKey}
              onClick={() => setTabFilter(statusKey)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 11px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                background: isActive ? statusMeta.color : statusMeta.bg,
                color: isActive ? '#FFFFFF' : statusMeta.color,
                border: `1px solid ${isActive ? statusMeta.color : statusMeta.border}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#FFFFFF' : statusMeta.dotBg }} />
              <span style={{ textTransform: 'capitalize' }}>{statusKey}</span>
              <span style={{
                fontSize: 10,
                padding: '1px 5px',
                borderRadius: 10,
                background: isActive ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : statusMeta.color,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Two-Column Master / Detail Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 14, alignItems: 'start' }}>

        {/* ── LEFT COLUMN: Incoming Orders Queue ── */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header & Search */}
          <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.divider}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                Transfer PO Inbox
              </div>
              <span style={{ fontSize: 10, color: C.subtle }}>
                {filteredOrders.length} orders
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search order, green or facility..."
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

          {/* Orders List */}
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: C.subtle, fontSize: 11 }}>
                No transfer POs in this view.
              </div>
            ) : (
              filteredOrders.map((order, idx) => {
                const isSelected = order.id === selectedOrderId;
                const orderMeta = getOrderStatusMeta(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{
                      padding: '11px 14px',
                      borderBottom: idx < filteredOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                      background: isSelected ? '#FAF2F6' : '#FFFFFF',
                      borderLeft: isSelected ? `3.5px solid ${C.rose}` : '3.5px solid transparent',
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
                    {/* Top Row: PO Number & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>
                        {order.id}
                      </span>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 10,
                        background: orderMeta.bg,
                        color: orderMeta.color,
                        border: `1px solid ${orderMeta.border}`,
                        textTransform: 'capitalize',
                      }}>
                        {orderMeta.label}
                      </span>
                    </div>

                    {/* Green Material */}
                    <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 2 }}>
                      <span style={{ color: C.plum, marginRight: 6 }}>{order.greenId}</span>
                      <span>{order.greenName}</span>
                    </div>

                    {/* Destination Roasting Site */}
                    <div style={{ fontSize: 10, color: C.muted, display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
                      <MapPin size={10} style={{ color: C.subtle }} />
                      <span>{order.destinationSite}</span>
                    </div>

                    {/* Bottom Metadata: Quantity & Need By */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: C.subtle }}>
                      <span>Qty: <strong>{order.quantityStr || `${order.orderQuantity} kg`}</strong></span>
                      <span>Need by <strong>{order.needByFull || order.needBy}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Order Inspection & Warehouse Manager Action Dock ── */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          {/* Header of Detail Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: `1px solid ${C.divider}` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{selectedOrder.id}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.border}`,
                }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                Placed by <strong>{selectedOrder.buyerName}</strong> ({selectedOrder.buyerTitle})
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.subtle, textTransform: 'uppercase' }}>Total Landed Value</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.rose }}>
                ${(selectedOrder.totalDelivered || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* ── 9-STAGE LIFECYCLE STEPPER ── */}
          <div style={{
            background: '#FAF8F9',
            border: `1px solid ${C.divider}`,
            borderRadius: 8,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.plum, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
              Order Lifecycle Progress (9 Canonical Stages)
            </div>
            <OrderLifecycleStepper status={selectedOrder.status} />
          </div>

          {/* Warehouse Stock Check Banner */}
          <div style={{
            background: '#FDFBFC',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Warehouse size={14} style={{ color: C.plum }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                  {selectedOrder.warehouse} · Assigned Sourcing Hub
                </span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 10,
                background: C.successBg,
                color: C.success,
                border: `1px solid ${C.successBorder}`,
              }}>
                Designated Lowest Freight Matrix Route
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 11 }}>
              <div>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Green Material</div>
                <div style={{ fontWeight: 700, color: C.plum }}>{selectedOrder.greenId} · {selectedOrder.greenName}</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Order Quantity</div>
                <div style={{ fontWeight: 700, color: C.text }}>{selectedOrder.quantityStr || `${selectedOrder.orderQuantity} kg`}</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Destination Site</div>
                <div style={{ fontWeight: 700, color: C.text }}>{selectedOrder.destinationSite}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Fixed Freight Cost</div>
                <div style={{ fontWeight: 700, color: C.rose }}>${selectedOrder.shippingCost?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Buyer Request Notes */}
          {selectedOrder.notes && (
            <div style={{
              background: '#FAF8F9',
              border: `1px solid ${C.divider}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 11,
              color: C.muted,
            }}>
              <strong style={{ color: C.text }}>Operational Note:</strong> {selectedOrder.notes}
            </div>
          )}

          {/* Rejection / Partial Notes if applicable */}
          {selectedOrder.rejectionReason && (
            <div style={{
              background: C.critBg,
              border: `1px solid ${C.critBorder}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 11,
              color: C.crit,
            }}>
              <strong>Rejection Reason:</strong> {selectedOrder.rejectionReason}
            </div>
          )}
          {selectedOrder.partialReason && (
            <div style={{
              background: C.warnBg,
              border: `1px solid ${C.warnBorder}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 11,
              color: C.warn,
            }}>
              <strong>Partial Acceptance Rationale:</strong> {selectedOrder.partialReason}
            </div>
          )}

          {/* ── WAREHOUSE MANAGER ACTION DECK ── */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={15} style={{ color: C.rose }} />
              Central Warehouse Manager Execution Actions
            </div>

            {/* STAGE 1: Order is 'requested' -> Manager Accepts in Full, Partial Accepts, or Rejects */}
            {selectedOrder.status === 'requested' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleApproveFull}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: C.success,
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(30,138,60,0.25)',
                  }}
                >
                  <Check size={13} strokeWidth={2.5} />
                  Accept in Full
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPartialInputQty(String(Math.round((selectedOrder.orderQuantity || 1000) * 0.75)));
                    setShowPartialModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.warnBorder}`,
                    background: C.warnBg,
                    color: C.warn,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <AlertTriangle size={13} />
                  Partial Accept
                </button>

                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.critBorder}`,
                    background: C.critBg,
                    color: C.crit,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <XCircle size={13} />
                  Reject Order
                </button>
              </div>
            )}

            {/* STAGE 2: Order is 'accepted' -> Manager Dispatches / Stages */}
            {selectedOrder.status === 'accepted' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Order accepted by Warehouse Manager. Green coffee is being picked and palletized in {selectedOrder.warehouse}.
                </div>
                <button
                  type="button"
                  onClick={handleDispatch}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79,70,229,0.3)',
                  }}
                >
                  <Package size={14} />
                  Dispatch Order (Palletize & Stage at Loading Dock)
                </button>
              </div>
            )}

            {/* STAGE 3: Order is 'dispatched' -> Manager Hands off to Carrier */}
            {selectedOrder.status === 'dispatched' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Palletized and QA inspected at outbound dock. Hand over to freight carrier to set in transit.
                </div>
                <button
                  type="button"
                  onClick={handleMarkInTransit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(13,148,136,0.3)',
                  }}
                >
                  <Truck size={14} />
                  Hand off to Freight Carrier (Mark In Transit)
                </button>
              </div>
            )}

            {/* STAGE 4: Order is 'in transit' -> Carrier simulation / Arrival */}
            {selectedOrder.status === 'in transit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Carrier is en route from {selectedOrder.warehouse} to {selectedOrder.destinationSite}.
                </div>
                <button
                  type="button"
                  onClick={handleSimulateDelivery}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #2563EB',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={13} />
                  Confirm Carrier Arrival at Local Site Dock
                </button>
              </div>
            )}

            {/* STAGE 5: Order is 'delivered' */}
            {selectedOrder.status === 'delivered' && (
              <div style={{ padding: '8px 12px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 600 }}>
                📍 Delivered at {selectedOrder.destinationSite} receiving dock. Local Buyer manual verification pending.
              </div>
            )}

            {/* STAGE 6: Order is 'received' */}
            {selectedOrder.status === 'received' && (
              <div style={{ padding: '8px 12px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', fontSize: 11, fontWeight: 600 }}>
                ✓ Local Buyer inspected and received shipment at roasting plant dock.
              </div>
            )}

            {/* STAGE 7: Order is 'closed' */}
            {selectedOrder.status === 'closed' && (
              <div style={{ padding: '8px 12px', borderRadius: 6, background: '#F3F4F6', color: '#4B5563', fontSize: 11, fontWeight: 600 }}>
                ✓ Order fulfilled, reconciled, and closed into facility inventory stock.
              </div>
            )}

            {/* REJECTED */}
            {selectedOrder.status === 'rejected' && (
              <div style={{ padding: '8px 12px', borderRadius: 6, background: '#FEF0F2', color: '#D83040', fontSize: 11, fontWeight: 600 }}>
                ✕ Order was rejected by Central Warehouse Manager.
              </div>
            )}
          </div>

          {/* ── UNIFIED VERTICAL LIFECYCLE STEPPER & AUDIT TRAIL ── */}
          <OrderLifecycleStepper
            status={selectedOrder.status}
            orientation="vertical"
            timeline={selectedOrder.timeline}
            title="Order Lifecycle Audit Trail"
          />
        </div>
      </div>

      {/* ── Partial Acceptance Modal ── */}
      {showPartialModal && (
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
        onClick={() => setShowPartialModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              width: 440,
              maxWidth: '90vw',
              padding: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                Partial Accept · {selectedOrder.id}
              </div>
              <button
                onClick={() => setShowPartialModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: C.subtle }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPartial} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, color: C.muted }}>
                Requested: <strong>{(selectedOrder.orderQuantity || 0).toLocaleString()} kg</strong> of {selectedOrder.greenName}.
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Accepted Quantity (kg)
                </label>
                <input
                  type="number"
                  value={partialInputQty}
                  onChange={e => setPartialInputQty(e.target.value)}
                  placeholder="e.g. 800"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    color: C.text,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Reason for Partial Quantity
                </label>
                <input
                  type="text"
                  value={partialReasonInput}
                  onChange={e => setPartialReasonInput(e.target.value)}
                  placeholder="e.g. Warehouse buffer safety threshold"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    color: C.text,
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowPartialModal(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: '#FFFFFF',
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
                    background: C.warn,
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Partial Acceptance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && (
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
        onClick={() => setShowRejectModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              width: 440,
              maxWidth: '90vw',
              padding: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.crit }}>
                Reject Transfer Request · {selectedOrder.id}
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: C.subtle }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, color: C.muted }}>
                Specify the justification for rejecting this order from {selectedOrder.warehouse}.
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={e => setRejectReasonInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    color: C.text,
                    resize: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: '#FFFFFF',
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
                    background: C.crit,
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
