'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  aspectHint?: string; // e.g. "16:9" or "1:1"
}

export function ImageUploader({ label, value, onChange, folder = 'general', aspectHint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/website/upload-image', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onChange(json.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return; }
    upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <label className="wb-label">{label}{aspectHint && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> · {aspectHint} recommended</span>}</label>

      {value ? (
        /* Preview */
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(13,115,119,0.2)', background: '#f0f9f9' }}>
          <img src={value} alt={label} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 6 }}>
            <button
              onClick={() => inputRef.current?.click()}
              title="Replace image"
              style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(13,115,119,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Upload style={{ width: 13, height: 13, color: '#0d7377' }} />
            </button>
            <button
              onClick={() => onChange('')}
              title="Remove image"
              style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X style={{ width: 13, height: 13, color: '#dc2626' }} />
            </button>
          </div>
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 style={{ width: 22, height: 22, color: '#0d7377', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            borderRadius: 10,
            border: `1.5px dashed ${dragOver ? '#0d7377' : 'rgba(13,115,119,0.3)'}`,
            background: dragOver ? 'rgba(13,115,119,0.05)' : '#fafcfc',
            padding: '18px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all .15s',
          }}>
          {uploading ? (
            <Loader2 style={{ width: 22, height: 22, color: '#0d7377', animation: 'spin 1s linear infinite' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(13,115,119,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon style={{ width: 18, height: 18, color: '#0d7377' }} />
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0d7377' }}>{uploading ? 'Uploading…' : 'Click or drag to upload'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>PNG, JPG, WebP · max 5 MB</div>
          </div>
        </div>
      )}

      {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
