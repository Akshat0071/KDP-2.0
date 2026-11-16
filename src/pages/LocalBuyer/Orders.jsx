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
  Calendar,
  AlertTriangle,
  Info,
  XCircle,
  Shield,
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
import { useOrders, getOrderStatusMeta, ORDER_LIFECYCLE } from '../../context/OrdersContext';
import { findCheapestLocalOption } from '../../data/localInventory';

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
    buyerApprove,
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
  const initialOrderId = paramId || (siteOrders[0]?.id || 'PO-2846');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);

  // Sourcing Scenarios & Comparison state (matches Figma design)
  const [compareFilter, setCompareFilter] = useState('all'); // 'all' | 'local' | 'central' | 'same_green' | 'alternate' | 'feasible_only'
  const [selectedScenarioId, setSelectedScenarioId] = useState('sc-1');
  const [viewTrackingTab, setViewTrackingTab] = useState(false);

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

  // Dynamic 5-Scenario Evaluation (matches Figma mockup: 3 feasible + 2 excluded)
  const evaluationScenarios = useMemo(() => {
    const qty = currentOrder.orderQuantity || 1200;
    const needBy = currentOrder.needBy || 'Nov 05';
    const baseGreenId = currentOrder.greenId || 'Gb-04';
    const baseGreenName = currentOrder.greenName || 'Colombia Supremo';

    return [
      {
        id: 'sc-1',
        num: 1,
        scenarioTag: 'SCENARIO 2 · LOCAL · ALTERNATE',
        isRecommended: true,
        isFeasible: true,
        sourceType: 'local',
        matchType: 'alternate',
        title: currentOrder.allocatedGreenName
          ? `${currentOrder.allocatedGreenId} — ${currentOrder.allocatedGreenName}`
          : 'Gc-14 — Brazil Cerrado Natural',
        greenId: currentOrder.allocatedGreenId || 'Gc-14',
        greenName: currentOrder.allocatedGreenName || 'Brazil Cerrado Natural',
        subtitle: 'Austin Local · Lot L-1171 · 2,400 kg avail · covers 200% of need',
        totalDelivered: 5112,
        totalDeliveredStr: '$5,112',
        perKgStr: '$4.26/kg',
        arrivalStr: 'Oct 30',
        arrivalIcon: 'calendar',
        savingsBadge: '$1,188 saved vs baseline',
        rationale: `Lowest total delivered cost. In-hand stock, no transfer, arrives 6 days early. Approved alternate (one-way ${baseGreenId} || Gc-14).`,
        whyWinsLong: '$300 cheaper than WH-02 same-green and arrives 3 days earlier. Cup-score 83.5 vs 84.0 — within approved tolerance.',
        warningNotice: 'Substitution acknowledgement required at confirmation. Roast profile R-22 applies.',
        subNotice: `Approved alternate to ${baseGreenId} · One-way substitution`,
        breakdownRows: [
          { label: `Bean cost — ${qty.toLocaleString()} kg × $3.90`, val: '$4,680' },
          { label: 'Local handling + QA', val: '$132' },
          { label: 'Internal transfer (local — none)', val: '$0' },
          { label: 'Expedite / pallet fee', val: '$300' },
        ],
      },
      {
        id: 'sc-2',
        num: 2,
        scenarioTag: 'SCENARIO 3 · CENTRAL · SAME GREEN',
        isRecommended: false,
        isFeasible: true,
        sourceType: 'central',
        matchType: 'same_green',
        title: `${baseGreenId} — ${baseGreenName} (exact)`,
        greenId: baseGreenId,
        greenName: `${baseGreenName} (exact)`,
        subtitle: 'WH-02 Dallas · 5,200 kg avail · 2-day transfer · covers 433% of need',
        totalDelivered: 5412,
        totalDeliveredStr: '$5,412',
        perKgStr: '$4.51/kg',
        arrivalStr: 'Nov 02',
        arrivalIcon: 'truck',
        savingsBadge: '$888 saved vs baseline',
        rationale: 'Exact match, $300 more than Option 1 due to $420 freight + $110 handling. Still arrives 3 days before deadline.',
        whyWinsLong: 'Exact botanical origin and moisture spec. Zero substitution risk, delivers directly via regional shuttle.',
        warningNotice: null,
        subNotice: 'Direct exact green fulfillment from WH-02 Dallas Hub',
        breakdownRows: [
          { label: `Bean cost — ${qty.toLocaleString()} kg × $4.00`, val: '$4,800' },
          { label: 'Local handling + QA', val: '$110' },
          { label: 'Internal transfer (WH-02 freight)', val: '$420' },
          { label: 'Expedite / pallet fee', val: '$82' },
        ],
      },
      {
        id: 'sc-3',
        num: 3,
        scenarioTag: 'SCENARIO 4 · CENTRAL · ALTERNATE',
        isRecommended: false,
        isFeasible: true,
        sourceType: 'central',
        matchType: 'alternate',
        title: 'Gb-12 — Huila Washed (approved alt)',
        greenId: 'Gb-12',
        greenName: 'Huila Washed (approved alt)',
        subtitle: 'WH-01 Chicago · 3,100 kg avail · 3-day transfer · covers 258% of need',
        totalDelivered: 5890,
        totalDeliveredStr: '$5,890',
        perKgStr: '$4.91/kg',
        arrivalStr: 'Nov 03',
        arrivalIcon: 'truck',
        savingsBadge: '$410 saved vs baseline',
        rationale: 'Feasible alternate but higher freight ($610) from Chicago. Backup if local lot is held.',
        whyWinsLong: 'Backup option if local lot is held. Reliable stock available at Chicago hub.',
        warningNotice: 'Requires secondary cupping approval before blending.',
        subNotice: 'Approved secondary alternate · Two-way substitution',
        breakdownRows: [
          { label: `Bean cost — ${qty.toLocaleString()} kg × $4.10`, val: '$4,920' },
          { label: 'Local handling + QA', val: '$180' },
          { label: 'Internal transfer (WH-01 freight)', val: '$610' },
          { label: 'Expedite / pallet fee', val: '$180' },
        ],
      },
      {
        id: 'sc-4',
        num: 4,
        scenarioTag: 'SCENARIO 1 · LOCAL · SAME GREEN • Excluded',
        isRecommended: false,
        isFeasible: false,
        sourceType: 'local',
        matchType: 'same_green',
        title: `${baseGreenId} — ${baseGreenName} (exact)`,
        greenId: baseGreenId,
        greenName: `${baseGreenName} (exact)`,
        subtitle: 'Austin Local · Lot L-1180 · 500 kg avail • short by 700 kg',
        totalDelivered: null,
        totalDeliveredStr: '—',
        perKgStr: '—',
        arrivalStr: null,
        arrivalBadge: 'Insufficient qty',
        arrivalIcon: 'truck',
        savingsBadge: null,
        rationale: `Only 500 kg available after 320 kg reserved. Cannot cover ${qty.toLocaleString()} kg. Suggested: combine is not allowed — single-source rule.`,
        whyWinsLong: 'Local warehouse stock is depleted below batch safety threshold. Partial split orders are blocked by single-source QA compliance policy.',
        warningNotice: 'Blocked by Single-Source Inventory Policy.',
        subNotice: 'Infeasible Local Stock Allocation',
        breakdownRows: [
          { label: 'Bean cost (insufficient)', val: '—' },
          { label: 'Shortfall', val: '700 kg short' },
          { label: 'Feasibility status', val: 'Disqualified' },
        ],
      },
      {
        id: 'sc-5',
        num: 5,
        scenarioTag: 'SCENARIO 5 · CENTRAL · SAME GREEN • Excluded',
        isRecommended: false,
        isFeasible: false,
        sourceType: 'central',
        matchType: 'same_green',
        title: `${baseGreenId} ex WH-03 Portland`,
        greenId: baseGreenId,
        greenName: `${baseGreenId} ex WH-03 Portland`,
        subtitle: 'WH-03 Portland · Incoming 4,000 kg ETA Nov 07 • arrives after deadline',
        totalDelivered: null,
        totalDeliveredStr: '—',
        perKgStr: '—',
        arrivalStr: 'Nov 09',
        arrivalBadge: `Misses ${needBy} deadline`,
        arrivalIcon: 'truck',
        savingsBadge: null,
        rationale: 'Inbound arrives Nov 07, earliest Austin delivery Nov 09 — 4 days late. Incoming not counted as available. Excluded as infeasible.',
        whyWinsLong: 'Inbound maritime shipment arrives at Portland port after local roasting cut-off. Transit days exceed schedule tolerance.',
        warningNotice: 'Arrival date breaches roasting batch SLA.',
        subNotice: 'Infeasible Inbound Schedule Allocation',
        breakdownRows: [
          { label: 'Inbound ETA at Hub', val: 'Nov 07' },
          { label: 'Earliest Dock Delivery', val: 'Nov 09' },
          { label: 'Schedule Variance', val: '+4 days late' },
        ],
      },
    ];
  }, [currentOrder]);

  // Filtered scenarios for display
  const filteredScenarios = useMemo(() => {
    return evaluationScenarios.filter(sc => {
      if (compareFilter === 'all') return true;
      if (compareFilter === 'local') return sc.sourceType === 'local';
      if (compareFilter === 'central') return sc.sourceType === 'central';
      if (compareFilter === 'same_green') return sc.matchType === 'same_green';
      if (compareFilter === 'alternate') return sc.matchType === 'alternate';
      if (compareFilter === 'feasible_only') return sc.isFeasible;
      return true;
    });
  }, [evaluationScenarios, compareFilter]);

  const feasibleScenarios = useMemo(() => {
    return filteredScenarios.filter(s => s.isFeasible);
  }, [filteredScenarios]);

  const excludedScenarios = useMemo(() => {
    return filteredScenarios.filter(s => !s.isFeasible);
  }, [filteredScenarios]);

  const activeScenario = useMemo(() => {
    return evaluationScenarios.find(s => s.id === selectedScenarioId) || evaluationScenarios[0];
  }, [evaluationScenarios, selectedScenarioId]);

  // Handle order selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setSelectedScenarioId('sc-1');
  };

  // Actions for Local Buyer
  const handleBuyerApprove = () => {
    const selectedOpt = {
      id: activeScenario.id,
      title: activeScenario.title,
      totalPrice: activeScenario.totalDeliveredStr,
      greenId: activeScenario.greenId,
      isLocalFulfilled: activeScenario.sourceType === 'local',
      eta: activeScenario.arrivalStr,
    };
    buyerApprove(currentOrder.id, selectedOpt);
    triggerNotice(`Order ${currentOrder.id} approved by Local Buyer using ${activeScenario.title}.`);
  };

  const handleBuyerRequest = () => {
    const selectedOpt = {
      id: activeScenario.id,
      title: activeScenario.title,
      totalPrice: activeScenario.totalDeliveredStr,
      greenId: activeScenario.greenId,
      isLocalFulfilled: activeScenario.sourceType === 'local',
      eta: activeScenario.arrivalStr,
    };
    buyerRequestTransfer(currentOrder.id, selectedOpt);
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
    setSelectedScenarioId('sc-1');

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
    navigate('/confirm-order', {
      state: {
        order: currentOrder,
        option: {
          id: activeScenario.id,
          greenId: activeScenario.greenId,
          greenName: activeScenario.greenName,
          source: activeScenario.sourceType.toUpperCase(),
          arrivalDate: activeScenario.arrivalStr || currentOrder.needBy,
          totalDelivered: activeScenario.totalDelivered || currentOrder.totalDelivered || 5112,
          isAlternate: activeScenario.isAlternate,
          isLocalFulfilled: activeScenario.isLocal,
          costBreakdown: activeScenario.breakdownRows,
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
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(48,39,43,0.04), 0 1px 3px rgba(48,39,43,0.02)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* ── SECTION 1: MINIMALIST HEADER & SPECIFICATION STRIP ── */}
          <div style={{
            padding: '18px 24px 16px',
            borderBottom: `1px solid ${C.divider}`,
            background: '#FFFFFF',
          }}>
            {/* Top Row: Location & Status Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
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
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 700,
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
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 700,
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

            {/* Main Order ID Title & Clean Subtitle */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1F171B', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                {currentOrder.id}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>
                {currentOrder.orderType === 'REPLENISHMENT' ? (
                  <span style={{ fontWeight: 700, color: '#16A34A' }}>
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

            {/* Minimalist Professional Specs Strip (Single clean surface, unboxed) */}
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
                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Green Material
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentOrder.greenId} · {currentOrder.greenName}
                </div>
              </div>

              {/* Metric 2: Quantity */}
              <div style={{ padding: '0 12px', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Order Quantity
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>
                  {currentOrder.quantityStr || `${(currentOrder.orderQuantity || 0).toLocaleString()} kg`}
                </div>
              </div>

              {/* Metric 3: Need-By Target */}
              <div style={{ padding: '0 12px', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Need-By Date
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>
                  {currentOrder.needByFull || currentOrder.needBy || 'On Schedule'}
                </div>
              </div>

              {/* Metric 4: Shipment Ref */}
              <div style={{ paddingLeft: 12 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Shipment Tracking
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: currentOrder.shipmentId ? C.rose : C.subtle, marginTop: 2 }}>
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
                        fontSize: 13,
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

          {/* ── BODY AREA: Padding 20px ── */}
          <div style={{
            padding: '18px 24px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>

            {/* In-Flight Order Mode Switcher (If order is already past New stage) */}
            {currentOrder.status !== 'new' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: '#FAF8F9',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setViewTrackingTab(false)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: !viewTrackingTab ? 700 : 500,
                      background: !viewTrackingTab ? '#FFFFFF' : 'transparent',
                      color: !viewTrackingTab ? C.text : C.muted,
                      border: !viewTrackingTab ? `1px solid ${C.border}` : '1px solid transparent',
                      cursor: 'pointer',
                      boxShadow: !viewTrackingTab ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                    }}
                  >
                    Sourcing Scenarios (5 Evaluated)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTrackingTab(true)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: viewTrackingTab ? 700 : 500,
                      background: viewTrackingTab ? '#FFFFFF' : 'transparent',
                      color: viewTrackingTab ? C.text : C.muted,
                      border: viewTrackingTab ? `1px solid ${C.border}` : '1px solid transparent',
                      cursor: 'pointer',
                      boxShadow: viewTrackingTab ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Truck size={12} />
                    Active Tracking & Execution ({currentMeta.label})
                  </button>
                </div>

                <span style={{ fontSize: 10.5, color: C.subtle }}>
                  Status: <strong style={{ color: currentMeta.color }}>{currentMeta.label}</strong>
                </span>
              </div>
            )}

            {/* ── VIEW 1: SOURCING SCENARIOS COMPARISON (Matches Figma Mockup) ── */}
            {!viewTrackingTab ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Top Filter & Compare Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 4,
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {/* Left: Filter Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginRight: 2 }}>
                      Compare:
                    </span>
                    {[
                      { id: 'all', label: 'All (5)' },
                      { id: 'local', label: 'Local (2)' },
                      { id: 'central', label: 'Central (3)' },
                      { id: 'same_green', label: 'Same green (3)' },
                      { id: 'alternate', label: 'Alternate (2)' },
                      { id: 'feasible_only', label: 'Feasible only' },
                    ].map(tab => {
                      const isTabActive = compareFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCompareFilter(tab.id)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: isTabActive ? 700 : 500,
                            background: isTabActive ? '#30272B' : '#FFFFFF',
                            color: isTabActive ? '#FFFFFF' : C.text,
                            border: `1px solid ${isTabActive ? '#30272B' : C.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Feasibility Hint */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.subtle, fontSize: 11 }}>
                    <Info size={13} style={{ color: C.subtle }} />
                    <span>Feasibility = qty + substitution + arrival date</span>
                  </div>
                </div>

                {/* Two-Column Sourcing Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(310px, 0.95fr)', gap: 16, alignItems: 'start' }}>

                  {/* LEFT SUB-COLUMN: Scenario Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* 1. Feasible Scenarios */}
                    {feasibleScenarios.map(sc => {
                      const isSelected = selectedScenarioId === sc.id;
                      return (
                        <div
                          key={sc.id}
                          onClick={() => setSelectedScenarioId(sc.id)}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: 10,
                            border: isSelected ? `1.5px solid ${C.rose}` : `1px solid ${C.border}`,
                            padding: '14px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                            boxShadow: isSelected ? '0 2px 10px rgba(216,63,121,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          {/* Top Row: Number badge, Scenario tag, Recommended badge & Select button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                              {/* Number Circle Badge */}
                              <span style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: sc.num === 1 ? '#30272B' : '#EAE5E9',
                                color: sc.num === 1 ? '#FFFFFF' : '#5C4E57',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                              }}>
                                {sc.num}
                              </span>

                              {/* Scenario Tag */}
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#746970', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                                {sc.scenarioTag}
                              </span>

                              {/* Recommended Badge */}
                              {sc.isRecommended && (
                                <span style={{
                                  fontSize: 9.5,
                                  fontWeight: 600,
                                  padding: '2px 7px',
                                  borderRadius: 10,
                                  background: '#30272B',
                                  color: '#FFFFFF',
                                }}>
                                  Recommended
                                </span>
                              )}
                            </div>

                            {/* Top Right Action Button & Cost breakdown link */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                              {isSelected ? (
                                <button
                                  type="button"
                                  style={{
                                    padding: '5px 14px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#30272B',
                                    color: '#FFFFFF',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'default',
                                  }}
                                >
                                  Selected
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSelectedScenarioId(sc.id);
                                  }}
                                  style={{
                                    padding: '5px 14px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: C.rose,
                                    color: '#FFFFFF',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s ease',
                                  }}
                                >
                                  Select This Option
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedScenarioId(sc.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  color: C.rose,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  marginTop: 1,
                                }}
                              >
                                Cost breakdown
                              </button>
                            </div>
                          </div>

                          {/* Title & Subtitle */}
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                              {sc.title}
                            </div>
                            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
                              {sc.subtitle}
                            </div>
                          </div>

                          {/* Metrics Row: Total delivered, Per kg, Arrival, Savings Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>
                                Total delivered
                              </div>
                              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 1 }}>
                                {sc.totalDeliveredStr}
                              </div>
                            </div>

                            <div>
                              <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>
                                Per kg
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 1 }}>
                                {sc.perKgStr}
                              </div>
                            </div>

                            <div>
                              <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>
                                Arrival
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 1, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {sc.arrivalIcon === 'calendar' ? <Calendar size={13} style={{ color: C.muted }} /> : <Truck size={13} style={{ color: C.muted }} />}
                                {sc.arrivalStr}
                              </div>
                            </div>

                            {sc.savingsBadge && (
                              <div style={{
                                padding: '3px 8px',
                                borderRadius: 4,
                                background: '#EAF7EE',
                                color: '#1E8A3C',
                                border: '1px solid #C7EBD0',
                                fontSize: 10,
                                fontWeight: 700,
                              }}>
                                {sc.savingsBadge}
                              </div>
                            )}
                          </div>

                          {/* Footer Callout with Checkmark */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 7,
                            paddingTop: 8,
                            borderTop: `1px solid ${C.divider}`,
                            fontSize: 10.5,
                            color: '#5C4E57',
                            lineHeight: 1.4,
                          }}>
                            <CheckCircle2 size={13} style={{ color: '#30272B', flexShrink: 0, marginTop: 2 }} />
                            <span>{sc.rationale}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* 2. Excluded Section */}
                    {excludedScenarios.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#746970', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          EXCLUDED — WITH REASONS ({excludedScenarios.length})
                        </div>

                        {excludedScenarios.map(sc => {
                          const isSelected = selectedScenarioId === sc.id;
                          return (
                            <div
                              key={sc.id}
                              onClick={() => setSelectedScenarioId(sc.id)}
                              style={{
                                background: '#FAF9FA',
                                borderRadius: 10,
                                border: isSelected ? `1.5px solid ${C.rose}` : `1px solid ${C.border}`,
                                padding: '14px 16px',
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              {/* Top Row: Number badge, Scenario tag & View Why button */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                                  <span style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: '#EAE5E9',
                                    color: '#8C7F87',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}>
                                    {sc.num}
                                  </span>

                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#746970', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                                    {sc.scenarioTag}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setSelectedScenarioId(sc.id);
                                    }}
                                    style={{
                                      padding: '4px 12px',
                                      borderRadius: 6,
                                      border: `1px solid ${C.border}`,
                                      background: '#F0EAEE',
                                      color: C.text,
                                      fontSize: 10.5,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    View Why
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setSelectedScenarioId(sc.id);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      color: C.rose,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      marginTop: 1,
                                    }}
                                  >
                                    Cost breakdown
                                  </button>
                                </div>
                              </div>

                              {/* Title & Subtitle */}
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                                  {sc.title}
                                </div>
                                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
                                  {sc.subtitle}
                                </div>
                              </div>

                              {/* Metrics Row: Blanked out with Warning Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10, flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>
                                    Total delivered
                                  </div>
                                  <div style={{ fontSize: 16, fontWeight: 700, color: C.subtle, marginTop: 1 }}>
                                    —
                                  </div>
                                </div>

                                <div>
                                  <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>
                                    Per kg
                                  </div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: C.subtle, marginTop: 1 }}>
                                    —
                                  </div>
                                </div>

                                <div>
                                  <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>
                                    Arrival
                                  </div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginTop: 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Truck size={13} style={{ color: C.muted }} />
                                    {sc.arrivalStr && <span>{sc.arrivalStr}</span>}
                                    {sc.arrivalBadge && (
                                      <span style={{
                                        padding: '2px 7px',
                                        borderRadius: 4,
                                        background: '#EAE5E9',
                                        color: '#5C4E57',
                                        fontSize: 10,
                                        fontWeight: 600,
                                      }}>
                                        {sc.arrivalBadge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Footer Callout with X */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 7,
                                paddingTop: 8,
                                borderTop: `1px solid ${C.divider}`,
                                fontSize: 10.5,
                                color: '#5C4E57',
                                lineHeight: 1.4,
                              }}>
                                <XCircle size={13} style={{ color: '#746970', flexShrink: 0, marginTop: 2 }} />
                                <span>{sc.rationale}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. Bottom Rules Enforced Strip */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: '#FAF8F9',
                      border: `1px solid ${C.border}`,
                      marginTop: 4,
                    }}>
                      <Shield size={14} style={{ color: '#746970', marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 10.5, color: '#746970', lineHeight: 1.45 }}>
                        <strong>Rules enforced:</strong> no warehouse-to-warehouse, no local-to-local, alternates only if explicitly approved. Incoming counted only if receipt + transfer meet deadline.
                      </div>
                    </div>

                  </div>

                  {/* RIGHT SUB-COLUMN: Sticky Scenario Summary Card */}
                  <div style={{
                    background: '#FFFFFF',
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 13,
                    boxShadow: '0 2px 8px rgba(48,39,43,0.04)',
                    position: 'sticky',
                    top: 14,
                  }}>
                    {/* Header Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: C.rose, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        {activeScenario.isRecommended
                          ? `RECOMMENDED · OPTION ${activeScenario.num}`
                          : `OPTION ${activeScenario.num} · ${activeScenario.sourceType.toUpperCase()}`}
                      </span>
                      {activeScenario.isRecommended && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 10,
                          background: '#EDF7F1',
                          color: '#1E8A3C',
                          border: '1px solid #B4DDBD',
                        }}>
                          BEST VALUE
                        </span>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
                        {activeScenario.title}
                      </div>
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>
                        {activeScenario.subNotice}
                      </div>
                    </div>

                    {/* Itemized Cost Breakdown Table */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7,
                      padding: '10px 0',
                      borderTop: `1px solid ${C.divider}`,
                      borderBottom: `1px solid ${C.divider}`,
                    }}>
                      {activeScenario.breakdownRows.map((row, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: C.muted }}>{row.label}</span>
                          <span style={{ fontWeight: 600, color: C.text }}>{row.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Per-Kg */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Estimated total
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1F171B', lineHeight: 1.1, marginTop: 2 }}>
                          {activeScenario.totalDeliveredStr}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9.5, color: C.subtle }}>Cost per kg</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 1 }}>
                          {activeScenario.perKgStr}
                        </div>
                      </div>
                    </div>

                    {/* Green Callout: Why This Wins */}
                    <div style={{
                      padding: '9px 12px',
                      borderRadius: 6,
                      background: '#EDF7EE',
                      border: '1px solid #C7EBD0',
                      color: '#1E8A3C',
                      fontSize: 10.5,
                      lineHeight: 1.45,
                    }}>
                      <strong>Why this wins:</strong> {activeScenario.whyWinsLong || activeScenario.rationale}
                    </div>

                    {/* Amber Warning Box (if applicable) */}
                    {activeScenario.warningNotice && (
                      <div style={{
                        padding: '9px 12px',
                        borderRadius: 6,
                        background: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        color: '#92400E',
                        fontSize: 10.5,
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                      }}>
                        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{activeScenario.warningNotice}</span>
                      </div>
                    )}

                    {/* Primary Action Button */}
                    {activeScenario.isFeasible ? (
                      <button
                        type="button"
                        onClick={handleProceedToConfirm}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 6,
                          border: 'none',
                          background: '#30272B',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.12s ease',
                          boxShadow: '0 2px 6px rgba(48,39,43,0.15)',
                        }}
                      >
                        Select This Option
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 6,
                          border: `1px solid ${C.border}`,
                          background: '#F0EAEE',
                          color: C.subtle,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'not-allowed',
                          textAlign: 'center',
                        }}
                      >
                        Infeasible Option (Excluded)
                      </button>
                    )}

                    {/* Caption */}
                    <div style={{ fontSize: 9.5, color: C.subtle, textAlign: 'center', marginTop: -4 }}>
                      Estimates simulated · Final invoice may vary
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* ── VIEW 2: ACTIVE TRACKING & EXECUTION ── */
              <div style={{
                background: '#FAF9FA',
                border: `1px solid ${C.divider}`,
                borderRadius: 10,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: currentMeta.bg,
                      border: `1px solid ${currentMeta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentMeta.color,
                    }}>
                      <Truck size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                        Fulfillment & Execution Tracking
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                        Stage: <strong style={{ color: currentMeta.color }}>{currentMeta.label}</strong> · Assigned Actor: <strong>{currentMeta.actor}</strong>
                      </div>
                    </div>
                  </div>
                  <QueueStatusBadge status={currentOrder.status} />
                </div>

                <div style={{
                  fontSize: 11.5,
                  color: C.text,
                  lineHeight: 1.5,
                  background: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                }}>
                  {currentOrder.notes || currentMeta.desc}
                </div>

                {currentOrder.carrierName && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    background: '#FFFFFF',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>
                        Designated Carrier
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                        {currentOrder.carrierName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>
                        Waybill / Tracking No.
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.rose, fontFamily: 'monospace' }}>
                        {currentOrder.trackingNumber || 'DIRECT-SHUTTLE'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>
                        Destination Bay
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                        Site 1054 · Roasting Dock 2
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SECTION 4: CONTEXTUAL LOCAL BUYER ACTION DOCK (BOTTOM BAR) ── */}
          <div style={{
            borderTop: `1px solid ${C.divider}`,
            padding: '14px 24px',
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
                padding: '8px 14px',
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
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                  >
                    Approve Sourcing Option
                  </button>
                  <button
                    disabled={!activeScenario?.isFeasible}
                    onClick={handleProceedToConfirm}
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
                      cursor: activeScenario?.isFeasible ? 'pointer' : 'not-allowed',
                      boxShadow: '0 2px 6px rgba(216,63,121,0.25)',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => {
                      if (activeScenario?.isFeasible) e.currentTarget.style.background = C.roseHover;
                    }}
                    onMouseLeave={e => {
                      if (activeScenario?.isFeasible) e.currentTarget.style.background = C.rose;
                    }}
                  >
                    Proceed to Confirm
                    <ArrowRight size={12} />
                  </button>
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
