import { Check, Clock, AlertCircle } from 'lucide-react';
import { ORDER_LIFECYCLE, getOrderStatusMeta } from '../../context/OrdersContext';

const LOCAL_LIFECYCLE = ['new', 'approved', 'received', 'closed'];

export default function OrderLifecycleStepper({
  status,
  currentStatus,
  compact = false,
  orientation = 'horizontal',
  timeline = null,
  title = null,
  isLocalFulfilled = false,
}) {
  const effectiveStatus = status || currentStatus || 'new';
  const isRejected = (effectiveStatus || '').toLowerCase() === 'rejected';
  const meta = getOrderStatusMeta(effectiveStatus);
  const normStatus = (effectiveStatus || '').toLowerCase().trim();
  const activeLifecycle = isLocalFulfilled ? LOCAL_LIFECYCLE : ORDER_LIFECYCLE;
  const isClosed = normStatus === 'closed';

  const currentStep = isLocalFulfilled
    ? Math.max(0, activeLifecycle.indexOf(normStatus))
    : (meta.step !== undefined ? meta.step : Math.max(0, ORDER_LIFECYCLE.indexOf(normStatus)));

  // ── VERTICAL ORIENTATION (Drawer & Side Panels & Modals) ──
  if (orientation === 'vertical') {
    const steps = activeLifecycle.map((stepKey, idx) => {
      const stepMeta = getOrderStatusMeta(stepKey);
      let state = 'pending';
      if (isRejected) {
        state = 'crit';
      } else if (isClosed || currentStep > idx) {
        state = 'done';
      } else if (currentStep === idx) {
        state = 'active';
      }

      // Check if timeline has recorded events for this step
      const matchedTimeline = Array.isArray(timeline)
        ? timeline.find(t =>
            (t.title || '').toLowerCase().includes(stepKey) ||
            (t.title || '').toLowerCase().includes(stepMeta.label.toLowerCase())
          )
        : null;

      return {
        stageNumber: idx + 1,
        totalStages: activeLifecycle.length,
        title: stepMeta.label,
        time: matchedTimeline?.time || (state === 'done' ? 'Completed' : state === 'active' ? 'Active Stage' : 'Pending Stage'),
        actor: matchedTimeline?.actor || stepMeta.actor,
        notes: matchedTimeline?.notes || stepMeta.desc,
        state,
      };
    });

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
                  width: 20,
                  flexShrink: 0,
                }}>
                  {isDone ? (
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      boxShadow: '0 1px 3px rgba(22,163,74,0.2)',
                    }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '2px solid #D83F79',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      boxShadow: '0 0 0 3px rgba(216,63,121,0.15)',
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
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#D83040',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <AlertCircle size={10} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF' }}>
                        {step.stageNumber}
                      </span>
                    </div>
                  )}

                  {/* Vertical Connector Line */}
                  {!isLast && (
                    <div style={{
                      width: 2,
                      flexGrow: 1,
                      minHeight: 28,
                      background: isDone ? '#16A34A' : '#E5E7EB',
                      margin: '2px 0',
                      transition: 'background 0.2s ease',
                    }} />
                  )}
                </div>

                {/* Right Column: Step Text */}
                <div style={{
                  paddingBottom: isLast ? 0 : 14,
                  paddingTop: 1,
                  flex: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: isDone ? '#16A34A' : isActive ? '#D83F79' : '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}>
                      Stage {step.stageNumber} of {step.totalStages}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isCrit ? '#D83040' : (step.state === 'pending' ? '#9CA3AF' : '#1F171B'),
                    }}>
                      {step.title}
                    </span>
                    {isDone && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '1px 5px', borderRadius: 4 }}>
                        Completed
                      </span>
                    )}
                    {isActive && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#D83F79', background: '#FCE7F3', padding: '1px 5px', borderRadius: 4 }}>
                        Current Stage
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: 10,
                    color: step.state === 'pending' ? '#9CA3AF' : '#71656B',
                    marginTop: 2,
                  }}>
                    {step.time} {step.actor ? `· Actor: ${step.actor}` : ''}
                  </div>
                  {step.notes && (
                    <div style={{ fontSize: 9.5, color: '#A0949B', marginTop: 1 }}>
                      {step.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── HORIZONTAL ORIENTATION (Wide Page Cards & Stepper Deck) ──
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
          const isDone = isClosed || currentStep > idx;
          const isCurrent = !isClosed && currentStep === idx;

          let circleBg = '#FFFFFF';
          let circleBorder = '#E5E7EB';
          let circleColor = '#9CA3AF';

          if (isDone) {
            circleBg = '#16A34A';
            circleBorder = '#16A34A';
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
                    background: (isClosed || currentStep >= idx) ? '#16A34A' : '#E5E7EB',
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
                  color: isCurrent ? '#1F171B' : isDone ? '#16A34A' : '#9CA3AF',
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
          background: isClosed ? '#F0FDF4' : meta.bg,
          border: `1px solid ${isClosed ? '#BBF7D0' : meta.border}`,
          borderRadius: 6,
          marginTop: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isClosed ? '#16A34A' : meta.dotBg,
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isClosed ? '#15803D' : meta.color }}>
              Stage {isClosed ? activeLifecycle.length : currentStep + 1} of {activeLifecycle.length}: {isClosed ? 'Order Closed & Reconciled' : meta.label}
            </span>
            <span style={{ fontSize: 10, color: '#71656B' }}>
              · {isClosed ? 'All lifecycle milestones verified and completed' : (isLocalFulfilled ? 'Fulfilled via local inventory (hub transfer & transit stages bypassed)' : meta.desc)}
            </span>
          </div>

          <span style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 12,
            background: '#FFFFFF',
            border: `1px solid ${isClosed ? '#BBF7D0' : meta.border}`,
            color: isClosed ? '#15803D' : meta.color,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}>
            Actor: {isClosed ? 'System Reconciled' : meta.actor}
          </span>
        </div>
      )}
    </div>
  );
}
