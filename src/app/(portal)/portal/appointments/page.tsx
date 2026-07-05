'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Loader2, HeartPulse, CreditCard, CalendarClock,
  AlertTriangle, ChevronDown, ChevronUp, Phone, Mail, Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PortalNav } from '@/components/portal/PortalNav';
import { PaymentModal } from '@/components/portal/PaymentModal';
import type { Appointment } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  confirmed: { label: 'Confirmed',  color: '#0d7377', bg: 'rgba(13,115,119,0.10)', icon: CheckCircle2 },
  pending:   { label: 'Pending',    color: '#d97706', bg: 'rgba(217,119,6,0.10)',   icon: AlertCircle },
  completed: { label: 'Completed',  color: '#059669', bg: 'rgba(5,150,105,0.10)',   icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',  color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   icon: XCircle },
  no_show:   { label: 'No Show',    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  icon: XCircle },
};

type AppWithService = Appointment & { service?: { name: string; duration_minutes: number; price_min: number | null; price_max: number | null; price_type: string } };

export default function PortalAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Cancel confirmation state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Expanded card state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rtRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/portal/login'); return; }
      setUserEmail(user.email ?? '');
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

      const { data: appt } = await supabase
        .from('appointments')
        .select('business_id')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (appt) setBusinessId(appt.business_id);

      await loadAppointments(user.email ?? '');
      startRealtime(user.email ?? '', supabase);
    };
    init();
    return () => {
      if (channelRef.current && rtRef.current) {
        rtRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRealtime = (email: string, supabase: ReturnType<typeof createClient>) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    rtRef.current = supabase;
    const channel = supabase
      .channel('portal-appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `customer_email=eq.${email}` },
        (payload) => {
          const eventType = payload.eventType;
          const newRow = payload.new as AppWithService;
          const oldRow = payload.old as Partial<AppWithService>;
          if (eventType === 'UPDATE') {
            setAppointments((prev) =>
              prev.map((a) => a.id === newRow.id ? { ...a, ...newRow } : a)
            );
          }
          if (eventType === 'INSERT') {
            setAppointments((prev) => {
              if (prev.some((a) => a.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          }
          if (eventType === 'DELETE') {
            setAppointments((prev) => prev.filter((a) => a.id !== oldRow.id));
          }
        }
      )
      .subscribe();
    channelRef.current = channel;
  };

  const loadAppointments = async (email: string) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('appointments')
      .select('*, service:services(name, duration_minutes, price_min, price_max, price_type)')
      .eq('customer_email', email)
      .order('scheduled_at', { ascending: false });
    setAppointments((data as AppWithService[]) ?? []);
    setLoading(false);
  };

  // Cancel with status API (sends emails)
  const confirmCancel = async (id: string) => {
    setCancelling(true);
    try {
      const res = await fetch('/api/appointments/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel');
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
      setConfirmCancelId(null);
    } catch {
      // fallback: direct update
      const supabase = createClient();
      await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
      setConfirmCancelId(null);
    } finally {
      setCancelling(false);
      setCancellingId(null);
    }
  };

  const submitReschedule = async (id: string) => {
    if (!newDateTime) { setRescheduleError('Please pick a new date and time'); return; }
    const picked = new Date(newDateTime);
    if (picked <= new Date()) { setRescheduleError('Please choose a future date and time'); return; }

    setRescheduling(true);
    setRescheduleError('');
    try {
      const res = await fetch('/api/appointments/reschedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: id,
          newScheduledAt: picked.toISOString(),
          requestedBy: 'patient',
        }),
      });
      const json = await res.json();
      if (!res.ok) { setRescheduleError(json.error || 'Failed to reschedule'); return; }

      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, scheduled_at: picked.toISOString(), status: 'pending' } : a)
      );
      setReschedulingId(null);
      setNewDateTime('');
    } catch {
      setRescheduleError('Network error. Please try again.');
    } finally {
      setRescheduling(false);
    }
  };

  const upcoming = appointments.filter((a) =>
    ['confirmed', 'pending'].includes(a.status) && new Date(a.scheduled_at) > new Date()
  );
  const history = appointments.filter((a) =>
    !['confirmed', 'pending'].includes(a.status) || new Date(a.scheduled_at) <= new Date()
  );

  // min datetime = now + 2 hours (rounded to next 30 min)
  const minDateTime = (() => {
    const d = new Date(Date.now() + 2 * 60 * 60000);
    d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  return (
    <div className="min-h-screen" style={{ background: '#f0f7f8' }}>
      {payingAppointment && businessId && (
        <PaymentModal
          appointment={payingAppointment}
          businessId={businessId}
          onClose={() => setPayingAppointment(null)}
          onPaid={(txHash, amountPaid, payMethod) => {
            setAppointments((prev) =>
              prev.map((a) => a.id === payingAppointment.id ? {
                ...a,
                payment_status: payMethod === 'partial' ? 'partial' : 'paid',
                payment_tx_hash: txHash || a.payment_tx_hash,
                amount_paid: amountPaid,
              } : a)
            );
            setPayingAppointment(null);
          }}
        />
      )}

      <PortalNav />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: '#0a2e30' }}>My Appointments</h1>
            <p className="text-[13px] mt-0.5" style={{ color: '#64748b' }}>{userEmail}</p>
          </div>
          <button
            onClick={() => loadAppointments(userEmail)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
            style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377' }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#0d7377' }} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3 text-center">
            <HeartPulse className="w-12 h-12" style={{ color: 'rgba(13,115,119,0.25)' }} />
            <p className="text-[16px] font-bold" style={{ color: '#0a2e30' }}>No appointments yet</p>
            <p className="text-[13px] max-w-xs" style={{ color: '#64748b' }}>
              Your appointments will appear here after booking via our AI receptionist.
            </p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#0d7377' }}>
                  Upcoming · {upcoming.length}
                </h2>
                <div className="space-y-3">
                  {upcoming.map((appt, i) => (
                    <AppointmentCard
                      key={appt.id}
                      appt={appt}
                      index={i}
                      expanded={expandedId === appt.id}
                      onToggleExpand={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                      // Reschedule
                      reschedulingId={reschedulingId}
                      newDateTime={newDateTime}
                      minDateTime={minDateTime}
                      rescheduling={rescheduling}
                      rescheduleError={rescheduleError}
                      onStartReschedule={(id) => { setReschedulingId(id); setNewDateTime(''); setRescheduleError(''); }}
                      onCancelReschedule={() => { setReschedulingId(null); setNewDateTime(''); setRescheduleError(''); }}
                      onDateChange={setNewDateTime}
                      onSubmitReschedule={submitReschedule}
                      // Cancel
                      confirmCancelId={confirmCancelId}
                      cancelling={cancelling}
                      cancellingId={cancellingId}
                      onRequestCancel={(id) => { setConfirmCancelId(id); setCancellingId(id); }}
                      onConfirmCancel={confirmCancel}
                      onDismissCancel={() => { setConfirmCancelId(null); setCancellingId(null); }}
                      // Payment
                      onPay={() => setPayingAppointment(appt)}
                      isUpcoming
                    />
                  ))}
                </div>
              </section>
            )}

            {/* History */}
            {history.length > 0 && (
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
                  History · {history.length}
                </h2>
                <div className="space-y-3">
                  {history.map((appt, i) => (
                    <AppointmentCard
                      key={appt.id}
                      appt={appt}
                      index={i}
                      expanded={expandedId === appt.id}
                      onToggleExpand={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                      reschedulingId={null}
                      newDateTime=""
                      minDateTime={minDateTime}
                      rescheduling={false}
                      rescheduleError=""
                      onStartReschedule={() => {}}
                      onCancelReschedule={() => {}}
                      onDateChange={() => {}}
                      onSubmitReschedule={() => {}}
                      confirmCancelId={null}
                      cancelling={false}
                      cancellingId={null}
                      onRequestCancel={() => {}}
                      onConfirmCancel={() => {}}
                      onDismissCancel={() => {}}
                      onPay={() => setPayingAppointment(appt)}
                      isUpcoming={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Appointment Card ───────────────────────────────────────────────────── */
interface CardProps {
  appt: AppWithService;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  reschedulingId: string | null;
  newDateTime: string;
  minDateTime: string;
  rescheduling: boolean;
  rescheduleError: string;
  onStartReschedule: (id: string) => void;
  onCancelReschedule: () => void;
  onDateChange: (val: string) => void;
  onSubmitReschedule: (id: string) => void;
  confirmCancelId: string | null;
  cancelling: boolean;
  cancellingId: string | null;
  onRequestCancel: (id: string) => void;
  onConfirmCancel: (id: string) => void;
  onDismissCancel: () => void;
  onPay: () => void;
  isUpcoming: boolean;
}

function AppointmentCard({
  appt, index, expanded, onToggleExpand,
  reschedulingId, newDateTime, minDateTime, rescheduling, rescheduleError,
  onStartReschedule, onCancelReschedule, onDateChange, onSubmitReschedule,
  confirmCancelId, cancelling, cancellingId,
  onRequestCancel, onConfirmCancel, onDismissCancel,
  onPay, isUpcoming,
}: CardProps) {
  const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const date = new Date(appt.scheduled_at);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const canReschedule = isUpcoming && !['completed', 'cancelled', 'no_show'].includes(appt.status);
  const canCancel = isUpcoming && !['completed', 'cancelled', 'no_show'].includes(appt.status);
  const isRescheduling = reschedulingId === appt.id;
  const isConfirmingCancel = confirmCancelId === appt.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: `1px solid ${isConfirmingCancel ? 'rgba(220,38,38,0.25)' : 'rgba(13,115,119,0.10)'}`,
        boxShadow: '0 2px 16px rgba(13,115,119,0.07)',
      }}
    >
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Date block */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}22` }}>
            <span className="text-[10px] font-bold uppercase" style={{ color: cfg.color }}>
              {date.toLocaleString('en-US', { month: 'short' })}
            </span>
            <span className="text-[18px] font-black leading-none" style={{ color: cfg.color }}>
              {date.getDate()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: cfg.bg, color: cfg.color }}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
              {(appt.payment_status === 'paid' || appt.payment_status === 'cash') && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: 'rgba(5,150,105,0.10)', color: '#059669' }}>
                  ✓ {appt.payment_status === 'cash' ? 'Paid (Cash)' : 'Paid'}
                </span>
              )}
              {appt.payment_status === 'partial' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: 'rgba(217,119,6,0.10)', color: '#d97706' }}>
                  Partial
                </span>
              )}
            </div>

            <p className="font-bold text-[15px]" style={{ color: '#0a2e30' }}>
              {appt.service?.name || 'General Appointment'}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[12px]" style={{ color: '#64748b' }}>
                <Clock className="w-3 h-3" style={{ color: '#0d7377' }} /> {timeStr}
              </span>
              <span className="flex items-center gap-1 text-[12px]" style={{ color: '#64748b' }}>
                <Calendar className="w-3 h-3" style={{ color: '#0d7377' }} /> {dateStr}
              </span>
            </div>
          </div>

          {/* Expand toggle */}
          <button type="button" onClick={onToggleExpand}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ background: 'rgba(13,115,119,0.06)', color: '#0d7377' }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Action buttons row */}
        {(canReschedule || canCancel || appt.payment_status === 'unpaid') && (
          <div className="flex items-center gap-2 mt-4 pt-4 flex-wrap"
            style={{ borderTop: '1px solid rgba(13,115,119,0.08)' }}>

            {(appt.payment_status === 'unpaid' || appt.payment_status === 'partial') && appt.status !== 'cancelled' && (
              <button type="button" onClick={onPay}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(13,115,119,0.09)', color: '#0d7377', border: '1px solid rgba(13,115,119,0.15)' }}>
                <CreditCard className="w-3.5 h-3.5" />
                {appt.payment_status === 'partial' ? 'Pay Remaining' : 'Pay Now'}
              </button>
            )}

            {canReschedule && !isRescheduling && (
              <button type="button" onClick={() => onStartReschedule(appt.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                <CalendarClock className="w-3.5 h-3.5" /> Reschedule
              </button>
            )}

            {canCancel && !isConfirmingCancel && (
              <button type="button" onClick={() => onRequestCancel(appt.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.12)' }}>
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        )}

        {/* Reschedule panel */}
        <AnimatePresence>
          {isRescheduling && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p className="text-[12px] font-semibold" style={{ color: '#6366f1' }}>
                  <CalendarClock className="w-3.5 h-3.5 inline mr-1" />
                  Pick a new date and time
                </p>
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={newDateTime}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: '#0a2e30',
                  }}
                />
                {rescheduleError && (
                  <p className="text-[11px]" style={{ color: '#dc2626' }}>{rescheduleError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSubmitReschedule(appt.id)}
                    disabled={rescheduling}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold text-white transition-opacity"
                    style={{ background: '#6366f1', opacity: rescheduling ? 0.7 : 1 }}
                  >
                    {rescheduling
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rescheduling...</>
                      : <><CalendarClock className="w-3.5 h-3.5" /> Confirm Reschedule</>}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelReschedule}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium"
                    style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                    Discard
                  </button>
                </div>
                <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                  Status will reset to Pending — the clinic will re-approve your new time.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel confirmation */}
        <AnimatePresence>
          {isConfirmingCancel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-xl"
                style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.20)' }}>
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: '#dc2626' }}>Cancel this appointment?</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>
                      This cannot be undone. You'll receive a confirmation email.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onConfirmCancel(appt.id)}
                    disabled={cancelling && cancellingId === appt.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold text-white transition-opacity"
                    style={{ background: '#dc2626', opacity: cancelling ? 0.7 : 1 }}
                  >
                    {cancelling && cancellingId === appt.id
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...</>
                      : <><XCircle className="w-3.5 h-3.5" /> Yes, Cancel</>}
                  </button>
                  <button
                    type="button"
                    onClick={onDismissCancel}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                    Keep It
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-3"
              style={{ borderTop: '1px solid rgba(13,115,119,0.08)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest pt-3" style={{ color: '#0d7377' }}>
                Appointment Details
              </p>

              <div className="grid grid-cols-2 gap-3">
                {appt.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0d7377' }} />
                    <span className="text-[12px]" style={{ color: '#334155' }}>{appt.customer_phone}</span>
                  </div>
                )}
                {appt.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0d7377' }} />
                    <span className="text-[12px] truncate" style={{ color: '#334155' }}>{appt.customer_email}</span>
                  </div>
                )}
                {appt.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0d7377' }} />
                    <span className="text-[12px]" style={{ color: '#334155' }}>DOB: {appt.date_of_birth}</span>
                  </div>
                )}
                {appt.insurance_provider && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0d7377' }} />
                    <span className="text-[12px]" style={{ color: '#334155' }}>
                      {appt.insurance_provider}
                      {appt.insurance_member_id && <span style={{ color: '#94a3b8' }}> · {appt.insurance_member_id}</span>}
                    </span>
                  </div>
                )}
              </div>

              {appt.notes && (
                <div className="px-3 py-2 rounded-lg text-[12px]"
                  style={{ background: 'rgba(13,115,119,0.04)', border: '1px solid rgba(13,115,119,0.08)', color: '#64748b' }}>
                  {appt.notes}
                </div>
              )}

              {appt.service?.duration_minutes && (
                <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                  Duration: {appt.service.duration_minutes} minutes
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
