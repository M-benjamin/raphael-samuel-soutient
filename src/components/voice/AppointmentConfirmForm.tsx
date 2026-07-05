'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, X, User, Phone, Mail, Calendar, Shield, Hash, Loader2 } from 'lucide-react';
import type { PendingAppointment } from '@/types';

const schema = z.object({
  customer_name: z.string().min(2, 'Full name required'),
  customer_phone: z.string().min(7, 'Valid phone number required'),
  customer_email: z.string().email('Valid email required'),
  date_of_birth: z.string().min(1, 'Date of birth required'),
  insurance_provider: z.string().min(1, 'Insurance provider required (use "Self-Pay" if applicable)'),
  insurance_member_id: z.string().min(1, 'Member ID required (use "N/A" if self-pay)'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  pending: PendingAppointment;
  primaryColor?: string;
  onConfirmed: (callId: string, result: unknown) => void;
  onDismiss: () => void;
}

export function AppointmentConfirmForm({ pending, primaryColor = '#0d7377', onConfirmed, onDismiss }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: pending.customer_name,
      customer_phone: pending.customer_phone,
      customer_email: pending.customer_email,
      date_of_birth: pending.date_of_birth || '',
      insurance_provider: pending.insurance_provider || '',
      insurance_member_id: pending.insurance_member_id || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          service_id: pending.service_id,
          scheduled_at: pending.scheduled_at,
          notes: pending.notes,
          conversationId: pending.conversationId,
          businessId: pending.businessId,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to confirm appointment');

      setConfirmed(true);
      setTimeout(() => {
        onConfirmed(pending.callId || '', json.result);
      }, 2000);
    } catch (err) {
      console.error('Appointment confirm error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const scheduledLabel = pending.scheduled_at
    ? new Date(pending.scheduled_at).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : '';

  const inputCls = "w-full px-3 py-2 rounded-lg text-[12px] text-white outline-none transition-all placeholder:text-white/20";
  const inputStyle = (hasError: boolean) => ({
    background: 'rgba(255,255,255,0.07)',
    border: `1px solid ${hasError ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
  });
  const labelCls = "flex items-center gap-1.5 text-[10px] font-semibold mb-1.5 uppercase tracking-wider";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="absolute inset-0 z-20 flex flex-col rounded-[inherit]"
        style={{ background: 'rgba(6,12,14,0.98)' }}
      >
        {confirmed ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            >
              <CheckCircle className="w-14 h-14" style={{ color: primaryColor }} />
            </motion.div>
            <p className="text-white font-bold text-[15px]">Appointment Confirmed!</p>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              A confirmation email has been sent to your inbox.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-[13px] font-bold text-white">Confirm Your Details</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Please verify before we book
                </p>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <X className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
              </button>
            </div>

            {/* Appointment time pill */}
            {scheduledLabel && (
              <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}33` }}>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-[11px] font-medium" style={{ color: primaryColor }}>{scheduledLabel}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">

              {/* Name */}
              <div>
                <label className={labelCls} style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input {...register('customer_name')} placeholder="Your full legal name"
                  className={inputCls} style={inputStyle(!!errors.customer_name)} />
                {errors.customer_name && <p className="text-[10px] mt-0.5" style={{ color: '#f87171' }}>{errors.customer_name.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls} style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input {...register('customer_phone')} type="tel" placeholder="+1 (555) 000-0000"
                  className={inputCls} style={inputStyle(!!errors.customer_phone)} />
                {errors.customer_phone && <p className="text-[10px] mt-0.5" style={{ color: '#f87171' }}>{errors.customer_phone.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={labelCls} style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input {...register('customer_email')} type="email" placeholder="you@example.com"
                  className={inputCls} style={inputStyle(!!errors.customer_email)} />
                {errors.customer_email && <p className="text-[10px] mt-0.5" style={{ color: '#f87171' }}>{errors.customer_email.message}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className={labelCls} style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <Calendar className="w-3 h-3" /> Date of Birth
                </label>
                <input {...register('date_of_birth')} type="date"
                  className={inputCls} style={{ ...inputStyle(!!errors.date_of_birth), colorScheme: 'dark' }} />
                {errors.date_of_birth && <p className="text-[10px] mt-0.5" style={{ color: '#f87171' }}>{errors.date_of_birth.message}</p>}
              </div>

              {/* Insurance Provider */}
              <div>
                <label className={labelCls} style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <Shield className="w-3 h-3" /> Insurance Provider
                </label>
                <input {...register('insurance_provider')} placeholder='e.g. Blue Cross, Aetna, or "Self-Pay"'
                  className={inputCls} style={inputStyle(!!errors.insurance_provider)} />
                {errors.insurance_provider && <p className="text-[10px] mt-0.5" style={{ color: '#f87171' }}>{errors.insurance_provider.message}</p>}
              </div>

              {/* Member ID */}
              <div>
                <label className={labelCls} style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <Hash className="w-3 h-3" /> Member ID / Policy #
                </label>
                <input {...register('insurance_member_id')} placeholder='Policy number or "N/A" if self-pay'
                  className={inputCls} style={inputStyle(!!errors.insurance_member_id)} />
                {errors.insurance_member_id && <p className="text-[10px] mt-0.5" style={{ color: '#f87171' }}>{errors.insurance_member_id.message}</p>}
              </div>

              {/* Error banner */}
              {errorMsg && (
                <div className="px-3 py-2 rounded-lg text-[11px]"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-opacity mt-1"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                  : <><CheckCircle className="w-4 h-4" /> Confirm Appointment</>
                }
              </button>

              <p className="text-[9px] text-center pb-1" style={{ color: 'rgba(255,255,255,0.20)' }}>
                A confirmation email will be sent to your inbox
              </p>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
