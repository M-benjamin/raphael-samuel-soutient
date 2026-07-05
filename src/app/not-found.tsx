import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', boxShadow: '0 0 24px rgba(13,115,119,0.30)' }}>
        <HeartPulse className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-6xl font-bold mb-3" style={{ color: 'rgba(13,115,119,0.20)' }}>404</h1>
      <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-1)' }}>Page not found</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150"
        style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', boxShadow: '0 1px 3px rgba(13,115,119,0.40)' }}
      >
        Go Home
      </Link>
    </div>
  );
}
