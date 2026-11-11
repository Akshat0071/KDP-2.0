import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, PiggyBank, Clock, ShieldCheck,
  Download, ArrowRight, Warehouse, Repeat, PackageCheck
} from 'lucide-react';
import ThemedSelect from '../../components/ui/ThemedSelect';
import InfoTooltip from '../../components/ui/InfoTooltip';

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
};

const PERIOD_OPTIONS = [
  { value: 'oct-2026', label: 'Oct 2026 (Current)' },
  { value: 'sep-2026', label: 'Sep 2026' },
  { value: 'q3-2026',  label: 'Q3 2026 (Jul–Sep)' },
  { value: 'ytd-2026', label: 'YTD 2026 (Jan–Oct)' },
];

const ANALYTICS_BY_PERIOD = {
  'oct-2026': {
    label: 'Oct 2026',
    kpis: {
      totalSpend: '$412,400',
      avgPerKg: '$4.18 / kg',
      baselineDelta: '-$0.50 vs $4.68 spot baseline',
      savings: '$14,200',
      savingsSub: 'Lowest-cost WH + alternate routing',
      otif: '92.4%',
      leadTimeSub: 'On-time delivery · Target ≥ 90%',
      coverage: '22 / 24',
      coverageSub: '2 greens auto-replenish ready · 0 stockouts',
    },
    topGreens: [
      { id: 'Gc-04', name: 'Colombia Supremo',    volumeKg: 24800, spend: 98200,  avgKg: 3.96, baselineKg: 4.45, source: 'Warehouse 1055', status: 'below' },
      { id: 'Gc-11', name: 'Brazil Cerrado',      volumeKg: 23400, spend: 84600,  avgKg: 3.62, baselineKg: 4.10, source: 'Local + WH 1055', status: 'healthy' },
      { id: 'Gc-14', name: 'Guatemala Antigua',   volumeKg: 17900, spend: 74100,  avgKg: 4.14, baselineKg: 4.58, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-22', name: 'Huila Washed',        volumeKg: 13800, spend: 61200,  avgKg: 4.43, baselineKg: 4.82, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gd-09', name: 'Ethiopia Yirgacheffe',volumeKg: 10900, spend: 53400,  avgKg: 4.90, baselineKg: 5.35, source: 'Warehouse 1021', status: 'below' },
      { id: 'Ga-17', name: 'Kenya AA Nyeri',      volumeKg: 7800,  spend: 40900,  avgKg: 5.24, baselineKg: 5.65, source: 'Warehouse 1020', status: 'healthy' },
    ],
    warehouses: [
      { name: 'Warehouse 1055 (Central)', share: 72, orders: 39, fixedFreight: '$589', otif: '96%', savings: '$9,450' },
      { name: 'Warehouse 1020 (Pacific NW)', share: 18, orders: 10, fixedFreight: '$1,000', otif: '91%', savings: '$3,120' },
      { name: 'Warehouse 1021 (Northeast)', share: 10, orders: 5, fixedFreight: '$1,000', otif: '88%', savings: '$1,630' },
    ],
    sourcingMix: {
      exactMatchPct: 69,
      exactOrders: 37,
      alternatePct: 31,
      alternateOrders: 17,
      alternateFreightSaved: '$6,840',
      stockoutsAvoided: 2,
    },
    replenishment: {
      autoOrdersPlaced: 14,
      replenishedKg: '18,400 kg',
      expediteAvoided: '$5,230',
      complianceRate: '98.1%',
    },
  },
  'sep-2026': {
    label: 'Sep 2026',
    kpis: {
      totalSpend: '$445,100',
      avgPerKg: '$4.24 / kg',
      baselineDelta: '-$0.44 vs $4.68 spot baseline',
      savings: '$12,950',
      savingsSub: 'Lowest-cost WH + alternate routing',
      otif: '90.8%',
      leadTimeSub: 'On-time delivery · Target ≥ 90%',
      coverage: '21 / 24',
      coverageSub: '3 reorders triggered · 1 stockout prevented',
    },
    topGreens: [
      { id: 'Gc-04', name: 'Colombia Supremo',    volumeKg: 26200, spend: 105800, avgKg: 4.04, baselineKg: 4.45, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-11', name: 'Brazil Cerrado',      volumeKg: 24900, spend: 91200,  avgKg: 3.66, baselineKg: 4.10, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-14', name: 'Guatemala Antigua',   volumeKg: 18500, spend: 77400,  avgKg: 4.18, baselineKg: 4.58, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-22', name: 'Huila Washed',        volumeKg: 14600, spend: 65900,  avgKg: 4.51, baselineKg: 4.82, source: 'Warehouse 1055', status: 'below' },
      { id: 'Gd-09', name: 'Ethiopia Yirgacheffe',volumeKg: 11800, spend: 58300,  avgKg: 4.94, baselineKg: 5.35, source: 'Warehouse 1021', status: 'healthy' },
      { id: 'Ga-17', name: 'Kenya AA Nyeri',      volumeKg: 8800,  spend: 46500,  avgKg: 5.28, baselineKg: 5.65, source: 'Warehouse 1020', status: 'healthy' },
    ],
    warehouses: [
      { name: 'Warehouse 1055 (Central)', share: 70, orders: 42, fixedFreight: '$589', otif: '95%', savings: '$8,810' },
      { name: 'Warehouse 1020 (Pacific NW)', share: 19, orders: 11, fixedFreight: '$1,000', otif: '89%', savings: '$2,790' },
      { name: 'Warehouse 1021 (Northeast)', share: 11, orders: 7, fixedFreight: '$1,000', otif: '84%', savings: '$1,350' },
    ],
    sourcingMix: {
      exactMatchPct: 72,
      exactOrders: 43,
      alternatePct: 28,
      alternateOrders: 17,
      alternateFreightSaved: '$5,910',
      stockoutsAvoided: 1,
    },
    replenishment: {
      autoOrdersPlaced: 12,
      replenishedKg: '16,900 kg',
      expediteAvoided: '$4,800',
      complianceRate: '96.7%',
    },
  },
  'q3-2026': {
    label: 'Q3 2026',
    kpis: {
      totalSpend: '$1,260,300',
      avgPerKg: '$4.26 / kg',
      baselineDelta: '-$0.42 vs $4.68 spot baseline',
      savings: '$38,400',
      savingsSub: 'Lowest-cost WH + alternate routing',
      otif: '91.2%',
      leadTimeSub: 'On-time delivery · Target ≥ 90%',
      coverage: '93.5%',
      coverageSub: 'Quarterly safety buffer adherence · 4 prevented',
    },
    topGreens: [
      { id: 'Gc-04', name: 'Colombia Supremo',    volumeKg: 76400, spend: 306100, avgKg: 4.01, baselineKg: 4.45, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-11', name: 'Brazil Cerrado',      volumeKg: 71800, spend: 263900, avgKg: 3.68, baselineKg: 4.10, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-14', name: 'Guatemala Antigua',   volumeKg: 54200, spend: 226800, avgKg: 4.18, baselineKg: 4.58, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-22', name: 'Huila Washed',        volumeKg: 41900, spend: 187500, avgKg: 4.47, baselineKg: 4.82, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gd-09', name: 'Ethiopia Yirgacheffe',volumeKg: 32500, spend: 161200, avgKg: 4.96, baselineKg: 5.35, source: 'Warehouse 1021', status: 'healthy' },
      { id: 'Ga-17', name: 'Kenya AA Nyeri',      volumeKg: 21700, spend: 114800, avgKg: 5.29, baselineKg: 5.65, source: 'Warehouse 1020', status: 'healthy' },
    ],
    warehouses: [
      { name: 'Warehouse 1055 (Central)', share: 71, orders: 123, fixedFreight: '$589', otif: '95%', savings: '$26,900' },
      { name: 'Warehouse 1020 (Pacific NW)', share: 19, orders: 33, fixedFreight: '$1,000', otif: '90%', savings: '$7,800' },
      { name: 'Warehouse 1021 (Northeast)', share: 10, orders: 17, fixedFreight: '$1,000', otif: '85%', savings: '$3,700' },
    ],
    sourcingMix: {
      exactMatchPct: 71,
      exactOrders: 123,
      alternatePct: 29,
      alternateOrders: 50,
      alternateFreightSaved: '$17,800',
      stockoutsAvoided: 4,
    },
    replenishment: {
      autoOrdersPlaced: 39,
      replenishedKg: '52,600 kg',
      expediteAvoided: '$14,100',
      complianceRate: '97.4%',
    },
  },
  'ytd-2026': {
    label: 'YTD 2026',
    kpis: {
      totalSpend: '$4,085,700',
      avgPerKg: '$4.22 / kg',
      baselineDelta: '-$0.46 vs $4.68 spot baseline',
      savings: '$129,600',
      savingsSub: 'Cumulative routing & freight optimization',
      otif: '91.8%',
      leadTimeSub: 'On-time delivery · Target ≥ 90%',
      coverage: '94.2%',
      coverageSub: 'YTD threshold compliance · 11 stockouts avoided',
    },
    topGreens: [
      { id: 'Gc-04', name: 'Colombia Supremo',    volumeKg: 249000, spend: 993500, avgKg: 3.99, baselineKg: 4.45, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-11', name: 'Brazil Cerrado',      volumeKg: 231400, spend: 842300, avgKg: 3.64, baselineKg: 4.10, source: 'Local + WH 1055', status: 'healthy' },
      { id: 'Gc-14', name: 'Guatemala Antigua',   volumeKg: 176200, spend: 731200, avgKg: 4.15, baselineKg: 4.58, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gc-22', name: 'Huila Washed',        volumeKg: 138500, spend: 616300, avgKg: 4.45, baselineKg: 4.82, source: 'Warehouse 1055', status: 'healthy' },
      { id: 'Gd-09', name: 'Ethiopia Yirgacheffe',volumeKg: 106800, spend: 525400, avgKg: 4.92, baselineKg: 5.35, source: 'Warehouse 1021', status: 'healthy' },
      { id: 'Ga-17', name: 'Kenya AA Nyeri',      volumeKg: 71600,  spend: 377000, avgKg: 5.27, baselineKg: 5.65, source: 'Warehouse 1020', status: 'healthy' },
    ],
    warehouses: [
      { name: 'Warehouse 1055 (Central)', share: 72, orders: 396, fixedFreight: '$589', otif: '96%', savings: '$92,400' },
      { name: 'Warehouse 1020 (Pacific NW)', share: 18, orders: 99, fixedFreight: '$1,000', otif: '91%', savings: '$24,200' },
      { name: 'Warehouse 1021 (Northeast)', share: 10, orders: 55, fixedFreight: '$1,000', otif: '86%', savings: '$13,000' },
    ],
    sourcingMix: {
      exactMatchPct: 70,
      exactOrders: 385,
      alternatePct: 30,
      alternateOrders: 165,
      alternateFreightSaved: '$61,200',
      stockoutsAvoided: 11,
    },
    replenishment: {
      autoOrdersPlaced: 128,
      replenishedKg: '174,800 kg',
      expediteAvoided: '$48,900',
      complianceRate: '97.8%',
    },
  },
};

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('oct-2026');

  const data = ANALYTICS_BY_PERIOD[period] || ANALYTICS_BY_PERIOD['oct-2026'];

  const handleExport = () => {
    const headers = ['Green ID', 'Commodity', 'Volume (kg)', 'Landed Spend ($)', 'Avg $/kg', 'Baseline $/kg', 'Savings ($)', 'Primary Source'];
    const rows = data.topGreens.map(g => {
      const savings = Math.round((g.baselineKg - g.avgKg) * g.volumeKg);
      return [g.id, `"${g.name}"`, g.volumeKg, g.spend, g.avgKg.toFixed(2), g.baselineKg.toFixed(2), savings, `"${g.source}"`];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kdp-analytics-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpiCards = [
    {
      label: 'Total Landed Spend',
      value: data.kpis.totalSpend,
      sub: `${data.kpis.avgPerKg} avg · ${data.kpis.baselineDelta}`,
      icon: DollarSign,
      bg: '#FFFFFF',
      border: C.border,
      accent: C.plum,
      iconBg: '#F4EEF2',
      infoTitle: 'Total Landed Procurement Spend',
      infoDesc: 'Total delivered cost for all green coffee beans purchased during the selected period, including bean price and fixed freight charges from Central Warehouse 1055.',
    },
    {
      label: 'Sourcing Savings Captured',
      value: data.kpis.savings,
      sub: data.kpis.savingsSub,
      icon: PiggyBank,
      bg: C.roseSoft,
      border: C.roseBorder,
      accent: C.rose,
      iconBg: '#FFFFFF',
      infoTitle: 'Cost Savings vs Baseline',
      infoDesc: 'Cumulative savings realized through the lowest-freight warehouse optimization rule ($589 fixed fee from Hub 1055) and approved alternate green bean substitutions.',
    },
    {
      label: 'On-Time Fulfillment (OTIF)',
      value: data.kpis.otif,
      sub: data.kpis.leadTimeSub,
      icon: Clock,
      bg: C.successBg,
      border: C.successBorder,
      accent: C.success,
      iconBg: '#FFFFFF',
      infoTitle: 'On-Time In-Full Delivery Performance',
      infoDesc: 'Percentage of purchase orders arriving on or before the requested Need-By date with 100% of quantity fulfilled.',
      formula: '(On-Time Deliveries ÷ Total Deliveries) × 100',
    },
    {
      label: 'Threshold Safety Health',
      value: data.kpis.coverage,
      sub: data.kpis.coverageSub,
      icon: ShieldCheck,
      bg: '#FFFFFF',
      border: C.border,
      accent: C.text,
      iconBg: '#FAF8F9',
      infoTitle: 'Inventory Safety Compliance',
      infoDesc: 'Percentage of active roasting greens maintaining stock levels at or above the designated minimum safety threshold (buffer days) across Site 1054.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1360, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Site 1054 Plano Roasting · Procurement Performance
          </div>
          <h1 style={{ fontSize: 23, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
            Procurement Analytics
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>
            Landed cost efficiency, central warehouse performance, and replenishment compliance for {data.label}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemedSelect
            prefix="Period:"
            value={period}
            onChange={setPeriod}
            options={PERIOD_OPTIONS}
            size="sm"
            align="right"
          />
          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 32,
              padding: '0 12px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: '#FFFFFF',
              color: C.text,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={12} /> Export CSV
          </button>
          <button
            onClick={() => navigate('/inventory')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 32,
              padding: '0 14px',
              borderRadius: 8,
              border: 'none',
              background: C.rose,
              color: '#FFFFFF',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(216,63,121,0.25)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.roseHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.rose; }}
          >
            Manage Stock <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* ── Essential KPI Cards (4 High-Signal Metrics) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                boxShadow: '0 1px 2px rgba(48,39,43,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  {card.label}
                  <InfoTooltip
                    title={card.infoTitle}
                    content={card.infoDesc}
                    formula={card.formula}
                    align={idx === 0 ? 'left' : idx === 3 ? 'right' : 'center'}
                    position="top"
                    size={11}
                    color={C.subtle}
                  />
                </span>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: card.iconBg,
                  border: `1px solid ${card.border}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.accent,
                }}>
                  <Icon size={14} />
                </span>
              </div>
              <div style={{ fontSize: 25, fontWeight: 800, color: card.accent, lineHeight: 1.05, letterSpacing: '-0.4px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.35 }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Operational Tables (Spend by Green + Central Hub Comparison) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 14, alignItems: 'start' }}>

        {/* Top Greens Spend & Cost Benchmark Table */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${C.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                Top Greens by Landed Spend
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Actual landed unit cost benchmarked against spot-PO baseline ({data.label})
              </div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: 'none',
                border: 'none',
                color: C.rose,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Open Orders <ArrowRight size={11} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: '#FAF8F9', borderBottom: `1px solid ${C.divider}` }}>
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Green</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Volume</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Landed Spend</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Avg $/kg</th>
                  <th style={{ padding: '9px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Primary Hub</th>
                  <th style={{ padding: '9px 14px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Saved vs Spot</th>
                </tr>
              </thead>
              <tbody>
                {data.topGreens.map(item => {
                  const savedDollars = Math.round((item.baselineKg - item.avgKg) * item.volumeKg);
                  const pctBelow = (((item.baselineKg - item.avgKg) / item.baselineKg) * 100).toFixed(1);
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: `1px solid ${C.divider}`, transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: C.plum }}>{item.id}</span>
                          <span style={{ color: C.text, fontWeight: 500 }}>{item.name}</span>
                          {item.status === 'below' && (
                            <span style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 12,
                              background: C.critBg,
                              color: C.crit,
                              border: `1px solid ${C.critBorder}`,
                            }}>
                              Below min
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: C.text, fontVariantNumeric: 'tabular-nums' }}>
                        {item.volumeKg.toLocaleString()} kg
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums' }}>
                        ${item.spend.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>
                        ${item.avgKg.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 10px', color: C.muted, fontSize: 11.5 }}>
                        {item.source}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: 14,
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: C.successBg,
                          color: C.success,
                          border: `1px solid ${C.successBorder}`,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          -${savedDollars.toLocaleString()} ({pctBelow}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Central Warehouse Routing Performance */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Warehouse size={15} color={C.plum} />
                Central Warehouse Performance
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Freight efficiency, assigned lowest-cost routing, and OTIF by hub
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.warehouses.map((wh, idx) => (
              <div
                key={wh.name}
                style={{
                  padding: '11px 12px',
                  borderRadius: 8,
                  border: `1px solid ${idx === 0 ? C.roseBorder : C.divider}`,
                  background: idx === 0 ? C.roseSoft : '#FAF8F9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{wh.name}</span>
                    {idx === 0 && (
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 12,
                        background: '#FFFFFF',
                        color: C.rose,
                        border: `1px solid ${C.roseBorder}`,
                      }}>
                        Lowest Freight
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.plum }}>
                    {wh.share}% of transfers ({wh.orders})
                  </span>
                </div>

                {/* Clean progress bar without chart library */}
                <div style={{ height: 6, borderRadius: 99, background: '#E9DFE5', overflow: 'hidden' }}>
                  <div style={{
                    width: `${wh.share}%`,
                    height: '100%',
                    borderRadius: 99,
                    background: idx === 0 ? C.rose : C.plum,
                  }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 11 }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.subtle, textTransform: 'uppercase' }}>Fixed Freight</div>
                    <div style={{ fontWeight: 700, color: C.text }}>{wh.fixedFreight}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.subtle, textTransform: 'uppercase' }}>Routing</div>
                    <div style={{ fontWeight: 700, color: C.text }}>{idx === 0 ? 'Assigned Hub' : 'Alternate Hub'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.subtle, textTransform: 'uppercase' }}>OTIF</div>
                    <div style={{ fontWeight: 700, color: C.success }}>{wh.otif}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9.5, color: C.subtle, textTransform: 'uppercase' }}>Saved</div>
                    <div style={{ fontWeight: 700, color: C.success }}>{wh.savings}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom Decision Summary Cards (Sourcing Mix & Auto-Replenishment Impact) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Sourcing Mix Card */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: '14px 16px',
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Repeat size={14} color={C.rose} />
                Exact Green vs. Approved Alternate Mix
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Share of fulfilled orders using approved one-way green substitutions
              </div>
            </div>
            <span style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 14,
              background: C.successBg,
              color: C.success,
              border: `1px solid ${C.successBorder}`,
            }}>
              {data.sourcingMix.stockoutsAvoided} Stockouts Avoided
            </span>
          </div>

          {/* Stacked comparison bar */}
          <div>
            <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', background: C.divider }}>
              <div style={{ width: `${data.sourcingMix.exactMatchPct}%`, background: C.plum }} />
              <div style={{ width: `${data.sourcingMix.alternatePct}%`, background: C.rose }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.plum }} />
                <span style={{ color: C.text, fontWeight: 600 }}>Exact Green Match:</span>
                <span style={{ color: C.muted }}>{data.sourcingMix.exactMatchPct}% ({data.sourcingMix.exactOrders} orders)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.rose }} />
                <span style={{ color: C.text, fontWeight: 600 }}>Approved Alternate:</span>
                <span style={{ color: C.muted }}>{data.sourcingMix.alternatePct}% ({data.sourcingMix.alternateOrders} orders)</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '9px 12px',
            borderRadius: 8,
            background: '#FAF8F9',
            border: `1px solid ${C.divider}`,
            fontSize: 11.5,
            color: C.muted,
          }}>
            Approved alternates saved <strong style={{ color: C.text }}>{data.sourcingMix.alternateFreightSaved}</strong> in rush freight while preserving roast quality specs.
          </div>
        </div>

        {/* Auto-Replenishment Impact Card */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: '14px 16px',
          boxShadow: '0 1px 3px rgba(48,39,43,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                <PackageCheck size={14} color={C.plum} />
                Auto-Replenishment & Cost Avoidance
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                Automated threshold restocks routed to lowest landed-cost warehouse
              </div>
            </div>
            <button
              onClick={() => navigate('/inventory?tab=incoming')}
              style={{
                background: 'none',
                border: 'none',
                color: C.rose,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View Shipments <ArrowRight size={11} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Auto Orders', value: data.replenishment.autoOrdersPlaced, sub: 'Lowest-cost WH' },
              { label: 'Volume Restocked', value: data.replenishment.replenishedKg, sub: 'Threshold + demand' },
              { label: 'Expedite Avoided', value: data.replenishment.expediteAvoided, sub: 'Rush fees saved', accent: C.success },
              { label: 'Rule Compliance', value: data.replenishment.complianceRate, sub: 'Single-source rule', accent: C.plum },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  padding: '10px 10px',
                  borderRadius: 8,
                  background: '#FAF8F9',
                  border: `1px solid ${C.divider}`,
                }}
              >
                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: stat.accent || C.text, marginTop: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
