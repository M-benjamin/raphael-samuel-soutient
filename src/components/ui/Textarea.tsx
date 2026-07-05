import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--text-2)' }}>
            {label}
            {props.required && <span className="ml-0.5" style={{ color: '#dc2626' }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn('w-full px-3 py-2.5 text-[13px] rounded-xl resize-none outline-none transition-all duration-150', className)}
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
        {error && <p className="text-[11px] mt-1.5 font-medium" style={{ color: '#dc2626' }}>{error}</p>}
        {hint && !error && <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-3)' }}>{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };
