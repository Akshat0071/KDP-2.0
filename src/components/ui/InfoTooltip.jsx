import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({
  title,
  content,
  formula,
  stages,
  align = 'center', // 'left' | 'center' | 'right'
  position = 'top', // 'top' | 'bottom'
  size = 12,
  color = null,
  maxWidth = 260,
}) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setVisible(false);
    };
    if (visible) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible]);

  // Horizontal alignment styles
  let alignStyle = {};
  let arrowAlignStyle = {};

  if (align === 'left') {
    alignStyle = { left: -6 };
    arrowAlignStyle = { left: 10 };
  } else if (align === 'right') {
    alignStyle = { right: -6 };
    arrowAlignStyle = { right: 10 };
  } else {
    // center
    alignStyle = { left: '50%', transform: 'translateX(-50%)' };
    arrowAlignStyle = { left: '50%', transform: 'translateX(-50%)' };
  }

  const isTop = position === 'top';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* ── Trigger Info Icon ── */}
      <button
        type="button"
        aria-label={title ? `Info: ${title}` : 'Information'}
        onClick={(e) => {
          e.stopPropagation();
          setVisible(v => !v);
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: 2,
          margin: 0,
          cursor: 'help',
          color: color || (visible ? '#D83F79' : '#9CA3AF'),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'color 0.15s ease, transform 0.15s ease',
          transform: visible ? 'scale(1.1)' : 'scale(1)',
          lineHeight: 1,
        }}
      >
        <Info size={size} strokeWidth={2.2} />
      </button>

      {/* ── Popover Tooltip ── */}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...(isTop ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
            ...alignStyle,
            width: 'max-content',
            maxWidth,
            background: '#241820',
            border: '1px solid #45333F',
            borderRadius: 7,
            padding: '9px 12px',
            color: '#FFFFFF',
            boxShadow: '0 8px 22px rgba(25, 14, 21, 0.35), 0 2px 6px rgba(0,0,0,0.18)',
            zIndex: 1000,
            pointerEvents: 'none',
            textAlign: 'left',
            animation: 'fadeIn 0.15s ease both',
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              ...(isTop
                ? {
                    bottom: -5,
                    borderTop: '5px solid #241820',
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                  }
                : {
                    top: -5,
                    borderBottom: '5px solid #241820',
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                  }),
              ...arrowAlignStyle,
              width: 0,
              height: 0,
            }}
          />

          {/* Title */}
          {title && (
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.1px',
              marginBottom: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#D83F79',
                display: 'inline-block',
              }} />
              {title}
            </div>
          )}

          {/* Body content */}
          {content && (
            <div style={{
              fontSize: 10,
              lineHeight: 1.45,
              color: '#E6DCE2',
              fontWeight: 400,
              textTransform: 'none',
              letterSpacing: 'normal',
            }}>
              {content}
            </div>
          )}

          {/* Formula / Calculation */}
          {formula && (
            <div style={{
              marginTop: 6,
              padding: '3px 6px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: 9,
              fontFamily: 'monospace',
              color: '#FBCFE8',
              lineHeight: 1.3,
            }}>
              <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>Formula: </strong>
              {formula}
            </div>
          )}

          {/* Included Lifecycle Stages */}
          {stages && (
            <div style={{
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 9, color: '#BFAAB6', fontWeight: 600 }}>Stages:</span>
              {stages.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: '#3A2734',
                    color: '#F472B6',
                    border: '1px solid #5C3A57',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
