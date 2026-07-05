'use client';

import { useEffect, useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useBusinessStore } from '@/store/business';
import { getUnreadCount } from '@/services/notifications';

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/dashboard':                    { title: 'Overview',       sub: 'Practice performance at a glance' },
  '/dashboard/agents':             { title: 'AI Agents',      sub: 'Configure voice agent personalities' },
  '/dashboard/appointments':       { title: 'Appointments',   sub: 'Manage patient bookings & schedule' },
  '/dashboard/conversations':      { title: 'Call Log',       sub: 'Patient call history and transcripts' },
  '/dashboard/services':           { title: 'Services',       sub: 'Healthcare service catalog' },
  '/dashboard/faqs':               { title: 'Knowledge Base', sub: 'Train your AI with Q&A pairs' },
  '/dashboard/widget':             { title: 'Widget',         sub: 'Embed the AI on your website' },
  '/dashboard/analytics':          { title: 'Analytics',      sub: 'Performance insights & trends' },
  '/dashboard/settings':           { title: 'Settings',       sub: 'Practice profile & configuration' },
  '/dashboard/notifications':      { title: 'Notifications',  sub: 'Alerts, calls, and system updates' },
};

function getDynamicPage(pathname: string) {
  if (/^\/dashboard\/agents\/[^/]+$/.test(pathname))
    return { title: 'Agent Studio', sub: 'Configure and test live voice' };
  return null;
}

interface NavbarProps { onMenuClick: () => void; }

export function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { business } = useBusinessStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!business) return;
    getUnreadCount(business.id).then(setUnreadCount).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount(business.id).then(setUnreadCount).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [business]);

  const getPage = () => {
    const dynamic = getDynamicPage(pathname);
    if (dynamic) return dynamic;
    const key = '/' + pathname.split('/').filter(Boolean).slice(0, 2).join('/');
    return pageTitles[key] || pageTitles[pathname] || { title: 'Dashboard', sub: '' };
  };

  const page = getPage();

  return (
    <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(13,115,119,0.12)',
        boxShadow: '0 1px 12px rgba(13,115,119,0.07)',
      }}>

      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--teal-700)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}>
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-1 h-9 rounded-full" style={{ background: 'linear-gradient(180deg, #14a8b5, #0d7377)' }} />
          <div className="flex flex-col leading-none">
            <h1 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>{page.title}</h1>
            {page.sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{page.sub}</p>}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl transition-all duration-150"
          style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.14)', color: 'var(--text-3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,168,181,0.35)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,115,119,0.14)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}>
          <Search className="w-3.5 h-3.5" />
          <span className="text-[12px]">Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ml-1"
            style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.16)', color: 'var(--text-3)' }}>⌘K</kbd>
        </button>

        {/* Bell → links to notifications page */}
        <button
          className="relative p-2 rounded-xl transition-all duration-150"
          style={{ color: 'var(--text-3)' }}
          onClick={() => router.push('/dashboard/notifications')}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--teal-700)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 ? (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #14a8b5, #0d7377)' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* Avatar */}
        <button
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #0d7377, #0a3d40)',
            border: '1px solid rgba(13,115,119,0.30)',
            boxShadow: '0 1px 4px rgba(13,115,119,0.20)',
          }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            {business?.name?.substring(0, 2).toUpperCase() ?? 'MC'}
          </div>
          <span className="hidden md:block text-[12px] font-semibold text-white truncate max-w-[120px]">
            {business?.name ?? 'My Practice'}
          </span>
        </button>
      </div>
    </header>
  );
}
