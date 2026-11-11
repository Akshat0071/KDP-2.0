import { Check, Clock, AlertCircle } from 'lucide-react';
import { ORDER_LIFECYCLE, getOrderStatusMeta } from '../../context/OrdersContext';

const LOCAL_LIFECYCLE = ['new', 'approved', 'received', 'closed'];

export default function OrderLifecycleStepper({
  status,
  compact = false,
  orientation = 'horizontal',
  timeline = null,
  title = null,
  isLocalFulfilled = false,
}) {
  const isRejected = (status || '').toLowerCase() === 'rejected';
  const meta = getOrderStatusMeta(status);
  const normStatus = (status || '').toLowerCase().trim();
  const activeLifecycle = isLocalFulfilled ? LOCAL_LIFECYCLE : ORDER_LIFECYCLE;
  const currentStep = isLocalFulfilled
    ? Math.max(0, activeLifecycle.indexOf(normStatus))
    : meta.step;

  // ── VERTICAL ORIENTATION (Drawer & Side Panels) ──
  if (orientation === 'vertical') {
    let steps = timeline;
    if (!steps || steps.length === 0) {
      steps = activeLifecycle.map((stepKey, idx) => {
        const stepMeta = getOrderStatusMeta(stepKey);
        let state = 'pending';
        if (isRejected) {
          state = 'crit';
        } else if (currentStep > idx) {
          state = 'done';
        } else if (currentStep === idx) {
          state = 'active';
        }
        return {
          title: stepMeta.label,
          time: state === 'done' ? 'Completed' : state === 'active' ? 'Active Stage' : 'Pending',
          actor: stepMeta.actor,
          state,
        };
      });
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {title && (
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#30272B',
            marginBottom: 10,
          }}>
            {title}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, sIdx) => {
            const isLast = sIdx === steps.length - 1;
            const isDone = step.state === 'done';
            const isActive = step.state === 'active';
            const isCrit = step.state === 'active-crit' || step.state === 'crit';

            return (
              <div key={sIdx} style={{ display: 'flex', gap: 10, position: 'relative' }}>
                {/* Left Column: Marker + Connector Line */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 18,
                  flexShrink: 0,
                }}>
                  {isDone ? (
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#5C3A57',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <Check size={10} strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '2px solid #D83F79',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#D83F79',
                      }} />
                    </div>
                  ) : isCrit ? (
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '2px solid #D83040',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#D83040',
                      }} />
                    </div>
                  ) : (
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1.5px solid #E6DCE2',
                      zIndex: 1,
                    }} />
                  )}

                  {!isLast && (
                    <div style={{
                      width: 1.5,
                      flex: 1,
                      minHeight: 18,
                      background: isDone ? '#BFAAB6' : '#E6DCE2',
                      margin: '2px 0',
                    }} />
                  )}
                </div>

                {/* Right Column: Title + Subtitle */}
                <div style={{ paddingBottom: isLast ? 0 : 12, flex: 1 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isCrit ? '#D83040' : (step.state === 'pending' ? '#9CA3AF' : '#30272B'),
                    lineHeight: 1.3,
                  }}>
                    {step.title}
                  </div>
                  <div style={{
                    fontSize: 9.5,
                    color: step.state === 'pending' ? '#9CA3AF' : '#746970',
                    marginTop: 1,
                  }}>
                    {step.time} {step.actor ? `· ${step.actor}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── HORIZONTAL ORIENTATION (Wide Page Cards) ──
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
        {activeLifecycle.map((stepKey, idx) => {
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
                Stage {currentStep + 1} of {activeLifecycle.length}: {meta.label}
              </span>
              <span style={{ fontSize: 10, color: '#746970' }}>
                · {isLocalFulfilled ? 'Fulfilled via local inventory (hub transfer & transit stages bypassed)' : meta.desc}
              </span>
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
