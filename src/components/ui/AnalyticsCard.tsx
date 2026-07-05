import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string; };
  className?: string;
  accent?: 'teal' | 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function AnalyticsCard({ title, value, icon, trend, className, accent = 'teal' }: AnalyticsCardProps) {
  const accents = {
    teal:   { bar: '#0d7377', iconBg: 'rgba(13,115,119,0.10)',  iconBorder: 'rgba(20,168,181,0.25)', iconColor: '#0d7377',  pos: 'rgba(13,115,119,0.10)', posText: '#0d7377'  },
    blue:   { bar: '#2563eb', iconBg: 'rgba(37,99,235,0.09)',   iconBorder: 'rgba(37,99,235,0.22)',  iconColor: '#1d4ed8',  pos: 'rgba(37,99,235,0.09)',  posText: '#1d4ed8'  },
    green:  { bar: '#059669', iconBg: 'rgba(5,150,105,0.09)',   iconBorder: 'rgba(5,150,105,0.22)',  iconColor: '#047857',  pos: 'rgba(5,150,105,0.09)',  posText: '#047857'  },
    purple: { bar: '#7c3aed', iconBg: 'rgba(124,58,237,0.09)',  iconBorder: 'rgba(124,58,237,0.22)', iconColor: '#6d28d9',  pos: 'rgba(124,58,237,0.09)', posText: '#6d28d9'  },
    orange: { bar: '#d97706', iconBg: 'rgba(217,119,6,0.09)',   iconBorder: 'rgba(217,119,6,0.22)',  iconColor: '#b45309',  pos: 'rgba(217,119,6,0.09)',  posText: '#b45309'  },
    red:    { bar: '#dc2626', iconBg: 'rgba(220,38,38,0.09)',   iconBorder: 'rgba(220,38,38,0.22)',  iconColor: '#b91c1c',  pos: 'rgba(220,38,38,0.09)',  posText: '#b91c1c'  },
  };

  const a = accents[accent];
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;
  const trendPositive = trend ? trend.value > 0 : false;
  const trendNeutral  = trend ? trend.value === 0 : false;

  return (
    <div className={cn('card-surface p-5 relative overflow-hidden', className)}
      style={{ borderLeft: `3px solid ${a.bar}` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: a.iconBg, border: `1px solid ${a.iconBorder}`, color: a.iconColor }}>
          <span className="w-4 h-4">{icon}</span>
        </div>
        {trend && TrendIcon && (
          <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={trendPositive
              ? { background: a.pos, color: a.posText }
              : trendNeutral
              ? { background: 'rgba(13,115,119,0.06)', color: 'var(--text-3)' }
              : { background: 'rgba(239,68,68,0.09)', color: '#dc2626' }
            }>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-[26px] font-bold tabular-nums leading-none mb-1" style={{ color: 'var(--text-1)' }}>{value}</div>
      <div className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{title}</div>
      {trend && <div className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{trend.label}</div>}
    </div>
  );
}
