'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, size = 'md', disabled }: ToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-4',        thumb: 'w-3 h-3',   translate: 'translate-x-4' },
    md: { track: 'w-10 h-[22px]',  thumb: 'w-4 h-4',   translate: 'translate-x-5' },
  };
  const s = sizes[size];

  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn('relative inline-flex items-center rounded-full transition-all duration-200 focus:outline-none flex-shrink-0', s.track)}
        style={checked
          ? { background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', boxShadow: '0 0 0 3px rgba(20,168,181,0.18)' }
          : { background: 'rgba(13,115,119,0.14)', border: '1px solid rgba(13,115,119,0.20)' }
        }
      >
        <span className={cn(
          'inline-block bg-white rounded-full shadow transition-all duration-200',
          s.thumb,
          'translate-x-0.5',
          checked && s.translate
        )} />
      </button>
      {(label || description) && (
        <div>
          {label && <span className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{label}</span>}
          {description && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>}
        </div>
      )}
    </label>
  );
}
