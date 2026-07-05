import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps { status: string; label?: string; className?: string; }

export function StatusBadge({ status, label, className }: BadgeProps) {
  return (
    <span className={cn('badge', getStatusColor(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
      {label || status.replace(/_/g, ' ')}
    </span>
  );
}

interface SimpleBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'teal' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange';
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'default', dot, className }: SimpleBadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(13,115,119,0.07)',  border: '1px solid rgba(13,115,119,0.18)',  color: 'var(--text-2)' },
    teal:    { background: 'rgba(13,115,119,0.10)',  border: '1px solid rgba(20,168,181,0.28)',  color: '#0d7377' },
    blue:    { background: 'rgba(37,99,235,0.08)',   border: '1px solid rgba(37,99,235,0.22)',   color: '#1d4ed8' },
    green:   { background: 'rgba(5,150,105,0.09)',   border: '1px solid rgba(5,150,105,0.24)',   color: '#047857' },
    yellow:  { background: 'rgba(217,119,6,0.09)',   border: '1px solid rgba(217,119,6,0.24)',   color: '#b45309' },
    red:     { background: 'rgba(220,38,38,0.09)',   border: '1px solid rgba(220,38,38,0.24)',   color: '#b91c1c' },
    purple:  { background: 'rgba(124,58,237,0.08)',  border: '1px solid rgba(124,58,237,0.22)',  color: '#6d28d9' },
    gray:    { background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.20)', color: '#475569' },
    orange:  { background: 'rgba(234,88,12,0.09)',   border: '1px solid rgba(234,88,12,0.22)',   color: '#c2410c' },
  };

  const dotColors: Record<string, string> = {
    default: '#5a9098', teal: '#0d7377', blue: '#2563eb', green: '#059669',
    yellow: '#d97706', red: '#dc2626', purple: '#7c3aed', gray: '#64748b', orange: '#ea580c',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-lg', className)}
      style={styles[variant]}>
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColors[variant] }} />}
      {children}
    </span>
  );
}
