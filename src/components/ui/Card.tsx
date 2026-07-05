import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  accent?: boolean;
}

export function Card({ className, children, padding = 'md', glow, accent }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  let cls = glow ? 'card-glow' : 'card-surface';
  let extra = '';
  if (accent) {
    extra = ' border-l-[3px]';
    cls = 'card-surface';
  }
  return (
    <div className={cn(cls + extra, paddings[padding], className)}
      style={accent ? { borderLeftColor: 'var(--teal-500)' } : undefined}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function CardHeader({ title, description, action, className, icon }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-5', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))',
              border: '1px solid rgba(20,168,181,0.25)',
              color: 'var(--teal-600)',
            }}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[14px] font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>{title}</h3>
          {description && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>}
        </div>
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
