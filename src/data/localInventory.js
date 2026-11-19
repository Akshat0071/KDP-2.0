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
      { id: '2846', qty: '1,200 kg', needBy: 'Oct 28' },
      { id: '2847', qty: '800 kg', needBy: 'Oct 29' },
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
    updated: 'Today · Order 2848 (-900 kg alt)',
    openOrders: [
      { id: '2848', qty: '900 kg (Auto-Approved Alt for Gd-09)', needBy: 'Nov 14' },
      { id: '2842', qty: '800 kg', needBy: 'Nov 09' },
      { id: '2838', qty: '400 kg', needBy: 'Nov 04' },
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
      { id: '2844', qty: '600 kg', needBy: 'Nov 07' },
      { id: '2849', qty: '500 kg', needBy: 'Nov 08' },
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
      { id: '2852', qty: '1,000 kg', needBy: 'Nov 02' },
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
      { id: '2855', qty: '400 kg', needBy: 'Nov 03' },
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
      { id: '2848', qty: '900 kg (Auto-fulfilled via Gc-11)', needBy: 'Nov 14' },
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
      { id: '2845', qty: '800 kg', needBy: 'Nov 11' },
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
      { id: '2846', qty: '1,500 kg', needBy: 'Nov 12' },
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
      { id: '2847', qty: '1,000 kg', needBy: 'Nov 13' },
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
    openOrders: [{ id: '2858', qty: '600 kg', needBy: 'Nov 14' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-04 · Colombia Supremo', available: '800 kg', price: '$3.90' }],
  },
  {
    id: 'Gc-17', name: 'Kenya AA Peaberry', available: 2100, openDemand: 500, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Ga-17 (3,400 kg)', price: 4.60, updated: 'Oct 25',
    openOrders: [{ id: '2860', qty: '500 kg', needBy: 'Nov 15' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Ga-17 · Kenya AA Nyeri', available: '3,400 kg', price: '$5.20' }],
  },
  {
    id: 'Bc-14', name: 'Brazil Cerrado Natural', available: 2800, openDemand: 900, minThreshold: 1200,
    incoming: 0, incomingEta: null, alternate: 'Gc-11 (1,600 kg)', price: 3.75, updated: 'Oct 25',
    openOrders: [{ id: '2861', qty: '900 kg', needBy: 'Nov 16' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-11 · Brazil Cerrado', available: '1,600 kg', price: '$4.20' }],
  },
  {
    id: 'Hb-05', name: 'Honduras Marcala SHG', available: 1900, openDemand: 400, minThreshold: 900,
    incoming: 0, incomingEta: null, alternate: 'Gc-14 (1,300 kg)', price: 3.95, updated: 'Oct 25',
    openOrders: [{ id: '2862', qty: '400 kg', needBy: 'Nov 17' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-14 · Guatemala Antigua', available: '1,300 kg', price: '$4.10' }],
  },
  {
    id: 'Et-09', name: 'Ethiopia Sidamo Washed', available: 2200, openDemand: 600, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Gc-19 (700 kg)', price: 4.70, updated: 'Oct 25',
    openOrders: [{ id: '2863', qty: '600 kg', needBy: 'Nov 18' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-19 · Ethiopia Yirgacheffe', available: '700 kg', price: '$4.60' }],
  },
  {
    id: 'Pe-11', name: 'Peru Cajamarca Organic', available: 2600, openDemand: 700, minThreshold: 1100,
    incoming: 0, incomingEta: null, alternate: 'Gc-22 (900 kg)', price: 4.05, updated: 'Oct 25',
    openOrders: [{ id: '2864', qty: '700 kg', needBy: 'Nov 19' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-22 · Huila Washed', available: '900 kg', price: '$4.40' }],
  },
  {
    id: 'Ni-06', name: 'Nicaragua Jinotega', available: 1850, openDemand: 450, minThreshold: 900,
    incoming: 0, incomingEta: null, alternate: 'Gh-08 (1,600 kg)', price: 3.85, updated: 'Oct 25',
    openOrders: [{ id: '2865', qty: '450 kg', needBy: 'Nov 19' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gh-08 · Costa Rica Tarrazu', available: '1,600 kg', price: '$4.30' }],
  },
  {
    id: 'Mx-03', name: 'Mexico Chiapas Altura', available: 2300, openDemand: 500, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Gc-14 (1,300 kg)', price: 3.80, updated: 'Oct 25',
    openOrders: [{ id: '2866', qty: '500 kg', needBy: 'Nov 20' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-14 · Guatemala Antigua', available: '1,300 kg', price: '$4.10' }],
  },
  {
    id: 'Rw-04', name: 'Rwanda Bourbon Kigali', available: 1750, openDemand: 350, minThreshold: 800,
    incoming: 0, incomingEta: null, alternate: 'Ga-17 (3,400 kg)', price: 4.95, updated: 'Oct 25',
    openOrders: [{ id: '2867', qty: '350 kg', needBy: 'Nov 20' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Ga-17 · Kenya AA Nyeri', available: '3,400 kg', price: '$5.20' }],
  },
  {
    id: 'Sv-07', name: 'El Salvador Pacamara', available: 2050, openDemand: 450, minThreshold: 950,
    incoming: 0, incomingEta: null, alternate: 'Gh-08 (1,600 kg)', price: 4.45, updated: 'Oct 25',
    openOrders: [{ id: '2868', qty: '450 kg', needBy: 'Nov 21' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gh-08 · Costa Rica Tarrazu', available: '1,600 kg', price: '$4.30' }],
  },
  {
    id: 'Pa-02', name: 'Panama Boquete Catuai', available: 1650, openDemand: 300, minThreshold: 800,
    incoming: 0, incomingEta: null, alternate: 'Gh-08 (1,600 kg)', price: 5.40, updated: 'Oct 25',
    openOrders: [{ id: '2869', qty: '300 kg', needBy: 'Nov 21' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gh-08 · Costa Rica Tarrazu', available: '1,600 kg', price: '$4.30' }],
  },
  {
    id: 'Br-21', name: 'Brazil Mogiana Pulped', available: 3100, openDemand: 800, minThreshold: 1400,
    incoming: 0, incomingEta: null, alternate: 'Gc-11 (1,600 kg)', price: 3.65, updated: 'Oct 24',
    openOrders: [{ id: '2870', qty: '800 kg', needBy: 'Nov 22' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Gc-11 · Brazil Cerrado', available: '1,600 kg', price: '$4.20' }],
  },
  {
    id: 'In-08', name: 'India Monsooned Malabar', available: 1950, openDemand: 400, minThreshold: 900,
    incoming: 0, incomingEta: null, alternate: '—', price: 4.15, updated: 'Oct 24',
    openOrders: [{ id: '2871', qty: '400 kg', needBy: 'Nov 22' }], incomingShipments: [],
    approvedAlternates: [],
  },
  {
    id: 'Tz-05', name: 'Tanzania Peaberry North', available: 2150, openDemand: 550, minThreshold: 1000,
    incoming: 0, incomingEta: null, alternate: 'Ga-17 (3,400 kg)', price: 4.80, updated: 'Oct 24',
    openOrders: [{ id: '2872', qty: '550 kg', needBy: 'Nov 23' }], incomingShipments: [],
    approvedAlternates: [{ name: 'Ga-17 · Kenya AA Nyeri', available: '3,400 kg', price: '$5.20' }],
  },
  {
    id: 'Co-19', name: 'Colombia Cauca Excelso', available: 2700, openDemand: 700, minThreshold: 1200,
    incoming: 0, incomingEta: null, alternate: 'Gc-12 (2,400 kg)', price: 4.00, updated: 'Oct 24',
    openOrders: [{ id: '2873', qty: '700 kg', needBy: 'Nov 24' }], incomingShipments: [],
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
  // Healthy physical stock above both safety threshold and open demand
  if (item.available >= item.minThreshold && item.available >= item.openDemand) {
    return STATUS_STYLE.covered;
  }

  // Stock is below open demand (immediate shortage risk)
  if (item.available < item.openDemand) {
    if (item.available <= item.minThreshold * 0.3) {
      return STATUS_STYLE.critical;
    }
    return STATUS_STYLE.short;
  }

  // Stock is below safe minimum threshold
  if (item.available < item.minThreshold) {
    if (item.available <= item.minThreshold * 0.5) {
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

/**
 * Generate all 5 sourcing scenarios and 3-warehouse competitive quotes
 * for any green coffee bean demand at roasting facilities.
 *
 * Scenarios evaluated:
 * 1. Same Site, Same Green (100% on-site stock, $0 freight)
 * 2. Same Site, Alternate Green (Local approved alternate, $0 freight)
 * 3. Warehouse Same Green (Competitive RFQ: Warehouse 1055, 1020, 1021)
 * 4. Warehouse Alternate Green (RFQ on approved alternate bean)
 * 5. Split Order Fulfillment (Local partial on-hand + balance from warehouse)
 */
export function generateSourcingScenarios(greenId, orderQuantity, inventory = INITIAL_LOCAL_INVENTORY, needByDate = 'Nov 12, 2026') {
  const qty = Number(orderQuantity) || 0;
  const requestedItem = inventory.find(i => i.id === greenId) || {
    id: greenId,
    name: greenId,
    available: 0,
    price: 4.10,
    approvedAlternates: [],
  };

  const unitPrice = requestedItem.price || 4.10;
  const localAvail = requestedItem.available || 0;

  // ── Scenario 1: Same Site, Same Green ──
  const isLocalSameFeasible = localAvail >= qty;
  const scenario1 = {
    id: 'scen-1-local-same',
    type: 'LOCAL_SAME',
    label: 'Scenario 1: Same Site, Same Green',
    shortLabel: 'Local Same Green',
    feasible: isLocalSameFeasible,
    greenId: requestedItem.id,
    greenName: requestedItem.name,
    allocatedQty: isLocalSameFeasible ? qty : localAvail,
    availableStock: localAvail,
    unitPrice,
    freightCost: 0,
    totalCost: Math.round(qty * unitPrice),
    landedPerKg: unitPrice,
    eta: 'Immediate (On-Site Stock)',
    facility: 'Site 1054 · Plano Roasting',
    badge: isLocalSameFeasible ? 'OPTIMAL $0 FREIGHT' : 'INSUFFICIENT STOCK',
    note: isLocalSameFeasible
      ? `Full ${qty.toLocaleString()} kg allocated from on-site silos. $0 freight cost.`
      : `Only ${localAvail.toLocaleString()} kg available on-site (${(qty - localAvail).toLocaleString()} kg short).`,
  };

  // ── Scenario 2: Same Site, Alternate Green ──
  const altCandidates = [];
  (requestedItem.approvedAlternates || []).forEach(alt => {
    const altId = String(alt.name || '').split('·')[0].trim();
    const altInv = inventory.find(i => i.id === altId);
    if (altInv) {
      altCandidates.push({
        greenId: altInv.id,
        greenName: altInv.name,
        available: altInv.available,
        unitPrice: altInv.price,
        totalCost: Math.round(qty * altInv.price),
        feasible: altInv.available >= qty,
      });
    }
  });
  // Sort alt candidates by cost
  altCandidates.sort((a, b) => a.totalCost - b.totalCost);
  const bestAlt = altCandidates.find(c => c.feasible) || altCandidates[0] || null;

  const scenario2 = {
    id: 'scen-2-local-alt',
    type: 'LOCAL_ALT',
    label: 'Scenario 2: Same Site, Alternate Green',
    shortLabel: 'Local Alternate Green',
    feasible: Boolean(bestAlt && bestAlt.feasible),
    greenId: bestAlt ? bestAlt.greenId : null,
    greenName: bestAlt ? bestAlt.greenName : 'No Approved Alternate',
    allocatedQty: bestAlt && bestAlt.feasible ? qty : 0,
    availableStock: bestAlt ? bestAlt.available : 0,
    unitPrice: bestAlt ? bestAlt.unitPrice : 0,
    freightCost: 0,
    totalCost: bestAlt ? bestAlt.totalCost : 0,
    landedPerKg: bestAlt ? bestAlt.unitPrice : 0,
    eta: 'Immediate (On-Site Stock)',
    facility: 'Site 1054 · Plano Roasting',
    badge: (bestAlt && bestAlt.feasible) ? 'APPROVED ALTERNATE' : 'UNAVAILABLE',
    note: bestAlt && bestAlt.feasible
      ? `Approved substitution: ${bestAlt.greenId} (${bestAlt.greenName}) covers full demand with $0 freight.`
      : 'No approved alternate has sufficient on-site stock.',
    candidates: altCandidates,
  };

  // ── Scenario 3: Warehouse Transfer, Same Green (3-Warehouse Competitive Quotes) ──
  const warehouseQuotesSame = [
    {
      id: 'quote-1055-same',
      warehouseId: '1055',
      warehouseName: 'Warehouse 1055 (Plano/Windsor Hub)',
      location: 'Windsor, CT / Regional Hub',
      capability: 'FULL',
      capabilityLabel: 'Full Supply (100%)',
      allocatedQty: qty,
      availableStock: 5200,
      unitPrice,
      freightCost: 589,
      totalCost: Math.round(qty * unitPrice + 589),
      landedPerKg: Number(((qty * unitPrice + 589) / (qty || 1)).toFixed(2)),
      eta: '2-3 Business Days',
      deliveryDate: needByDate || 'Nov 11, 2026',
      meetsNeedBy: true,
      reason: 'Designated lowest-freight regional hub ($589 fixed contracted rate)',
      badge: 'LOWEST FREIGHT',
      isDesignated: true,
      status: 'active',
    },
    {
      id: 'quote-1020-same',
      warehouseId: '1020',
      warehouseName: 'Warehouse 1020 (Sumner Hub)',
      location: 'Sumner, WA',
      capability: 'FULL',
      capabilityLabel: 'Full Supply (100%)',
      allocatedQty: qty,
      availableStock: 3400,
      unitPrice: Number((unitPrice + 0.05).toFixed(2)),
      freightCost: 1000,
      totalCost: Math.round(qty * (unitPrice + 0.05) + 1000),
      landedPerKg: Number(((qty * (unitPrice + 0.05) + 1000) / (qty || 1)).toFixed(2)),
      eta: '4-5 Business Days',
      deliveryDate: 'Nov 13, 2026',
      meetsNeedBy: true,
      reason: 'Secondary West Coast hub · cross-country freight ($1,000 carrier rate)',
      badge: 'SECONDARY HUB',
      isDesignated: false,
      status: 'active',
    },
    {
      id: 'quote-1021-same',
      warehouseId: '1021',
      warehouseName: 'Warehouse 1021 (Essex Hub)',
      location: 'Essex, VT',
      capability: 'CANNOT_SUPPLY',
      capabilityLabel: 'Cannot Supply (0%)',
      allocatedQty: 0,
      availableStock: 350,
      unitPrice,
      freightCost: 1200,
      totalCost: null,
      landedPerKg: null,
      eta: '6-8 Business Days',
      deliveryDate: 'Nov 17, 2026',
      meetsNeedBy: false,
      reason: 'QA quarantine hold on current harvest lot #LK-402; unreserved buffer below safety cap',
      badge: 'UNAVAILABLE',
      isDesignated: false,
      status: 'declined',
    },
  ];

  const scenario3 = {
    id: 'scen-3-wh-same',
    type: 'WH_SAME',
    label: 'Scenario 3: Warehouse Transfer, Same Green',
    shortLabel: 'Warehouse Same Green',
    feasible: true,
    greenId: requestedItem.id,
    greenName: requestedItem.name,
    quotes: warehouseQuotesSame,
    winningQuote: warehouseQuotesSame[0],
    totalCost: warehouseQuotesSame[0].totalCost,
    landedPerKg: warehouseQuotesSame[0].landedPerKg,
    freightCost: warehouseQuotesSame[0].freightCost,
    eta: warehouseQuotesSame[0].eta,
    badge: '3 LIVE QUOTES',
    note: 'Competitive quotation received from 3 central warehouses. Warehouse 1055 is the lowest delivered cost.',
  };

  // ── Scenario 4: Warehouse Transfer, Alternate Green (3-Warehouse Quotes) ──
  const altName = bestAlt ? bestAlt.greenName : 'Huila Washed Reserve';
  const altId = bestAlt ? bestAlt.greenId : 'Gc-22';
  const altUnitPrice = bestAlt ? bestAlt.unitPrice : 4.40;

  const warehouseQuotesAlt = [
    {
      id: 'quote-1055-alt',
      warehouseId: '1055',
      warehouseName: 'Warehouse 1055 (Plano/Windsor Hub)',
      location: 'Windsor, CT / Regional Hub',
      capability: 'FULL',
      capabilityLabel: 'Full Supply (100%)',
      allocatedQty: qty,
      availableStock: 4800,
      unitPrice: altUnitPrice,
      freightCost: 589,
      totalCost: Math.round(qty * altUnitPrice + 589),
      landedPerKg: Number(((qty * altUnitPrice + 589) / (qty || 1)).toFixed(2)),
      eta: '2-3 Business Days',
      deliveryDate: needByDate || 'Nov 11, 2026',
      meetsNeedBy: true,
      reason: 'Alternate green transfer from lowest-freight regional hub',
      badge: 'LOWEST FREIGHT',
      isDesignated: true,
      status: 'active',
    },
    {
      id: 'quote-1020-alt',
      warehouseId: '1020',
      warehouseName: 'Warehouse 1020 (Sumner Hub)',
      location: 'Sumner, WA',
      capability: 'PARTIAL',
      capabilityLabel: 'Partial Supply (60%)',
      allocatedQty: Math.round(qty * 0.6),
      availableStock: 1800,
      unitPrice: altUnitPrice,
      freightCost: 1000,
      totalCost: Math.round(qty * 0.6 * altUnitPrice + 1000),
      landedPerKg: Number(((qty * 0.6 * altUnitPrice + 1000) / (qty * 0.6 || 1)).toFixed(2)),
      eta: '4-5 Business Days',
      deliveryDate: 'Nov 13, 2026',
      meetsNeedBy: true,
      reason: 'Partial allocation only due to West Coast reserve commitment',
      badge: 'PARTIAL ONLY',
      isDesignated: false,
      status: 'active',
    },
    {
      id: 'quote-1021-alt',
      warehouseId: '1021',
      warehouseName: 'Warehouse 1021 (Essex Hub)',
      location: 'Essex, VT',
      capability: 'CANNOT_SUPPLY',
      capabilityLabel: 'Cannot Supply (0%)',
      allocatedQty: 0,
      availableStock: 0,
      unitPrice: altUnitPrice,
      freightCost: 1200,
      totalCost: null,
      landedPerKg: null,
      eta: '6-8 Business Days',
      deliveryDate: 'Nov 17, 2026',
      meetsNeedBy: false,
      reason: 'Zero uncommitted inventory at facility',
      badge: 'UNAVAILABLE',
      isDesignated: false,
      status: 'declined',
    },
  ];

  const scenario4 = {
    id: 'scen-4-wh-alt',
    type: 'WH_ALT',
    label: 'Scenario 4: Warehouse Transfer, Alternate Green',
    shortLabel: 'Warehouse Alternate Green',
    feasible: true,
    greenId: altId,
    greenName: altName,
    quotes: warehouseQuotesAlt,
    winningQuote: warehouseQuotesAlt[0],
    totalCost: warehouseQuotesAlt[0].totalCost,
    landedPerKg: warehouseQuotesAlt[0].landedPerKg,
    freightCost: warehouseQuotesAlt[0].freightCost,
    eta: warehouseQuotesAlt[0].eta,
    badge: 'ALTERNATE TRANSFER',
    note: `Central transfer of approved alternate ${altId} (${altName}). Warehouse 1055 quote offers full capacity.`,
  };

  // ── Scenario 5: Split Order Fulfillment (Local Partial + Warehouse Remaining) ──
  const isSplitApplicable = localAvail > 0 && localAvail < qty;
  const splitLocalQty = isSplitApplicable ? localAvail : 0;
  const splitWhQty = isSplitApplicable ? qty - localAvail : 0;
  const splitLocalCost = splitLocalQty * unitPrice;
  const splitWhCost = splitWhQty * unitPrice + 589;
  const splitTotalCost = Math.round(splitLocalCost + splitWhCost);

  const scenario5 = {
    id: 'scen-5-split',
    type: 'SPLIT',
    label: 'Scenario 5: Split Fulfillment (Local + Warehouse)',
    shortLabel: 'Split Fulfillment',
    feasible: isSplitApplicable,
    localQty: splitLocalQty,
    warehouseQty: splitWhQty,
    localCost: Math.round(splitLocalCost),
    warehouseCost: Math.round(splitWhCost),
    freightCost: 589,
    totalCost: splitTotalCost,
    landedPerKg: qty > 0 ? Number((splitTotalCost / qty).toFixed(2)) : 0,
    eta: 'Immediate (Local) + 2 Days (WH 1055)',
    badge: isSplitApplicable ? 'HYBRID SOURCING' : 'NOT APPLICABLE',
    note: isSplitApplicable
      ? `Allocate ${splitLocalQty.toLocaleString()} kg immediately from Site 1054 ($0 freight) + transfer remaining ${splitWhQty.toLocaleString()} kg from Warehouse 1055 ($589 freight).`
      : 'Split sourcing only applies when local stock partially covers demand.',
  };

  // Determine Overall Recommended Scenario
  let recommendedScenario = scenario1;
  if (!scenario1.feasible) {
    if (scenario2.feasible && scenario2.totalCost < scenario3.totalCost) {
      recommendedScenario = scenario2;
    } else {
      recommendedScenario = scenario3;
    }
  }

  return {
    requestedItem,
    scenario1_LocalSame: scenario1,
    scenario2_LocalAlt: scenario2,
    scenario3_WarehouseSame: scenario3,
    scenario4_WarehouseAlt: scenario4,
    scenario5_Split: scenario5,
    recommendedScenario,
  };
}


