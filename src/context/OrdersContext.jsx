/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_LOCAL_INVENTORY, findCheapestLocalOption } from '../data/localInventory';

const OrdersContext = createContext(null);

// ── The 9 Canonical Order Lifecycle Statuses (+ rejected) ───────────────────
// 1. new: Demand created by production schedule or local buyer
// 2. approved: Local buyer reviews and approves sourcing option
// 3. requested: Local buyer requests transfer from Central Warehouse
// 4. accepted: Central Warehouse Manager accepts order (full or partial)
// 5. dispatched: Central Warehouse Manager stages, checks QA, and dispatches to dock
// 6. in transit: Central Warehouse Manager hands off to carrier
// 7. delivered: Carrier arrives at local roasting facility dock (system/carrier)
// 8. received: Local Buyer inspects and marks received at roasting dock
// 9. closed: Order completed and booked into local inventory
// (rejected: Central Warehouse Manager rejects transfer request)

export const ORDER_LIFECYCLE = [
  'new',
  'approved',
  'requested',
  'accepted',
  'dispatched',
  'in transit',
  'delivered',
  'received',
  'closed',
];

export const ORDER_STATUS_META = {
  new: {
    label: 'New Demand',
    step: 0,
    actor: 'Production / System',
    actorRole: 'System',
    bg: '#FAF5FF',
    color: '#6B46C1',
    border: '#E9D8FD',
    dotBg: '#805AD5',
    desc: 'Demand registered in production plan. Local buyer review pending.',
  },
  approved: {
    label: 'Approved by Buyer',
    step: 1,
    actor: 'Local Buyer',
    actorRole: 'Local Buyer',
    bg: '#F0F9FF',
    color: '#0284C7',
    border: '#BAE6FD',
    dotBg: '#0284C7',
    desc: 'Sourcing option approved by Local Buyer. Ready for transfer request.',
  },
  requested: {
    label: 'Transfer Requested',
    step: 2,
    actor: 'Local Buyer',
    actorRole: 'Local Buyer',
    bg: '#FFF7E6',
    color: '#B86A00',
    border: '#F5D68A',
    dotBg: '#D97706',
    desc: 'Transfer order submitted to Central Warehouse Manager for review.',
  },
  accepted: {
    label: 'Accepted by Hub',
    step: 3,
    actor: 'Warehouse Manager',
    actorRole: 'Warehouse Manager',
    bg: '#EDF7F1',
    color: '#1E8A3C',
    border: '#B4DDBD',
    dotBg: '#16A34A',
    desc: 'Warehouse Manager allocated inventory. Ready for staging & palletizing.',
  },
  dispatched: {
    label: 'Dispatched & Staged',
    step: 4,
    actor: 'Warehouse Manager',
    actorRole: 'Warehouse Manager',
    bg: '#EEF2FF',
    color: '#4F46E5',
    border: '#C7D2FE',
    dotBg: '#4F46E5',
    desc: 'Palletized, QA checked, and staged at outbound loading dock by Warehouse Manager.',
  },
  'in transit': {
    label: 'In Transit',
    step: 5,
    actor: 'Warehouse Manager',
    actorRole: 'Warehouse Manager',
    bg: '#F0FDFA',
    color: '#0D9488',
    border: '#99F6E4',
    dotBg: '#0D9488',
    desc: 'Carrier departed central warehouse. En route to local roasting site.',
  },
  delivered: {
    label: 'Delivered at Dock',
    step: 6,
    actor: 'Carrier / System',
    actorRole: 'System',
    bg: '#EFF6FF',
    color: '#2563EB',
    border: '#BFDBFE',
    dotBg: '#2563EB',
    desc: 'Freight carrier arrived at facility dock. Awaiting buyer inspection & sign-off.',
  },
  received: {
    label: 'Received & Inspected',
    step: 7,
    actor: 'Local Buyer',
    actorRole: 'Local Buyer',
    bg: '#F0FDF4',
    color: '#15803D',
    border: '#BBF7D0',
    dotBg: '#15803D',
    desc: 'Local Buyer verified moisture, bag counts, and quality at receiving bay.',
  },
  closed: {
    label: 'Closed · In Stock',
    step: 8,
    actor: 'Local Buyer / System',
    actorRole: 'System',
    bg: '#F3F4F6',
    color: '#4B5563',
    border: '#E5E7EB',
    dotBg: '#4B5563',
    desc: 'Order reconciled and added to available roasting inventory.',
  },
  rejected: {
    label: 'Rejected by Hub',
    step: -1,
    actor: 'Warehouse Manager',
    actorRole: 'Warehouse Manager',
    bg: '#FEF0F2',
    color: '#D83040',
    border: '#F5B8C0',
    dotBg: '#DC2626',
    desc: 'Transfer request rejected by Central Warehouse Manager.',
  },
};

export function getOrderStatusMeta(status) {
  const norm = (status || '').toLowerCase().trim();
  return (
    ORDER_STATUS_META[norm] || {
      label: status || 'Unknown',
      step: 0,
      actor: 'System',
      actorRole: 'System',
      bg: '#F7F5FB',
      color: '#746970',
      border: '#E6DCE2',
      dotBg: '#9CA3AF',
      desc: '',
    }
  );
}

// ── Master Seed Data for All 9 Order States ──────────────────────────────────
// Conforms strictly to ER diagram & whiteboard lowest freight mapping:
// Site 1054 -> Warehouse 1055 ($589 fixed freight)
// Site 1003 -> Warehouse 1020 ($1000 fixed freight)
// Site 1006 -> Warehouse 1021 ($1000 fixed freight)
// Site 1102 -> Warehouse 1055 ($3000 fixed freight)

const INITIAL_SYNCED_ORDERS = [
  // 1. NEW DEMAND: Sumatra Mandheling (Site 1054) - Needs sourcing evaluation
  {
    id: 'PO-2846',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    shippingCost: 589,
    fgMaterialId: 'FG-5510',
    fgMaterialDescription: 'Sumatra Reserve Single Origin Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Single Origin',
    greenId: 'Ge-31',
    greenName: 'Sumatra Mandheling Grade 1',
    orderQuantity: 1500,
    quantityStr: '1,500 kg',
    acceptedQuantity: 0,
    unitPrice: 4.60,
    totalDelivered: 7489,
    needBy: 'Nov 12',
    needByFull: 'Nov 12, 2026',
    status: 'new',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Urgent roasting run. Local stock is zero. Reviewing central warehouse allocation.',
    category: 'decision',
    urgencyRank: 1,
    cascade: [
      { step: '1 Local same green', note: '0 kg available in Site 1054', status: 'fail' },
      { step: '2 Local approved alternates', note: 'No alternate mapped in green dimensions', status: 'fail' },
      { step: '3 Central warehouse', note: 'Designated Warehouse 1055 has incoming lot Nov 10', status: 'pass' },
    ],
    cascadeNote: 'Designated Warehouse 1055 has incoming harvest lot. Buyer sign-off required to queue transfer.',
    options: [
      {
        id: 'opt-2846-1',
        tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
        bestValue: true,
        title: 'Warehouse 1055 Central Transfer',
        subtitle: '1,500 kg available · covers full requirement',
        totalPrice: '$7,489',
        perKg: '$4.99 / kg',
        baselineComparison: 'Designated lowest freight hub ($589 shipping cost)',
        eta: 'ETA Nov 11 · On schedule',
        etaRisk: false,
        optionName: 'Ge-31 · Sumatra Mandheling Grade 1',
        optionSub: 'Warehouse 1055 Central Transfer',
        breakdown: [
          { label: 'Green / bean cost', val: '$6,900' },
          { label: 'Shipping cost (fixed)', val: '$589' },
        ],
        totalDelivered: '$7,489',
        totalPerKg: '$4.99 per kg',
        savingsTag: 'OPTIMAL LOWEST FREIGHT',
        whyWins: [
          'Designated lowest-freight warehouse (Warehouse 1055, $589 fixed cost)',
          'Exact green match (Ge-31 Sumatra Mandheling Grade 1)',
        ],
      },
    ],
    ineligible: [
      '✕ Local Site 1054 · 0 kg unreserved inventory',
      '✕ Warehouses 1020 & 1021 excluded per cost-optimization routing rule',
    ],
    selectedOption: null,
    timeline: [
      { title: 'Demand batch submitted by Roasting Production Team', time: 'Today 08:30 AM', actor: 'Production Scheduler', state: 'done' },
      { title: 'Sourcing cascade completed — Feasible option identified at Warehouse 1055', time: 'Today 08:35 AM', actor: 'Sourcing Engine', state: 'active' },
    ],
  },

  // 1b. AUTO-APPROVED BY SYSTEM (LOCAL ALTERNATE): Ethiopia Yirgacheffe Natural (Site 1054) -> Gc-11 (Cheapest local option)
  {
    id: 'PO-2848',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    isLocalFulfilled: true,
    autoApproved: true,
    inventoryAdjusted: true,
    allocatedGreenId: 'Gc-11',
    allocatedGreenName: 'Brazil Cerrado',
    fulfillmentMode: 'local-alternate',
    shippingCost: 0,
    fgMaterialId: 'FG-1805',
    fgMaterialDescription: 'Ethiopia Reserve Single Origin Whole Bean 12oz',
    brand: 'Laughing Man Coffee',
    brandType: 'Single Origin',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    orderQuantity: 900,
    quantityStr: '900 kg',
    acceptedQuantity: 900,
    unitPrice: 4.20,
    totalDelivered: 3780,
    needBy: 'Nov 14',
    needByFull: 'Nov 14, 2026',
    status: 'approved',
    buyerName: 'System (Auto-Approved)',
    buyerTitle: 'Auto-Sourcing Engine · Site 1054 Plano Roasting',
    notes: 'Auto-approved by system: Gd-09 local stock (250 kg) is insufficient, so cheapest local approved alternate Gc-11 (Brazil Cerrado, $4.20/kg, $0 freight) was allocated from Site 1054 inventory.',
    category: 'decision',
    urgencyRank: 2,
    cascade: [
      { step: '1 Local same green', note: 'Insufficient Gd-09 stock (250 kg / 900 kg in Site 1054)', status: 'fail' },
      { step: '2 Local approved alternates', note: 'Auto-allocated Gc-11 Brazil Cerrado ($4.20/kg · $0 freight)', status: 'pass' },
      { step: '3 Central warehouse', note: 'Bypassed — local alternate saves $1,174 vs hub ($4,954)', status: 'skip' },
    ],
    cascadeNote: 'Auto-approved by system via cheapest local inventory option (Gc-11 Brazil Cerrado). Inventory updated in Site 1054.',
    options: [
      {
        id: 'opt-2848-1',
        tag: 'LOCAL APPROVED ALTERNATE · SITE 1054',
        bestValue: true,
        isLocalFulfilled: true,
        greenId: 'Gc-11',
        title: 'Local Inventory Alternate — Gc-11 Brazil Cerrado',
        subtitle: 'Allocated 900 kg from Site 1054 stock · $0 freight',
        totalPrice: '$3,780',
        perKg: '$4.20 / kg',
        baselineComparison: 'Saves $1,174 vs Warehouse 1055 transfer ($0 freight)',
        eta: 'Immediate · On-site stock',
        etaRisk: false,
        optionName: 'Gc-11 · Brazil Cerrado (Alt for Gd-09)',
        optionSub: 'Site 1054 Local Inventory Allocation',
        breakdown: [
          { label: 'Alternate green cost (900 kg × $4.20)', val: '$3,780' },
          { label: 'Shipping cost', val: '$0 (Local Stock)' },
        ],
        totalDelivered: '$3,780',
        totalPerKg: '$4.20 per kg',
        savingsTag: 'AUTO-APPROVED · CHEAPEST LOCAL OPTION',
        whyWins: [
          'Resolved at Cascade Step 2 using Site 1054 inventory',
          'Eliminates $589 Warehouse 1055 freight cost & carrier transit time',
        ],
      },
    ],
    ineligible: [
      '✕ Local Gd-09 same-green · only 250 kg unreserved (650 kg short)',
    ],
    selectedOption: 0,
    timeline: [
      { title: 'Demand batch submitted by Roasting Production Team', time: 'Today 09:05 AM', actor: 'Production Scheduler', state: 'done' },
      { title: 'Auto-Approved by System: Local Alternate Gc-11 (Brazil Cerrado) selected at $4.20/kg ($0 freight)', time: 'Today 09:06 AM', actor: 'System (Auto-Sourcing Engine)', state: 'active' },
    ],
  },

  // 2. APPROVED: Costa Rica Tarrazu (Site 1054) - Local Buyer approved sourcing option
  {
    id: 'PO-2847',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    shippingCost: 589,
    fgMaterialId: 'FG-6120',
    fgMaterialDescription: 'Tarrazu Estate Reserve Whole Bean',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Limited Edition',
    greenId: 'Gh-08',
    greenName: 'Costa Rica Tarrazu SHB Honey',
    orderQuantity: 1000,
    quantityStr: '1,000 kg',
    acceptedQuantity: 0,
    unitPrice: 4.30,
    totalDelivered: 4889,
    needBy: 'Nov 13',
    needByFull: 'Nov 13, 2026',
    status: 'approved',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Buyer verified recipe requirement and approved Warehouse 1055 dispatch option.',
    category: 'decision',
    urgencyRank: 2,
    cascade: [
      { step: '1 Local same green', note: 'Insufficient local on-hand in Site 1054 (80 kg)', status: 'fail' },
      { step: '2 Local approved alternates', note: 'No alternate mapped for Gh-08', status: 'fail' },
      { step: '3 Central warehouse', note: 'Warehouse 1055 available (2,200 kg uncommitted)', status: 'pass' },
    ],
    cascadeNote: 'Approved option: Transfer from Warehouse 1055 under lowest-freight cost rule.',
    options: [
      {
        id: 'opt-2847-1',
        tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
        bestValue: true,
        title: 'Warehouse 1055 Central Transfer',
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
    ],
    selectedOption: 0,
    timeline: [
      { title: 'Demand batch submitted by Roasting Operations', time: 'Yesterday 04:00 PM', actor: 'Production Team', state: 'done' },
      { title: 'Local Buyer approved Warehouse 1055 sourcing option', time: 'Today 09:10 AM', actor: 'Maya Torres (Local Buyer)', state: 'active' },
    ],
  },

  // 3. REQUESTED: Colombia Supremo Washed (Site 1054 -> Warehouse 1055) - On Warehouse Manager's Desk!
  {
    id: 'PO-2843',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    shippingCost: 589,
    fgMaterialId: 'FG-4401',
    fgMaterialDescription: 'Dark Magic Blend Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Signature Blend',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo Washed',
    orderQuantity: 1200,
    quantityStr: '1,200 kg',
    acceptedQuantity: 1200,
    unitPrice: 3.90,
    totalDelivered: 5269,
    needBy: 'Nov 10',
    needByFull: 'Nov 10, 2026',
    status: 'requested',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Urgent roasting requirement. Local inventory depleted below safety threshold. Transfer PO requested.',
    warehouseStockAvailable: 5200,
    warehouseStockReserved: 1000,
    category: 'decision',
    urgencyRank: 3,
    cascade: [
      { step: '1 Local same green', note: 'Insufficient stock (800 kg / 1,200 kg in Site 1054)', status: 'fail' },
      { step: '2 Local approved alternates', note: '0 full-quantity alternate available', status: 'fail' },
      { step: '3 Central warehouse', note: 'Feasible option found in assigned Warehouse 1055', status: 'pass' },
    ],
    cascadeNote: 'Central transfer requested from assigned lowest-freight warehouse (Warehouse 1055).',
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
      '✕ Local Site 1054 · 800 kg available — 400 kg short',
    ],
    selectedOption: 0,
    timeline: [
      { title: 'Demand batch submitted by Roasting Production Team', time: 'Oct 25, 2026, 08:00 AM', actor: 'Production Scheduler', state: 'done' },
      { title: 'Local Buyer selected Warehouse 1055 option', time: 'Oct 25, 2026, 09:15 AM', actor: 'Maya Torres (Local Buyer)', state: 'done' },
      { title: 'Transfer PO Requested & Submitted to Central Hub', time: 'Oct 25, 2026, 09:30 AM', actor: 'Maya Torres (Local Buyer)', state: 'active' },
      { title: 'Awaiting Central Warehouse Manager Allocation', time: 'Pending Manager Action', actor: 'Warehouse Manager', state: 'pending' },
    ],
  },

  // 4. ACCEPTED: Guatemala Antigua (Site 1054 -> Warehouse 1055) - Warehouse Manager accepted!
  {
    id: 'PO-2844',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    shippingCost: 589,
    fgMaterialId: 'FG-2204',
    fgMaterialDescription: 'Antigua Single Origin Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Single Origin',
    greenId: 'Gc-14',
    greenName: 'Guatemala Antigua SHB',
    orderQuantity: 600,
    quantityStr: '600 kg',
    acceptedQuantity: 600,
    unitPrice: 4.10,
    totalDelivered: 3049,
    needBy: 'Nov 07',
    needByFull: 'Nov 07, 2026',
    status: 'accepted',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Warehouse Manager accepted order in full. Material allocated from Warehouse 1055 Aisle 3.',
    warehouseStockAvailable: 4500,
    warehouseStockReserved: 500,
    category: 'decision',
    urgencyRank: 4,
    cascade: [
      { step: '1 Local same green', note: 'Local unreserved stock 400 kg insufficient', status: 'fail' },
      { step: '2 Local approved alternates', note: 'Not required', status: 'skip' },
      { step: '3 Central warehouse', note: 'Warehouse 1055 transfer accepted', status: 'pass' },
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
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested by Local Buyer', time: 'Oct 25, 2026, 08:15 AM', actor: 'Maya Torres', state: 'done' },
      { title: 'Order Accepted in Full (600 kg allocated)', time: 'Oct 25, 2026, 10:45 AM', actor: 'Central Warehouse Manager', state: 'done' },
      { title: 'Material Pulling & QA Palletizing in progress', time: 'Warehouse 1055 Bay 1', actor: 'Warehouse Manager', state: 'active' },
    ],
  },

  // 5. DISPATCHED: Brazil Cerrado Natural (Site 1054 -> Warehouse 1055) - Staged at loading dock!
  {
    id: 'PO-2838',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: 'SH-7827',
    shippingCost: 589,
    fgMaterialId: 'FG-3108',
    fgMaterialDescription: 'Barista Reserve Medium Roast K-Cup',
    brand: 'The Original Donut Shop',
    brandType: 'Signature Roast',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    orderQuantity: 2000,
    quantityStr: '2,000 kg',
    acceptedQuantity: 2000,
    unitPrice: 3.40,
    totalDelivered: 7389,
    needBy: 'Nov 04',
    needByFull: 'Nov 04, 2026',
    status: 'dispatched',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Dispatched and staged at Outbound Bay 2. Awaiting Lonestar Freight carrier hookup.',
    warehouseStockAvailable: 6000,
    warehouseStockReserved: 3200,
    category: 'track',
    urgencyRank: 5,
    cascade: [
      { step: '1 Local same green', note: 'Allocated from Warehouse 1055', status: 'pass' },
    ],
    cascadeNote: 'Dispatched from Warehouse 1055 Outbound Bay 2.',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested', time: 'Oct 23, 2026, 11:20 AM', actor: 'Maya Torres', state: 'done' },
      { title: 'Approved in Full by Central Manager', time: 'Oct 24, 2026, 08:30 AM', actor: 'Central Warehouse Manager', state: 'done' },
      { title: 'Palletized & Moisture Verified (10.8%)', time: 'Oct 24, 2026, 03:15 PM', actor: 'Warehouse QA Staff', state: 'done' },
      { title: 'Dispatched to Outbound Loading Dock Bay 2', time: 'Today 07:45 AM', actor: 'Warehouse Manager', state: 'active' },
    ],
  },

  // 6. IN TRANSIT: Colombia Supremo Washed (Site 1054) - On the road!
  {
    id: 'PO-2831',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: 'SH-7810',
    shippingCost: 589,
    fgMaterialId: 'FG-4401',
    fgMaterialDescription: 'Dark Magic Blend Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Signature Blend',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo Washed',
    orderQuantity: 1800,
    quantityStr: '1,800 kg',
    acceptedQuantity: 1800,
    unitPrice: 3.90,
    totalDelivered: 7609,
    needBy: 'Nov 01',
    needByFull: 'Nov 01, 2026',
    status: 'in transit',
    carrierName: 'GreenFreight Express',
    trackingNumber: 'TR-501',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Dispatched on GreenFreight Express TR-501. Bill of lading #BL-99214.',
    category: 'track',
    urgencyRank: 6,
    cascade: [],
    cascadeNote: 'Freight underway from Warehouse 1055 to Site 1054.',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested', time: 'Oct 21, 2026, 10:00 AM', actor: 'Maya Torres', state: 'done' },
      { title: 'Approved & QA Staged in Bay 4', time: 'Oct 22, 2026, 01:45 PM', actor: 'Warehouse Manager', state: 'done' },
      { title: 'Dispatched from Warehouse 1055', time: 'Oct 24, 2026, 06:20 PM', actor: 'Warehouse Manager', state: 'done' },
      { title: 'Carrier In Transit (GreenFreight Express TR-501)', time: 'Oct 25, 2026, 06:00 AM', actor: 'Warehouse Manager', state: 'active' },
    ],
  },

  // 7. DELIVERED: Huila Washed Regional (Site 1054) - Arrived at dock! Needs Local Buyer inspection.
  {
    id: 'PO-2852',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: 'SH-7823',
    shippingCost: 589,
    fgMaterialId: 'FG-7703',
    fgMaterialDescription: 'Huila Supremo Single Origin 10oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Single Origin',
    greenId: 'Gc-22',
    greenName: 'Huila Washed Regional',
    orderQuantity: 800,
    quantityStr: '800 kg',
    acceptedQuantity: 800,
    unitPrice: 4.40,
    totalDelivered: 4109,
    needBy: 'Nov 02',
    needByFull: 'Nov 02, 2026',
    status: 'delivered',
    carrierName: 'Lonestar Freight Lines',
    trackingNumber: 'TR-502',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Trailer backed into Plano Dock 3. Local Buyer dock verification pending.',
    category: 'track',
    urgencyRank: 7,
    cascade: [],
    cascadeNote: 'Delivered at Plano Roasting receiving dock.',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested', time: 'Oct 19, 2026, 02:00 PM', actor: 'Maya Torres', state: 'done' },
      { title: 'Accepted by Central Warehouse Manager', time: 'Oct 20, 2026, 09:15 AM', actor: 'Warehouse Manager', state: 'done' },
      { title: 'Dispatched from Warehouse 1055', time: 'Oct 21, 2026, 05:00 PM', actor: 'Warehouse Manager', state: 'done' },
      { title: 'Carrier Delivered at Site 1054 Receiving Dock 3', time: 'Today 08:15 AM', actor: 'Carrier Logistics / System', state: 'active' },
    ],
  },

  // 8. RECEIVED: Guatemala Antigua SHB (Site 1054) - Buyer marked received, ready to close into inventory (local alternate, no warehouse shipment)
  {
    id: 'PO-2842',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    isLocalFulfilled: true,
    shippingCost: 0,
    fgMaterialId: 'FG-3108',
    fgMaterialDescription: 'Barista Reserve Medium Roast K-Cup',
    brand: 'The Original Donut Shop',
    brandType: 'Signature Roast',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    orderQuantity: 800,
    quantityStr: '800 kg',
    acceptedQuantity: 800,
    unitPrice: 4.10,
    totalDelivered: 3280,
    needBy: 'Nov 09',
    needByFull: 'Nov 09, 2026',
    status: 'received',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Local alternate (Gc-14 Guatemala Antigua) inspected by Maya Torres. Bags intact, moisture 10.9%.',
    category: 'track',
    urgencyRank: 8,
    cascade: [
      { step: '1 Local same green', note: 'Insufficient local on-hand', status: 'fail' },
      { step: '2 Local approved alternates', note: 'Gc-14 approved alternate found', status: 'pass' },
      { step: '3 Central warehouse', note: 'Not required', status: 'skip' },
    ],
    cascadeNote: 'Approved local alternate Gc-14 received and inspected at roasting facility.',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Demand batch registered', time: 'Oct 22, 2026, 10:00 AM', actor: 'Production Scheduler', state: 'done' },
      { title: 'Local Buyer approved alternate Gc-14', time: 'Oct 22, 2026, 11:30 AM', actor: 'Maya Torres', state: 'done' },
      { title: 'Dock arrival confirmed', time: 'Today 08:30 AM', actor: 'Receiving Dock', state: 'done' },
      { title: 'Local Buyer inspected & verified bags', time: 'Today 09:00 AM', actor: 'Maya Torres (Local Buyer)', state: 'active' },
    ],
  },

  // 9. CLOSED: Ethiopia Yirgacheffe Natural (Site 1054) - Completed and booked into inventory (local inventory, no warehouse shipment)
  {
    id: 'PO-2841',
    siteId: '1054',
    destinationSite: 'Site 1054 — Plano Roasting',
    destinationCity: 'Plano, TX',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shipmentId: null,
    isLocalFulfilled: true,
    shippingCost: 0,
    fgMaterialId: 'FG-1801',
    fgMaterialDescription: 'Dukale\'s Blend Whole Bean 12oz',
    brand: 'Laughing Man Coffee',
    brandType: 'Signature Blend',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    orderQuantity: 1200,
    quantityStr: '1,200 kg',
    acceptedQuantity: 1200,
    unitPrice: 4.85,
    totalDelivered: 5820,
    needBy: 'Nov 08',
    needByFull: 'Nov 08, 2026',
    status: 'closed',
    buyerName: 'Maya Torres',
    buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
    notes: 'Order fulfilled in full and booked into Site 1054 available roasting inventory.',
    category: 'track',
    urgencyRank: 9,
    cascade: [
      { step: '1 Local same green', note: '1,200 kg allocated from stock', status: 'pass' },
    ],
    cascadeNote: 'Closed into active inventory.',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Demand registered', time: 'Oct 20, 2026', actor: 'System', state: 'done' },
      { title: 'Approved by Buyer', time: 'Oct 20, 2026', actor: 'Maya Torres', state: 'done' },
      { title: 'Received & Quality Tested', time: 'Oct 23, 2026', actor: 'Maya Torres', state: 'done' },
      { title: 'Closed & Booked into Local Inventory', time: 'Oct 24, 2026', actor: 'Inventory System', state: 'done' },
    ],
  },

  // 10. OTHER SITES: Site 1102 Windsor -> Warehouse 1055 ($3,000 freight) - REQUESTED
  {
    id: 'PO-2850',
    siteId: '1102',
    destinationSite: 'Site 1102 — Windsor Facility',
    destinationCity: 'Windsor, VA',
    warehouse: 'Warehouse 1055',
    warehouseId: '1055',
    shippingCost: 3000,
    fgMaterialId: 'FG-3108',
    fgMaterialDescription: 'Barista Reserve Medium Roast K-Cup',
    brand: 'The Original Donut Shop',
    brandType: 'Signature Roast',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    orderQuantity: 2400,
    quantityStr: '2,400 kg',
    acceptedQuantity: 2400,
    unitPrice: 3.40,
    totalDelivered: 11160,
    needBy: 'Nov 12',
    needByFull: 'Nov 12, 2026',
    status: 'requested',
    buyerName: 'Liam Davies',
    buyerTitle: 'Lead Sourcing Specialist · Site 1102 Windsor',
    notes: 'Large monthly restock for Windsor roasting facility from assigned Warehouse 1055 ($3,000 freight).',
    warehouseStockAvailable: 8000,
    warehouseStockReserved: 1200,
    category: 'decision',
    urgencyRank: 10,
    cascade: [],
    cascadeNote: 'Assigned hub Warehouse 1055 ($3,000 fixed freight per whiteboard matrix).',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested by Liam Davies', time: 'Oct 24, 2026, 04:50 PM', actor: 'Liam Davies', state: 'done' },
      { title: 'Awaiting Central Warehouse Manager Allocation', time: 'Pending Action', actor: 'Warehouse Manager', state: 'active' },
    ],
  },

  // 11. OTHER SITES: Site 1003 Sumner -> Warehouse 1020 ($1,000 freight) - ACCEPTED (Partial)
  {
    id: 'PO-2835',
    siteId: '1003',
    destinationSite: 'Site 1003 — Sumner Plant',
    destinationCity: 'Sumner, WA',
    warehouse: 'Warehouse 1020',
    warehouseId: '1020',
    shippingCost: 1000,
    fgMaterialId: 'FG-1802',
    fgMaterialDescription: 'Dukale\'s Blend Single Serve Pods 24ct',
    brand: 'Laughing Man Coffee',
    brandType: 'Signature Blend',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    orderQuantity: 1000,
    quantityStr: '1,000 kg',
    acceptedQuantity: 600,
    unitPrice: 4.85,
    totalDelivered: 3910,
    needBy: 'Nov 06',
    needByFull: 'Nov 06, 2026',
    status: 'accepted',
    buyerName: 'Sarah Chen',
    buyerTitle: 'Regional Buyer · Site 1003 Sumner',
    notes: 'Warehouse capped at 600 kg due to standing reserve commitments. 400 kg backordered on incoming container.',
    partialReason: 'Warehouse buffer allocation limit; balance slated on incoming container due Nov 08.',
    warehouseStockAvailable: 1200,
    warehouseStockReserved: 600,
    category: 'track',
    urgencyRank: 11,
    cascade: [],
    cascadeNote: 'Warehouse 1020 designated lowest-freight route ($1,000 shipping).',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested by Sarah Chen', time: 'Oct 22, 2026, 02:15 PM', actor: 'Sarah Chen', state: 'done' },
      { title: 'Partial Accepted (600 kg allocated)', time: 'Oct 23, 2026, 09:10 AM', actor: 'Warehouse Manager', state: 'done' },
      { title: 'Palletizing 600 kg in Warehouse 1020 Bay 5', time: 'Bay 5 Staged', actor: 'Warehouse Staff', state: 'active' },
    ],
  },

  // 12. REJECTED: Site 1006 Essex -> Warehouse 1021 ($1,000 freight) - REJECTED BY HUB
  {
    id: 'PO-2828',
    siteId: '1006',
    destinationSite: 'Site 1006 — Essex Plant',
    destinationCity: 'Essex, VT',
    warehouse: 'Warehouse 1021',
    warehouseId: '1021',
    shippingCost: 1000,
    fgMaterialId: 'FG-5510',
    fgMaterialDescription: 'Sumatra Reserve Single Origin Whole Bean 12oz',
    brand: 'Green Mountain Coffee Roasters',
    brandType: 'Single Origin',
    greenId: 'Ge-31',
    greenName: 'Sumatra Mandheling Grade 1',
    orderQuantity: 2000,
    quantityStr: '2,000 kg',
    acceptedQuantity: 0,
    unitPrice: 4.60,
    totalDelivered: 0,
    needBy: 'Nov 03',
    needByFull: 'Nov 03, 2026',
    status: 'rejected',
    buyerName: 'Carlos Rivera',
    buyerTitle: 'Procurement Specialist · Site 1006 Essex',
    notes: 'Material failed pre-shipment QA inspection; placed under quarantine hold.',
    rejectionReason: 'Material under QA quarantine hold for moisture non-conformance (>12.5%).',
    warehouseStockAvailable: 0,
    warehouseStockReserved: 0,
    category: 'track',
    urgencyRank: 12,
    cascade: [],
    cascadeNote: 'Warehouse 1021 transfer rejected by QA quarantine hold.',
    options: [],
    ineligible: [],
    selectedOption: 0,
    timeline: [
      { title: 'Transfer PO Requested by Carlos Rivera', time: 'Oct 20, 2026, 01:10 PM', actor: 'Carlos Rivera', state: 'done' },
      { title: 'Order Rejected: Material under QA quarantine hold for moisture non-conformance', time: 'Oct 21, 2026, 11:40 AM', actor: 'Central Warehouse Manager', state: 'active' },
    ],
  },
];

const STORAGE_KEY = 'kdp_synced_orders';
const INVENTORY_STORAGE_KEY = 'kdp_local_inventory';

export function OrdersProvider({ children }) {
  const [localInventory, setLocalInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_LOCAL_INVENTORY));
      return INITIAL_LOCAL_INVENTORY;
    } catch {
      return INITIAL_LOCAL_INVENTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(localInventory));
    } catch {
      // Storage quota or disabled
    }
  }, [localInventory]);

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reconcile missing seed orders & shipmentId / isLocalFulfilled / autoApproved schema additions
          const seedMap = new Map(INITIAL_SYNCED_ORDERS.map(o => [o.id, o]));
          const existingIds = new Set(parsed.map(o => o.id));
          const missingSeeds = INITIAL_SYNCED_ORDERS.filter(o => !existingIds.has(o.id));
          const hydrated = parsed.map(ord => {
            const seed = seedMap.get(ord.id);
            if (!seed) return ord;
            const patch = {};
            if (ord.shipmentId === undefined && seed.shipmentId !== undefined) {
              patch.shipmentId = seed.shipmentId;
            }
            if (ord.isLocalFulfilled === undefined && seed.isLocalFulfilled !== undefined) {
              patch.isLocalFulfilled = seed.isLocalFulfilled;
            }
            // Upgrade untouched PO-2848 seed to reflect system auto-approval rule
            if (ord.id === 'PO-2848' && ord.autoApproved === undefined) {
              return seed;
            }
            if (ord.id === 'PO-2831' && ord.shipmentId === 'SH-7813') {
              patch.shipmentId = 'SH-7810';
            }
            const postDispatch = ['dispatched', 'in transit', 'delivered', 'received', 'closed'];
            if (!ord.isLocalFulfilled && !seed.isLocalFulfilled && postDispatch.includes((ord.status || '').toLowerCase()) && !ord.shipmentId && !patch.shipmentId) {
              const numSuffix = ord.id.replace(/\D/g, '') || '7899';
              patch.shipmentId = `SH-${7800 + (parseInt(numSuffix.slice(-2), 10) || 28)}`;
            }
            return Object.keys(patch).length > 0 ? { ...ord, ...patch } : ord;
          });
          if (missingSeeds.length > 0) {
            return [...missingSeeds, ...hydrated];
          }
          return hydrated;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SYNCED_ORDERS));
      return INITIAL_SYNCED_ORDERS;
    } catch {
      return INITIAL_SYNCED_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Storage quota or disabled
    }
  }, [orders]);

  // Helper to append a timeline entry
  const appendTimeline = (order, title, actor, state = 'done') => {
    const timeStr = 'Just now';
    const oldTimeline = Array.isArray(order.timeline) ? order.timeline : [];
    return [
      ...oldTimeline.map(t => (t.state === 'active' ? { ...t, state: 'done' } : t)),
      { title, time: timeStr, actor, state },
    ];
  };

  // ── 1. Local Buyer: Approve sourcing option (new -> approved) ──────────────
  const buyerApprove = (orderId, chosenOption = null) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const opt = chosenOption || (targetOrder?.options && targetOrder.options[0]);
    const optIsLocal = opt?.isLocalFulfilled ?? opt?.tag?.includes('LOCAL') ?? opt?.source?.includes('LOCAL');
    const isLocal = optIsLocal !== undefined ? Boolean(optIsLocal) : Boolean(targetOrder?.isLocalFulfilled);
    const allocatedId = opt?.greenId || targetOrder?.allocatedGreenId || targetOrder?.greenId;

    if (targetOrder && isLocal && !targetOrder.inventoryAdjusted && allocatedId) {
      const qty = targetOrder.orderQuantity || 0;
      setLocalInventory(prevInv =>
        prevInv.map(inv => {
          if (inv.id !== allocatedId) return inv;
          return {
            ...inv,
            available: Math.max(0, inv.available - qty),
            updated: 'Just now',
            openOrders: [
              { id: targetOrder.id, qty: `${qty.toLocaleString()} kg (Allocated)`, needBy: targetOrder.needBy },
              ...(inv.openOrders || []).filter(entry => entry.id !== targetOrder.id),
            ],
          };
        })
      );
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const optIdx = o.options ? Math.max(0, o.options.findIndex(item => item.id === opt?.id)) : 0;
        const updatedTimeline = appendTimeline(
          o,
          `Local Buyer approved sourcing option: ${opt?.title || opt?.greenName || 'Selected option'}`,
          'Maya Torres (Local Buyer)',
          'active'
        );
        return {
          ...o,
          status: 'approved',
          isLocalFulfilled: isLocal,
          inventoryAdjusted: isLocal ? true : Boolean(o.inventoryAdjusted),
          allocatedGreenId: isLocal ? allocatedId : o.allocatedGreenId,
          shipmentId: isLocal ? null : o.shipmentId,
          shippingCost: isLocal ? 0 : (o.shippingCost || 589),
          selectedOption: optIdx,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── 2. Local Buyer: Submit transfer request to Central Warehouse (approved -> requested)
  const buyerRequestTransfer = (orderId, chosenOption = null) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const opt = chosenOption || (o.options && o.options[0]);
        const updatedTimeline = appendTimeline(
          o,
          `Transfer PO requested from ${o.warehouse || 'Central Warehouse'} (${o.quantityStr || `${o.orderQuantity} kg`})`,
          'Maya Torres (Local Buyer)',
          'active'
        );
        return {
          ...o,
          status: 'requested',
          isLocalFulfilled: false,
          shippingCost: o.shippingCost || 589,
          selectedOption: 0,
          notes: o.notes || `Transfer requested by Local Buyer for ${opt?.title || 'Fulfillment'}.`,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── 3. Central Warehouse Manager: Accept order in full or partial (requested -> accepted)
  const warehouseAccept = (orderId, { acceptedQty, notes, partialReason } = {}) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const qty = acceptedQty !== undefined ? acceptedQty : o.orderQuantity;
        const isPartial = qty < o.orderQuantity;
        const titleMsg = isPartial
          ? `Partial acceptance: ${qty.toLocaleString()} kg allocated from ${o.warehouse} (${(o.orderQuantity - qty).toLocaleString()} kg backordered)`
          : `Order accepted in full: ${qty.toLocaleString()} kg allocated from ${o.warehouse}`;
        const updatedTimeline = appendTimeline(
          o,
          titleMsg,
          'Central Warehouse Manager',
          'done'
        );
        updatedTimeline.push({
          title: `Material Pulling & QA Palletizing in ${o.warehouse} Bay`,
          time: 'Just now',
          actor: 'Central Warehouse Staff',
          state: 'active',
        });
        return {
          ...o,
          status: 'accepted',
          acceptedQuantity: qty,
          partialReason: isPartial ? (partialReason || 'Warehouse safety stock threshold') : null,
          notes: notes || o.notes,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── 4. Central Warehouse Manager: Dispatch order to dock (accepted -> dispatched)
  const warehouseDispatch = (orderId, { bay = 'Bay 3', notes } = {}) => {
    setOrders(prev => {
      const existingMax = prev.reduce((max, ord) => {
        const match = /^SH-(\d+)$/.exec(ord.shipmentId || '');
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 7827);
      const nextShipmentId = `SH-${existingMax + 1}`;

      return prev.map(o => {
        if (o.id !== orderId) return o;
        const assignedShipmentId = o.shipmentId || nextShipmentId;
        const updatedTimeline = appendTimeline(
          o,
          `Order palletized, verified, and staged at Outbound Dock ${bay} (Shipment ${assignedShipmentId})`,
          'Central Warehouse Manager',
          'active'
        );
        return {
          ...o,
          status: 'dispatched',
          shipmentId: assignedShipmentId,
          stagingBay: bay,
          notes: notes || o.notes,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      });
    });
  };

  // ── 5. Central Warehouse Manager: Hand off to carrier (dispatched -> in transit)
  const warehouseInTransit = (orderId, { carrier = 'GreenFreight Express', trackingNumber = 'TR-504' } = {}) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedTimeline = appendTimeline(
          o,
          `Carrier departed ${o.warehouse} with Bill of Lading #${trackingNumber} (${carrier})`,
          'Central Warehouse Manager',
          'active'
        );
        return {
          ...o,
          status: 'in transit',
          carrierName: carrier,
          trackingNumber,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── 6. Carrier / System: Carrier arrives at local facility dock (in transit -> delivered)
  const systemDeliver = (orderId) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedTimeline = appendTimeline(
          o,
          `Carrier arrived and docked at ${o.destinationSite} receiving bay`,
          'Carrier Logistics / Dock Automated Sensor',
          'active'
        );
        return {
          ...o,
          status: 'delivered',
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── 7. Local Buyer: Inspect and mark received at dock (delivered -> received)
  const buyerReceive = (orderId, { notes = 'Bags intact, QA moisture and quality verified.' } = {}) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedTimeline = appendTimeline(
          o,
          `Local Buyer inspected bags and signed off at dock (${notes})`,
          'Maya Torres (Local Buyer)',
          'active'
        );
        return {
          ...o,
          status: 'received',
          notes: `${o.notes ? `${o.notes} | ` : ''}${notes}`,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── 8. Local Buyer / System: Book into inventory and close (received -> closed)
  const buyerClose = (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      const qty = targetOrder.acceptedQuantity || targetOrder.orderQuantity || 0;
      const targetGreenId = targetOrder.allocatedGreenId || targetOrder.greenId;

      setLocalInventory(prevInv =>
        prevInv.map(inv => {
          // Case A: Central Warehouse transfer arrived & closed -> credit available stock
          if (!targetOrder.isLocalFulfilled && inv.id === targetOrder.greenId) {
            return {
              ...inv,
              available: targetOrder.inventoryAdjusted ? inv.available : inv.available + qty,
              incoming: Math.max(0, inv.incoming - qty),
              openDemand: Math.max(0, inv.openDemand - (targetOrder.orderQuantity || qty)),
              updated: 'Just now',
              openOrders: (inv.openOrders || []).filter(entry => entry.id !== targetOrder.id),
            };
          }
          // Case B: Local fulfillment closed -> deduct stock if not yet deducted & clear open demand
          if (targetOrder.isLocalFulfilled && inv.id === targetGreenId) {
            return {
              ...inv,
              available: targetOrder.inventoryAdjusted ? inv.available : Math.max(0, inv.available - qty),
              openDemand: inv.id === targetOrder.greenId
                ? Math.max(0, inv.openDemand - (targetOrder.orderQuantity || qty))
                : inv.openDemand,
              updated: 'Just now',
              openOrders: (inv.openOrders || []).filter(entry => entry.id !== targetOrder.id),
            };
          }
          // Also clear openDemand from originally requested green if fulfilled via alternate
          if (targetOrder.isLocalFulfilled && inv.id === targetOrder.greenId && inv.id !== targetGreenId) {
            return {
              ...inv,
              openDemand: Math.max(0, inv.openDemand - (targetOrder.orderQuantity || qty)),
              updated: 'Just now',
              openOrders: (inv.openOrders || []).filter(entry => entry.id !== targetOrder.id),
            };
          }
          return inv;
        })
      );
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedTimeline = appendTimeline(
          o,
          `Order closed and stock reconciled in Site 1054 inventory`,
          'Maya Torres (Local Buyer)',
          'done'
        );
        return {
          ...o,
          status: 'closed',
          inventoryAdjusted: true,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── Central Warehouse Manager: Reject order (requested -> rejected)
  const warehouseReject = (orderId, { reason = 'Insufficient uncommitted buffer for delivery window' } = {}) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedTimeline = appendTimeline(
          o,
          `Transfer PO Rejected by Central Hub: ${reason}`,
          'Central Warehouse Manager',
          'active'
        );
        return {
          ...o,
          status: 'rejected',
          rejectionReason: reason,
          acceptedQuantity: 0,
          updatedDate: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  // ── Create a new order: auto-approves using cheapest local same/alternate green when available
  const createOrder = (orderData) => {
    const qty = Number(orderData.orderQuantity) || 1000;
    const greenId = orderData.greenId || 'Gc-14';
    const needBy = orderData.needBy || 'Nov 15';
    const needByFull = orderData.needByFull || `${needBy}, 2026`;
    const newId = orderData.id || `PO-${Math.floor(2880 + Math.random() * 110)}`;

    const { winner, candidates, requestedItem } = findCheapestLocalOption(greenId, qty, localInventory);
    const reqName = orderData.greenName || requestedItem?.name || greenId;
    const reqPrice = Number(orderData.unitPrice) || requestedItem?.price || 4.10;

    let newOrder;

    if (winner) {
      const isAlt = winner.mode === 'local-alternate';
      const sameCandidate = candidates.find(c => c.mode === 'local-same');
      const savingsNote = isAlt && sameCandidate
        ? `Cheaper than local same-green ${greenId} ($${sameCandidate.unitPrice.toFixed(2)}/kg · $${sameCandidate.totalCost.toLocaleString()})`
        : isAlt
          ? `Local ${greenId} short (${requestedItem?.available || 0} / ${qty} kg); alternate ${winner.greenId} covers full demand at $0 freight`
          : `Lowest-cost local stock ($${winner.unitPrice.toFixed(2)}/kg · $0 freight)`;

      newOrder = {
        id: newId,
        siteId: orderData.siteId || '1054',
        destinationSite: 'Site 1054 — Plano Roasting',
        destinationCity: 'Plano, TX',
        warehouse: 'Warehouse 1055',
        warehouseId: '1055',
        shipmentId: null,
        isLocalFulfilled: true,
        autoApproved: true,
        inventoryAdjusted: true,
        allocatedGreenId: winner.greenId,
        allocatedGreenName: winner.greenName,
        fulfillmentMode: winner.mode,
        shippingCost: 0,
        fgMaterialId: orderData.fgMaterialId || 'FG-4010',
        fgMaterialDescription: orderData.fgMaterialDescription || `${reqName} Roasting Batch`,
        brand: orderData.brand || 'Green Mountain Coffee Roasters',
        brandType: orderData.brandType || 'Production Run',
        greenId,
        greenName: reqName,
        orderQuantity: qty,
        quantityStr: `${qty.toLocaleString()} kg`,
        acceptedQuantity: qty,
        unitPrice: winner.unitPrice,
        totalDelivered: winner.totalCost,
        needBy,
        needByFull,
        status: 'approved',
        buyerName: 'System (Auto-Approved)',
        buyerTitle: 'Auto-Sourcing Engine · Site 1054 Plano Roasting',
        notes: `Auto-approved by system using ${isAlt ? 'local approved alternate' : 'local same-green'} ${winner.greenId} (${winner.greenName}). ${savingsNote}. Inventory deducted by ${qty.toLocaleString()} kg.`,
        category: 'decision',
        urgencyRank: 1,
        cascade: [
          {
            step: '1 Local same green',
            note: sameCandidate
              ? `${sameCandidate.available.toLocaleString()} kg available at $${sameCandidate.unitPrice.toFixed(2)}/kg`
              : `Insufficient ${greenId} (${requestedItem?.available || 0} / ${qty} kg in Site 1054)`,
            status: isAlt ? (sameCandidate ? 'skip' : 'fail') : 'pass',
          },
          {
            step: '2 Local approved alternates',
            note: isAlt
              ? `Selected cheapest local option: ${winner.greenId} (${winner.greenName}) at $${winner.unitPrice.toFixed(2)}/kg`
              : 'Not needed — same green is lowest local cost',
            status: isAlt ? 'pass' : 'skip',
          },
          {
            step: '3 Central warehouse',
            note: 'Bypassed — fulfilled locally at $0 freight',
            status: 'skip',
          },
        ],
        cascadeNote: `System auto-approved cheapest local inventory option (${winner.greenId} · $${winner.totalCost.toLocaleString()} total, $0 freight).`,
        options: candidates.map((cand, idx) => ({
          id: `opt-${newId}-${idx + 1}`,
          tag: cand.mode === 'local-alternate'
            ? 'LOCAL APPROVED ALTERNATE · SITE 1054'
            : 'LOCAL SAME GREEN · SITE 1054',
          bestValue: idx === 0,
          isLocalFulfilled: true,
          greenId: cand.greenId,
          title: `${cand.mode === 'local-alternate' ? 'Local Alternate' : 'Local Stock'} — ${cand.greenId} ${cand.greenName}`,
          subtitle: `${cand.available.toLocaleString()} kg available on-site · $0 freight`,
          totalPrice: `$${cand.totalCost.toLocaleString()}`,
          perKg: `$${cand.unitPrice.toFixed(2)} / kg`,
          baselineComparison: idx === 0 ? 'Cheapest local inventory option (Auto-selected)' : 'Higher unit cost local option',
          eta: 'Immediate · On-site stock',
          etaRisk: false,
          optionName: `${cand.greenId} · ${cand.greenName}`,
          optionSub: 'Site 1054 Local Inventory Allocation',
          breakdown: [
            { label: `Green cost (${qty.toLocaleString()} kg × $${cand.unitPrice.toFixed(2)})`, val: `$${cand.totalCost.toLocaleString()}` },
            { label: 'Shipping cost', val: '$0 (Local Stock)' },
          ],
          totalDelivered: `$${cand.totalCost.toLocaleString()}`,
          totalPerKg: `$${cand.unitPrice.toFixed(2)} per kg`,
          savingsTag: idx === 0 ? 'AUTO-APPROVED · CHEAPEST LOCAL OPTION' : 'ALTERNATIVE LOCAL OPTION',
          whyWins: [savingsNote],
        })),
        ineligible: [],
        selectedOption: 0,
        timeline: [
          { title: 'Demand order registered from production schedule', time: 'Just now', actor: 'Production Scheduler', state: 'done' },
          {
            title: `Auto-Approved by System: ${winner.greenId} (${winner.greenName}) selected at $${winner.unitPrice.toFixed(2)}/kg · $0 freight`,
            time: 'Just now',
            actor: 'System (Auto-Sourcing Engine)',
            state: 'active',
          },
        ],
      };

      // Update local inventory immediately for the allocated green
      setLocalInventory(prevInv =>
        prevInv.map(inv => {
          if (inv.id === winner.greenId) {
            return {
              ...inv,
              available: Math.max(0, inv.available - qty),
              updated: 'Just now',
              openOrders: [
                {
                  id: newId,
                  qty: `${qty.toLocaleString()} kg (${isAlt ? `Auto Alt for ${greenId}` : 'Auto Same Green'})`,
                  needBy,
                },
                ...(inv.openOrders || []),
              ],
            };
          }
          return inv;
        })
      );
    } else {
      const beanTotal = Math.round(qty * reqPrice);
      const hubTotal = beanTotal + 589;
      newOrder = {
        id: newId,
        siteId: orderData.siteId || '1054',
        destinationSite: 'Site 1054 — Plano Roasting',
        destinationCity: 'Plano, TX',
        warehouse: 'Warehouse 1055',
        warehouseId: '1055',
        shipmentId: null,
        isLocalFulfilled: false,
        autoApproved: false,
        inventoryAdjusted: false,
        shippingCost: 589,
        fgMaterialId: orderData.fgMaterialId || 'FG-4010',
        fgMaterialDescription: orderData.fgMaterialDescription || `${reqName} Roasting Batch`,
        brand: orderData.brand || 'Green Mountain Coffee Roasters',
        brandType: orderData.brandType || 'Production Run',
        greenId,
        greenName: reqName,
        orderQuantity: qty,
        quantityStr: `${qty.toLocaleString()} kg`,
        acceptedQuantity: 0,
        unitPrice: reqPrice,
        totalDelivered: hubTotal,
        needBy,
        needByFull,
        status: 'new',
        buyerName: 'Maya Torres',
        buyerTitle: 'Local Buyer · Site 1054 Plano Roasting',
        notes: `Local ${greenId} stock (${requestedItem?.available || 0} kg) and approved alternates cannot cover ${qty.toLocaleString()} kg. Pending buyer review for Warehouse 1055 transfer.`,
        category: 'decision',
        urgencyRank: 1,
        cascade: [
          { step: '1 Local same green', note: `Insufficient stock (${requestedItem?.available || 0} / ${qty.toLocaleString()} kg in Site 1054)`, status: 'fail' },
          { step: '2 Local approved alternates', note: 'No local alternate covers full quantity', status: 'fail' },
          { step: '3 Central warehouse', note: 'Warehouse 1055 transfer available ($589 fixed freight)', status: 'pass' },
        ],
        cascadeNote: 'Cannot fulfill locally — Buyer approval required to request Warehouse 1055 transfer.',
        options: [
          {
            id: `opt-${newId}-wh`,
            tag: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
            bestValue: true,
            isLocalFulfilled: false,
            title: 'Warehouse 1055 Central Transfer',
            subtitle: `Covers full ${qty.toLocaleString()} kg requirement · $589 fixed freight`,
            totalPrice: `$${hubTotal.toLocaleString()}`,
            perKg: `$${(hubTotal / qty).toFixed(2)} / kg`,
            baselineComparison: 'Designated lowest-freight hub route ($589)',
            eta: `ETA ${needBy} · Carrier transfer`,
            etaRisk: false,
            optionName: `${greenId} · ${reqName}`,
            optionSub: 'Warehouse 1055 Central Dispatch',
            breakdown: [
              { label: `Green cost (${qty.toLocaleString()} kg × $${reqPrice.toFixed(2)})`, val: `$${beanTotal.toLocaleString()}` },
              { label: 'Shipping cost (fixed)', val: '$589' },
            ],
            totalDelivered: `$${hubTotal.toLocaleString()}`,
            totalPerKg: `$${(hubTotal / qty).toFixed(2)} per kg`,
            savingsTag: 'LOWEST FREIGHT HUB ROUTE',
            whyWins: [
              'Exact green spec from Warehouse 1055 lowest-freight matrix',
            ],
          },
        ],
        ineligible: [
          `✕ Site 1054 local inventory (${requestedItem?.available || 0} kg) short of ${qty.toLocaleString()} kg`,
        ],
        selectedOption: 0,
        timeline: [
          { title: 'Demand order registered from production schedule', time: 'Just now', actor: 'Production Scheduler', state: 'done' },
          { title: 'Local stock insufficient — queued for Local Buyer Central Hub review', time: 'Just now', actor: 'System Sourcing Engine', state: 'active' },
        ],
      };

      setLocalInventory(prevInv =>
        prevInv.map(inv => {
          if (inv.id !== greenId) return inv;
          return {
            ...inv,
            openDemand: inv.openDemand + qty,
            updated: 'Just now',
            openOrders: [
              { id: newId, qty: `${qty.toLocaleString()} kg`, needBy },
              ...(inv.openOrders || []),
            ],
          };
        })
      );
    }

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // Reset to initial seed state
  const resetOrders = () => {
    setOrders(INITIAL_SYNCED_ORDERS);
    setLocalInventory(INITIAL_LOCAL_INVENTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SYNCED_ORDERS));
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_LOCAL_INVENTORY));
  };

  const getOrderById = (id) => orders.find(o => o.id === id);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        localInventory,
        setLocalInventory,
        getOrderById,
        buyerApprove,
        buyerRequestTransfer,
        warehouseAccept,
        warehouseDispatch,
        warehouseInTransit,
        systemDeliver,
        buyerReceive,
        buyerClose,
        warehouseReject,
        createOrder,
        resetOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}

