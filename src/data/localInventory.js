// Canonical Site 1054 (Plano Roasting) Green Material Inventory & Status Helpers
// Shared across OrdersContext, Inventory, and Dashboard for live stock & auto-approval sync.

export const INITIAL_LOCAL_INVENTORY = [
  {
    id: 'Gc-04',
    name: 'Colombia Supremo',
    available: 800,
    openDemand: 2000,
    minThreshold: 1200,
    incoming: 1200,
    incomingEta: 'Oct 27',
    alternate: 'Gc-12 (2,400 kg)',
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
      { name: 'Gc-12 · Huila Washed', available: '2,400 kg', price: '$4.10' },
      { name: 'Gc-17 · Kenya AA', available: '2,100 kg', price: '$4.60' },
    ],
  },
  {
    id: 'Gc-11',
    name: 'Brazil Cerrado',
    available: 700,
    openDemand: 1200,
    minThreshold: 1000,
    incoming: 0,
    incomingEta: null,
    alternate: 'Gc-14 (1,300 kg)',
    price: 4.20,
    updated: 'Today · PO-2848 (-900 kg alt)',
    openOrders: [
      { id: 'PO-2848', qty: '900 kg (Auto-Approved Alt for Gd-09)', needBy: 'Nov 14' },
      { id: 'PO-2842', qty: '800 kg', needBy: 'Nov 09' },
      { id: 'PO-2838', qty: '400 kg', needBy: 'Nov 04' },
    ],
    incomingShipments: [],
    approvedAlternates: [
      { name: 'Gc-14 · Guatemala Antigua', available: '1,300 kg', price: '$4.10' },
      { name: 'Gc-22 · Huila Washed', available: '900 kg', price: '$4.40' },
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
    alternate: 'Gc-22 (900 kg)',
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
      { name: 'Gc-22 · Huila Washed', available: '900 kg', price: '$4.40' },
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
    alternate: 'Gc-19 (700 kg)',
    price: 4.40,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2852', qty: '1,000 kg', needBy: 'Nov 02' },
    ],
    incomingShipments: [
      { id: 'SH-7718', qty: '200 kg', from: 'Warehouse 1021', eta: 'Oct 29' },
    ],
    approvedAlternates: [
      { name: 'Gc-19 · Ethiopia Yirgacheffe', available: '700 kg', price: '$4.60' },
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
    alternate: 'Gc-17 (2,100 kg)',
    price: 4.60,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2855', qty: '400 kg', needBy: 'Nov 03' },
    ],
    incomingShipments: [],
    approvedAlternates: [
      { name: 'Gc-17 · Kenya AA', available: '2,100 kg', price: '$4.60' },
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
    alternate: 'Gc-11 (700 kg)',
    price: 4.85,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2848', qty: '900 kg (Auto-fulfilled via Gc-11)', needBy: 'Nov 14' },
    ],
    incomingShipments: [
      { id: 'TR-502', qty: '500 kg', from: 'Warehouse 1020', eta: 'Nov 07' },
    ],
    approvedAlternates: [
      { name: 'Gc-11 · Brazil Cerrado', available: '700 kg', price: '$4.20' },
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
    alternate: 'Gc-19 (700 kg)',
    price: 5.20,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2845', qty: '800 kg', needBy: 'Nov 11' },
    ],
    incomingShipments: [
      { id: 'SH-7720', qty: '600 kg', from: 'Warehouse 1055', eta: 'Nov 03' },
    ],
    approvedAlternates: [
      { name: 'Gc-19 · Ethiopia Yirgacheffe', available: '700 kg', price: '$4.60' },
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
    alternate: 'Gc-14 (1,300 kg)',
    price: 4.30,
    updated: 'Oct 25',
    openOrders: [
      { id: 'PO-2847', qty: '1,000 kg', needBy: 'Nov 13' },
    ],
    incomingShipments: [
      { id: 'SH-7724', qty: '200 kg', from: 'Warehouse 1021', eta: 'Nov 06' },
    ],
    approvedAlternates: [
      { name: 'Gc-14 · Guatemala Antigua', available: '1,300 kg', price: '$4.10' },
    ],
  },
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

const STATUS_STYLE = {
  covered:  { key: 'covered',  label: 'Covered',  bg: '#EDF7F1', color: '#1E8A3C', border: '#B4DDBD', isRowAlert: false },
  tight:    { key: 'tight',    label: 'Tight',    bg: '#FFF7E6', color: '#B86A00', border: '#F5D68A', isRowAlert: false },
  short:    { key: 'short',    label: 'Short',    bg: '#FEF0F2', color: '#D83040', border: '#F5B8C0', isRowAlert: true  },
  critical: { key: 'critical', label: 'Critical', bg: '#FEF0F2', color: '#D83040', border: '#F5B8C0', isRowAlert: true  },
};

export function evaluateItemStatus(item) {
  const projectedBalance = item.available + item.incoming - item.openDemand;

  if (item.replenished && projectedBalance >= item.minThreshold) {
    return STATUS_STYLE.covered;
  }

  if (item.available < item.openDemand && projectedBalance < 0) {
    return STATUS_STYLE.critical;
  }

  if (item.available < item.openDemand || projectedBalance === 0) {
    return STATUS_STYLE.short;
  }

  if (item.available < item.minThreshold || projectedBalance < item.minThreshold) {
    if (item.available < item.minThreshold * 0.5) {
      return STATUS_STYLE.critical;
    }
    return STATUS_STYLE.tight;
  }

  return STATUS_STYLE.covered;
}

/**
 * Evaluate whether an incoming order can be fulfilled solely from local Site 1054 inventory
 * (same green OR approved alternate green), picking whichever feasible local option is cheapest.
 */
export function findCheapestLocalOption(greenId, orderQuantity, inventory = INITIAL_LOCAL_INVENTORY) {
  const qty = Number(orderQuantity) || 0;
  const requestedItem = inventory.find(i => i.id === greenId);
  if (!requestedItem || qty <= 0) {
    return { winner: null, candidates: [], requestedItem };
  }

  const candidates = [];

  // Candidate 1: Local same green
  if (requestedItem.available >= qty) {
    candidates.push({
      greenId: requestedItem.id,
      greenName: requestedItem.name,
      available: requestedItem.available,
      unitPrice: requestedItem.price,
      totalCost: Math.round(qty * requestedItem.price),
      mode: 'local-same',
    });
  }

  // Candidate 2: Approved alternate greens present in local inventory
  (requestedItem.approvedAlternates || []).forEach(alt => {
    const altId = String(alt.name || '').split('·')[0].trim();
    const altInv = inventory.find(i => i.id === altId);
    if (altInv && altInv.available >= qty) {
      candidates.push({
        greenId: altInv.id,
        greenName: altInv.name,
        available: altInv.available,
        unitPrice: altInv.price,
        totalCost: Math.round(qty * altInv.price),
        mode: 'local-alternate',
      });
    }
  });

  // Sort cheapest total cost first; break exact ties in favor of same green
  candidates.sort((a, b) => {
    if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
    return a.mode === 'local-same' ? -1 : 1;
  });

  return {
    winner: candidates[0] || null,
    candidates,
    requestedItem,
  };
}

