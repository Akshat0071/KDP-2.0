import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Check, XCircle, ArrowRight, Clock, Warehouse,
  Package, Truck, AlertTriangle, ShieldCheck,
  CheckCircle2, MapPin
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';

const C = {
  text:         '#30272B',
  plum:         '#5C3A57',
  muted:        '#746970',
  subtle:       '#9CA3AF',
  border:       '#E6DCE2',
  divider:      '#F0EAEE',
  hover:        '#FDFBFC',
  rose:         '#D83F79',
  roseHover:    '#C4366B',
  roseSoft:     '#FAF2F6',
  roseBorder:   '#F0D0DF',
  success:      '#1E8A3C',
  successBg:    '#EDF7F1',
  successBorder:'#B4DDBD',
  warn:         '#B86A00',
  warnBg:       '#FFF7E6',
  warnBorder:   '#F5D68A',
  crit:         '#D83040',
  critBg:       '#FEF0F2',
  critBorder:   '#F5B8C0',
  info:         '#16A6D1',
  infoBg:       '#E8F8FD',
  infoBorder:   '#B0E8FA',
  purple:       '#6B46C1',
  purpleBg:     '#FAF5FF',
  purpleBorder: '#E9D8FD',
};

// ── Initial Central Orders Dataset Placed by Local Buyers ────────────────────
// ── Initial Central Orders Dataset Placed by Local Buyers ────────────────────
const INITIAL_CENTRAL_ORDERS = [
  {
    id: 'PO-2843',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo Washed',
    requestedQty: 1200,
    acceptedQty: 1200,
    unitPrice: 3.90,
    shippingCost: 589,
    totalDelivered: 5269,
    needBy: 'Nov 10, 2026',
    orderDate: 'Oct 25, 2026, 09:30 AM',
    status: 'pending', // 'pending' | 'approved' | 'partial' | 'in_transit' | 'rejected' | 'delivered'
    statusLabel: 'Pending Manager Review',
    isAlternate: false,
    notes: 'Urgent roasting requirement. Local inventory depleted below safety threshold.',
    warehouseStockAvailable: 5200,
    warehouseStockReserved: 1000,
    rejectionReason: null,
    partialReason: null,
    timeline: [
      { title: 'Transfer PO Submitted by Maya Torres', time: 'Oct 25, 2026, 09:30 AM', state: 'done' },
      { title: 'Awaiting Central Warehouse Manager Allocation', time: 'Pending Action', state: 'active' },
      { title: 'Material Pulling & QA Staging', time: 'Warehouse 1055 Staging Bay 3', state: 'pending' },
      { title: 'Carrier Dispatch & Inbound Transit', time: 'GreenFreight Express', state: 'pending' },
    ],
  },
  {
    id: 'PO-2844',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    greenId: 'Gc-14',
    greenName: 'Guatemala Antigua SHB',
    requestedQty: 600,
    acceptedQty: 600,
    unitPrice: 4.10,
    shippingCost: 589,
    totalDelivered: 3049,
    needBy: 'Nov 07, 2026',
    orderDate: 'Oct 25, 2026, 08:15 AM',
    status: 'pending',
    statusLabel: 'Pending Manager Review',
    isAlternate: false,
    notes: 'Scheduled roasting replenishment to satisfy blend recipe commitments.',
    warehouseStockAvailable: 4500,
    warehouseStockReserved: 500,
    rejectionReason: null,
    partialReason: null,
    timeline: [
      { title: 'Transfer PO Submitted by Maya Torres', time: 'Oct 25, 2026, 08:15 AM', state: 'done' },
      { title: 'Awaiting Central Warehouse Manager Allocation', time: 'Pending Action', state: 'active' },
      { title: 'Material Pulling & QA Staging', time: 'Warehouse 1055 Staging Bay 1', state: 'pending' },
      { title: 'Carrier Dispatch & Inbound Transit', time: 'Lonestar Freight Lines', state: 'pending' },
    ],
  },
  {
    id: 'PO-2850',
    buyerName: 'Liam Davies',
    buyerTitle: 'Lead Sourcing Specialist · Site 1102 Windsor',
    destinationSite: 'Site 1102 — Windsor Facility',
    destinationCity: 'Windsor, VA',
    warehouse: 'Warehouse 1055',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    requestedQty: 2400,
    acceptedQty: 2400,
    unitPrice: 3.40,
    shippingCost: 3000,
    totalDelivered: 11160,
    needBy: 'Nov 12, 2026',
    orderDate: 'Oct 24, 2026, 04:50 PM',
    status: 'pending',
    statusLabel: 'Pending Manager Review',
    isAlternate: false,
    notes: 'Large monthly restock for Windsor roasting facility from assigned Warehouse 1055.',
    warehouseStockAvailable: 8000,
    warehouseStockReserved: 1200,
    rejectionReason: null,
    partialReason: null,
    timeline: [
      { title: 'Transfer PO Submitted by Liam Davies', time: 'Oct 24, 2026, 04:50 PM', state: 'done' },
      { title: 'Awaiting Central Warehouse Manager Allocation', time: 'Pending Action', state: 'active' },
      { title: 'Material Pulling & QA Staging', time: 'Pending approval', state: 'pending' },
      { title: 'Carrier Dispatch', time: 'East Coast Logistics', state: 'pending' },
    ],
  },
  {
    id: 'PO-2838',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    requestedQty: 2000,
    acceptedQty: 2000,
    unitPrice: 3.40,
    shippingCost: 589,
    totalDelivered: 7389,
    needBy: 'Nov 04, 2026',
    orderDate: 'Oct 23, 2026, 11:20 AM',
    status: 'approved',
    statusLabel: 'Approved · Staging Stock',
    isAlternate: false,
    notes: 'Approved in full. Staging from Warehouse 1055 Aisle 4.',
    warehouseStockAvailable: 6000,
    warehouseStockReserved: 3200,
    rejectionReason: null,
    partialReason: null,
    timeline: [
      { title: 'Transfer PO Submitted', time: 'Oct 23, 2026, 11:20 AM', state: 'done' },
      { title: 'Approved in Full by Central Manager', time: 'Oct 24, 2026, 08:30 AM', state: 'done' },
      { title: 'Picking & Moisture Check in Progress', time: 'Warehouse 1055 Bay 2', state: 'active' },
      { title: 'Dispatch Scheduled', time: 'Oct 26, 2026, 06:00 AM', state: 'pending' },
    ],
  },
  {
    id: 'PO-2835',
    buyerName: 'Sarah Chen',
    buyerTitle: 'Regional Buyer · Site 1003 Sumner',
    destinationSite: 'Site 1003 — Sumner Plant',
    destinationCity: 'Sumner, WA',
    warehouse: 'Warehouse 1020',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    requestedQty: 1000,
    acceptedQty: 600,
    unitPrice: 4.85,
    shippingCost: 1000,
    totalDelivered: 3910,
    needBy: 'Nov 06, 2026',
    orderDate: 'Oct 22, 2026, 02:15 PM',
    status: 'partial',
    statusLabel: 'Partial Accepted (600 / 1000 kg)',
    isAlternate: false,
    notes: 'Warehouse capped at 600 kg due to standing reserve commitments. 400 kg backordered.',
    warehouseStockAvailable: 1200,
    warehouseStockReserved: 600,
    rejectionReason: null,
    partialReason: 'Warehouse buffer allocation limit; balance slated on incoming container due Nov 08.',
    timeline: [
      { title: 'Transfer PO Submitted', time: 'Oct 22, 2026, 02:15 PM', state: 'done' },
      { title: 'Partial Accepted (600 kg allocated)', time: 'Oct 23, 2026, 09:10 AM', state: 'done' },
      { title: 'Palletizing 600 kg in Warehouse 1020', time: 'Bay 5 Staged', state: 'active' },
      { title: 'Pacific Freight Carrier', time: 'Cascade Overland Express', state: 'pending' },
    ],
  },
  {
    id: 'PO-2831',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo Washed',
    requestedQty: 1800,
    acceptedQty: 1800,
    unitPrice: 3.90,
    shippingCost: 589,
    totalDelivered: 7609,
    needBy: 'Nov 01, 2026',
    orderDate: 'Oct 21, 2026, 10:00 AM',
    status: 'in_transit',
    statusLabel: 'Dispatched · In Transit',
    isAlternate: false,
    notes: 'Dispatched on TR-501. Bill of lading #BL-99214.',
    warehouseStockAvailable: 5200,
    warehouseStockReserved: 0,
    rejectionReason: null,
    partialReason: null,
    timeline: [
      { title: 'Transfer PO Submitted', time: 'Oct 21, 2026, 10:00 AM', state: 'done' },
      { title: 'Approved & QA Staged', time: 'Oct 22, 2026, 01:45 PM', state: 'done' },
      { title: 'Dispatched from Warehouse 1055', time: 'Oct 24, 2026, 06:20 PM', state: 'done' },
      { title: 'Estimated Plano Delivery', time: 'Nov 02, 2026, 08:00 AM', state: 'active' },
    ],
  },
  {
    id: 'PO-2828',
    buyerName: 'Carlos Rivera',
    buyerTitle: 'Procurement Specialist · Site 1006 Essex',
    destinationSite: 'Site 1006 — Essex Plant',
    destinationCity: 'Essex, VT',
    warehouse: 'Warehouse 1021',
    greenId: 'Ge-31',
    greenName: 'Sumatra Mandheling Grade 1',
    requestedQty: 2000,
    acceptedQty: 0,
    unitPrice: 4.60,
    shippingCost: 1000,
    totalDelivered: 0,
    needBy: 'Nov 03, 2026',
    orderDate: 'Oct 20, 2026, 01:10 PM',
    status: 'rejected',
    statusLabel: 'Rejected by Central Hub',
    isAlternate: false,
    notes: 'Material failed pre-shipment QA inspection; placed under quarantine hold.',
    warehouseStockAvailable: 0,
    warehouseStockReserved: 0,
    rejectionReason: 'Material under QA quarantine hold for moisture non-conformance.',
    partialReason: null,
    timeline: [
      { title: 'Transfer PO Submitted', time: 'Oct 20, 2026, 01:10 PM', state: 'done' },
      { title: 'Order Rejected by Central Quality Control', time: 'Oct 21, 2026, 11:40 AM', state: 'active-crit' },
    ],
  },
];

const WAREHOUSE_OPTIONS = [
  { value: 'all',            label: 'All Central Warehouses' },
  { value: 'Warehouse 1055', label: 'Warehouse 1055' },
  { value: 'Warehouse 1020', label: 'Warehouse 1020' },
  { value: 'Warehouse 1021', label: 'Warehouse 1021' },
];

export default function CentralOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState(INITIAL_CENTRAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState('PO-2843');
  const [tabFilter, setTabFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'partial' | 'in_transit' | 'rejected'
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Partial accept modal state
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialInputQty, setPartialInputQty] = useState('');
  const [partialReasonInput, setPartialReasonInput] = useState('');

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('Insufficient uncommitted buffer for delivery window');

  // Status update message banner
  const [actionNotice, setActionNotice] = useState(null);

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // Tab filter counts
  const counts = useMemo(() => {
    return {
      all:        orders.length,
      pending:    orders.filter(o => o.status === 'pending').length,
      approved:   orders.filter(o => o.status === 'approved').length,
      partial:    orders.filter(o => o.status === 'partial').length,
      in_transit: orders.filter(o => o.status === 'in_transit').length,
      rejected:   orders.filter(o => o.status === 'rejected').length,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab status filter
      if (tabFilter !== 'all' && order.status !== tabFilter) return false;

      // Warehouse hub filter
      if (warehouseFilter !== 'all' && !order.warehouse.includes(warehouseFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.greenId.toLowerCase().includes(q) ||
          order.greenName.toLowerCase().includes(q) ||
          order.destinationSite.toLowerCase().includes(q) ||
          order.buyerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, tabFilter, warehouseFilter, searchQuery]);

  const triggerNotice = (msg, variant = 'success') => {
    setActionNotice({ msg, variant });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // ── Manager Action: Full Approve ──────────────────────────────────────────
  const handleApproveFull = () => {
    if (!selectedOrder) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== selectedOrder.id) return o;
        return {
          ...o,
          status: 'approved',
          statusLabel: 'Approved · Staging Stock',
          acceptedQty: o.requestedQty,
          timeline: [
            ...o.timeline.map(t => (t.state === 'active' ? { ...t, state: 'done' } : t)),
            {
              title: `Approved in Full (${o.requestedQty.toLocaleString()} kg allocated from ${o.warehouse})`,
              time: 'Just now · Central Manager sign-off',
              state: 'done',
            },
            {
              title: 'Picking & QA Palletizing',
              time: `${o.warehouse} Staging Bay`,
              state: 'active',
            },
          ],
        };
      })
    );
    triggerNotice(`Order ${selectedOrder.id} approved in full (${selectedOrder.requestedQty.toLocaleString()} kg allocated from ${selectedOrder.warehouse})`);
  };

  // ── Manager Action: Partial Accept ─────────────────────────────────────────
  const handleConfirmPartial = (e) => {
    e.preventDefault();
    const qty = parseInt(partialInputQty, 10);
    if (!qty || qty <= 0 || qty >= selectedOrder.requestedQty) {
      alert(`Please enter a valid partial quantity between 1 and ${selectedOrder.requestedQty - 1} kg.`);
      return;
    }

    const backorder = selectedOrder.requestedQty - qty;

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== selectedOrder.id) return o;
        return {
          ...o,
          status: 'partial',
          statusLabel: `Partial Accepted (${qty.toLocaleString()} / ${o.requestedQty.toLocaleString()} kg)`,
          acceptedQty: qty,
          partialReason: partialReasonInput || 'Warehouse available buffer threshold ceiling',
          timeline: [
            ...o.timeline.map(t => (t.state === 'active' ? { ...t, state: 'done' } : t)),
            {
              title: `Partial Acceptance: ${qty.toLocaleString()} kg allocated (${backorder.toLocaleString()} kg backordered)`,
              time: 'Just now · Central Manager',
              state: 'done',
            },
            {
              title: 'Staging Accepted Volume in Packing Bay',
              time: `${o.warehouse}`,
              state: 'active',
            },
          ],
        };
      })
    );

    setShowPartialModal(false);
    setPartialInputQty('');
    setPartialReasonInput('');
    triggerNotice(`Order ${selectedOrder.id} partially accepted for ${qty.toLocaleString()} kg (${backorder.toLocaleString()} kg backordered)`, 'warn');
  };

  // ── Manager Action: Reject ─────────────────────────────────────────────────
  const handleConfirmReject = (e) => {
    e.preventDefault();
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== selectedOrder.id) return o;
        return {
          ...o,
          status: 'rejected',
          statusLabel: 'Rejected by Central Hub',
          acceptedQty: 0,
          rejectionReason: rejectReasonInput,
          timeline: [
            ...o.timeline.map(t => (t.state === 'active' ? { ...t, state: 'done' } : t)),
            {
              title: `Order Rejected: ${rejectReasonInput}`,
              time: 'Just now · Central Manager',
              state: 'active-crit',
            },
          ],
        };
      })
    );

    setShowRejectModal(false);
    triggerNotice(`Order ${selectedOrder.id} rejected: "${rejectReasonInput}"`, 'crit');
  };

  // ── Manager Action: Step Order Status ──────────────────────────────────────
  const handleUpdateExecutionStatus = (nextStatus, nextLabel) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== selectedOrder.id) return o;
        return {
          ...o,
          status: nextStatus,
          statusLabel: nextLabel,
          timeline: [
            ...o.timeline,
            {
              title: nextLabel,
              time: 'Just now · Live status update',
              state: nextStatus === 'in_transit' ? 'active' : 'done',
            },
          ],
        };
      })
    );
    triggerNotice(`Order ${selectedOrder.id} status updated to: ${nextLabel}`);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:    { bg: C.warnBg, color: C.warn, border: C.warnBorder, label: 'Pending Review' },
      approved:   { bg: C.successBg, color: C.success, border: C.successBorder, label: 'Approved' },
      partial:    { bg: C.infoBg, color: C.info, border: C.infoBorder, label: 'Partial Accepted' },
      in_transit: { bg: C.purpleBg, color: C.purple, border: C.purpleBorder, label: 'In Transit' },
      rejected:   { bg: C.critBg, color: C.crit, border: C.critBorder, label: 'Rejected' },
      delivered:  { bg: C.successBg, color: C.success, border: C.successBorder, label: 'Delivered' },
    };
    return map[status] || map.pending;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1360, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Central Distribution Hub Operations · Multi-Facility Fulfillment
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: 10,
              background: C.roseSoft,
              color: C.rose,
              border: `1px solid ${C.roseBorder}`,
            }}>
              Manager Portal
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
            Central Warehouse Fulfillment Orders
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>
            Review, approve, partially allocate, or dispatch inbound green coffee transfer orders placed by Local Facility Buyers.
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
          animation: 'fadeInMenu 0.15s ease',
        }}>
          {actionNotice.variant === 'crit' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* ── 4 Top Operational KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        {[
          {
            label: 'PENDING APPROVAL',
            value: `${counts.pending} Orders`,
            sub: 'Requires warehouse allocation sign-off',
            color: C.warn,
            bg: C.warnBg,
            border: C.warnBorder,
            icon: Clock,
          },
          {
            label: 'COMMITTED VOLUME',
            value: `${(orders.reduce((sum, o) => o.status !== 'rejected' ? sum + o.acceptedQty : sum, 0) / 1000).toFixed(1)}k kg`,
            sub: 'Across Dallas, Houston & Chicago hubs',
            color: C.plum,
            bg: '#FFFFFF',
            border: C.border,
            icon: Package,
          },
          {
            label: 'DISPATCHED IN TRANSIT',
            value: `${counts.in_transit} Shipments`,
            sub: 'En route to local facility roasting sites',
            color: C.purple,
            bg: C.purpleBg,
            border: C.purpleBorder,
            icon: Truck,
          },
          {
            label: 'CENTRAL OTIF RATE',
            value: '96.2%',
            sub: 'On-time warehouse dispatch reliability',
            color: C.success,
            bg: C.successBg,
            border: C.successBorder,
            icon: ShieldCheck,
          },
        ].map(kpi => {
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {kpi.label}
                </span>
                <Icon size={14} style={{ color: kpi.color }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, lineHeight: 1.1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 10.5, color: C.muted }}>
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2-Column Main Workspace Grid (Left: Orders Queue, Right: Decision Center) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.35fr)', gap: 14, alignItems: 'start' }}>

        {/* ── LEFT COLUMN: Filter Tabs + Orders Queue List ── */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Search & Header */}
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.divider}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search orders by PO#, buyer, green, or facility…"
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  fontSize: 11.5,
                  color: C.text,
                  background: '#FAF8F9',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 4, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                { key: 'all',        label: 'All',        cnt: counts.all },
                { key: 'pending',    label: 'Pending',    cnt: counts.pending, alert: counts.pending > 0 },
                { key: 'approved',   label: 'Approved',   cnt: counts.approved },
                { key: 'partial',    label: 'Partial',    cnt: counts.partial },
                { key: 'in_transit', label: 'Dispatched', cnt: counts.in_transit },
                { key: 'rejected',   label: 'Rejected',   cnt: counts.rejected },
              ].map(t => {
                const isActive = tabFilter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTabFilter(t.key)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: 14,
                      border: `1px solid ${isActive ? C.plum : 'transparent'}`,
                      background: isActive ? C.plum : (t.alert ? C.warnBg : '#F4EEF2'),
                      color: isActive ? '#FFFFFF' : (t.alert ? C.warn : C.text),
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <span>{t.label}</span>
                    <span style={{
                      fontSize: 9.5,
                      padding: '0 4px',
                      borderRadius: 10,
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                    }}>
                      {t.cnt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders Queue Cards */}
          <div style={{ maxHeight: 620, overflowY: 'auto' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 12 }}>
                No central orders found matching the filter criteria.
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrderId === order.id;
                const badge = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: `1px solid ${C.divider}`,
                      borderLeft: isSelected ? `3px solid ${C.rose}` : '3px solid transparent',
                      background: isSelected ? '#FAF2F6' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = C.hover;
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: C.plum }}>{order.id}</span>
                          <span style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}>
                            {order.statusLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text, marginTop: 2 }}>
                          {order.greenId} · {order.greenName}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                          {order.acceptedQty.toLocaleString()} kg
                        </div>
                        <div style={{ fontSize: 9.5, color: C.subtle }}>
                          {order.status === 'partial' ? `Req: ${order.requestedQty.toLocaleString()} kg` : 'Full Order'}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 8,
                      fontSize: 10.5,
                      color: C.muted,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} style={{ color: C.rose }} />
                        <span>{order.destinationSite}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Warehouse size={11} style={{ color: C.subtle }} />
                        <span>{order.warehouse}</span>
                      </div>
                      <div style={{ fontWeight: 600, color: C.text }}>
                        Need: {order.needBy}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Central Manager Fulfillment Decision Center ── */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          padding: '16px 18px',
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
                  background: getStatusBadge(selectedOrder.status).bg,
                  color: getStatusBadge(selectedOrder.status).color,
                  border: `1px solid ${getStatusBadge(selectedOrder.status).border}`,
                }}>
                  {selectedOrder.statusLabel}
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                Placed by <strong>{selectedOrder.buyerName}</strong> ({selectedOrder.buyerTitle}) on {selectedOrder.orderDate}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.subtle, textTransform: 'uppercase' }}>Target Landed Value</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.rose }}>${selectedOrder.totalDelivered.toLocaleString()}</div>
            </div>
          </div>

          {/* Warehouse Inventory Stock Check Banner */}
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
                  {selectedOrder.warehouse} · Stock Availability
                </span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 10,
                background: selectedOrder.warehouseStockAvailable >= selectedOrder.requestedQty ? C.successBg : C.warnBg,
                color: selectedOrder.warehouseStockAvailable >= selectedOrder.requestedQty ? C.success : C.warn,
                border: `1px solid ${selectedOrder.warehouseStockAvailable >= selectedOrder.requestedQty ? C.successBorder : C.warnBorder}`,
              }}>
                {selectedOrder.warehouseStockAvailable >= selectedOrder.requestedQty ? 'Sufficient Uncommitted Buffer' : 'Constrained Stock'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 11 }}>
              <div>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Green ID</div>
                <div style={{ fontWeight: 700, color: C.plum }}>{selectedOrder.greenId}</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Unreserved Stock</div>
                <div style={{ fontWeight: 700, color: C.text }}>{selectedOrder.warehouseStockAvailable.toLocaleString()} kg</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Requested Qty</div>
                <div style={{ fontWeight: 700, color: C.text }}>{selectedOrder.requestedQty.toLocaleString()} kg</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9.5, color: C.subtle }}>Shipping Cost</div>
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
              <strong style={{ color: C.text }}>Local Buyer Note:</strong> {selectedOrder.notes}
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

          {/* ── MANAGER DECISION ACTIONS (Approve, Partial Accept, Reject) ── */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: C.rose }} />
              Warehouse Manager Sourcing Decision
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Approve in Full */}
              <button
                type="button"
                onClick={handleApproveFull}
                disabled={selectedOrder.status === 'approved' || selectedOrder.status === 'in_transit'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '9px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedOrder.status === 'approved' ? C.divider : C.success,
                  color: selectedOrder.status === 'approved' ? C.muted : '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: selectedOrder.status === 'approved' ? 'default' : 'pointer',
                  boxShadow: selectedOrder.status === 'approved' ? 'none' : '0 2px 6px rgba(30,138,60,0.25)',
                }}
              >
                <Check size={13} strokeWidth={2.5} />
                Approve in Full
              </button>

              {/* Partial Accept */}
              <button
                type="button"
                onClick={() => {
                  setPartialInputQty(String(Math.round(selectedOrder.requestedQty * 0.75)));
                  setShowPartialModal(true);
                }}
                disabled={selectedOrder.status === 'rejected' || selectedOrder.status === 'in_transit'}
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

              {/* Reject */}
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={selectedOrder.status === 'rejected'}
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

            {/* Quick Status Progression Stepper for Approved Orders */}
            {selectedOrder.status !== 'rejected' && selectedOrder.status !== 'pending' && (
              <div style={{ marginTop: 6, paddingTop: 10, borderTop: `1px solid ${C.divider}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                  Update Warehouse Logistics Stage:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { status: 'approved',   label: 'Picking & Packing' },
                    { status: 'in_transit', label: 'Dispatched (In Transit)' },
                    { status: 'delivered',  label: 'Delivered at Local Site' },
                  ].map(step => (
                    <button
                      key={step.status}
                      type="button"
                      onClick={() => handleUpdateExecutionStatus(step.status, step.label)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: `1px solid ${selectedOrder.status === step.status ? C.plum : C.border}`,
                        background: selectedOrder.status === step.status ? C.plum : '#FFFFFF',
                        color: selectedOrder.status === step.status ? '#FFFFFF' : C.text,
                        fontSize: 10.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stepper Timeline */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Order Lifecycle Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {selectedOrder.timeline.map((step, idx) => {
                const isLast = idx === selectedOrder.timeline.length - 1;
                const isDone = step.state === 'done';
                const isActive = step.state === 'active';
                const isCritActive = step.state === 'active-crit';

                return (
                  <div key={idx} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16 }}>
                      {isDone ? (
                        <div style={{ width: 15, height: 15, borderRadius: '50%', background: C.plum, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={9} strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div style={{ width: 15, height: 15, borderRadius: '50%', background: C.rose, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                        </div>
                      ) : isCritActive ? (
                        <div style={{ width: 15, height: 15, borderRadius: '50%', background: C.crit, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <XCircle size={10} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div style={{ width: 15, height: 15, borderRadius: '50%', border: `1.5px solid ${C.border}`, background: '#fff' }} />
                      )}
                      {!isLast && <div style={{ width: 1.5, flex: 1, minHeight: 18, background: isDone ? '#BFAAB6' : C.divider, margin: '2px 0' }} />}
                    </div>

                    <div style={{ paddingBottom: isLast ? 0 : 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isCritActive ? C.crit : (isActive ? C.rose : C.text) }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>
                        {step.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── Partial Accept Modal ── */}
      {showPartialModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(48,39,43,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 16,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            boxShadow: '0 12px 32px rgba(48,39,43,0.18)',
            width: '100%',
            maxWidth: 420,
            padding: 22,
            animation: 'fadeInMenu 0.15s ease',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>
              Partial Order Acceptance
            </h3>
            <p style={{ fontSize: 11.5, color: C.muted, margin: '0 0 14px' }}>
              Buyer requested <strong>{selectedOrder.requestedQty.toLocaleString()} kg</strong> of {selectedOrder.greenName}. Enter the maximum quantity {selectedOrder.warehouse} can commit today:
            </p>

            <form onSubmit={handleConfirmPartial} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  Committed Allocation Quantity (kg)
                </label>
                <input
                  type="number"
                  value={partialInputQty}
                  onChange={e => setPartialInputQty(e.target.value)}
                  placeholder="e.g. 800"
                  max={selectedOrder.requestedQty - 1}
                  min={1}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  Rationale for Buyer / Backorder Note
                </label>
                <input
                  type="text"
                  value={partialReasonInput}
                  onChange={e => setPartialReasonInput(e.target.value)}
                  placeholder="e.g. Uncommitted warehouse buffer limit reached"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowPartialModal(false)}
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
          background: 'rgba(48,39,43,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 16,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            boxShadow: '0 12px 32px rgba(48,39,43,0.18)',
            width: '100%',
            maxWidth: 420,
            padding: 22,
            animation: 'fadeInMenu 0.15s ease',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.crit, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={17} /> Reject Transfer Order
            </h3>
            <p style={{ fontSize: 11.5, color: C.muted, margin: '0 0 14px' }}>
              Provide an official operational reason for rejecting order <strong>{selectedOrder.id}</strong> from {selectedOrder.destinationSite}:
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  Select Standard Reason
                </label>
                <select
                  value={rejectReasonInput}
                  onChange={e => setRejectReasonInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 11.5,
                    color: C.text,
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Insufficient uncommitted buffer for delivery window">Insufficient uncommitted buffer for delivery window</option>
                  <option value="Batch placed under QA moisture quarantine hold">Batch placed under QA moisture quarantine hold</option>
                  <option value="Transit carrier equipment bottleneck / unavailable dispatch date">Transit carrier equipment bottleneck / unavailable dispatch date</option>
                  <option value="Committed to standing strategic corporate roasting contract">Committed to standing strategic corporate roasting contract</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
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
                    background: C.crit,
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Order Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
