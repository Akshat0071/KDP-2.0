import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Download, Clock, ChevronRight, ChevronLeft,
  Leaf, AlertTriangle, Truck, Bell, FileText, X, Check, Package
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
import { SITE_WAREHOUSE_MAPPING } from '../../data/mockData';
import { useOrders, getOrderStatusMeta } from '../../context/OrdersContext';
import OrderLifecycleStepper from '../../components/ui/OrderLifecycleStepper';
import InfoTooltip from '../../components/ui/InfoTooltip';

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
  successBg: '#EDF7F1',
  successBorder: '#B4DDBD',
  warn:      '#B86A00',
  warnBg:    '#FFF7E6',
  warnBorder:'#F5D68A',
  crit:      '#D83040',
  critBg:    '#FEF0F2',
  critBorder:'#F5B8C0',
  info:      '#16A6D1',
  infoBg:    '#E8F8FD',
  infoBorder:'#B0E8FA',
  sched:     '#6B46C1',
  schedBg:   '#FAF5FF',
  schedBorder:'#E9D8FD',
};

// ── Master Inventory Dataset with Open Demand, Min Threshold & Side-Panel Details ──
const INVENTORY_DATA = [
  {
    id: 'Gc-04',
    name: 'Colombia Supremo',
    available: 800,
    openDemand: 2000,
    minThreshold: 1200,
    incoming: 1200,
    incomingEta: 'Oct 27',
    alternate: 'Gc-12 (1,500 kg)',
    price: 3.90,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2846', qty: '1,200 kg', needBy: 'Oct 28' },
      { id: 'PO-2847', qty: '800 kg', needBy: 'Oct 29' },
    ],
    incomingShipments: [
      { id: 'SH-7712', qty: '1,200 kg', from: 'Warehouse 1055', eta: 'Oct 27' },
    ],
    approvedAlternates: [
      { name: 'Gc-12 · Huila Washed', available: '1,500 kg', price: '$4.10' },
      { name: 'Gc-17 · Kenya AA', available: '1,200 kg', price: '$4.60' },
    ],
  },
  {
    id: 'Gc-11',
    name: 'Brazil Cerrado',
    available: 1600,
    openDemand: 1200,
    minThreshold: 1000,
    incoming: 0,
    incomingEta: null,
    alternate: 'Gc-14 (920 kg)',
    price: 4.20,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2842', qty: '800 kg', needBy: 'Nov 09' },
      { id: 'PO-2838', qty: '400 kg', needBy: 'Nov 04' },
    ],
    incomingShipments: [],
    approvedAlternates: [
      { name: 'Gc-14 · Guatemala Antigua', available: '920 kg', price: '$4.10' },
      { name: 'Gc-22 · Huila Washed', available: '850 kg', price: '$4.40' },
    ],
  },
  {
    id: 'Gc-14',
    name: 'Guatemala Antigua',
    available: 1300,
    openDemand: 1100,
    minThreshold: 1000,
    incoming: 400,
    incomingEta: 'Oct 28',
    alternate: 'Gc-22 (850 kg)',
    price: 4.10,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2844', qty: '600 kg', needBy: 'Nov 07' },
      { id: 'PO-2849', qty: '500 kg', needBy: 'Nov 08' },
    ],
    incomingShipments: [
      { id: 'SH-7715', qty: '400 kg', from: 'Warehouse 1021', eta: 'Oct 28' },
    ],
    approvedAlternates: [
      { name: 'Gc-22 · Huila Washed', available: '850 kg', price: '$4.40' },
    ],
  },
  {
    id: 'Gc-22',
    name: 'Huila Washed',
    available: 900,
    openDemand: 1000,
    minThreshold: 800,
    incoming: 200,
    incomingEta: 'Oct 29',
    alternate: 'Gc-19 (600 kg)',
    price: 4.40,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2852', qty: '1,000 kg', needBy: 'Nov 02' },
    ],
    incomingShipments: [
      { id: 'SH-7718', qty: '200 kg', from: 'Warehouse 1021', eta: 'Oct 29' },
    ],
    approvedAlternates: [
      { name: 'Gc-19 · Ethiopia Yirgacheffe', available: '600 kg', price: '$4.60' },
    ],
  },
  {
    id: 'Gc-19',
    name: 'Ethiopia Yirgacheffe',
    available: 700,
    openDemand: 400,
    minThreshold: 700,
    incoming: 0,
    incomingEta: null,
    alternate: 'Gc-17 (1,200 kg)',
    price: 4.60,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2855', qty: '400 kg', needBy: 'Nov 03' },
    ],
    incomingShipments: [],
    approvedAlternates: [
      { name: 'Gc-17 · Kenya AA', available: '1,200 kg', price: '$4.60' },
    ],
  },
  {
    id: 'Gd-09',
    name: 'Ethiopia Yirgacheffe Natural',
    available: 250,
    openDemand: 900,
    minThreshold: 700,
    incoming: 500,
    incomingEta: 'Nov 07',
    alternate: 'Gc-11 (1,400 kg)',
    price: 4.85,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2848', qty: '900 kg', needBy: 'Nov 14' },
    ],
    incomingShipments: [
      { id: 'TR-502', qty: '500 kg', from: 'Warehouse 1020', eta: 'Nov 07' },
    ],
    approvedAlternates: [
      { name: 'Gc-11 · Brazil Cerrado', available: '1,400 kg', price: '$4.20' },
    ],
  },
  {
    id: 'Ga-17',
    name: 'Kenya AA Nyeri',
    available: 3400,
    openDemand: 800,
    minThreshold: 2500,
    incoming: 600,
    incomingEta: 'Nov 03',
    alternate: 'Gc-19 (800 kg)',
    price: 5.20,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2845', qty: '800 kg', needBy: 'Nov 11' },
    ],
    incomingShipments: [
      { id: 'SH-7720', qty: '600 kg', from: 'Warehouse 1055', eta: 'Nov 03' },
    ],
    approvedAlternates: [
      { name: 'Gc-19 · Ethiopia Yirgacheffe', available: '800 kg', price: '$4.60' },
    ],
  },
  {
    id: 'Ge-31',
    name: 'Sumatra Mandheling',
    available: 350,
    openDemand: 1500,
    minThreshold: 1200,
    incoming: 0,
    incomingEta: null,
    alternate: '—',
    price: 4.60,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2846', qty: '1,500 kg', needBy: 'Nov 12' },
    ],
    incomingShipments: [],
    approvedAlternates: [],
  },
  {
    id: 'Gh-08',
    name: 'Costa Rica Tarrazu',
    available: 1600,
    openDemand: 1000,
    minThreshold: 1200,
    incoming: 200,
    incomingEta: 'Nov 06',
    alternate: 'Gc-14 (700 kg)',
    price: 4.30,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2847', qty: '1,000 kg', needBy: 'Nov 13' },
    ],
    incomingShipments: [
      { id: 'SH-7724', qty: '200 kg', from: 'Warehouse 1021', eta: 'Nov 06' },
    ],
    approvedAlternates: [
      { name: 'Gc-14 · Guatemala Antigua', available: '700 kg', price: '$4.10' },
    ],
  },
  // Additional tracked greens (Covered) for multi-page pagination (24 total greens)
  {
    id: 'Gc-12', name: 'Huila Washed Reserve', available: 2400, openDemand: 600, minThreshold: 1200,
    incoming: 0, incomingEta: null, alternate: 'Gc-04 (800 kg)', price: 4.10, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2858', qty: '600 kg', needBy: 'Nov 14' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-04 · Colombia Supremo', available: '800 kg', price: '$3.90' }],
  },
  {
    id: 'Gc-17', name: 'Kenya AA Peaberry', available: 2100, openDemand: 500, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Ga-17 (3,400 kg)', price: 4.60, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2860', qty: '500 kg', needBy: 'Nov 15' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Ga-17 · Kenya AA Nyeri', available: '3,400 kg', price: '$5.20' }],
  },
  {
    id: 'Bc-14', name: 'Brazil Cerrado Natural', available: 2800, openDemand: 900, minThreshold: 1200,
    incoming: 0, incomingEta: null, alternate: 'Gc-11 (1,600 kg)', price: 3.75, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2861', qty: '900 kg', needBy: 'Nov 16' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-11 · Brazil Cerrado', available: '1,600 kg', price: '$4.20' }],
  },
  {
    id: 'Hb-05', name: 'Honduras Marcala SHG', available: 1900, openDemand: 400, minThreshold: 900,
    incoming: 0, incomingEta: null, alternate: 'Gc-14 (1,300 kg)', price: 3.95, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2862', qty: '400 kg', needBy: 'Nov 17' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-14 · Guatemala Antigua', available: '1,300 kg', price: '$4.10' }],
  },
  {
    id: 'Et-09', name: 'Ethiopia Sidamo Washed', available: 2200, openDemand: 600, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Gc-19 (700 kg)', price: 4.70, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2863', qty: '600 kg', needBy: 'Nov 18' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-19 · Ethiopia Yirgacheffe', available: '700 kg', price: '$4.60' }],
  },
  {
    id: 'Pe-11', name: 'Peru Cajamarca Organic', available: 2600, openDemand: 700, minThreshold: 1100,
    incoming: 0, incomingEta: null, alternate: 'Gc-22 (900 kg)', price: 4.05, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2864', qty: '700 kg', needBy: 'Nov 19' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-22 · Huila Washed', available: '900 kg', price: '$4.40' }],
  },
  {
    id: 'Ni-06', name: 'Nicaragua Jinotega', available: 1850, openDemand: 450, minThreshold: 900,
    incoming: 0, incomingEta: null, alternate: 'Gh-08 (1,600 kg)', price: 3.85, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2865', qty: '450 kg', needBy: 'Nov 19' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gh-08 · Costa Rica Tarrazu', available: '1,600 kg', price: '$4.30' }],
  },
  {
    id: 'Mx-03', name: 'Mexico Chiapas Altura', available: 2300, openDemand: 500, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Gc-14 (1,300 kg)', price: 3.80, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2866', qty: '500 kg', needBy: 'Nov 20' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-14 · Guatemala Antigua', available: '1,300 kg', price: '$4.10' }],
  },
  {
    id: 'Rw-04', name: 'Rwanda Bourbon Kigali', available: 1750, openDemand: 350, minThreshold: 800,
    incoming: 0, incomingEta: null, alternate: 'Ga-17 (3,400 kg)', price: 4.95, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2867', qty: '350 kg', needBy: 'Nov 20' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Ga-17 · Kenya AA Nyeri', available: '3,400 kg', price: '$5.20' }],
  },
  {
    id: 'Sv-07', name: 'El Salvador Pacamara', available: 2050, openDemand: 450, minThreshold: 950,
    incoming: 0, incomingEta: null, alternate: 'Gh-08 (1,600 kg)', price: 4.45, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2868', qty: '450 kg', needBy: 'Nov 21' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gh-08 · Costa Rica Tarrazu', available: '1,600 kg', price: '$4.30' }],
  },
  {
    id: 'Pa-02', name: 'Panama Boquete Catuai', available: 1650, openDemand: 300, minThreshold: 800,
    incoming: 0, incomingEta: null, alternate: 'Gh-08 (1,600 kg)', price: 5.40, updated: 'Oct 25',
    openOrders: [{ id: 'PO-2869', qty: '300 kg', needBy: 'Nov 21' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gh-08 · Costa Rica Tarrazu', available: '1,600 kg', price: '$4.30' }],
  },
  {
    id: 'Br-21', name: 'Brazil Mogiana Pulped', available: 3100, openDemand: 800, minThreshold: 1400,
    incoming: 0, incomingEta: null, alternate: 'Gc-11 (1,600 kg)', price: 3.65, updated: 'Oct 24',
    openOrders: [{ id: 'PO-2870', qty: '800 kg', needBy: 'Nov 22' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-11 · Brazil Cerrado', available: '1,600 kg', price: '$4.20' }],
  },
  {
    id: 'In-08', name: 'India Monsooned Malabar', available: 1950, openDemand: 400, minThreshold: 900,
    incoming: 0, incomingEta: null, alternate: '—', price: 4.15, updated: 'Oct 24',
    openOrders: [{ id: 'PO-2871', qty: '400 kg', needBy: 'Nov 22' }], incomingShipments: [],
    approvedAlternates: [],
  },
  {
    id: 'Tz-05', name: 'Tanzania Peaberry North', available: 2150, openDemand: 550, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Ga-17 (3,400 kg)', price: 4.80, updated: 'Oct 24',
    openOrders: [{ id: 'PO-2872', qty: '550 kg', needBy: 'Nov 23' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Ga-17 · Kenya AA Nyeri', available: '3,400 kg', price: '$5.20' }],
  },
  {
    id: 'Co-19', name: 'Colombia Cauca Excelso', available: 2700, openDemand: 700, minThreshold: 1200,
    incoming: 0, incomingEta: null, alternate: 'Gc-12 (2,400 kg)', price: 4.00, updated: 'Oct 24',
    openOrders: [{ id: 'PO-2873', qty: '700 kg', needBy: 'Nov 24' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-12 · Huila Washed Reserve', available: '2,400 kg', price: '$4.10' }],
  },
];

// ── Combined Status Calculator (Based on BOTH Open Demand & Min Threshold) ─────
function evaluateItemStatus(item) {
  const projectedBalance = item.available + item.incoming - item.openDemand;

  // If a replenishment order was placed and covers open demand + min threshold
  if (item.replenished && projectedBalance >= item.minThreshold) {
    return {
      key: 'covered',
      label: 'Covered',
      bg: C.successBg,
      color: C.success,
      border: C.successBorder,
      isRowAlert: false,
    };
  }

  // 1. Critical shortage: Available cannot meet open demand and projected balance is negative
  if (item.available < item.openDemand && projectedBalance < 0) {
    return {
      key: 'critical',
      label: 'Critical',
      bg: C.critBg,
      color: C.crit,
      border: C.critBorder,
      isRowAlert: true,
    };
  }

  // 2. Short: Available is less than open demand, or leaves zero buffer
  if (item.available < item.openDemand || projectedBalance === 0) {
    return {
      key: 'short',
      label: 'Short',
      bg: C.critBg,
      color: C.crit,
      border: C.critBorder,
      isRowAlert: true,
    };
  }

  // 3. Below or tight against Minimum Threshold:
  if (item.available < item.minThreshold || projectedBalance < item.minThreshold) {
    if (item.available < item.minThreshold * 0.5) {
      return {
        key: 'critical',
        label: 'Critical',
        bg: C.critBg,
        color: C.crit,
        border: C.critBorder,
        isRowAlert: true,
      };
    }
    return {
      key: 'tight',
      label: 'Tight',
      bg: C.warnBg,
      color: C.warn,
      border: C.warnBorder,
      isRowAlert: false,
    };
  }

  // 4. Fully covered
  return {
    key: 'covered',
    label: 'Covered',
    bg: C.successBg,
    color: C.success,
    border: C.successBorder,
    isRowAlert: false,
  };
}

// ── Auto-Replenishment Calculation & Lowest-Cost Warehouse Selector ──────────
function calculateReplenishmentQty(item) {
  // Target supply needed = Open Orders (openDemand) + Safe Min Threshold
  const targetSupply = item.openDemand + item.minThreshold;
  const currentSupply = item.available + item.incoming;
  return Math.max(0, targetSupply - currentSupply);
}

function getLowestCostWarehouse(item, qty, siteId = '1054') {
  // Direct cost-optimized route from assigned lowest-freight warehouse
  const mapping = SITE_WAREHOUSE_MAPPING[siteId] || { warehouseId: '1055', warehouseName: 'Warehouse 1055', shippingCost: 589 };
  const freightCost = mapping.shippingCost;
  const beanCost = item.price * qty;
  const totalCost = Math.round(beanCost + freightCost);
  const landedPerKg = Number(((beanCost + freightCost) / (qty || 1)).toFixed(2));
  return {
    warehouse: mapping.warehouseName,
    warehouseId: mapping.warehouseId,
    shippingCost: freightCost,
    landedPerKg,
    totalCost,
    etaShort: 'Oct 28',
    etaFull: 'Oct 28, 2026',
  };
}

// ── Incoming Shipments Dataset (18 Shipments across 3 pages) ─────────────────
const INCOMING_SHIPMENTS = [
  {
    id: 'SH-7810',
    greenId: 'Bc-14',
    greenName: 'Brazil Cerrado',
    qty: 800,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 08, 2026',
    etaBucket: 'this-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2842',
    statusUpdated: 'Oct 25, 2026, 09:40 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 23, 2026, 02:15 PM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 24, 2026, 06:20 PM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 08, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 800, openDemand: 800, projectedBalance: 1600 },
  },
  {
    id: 'SH-7811',
    greenId: 'Gc-11',
    greenName: 'Guatemala Antigua',
    qty: 400,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 07, 2026',
    etaBucket: 'this-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2846',
    statusUpdated: 'Oct 25, 2026, 08:15 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 22, 2026, 11:10 AM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 23, 2026, 04:05 PM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 07, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 400, openDemand: 1200, projectedBalance: 800 },
  },
  {
    id: 'SH-7812',
    greenId: 'Gc-22',
    greenName: 'Colombia Supremo',
    qty: 600,
    warehouse: 'Warehouse 1021',
    eta: 'Nov 09, 2026',
    etaBucket: 'this-week',
    status: 'Delayed',
    delayed: true,
    linkedOrder: 'PO-2847',
    statusUpdated: 'Oct 25, 2026, 10:05 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 21, 2026, 09:00 AM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 22, 2026, 01:45 PM', state: 'done' },
      { title: 'Delayed (+1 day weather hold)', time: 'Held at Regional Hub · Rerouting', state: 'active-crit' },
      { title: 'Revised Delivery ETA', time: 'Nov 09, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 600, openDemand: 1000, projectedBalance: -200 },
  },
  {
    id: 'SH-7813',
    greenId: 'Hb-05',
    greenName: 'Huila Washed',
    qty: 500,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 08, 2026',
    etaBucket: 'this-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: '—',
    statusUpdated: 'Oct 25, 2026, 07:30 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 25, 2026, 07:30 AM', state: 'done' },
      { title: 'Awaiting Carrier Pickup', time: 'Warehouse 1055 Dock 4', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 08, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 500, openDemand: 400, projectedBalance: 1000 },
  },
  {
    id: 'SH-7814',
    greenId: 'Et-09',
    greenName: 'Ethiopia Yirgacheffe',
    qty: 300,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 10, 2026',
    etaBucket: 'next-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2848',
    statusUpdated: 'Oct 25, 2026, 09:12 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 24, 2026, 10:00 AM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 24, 2026, 05:30 PM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 10, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 300, openDemand: 400, projectedBalance: 600 },
  },
  {
    id: 'SH-7815',
    greenId: 'Gc-14',
    greenName: 'Brazil Cerrado (Alt)',
    qty: 920,
    warehouse: 'Warehouse 1021',
    eta: 'Nov 08, 2026',
    etaBucket: 'this-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: 'PO-2842',
    statusUpdated: 'Oct 25, 2026, 08:45 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 25, 2026, 08:45 AM', state: 'done' },
      { title: 'Scheduled for Dispatch', time: 'Warehouse 1021 Staging', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 08, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 920, openDemand: 800, projectedBalance: 1420 },
  },
  {
    id: 'SH-7816',
    greenId: 'Gc-12',
    greenName: 'Huila Washed (Alt)',
    qty: 850,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 11, 2026',
    etaBucket: 'next-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: '—',
    statusUpdated: 'Oct 24, 2026, 04:20 PM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 24, 2026, 04:20 PM', state: 'done' },
      { title: 'Scheduled for Dispatch', time: 'Warehouse 1055 Dock 2', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 11, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 850, openDemand: 0, projectedBalance: 2350 },
  },
  {
    id: 'SH-7817',
    greenId: 'Bc-14',
    greenName: 'Brazil Cerrado',
    qty: 400,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 12, 2026',
    etaBucket: 'next-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2849',
    statusUpdated: 'Oct 25, 2026, 10:00 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 23, 2026, 01:00 PM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 24, 2026, 09:15 AM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 12, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 400, openDemand: 500, projectedBalance: 1100 },
  },
  // Page 2 (8 more)
  {
    id: 'SH-7818',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo',
    qty: 1200,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 09, 2026',
    etaBucket: 'this-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2843',
    statusUpdated: 'Oct 25, 2026, 09:50 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 23, 2026, 11:30 AM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 24, 2026, 03:10 PM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 09, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 1200, openDemand: 2000, projectedBalance: 0 },
  },
  {
    id: 'SH-7819',
    greenId: 'Gd-09',
    greenName: 'Ethiopia Yirgacheffe Natural',
    qty: 500,
    warehouse: 'Warehouse 1021',
    eta: 'Nov 07, 2026',
    etaBucket: 'this-week',
    status: 'Delayed',
    delayed: true,
    linkedOrder: 'PO-2841',
    statusUpdated: 'Oct 25, 2026, 10:15 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 20, 2026, 08:20 AM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 21, 2026, 05:00 PM', state: 'done' },
      { title: 'Delayed (Carrier delay)', time: 'Expected clearance tomorrow', state: 'active-crit' },
      { title: 'Expected Delivery', time: 'Nov 07, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 500, openDemand: 900, projectedBalance: -150 },
  },
  {
    id: 'SH-7820',
    greenId: 'Ga-17',
    greenName: 'Kenya AA Nyeri',
    qty: 600,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 10, 2026',
    etaBucket: 'next-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: 'PO-2845',
    statusUpdated: 'Oct 24, 2026, 02:10 PM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 24, 2026, 02:10 PM', state: 'done' },
      { title: 'Scheduled for Dispatch', time: 'Warehouse 1055 Dock', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 10, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 600, openDemand: 800, projectedBalance: 3200 },
  },
  {
    id: 'SH-7821',
    greenId: 'Gh-08',
    greenName: 'Costa Rica Tarrazu',
    qty: 200,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 11, 2026',
    etaBucket: 'next-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2847',
    statusUpdated: 'Oct 25, 2026, 09:05 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 24, 2026, 08:00 AM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 25, 2026, 06:30 AM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 11, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 200, openDemand: 1000, projectedBalance: 800 },
  },
  {
    id: 'SH-7822',
    greenId: 'Gc-14',
    greenName: 'Guatemala Antigua',
    qty: 400,
    warehouse: 'Warehouse 1021',
    eta: 'Nov 08, 2026',
    etaBucket: 'this-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2844',
    statusUpdated: 'Oct 25, 2026, 08:50 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 23, 2026, 03:00 PM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 24, 2026, 11:20 AM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 08, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 400, openDemand: 1100, projectedBalance: 600 },
  },
  {
    id: 'SH-7823',
    greenId: 'Gc-22',
    greenName: 'Huila Washed',
    qty: 200,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 12, 2026',
    etaBucket: 'next-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: 'PO-2852',
    statusUpdated: 'Oct 25, 2026, 07:45 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 25, 2026, 07:45 AM', state: 'done' },
      { title: 'Scheduled for Dispatch', time: 'Warehouse 1055 Staging', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 12, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 200, openDemand: 1000, projectedBalance: 100 },
  },
  {
    id: 'SH-7824',
    greenId: 'Ge-31',
    greenName: 'Sumatra Mandheling',
    qty: 750,
    warehouse: 'Warehouse 1021',
    eta: 'Nov 14, 2026',
    etaBucket: 'next-week',
    status: 'Delayed',
    delayed: true,
    linkedOrder: 'PO-2846',
    statusUpdated: 'Oct 25, 2026, 10:20 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 22, 2026, 02:30 PM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 23, 2026, 07:10 AM', state: 'done' },
      { title: 'Delayed (Freight backlog)', time: 'Held at regional cross-dock', state: 'active-crit' },
      { title: 'Expected Delivery', time: 'Nov 14, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 750, openDemand: 1500, projectedBalance: -400 },
  },
  {
    id: 'SH-7825',
    greenId: 'Bc-14',
    greenName: 'Brazil Cerrado',
    qty: 650,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 13, 2026',
    etaBucket: 'next-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: '—',
    statusUpdated: 'Oct 25, 2026, 09:15 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 25, 2026, 09:15 AM', state: 'done' },
      { title: 'Scheduled for Dispatch', time: 'Warehouse 1055 Dock', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 13, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 650, openDemand: 0, projectedBalance: 2250 },
  },
  // Page 3 (2 more = 18 total)
  {
    id: 'SH-7826',
    greenId: 'Gc-19',
    greenName: 'Ethiopia Yirgacheffe',
    qty: 350,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 15, 2026',
    etaBucket: 'next-week',
    status: 'In Transit',
    delayed: false,
    linkedOrder: 'PO-2855',
    statusUpdated: 'Oct 25, 2026, 09:30 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 24, 2026, 01:15 PM', state: 'done' },
      { title: 'Dispatched from Warehouse', time: 'Oct 25, 2026, 08:00 AM', state: 'done' },
      { title: 'In Transit', time: 'En route to Site 1054 — Plano Roasting', state: 'active' },
      { title: 'Expected Delivery', time: 'Nov 15, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 350, openDemand: 400, projectedBalance: 650 },
  },
  {
    id: 'SH-7827',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado',
    qty: 500,
    warehouse: 'Warehouse 1055',
    eta: 'Nov 16, 2026',
    etaBucket: 'next-week',
    status: 'Scheduled',
    delayed: false,
    linkedOrder: 'PO-2838',
    statusUpdated: 'Oct 25, 2026, 10:10 AM',
    timeline: [
      { title: 'Shipment Created', time: 'Oct 25, 2026, 10:10 AM', state: 'done' },
      { title: 'Scheduled for Dispatch', time: 'Warehouse 1055 Dock', state: 'active' },
      { title: 'In Transit', time: 'Pending dispatch', state: 'pending' },
      { title: 'Expected Delivery', time: 'Nov 16, 2026', state: 'pending' },
    ],
    impact: { incomingQty: 500, openDemand: 1200, projectedBalance: 900 },
  },
];

function getShipmentStatusMeta(status) {
  if (status === 'In Transit') {
    return { bg: C.infoBg, color: '#0E7490', border: C.infoBorder };
  }
  if (status === 'Delayed') {
    return { bg: C.critBg, color: C.crit, border: C.critBorder };
  }
  return { bg: C.schedBg, color: C.sched, border: C.schedBorder };
}

function PaginationFooter({ page, totalPages, totalItems, perPage, itemLabel, onPageChange, helperNote }) {
  const start = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  return (
    <div style={{
      padding: '10px 16px',
      borderTop: `1px solid ${C.divider}`,
      background: '#FFFFFF',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10.5, color: C.muted }}>
          Showing <strong>{start}–{end}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </span>
        {helperNote && (
          <span style={{ fontSize: 9.5, color: C.subtle }}>
            · {helperNote}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
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
              onClick={() => onPageChange(pageNum)}
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
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
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
  );
}

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders, buyerReceive, buyerClose } = useOrders();

  // Active tab: 'stock' | 'incoming' (derived from searchParams with local switch)
  const tabParam = searchParams.get('tab');
  const [userTab, setUserTab] = useState(null);
  const activeTab = userTab ?? (tabParam === 'incoming' ? 'incoming' : 'stock');
  const setActiveTab = (tab) => setUserTab(tab);

  // Stock Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [incomingFilter, setIncomingFilter] = useState('all');
  const [alternateFilter, setAlternateFilter] = useState('all');
  const [stockPage, setStockPage] = useState(1);

  // Incoming Shipments Filters & Pagination
  const [shipSearch, setShipSearch] = useState('');
  const [shipStatusFilter, setShipStatusFilter] = useState('all');
  const [shipFromFilter, setShipFromFilter] = useState('all');
  const [shipEtaFilter, setShipEtaFilter] = useState('all');
  const [shipDelayFilter, setShipDelayFilter] = useState('all');
  const [shipPage, setShipPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Stateful datasets (so auto-replenishment updates both Stock & Incoming Shipments live)
  const [inventoryItems, setInventoryItems] = useState(INVENTORY_DATA);
  const [shipmentsList, setShipmentsList] = useState(INCOMING_SHIPMENTS);
  const [orderCounter, setOrderCounter] = useState(0);
  const [replenishConfirmations, setReplenishConfirmations] = useState({});
  const [batchBanner, setBatchBanner] = useState(null);

  // Selected items for side panels
  const [selectedGreenId, setSelectedGreenId] = useState('Gc-04');
  const [selectedShipmentId, setSelectedShipmentId] = useState('SH-7810');
  const [showSidePanel, setShowSidePanel] = useState(true);

  // Process and compute Stock rows with Days of Supply (DoS)
  const computedItems = useMemo(() => {
    return inventoryItems.map(item => {
      const projectedBalance = item.available + item.incoming - item.openDemand;
      const statusMeta = evaluateItemStatus(item);
      const replenishQty = calculateReplenishmentQty(item);
      const bestWarehouse = replenishQty > 0 ? getLowestCostWarehouse(item, replenishQty) : null;
      const dailyBurnRate = Math.max(30, Math.round(item.openDemand / 7));
      const daysOfSupply = (item.available / dailyBurnRate).toFixed(1);
      return {
        ...item,
        projectedBalance,
        statusMeta,
        replenishQty,
        bestWarehouse,
        dailyBurnRate,
        daysOfSupply,
      };
    });
  }, [inventoryItems]);

  const belowThresholdItems = useMemo(() => {
    return computedItems.filter(i => i.replenishQty > 0);
  }, [computedItems]);

  // Filtered Stock rows
  const filteredRows = useMemo(() => {
    return computedItems.filter(item => {
      if (statusFilter !== 'all' && item.statusMeta.key !== statusFilter) return false;
      if (incomingFilter === 'yes' && item.incoming === 0) return false;
      if (incomingFilter === 'no' && item.incoming > 0) return false;
      if (alternateFilter === 'yes' && item.alternate === '—') return false;
      if (alternateFilter === 'no' && item.alternate !== '—') return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.alternate.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [computedItems, statusFilter, incomingFilter, alternateFilter, search]);

  const totalStockPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const safeStockPage = Math.min(stockPage, totalStockPages);
  const paginatedRows = useMemo(() => {
    const start = (safeStockPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, safeStockPage]);

  // Filtered Incoming Shipments
  const filteredShipments = useMemo(() => {
    return shipmentsList.filter(ship => {
      if (shipStatusFilter !== 'all' && ship.status !== shipStatusFilter) return false;
      if (shipFromFilter !== 'all' && ship.warehouse !== shipFromFilter) return false;
      if (shipEtaFilter !== 'all' && ship.etaBucket !== shipEtaFilter) return false;
      if (shipDelayFilter === 'delayed' && !ship.delayed) return false;
      if (shipDelayFilter === 'ontime' && ship.delayed) return false;

      if (shipSearch.trim()) {
        const q = shipSearch.toLowerCase();
        return (
          ship.id.toLowerCase().includes(q) ||
          ship.greenId.toLowerCase().includes(q) ||
          ship.greenName.toLowerCase().includes(q) ||
          ship.linkedOrder.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [shipmentsList, shipSearch, shipStatusFilter, shipFromFilter, shipEtaFilter, shipDelayFilter]);

  const totalShipPages = Math.max(1, Math.ceil(filteredShipments.length / ITEMS_PER_PAGE));
  const safeShipPage = Math.min(shipPage, totalShipPages);
  const paginatedShipments = useMemo(() => {
    const start = (safeShipPage - 1) * ITEMS_PER_PAGE;
    return filteredShipments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredShipments, safeShipPage]);

  // Selected items for the side panel
  const selectedItem = useMemo(() => {
    return computedItems.find(i => i.id === selectedGreenId) || computedItems[0];
  }, [computedItems, selectedGreenId]);

  const selectedShipment = useMemo(() => {
    return shipmentsList.find(s => s.id === selectedShipmentId) || shipmentsList[0];
  }, [shipmentsList, selectedShipmentId]);

  // KPI Metrics
  const shortOrdersCount = computedItems.filter(i => i.statusMeta.key === 'short' || i.statusMeta.key === 'critical').length;
  const arrivingCount = computedItems.filter(i => i.incoming > 0).length;
  const needsAttentionCount = computedItems.filter(i => i.statusMeta.key !== 'covered').length;

  // Auto-replenish handler: places order to lowest-cost warehouse to cover open orders & maintain min threshold
  const handleAutoReplenish = (item) => {
    const qtyToOrder = calculateReplenishmentQty(item);
    if (qtyToOrder <= 0) return;

    const bestWh = getLowestCostWarehouse(item, qtyToOrder);
    const nextIdx = orderCounter + 1;
    const shipmentId = `SH-${7827 + nextIdx}`;
    const poId = `PO-${2899 + nextIdx}`;
    setOrderCounter(nextIdx);

    // 1. Update Stock item (incoming increases so open orders + min threshold are covered)
    setInventoryItems(prev =>
      prev.map(inv => {
        if (inv.id !== item.id) return inv;
        const updatedIncoming = inv.incoming + qtyToOrder;
        return {
          ...inv,
          incoming: updatedIncoming,
          incomingEta: bestWh.etaShort,
          updated: 'Just now',
          replenished: true,
          incomingShipments: [
            { id: shipmentId, qty: `${qtyToOrder.toLocaleString()} kg`, from: bestWh.warehouse, eta: bestWh.etaShort },
            ...(inv.incomingShipments || []),
          ],
        };
      })
    );

    // 2. Add to Incoming Shipments list
    const newShipment = {
      id: shipmentId,
      greenId: item.id,
      greenName: item.name,
      qty: qtyToOrder,
      warehouse: bestWh.warehouse,
      eta: bestWh.etaFull,
      etaBucket: 'this-week',
      status: 'Scheduled',
      delayed: false,
      linkedOrder: poId,
      statusUpdated: 'Oct 25, 2026, Just now',
      timeline: [
        { title: 'Auto-Replenish PO Placed', time: 'Oct 25, 2026, Just now', state: 'done' },
        { title: 'Scheduled for Dispatch', time: `${bestWh.warehouse} · Lowest cost ($${bestWh.landedPerKg.toFixed(2)}/kg)`, state: 'active' },
        { title: 'In Transit', time: 'Pending carrier pickup', state: 'pending' },
        { title: 'Expected Delivery', time: bestWh.etaFull, state: 'pending' },
      ],
      impact: {
        incomingQty: qtyToOrder,
        openDemand: item.openDemand,
        projectedBalance: item.available + item.incoming + qtyToOrder - item.openDemand,
      },
    };
    setShipmentsList(prev => [newShipment, ...prev]);

    // 3. Record confirmation banner for side panel
    setReplenishConfirmations(prev => ({
      ...prev,
      [item.id]: {
        shipmentId,
        poId,
        qty: qtyToOrder,
        warehouse: bestWh.warehouse,
        totalCost: bestWh.totalCost,
        landedPerKg: bestWh.landedPerKg,
        eta: bestWh.etaShort,
      },
    }));
  };

  // Batch auto-replenish handler for all below-threshold items
  const handleBatchReplenish = () => {
    if (belowThresholdItems.length === 0) return;

    let totalVolume = 0;
    let totalCost = 0;
    const newShipments = [];
    const newConfirmations = {};
    let curCounter = orderCounter;

    const updatedInventory = inventoryItems.map(inv => {
      const match = belowThresholdItems.find(b => b.id === inv.id);
      if (!match) return inv;

      const qtyToOrder = match.replenishQty;
      const bestWh = match.bestWarehouse || getLowestCostWarehouse(match, qtyToOrder);
      curCounter += 1;
      const shipmentId = `SH-${7827 + curCounter}`;
      const poId = `PO-${2899 + curCounter}`;

      totalVolume += qtyToOrder;
      totalCost += bestWh.totalCost;

      newConfirmations[inv.id] = {
        shipmentId,
        poId,
        qty: qtyToOrder,
        warehouse: bestWh.warehouse,
        totalCost: bestWh.totalCost,
        landedPerKg: bestWh.landedPerKg,
        eta: bestWh.etaShort,
      };

      newShipments.push({
        id: shipmentId,
        greenId: inv.id,
        greenName: inv.name,
        qty: qtyToOrder,
        warehouse: bestWh.warehouse,
        eta: bestWh.etaFull,
        etaBucket: 'this-week',
        status: 'Scheduled',
        delayed: false,
        linkedOrder: poId,
        statusUpdated: 'Oct 25, 2026, Just now',
        timeline: [
          { title: 'Batch Replenish PO Placed', time: 'Oct 25, 2026, Just now', state: 'done' },
          { title: 'Scheduled for Dispatch', time: `${bestWh.warehouse} · Lowest cost ($${bestWh.landedPerKg.toFixed(2)}/kg)`, state: 'active' },
          { title: 'In Transit', time: 'Pending carrier pickup', state: 'pending' },
          { title: 'Expected Delivery', time: bestWh.etaFull, state: 'pending' },
        ],
        impact: {
          incomingQty: qtyToOrder,
          openDemand: inv.openDemand,
          projectedBalance: inv.available + inv.incoming + qtyToOrder - inv.openDemand,
        },
      });

      return {
        ...inv,
        incoming: inv.incoming + qtyToOrder,
        incomingEta: bestWh.etaShort,
        updated: 'Just now',
        replenished: true,
        incomingShipments: [
          { id: shipmentId, qty: `${qtyToOrder.toLocaleString()} kg`, from: bestWh.warehouse, eta: bestWh.etaShort },
          ...(inv.incomingShipments || []),
        ],
      };
    });

    setOrderCounter(curCounter);
    setInventoryItems(updatedInventory);
    setShipmentsList(prev => [...newShipments, ...prev]);
    setReplenishConfirmations(prev => ({ ...prev, ...newConfirmations }));
    setBatchBanner({
      greensCount: belowThresholdItems.length,
      volume: totalVolume,
      cost: totalCost,
    });
  };

  // Delay risk mitigation handler
  const handleMitigateDelay = (shipment) => {
    setShipmentsList(prev =>
      prev.map(s => {
        if (s.id !== shipment.id) return s;
        return {
          ...s,
          delayed: false,
          mitigated: true,
          status: 'Mitigated · Buffer Staged',
          timeline: [
            ...s.timeline,
            {
              title: 'Delay Risk Mitigated: 1,500 kg Local Alternate Gc-14 allocated',
              time: 'Just now · Local Buyer action',
              state: 'done',
            },
          ],
        };
      })
    );
  };

  const handleExportCsv = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeTab === 'stock') {
      headers = ['Green ID', 'Green Name', 'Available (kg)', 'Open Demand (kg)', 'Min Threshold (kg)', 'Incoming (kg)', 'Projected Balance (kg)', 'Status', 'Alternate', 'Price ($/kg)', 'Updated'];
      rows = filteredRows.map(r => [
        r.id, r.name, r.available, r.openDemand, r.minThreshold, r.incoming, r.projectedBalance, r.statusMeta.label, r.alternate, r.price.toFixed(2), r.updated,
      ]);
      filename = 'local-stock-inventory.csv';
    } else {
      headers = ['Shipment ID', 'Green ID', 'Green Name', 'Quantity (kg)', 'From Warehouse', 'ETA', 'Status', 'Linked Order'];
      rows = filteredShipments.map(s => [
        s.id, s.greenId, s.greenName, s.qty, s.warehouse, s.eta, s.status, s.linkedOrder,
      ]);
      filename = 'incoming-shipments.csv';
    }

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1440, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 3px', letterSpacing: '-0.3px' }}>
            Inventory
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 6px' }}>
            Current stock, open demand and incoming supply for green materials.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}>
              <Clock size={11} style={{ color: C.subtle }} />
              Last updated: Oct 25, 2026, 10:24 AM
            </span>

            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              background: C.successBg,
              color: C.success,
              border: `1px solid ${C.successBorder}`,
            }}>
              Up to date
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {activeTab === 'stock' && belowThresholdItems.length > 0 && (
            <button
              onClick={handleBatchReplenish}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: C.rose,
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(216,63,121,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.roseHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.rose; }}
            >
              <Package size={13} />
              Replenish All Below Threshold ({belowThresholdItems.length})
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: '#FFFFFF',
              color: C.text,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(59,45,52,0.05)',
            }}
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Batch Replenish Success Notice Banner */}
      {batchBanner && (
        <div style={{
          background: C.roseSoft,
          border: `1px solid ${C.roseBorder}`,
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: C.text,
          animation: 'fadeInMenu 0.15s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={16} style={{ color: C.rose, strokeWidth: 2.5 }} />
            <span>
              <strong>Batch Order Placed:</strong> Replenished <strong>{batchBanner.greensCount} greens</strong> ({batchBanner.volume.toLocaleString()} kg total · ${batchBanner.cost.toLocaleString()} landed cost) to lowest-cost regional warehouses.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => { setActiveTab('incoming'); }}
              style={{
                background: 'none',
                border: 'none',
                color: C.rose,
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              View Incoming Shipments →
            </button>
            <button
              onClick={() => setBatchBanner(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── 4 KPI Summary Cards (Matching Image) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {/* Card 1: Greens Tracked */}
        <div style={{
          background: '#FAF5FF',
          border: '1px solid #E9D8FD',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Top-Right InfoTooltip */}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
            <InfoTooltip
              title="Total Green Coffee Materials"
              content="Unique green coffee materials active at Site 1054 Plano Roasting and tracked in inventory."
              align="left"
              position="top"
              size={11}
              color="#6B46C1"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#E9D8FD',
              color: '#6B46C1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Leaf size={16} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#6B46C1', marginBottom: 2 }}>
                Greens Tracked
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {computedItems.length}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Short for Open Orders */}
        <div style={{
          background: '#FFF5F5',
          border: '1px solid #FED7D7',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Top-Right InfoTooltip */}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
            <InfoTooltip
              title="Open Order Shortage Risk"
              content="Greens where unreserved stock is less than open production demand. Transfer PO or alternate bean required."
              align="right"
              position="top"
              size={11}
              color="#C53030"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#FED7D7',
              color: '#C53030',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={16} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#C53030', marginBottom: 2 }}>
                Short for Open Orders
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {shortOrdersCount}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Arriving This Week */}
        <div style={{
          background: '#F0FFF4',
          border: '1px solid #C6F6D5',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Top-Right InfoTooltip */}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
            <InfoTooltip
              title="Scheduled Inbound Shipments"
              content="Inbound transfer shipments scheduled to arrive at Site 1054 receiving bay within the next 7 calendar days."
              align="right"
              position="top"
              size={11}
              color="#22543D"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#C6F6D5',
              color: '#22543D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Truck size={16} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#22543D', marginBottom: 2 }}>
                Arriving This Week
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {arrivingCount}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Needs Attention */}
        <div style={{
          background: '#FFFAF0',
          border: '1px solid #FEEBC8',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Top-Right InfoTooltip */}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
            <InfoTooltip
              title="Safety Threshold Breaches"
              content="Materials where unreserved stock is below the designated minimum safety threshold required to protect roasting uptime."
              align="right"
              position="top"
              size={11}
              color="#7B341E"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#FEEBC8',
              color: '#7B341E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bell size={16} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#7B341E', marginBottom: 2 }}>
                Needs Attention
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {needsAttentionCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Split View: Inventory / Incoming Table (Left) + Right Side Detail Panel (Right) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showSidePanel ? 'minmax(0, 1fr) 330px' : 'minmax(0, 1fr)',
        gap: 14,
        alignItems: 'start',
        width: '100%',
      }}>

        {/* ── LEFT COLUMN: Toggle Tabs + Card Container ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

          {/* Stock / Incoming Shipments Toggle Tabs (Matched to Screenshot + Theme Palette) */}
          <div style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            background: '#F4EFF2',
            padding: 3,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('stock');
                setShowSidePanel(true);
              }}
              style={{
                padding: '6px 18px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                border: 'none',
                background: activeTab === 'stock' ? C.plum : 'transparent',
                color: activeTab === 'stock' ? '#FFFFFF' : C.muted,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === 'stock' ? '0 1px 3px rgba(48,39,43,0.18)' : 'none',
              }}
            >
              Stock
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('incoming');
                setShowSidePanel(true);
              }}
              style={{
                padding: '6px 18px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                border: 'none',
                background: activeTab === 'incoming' ? C.plum : 'transparent',
                color: activeTab === 'incoming' ? '#FFFFFF' : C.muted,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === 'incoming' ? '0 1px 3px rgba(48,39,43,0.18)' : 'none',
              }}
            >
              Incoming Shipments
            </button>
          </div>

          {/* ── TABLE CARD CONTAINER ── */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(59,45,52,0.05)',
            overflow: 'visible',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>

            {activeTab === 'stock' ? (
              <>
                {/* Stock Controls Bar */}
                <div style={{
                  padding: '12px 14px',
                  borderBottom: `1px solid ${C.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}>
                  <div style={{ position: 'relative', flex: '1 1 160px', maxWidth: 210 }}>
                    <Search size={11} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
                    <input
                      type="text"
                      value={search}
                      onChange={e => {
                        setSearch(e.target.value);
                        setStockPage(1);
                      }}
                      placeholder="Search by green ID or name…"
                      style={{
                        width: '100%',
                        padding: '5px 8px 5px 26px',
                        fontSize: 10.5,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        outline: 'none',
                        color: C.text,
                        background: '#FFFFFF',
                      }}
                    />
                  </div>

                  {/* Selects */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <ThemedSelect
                      value={statusFilter}
                      onChange={v => { setStatusFilter(v); setStockPage(1); }}
                      prefix="Status: "
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'short', label: 'Short' },
                        { value: 'critical', label: 'Critical' },
                        { value: 'tight', label: 'Tight' },
                        { value: 'covered', label: 'Covered' },
                      ]}
                      size="sm"
                    />

                    <ThemedSelect
                      value={incomingFilter}
                      onChange={v => { setIncomingFilter(v); setStockPage(1); }}
                      prefix="Incoming: "
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'None' },
                      ]}
                      size="sm"
                    />

                    <ThemedSelect
                      value={alternateFilter}
                      onChange={v => { setAlternateFilter(v); setStockPage(1); }}
                      prefix="Alternate: "
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'None' },
                      ]}
                      size="sm"
                      align="right"
                    />
                  </div>
                </div>

                {/* Stock Inventory Table */}
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.divider}`, background: '#FAF8F9' }}>
                        <th style={{ padding: '7px 8px 7px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px' }}>
                          Green ID
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px' }}>
                          Green Name
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Available<br />(kg)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Open Demand<br />(kg)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Min Thresh.<br />(kg)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Incoming<br />(kg)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Projected<br />Balance (kg)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px' }}>
                          Status
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Alternate<br />(Available)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                          Price<br />(per kg)
                        </th>
                        <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '0.2px' }}>
                          Updated
                        </th>
                        <th style={{ padding: '7px 6px', width: 16 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={12} style={{ padding: 28, textAlign: 'center', fontSize: 11, color: C.muted }}>
                            No greens match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row, idx) => {
                          const isAlertRow = row.statusMeta.isRowAlert;
                          const isSelected = selectedGreenId === row.id && showSidePanel;

                          return (
                            <tr
                              key={row.id}
                              onClick={() => {
                                setSelectedGreenId(row.id);
                                setShowSidePanel(true);
                              }}
                              style={{
                                borderBottom: idx < paginatedRows.length - 1 ? `1px solid ${C.divider}` : 'none',
                                background: isSelected ? '#FAF2F6' : (isAlertRow ? '#FFF5F6' : '#FFFFFF'),
                                borderLeft: isSelected ? `3px solid ${C.rose}` : '3px solid transparent',
                                cursor: 'pointer',
                                transition: 'background 0.12s ease',
                              }}
                              onMouseEnter={e => {
                                if (!isSelected && !isAlertRow) e.currentTarget.style.background = C.hover;
                              }}
                              onMouseLeave={e => {
                                if (!isSelected && !isAlertRow) e.currentTarget.style.background = '#FFFFFF';
                              }}
                            >
                              {/* Green ID */}
                              <td style={{ padding: '9px 8px 9px 12px', fontSize: 10.5, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>
                                {row.id}
                              </td>

                              {/* Green Name */}
                              <td style={{ padding: '9px 8px', fontSize: 10.5, color: C.text, whiteSpace: 'nowrap' }}>
                                {row.name}
                              </td>

                              {/* Available (kg) */}
                              <td style={{ padding: '9px 8px', fontSize: 10.5, fontWeight: 600, color: C.text, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {row.available.toLocaleString()}
                              </td>

                              {/* Open Demand (kg) */}
                              <td style={{ padding: '9px 8px', fontSize: 10.5, color: C.text, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {row.openDemand.toLocaleString()}
                              </td>

                              {/* Min Threshold (kg) */}
                              <td style={{ padding: '9px 8px', fontSize: 10.5, color: C.muted, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {row.minThreshold.toLocaleString()}
                              </td>

                              {/* Incoming (kg) + ETA */}
                              <td style={{ padding: '9px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {row.incoming > 0 ? (
                                  <div>
                                    <div style={{ fontSize: 10.5, fontWeight: 600, color: C.text }}>
                                      {row.incoming.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 8.5, color: C.subtle }}>
                                      ETA: {row.incomingEta}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: 10.5, color: C.subtle }}>—</span>
                                )}
                              </td>

                              {/* Projected Balance (kg) */}
                              <td style={{ padding: '9px 8px', fontSize: 10.5, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: row.projectedBalance <= 0 ? C.crit : C.text }}>
                                {row.projectedBalance.toLocaleString()}
                              </td>

                              {/* Status Badge */}
                              <td style={{ padding: '9px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '2px 7px',
                                  borderRadius: 20,
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  background: row.statusMeta.bg,
                                  color: row.statusMeta.color,
                                  border: `1px solid ${row.statusMeta.border}`,
                                }}>
                                  {row.statusMeta.label}
                                </span>
                              </td>

                              {/* Alternate (Available) */}
                              <td style={{ padding: '9px 8px', fontSize: 10, color: row.alternate !== '—' ? C.text : C.subtle, whiteSpace: 'nowrap' }}>
                                {row.alternate}
                              </td>

                              {/* Price (per kg) */}
                              <td style={{ padding: '9px 8px', fontSize: 10.5, fontWeight: 600, color: C.text, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                ${row.price.toFixed(2)}
                              </td>

                              {/* Updated */}
                              <td style={{ padding: '9px 8px', fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>
                                {row.updated}
                              </td>

                              {/* Row Arrow */}
                              <td style={{ padding: '9px 6px 9px 0', textAlign: 'center' }}>
                                <ChevronRight size={11} style={{ color: isSelected ? C.rose : C.subtle }} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Stock Pagination Footer */}
                <PaginationFooter
                  page={safeStockPage}
                  totalPages={totalStockPages}
                  totalItems={filteredRows.length}
                  perPage={ITEMS_PER_PAGE}
                  itemLabel="greens"
                  onPageChange={setStockPage}
                  helperNote="Status calculated on Open Demand & Min Threshold"
                />
              </>
            ) : (
              <>
                {/* Incoming Shipments Controls Bar (Matched to Screenshot) */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${C.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}>
                  <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 260 }}>
                    <Search size={11} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
                    <input
                      type="text"
                      value={shipSearch}
                      onChange={e => {
                        setShipSearch(e.target.value);
                        setShipPage(1);
                      }}
                      placeholder="Search by shipment ID or green"
                      style={{
                        width: '100%',
                        padding: '5px 8px 5px 26px',
                        fontSize: 11,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        outline: 'none',
                        color: C.text,
                        background: '#FFFFFF',
                      }}
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <ThemedSelect
                      value={shipStatusFilter}
                      onChange={v => { setShipStatusFilter(v); setShipPage(1); }}
                      prefix="Status: "
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'In Transit', label: 'In Transit' },
                        { value: 'Delayed', label: 'Delayed' },
                        { value: 'Scheduled', label: 'Scheduled' },
                      ]}
                      size="sm"
                    />

                    <ThemedSelect
                      value={shipFromFilter}
                      onChange={v => { setShipFromFilter(v); setShipPage(1); }}
                      prefix="From: "
                      options={[
                        { value: 'all', label: 'All Warehouses' },
                        { value: 'Warehouse 1055', label: 'Warehouse 1055 (Designated)' },
                        { value: 'Warehouse 1020', label: 'Warehouse 1020' },
                        { value: 'Warehouse 1021', label: 'Warehouse 1021' },
                      ]}
                      size="sm"
                    />

                    <ThemedSelect
                      value={shipEtaFilter}
                      onChange={v => { setShipEtaFilter(v); setShipPage(1); }}
                      prefix="ETA: "
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'this-week', label: 'This Week' },
                        { value: 'next-week', label: 'Next Week' },
                      ]}
                      size="sm"
                    />

                    <ThemedSelect
                      value={shipDelayFilter}
                      onChange={v => { setShipDelayFilter(v); setShipPage(1); }}
                      prefix="Has Delay: "
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'delayed', label: 'Delayed Only' },
                        { value: 'ontime', label: 'On Time' },
                      ]}
                      size="sm"
                      align="right"
                    />
                  </div>
                </div>

                {/* Incoming Shipments Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.divider}`, background: '#FAF8F9' }}>
                        <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          Shipment ID
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          Green ID
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          Green Name
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'right', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          Quantity
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          From (Warehouse)
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          ETA
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'center', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          Status
                        </th>
                        <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
                          Linked Order
                        </th>
                        <th style={{ padding: '9px 8px', width: 20 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedShipments.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ padding: 28, textAlign: 'center', fontSize: 11, color: C.muted }}>
                            No shipments match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedShipments.map((ship, idx) => {
                          const isSelected = selectedShipmentId === ship.id && showSidePanel;
                          const badge = getShipmentStatusMeta(ship.status);

                          return (
                            <tr
                              key={ship.id}
                              onClick={() => {
                                setSelectedShipmentId(ship.id);
                                setShowSidePanel(true);
                              }}
                              style={{
                                borderBottom: idx < paginatedShipments.length - 1 ? `1px solid ${C.divider}` : 'none',
                                background: isSelected ? '#FAF2F6' : '#FFFFFF',
                                borderLeft: isSelected ? `3px solid ${C.rose}` : '3px solid transparent',
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
                              <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: C.rose, whiteSpace: 'nowrap' }}>
                                {ship.id}
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>
                                {ship.greenId}
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>
                                {ship.greenName}
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: C.text, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {ship.qty.toLocaleString()} kg
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                                {ship.warehouse}
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>
                                {ship.eta}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '2px 9px',
                                  borderRadius: 20,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                }}>
                                  {ship.status}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: ship.linkedOrder !== '—' ? 700 : 400, color: ship.linkedOrder !== '—' ? C.text : C.subtle, whiteSpace: 'nowrap' }}>
                                {ship.linkedOrder}
                              </td>
                              <td style={{ padding: '10px 8px 10px 0', textAlign: 'center' }}>
                                <ChevronRight size={12} style={{ color: isSelected ? C.rose : C.subtle }} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <PaginationFooter
                  page={safeShipPage}
                  totalPages={totalShipPages}
                  totalItems={filteredShipments.length}
                  perPage={ITEMS_PER_PAGE}
                  itemLabel="shipments"
                  onPageChange={setShipPage}
                />
              </>
            )}

          </div>
        </div>

        {/* ── RIGHT SIDE PANEL ── */}
        {showSidePanel && activeTab === 'stock' && selectedItem && (
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(59,45,52,0.06)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'sticky',
            top: 14,
            animation: 'fadeIn 0.18s ease both',
          }}>
            {/* Header: Title + Close Button */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                  {selectedItem.id} · {selectedItem.name}
                </div>
                <button
                  onClick={() => setShowSidePanel(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 2,
                    cursor: 'pointer',
                    color: C.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close side panel"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Status Pill Badge */}
              <div style={{ marginTop: 2 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  background: selectedItem.statusMeta.bg,
                  color: selectedItem.statusMeta.color,
                  border: `1px solid ${selectedItem.statusMeta.border}`,
                }}>
                  {selectedItem.statusMeta.label}
                </span>
              </div>
            </div>

            {/* 4 Metrics Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
              padding: '10px 8px',
              background: '#FAF8F9',
              borderRadius: 6,
              border: `1px solid ${C.divider}`,
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: 9, color: C.subtle, marginBottom: 2 }}>Available</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{selectedItem.available.toLocaleString()} kg</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: C.subtle, marginBottom: 2 }}>Open Demand</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{selectedItem.openDemand.toLocaleString()} kg</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: C.subtle, marginBottom: 2 }}>Incoming</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                  {selectedItem.incoming > 0 ? `${selectedItem.incoming.toLocaleString()} kg` : '0 kg'}
                </div>
                {selectedItem.incomingEta && (
                  <div style={{ fontSize: 8, color: C.subtle }}>ETA: {selectedItem.incomingEta}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 9, color: C.subtle, marginBottom: 2 }}>Projected Balance</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: selectedItem.projectedBalance <= 0 ? C.crit : C.text }}>
                  {selectedItem.projectedBalance.toLocaleString()} kg
                </div>
              </div>
            </div>

            {/* Additional Info Row: Min Threshold */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 10,
              padding: '4px 2px',
              borderBottom: `1px solid ${C.divider}`,
            }}>
              <span style={{ color: C.muted }}>Safe Min Threshold</span>
              <span style={{ fontWeight: 700, color: C.text }}>{selectedItem.minThreshold.toLocaleString()} kg</span>
            </div>

            {/* Section 1: Open Orders */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                <FileText size={13} style={{ color: C.muted }} />
                <span>Open Orders ({selectedItem.openOrders?.length || 0})</span>
              </div>

              {selectedItem.openOrders && selectedItem.openOrders.length > 0 ? (
                <div style={{
                  border: `1px solid ${C.divider}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                      <tr style={{ background: '#FAF8F9', borderBottom: `1px solid ${C.divider}` }}>
                        <th style={{ padding: '5px 8px', textAlign: 'left', color: C.subtle, fontWeight: 600 }}>Order ID</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', color: C.subtle, fontWeight: 600 }}>Quantity</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', color: C.subtle, fontWeight: 600 }}>Need-by</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.openOrders.map((ord, oIdx) => (
                        <tr
                          key={ord.id}
                          onClick={() => navigate(`/orders/${ord.id}`)}
                          style={{
                            borderBottom: oIdx < selectedItem.openOrders.length - 1 ? `1px solid ${C.divider}` : 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <td style={{ padding: '6px 8px', fontWeight: 600, color: C.rose, fontFamily: 'monospace' }}>
                            {ord.id}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: C.text }}>
                            {ord.qty}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: C.muted }}>
                            {ord.needBy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: C.subtle, fontStyle: 'italic', padding: '4px 0' }}>
                  No open orders pending for this green.
                </div>
              )}
            </div>

            {/* Section 2: Incoming Shipments */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                <Truck size={13} style={{ color: C.muted }} />
                <span>Incoming Shipments ({selectedItem.incomingShipments?.length || 0})</span>
              </div>

              {selectedItem.incomingShipments && selectedItem.incomingShipments.length > 0 ? (
                <div style={{
                  border: `1px solid ${C.divider}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                      <tr style={{ background: '#FAF8F9', borderBottom: `1px solid ${C.divider}` }}>
                        <th style={{ padding: '5px 8px', textAlign: 'left', color: C.subtle, fontWeight: 600 }}>Shipment ID</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', color: C.subtle, fontWeight: 600 }}>Quantity</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', color: C.subtle, fontWeight: 600 }}>From Warehouse</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', color: C.subtle, fontWeight: 600 }}>ETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.incomingShipments.map((ship, sIdx) => (
                        <tr
                          key={ship.id}
                          onClick={() => setActiveTab('incoming')}
                          style={{
                            borderBottom: sIdx < selectedItem.incomingShipments.length - 1 ? `1px solid ${C.divider}` : 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <td style={{ padding: '6px 8px', fontWeight: 600, color: C.rose, fontFamily: 'monospace' }}>
                            {ship.id}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: C.text }}>
                            {ship.qty}
                          </td>
                          <td style={{ padding: '6px 8px', color: C.muted }}>
                            {ship.from}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: C.info }}>
                            {ship.eta}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: C.subtle, fontStyle: 'italic', padding: '4px 0' }}>
                  No inbound transfers scheduled.
                </div>
              )}
            </div>

            {/* Section 3: Approved Alternates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                <Leaf size={13} style={{ color: C.muted }} />
                <span>Approved Alternates ({selectedItem.approvedAlternates?.length || 0})</span>
              </div>

              {selectedItem.approvedAlternates && selectedItem.approvedAlternates.length > 0 ? (
                <div style={{
                  border: `1px solid ${C.divider}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                      <tr style={{ background: '#FAF8F9', borderBottom: `1px solid ${C.divider}` }}>
                        <th style={{ padding: '5px 8px', textAlign: 'left', color: C.subtle, fontWeight: 600 }}>Alternate Green</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', color: C.subtle, fontWeight: 600 }}>Available (kg)</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', color: C.subtle, fontWeight: 600 }}>Price (per kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.approvedAlternates.map((alt, aIdx) => (
                        <tr
                          key={aIdx}
                          style={{
                            borderBottom: aIdx < selectedItem.approvedAlternates.length - 1 ? `1px solid ${C.divider}` : 'none',
                          }}
                        >
                          <td style={{ padding: '6px 8px', fontWeight: 600, color: C.text }}>
                            {alt.name}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: C.muted }}>
                            {alt.available}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: C.text }}>
                            {alt.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: C.subtle, fontStyle: 'italic', padding: '4px 0' }}>
                  No approved alternate configured for this green.
                </div>
              )}
            </div>

            {/* Auto-Replenishment Action Block */}
            <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {replenishConfirmations[selectedItem.id] && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: C.successBg,
                  border: `1px solid ${C.successBorder}`,
                  color: C.success,
                  fontSize: 10,
                  lineHeight: 1.45,
                }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Check size={12} strokeWidth={2.5} />
                    Order {replenishConfirmations[selectedItem.id].shipmentId} Placed
                  </div>
                  <div style={{ marginTop: 2, color: C.text }}>
                    Ordered <strong>{replenishConfirmations[selectedItem.id].qty.toLocaleString()} kg</strong> from{' '}
                    <strong>{replenishConfirmations[selectedItem.id].warehouse}</strong>{' '}
                    (${replenishConfirmations[selectedItem.id].totalCost.toLocaleString()}). Covers open demand & maintains threshold.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShipmentId(replenishConfirmations[selectedItem.id].shipmentId);
                      setActiveTab('incoming');
                    }}
                    style={{
                      marginTop: 5,
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      color: C.rose,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    View in Incoming Shipments →
                  </button>
                </div>
              )}

              {selectedItem.replenishQty > 0 && selectedItem.bestWarehouse ? (
                <>
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#FDF8FA',
                    border: '1px solid #EFE3EA',
                    fontSize: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: C.muted }}>Replenish Qty (Demand + Thresh.)</span>
                      <strong style={{ color: C.text }}>{selectedItem.replenishQty.toLocaleString()} kg</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: C.muted }}>Lowest-Cost Warehouse</span>
                      <strong style={{ color: C.plum }}>{selectedItem.bestWarehouse.warehouse}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: C.muted }}>Est. Landed Cost (${selectedItem.bestWarehouse.landedPerKg.toFixed(2)}/kg)</span>
                      <strong style={{ color: C.rose }}>${selectedItem.bestWarehouse.totalCost.toLocaleString()}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAutoReplenish(selectedItem)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: C.rose,
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(216,63,121,0.25)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.roseHover}
                    onMouseLeave={e => e.currentTarget.style.background = C.rose}
                  >
                    Auto-Replenish {selectedItem.replenishQty.toLocaleString()} kg · {selectedItem.bestWarehouse.warehouse}
                  </button>
                </>
              ) : !replenishConfirmations[selectedItem.id] && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: C.successBg,
                  border: `1px solid ${C.successBorder}`,
                  color: C.success,
                  fontSize: 10.5,
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  ✓ Open orders & min threshold ({selectedItem.minThreshold.toLocaleString()} kg) covered
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RIGHT SIDE PANEL: SHIPMENT DETAILS (Unified with Synced Order State) ── */}
        {showSidePanel && activeTab === 'incoming' && selectedShipment && (() => {
          const linkedOrder = orders.find(o => o.id === selectedShipment.linkedOrder);
          const currentStatus = linkedOrder ? linkedOrder.status : (selectedShipment.delayed ? 'dispatched' : 'in transit');
          const orderMeta = getOrderStatusMeta(currentStatus);
          const impact = selectedShipment.impact;
          const auditTimeline = linkedOrder?.timeline || selectedShipment.timeline || [];

          return (
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: '0 1px 3px rgba(59,45,52,0.06)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              position: 'sticky',
              top: 14,
              animation: 'fadeIn 0.18s ease both',
            }}>
              {/* Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                  Shipment & Fulfillment Details
                </div>
                <button
                  onClick={() => setShowSidePanel(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 2,
                    cursor: 'pointer',
                    color: C.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close side panel"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Shipment ID + Unified Canonical Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: '-0.3px', lineHeight: 1 }}>
                  {selectedShipment.id}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 9px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  background: orderMeta.bg,
                  color: orderMeta.color,
                  border: `1px solid ${orderMeta.border}`,
                  textTransform: 'capitalize',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: orderMeta.dotBg }} />
                  {orderMeta.label}
                </span>
              </div>

              {/* 2-Column Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px 12px',
                paddingBottom: 12,
                borderBottom: `1px solid ${C.divider}`,
              }}>
                <div>
                  <div style={{ fontSize: 9.5, color: C.subtle, marginBottom: 2 }}>Green Material</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                    {selectedShipment.greenId} — {selectedShipment.greenName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: C.subtle, marginBottom: 2 }}>ETA</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                    {selectedShipment.eta}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9.5, color: C.subtle, marginBottom: 2 }}>Shipment Quantity</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                    {selectedShipment.qty.toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: C.subtle, marginBottom: 2 }}>Linked Order PO</div>
                  {selectedShipment.linkedOrder && selectedShipment.linkedOrder !== '—' ? (
                    <div
                      onClick={() => navigate(`/orders/${selectedShipment.linkedOrder}`)}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.rose,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                      title="View order in Orders page"
                    >
                      {selectedShipment.linkedOrder} ↗
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: C.subtle }}>—</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 9.5, color: C.subtle, marginBottom: 2 }}>Source Hub</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                    {selectedShipment.warehouse}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: C.subtle, marginBottom: 2 }}>Responsible Actor</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: orderMeta.color }}>
                    {orderMeta.actor}
                  </div>
                </div>
              </div>

              {/* ── UNIFIED VERTICAL LIFECYCLE STEPPER & AUDIT TRAIL ── */}
              <div>
                <OrderLifecycleStepper
                  status={currentStatus}
                  orientation="vertical"
                  timeline={auditTimeline}
                  title="Unified Lifecycle Audit Trail"
                />
              </div>

              {/* Related Inventory Impact Card */}
              {impact && (
                <div style={{
                  background: '#FDF8FA',
                  border: '1px solid #EFE3EA',
                  borderRadius: 8,
                  padding: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Package size={13} style={{ color: C.rose }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                      Related Inventory Impact
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 9.5, color: C.muted, marginBottom: 2 }}>Incoming Qty</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                        {impact.incomingQty?.toLocaleString()} kg
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9.5, color: C.muted, marginBottom: 2 }}>Open Demand</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                        {impact.openDemand?.toLocaleString()} kg
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9.5, color: C.muted, marginBottom: 2 }}>Projected Balance</div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: impact.projectedBalance >= 0 ? C.success : C.crit,
                      }}>
                        {impact.projectedBalance >= 0 ? '+' : ''}{impact.projectedBalance?.toLocaleString()} kg
                      </div>
                    </div>
                  </div>

                  {selectedShipment.delayed && (
                    <button
                      type="button"
                      onClick={() => handleMitigateDelay(selectedShipment)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: C.crit,
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <AlertTriangle size={13} />
                      Mitigate Delay Risk (Allocate Alternate)
                    </button>
                  )}
                </div>
              )}

              {/* ── Contextual Local Buyer Action Button ── */}
              {linkedOrder && (
                <div>
                  {linkedOrder.status === 'delivered' && (
                    <button
                      type="button"
                      onClick={() => buyerReceive(linkedOrder.id)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
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
                      Inspect & Mark Received at Dock
                    </button>
                  )}

                  {linkedOrder.status === 'received' && (
                    <button
                      type="button"
                      onClick={() => buyerClose(linkedOrder.id)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: 'none',
                        background: C.plum,
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(92,58,87,0.25)',
                      }}
                    >
                      Close Order & Book to Inventory
                    </button>
                  )}

                  {linkedOrder.status === 'closed' && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      color: '#15803D',
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}>
                      ✓ Order Completed & Booked into Stock
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

      </div>

    </div>
  );
}
