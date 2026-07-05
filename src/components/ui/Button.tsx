'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'teal-ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, style, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-150 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 active:scale-[0.98] select-none';

    const sizes = {
      sm: 'px-3 py-1.5 text-[12px]',
      md: 'px-4 py-2 text-[13px]',
      lg: 'px-5 py-2.5 text-[13px]',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, #0d7377, #0a4a4d)',
        color: '#fff',
        boxShadow: '0 1px 3px rgba(13,115,119,0.40), inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      danger: {
        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
        color: '#fff',
        boxShadow: '0 1px 3px rgba(239,68,68,0.30)',
      },
      secondary: {
        background: '#ffffff',
        border: '1px solid rgba(13,115,119,0.20)',
        color: 'var(--text-2)',
        boxShadow: '0 1px 2px rgba(13,115,119,0.07)',
      },
      ghost: {
        color: 'var(--text-3)',
      },
      'teal-ghost': {
        background: 'rgba(13,115,119,0.07)',
        border: '1px solid rgba(13,115,119,0.15)',
        color: 'var(--teal-700)',
      },
      outline: {
        background: 'rgba(20,168,181,0.07)',
        border: '1px solid rgba(20,168,181,0.28)',
        color: 'var(--teal-700)',
      },
    };

    const hoverClass = variant === 'ghost'
      ? 'hover:bg-teal-50 hover:text-teal-700'
      : variant === 'teal-ghost'
      ? 'hover:bg-teal-50'
      : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, hoverClass, sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
