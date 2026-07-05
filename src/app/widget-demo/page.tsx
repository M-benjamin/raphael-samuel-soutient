'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { VoiceWidget } from '@/components/voice/VoiceWidget';

function WidgetDemoContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('businessId') || '';

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>businessId parameter is required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>Widget Demo</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>The voice widget appears in the bottom right corner</p>
      </div>
      <VoiceWidget businessId={businessId} businessName="MediCall AI" />
    </div>
  );
}

export default function WidgetDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <p className="text-sm" style={{ color: 'var(--text-4)' }}>Loading...</p>
      </div>
    }>
      <WidgetDemoContent />
    </Suspense>
  );
}
