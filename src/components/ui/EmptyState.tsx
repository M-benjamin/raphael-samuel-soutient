import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(20,168,181,0.12), rgba(13,115,119,0.08))',
            border: '1px solid rgba(20,168,181,0.25)',
            color: 'var(--teal-600)',
          }}>
          {icon}
        </div>
      )}
      <h3 className="text-[14px] font-bold mb-1.5 tracking-tight" style={{ color: 'var(--text-1)' }}>{title}</h3>
      {description && (
        <p className="text-[13px] max-w-xs leading-relaxed mb-5" style={{ color: 'var(--text-3)' }}>{description}</p>
      )}
      {action && (
        <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
