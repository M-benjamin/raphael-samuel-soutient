'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Calendar, Phone, UserPlus, Bot, AlertTriangle,
  Info, PhoneOff, PhoneMissed, CheckCheck, Trash2, Filter,
  RefreshCw, Circle, BellOff,
} from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import {
  getNotifications, markAsRead, markAllAsRead,
  deleteNotification, deleteAllRead,
} from '@/services/notifications';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import type { Notification, NotificationType } from '@/types';

/* ── Per-type config ──────────────────────────────────────────── */
const TYPE_CONFIG: Record<NotificationType, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  label: string;
}> = {
  new_appointment: {
    icon: <Calendar className="w-4 h-4" />,
    color: '#0d7377', bg: 'rgba(13,115,119,0.12)',
    label: 'Appointment',
  },
  appointment_cancelled: {
    icon: <Calendar className="w-4 h-4" />,
    color: '#dc2626', bg: 'rgba(220,38,38,0.10)',
    label: 'Cancelled',
  },
  new_conversation: {
    icon: <Phone className="w-4 h-4" />,
    color: '#14a8b5', bg: 'rgba(20,168,181,0.12)',
    label: 'Call',
  },
  new_lead: {
    icon: <UserPlus className="w-4 h-4" />,
    color: '#7c3aed', bg: 'rgba(124,58,237,0.10)',
    label: 'New Lead',
  },
  agent_error: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: '#d97706', bg: 'rgba(217,119,6,0.10)',
    label: 'Agent Error',
  },
  system: {
    icon: <Info className="w-4 h-4" />,
    color: '#6366f1', bg: 'rgba(99,102,241,0.10)',
    label: 'System',
  },
  callback_requested: {
    icon: <PhoneOff className="w-4 h-4" />,
    color: '#059669', bg: 'rgba(5,150,105,0.10)',
    label: 'Callback',
  },
  missed_call: {
    icon: <PhoneMissed className="w-4 h-4" />,
    color: '#dc2626', bg: 'rgba(220,38,38,0.10)',
    label: 'Missed Call',
  },
};

const FILTER_TABS = [
  { id: 'all',    label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'new_appointment',      label: 'Appointments' },
  { id: 'new_conversation',     label: 'Calls' },
  { id: 'new_lead',             label: 'Leads' },
  { id: 'missed_call',          label: 'Missed Calls' },
  { id: 'callback_requested',   label: 'Callbacks' },
  { id: 'agent_error',          label: 'Errors' },
  { id: 'system',               label: 'System' },
] as const;

type FilterId = typeof FILTER_TABS[number]['id'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();

  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = 'This Week';
    else if (diffDays < 30) label = 'This Month';
    else label = 'Older';

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];
  return order.filter((l) => groups[l]).map((l) => ({ label: l, items: groups[l] }));
}

/* ── Demo seed (shown when DB has no notifications) ──────────── */
const DEMO_NOTIFICATIONS: Omit<Notification, 'id' | 'business_id'>[] = [
  { type: 'new_appointment',    title: 'New Appointment Booked',         body: 'Sarah Mitchell scheduled a General Consultation for tomorrow at 10:00 AM.',         is_read: false, metadata: null, created_at: new Date(Date.now() - 2  * 60000).toISOString() },
  { type: 'new_conversation',   title: 'Incoming Patient Call',          body: 'Clara answered a call from +1 (512) 555-0183. Duration: 3m 42s.',                   is_read: false, metadata: null, created_at: new Date(Date.now() - 8  * 60000).toISOString() },
  { type: 'new_lead',           title: 'New Patient Lead Captured',      body: 'James Rodriguez expressed interest in Mental Health Consultation.',                  is_read: false, metadata: null, created_at: new Date(Date.now() - 25 * 60000).toISOString() },
  { type: 'missed_call',        title: 'Missed Call',                    body: 'Incoming call from +1 (737) 555-0219 went unanswered. No agent was active.',        is_read: false, metadata: null, created_at: new Date(Date.now() - 40 * 60000).toISOString() },
  { type: 'callback_requested', title: 'Callback Requested',             body: 'Maria Chen requested a callback regarding Pediatric Checkup availability.',         is_read: true,  metadata: null, created_at: new Date(Date.now() - 2  * 3600000).toISOString() },
  { type: 'new_appointment',    title: 'Appointment Confirmed',          body: 'Dr. Lin confirmed Annual Physical Exam for David Park on Friday at 2:00 PM.',       is_read: true,  metadata: null, created_at: new Date(Date.now() - 4  * 3600000).toISOString() },
  { type: 'appointment_cancelled', title: 'Appointment Cancelled',       body: 'Emily Foster cancelled her Telehealth Consultation scheduled for 4:00 PM today.',   is_read: true,  metadata: null, created_at: new Date(Date.now() - 5  * 3600000).toISOString() },
  { type: 'agent_error',        title: 'Agent Connection Issue',         body: 'Victor (Urgent Care Triage) failed to connect to OpenAI Realtime API. Auto-retry enabled.', is_read: true, metadata: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { type: 'new_conversation',   title: 'Incoming Patient Call',          body: 'Grace handled a call about vaccination schedules. Appointment booked.',             is_read: true,  metadata: null, created_at: new Date(Date.now() - 86400000 - 3600000).toISOString() },
  { type: 'system',             title: 'Knowledge Base Updated',         body: '12 FAQ entries were added to your knowledge base. Agents will use the new data on next call.', is_read: true, metadata: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { type: 'new_lead',           title: 'New Patient Lead Captured',      body: 'Robert Kim inquired about Chronic Disease Management services.',                    is_read: true,  metadata: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { type: 'system',             title: 'Monthly Usage Summary',          body: 'Your AI agents handled 127 calls this month. 89 appointments booked. Conversion: 70%.', is_read: true, metadata: null, created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
];

export default function NotificationsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>('all');
  const [clearing, setClearing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getNotifications(business.id);
      if (data.length === 0) {
        // Show demo data so the page isn't empty
        setNotifications(
          DEMO_NOTIFICATIONS.map((n, i) => ({
            ...n,
            id: `demo-${i}`,
            business_id: business.id,
          }))
        );
        setUsingDemo(true);
      } else {
        setNotifications(data);
        setUsingDemo(false);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  const handleMarkRead = async (n: Notification) => {
    if (n.is_read || usingDemo) return;
    await markAsRead(n.id);
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
  };

  const handleMarkAllRead = async () => {
    if (!business || usingDemo) return;
    setMarkingAll(true);
    await markAllAsRead(business.id);
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setMarkingAll(false);
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id: string) => {
    if (usingDemo) { setNotifications((prev) => prev.filter((x) => x.id !== id)); return; }
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
  };

  const handleClearRead = async () => {
    if (!business) return;
    setClearing(true);
    if (usingDemo) {
      setNotifications((prev) => prev.filter((x) => !x.is_read));
    } else {
      await deleteAllRead(business.id);
      setNotifications((prev) => prev.filter((x) => !x.is_read));
    }
    setClearing(false);
    toast.success('Read notifications cleared');
  };

  /* Filtered list */
  const filtered = notifications.filter((n) => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  const grouped   = groupByDate(filtered);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount   = notifications.filter((n) =>  n.is_read).length;

  /* Count per filter */
  const countFor = (id: FilterId): number => {
    if (id === 'all')    return notifications.length;
    if (id === 'unread') return unreadCount;
    return notifications.filter((n) => n.type === id).length;
  };

  return (
    <div className="space-y-5">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.18), rgba(13,115,119,0.12))', border: '1px solid rgba(20,168,181,0.28)' }}
          >
            <Bell className="w-5 h-5" style={{ color: '#0d7377' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold" style={{ color: 'var(--text-1)' }}>Notifications</h1>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d7377, #14a8b5)' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
              {notifications.length} total · {unreadCount} unread
              {usingDemo && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1' }}>Sample data</span>}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={load}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="teal-ghost"
              size="sm"
              icon={<CheckCheck className="w-3.5 h-3.5" />}
              loading={markingAll}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
          {readCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />}
              loading={clearing}
              onClick={handleClearRead}
            >
              Clear read
            </Button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ───────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const count = countFor(tab.id);
          if (count === 0 && tab.id !== 'all' && tab.id !== 'unread') return null;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap"
              style={filter === tab.id ? {
                background: 'linear-gradient(135deg, #0d7377, #0a4a4d)',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(13,115,119,0.30)',
              } : {
                background: 'rgba(13,115,119,0.05)',
                color: 'var(--text-2)',
                border: '1px solid rgba(13,115,119,0.12)',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={filter === tab.id
                    ? { background: 'rgba(255,255,255,0.20)', color: '#ffffff' }
                    : { background: 'rgba(13,115,119,0.10)', color: '#0d7377' }
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notification list ─────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{ background: 'rgba(13,115,119,0.03)', border: '1px dashed rgba(13,115,119,0.16)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(20,168,181,0.22)' }}
          >
            <BellOff className="w-6 h-6" style={{ color: '#0d7377' }} />
          </div>
          <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
            {filter === 'unread'
              ? 'You have no unread notifications.'
              : 'Notifications will appear here when patients call, book, or when agents have updates.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              {/* Date group label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>
                  {label}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(13,115,119,0.10)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{items.length}</span>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((n, i) => {
                    const cfg = TYPE_CONFIG[n.type];
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                        transition={{ delay: i * 0.03 }}
                        className="group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-150"
                        style={{
                          background: n.is_read ? '#ffffff' : 'rgba(13,115,119,0.04)',
                          border: n.is_read
                            ? '1px solid rgba(13,115,119,0.10)'
                            : '1px solid rgba(20,168,181,0.25)',
                          boxShadow: n.is_read ? 'none' : '0 2px 12px rgba(13,115,119,0.08)',
                        }}
                        onClick={() => handleMarkRead(n)}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}40`;
                          (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 16px ${cfg.color}12`;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = n.is_read ? 'rgba(13,115,119,0.10)' : 'rgba(20,168,181,0.25)';
                          (e.currentTarget as HTMLElement).style.boxShadow = n.is_read ? 'none' : '0 2px 12px rgba(13,115,119,0.08)';
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}28` }}
                        >
                          {cfg.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className="text-[13px] font-semibold leading-snug"
                                style={{ color: n.is_read ? 'var(--text-2)' : 'var(--text-1)' }}
                              >
                                {n.title}
                              </p>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ background: cfg.bg, color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-4)' }}>
                                {timeAgo(n.created_at)}
                              </span>
                              {!n.is_read && (
                                <Circle
                                  className="w-2 h-2 fill-current flex-shrink-0"
                                  style={{ color: '#14a8b5' }}
                                />
                              )}
                            </div>
                          </div>
                          <p
                            className="text-[12px] mt-1 leading-relaxed"
                            style={{ color: n.is_read ? 'var(--text-4)' : 'var(--text-3)' }}
                          >
                            {n.body}
                          </p>
                        </div>

                        {/* Delete button (visible on hover) */}
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all flex-shrink-0 mt-0.5"
                          style={{ color: 'var(--text-4)' }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
