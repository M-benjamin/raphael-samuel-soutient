'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, ChevronDown, ChevronUp, Phone, Mail,
  Shield, Calendar, Clock, CreditCard, CheckCircle2,
  XCircle, AlertCircle, User, FileText, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBusinessStore } from '@/store/business';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import type { Appointment, Service } from '@/types';

type AppWithService = Appointment & { service?: Service };

interface PatientProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface PatientRow {
  email: string;
  name: string;
  phone: string | null;
  dob: string | null;
  insurance_provider: string | null;
  insurance_member_id: string | null;
  appointments: AppWithService[];
  profile: PatientProfile | null;
  totalSpend: number;
  lastVisit: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  confirmed: { label: 'Confirmed', color: '#0d7377', bg: 'rgba(13,115,119,0.10)', icon: CheckCircle2 },
  pending:   { label: 'Pending',   color: '#d97706', bg: 'rgba(217,119,6,0.10)',  icon: AlertCircle },
  completed: { label: 'Completed', color: '#059669', bg: 'rgba(5,150,105,0.10)',  icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  icon: XCircle },
  no_show:   { label: 'No Show',   color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', icon: XCircle },
};

const PAY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  paid:     { label: '✓ Paid',    color: '#059669', bg: 'rgba(5,150,105,0.10)' },
  cash:     { label: '✓ Cash',    color: '#059669', bg: 'rgba(5,150,105,0.10)' },
  partial:  { label: 'Partial',   color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  unpaid:   { label: 'Unpaid',    color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
  refunded: { label: 'Refunded',  color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
};

export default function PatientsPage() {
  const { business } = useBusinessStore();
  const [appointments, setAppointments] = useState<AppWithService[]>([]);
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [detailAppt, setDetailAppt] = useState<AppWithService | null>(null);

  useEffect(() => {
    if (!business) return;
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const load = async () => {
    if (!business) return;
    setLoading(true);
    const supabase = createClient();

    const [{ data: appts }, { data: profs }] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, service:services(name, duration_minutes)')
        .eq('business_id', business.id)
        .order('scheduled_at', { ascending: false }),
      supabase
        .from('patient_profiles')
        .select('*'),
    ]);

    setAppointments((appts as AppWithService[]) ?? []);
    setProfiles((profs as PatientProfile[]) ?? []);
    setLoading(false);
  };

  // Group appointments by customer_email into patient rows
  const patients = useMemo<PatientRow[]>(() => {
    const map = new Map<string, PatientRow>();

    for (const appt of appointments) {
      const key = (appt.customer_email ?? '').toLowerCase() || appt.customer_name;
      if (!map.has(key)) {
        const profile = profiles.find(p => p.email.toLowerCase() === key) ?? null;
        map.set(key, {
          email: appt.customer_email ?? '',
          name: appt.customer_name,
          phone: appt.customer_phone,
          dob: appt.date_of_birth,
          insurance_provider: appt.insurance_provider,
          insurance_member_id: appt.insurance_member_id,
          appointments: [],
          profile,
          totalSpend: 0,
          lastVisit: appt.scheduled_at,
        });
      }
      const row = map.get(key)!;
      row.appointments.push(appt);
      if (appt.payment_status === 'paid' && appt.payment_amount) {
        row.totalSpend += Number(appt.payment_amount);
      }
      if (appt.scheduled_at > row.lastVisit) row.lastVisit = appt.scheduled_at;
      // Use the most complete name/phone/insurance from any appointment
      if (!row.phone && appt.customer_phone) row.phone = appt.customer_phone;
      if (!row.dob && appt.date_of_birth) row.dob = appt.date_of_birth;
      if (!row.insurance_provider && appt.insurance_provider) row.insurance_provider = appt.insurance_provider;
      if (!row.insurance_member_id && appt.insurance_member_id) row.insurance_member_id = appt.insurance_member_id;
    }

    return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [appointments, profiles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.insurance_provider && p.insurance_provider.toLowerCase().includes(q))
    );
  }, [patients, search]);

  const stats = useMemo(() => ({
    total: patients.length,
    withPortal: patients.filter(p => p.profile).length,
    totalRevenue: patients.reduce((s, p) => s + p.totalSpend, 0),
    totalAppointments: appointments.length,
  }), [patients, appointments]);

  return (
    <div className="space-y-5">

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients',     value: stats.total,            color: '#0d7377' },
          { label: 'Portal Accounts',    value: stats.withPortal,       color: '#6366f1' },
          { label: 'Total Appointments', value: stats.totalAppointments, color: '#d97706' },
          { label: 'Total Revenue',      value: `${stats.totalRevenue.toFixed(2)} USDC`, color: '#059669' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl px-5 py-4"
            style={{ background: '#fff', border: '1px solid rgba(13,115,119,0.10)', boxShadow: '0 2px 12px rgba(13,115,119,0.06)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>{s.label}</p>
            <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Patient list ── */}
      <Card>
        <CardHeader
          title="Patient Profiles"
          description={`${stats.total} unique patients · click to expand appointment history`}
          icon={<Users className="w-4 h-4" />}
        />

        <div className="mb-4">
          <Input
            placeholder="Search by name, email, phone or insurance..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users className="w-10 h-10" style={{ color: 'rgba(13,115,119,0.20)' }} />
            <p className="text-[15px] font-semibold" style={{ color: '#0a2e30' }}>No patients found</p>
            <p className="text-[13px]" style={{ color: '#94a3b8' }}>Patients appear here once they book an appointment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(patient => {
              const isExpanded = expandedEmail === patient.email;
              const completedCount = patient.appointments.filter(a => a.status === 'completed').length;
              const pendingCount = patient.appointments.filter(a => a.status === 'pending').length;
              const hasPortal = !!patient.profile;

              return (
                <div key={patient.email} className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${isExpanded ? 'rgba(13,115,119,0.25)' : 'rgba(13,115,119,0.09)'}` }}>

                  {/* Patient header row */}
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 transition-colors text-left"
                    style={{ background: isExpanded ? 'rgba(13,115,119,0.04)' : '#fff' }}
                    onClick={() => setExpandedEmail(isExpanded ? null : patient.email)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-[14px]"
                      style={{ background: 'linear-gradient(135deg,#14a8b5,#0d7377)' }}>
                      {patient.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + contact */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold" style={{ color: '#0a2e30' }}>{patient.name}</p>
                        {hasPortal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1' }}>
                            Portal Account
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(217,119,6,0.10)', color: '#d97706' }}>
                            {pendingCount} pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {patient.email && (
                          <span className="text-[11px] flex items-center gap-1" style={{ color: '#64748b' }}>
                            <Mail className="w-3 h-3" />{patient.email}
                          </span>
                        )}
                        {patient.phone && (
                          <span className="text-[11px] flex items-center gap-1" style={{ color: '#64748b' }}>
                            <Phone className="w-3 h-3" />{patient.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                      <Stat label="Appointments" value={patient.appointments.length} />
                      <Stat label="Completed" value={completedCount} />
                      <Stat label="Paid" value={patient.totalSpend > 0 ? `${patient.totalSpend.toFixed(2)} USDC` : '—'} />
                      <Stat label="Last Visit" value={new Date(patient.lastVisit).toLocaleDateString()} />
                    </div>

                    {/* Chevron */}
                    <div className="flex-shrink-0 ml-2" style={{ color: '#0d7377' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(13,115,119,0.10)' }}>

                          {/* Patient details strip */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
                            {patient.dob && <InfoChip icon={<Calendar className="w-3 h-3" />} label="Date of Birth" value={patient.dob} />}
                            {patient.insurance_provider && <InfoChip icon={<Shield className="w-3 h-3" />} label="Insurance" value={patient.insurance_provider} />}
                            {patient.insurance_member_id && <InfoChip icon={<Shield className="w-3 h-3" />} label="Member ID" value={patient.insurance_member_id} />}
                            {patient.profile?.created_at && <InfoChip icon={<User className="w-3 h-3" />} label="Portal Since" value={new Date(patient.profile.created_at).toLocaleDateString()} />}
                          </div>

                          {/* Appointments table */}
                          <p className="text-[11px] font-bold uppercase tracking-widest mb-2 mt-1" style={{ color: '#0d7377' }}>
                            Appointment History ({patient.appointments.length})
                          </p>
                          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(13,115,119,0.10)' }}>
                            <table className="w-full text-left">
                              <thead>
                                <tr style={{ background: 'rgba(13,115,119,0.04)', borderBottom: '1px solid rgba(13,115,119,0.10)' }}>
                                  {['Date & Time', 'Service', 'Duration', 'Status', 'Payment', ''].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {patient.appointments.map((appt, idx) => {
                                  const sCfg = STATUS_CFG[appt.status] ?? STATUS_CFG.pending;
                                  const pCfg = PAY_CFG[appt.payment_status] ?? PAY_CFG.unpaid;
                                  return (
                                    <tr key={appt.id}
                                      style={{ borderBottom: idx < patient.appointments.length - 1 ? '1px solid rgba(13,115,119,0.06)' : 'none', background: '#fff' }}>
                                      <td className="px-4 py-3 text-[12px]" style={{ color: '#334155' }}>
                                        {formatDateTime(appt.scheduled_at)}
                                      </td>
                                      <td className="px-4 py-3 text-[12px]" style={{ color: '#64748b' }}>
                                        {appt.service?.name ?? '—'}
                                      </td>
                                      <td className="px-4 py-3 text-[12px]" style={{ color: '#64748b' }}>
                                        {appt.duration_minutes} min
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit"
                                          style={{ background: sCfg.bg, color: sCfg.color }}>
                                          <sCfg.icon className="w-3 h-3" />{sCfg.label}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div>
                                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                                            style={{ background: pCfg.bg, color: pCfg.color }}>
                                            {pCfg.label}
                                          </span>
                                          {appt.payment_amount && (
                                            <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{appt.payment_amount} USDC</p>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => setDetailAppt(appt)}
                                          className="text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors"
                                          style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377' }}>
                                          View
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Appointment detail slide-over ── */}
      <AnimatePresence>
        {detailAppt && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(10,46,48,0.35)', backdropFilter: 'blur(2px)' }}
              onClick={() => setDetailAppt(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full z-50 overflow-y-auto"
              style={{ width: 400, background: '#fff', boxShadow: '-4px 0 32px rgba(13,115,119,0.15)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
                style={{ background: 'linear-gradient(135deg,#0a3d40,#0d7377)' }}>
                <div>
                  <p className="text-[16px] font-bold text-white">Appointment Details</p>
                  <p className="text-[11px] text-white/60">ID: {detailAppt.id.slice(0, 8)}…</p>
                </div>
                <button onClick={() => setDetailAppt(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={detailAppt.status} />
                  {(() => {
                    const pay = PAY_CFG[detailAppt.payment_status] ?? { label: detailAppt.payment_status, color: '#64748b', bg: 'rgba(100,116,139,0.08)' };
                    return (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: pay.bg, color: pay.color }}>
                        {pay.label}
                      </span>
                    );
                  })()}
                </div>

                <SlideSection title="Patient Information">
                  <SlideRow icon={<User className="w-3.5 h-3.5" />} label="Full Name" value={detailAppt.customer_name} />
                  {detailAppt.customer_phone && <SlideRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={detailAppt.customer_phone} />}
                  {detailAppt.customer_email && <SlideRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={detailAppt.customer_email} />}
                  {detailAppt.date_of_birth && <SlideRow icon={<Calendar className="w-3.5 h-3.5" />} label="Date of Birth" value={detailAppt.date_of_birth} />}
                </SlideSection>

                {(detailAppt.insurance_provider || detailAppt.insurance_member_id) && (
                  <SlideSection title="Insurance">
                    {detailAppt.insurance_provider && <SlideRow icon={<Shield className="w-3.5 h-3.5" />} label="Provider" value={detailAppt.insurance_provider} />}
                    {detailAppt.insurance_member_id && <SlideRow icon={<Shield className="w-3.5 h-3.5" />} label="Member ID" value={detailAppt.insurance_member_id} />}
                  </SlideSection>
                )}

                <SlideSection title="Appointment">
                  <SlideRow icon={<Clock className="w-3.5 h-3.5" />} label="Scheduled" value={formatDateTime(detailAppt.scheduled_at)} />
                  <SlideRow icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={`${detailAppt.duration_minutes} minutes`} />
                  {detailAppt.service?.name && <SlideRow icon={<FileText className="w-3.5 h-3.5" />} label="Service" value={detailAppt.service.name} />}
                </SlideSection>

                {detailAppt.notes && (
                  <SlideSection title="Notes">
                    <p className="text-[13px] leading-relaxed" style={{ color: '#334155' }}>{detailAppt.notes}</p>
                  </SlideSection>
                )}

                {detailAppt.payment_tx_hash && (
                  <SlideSection title="Payment">
                    {detailAppt.payment_amount && <SlideRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Amount" value={`${detailAppt.payment_amount} USDC`} />}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>Tx Hash</p>
                      <p className="text-[11px] break-all font-mono" style={{ color: '#0d7377' }}>{detailAppt.payment_tx_hash}</p>
                    </div>
                  </SlideSection>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-[15px] font-bold" style={{ color: '#0a2e30' }}>{value}</p>
      <p className="text-[10px]" style={{ color: '#94a3b8' }}>{label}</p>
    </div>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(13,115,119,0.10)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 mb-0.5" style={{ color: '#94a3b8' }}>
        <span style={{ color: '#0d7377' }}>{icon}</span>{label}
      </p>
      <p className="text-[12px] font-medium" style={{ color: '#0a2e30' }}>{value}</p>
    </div>
  );
}

function SlideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#0d7377' }}>{title}</p>
      <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid rgba(13,115,119,0.10)' }}>
        {children}
      </div>
    </div>
  );
}

function SlideRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-shrink-0" style={{ color: '#0d7377' }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{label}</p>
        <p className="text-[13px]" style={{ color: '#0a2e30' }}>{value}</p>
      </div>
    </div>
  );
}
