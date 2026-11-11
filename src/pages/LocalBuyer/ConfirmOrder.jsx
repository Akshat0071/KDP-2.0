import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check } from 'lucide-react';

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

export default function ConfirmOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { option, order } = location.state || {};
  const [ackAlt, setAckAlt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Fallback defaults if accessed directly
  const safeOrder = order || {
    id: 'PO-2842',
    greenId: 'Gc-11',
    greenName: 'Brazil Cerrado Natural',
    quantity: '800 kg',
    needBy: 'Nov 09',
  };

  const safeOption = option || {
    greenName: 'Gc-14 · Guatemala Antigua SHB',
    source: 'LOCAL ALTERNATE · Gc-14',
    arrivalDate: 'ETA Nov 08 · 1 day early',
    totalDelivered: 3280,
    perKg: '4.10',
    isAlternate: true,
    costBreakdown: [
      { label: 'Green / bean cost', val: '$3,280' },
      { label: 'Shipping / freight', val: '$0' },
    ],
  };

  const canConfirm = !safeOption.isAlternate || ackAlt;

  if (confirmed) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto', animation: 'fadeIn 0.25s ease both' }}>
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '32px 28px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(59,45,52,0.06)',
        }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: '#EDF7F1',
            color: '#1E8A3C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Check size={28} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
            Order Allocation Confirmed
          </h2>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 20px', lineHeight: 1.5 }}>
            <strong>{safeOrder.id}</strong> has been committed with green material <strong>{safeOption.greenName}</strong>.
            Fulfillment and QA batching tickets have been dispatched to Site 1054 roasting operations.
          </p>

          <div style={{
            background: '#FAF8F9',
            border: `1px solid ${C.divider}`,
            borderRadius: 8,
            padding: '14px 18px',
            textAlign: 'left',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: C.muted }}>Order ID</span>
              <span style={{ fontWeight: 700, color: C.text }}>{safeOrder.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: C.muted }}>Allocated Green Material</span>
              <span style={{ fontWeight: 700, color: C.text }}>{safeOption.greenName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: C.muted }}>Quantity</span>
              <span style={{ fontWeight: 700, color: C.text }}>{safeOrder.quantity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: C.muted }}>Expected Delivery</span>
              <span style={{ fontWeight: 700, color: '#1E8A3C' }}>{safeOption.arrivalDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: `1px solid ${C.divider}`, paddingTop: 8 }}>
              <span style={{ fontWeight: 600, color: C.text }}>Total Delivered Cost</span>
              <span style={{ fontWeight: 800, color: C.text, fontSize: 13 }}>${safeOption.totalDelivered?.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: '#FFFFFF',
                color: C.text,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Orders
            </button>
            <button
              onClick={() => navigate('/inventory?tab=incoming')}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                background: C.rose,
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Track Deliveries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Breadcrumb & Title */}
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: C.rose,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          <ArrowLeft size={11} /> Back to order queue
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>
          Review & Confirm Order
        </h1>
        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
          Confirm sourcing allocation and sign-off on alternate material substitution before production lock.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, alignItems: 'start' }}>
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Order Demand Details Card */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '16px',
            boxShadow: '0 1px 2px rgba(59,45,52,0.05)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              Order Demand Details
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ background: '#FAF8F9', padding: '10px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>Requested Green</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{safeOrder.greenId} · {safeOrder.greenName}</div>
              </div>

              <div style={{ background: '#FAF8F9', padding: '10px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>Order Quantity</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{safeOrder.quantity}</div>
              </div>

              <div style={{ background: '#FAF8F9', padding: '10px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>Selected Sourcing Material</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{safeOption.greenName}</div>
              </div>

              <div style={{ background: '#FAF8F9', padding: '10px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: C.subtle, textTransform: 'uppercase', marginBottom: 2 }}>Delivery Commitment</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1E8A3C' }}>{safeOption.arrivalDate}</div>
              </div>
            </div>
          </div>

          {/* Alternate Substitution Sign-Off */}
          {safeOption.isAlternate && (
            <div style={{
              background: '#FFFDF5',
              border: '1px solid #F5D68A',
              borderRadius: 8,
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AlertTriangle size={15} style={{ color: '#E07000' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#A06000' }}>
                  Approved Alternate Substitution Sign-off
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#746030', margin: '0 0 10px', lineHeight: 1.4 }}>
                This fulfillment uses approved alternate <strong>{safeOption.greenName}</strong> in place of requested {safeOrder.greenName}.
                Recipe compatibility has been confirmed in the green materials alternate mapping.
              </p>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 11,
                color: C.text,
                cursor: 'pointer',
                fontWeight: 600,
              }}>
                <input
                  type="checkbox"
                  checked={ackAlt}
                  onChange={e => setAckAlt(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <span>I acknowledge and approve this alternate green material for production batching.</span>
              </label>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              onClick={() => navigate('/orders')}
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
              disabled={!canConfirm}
              onClick={() => setConfirmed(true)}
              style={{
                padding: '8px 22px',
                borderRadius: 6,
                border: 'none',
                background: canConfirm ? C.rose : '#E6DCE2',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                boxShadow: canConfirm ? '0 2px 6px rgba(216,63,121,0.3)' : 'none',
              }}
            >
              Confirm Order — ${safeOption.totalDelivered?.toLocaleString()}
            </button>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '14px',
          boxShadow: '0 1px 2px rgba(59,45,52,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
            Cost Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingBottom: 8, borderBottom: `1px solid ${C.divider}` }}>
            {Array.isArray(safeOption.costBreakdown) ? (
              safeOption.costBreakdown.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: C.muted }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: C.text }}>{row.val}</span>
                </div>
              ))
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: C.muted }}>Bean cost</span>
                  <span style={{ fontWeight: 600, color: C.text }}>${(safeOption.totalDelivered - 200).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: C.muted }}>Handling & QA</span>
                  <span style={{ fontWeight: 600, color: C.text }}>$200</span>
                </div>
              </>
            )}
          </div>

          <div>
            <div style={{ fontSize: 9, color: C.subtle, textTransform: 'uppercase' }}>Total Delivered</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
              ${safeOption.totalDelivered?.toLocaleString()}
            </div>
            {safeOption.perKg && (
              <div style={{ fontSize: 10, color: C.muted }}>${safeOption.perKg} / kg</div>
            )}
          </div>

          <div style={{
            padding: '6px 8px',
            borderRadius: 4,
            background: '#EDF7F1',
            color: '#1E8A3C',
            fontSize: 10,
            fontWeight: 700,
            textAlign: 'center',
          }}>
            Optimal Cost Sourcing
          </div>
        </div>
      </div>
    </div>
  );
}
