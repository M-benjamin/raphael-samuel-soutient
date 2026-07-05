'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 backdrop-blur-[4px]"
            style={{ background: 'rgba(10,61,64,0.40)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
            className={cn('relative w-full rounded-2xl z-10 overflow-hidden', sizes[size], className)}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(13,115,119,0.16)',
              boxShadow: '0 20px 60px rgba(10,61,64,0.18), 0 4px 16px rgba(13,115,119,0.10)',
            }}
          >
            {/* Top teal gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, #0d7377, #14a8b5, #0d7377)' }} />

            {(title || description) && (
              <div className="flex items-start justify-between px-6 pt-6 pb-4"
                style={{ borderBottom: '1px solid rgba(13,115,119,0.10)' }}>
                <div>
                  {title && <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>{title}</h2>}
                  {description && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.08)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--teal-700)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-3)';
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {!(title || description) && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors z-10"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.08)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--teal-700)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-3)';
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
