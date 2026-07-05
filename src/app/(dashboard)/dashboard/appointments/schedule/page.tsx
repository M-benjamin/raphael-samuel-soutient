"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useBusinessStore } from "@/store/business";
import type { Appointment, Service } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AppWithService = Appointment & { service?: Service };

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMonthYear(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(217,119,6,0.10)", color: "#d97706" },
  confirmed: { bg: "rgba(13,115,119,0.10)", color: "#0d7377" },
  completed: { bg: "rgba(5,150,105,0.10)", color: "#059669" },
  cancelled: { bg: "rgba(220,38,38,0.08)", color: "#dc2626" },
  no_show: { bg: "rgba(124,58,237,0.08)", color: "#7c3aed" },
};

function PaymentBadge({ appt }: { appt: AppWithService }) {
  const { payment_status, amount_paid, amount_remaining, payment_amount } =
    appt;
  if (payment_status === "paid")
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
      >
        <CheckCircle2 className="w-2.5 h-2.5" /> Paid (Online)
      </span>
    );
  if (payment_status === "cash")
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
      >
        <CheckCircle2 className="w-2.5 h-2.5" /> Paid (Cash)
      </span>
    );
  if (payment_status === "partial")
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: "rgba(217,119,6,0.10)", color: "#d97706" }}
      >
        <DollarSign className="w-2.5 h-2.5" />
        Partial · ${(amount_paid ?? 0).toFixed(2)} paid · $
        {(
          amount_remaining ??
          (payment_amount ? payment_amount - (amount_paid ?? 0) : 0)
        ).toFixed(2)}{" "}
        due
      </span>
    );
  if (payment_status === "refunded")
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: "rgba(99,102,241,0.10)", color: "#6366f1" }}
      >
        <RefreshCw className="w-2.5 h-2.5" /> Refunded
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ background: "rgba(100,116,139,0.10)", color: "#64748b" }}
    >
      Unpaid{payment_amount ? ` · $${payment_amount}` : ""}
    </span>
  );
}

export default function SchedulePage() {
  const { business } = useBusinessStore();
  const [appointments, setAppointments] = useState<AppWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date()),
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedAppt, setSelectedAppt] = useState<AppWithService | null>(null);
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [showCashInput, setShowCashInput] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [partialInput, setPartialInput] = useState("");

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("appointments")
      .select(
        "*, service:services(id,name,duration_minutes,price_min,price_max,price_type,is_active,sort_order,business_id,description,created_at,updated_at)",
      )
      .eq("business_id", business.id)
      .order("scheduled_at", { ascending: true });
    setAppointments((data as AppWithService[]) ?? []);
    setLoading(false);
  }, [business]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime
  useEffect(() => {
    if (!business) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`schedule:${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          if (eventType === "INSERT")
            setAppointments((p) =>
              [...p, newRow as AppWithService].sort((a, b) =>
                a.scheduled_at.localeCompare(b.scheduled_at),
              ),
            );
          if (eventType === "UPDATE") {
            setAppointments((p) =>
              p.map((a) =>
                a.id === (newRow as AppWithService).id
                  ? { ...a, ...(newRow as AppWithService) }
                  : a,
              ),
            );
            setSelectedAppt((p) =>
              p?.id === (newRow as AppWithService).id
                ? { ...p, ...(newRow as AppWithService) }
                : p,
            );
          }
          if (eventType === "DELETE")
            setAppointments((p) =>
              p.filter((a) => a.id !== (oldRow as Partial<AppWithService>).id),
            );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [business]);

  const today = startOfDay(new Date());

  // Derived data
  const todayAppts = appointments.filter((a) =>
    isSameDay(new Date(a.scheduled_at), today),
  );
  const upcomingAppts = appointments.filter((a) => {
    const d = new Date(a.scheduled_at);
    return (
      d > new Date() &&
      !isSameDay(d, today) &&
      !["cancelled", "no_show"].includes(a.status)
    );
  });
  const selectedAppts = appointments.filter((a) =>
    isSameDay(new Date(a.scheduled_at), selectedDate),
  );

  // Stats
  const todayConfirmed = todayAppts.filter(
    (a) => a.status === "confirmed",
  ).length;
  const todayPending = todayAppts.filter((a) => a.status === "pending").length;
  const todayCompleted = todayAppts.filter(
    (a) => a.status === "completed",
  ).length;
  const todayUnpaid = todayAppts.filter(
    (a) => a.payment_status === "unpaid" || a.payment_status === "partial",
  ).length;

  // Calendar helpers
  const firstDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  );
  const lastDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  );
  const startPad = firstDay.getDay();
  const calDays: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from(
      { length: lastDay.getDate() },
      (_, i) =>
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1),
    ),
  ];

  const apptCountForDay = (d: Date) =>
    appointments.filter(
      (a) =>
        isSameDay(new Date(a.scheduled_at), d) &&
        !["cancelled"].includes(a.status),
    ).length;

  const handleStatusChange = async (apptId: string, status: string) => {
    await fetch("/api/appointments/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: apptId, status }),
    });
  };

  const handlePayment = async (
    apptId: string,
    paymentStatus: string,
    amountPaid?: number,
    totalAmount?: number,
    method?: string,
  ) => {
    setPaymentUpdating(true);
    try {
      await fetch("/api/appointments/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: apptId,
          paymentStatus,
          amountPaid,
          totalAmount,
          method,
        }),
      });
      setCashInput("");
      setPartialInput("");
      setShowCashInput(false);
      setShowPartialInput(false);
    } finally {
      setPaymentUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl animate-pulse"
            style={{ background: "rgba(13,115,119,0.07)" }}
          />
        ))}
      </div>
    );

  return (
    <div className="space-y-5">
      {/* ── Today stats bar ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Today's Total",
            value: todayAppts.length,
            color: "#0d7377",
            bg: "rgba(13,115,119,0.08)",
            icon: <CalendarDays className="w-4 h-4" />,
          },
          {
            label: "Confirmed",
            value: todayConfirmed,
            color: "#059669",
            bg: "rgba(5,150,105,0.08)",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            label: "Pending",
            value: todayPending,
            color: "#d97706",
            bg: "rgba(217,119,6,0.08)",
            icon: <AlertCircle className="w-4 h-4" />,
          },
          {
            label: "Unpaid Today",
            value: todayUnpaid,
            color: "#dc2626",
            bg: "rgba(220,38,38,0.07)",
            icon: <DollarSign className="w-4 h-4" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: s.bg, border: `1px solid ${s.color}22` }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.color}30`,
              }}
            >
              {s.icon}
            </div>
            <div>
              <p
                className="text-[22px] font-black leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] font-medium mt-0.5"
                style={{ color: "#64748b" }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Calendar ────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "#fff",
            border: "1px solid rgba(13,115,119,0.10)",
            boxShadow: "0 2px 16px rgba(13,115,119,0.06)",
          }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-bold" style={{ color: "#0a2e30" }}>
              {formatMonthYear(calendarMonth)}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setCalendarMonth(
                    (d) => new Date(d.getFullYear(), d.getMonth() - 1),
                  )
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                style={{
                  background: "rgba(13,115,119,0.08)",
                  color: "#0d7377",
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setCalendarMonth(new Date());
                  setSelectedDate(today);
                }}
                className="px-2 h-7 rounded-lg text-[11px] font-semibold transition-colors"
                style={{
                  background: "rgba(13,115,119,0.08)",
                  color: "#0d7377",
                }}
              >
                Today
              </button>
              <button
                onClick={() =>
                  setCalendarMonth(
                    (d) => new Date(d.getFullYear(), d.getMonth() + 1),
                  )
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                style={{
                  background: "rgba(13,115,119,0.08)",
                  color: "#0d7377",
                }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold uppercase tracking-wider py-1"
                style={{ color: "#94a3b8" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {calDays.map((d, i) => {
              if (!d) return <div key={`pad-${i}`} />;
              const isToday = isSameDay(d, today);
              const isSelected = isSameDay(d, selectedDate);
              const count = apptCountForDay(d);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(startOfDay(d))}
                  className="relative flex flex-col items-center py-1 rounded-xl transition-all"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg,#0d7377,#0a3d40)"
                      : isToday
                        ? "rgba(13,115,119,0.10)"
                        : "transparent",
                    color: isSelected
                      ? "#fff"
                      : isToday
                        ? "#0d7377"
                        : "#334155",
                  }}
                >
                  <span className="text-[12px] font-semibold">
                    {d.getDate()}
                  </span>
                  {count > 0 && (
                    <span
                      className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: isSelected
                          ? "rgba(255,255,255,0.7)"
                          : "#0d7377",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mini legend */}
          <div
            className="flex items-center gap-3 pt-2"
            style={{ borderTop: "1px solid rgba(13,115,119,0.08)" }}
          >
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#0d7377" }}
              />
              <span className="text-[10px]" style={{ color: "#64748b" }}>
                Has appointments
              </span>
            </div>
          </div>
        </div>

        {/* ── Selected day appointments ─────────────────────────── */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid rgba(13,115,119,0.10)",
            boxShadow: "0 2px 16px rgba(13,115,119,0.06)",
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              borderBottom: "1px solid rgba(13,115,119,0.08)",
              background: "rgba(13,115,119,0.02)",
            }}
          >
            <div>
              <p className="text-[14px] font-bold" style={{ color: "#0a2e30" }}>
                {isSameDay(selectedDate, today)
                  ? "Today's Schedule"
                  : formatShortDate(selectedDate)}
              </p>
              <p className="text-[11px]" style={{ color: "#64748b" }}>
                {selectedAppts.length} appointment
                {selectedAppts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(13,115,119,0.07)",
                  color: "#0d7377",
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(13,115,119,0.07)",
                  color: "#0d7377",
                }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
            {selectedAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <CalendarDays
                  className="w-10 h-10"
                  style={{ color: "rgba(13,115,119,0.20)" }}
                />
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "#94a3b8" }}
                >
                  No appointments
                </p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "rgba(13,115,119,0.07)" }}
              >
                {selectedAppts.map((appt, i) => {
                  const sc = STATUS_COLOR[appt.status] ?? STATUS_COLOR.pending;
                  return (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[rgba(13,115,119,0.02)]"
                      onClick={() => {
                        setSelectedAppt(appt);
                        setShowCashInput(false);
                        setShowPartialInput(false);
                        setCashInput("");
                        setPartialInput("");
                      }}
                    >
                      {/* Time block */}
                      <div className="flex-shrink-0 w-14 text-center">
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "#0d7377" }}
                        >
                          {formatTime(appt.scheduled_at)}
                        </p>
                        <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                          {appt.duration_minutes}m
                        </p>
                      </div>
                      {/* Status line */}
                      <div className="flex-shrink-0 flex flex-col items-center pt-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: sc.color }}
                        />
                        <div
                          className="w-px flex-1 mt-1"
                          style={{
                            background: "rgba(13,115,119,0.12)",
                            minHeight: 24,
                          }}
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: "#0a2e30" }}
                          >
                            {appt.customer_name}
                          </p>
                          <StatusBadge status={appt.status} />
                        </div>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: "#64748b" }}
                        >
                          {appt.service?.name || "General"}
                          {appt.customer_phone && (
                            <span> · {appt.customer_phone}</span>
                          )}
                        </p>
                        <div className="mt-1.5">
                          <PaymentBadge appt={appt} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Upcoming appointments ────────────────────────────────── */}
      {upcomingAppts.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid rgba(13,115,119,0.10)",
            boxShadow: "0 2px 16px rgba(13,115,119,0.06)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{
              borderBottom: "1px solid rgba(13,115,119,0.08)",
              background: "rgba(13,115,119,0.02)",
            }}
          >
            <p className="text-[14px] font-bold" style={{ color: "#0a2e30" }}>
              Upcoming · Next 30 Days
            </p>
            <p className="text-[11px]" style={{ color: "#64748b" }}>
              {
                upcomingAppts.filter((a) => {
                  const d = new Date(a.scheduled_at);
                  return d <= addDays(today, 30);
                }).length
              }{" "}
              scheduled
            </p>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: "rgba(13,115,119,0.07)" }}
          >
            {upcomingAppts
              .filter((a) => new Date(a.scheduled_at) <= addDays(today, 30))
              .slice(0, 15)
              .map((appt, i) => {
                const d = new Date(appt.scheduled_at);
                const sc = STATUS_COLOR[appt.status] ?? STATUS_COLOR.pending;
                return (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors hover:bg-[rgba(13,115,119,0.02)]"
                    onClick={() => {
                      setSelectedAppt(appt);
                      setShowCashInput(false);
                      setShowPartialInput(false);
                      setCashInput("");
                      setPartialInput("");
                    }}
                  >
                    {/* Date */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                      style={{
                        background: `${sc.color}12`,
                        border: `1px solid ${sc.color}22`,
                      }}
                    >
                      <span
                        className="text-[9px] font-bold uppercase"
                        style={{ color: sc.color }}
                      >
                        {d.toLocaleString("en-US", { month: "short" })}
                      </span>
                      <span
                        className="text-[15px] font-black leading-none"
                        style={{ color: sc.color }}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "#0a2e30" }}
                      >
                        {appt.customer_name}
                      </p>
                      <p className="text-[11px]" style={{ color: "#64748b" }}>
                        {formatTime(appt.scheduled_at)} ·{" "}
                        {appt.service?.name || "General"}
                        {appt.customer_phone && (
                          <span> · {appt.customer_phone}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PaymentBadge appt={appt} />
                      <StatusBadge status={appt.status} />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Appointment detail panel ─────────────────────────────── */}
      <AnimatePresence>
        {selectedAppt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{
                background: "rgba(10,46,48,0.35)",
                backdropFilter: "blur(2px)",
              }}
              onClick={() => setSelectedAppt(null)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full z-[61] overflow-y-auto"
              style={{
                width: 400,
                background: "#fff",
                boxShadow: "-4px 0 32px rgba(13,115,119,0.15)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
                style={{
                  background: "linear-gradient(135deg,#0a3d40,#0d7377)",
                }}
              >
                <div>
                  <p className="text-[15px] font-bold text-white">
                    {selectedAppt.customer_name}
                  </p>
                  <p className="text-[11px] text-white/60">
                    {formatTime(selectedAppt.scheduled_at)} ·{" "}
                    {selectedAppt.duration_minutes}m
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Status + payment */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={selectedAppt.status} />
                  <PaymentBadge appt={selectedAppt} />
                </div>

                {/* Patient info */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid rgba(13,115,119,0.10)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#0d7377" }}
                  >
                    Patient
                  </p>
                  <div className="flex items-center gap-2">
                    <User
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: "#0d7377" }}
                    />
                    <span className="text-[13px]" style={{ color: "#0a2e30" }}>
                      {selectedAppt.customer_name}
                    </span>
                  </div>
                  {selectedAppt.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#0d7377" }}
                      />
                      <span
                        className="text-[13px]"
                        style={{ color: "#0a2e30" }}
                      >
                        {selectedAppt.customer_phone}
                      </span>
                    </div>
                  )}
                  {selectedAppt.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#0d7377" }}
                      />
                      <span
                        className="text-[13px]"
                        style={{ color: "#0a2e30" }}
                      >
                        {selectedAppt.customer_email}
                      </span>
                    </div>
                  )}
                  {selectedAppt.insurance_provider && (
                    <div className="flex items-center gap-2">
                      <Shield
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#0d7377" }}
                      />
                      <span
                        className="text-[13px]"
                        style={{ color: "#0a2e30" }}
                      >
                        {selectedAppt.insurance_provider}
                        {selectedAppt.insurance_member_id &&
                          ` · ${selectedAppt.insurance_member_id}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Service */}
                {selectedAppt.service && (
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid rgba(13,115,119,0.10)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "#0d7377" }}
                    >
                      Service
                    </p>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "#0a2e30" }}
                    >
                      {selectedAppt.service.name}
                    </p>
                    {selectedAppt.service.price_min && (
                      <p className="text-[12px]" style={{ color: "#64748b" }}>
                        Price: ${selectedAppt.service.price_min}
                        {selectedAppt.service.price_max
                          ? ` – $${selectedAppt.service.price_max}`
                          : ""}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedAppt.notes && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid rgba(13,115,119,0.10)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: "#0d7377" }}
                    >
                      Notes
                    </p>
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{ color: "#334155" }}
                    >
                      {selectedAppt.notes}
                    </p>
                  </div>
                )}

                {/* Status actions */}
                {!["completed", "cancelled"].includes(selectedAppt.status) && (
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid rgba(13,115,119,0.10)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: "#0d7377" }}
                    >
                      Appointment Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppt.status === "pending" && (
                        <button
                          onClick={() =>
                            handleStatusChange(selectedAppt.id, "confirmed")
                          }
                          className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#059669,#047857)",
                          }}
                        >
                          ✓ Confirm
                        </button>
                      )}
                      {selectedAppt.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleStatusChange(selectedAppt.id, "completed")
                          }
                          className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#0d7377,#0a3d40)",
                          }}
                        >
                          Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleStatusChange(selectedAppt.id, "cancelled")
                        }
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                        style={{
                          background: "rgba(220,38,38,0.08)",
                          color: "#dc2626",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment management */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid rgba(13,115,119,0.10)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#0d7377" }}
                  >
                    Payment
                  </p>

                  {/* Amounts */}
                  {(selectedAppt.amount_paid ?? 0) > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="rounded-lg p-2 text-center"
                        style={{
                          background: "rgba(5,150,105,0.06)",
                          border: "1px solid rgba(5,150,105,0.12)",
                        }}
                      >
                        <p
                          className="text-[10px] font-semibold"
                          style={{ color: "#94a3b8" }}
                        >
                          Paid
                        </p>
                        <p
                          className="text-[15px] font-bold"
                          style={{ color: "#059669" }}
                        >
                          ${(selectedAppt.amount_paid ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div
                        className="rounded-lg p-2 text-center"
                        style={{
                          background: "rgba(217,119,6,0.06)",
                          border: "1px solid rgba(217,119,6,0.12)",
                        }}
                      >
                        <p
                          className="text-[10px] font-semibold"
                          style={{ color: "#94a3b8" }}
                        >
                          Remaining
                        </p>
                        <p
                          className="text-[15px] font-bold"
                          style={{ color: "#d97706" }}
                        >
                          ${(selectedAppt.amount_remaining ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* {selectedAppt.payment_tx_hash && (
                    <p className="text-[10px] font-mono break-all" style={{ color: '#0d7377' }}>USDC: {selectedAppt.payment_tx_hash}</p>
                  )} */}

                  {/* Cash paid button */}
                  {selectedAppt.payment_status !== "paid" &&
                    selectedAppt.payment_status !== "cash" &&
                    selectedAppt.payment_status !== "refunded" && (
                      <div className="space-y-2">
                        {!showCashInput ? (
                          <button
                            onClick={() => {
                              setShowCashInput(true);
                              setShowPartialInput(false);
                            }}
                            disabled={paymentUpdating}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold"
                            style={{
                              background: "rgba(5,150,105,0.08)",
                              color: "#059669",
                              border: "1px solid rgba(5,150,105,0.18)",
                            }}
                          >
                            <Banknote className="w-3.5 h-3.5" /> Mark as Cash
                            Paid
                          </button>
                        ) : (
                          <div
                            className="space-y-2 rounded-lg p-3"
                            style={{
                              background: "rgba(5,150,105,0.05)",
                              border: "1px solid rgba(5,150,105,0.18)",
                            }}
                          >
                            <p
                              className="text-[11px] font-semibold"
                              style={{ color: "#059669" }}
                            >
                              Cash amount received
                              {selectedAppt.payment_amount ? (
                                <span
                                  style={{ color: "#94a3b8", fontWeight: 400 }}
                                >
                                  {" "}
                                  (total: ${selectedAppt.payment_amount})
                                </span>
                              ) : (
                                ""
                              )}
                            </p>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={cashInput}
                              onChange={(e) => setCashInput(e.target.value)}
                              placeholder={
                                selectedAppt.payment_amount
                                  ? `$${selectedAppt.payment_amount}`
                                  : "0.00"
                              }
                              className="w-full px-3 py-1.5 rounded-lg text-[12px] outline-none"
                              style={{
                                background: "#fff",
                                border: "1px solid rgba(5,150,105,0.25)",
                                color: "#0a2e30",
                              }}
                            />
                            {cashInput &&
                              selectedAppt.payment_amount &&
                              parseFloat(cashInput) <
                                selectedAppt.payment_amount && (
                                <p
                                  className="text-[11px] font-medium"
                                  style={{ color: "#d97706" }}
                                >
                                  Remaining: $
                                  {(
                                    selectedAppt.payment_amount -
                                    parseFloat(cashInput)
                                  ).toFixed(2)}
                                </p>
                              )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const paid = parseFloat(cashInput) || 0;
                                  const total =
                                    selectedAppt.payment_amount ?? undefined;
                                  const isFull =
                                    total !== undefined && paid >= total;
                                  handlePayment(
                                    selectedAppt.id,
                                    isFull ? "cash" : "partial",
                                    paid,
                                    total,
                                    "cash",
                                  );
                                }}
                                disabled={paymentUpdating || !cashInput}
                                className="flex-1 py-1.5 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                                style={{ background: "#059669" }}
                              >
                                {paymentUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Confirm
                              </button>
                              <button
                                onClick={() => setShowCashInput(false)}
                                className="px-3 py-1.5 rounded-lg text-[12px]"
                                style={{
                                  background: "rgba(5,150,105,0.08)",
                                  color: "#059669",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {!showPartialInput ? (
                          <button
                            onClick={() => {
                              setShowPartialInput(true);
                              setShowCashInput(false);
                            }}
                            disabled={paymentUpdating}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold"
                            style={{
                              background: "rgba(217,119,6,0.08)",
                              color: "#d97706",
                              border: "1px solid rgba(217,119,6,0.18)",
                            }}
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Record
                            Partial Payment
                          </button>
                        ) : (
                          <div
                            className="space-y-2 rounded-lg p-3"
                            style={{
                              background: "rgba(217,119,6,0.05)",
                              border: "1px solid rgba(217,119,6,0.18)",
                            }}
                          >
                            <p
                              className="text-[11px] font-semibold"
                              style={{ color: "#d97706" }}
                            >
                              Amount received now
                              {selectedAppt.payment_amount ? (
                                <span
                                  style={{ color: "#94a3b8", fontWeight: 400 }}
                                >
                                  {" "}
                                  (total: ${selectedAppt.payment_amount})
                                </span>
                              ) : (
                                ""
                              )}
                            </p>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={partialInput}
                              onChange={(e) => setPartialInput(e.target.value)}
                              placeholder="Amount received..."
                              className="w-full px-3 py-1.5 rounded-lg text-[12px] outline-none"
                              style={{
                                background: "#fff",
                                border: "1px solid rgba(217,119,6,0.25)",
                                color: "#0a2e30",
                              }}
                            />
                            {partialInput && selectedAppt.payment_amount && (
                              <p
                                className="text-[11px] font-medium"
                                style={{ color: "#d97706" }}
                              >
                                Remaining after this: $
                                {Math.max(
                                  0,
                                  selectedAppt.payment_amount -
                                    (selectedAppt.amount_paid ?? 0) -
                                    parseFloat(partialInput),
                                ).toFixed(2)}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handlePayment(
                                    selectedAppt.id,
                                    "partial",
                                    (selectedAppt.amount_paid ?? 0) +
                                      (parseFloat(partialInput) || 0),
                                    selectedAppt.payment_amount ?? undefined,
                                    "partial",
                                  )
                                }
                                disabled={paymentUpdating || !partialInput}
                                className="flex-1 py-1.5 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                                style={{ background: "#d97706" }}
                              >
                                {paymentUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <DollarSign className="w-3 h-3" />
                                )}
                                Save
                              </button>
                              <button
                                onClick={() => setShowPartialInput(false)}
                                className="px-3 py-1.5 rounded-lg text-[12px]"
                                style={{
                                  background: "rgba(217,119,6,0.08)",
                                  color: "#d97706",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Refund */}
                  {(selectedAppt.payment_status === "paid" ||
                    selectedAppt.payment_status === "cash" ||
                    selectedAppt.payment_status === "partial") && (
                    <button
                      onClick={() => handlePayment(selectedAppt.id, "refunded")}
                      disabled={paymentUpdating}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        color: "#6366f1",
                        border: "1px solid rgba(99,102,241,0.18)",
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Issue Refund
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
