'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, X, Loader2, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FilePreviewProps {
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  isOutgoing?: boolean;
}

function isImage(type: string | null) {
  return type?.startsWith('image/') ?? false;
}

function isPdf(type: string | null) {
  return type === 'application/pdf';
}

// Extract storage path from a public/private Supabase URL
// e.g. https://*.supabase.co/storage/v1/object/public/support-files/tickets/xxx/yyy.png
// → bucket: support-files, path: tickets/xxx/yyy.png
function parseBucketPath(url: string): { bucket: string; path: string } | null {
  try {
    const u = new URL(url);
    // matches /storage/v1/object/(public|sign)/<bucket>/<path>
    const m = u.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
    if (!m) return null;
    return { bucket: m[1], path: m[2] };
  } catch {
    return null;
  }
}

export function FilePreview({ fileUrl, fileName, fileType, isOutgoing = false }: FilePreviewProps) {
  const [open, setOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openPreview = async () => {
    setOpen(true);
    if (signedUrl) return; // already fetched
    setLoading(true);
    setError('');

    const parsed = parseBucketPath(fileUrl);
    if (!parsed) {
      // URL is already accessible (public bucket) — use as-is
      setSignedUrl(fileUrl);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signErr } = await supabase.storage
      .from(parsed.bucket)
      .createSignedUrl(parsed.path, 60 * 5); // 5 min

    if (signErr || !data?.signedUrl) {
      setError('Could not load file. It may have been deleted.');
    } else {
      setSignedUrl(data.signedUrl);
    }
    setLoading(false);
  };

  const chipBg = isOutgoing ? 'rgba(255,255,255,0.15)' : 'rgba(13,115,119,0.08)';
  const chipColor = isOutgoing ? '#fff' : '#0d7377';

  return (
    <>
      {/* Inline chip — click to preview */}
      <button
        onClick={openPreview}
        className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-xl transition-opacity hover:opacity-80 text-left"
        style={{ background: chipBg }}
      >
        {isImage(fileType)
          ? <ImageIcon className="w-4 h-4 flex-shrink-0" style={{ color: chipColor }} />
          : <FileText className="w-4 h-4 flex-shrink-0" style={{ color: chipColor }} />
        }
        <span className="text-[11px] truncate max-w-[180px]" style={{ color: chipColor }}>
          {fileName || 'Attachment'}
        </span>
      </button>

      {/* Preview modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(10,46,48,0.70)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            >
              {/* Panel — stop propagation so clicking inside doesn't close */}
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: '#fff',
                  boxShadow: '0 24px 64px rgba(10,46,48,0.30)',
                  maxWidth: '90vw',
                  maxHeight: '88vh',
                  width: isImage(fileType) ? 'auto' : 700,
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(13,115,119,0.10)', background: '#fafcfc' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    {isImage(fileType)
                      ? <ImageIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#0d7377' }} />
                      : <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#0d7377' }} />
                    }
                    <span className="text-[13px] font-semibold truncate" style={{ color: '#0a2e30' }}>
                      {fileName || 'Attachment'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {signedUrl && (
                      <a
                        href={signedUrl}
                        download={fileName || 'file'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                        style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(13,115,119,0.07)', color: '#64748b' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-4"
                  style={{ minHeight: 200, background: '#f8fafc' }}>
                  {loading && (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#0d7377' }} />
                      <p className="text-[12px]" style={{ color: '#94a3b8' }}>Loading file…</p>
                    </div>
                  )}
                  {error && (
                    <p className="text-[13px] text-center px-6" style={{ color: '#ef4444' }}>{error}</p>
                  )}
                  {signedUrl && !loading && (
                    <>
                      {isImage(fileType) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={signedUrl}
                          alt={fileName || 'attachment'}
                          className="rounded-xl object-contain"
                          style={{ maxWidth: '85vw', maxHeight: '75vh' }}
                        />
                      )}
                      {isPdf(fileType) && (
                        <iframe
                          src={signedUrl}
                          title={fileName || 'PDF'}
                          className="rounded-xl"
                          style={{ width: '100%', height: '70vh', border: 'none' }}
                        />
                      )}
                      {!isImage(fileType) && !isPdf(fileType) && (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <FileText className="w-14 h-14" style={{ color: 'rgba(13,115,119,0.30)' }} />
                          <p className="text-[14px] font-semibold" style={{ color: '#0a2e30' }}>{fileName}</p>
                          <p className="text-[12px]" style={{ color: '#94a3b8' }}>
                            This file type cannot be previewed. Use the Download button above.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
