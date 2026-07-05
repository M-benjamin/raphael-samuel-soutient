'use client';

import { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast { id: string; type: ToastType; title: string; message?: string; }

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const CONFIGS: Record<ToastType, { icon: React.ReactNode; bar: string; iconBg: string }> = {
  success: { icon: <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#047857' }} />, bar: '#059669', iconBg: 'rgba(5,150,105,0.10)' },
  error:   { icon: <XCircle     className="w-4 h-4 flex-shrink-0" style={{ color: '#b91c1c' }} />, bar: '#dc2626', iconBg: 'rgba(220,38,38,0.10)' },
  warning: { icon: <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#b45309' }} />, bar: '#d97706', iconBg: 'rgba(217,119,6,0.10)'  },
  info:    { icon: <Info        className="w-4 h-4 flex-shrink-0" style={{ color: '#0d7377' }} />, bar: '#14a8b5', iconBg: 'rgba(20,168,181,0.10)'  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIGS[toast.type];

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 250);
    }, 4500);
    return () => { cancelAnimationFrame(show); clearTimeout(hide); };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn('relative flex items-start gap-3 rounded-2xl px-4 py-3.5 min-w-[300px] max-w-sm transition-all duration-250 overflow-hidden', visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95')}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(13,115,119,0.16)',
        boxShadow: '0 8px 32px rgba(13,115,119,0.14), 0 2px 8px rgba(13,115,119,0.08)',
      }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: cfg.bar }} />
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.iconBg }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-1)' }}>{toast.title}</p>
        {toast.message && <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>{toast.message}</p>}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 250); }}
        className="flex-shrink-0 mt-0.5 p-1 rounded-lg transition-colors"
        style={{ color: 'var(--text-3)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const value: ToastContextValue = {
    toast:   addToast,
    success: (title, message) => addToast({ type: 'success', title, message }),
    error:   (title, message) => addToast({ type: 'error',   title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info:    (title, message) => addToast({ type: 'info',    title, message }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
