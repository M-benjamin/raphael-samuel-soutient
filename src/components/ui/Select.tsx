import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption { value: string; label: string; }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--text-2)' }}>
            {label}
            {props.required && <span className="ml-0.5" style={{ color: '#dc2626' }}>*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn('w-full px-3 py-2.5 text-[13px] rounded-xl appearance-none pr-9 cursor-pointer outline-none transition-all duration-150', className)}
            style={{
              background: '#ffffff',
              border: error ? '1px solid rgba(220,38,38,0.50)' : '1px solid rgba(13,115,119,0.20)',
              color: 'var(--text-1)',
              boxShadow: 'inset 0 1px 2px rgba(13,115,119,0.04)',
              ...style,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(20,168,181,0.60)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20,168,181,0.12)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? 'rgba(220,38,38,0.50)' : 'rgba(13,115,119,0.20)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(13,115,119,0.04)';
            }}
            {...props}
          >
            {placeholder && <option value="" disabled style={{ color: 'var(--text-3)' }}>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ color: 'var(--text-1)' }}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-3)' }} />
        </div>
        {error && <p className="text-[11px] mt-1.5 font-medium" style={{ color: '#dc2626' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
