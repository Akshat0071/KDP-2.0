import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const C = {
  text:      '#30272B',
  muted:     '#746970',
  subtle:    '#9CA3AF',
  border:    '#E6DCE2',
  borderFocus: '#D83F79',
  bg:        '#FFFFFF',
  hoverBg:   '#FAF2F6',
  activeBg:  '#F5E8EE',
  rose:      '#D83F79',
};

/**
 * Reusable Themed Select / Dropdown matching the KDP GreenSource brand identity.
 * 
 * @param {Array<{value: string|number, label: string, badge?: string, icon?: any}>} options
 * @param {string|number} value
 * @param {Function} onChange
 * @param {string} [placeholder]
 * @param {'sm'|'md'} [size='sm']
 * @param {string} [prefix] - e.g. "Sort: "
 * @param {'left'|'right'} [align='left']
 * @param {object} [style]
 * @param {object} [triggerStyle]
 * @param {object} [menuStyle]
 * @param {number} [minMenuWidth]
 */
export default function ThemedSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  size = 'sm',
  prefix = '',
  align = 'left',
  style = {},
  triggerStyle = {},
  menuStyle = {},
  minMenuWidth,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options array (supports simple strings or objects)
  const normalizedOptions = options.map(opt =>
    typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isSmall ? 6 : 8,
          padding: isSmall ? '4px 8px 4px 10px' : '6px 10px 6px 12px',
          height: isSmall ? 28 : 34,
          fontSize: isSmall ? 10.5 : 12,
          fontWeight: 500,
          color: selectedOption ? C.text : C.muted,
          background: isOpen ? C.hoverBg : C.bg,
          border: `1px solid ${isOpen ? C.borderFocus : C.border}`,
          borderRadius: 6,
          boxShadow: isOpen
            ? '0 0 0 3px rgba(216, 63, 121, 0.12)'
            : '0 1px 2px rgba(48, 39, 43, 0.04)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          ...triggerStyle,
        }}
        onMouseEnter={e => {
          if (!isOpen && !disabled) {
            e.currentTarget.style.borderColor = '#C9BAC3';
            e.currentTarget.style.background = '#FCFAFB';
          }
        }}
        onMouseLeave={e => {
          if (!isOpen && !disabled) {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = C.bg;
          }
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {selectedOption?.icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', color: C.rose }}>
              {selectedOption.icon}
            </span>
          )}
          {prefix && <span style={{ color: C.muted, fontWeight: 500 }}>{prefix}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>

        <ChevronDown
          size={isSmall ? 11 : 13}
          style={{
            color: isOpen ? C.rose : C.subtle,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease, color 0.15s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'right' ? 'right' : 'left']: 0,
            minWidth: minMenuWidth || (isSmall ? 130 : 160),
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(48, 39, 43, 0.12), 0 1px 3px rgba(48, 39, 43, 0.06)',
            padding: '4px',
            zIndex: 60,
            overflowY: 'auto',
            maxHeight: 260,
            animation: 'fadeInMenu 0.12s ease-out',
            ...menuStyle,
          }}
        >
          {normalizedOptions.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={String(opt.value)}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: isSmall ? '6px 8px' : '7px 10px',
                  borderRadius: 5,
                  fontSize: isSmall ? 11 : 12,
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? C.rose : C.text,
                  background: isSelected ? C.activeBg : 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = C.hoverBg;
                    e.currentTarget.style.color = C.rose;
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = C.text;
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {opt.icon && (
                    <span style={{ display: 'inline-flex', color: isSelected ? C.rose : C.muted }}>
                      {opt.icon}
                    </span>
                  )}
                  <div>
                    <div>{opt.label}</div>
                    {opt.sublabel && (
                      <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 400 }}>
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {opt.badge && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: '1px 5px',
                        borderRadius: 10,
                        background: '#F0EAEE',
                        color: C.muted,
                        fontWeight: 600,
                      }}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check size={12} style={{ color: C.rose, strokeWidth: 2.5 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

