import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import OrderLifecycleStepper from '../../components/ui/OrderLifecycleStepper';

const C = {
  text:      '#30272B',
  muted:     '#746970',
  subtle:    '#9CA3AF',
  border:    '#E6DCE2',
  divider:   '#F0EAEE',
  hover:     '#FDFBFC',
  rose:      '#D83F79',
  roseHover: '#C4366B',
  success:   '#27A348',
  warn:      '#E07000',
  crit:      '#D83040',
};

export default function ConfirmOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { option, order } = location.state || {};
  const [ackAlt, setAckAlt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { buyerRequestTransfer, buyerApprove } = useOrders();

  // Fallback defaults if accessed directly
  const safeOrder = order || {
    id: 'PO-2843',
    greenId: 'Gc-04',
    greenName: 'Colombia Supremo Washed',
    quantity: '1,200 kg',
    quantityStr: '1,200 kg',
    needBy: 'Nov 10',
    warehouse: 'Warehouse 1055',
  };

  const safeOption = option || {
    greenName: 'Gc-04 · Colombia Supremo Washed',
    source: 'CENTRAL WAREHOUSE · WAREHOUSE 1055',
    arrivalDate: 'ETA Nov 10 · On schedule',
    totalDelivered: 5269,
    perKg: '4.39',
    isAlternate: false,
    costBreakdown: [
      { label: 'Green / bean cost', val: '$4,680' },
      { label: 'Shipping cost (fixed)', val: '$589' },
    ],
  };

  const canConfirm = !safeOption.isAlternate || ackAlt;

  const isWarehouseTransfer =
    !safeOption.isLocalFulfilled &&
    !safeOption.source?.includes('LOCAL') &&
    (Boolean(safeOption.source?.includes('WAREHOUSE')) || (!safeOrder.isLocalFulfilled && Boolean(safeOrder.warehouse)));

  const handleConfirmAction = () => {
    if (isWarehouseTransfer) {
      buyerRequestTransfer(safeOrder.id, safeOption);
    } else {
      buyerApprove(safeOrder.id, safeOption);
    }
    setConfirmed(true);
  };

  const resultingStatus = isWarehouseTransfer
    ? 'requested'
    : 'approved';

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
            {resultingStatus === 'requested' ? 'Transfer Request Submitted to Hub' : 'Order Sourcing Approved'}
          </h2>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>
            <strong>{safeOrder.id}</strong> has been updated.
            {resultingStatus === 'requested'
              ? ' Transfer PO is now on Central Warehouse Manager desk for allocation from Warehouse 1055.'
              : ' Local sourcing batch committed to roasting operations.'}
          </p>

          {/* Stepper display */}
          <div style={{
            background: '#FAF8F9',
            border: `1px solid ${C.divider}`,
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 20,
          }}>
            <OrderLifecycleStepper
              status={resultingStatus}
              isLocalFulfilled={!isWarehouseTransfer}
            />
          </div>

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
              <span style={{ fontWeight: 700, color: C.text }}>{safeOrder.quantityStr || safeOrder.quantity}</span>
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
              onClick={() => navigate(isWarehouseTransfer ? '/central-orders' : '/inventory')}
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
              {isWarehouseTransfer ? 'View in Central Warehouse' : 'View Local Inventory'}
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
            background: 'none',
            border: 'none',
            color: C.rose,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 6,
          }}
        >
          <ArrowLeft size={13} /> Back to Sourcing Options
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
          Confirm Fulfillment Decision · {safeOrder.id}
        </h1>
        <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>
          Review landed cost breakdown and submit the order across the 9-stage lifecycle.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>
        {/* Left Main Form Card */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 1px 2px rgba(59,45,52,0.04)',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              CHOSEN SOURCING ROUTE
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              {safeOption.greenName}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              Source: <strong style={{ color: C.text }}>{safeOption.source}</strong> · {safeOption.arrivalDate}
            </div>
          </div>

          {/* Alternate Sourcing Warning if applicable */}
          {safeOption.isAlternate && (
            <div style={{
              background: '#FFF7E6',
              border: '1px solid #F5D68A',
              borderRadius: 6,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={18} style={{ color: C.warn, flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.warn }}>
                  Alternate Green Material Substitution Notice
                </div>
                <div style={{ fontSize: 11, color: '#746970', marginTop: 2, lineHeight: 1.4 }}>
                  You are allocating an approved flavor-equivalent substitute (<strong>{safeOption.greenName}</strong>) in place of the base demand green.
                </div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.text,
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={ackAlt}
                    onChange={e => setAckAlt(e.target.checked)}
                    style={{ accentColor: C.rose, cursor: 'pointer' }}
                  />
                  I confirm this substitution satisfies the roasting flavor profile.
                </label>
              </div>
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
              onClick={handleConfirmAction}
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
