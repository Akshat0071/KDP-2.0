import { Check, Clock, AlertCircle } from 'lucide-react';
import { ORDER_LIFECYCLE, getOrderStatusMeta } from '../../context/OrdersContext';

export default function OrderLifecycleStepper({ status, compact = false }) {
  const isRejected = (status || '').toLowerCase() === 'rejected';
  const meta = getOrderStatusMeta(status);
  const currentStep = meta.step;

  if (isRejected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: compact ? '6px 10px' : '10px 14px',
        background: '#FEF0F2',
        border: '1px solid #F5B8C0',
        borderRadius: 8,
        color: '#D83040',
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
      }}>
        <AlertCircle size={compact ? 14 : 16} />
        <span>Order Lifecycle Terminated: Rejected by Central Warehouse Manager</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {/* Step Tracker Horizontal Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        width: '100%',
        padding: '4px 0',
      }}>
        {ORDER_LIFECYCLE.map((stepKey, idx) => {
          const stepMeta = getOrderStatusMeta(stepKey);
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          let circleBg = '#FFFFFF';
          let circleBorder = '#E6DCE2';
          let circleColor = '#9CA3AF';

          if (isDone) {
            circleBg = '#1E8A3C';
            circleBorder = '#1E8A3C';
            circleColor = '#FFFFFF';
          } else if (isCurrent) {
            circleBg = stepMeta.dotBg || '#D83F79';
            circleBorder = stepMeta.dotBg || '#D83F79';
            circleColor = '#FFFFFF';
          }

          return (
            <div
              key={stepKey}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Connector line behind */}
              {idx > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: compact ? 10 : 12,
                    right: '50%',
                    left: '-50%',
                    height: 2,
                    background: currentStep >= idx ? '#1E8A3C' : '#E6DCE2',
                    zIndex: -1,
                    transition: 'background 0.2s ease',
                  }}
                />
              )}

              {/* Step Circle */}
              <div
                style={{
                  width: compact ? 20 : 24,
                  height: compact ? 20 : 24,
                  borderRadius: '50%',
                  background: circleBg,
                  border: `2px solid ${circleBorder}`,
                  color: circleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: compact ? 10 : 11,
                  fontWeight: 700,
                  boxShadow: isCurrent ? `0 0 0 3px ${stepMeta.bg}` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDone ? (
                  <Check size={compact ? 11 : 13} strokeWidth={3} />
                ) : isCurrent ? (
                  <Clock size={compact ? 11 : 12} strokeWidth={2.5} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div
                style={{
                  fontSize: compact ? 9 : 10,
                  fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                  color: isCurrent ? '#30272B' : isDone ? '#1E8A3C' : '#9CA3AF',
                  textAlign: 'center',
                  marginTop: 4,
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  letterSpacing: isCurrent ? '-0.1px' : '0',
                }}
              >
                {stepKey}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Actor Badge & Description Banner */}
      {!compact && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          borderRadius: 6,
          marginTop: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: meta.dotBg,
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>
              Stage {currentStep + 1} of 9: {meta.label}
            </span>
            <span style={{ fontSize: 10, color: '#746970' }}>· {meta.desc}</span>
          </div>

          <span style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 12,
            background: '#FFFFFF',
            border: `1px solid ${meta.border}`,
            color: meta.color,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}>
            Actor: {meta.actor}
          </span>
        </div>
      )}
    </div>
  );
}
