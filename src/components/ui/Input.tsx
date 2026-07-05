import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--text-2)' }}>
            {label}
            {props.required && <span className="ml-0.5" style={{ color: '#dc2626' }}>*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-3 py-2.5 text-[13px] rounded-xl transition-all duration-150 outline-none',
              leftIcon && 'pl-9',
              className
            )}
            style={{
              background: '#ffffff',
              border: error ? '1px solid rgba(220,38,38,0.50)' : '1px solid rgba(13,115,119,0.20)',
              color: 'var(--text-1)',
              boxShadow: 'inset 0 1px 2px rgba(13,115,119,0.04)',
              ...style,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = error ? 'rgba(220,38,38,0.70)' : 'rgba(20,168,181,0.60)';
              e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(220,38,38,0.08)' : '0 0 0 3px rgba(20,168,181,0.12)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? 'rgba(220,38,38,0.50)' : 'rgba(13,115,119,0.20)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(13,115,119,0.04)';
            }}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] mt-1.5 font-medium" style={{ color: '#dc2626' }}>{error}</p>}
        {hint && !error && <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-3)' }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
