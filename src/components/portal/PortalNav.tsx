'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HeartPulse, Calendar, MessageSquare, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/portal/appointments', label: 'My Appointments', icon: Calendar },
  { href: '/portal/support',      label: 'Support',         icon: MessageSquare },
];

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/portal/login');
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 h-14"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(13,115,119,0.12)',
        boxShadow: '0 1px 12px rgba(13,115,119,0.06)',
      }}
    >
      <Link href="/portal/appointments" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #14a8b5, #0d7377)' }}>
          <HeartPulse className="w-4 h-4 text-white" />
        </div>
        <span className="text-[14px] font-bold" style={{ color: '#0a2e30' }}>
          Patient Portal
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              style={{
                background: active ? 'rgba(13,115,119,0.10)' : 'transparent',
                color: active ? '#0d7377' : '#64748b',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium ml-2 transition-colors"
          style={{ color: '#94a3b8' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </nav>
    </header>
  );
}
