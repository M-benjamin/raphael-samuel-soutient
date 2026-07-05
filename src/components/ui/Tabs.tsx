'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab { id: string; label: string; count?: number; icon?: React.ReactNode; }

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export function Tabs({ tabs, activeTab, onTabChange, className, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex rounded-xl p-1', className)}
        style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(13,115,119,0.14)' }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn('relative flex items-center justify-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg transition-all duration-150 whitespace-nowrap')}
              style={{ color: active ? 'var(--teal-700)' : 'var(--text-3)' }}
            >
              {active && (
                <motion.div
                  layoutId="pill-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(13,115,119,0.18)',
                    boxShadow: '0 1px 4px rgba(13,115,119,0.10)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {tab.icon && <span className="relative z-10 w-3.5 h-3.5">{tab.icon}</span>}
              <span className="relative z-10">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="relative z-10 px-1.5 py-0.5 text-[10px] font-bold rounded-md leading-none"
                  style={active
                    ? { background: 'rgba(13,115,119,0.10)', color: 'var(--teal-700)' }
                    : { background: 'rgba(13,115,119,0.07)', color: 'var(--text-3)' }
                  }>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-0', className)} style={{ borderBottom: '2px solid rgba(13,115,119,0.10)' }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex items-center gap-1.5 px-5 py-3 text-[13px] font-medium transition-all duration-150 whitespace-nowrap"
            style={{ color: active ? 'var(--teal-700)' : 'var(--text-3)' }}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span className={active ? 'font-semibold' : ''}>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md leading-none"
                style={active
                  ? { background: 'rgba(13,115,119,0.10)', color: 'var(--teal-700)' }
                  : { background: 'rgba(13,115,119,0.06)', color: 'var(--text-3)' }
                }>
                {tab.count}
              </span>
            )}
            {active && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-[-2px] left-0 right-0 h-[2px] rounded-full"
                style={{ background: 'var(--teal-600)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
