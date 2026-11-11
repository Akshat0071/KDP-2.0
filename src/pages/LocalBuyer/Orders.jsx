import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, XCircle } from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';

// ── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  text:    '#30272B',
  muted:   '#746970',
  subtle:  '#9CA3AF',
  border:  '#E6DCE2',
  divider: '#F0EAEE',
  hover:   '#FDFBFC',
  rose:    '#D83F79',
  roseHover: '#C4366B',
  success: '#27A348',
  warn:    '#E07000',
  crit:    '#D83040',
};

// ── Master Orders Queue Data (Aligned with Fact_Table_Orders & Optimization Table) ──
const QUEUE_ORDERS = [
  {
    id: 'PO-2846',
    siteId: '1054',
    fgMaterialId: 'FG-5510',
    fgMaterialDescription: 'Sumatra Reserve Single Origin Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Single Origin',
    greenId: 'Ge-31',
    greenName: 'Sumatra Mandheling Grade 1',
    quantity: '1,500 kg',
    needBy: 'Nov 12',
    needByFull: 'Nov 12, 2026',
    status: 'no-option',
    statusLabel: 'No feasible option',
    category: 'decision',
    urgencyRank: 1,
    evaluatedCount: 3,
    feasibleCount: 0,
    recommendedCount: 0,
    approvalRequired: 'Resolution required',
    cascade: [
      { step: '1 Local same green', note: '0 kg available in Site 1054', status: 'fail' },
      { step: '2 Local approved alternates', note: 'No alternate mapped in green dimensions', status: 'fail' },
      { step: '3 Central warehouse', note: '0 kg in assigned Warehouse 1055', status: 'fail' },
    ],
    cascadeNote: 'All evaluation scenarios exhausted. External green procurement or blend spec waiver needed.',
    options: [],
    ineligible: [
      '✕ Local Site 1054 · 0 kg unreserved inventory',
      '✕ Approved alternate is null for Ge-31 in dimension table',
      '✕ Assigned Warehouse 1055 has 0 kg uncommitted inventory',
    ],
    defaultSelectedOption: null,
  },
  {
    id: 'PO-2843',
    siteId: '1054',
    fgMaterialId: 'FG-4401',
    fgMaterialDescription: 'Dark Magic Blend Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Signature Blend',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo Washed',
    quantity: '1,200 kg',
    needBy: 'Nov 10',
    needByFull: 'Nov 10, 2026',
    status: 'at-risk',
    statusLabel: 'At risk · Warehouse Transit',
    category: 'risk',
    urgencyRank: 2,
    evaluatedCount: 2,
    feasibleCount: 1,
    recommendedCount: 1,
    approvalRequired: 'Transfer dispatch sign-off required',
    cascade: [
      { step: '1 Local same green', note: 'Insufficient stock (800 kg / 1,200 kg in Site 1054)', status: 'fail' },
      { step: '2 Local approved alternates', note: '0 full-quantity alternate available', status: 'fail' },
      { step: '3 Central warehouse', note: 'Feasible option found in assigned Warehouse 1055', status: 'pass' },
    ],
    cascadeNote: 'Central transfer required from assigned lowest-freight warehouse (Warehouse 1055).',
    options: [
      {
        id: 'opt-2843-1',
        tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
        bestValue: true,
        title: 'Warehouse 1055 Fulfillment',
        subtitle: '5,200 kg available · covers full 1,200 kg requirement',
        totalPrice: '$5,269',
        perKg: '$4.39 / kg',
        baselineComparison: 'Assigned lowest-freight route ($589 shipping cost)',
        eta: 'ETA Nov 10 · On schedule',
        etaRisk: false,
        optionName: 'Gc-04 · Colombia Supremo Washed',
        optionSub: 'Warehouse 1055 Central Transfer',
        breakdown: [
          { label: 'Green / bean cost', val: '$4,680' },
          { label: 'Shipping cost (fixed)', val: '$589' },
        ],
        totalDelivered: '$5,269',
        totalPerKg: '$4.39 per kg',
        savingsTag: 'OPTIMAL LOWEST FREIGHT',
        whyWins: [
          'Exact green match (Gc-04 Colombia Supremo Washed)',
          'Assigned lowest-freight warehouse (Warehouse 1055, $589 fixed cost)',
        ],
      },
    ],
    ineligible: [
      '✕ Local Site 1054 · 800 kg available — 400 kg short of order quantity',
      '✕ Warehouses 1020 & 1021 excluded — non-designated higher freight routes',
    ],
    defaultSelectedOption: 0,
  },
  {
    id: 'PO-2842',
    siteId: '1054',
    fgMaterialId: 'FG-3108',
    fgMaterialDescription: 'Barista Reserve Medium Roast K-Cup',
    brand: 'The Original Donut Shop',
    brandType: 'Signature Roast',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    quantity: '800 kg',
    needBy: 'Nov 09',
    needByFull: 'Nov 09, 2026',
    status: 'needs-signoff',
    statusLabel: 'Needs sign-off',
    category: 'decision',
    urgencyRank: 3,
    evaluatedCount: 2,
    feasibleCount: 2,
    recommendedCount: 1,
    approvalRequired: 'Buyer sign-off required',
    cascade: [
      { step: '1 Local same green', note: 'Insufficient local on-hand (600 kg reserved)', status: 'fail' },
      { step: '2 Local approved alternates', note: '1 approved alternate found in Site 1054 (Gc-14)', status: 'pass' },
      { step: '3 Central warehouse', note: 'Warehouse 1055 feasible with shipping cost', status: 'pass' },
    ],
    cascadeNote: 'Local alternate saves $589 in shipping cost and satisfies roasting spec.',
    options: [
      {
        id: 'opt-2842-1',
        tag: 'LOCAL ALTERNATE · Gc-14',
        bestValue: true,
        title: 'Local approved alternate',
        subtitle: '1,300 kg available · covers full 800 kg',
        totalPrice: '$3,280',
        perKg: '$4.10 / kg',
        baselineComparison: 'Zero freight cost with approved alternate',
        eta: 'ETA Nov 08 · 1 day early',
        etaRisk: false,
        optionName: 'Gc-14 · Guatemala Antigua SHB',
        optionSub: 'Local Site 1054 Approved Alternate',
        breakdown: [
          { label: 'Green / bean cost', val: '$3,280' },
          { label: 'Shipping cost', val: '$0' },
        ],
        totalDelivered: '$3,280',
        totalPerKg: '$4.10 per kg',
        savingsTag: 'ZERO FREIGHT COST',
        whyWins: [
          'Lowest-cost feasible option',
          'Full quantity available locally in Site 1054 with zero freight',
        ],
      },
      {
        id: 'opt-2842-2',
        tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
        bestValue: false,
        title: 'Warehouse 1055 Exact Green Match',
        subtitle: '8,000 kg available in central warehouse',
        totalPrice: '$3,309',
        perKg: '$4.14 / kg',
        baselineComparison: 'Exact bean match with $589 fixed freight',
        eta: 'ETA Nov 09 · On time',
        etaRisk: false,
        optionName: 'Gc-11 · Brazil Cerrado Natural',
        optionSub: 'Warehouse 1055 Central Transfer',
        breakdown: [
          { label: 'Green / bean cost', val: '$2,720' },
          { label: 'Shipping cost (fixed)', val: '$589' },
        ],
        totalDelivered: '$3,309',
        totalPerKg: '$4.14 per kg',
        savingsTag: 'EXACT GREEN MATCH',
        whyWins: [
          'Exact requested green (Gc-11 Brazil Cerrado Natural)',
          'Sourced from designated lowest-freight warehouse',
        ],
      },
    ],
    ineligible: [
      '✕ Local Gc-11 unreserved stock is 500 kg — 300 kg short',
      '✕ Warehouses 1020 & 1021 excluded per cost-optimization routing rule',
    ],
    defaultSelectedOption: 0,
  },
  {
    id: 'PO-2844',
    siteId: '1054',
    fgMaterialId: 'FG-2204',
    fgMaterialDescription: 'Antigua Single Origin Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Single Origin',
    greenId: 'Gc-14',
    greenName: 'Guatemala Antigua SHB',
    quantity: '600 kg',
    needBy: 'Nov 07',
    needByFull: 'Nov 07, 2026',
    status: 'awaiting-approval',
    statusLabel: 'Awaiting approval',
    category: 'decision',
    urgencyRank: 4,
    evaluatedCount: 2,
    feasibleCount: 1,
    recommendedCount: 1,
    approvalRequired: 'Transfer dispatch sign-off needed',
    cascade: [
      { step: '1 Local same green', note: 'Local unreserved stock 400 kg insufficient', status: 'fail' },
      { step: '2 Local approved alternates', note: 'Not required', status: 'skip' },
      { step: '3 Central warehouse', note: 'Warehouse 1055 transfer ready', status: 'pass' },
    ],
    cascadeNote: 'Warehouse 1055 transfer covers the full requirement under designated lowest freight.',
    options: [
      {
        id: 'opt-2844-1',
        tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
        bestValue: true,
        title: 'Warehouse 1055 central transfer',
        subtitle: '4,500 kg available · covers full 600 kg requirement',
        totalPrice: '$3,049',
        perKg: '$5.08 / kg',
        baselineComparison: 'Designated lowest freight warehouse',
        eta: 'ETA Nov 07 · On time',
        etaRisk: false,
        optionName: 'Gc-14 · Guatemala Antigua SHB',
        optionSub: 'Warehouse 1055 Central Dispatch',
        breakdown: [
          { label: 'Green / bean cost', val: '$2,460' },
          { label: 'Shipping cost (fixed)', val: '$589' },
        ],
        totalDelivered: '$3,049',
        totalPerKg: '$5.08 per kg',
        savingsTag: 'LOWEST FREIGHT ROUTE',
        whyWins: [
          'On-time dispatch from assigned hub',
          'Exact Guatemala Antigua SHB spec',
        ],
      },
    ],
    ineligible: [
      '✕ Local on-hand unreserved is 400 kg — 200 kg short',
      '— Alternate evaluation skipped because exact warehouse transfer is feasible',
    ],
    defaultSelectedOption: 0,
  },
  {
    id: 'PO-2847',
    siteId: '1054',
    fgMaterialId: 'FG-6120',
    fgMaterialDescription: 'Tarrazu Estate Reserve Whole Bean',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Limited Edition',
    greenId: 'Gh-08',
    greenName: 'Costa Rica Tarrazu SHB Honey',
    quantity: '1,000 kg',
    needBy: 'Nov 13',
    needByFull: 'Nov 13, 2026',
    status: 'at-risk',
    statusLabel: 'At risk · Transfer Pending',
    category: 'risk',
    urgencyRank: 5,
    evaluatedCount: 2,
    feasibleCount: 1,
    recommendedCount: 1,
    approvalRequired: 'Transfer dispatch sign-off required',
    cascade: [
      { step: '1 Local same green', note: 'Insufficient local on-hand in Site 1054', status: 'fail' },
      { step: '2 Local approved alternates', note: 'No local alternate mapped for Gh-08', status: 'fail' },
      { step: '3 Central warehouse', note: 'Warehouse 1055 available', status: 'pass' },
    ],
    cascadeNote: 'Transfer from Warehouse 1055 to Site 1054 under lowest-freight cost rule.',
    options: [
      {
        id: 'opt-2847-1',
        tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
        bestValue: true,
        title: 'Warehouse 1055 dispatch',
        subtitle: '2,200 kg available · covers full 1,000 kg',
        totalPrice: '$4,889',
        perKg: '$4.89 / kg',
        baselineComparison: 'Assigned hub routing ($589 shipping)',
        eta: 'ETA Nov 13 · On time',
        etaRisk: false,
        optionName: 'Gh-08 · Costa Rica Tarrazu SHB Honey',
        optionSub: 'Warehouse 1055 Dispatch',
        breakdown: [
          { label: 'Green / bean cost', val: '$4,300' },
          { label: 'Shipping cost (fixed)', val: '$589' },
        ],
        totalDelivered: '$4,889',
        totalPerKg: '$4.89 per kg',
        savingsTag: 'LOWEST FREIGHT ROUTE',
        whyWins: [
          'Full 1,000 kg availability in assigned hub',
          'Honey processed specialty grade',
        ],
      },
    ],
    ineligible: [
      '✕ Site 1054 local stock has only 80 kg unreserved',
      '✕ No alternate mapped for honey process spec in dimension table',
    ],
    defaultSelectedOption: 0,
  },
  {
    id: 'PO-2848',
    siteId: '1054',
    fgMaterialId: 'FG-1802',
    fgMaterialDescription: 'Dukale\'s Blend Single Serve Pods 24ct',
    brand: 'Laughing Man Coffee',
    brandType: 'Signature Blend',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    quantity: '900 kg',
    needBy: 'Nov 14',
    needByFull: 'Nov 14, 2026',
    status: 'needs-signoff',
    statusLabel: 'Needs sign-off',
    category: 'decision',
    urgencyRank: 6,
    evaluatedCount: 2,
    feasibleCount: 1,
    recommendedCount: 1,
    approvalRequired: 'Buyer sign-off required',
    cascade: [
      { step: '1 Local same green', note: 'Site 1054 stock 250 kg insufficient', status: 'fail' },
      { step: '2 Local approved alternates', note: '1 approved alternate found (Gc-11)', status: 'pass' },
      { step: '3 Central warehouse', note: 'Warehouse 1055 available with shipping cost', status: 'pass' },
    ],
    cascadeNote: 'Local alternate Gc-11 saves $589 in shipping cost vs warehouse dispatch.',
    options: [
      {
        id: 'opt-2848-1',
        tag: 'LOCAL ALTERNATE · Gc-11',
        bestValue: true,
        title: 'Local approved alternate',
        subtitle: '1,600 kg available · covers full 900 kg',
        totalPrice: '$3,060',
        perKg: '$3.40 / kg',
        baselineComparison: 'Zero shipping cost with approved alternate',
        eta: 'ETA Nov 13 · 1 day early',
        etaRisk: false,
        optionName: 'Gc-11 · Brazil Cerrado Natural',
        optionSub: 'Site 1054 Local Alternate',
        breakdown: [
          { label: 'Green / bean cost', val: '$3,060' },
          { label: 'Shipping cost', val: '$0' },
        ],
        totalDelivered: '$3,060',
        totalPerKg: '$3.40 per kg',
        savingsTag: 'ZERO FREIGHT COST',
        whyWins: [
          'Approved substitute in dimension green alternate mapping',
          'Zero shipping cost ($589 saved)',
        ],
      },
    ],
    ineligible: [
      '✕ Local Gd-09 only 250 kg available in Site 1054',
      '✕ Central warehouse dispatch adds $589 freight cost',
    ],
    defaultSelectedOption: 0,
  },
  {
    id: 'PO-2841',
    siteId: '1054',
    fgMaterialId: 'FG-1801',
    fgMaterialDescription: 'Dukale\'s Blend Whole Bean 12oz',
    brand: 'Laughing Man Coffee',
    brandType: 'Signature Blend',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    quantity: '1,200 kg',
    needBy: 'Nov 08',
    needByFull: 'Nov 08, 2026',
    status: 'auto-reserved',
    statusLabel: 'Auto-reserved',
    category: 'track',
    urgencyRank: 7,
    evaluatedCount: 1,
    feasibleCount: 1,
    recommendedCount: 1,
    approvalRequired: 'Auto-confirmed via system rule',
    cascade: [
      { step: '1 Local same green', note: 'Auto-allocated from reserved batch', status: 'pass' },
      { step: '2 Local approved alternates', note: 'Not required', status: 'skip' },
      { step: '3 Central warehouse', note: 'Not required', status: 'skip' },
    ],
    cascadeNote: 'Auto-allocated by scheduler based on priority score and local reserve lock.',
    options: [
      {
        id: 'opt-2841-1',
        tag: 'LOCAL INVENTORY · SITE 1054',
        bestValue: true,
        title: 'Local reserved stock',
        subtitle: '1,200 kg allocated · 100% fulfillable',
        totalPrice: '$5,820',
        perKg: '$4.85 / kg',
        baselineComparison: 'Optimal baseline allocation',
        eta: 'ETA Nov 07 · 1 day early',
        etaRisk: false,
        optionName: 'Gd-09 · Ethiopia Yirgacheffe Natural',
        optionSub: 'Site 1054 Reserved Stock',
        breakdown: [
          { label: 'Green / bean cost', val: '$5,820' },
          { label: 'Shipping cost', val: '$0' },
        ],
        totalDelivered: '$5,820',
        totalPerKg: '$4.85 per kg',
        savingsTag: 'OPTIMAL SOURCING',
        whyWins: [
          'Immediate local on-hand inventory',
          'Zero transfer freight cost',
        ],
      },
    ],
    ineligible: [
      '— No alternate required because exact local inventory was reserved',
    ],
    defaultSelectedOption: 0,
  },
  {
    id: 'PO-2845',
    siteId: '1054',
    fgMaterialId: 'FG-9201',
    fgMaterialDescription: 'Kenya AA Estate Roast Whole Bean',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Estate Select',
    greenId: 'Ga-17',
    greenName: 'Kenya AA Nyeri Grade 1',
    quantity: '800 kg',
    needBy: 'Nov 11',
    needByFull: 'Nov 11, 2026',
    status: 'reserved',
    statusLabel: 'Reserved',
    category: 'track',
    urgencyRank: 8,
    evaluatedCount: 1,
    feasibleCount: 1,
    recommendedCount: 1,
    approvalRequired: 'Ready for batch roast',
    cascade: [
      { step: '1 Local same green', note: 'Allocated from on-hand inventory', status: 'pass' },
      { step: '2 Local approved alternates', note: 'Not required', status: 'skip' },
      { step: '3 Central warehouse', note: 'Not required', status: 'skip' },
    ],
    cascadeNote: 'Reserved on-hand stock ready for production batch.',
    options: [
      {
        id: 'opt-2845-1',
        tag: 'LOCAL INVENTORY · SITE 1054',
        bestValue: true,
        title: 'Local inventory stock',
        subtitle: '4,200 kg uncommitted · covers full 800 kg',
        totalPrice: '$4,160',
        perKg: '$5.20 / kg',
        baselineComparison: 'On target with monthly budget',
        eta: 'ETA Nov 10 · 1 day early',
        etaRisk: false,
        optionName: 'Ga-17 · Kenya AA Nyeri Grade 1',
        optionSub: 'Site 1054 Local Stock',
        breakdown: [
          { label: 'Green / bean cost', val: '$4,160' },
          { label: 'Shipping cost', val: '$0' },
        ],
        totalDelivered: '$4,160',
        totalPerKg: '$5.20 per kg',
        savingsTag: 'ZERO FREIGHT COST',
        whyWins: [
          'High grade Kenya AA specialty bean',
          'Available on-site today',
        ],
      },
    ],
    ineligible: [
      '— No central search needed',
    ],
    defaultSelectedOption: 0,
  },
];

// ── Status Badge Component ───────────────────────────────────────────────────
function QueueStatusBadge({ status, label }) {
  const styles = {
    'no-option':         { bg: '#FEF0F2', color: '#D83040', border: '#F5B8C0' },
    'at-risk':           { bg: '#FEF0F2', color: '#D83040', border: '#F5B8C0' },
    'needs-signoff':     { bg: '#FFF7E6', color: '#B86A00', border: '#F5D68A' },
    'awaiting-approval': { bg: '#FFF8E8', color: '#A07000', border: '#EDD98A' },
    'auto-reserved':     { bg: '#EDF7F1', color: '#1E8A3C', border: '#B4DDBD' },
    'reserved':          { bg: '#EDF7F1', color: '#1E8A3C', border: '#B4DDBD' },
  };
  const s = styles[status] || { bg: '#F7F5FB', color: '#746970', border: '#E6DCE2' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Main Orders Page Component ────────────────────────────────────────────────
export default function Orders() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  // Selected order state (default to PO-2842 or parameter ID)
  const initialOrderId = paramId || 'PO-2842';
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Search and queue filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'decision' | 'risk' | 'track'
  const [sortBy, setSortBy] = useState('urgency');
  const [sourcingSort, setSourcingSort] = useState('cost');

  // History modal toggle
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Filtered orders for queue
  const filteredOrders = useMemo(() => {
    return QUEUE_ORDERS.filter(order => {
      // Category filter
      if (categoryFilter !== 'all' && order.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.greenId.toLowerCase().includes(q) ||
          order.greenName.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency') return a.urgencyRank - b.urgencyRank;
      if (sortBy === 'needBy') return a.needBy.localeCompare(b.needBy);
      return a.id.localeCompare(b.id);
    });
  }, [categoryFilter, searchQuery, sortBy]);

  // Current selected order
  const currentOrder = useMemo(() => {
    return QUEUE_ORDERS.find(o => o.id === selectedOrderId) || QUEUE_ORDERS[2]; // Fallback to PO-2842
  }, [selectedOrderId]);

  // Sorted sourcing options
  const sortedOptions = useMemo(() => {
    if (!currentOrder.options || currentOrder.options.length === 0) return [];
    return [...currentOrder.options].sort((a, b) => {
      if (sourcingSort === 'cost') {
        const costA = parseInt(a.totalPrice.replace(/[^0-9]/g, ''), 10) || 0;
        const costB = parseInt(b.totalPrice.replace(/[^0-9]/g, ''), 10) || 0;
        return costA - costB;
      }
      if (sourcingSort === 'eta') {
        return a.eta.localeCompare(b.eta);
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

  // Handle Proceed to Confirm
  const handleChooseOption = () => {
    if (!currentOption) return;
    navigate('/confirm-order', {
      state: {
        order: currentOrder,
        option: {
          greenName: currentOption.optionName,
          source: currentOption.tag,
          arrivalDate: currentOption.eta,
          totalDelivered: parseInt(currentOption.totalPrice.replace(/[^0-9]/g, '')),
          isAlternate: currentOption.tag.includes('ALTERNATE'),
          costBreakdown: currentOption.breakdown,
        },
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1360, margin: '0 auto' }}>

      {/* ── Top Header Section ── */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Orders
        </h1>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.4 }}>
          Review incoming demand, evaluate sourcing options and approve the best feasible fulfillment.
        </p>

        {/* Info & Tab Pills Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500 }}>
            18 open orders
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[
              { key: 'all', label: 'All 18', count: 18, color: '#30272B', bg: '#FFFFFF', border: '#E6DCE2' },
              { key: 'decision', label: 'Needs decision 4', count: 4, color: '#B86A00', bg: '#FFF7E6', border: '#F5D68A' },
              { key: 'risk', label: 'At risk 2', count: 2, color: '#C02030', bg: '#FEF0F2', border: '#F0B8C0' },
              { key: 'track', label: 'On track 12', count: 12, color: '#1E8A3C', bg: '#EDF7F1', border: '#B4DDBD' },
            ].map(tab => {
              const isActive = categoryFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCategoryFilter(tab.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? (tab.key === 'all' ? '#30272B' : tab.bg) : tab.bg,
                    color: isActive ? (tab.key === 'all' ? '#FFFFFF' : tab.color) : tab.color,
                    border: `1px solid ${isActive && tab.key === 'all' ? '#30272B' : tab.border}`,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
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
                  {filteredOrders.length} shown · default sort: urgency
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredOrders.map((order, idx) => {
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
                    <span style={{ fontSize: 12, color: C.subtle, lineHeight: 1 }}>
                      ◊
                    </span>
                  </div>

                  {/* Middle Line: Green ID and Name */}
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: C.text, marginRight: 8 }}>{order.greenId}</span>
                    <span>{order.greenName}</span>
                  </div>

                  {/* Bottom Line: Need By date & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: C.subtle }}>
                      Need by {order.needBy}
                    </span>
                    <QueueStatusBadge status={order.status} label={order.statusLabel} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue Footer */}
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.divider}`, background: '#FAF8F9' }}>
            <span style={{ fontSize: 9, color: C.subtle, fontStyle: 'italic' }}>
              Select an order to review its sourcing decision.
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Order Details & Recommendations Panel ── */}
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
            <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
              ORDER DETAILS
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>
                {currentOrder.id}
              </div>
              <QueueStatusBadge status={currentOrder.status} label={currentOrder.statusLabel} />
            </div>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
              {currentOrder.evaluatedCount} options evaluated · {currentOrder.feasibleCount} feasible · {currentOrder.recommendedCount} recommended · {currentOrder.approvalRequired}
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
                  GREEN ID
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.greenId}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  GREEN
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.greenName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  QUANTITY
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.quantity}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                  NEED-BY
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  {currentOrder.needByFull}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: How the Sourcing Cascade Ran */}
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

            <div style={{ fontSize: 10, color: C.subtle, fontStyle: 'italic', lineHeight: 1.4 }}>
              {currentOrder.cascadeNote}
            </div>
          </div>

          {/* Section 3: Available Sourcing Options & Selected Option Summary (2 Column) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 14, alignItems: 'start' }}>

            {/* Left Inner: Available Sourcing Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                    Available sourcing options
                  </div>
                  <div style={{ fontSize: 10, color: C.subtle }}>
                    {currentOrder.options.length} feasible local alternates · full {currentOrder.quantity} required
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

              {/* Feasible Options Label */}
              <div style={{ fontSize: 9, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                FEASIBLE OPTIONS
              </div>

              {/* Option Cards */}
              {sortedOptions.length === 0 ? (
                <div style={{
                  padding: '16px',
                  borderRadius: 8,
                  background: '#FEF0F2',
                  border: '1px solid #F5B8C0',
                  color: '#D83040',
                  fontSize: 11,
                  lineHeight: 1.5,
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>No feasible options available for this order</div>
                  Austin Local and Central Warehouses cannot fulfill this requirement without late delivery or order modification.
                </div>
              ) : (
                sortedOptions.map((opt, oIdx) => {
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
                      {/* Top Tag & Best Value Badge */}
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

                      {/* Title & Sub */}
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 1 }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: 10, color: C.subtle, marginBottom: 8 }}>
                        {opt.subtitle}
                      </div>

                      {/* Pricing, Per Kg, and ETA Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                            {opt.totalPrice}
                          </span>
                          <span style={{ fontSize: 11, color: C.muted }}>
                            {opt.perKg}
                          </span>
                        </div>

                        <div style={{ fontSize: 11, fontWeight: 600, color: opt.etaRisk ? '#D83040' : C.text }}>
                          {opt.eta}
                        </div>
                      </div>

                      {/* Baseline comparison */}
                      <div style={{ fontSize: 10, color: '#1E8A3C', marginTop: 3 }}>
                        {opt.baselineComparison}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Not Eligible / Excluded Scenarios Section */}
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Not eligible / not evaluated
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {currentOrder.ineligible.map((item, inIdx) => (
                    <div key={inIdx} style={{ fontSize: 10, color: item.startsWith('✕') ? '#D83040' : C.subtle, lineHeight: 1.4 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Inner: Selected Option Summary Card */}
            {currentOption ? (
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
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                    Selected option
                  </span>
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: '#EDF7F1',
                    color: '#1E8A3C',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                  }}>
                    RECOMMENDED
                  </span>
                </div>

                {/* Option Name & Sub */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                    {currentOption.optionName}
                  </div>
                  <div style={{ fontSize: 10, color: C.subtle }}>
                    {currentOption.optionSub}
                  </div>
                </div>

                {/* Cost Breakdown Line Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0', borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
                  {currentOption.breakdown.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <span style={{ color: C.muted }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: C.text }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                {/* Total Delivered Cost */}
                <div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    TOTAL DELIVERED COST
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.1, marginTop: 2 }}>
                    {currentOption.totalDelivered}
                  </div>
                  <div style={{ fontSize: 11, color: C.subtle, marginTop: 1 }}>
                    {currentOption.totalPerKg}
                  </div>
                </div>

                {/* Savings Pill */}
                <div style={{
                  padding: '5px',
                  borderRadius: 4,
                  background: '#EDF7F1',
                  color: '#1E8A3C',
                  fontSize: 10,
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.3px',
                }}>
                  {currentOption.savingsTag}
                </div>

                {/* Why This Wins Section */}
                <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
                    WHY THIS WINS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {currentOption.whyWins.map((reason, wIdx) => (
                      <div key={wIdx} style={{ fontSize: 10, color: C.muted, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                        <span style={{ color: '#1E8A3C', fontWeight: 700 }}>✓</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* If no option available */
              <div style={{
                background: '#FFFFFF',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '16px',
                textAlign: 'center',
                color: C.subtle,
                fontSize: 11,
              }}>
                <XCircle size={24} style={{ color: '#D83040', margin: '0 auto 8px' }} />
                No option to select
              </div>
            )}
          </div>

          {/* Section 4: Bottom Disclaimer & Action Buttons */}
          <div style={{
            borderTop: `1px solid ${C.divider}`,
            paddingTop: 12,
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ fontSize: 9, color: C.subtle, fontStyle: 'italic' }}>
              Estimates are simulated. Availability is rechecked before confirmation; no partial or split sourcing.
            </div>

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
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.hover}
                onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              >
                View order history
              </button>

              <button
                disabled={!currentOption}
                onClick={handleChooseOption}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: currentOption ? C.rose : '#E6DCE2',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: currentOption ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s ease',
                  boxShadow: currentOption ? '0 2px 6px rgba(216,63,121,0.3)' : 'none',
                }}
                onMouseEnter={e => {
                  if (currentOption) e.currentTarget.style.background = C.roseHover;
                }}
                onMouseLeave={e => {
                  if (currentOption) e.currentTarget.style.background = C.rose;
                }}
              >
                Choose this option
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Order History Modal (Lightweight Popup) ── */}
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
              width: 480,
              maxWidth: '90vw',
              padding: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Order History · {currentOrder.id}</div>
                <div style={{ fontSize: 10, color: C.subtle }}>Audit trail of demands and automated evaluation runs</div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: C.subtle }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { time: 'Today 10:42 AM', event: 'Sourcing cascade completed — 2 feasible options identified' },
                { time: 'Today 09:15 AM', event: 'Demand batch submitted by Roasting Production Team' },
                { time: 'Oct 28 04:30 PM', event: 'Inventory allocation check initiated by Austin Local site engine' },
              ].map((log, lIdx) => (
                <div key={lIdx} style={{ display: 'flex', gap: 10, fontSize: 11, padding: '8px 0', borderBottom: `1px solid ${C.divider}` }}>
                  <span style={{ color: C.subtle, whiteSpace: 'nowrap', width: 110 }}>{log.time}</span>
                  <span style={{ color: C.text, flex: 1 }}>{log.event}</span>
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
