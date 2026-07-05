"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { APPOINTMENT_STATUSES } from "@/constants";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { createAppointment, getAppointments } from "@/services/appointments";
import { getServices } from "@/services/services";
import { useBusinessStore } from "@/store/business";
import type { Appointment, Service } from "@/types";
import { appointmentSchema, type AppointmentFormData } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Bell,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  User,
  X,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const PAGE_SIZE = 20;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-2"
        style={{ color: "#0d7377" }}
      >
        {title}
      </p>
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "#f8fafc",
          border: "1px solid rgba(13,115,119,0.10)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-shrink-0" style={{ color: "#0d7377" }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
        <p className="text-[13px]" style={{ color: "#0a2e30" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  label: string;
  time: Date;
  type: "new" | "status" | "payment";
}

export default function AppointmentsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [cashAmountInput, setCashAmountInput] = useState("");
  const [partialAmountInput, setPartialAmountInput] = useState("");
  const [showCashInput, setShowCashInput] = useState(false);
  const [showPartialInput, setShowPartialInput] = useState(false);
  const realtimeRef = useRef<ReturnType<typeof createClient> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { status: "pending", duration_minutes: 60 },
  });

  const load = useCallback(async () => {
    if (!business) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, count } = await getAppointments(business.id, {
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setAppointments(data);
      setTotal(count);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, statusFilter, page]);

  useEffect(() => {
    if (business) {
      getServices(business.id)
        .then(setServices)
        .catch(() => {});
    }
  }, [business]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!business) return;

    const supabase = createClient();
    realtimeRef.current = supabase;

    const channel = supabase
      .channel(`appointments:${business.id}`)
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

          if (eventType === "INSERT") {
            const appt = newRow as Appointment;
            setAppointments((prev) => {
              if (prev.some((a) => a.id === appt.id)) return prev;
              return [appt, ...prev];
            });
            setTotal((t) => t + 1);
            setActivity((prev) =>
              [
                {
                  id: `${appt.id}-new`,
                  label: `New booking: ${appt.customer_name}`,
                  time: new Date(),
                  type: "new" as const,
                },
                ...prev,
              ].slice(0, 20),
            );
            toast.success("New appointment booked", appt.customer_name);
          }

          if (eventType === "UPDATE") {
            const appt = newRow as Appointment;
            setAppointments((prev) =>
              prev.map((a) => (a.id === appt.id ? { ...a, ...appt } : a)),
            );

            const old = oldRow as Partial<Appointment>;
            if (old.status !== appt.status) {
              setActivity((prev) =>
                [
                  {
                    id: `${appt.id}-${appt.status}-${Date.now()}`,
                    label: `${appt.customer_name} → ${appt.status}`,
                    time: new Date(),
                    type: "status" as const,
                  },
                  ...prev,
                ].slice(0, 20),
              );
            }
            if (
              old.payment_status !== appt.payment_status &&
              appt.payment_status === "paid"
            ) {
              setActivity((prev) =>
                [
                  {
                    id: `${appt.id}-paid-${Date.now()}`,
                    label: `Payment received: ${appt.customer_name}`,
                    time: new Date(),
                    type: "payment" as const,
                  },
                  ...prev,
                ].slice(0, 20),
              );
            }
          }

          if (eventType === "DELETE") {
            const id = (oldRow as Partial<Appointment>).id;
            if (id) {
              setAppointments((prev) => prev.filter((a) => a.id !== id));
              setTotal((t) => Math.max(0, t - 1));
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!business) return;
    try {
      const created = await createAppointment(business.id, data);
      setAppointments((prev) => [created, ...prev]);
      setModalOpen(false);
      reset();
      toast.success("Appointment booked");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to book appointment", msg);
    }
  };

  // Status change: calls the new API that sends emails + notifications
  const handleStatusChange = async (apptId: string, status: string) => {
    setUpdatingId(apptId);
    try {
      const res = await fetch("/api/appointments/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: apptId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Real-time subscription will update the row automatically
      const { patient_email_sent } = await res.json();
      const appt = appointments.find((a) => a.id === apptId);
      toast.success(
        `Status updated to ${status}`,
        appt?.customer_email && patient_email_sent
          ? `Email sent to ${appt.customer_email}`
          : undefined,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to update status", msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReschedule = async (apptId: string) => {
    if (!newDateTime) return;
    setRescheduling(true);
    try {
      const res = await fetch("/api/appointments/reschedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: apptId,
          newScheduledAt: new Date(newDateTime).toISOString(),
          requestedBy: "owner",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Could not reschedule", json.error);
        return;
      }
      toast.success("Appointment rescheduled", json.message);
      setReschedulingId(null);
      setNewDateTime("");
    } catch {
      toast.error("Failed to reschedule");
    } finally {
      setRescheduling(false);
    }
  };

  const handlePaymentUpdate = async (
    apptId: string,
    paymentStatus: string,
    amountPaid?: number,
    totalAmount?: number,
    method?: string,
  ) => {
    setPaymentUpdating(true);
    try {
      const res = await fetch("/api/appointments/payment", {
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
      if (!res.ok) throw new Error("Failed to update payment");
      const patch: Partial<Appointment> = {
        payment_status: paymentStatus as Appointment["payment_status"],
        ...(amountPaid !== undefined ? { amount_paid: amountPaid } : {}),
        ...(totalAmount !== undefined
          ? { amount_remaining: Math.max(0, totalAmount - (amountPaid ?? 0)) }
          : {}),
        ...(method
          ? { payment_method: method as Appointment["payment_method"] }
          : {}),
      };
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, ...patch } : a)),
      );
      setDetailAppt((prev) => (prev ? { ...prev, ...patch } : prev));
      setCashAmountInput("");
      setPartialAmountInput("");
      setShowCashInput(false);
      setShowPartialInput(false);
      toast.success("Payment status updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to update payment", msg);
    } finally {
      setPaymentUpdating(false);
    }
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      !search ||
      a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.customer_phone && a.customer_phone.includes(search)) ||
      (a.customer_email &&
        a.customer_email.toLowerCase().includes(search.toLowerCase())),
  );

  const activityIcon = (type: ActivityItem["type"]) => {
    if (type === "new")
      return <Bell className="w-3 h-3" style={{ color: "#0d7377" }} />;
    if (type === "payment")
      return <CreditCard className="w-3 h-3" style={{ color: "#059669" }} />;
    return <RefreshCw className="w-3 h-3" style={{ color: "#6366f1" }} />;
  };

  return (
    <div className="space-y-5">
      {/* ── Live Activity Feed ──────────────────────────────────────── */}
      <AnimatePresence>
        {activity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl px-4 py-3 flex items-center gap-3 overflow-hidden"
            style={{
              background: "rgba(13,115,119,0.05)",
              border: "1px solid rgba(13,115,119,0.14)",
            }}
          >
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: "#0d7377" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#0d7377" }}
              >
                Live
              </span>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto flex-1 scrollbar-hide">
              {activity.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 flex-shrink-0"
                >
                  {activityIcon(item.type)}
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--text-2)" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-4)" }}
                  >
                    {item.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Appointments Table ──────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Patient Appointments"
          description={`${total} total · updates in real time`}
          icon={<Calendar className="w-4 h-4" />}
          action={
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                reset();
                setModalOpen(true);
              }}
            >
              New Appointment
            </Button>
          }
        />

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-44">
            <Select
              options={[
                { value: "", label: "All Statuses" },
                ...APPOINTMENT_STATUSES.map((s) => ({
                  value: s.value,
                  label: s.label,
                })),
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ background: "rgba(13,115,119,0.06)" }}
              />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-5 h-5" />}
            title="No appointments found"
            description="Patient appointments booked through AI calls will appear here in real time"
            action={{
              label: "Book Appointment",
              onClick: () => setModalOpen(true),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableHeader>Patient</TableHeader>
                <TableHeader>Insurance / DOB</TableHeader>
                <TableHeader>Service</TableHeader>
                <TableHeader>Scheduled</TableHeader>
                <TableHeader>Payment</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableHead>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredAppointments.map((appt) => (
                    <motion.tr
                      key={appt.id}
                      layout
                      initial={{
                        opacity: 0,
                        backgroundColor: "rgba(13,115,119,0.08)",
                      }}
                      animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        borderBottom: "1px solid rgba(13,115,119,0.07)",
                      }}
                    >
                      <TableCell>
                        <div
                          className="font-medium"
                          style={{ color: "var(--text-1)" }}
                        >
                          {appt.customer_name}
                        </div>
                        <div
                          className="text-[11px]"
                          style={{ color: "var(--text-3)" }}
                        >
                          {appt.customer_phone}
                          {appt.customer_email && (
                            <span className="ml-1">
                              · {appt.customer_email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="text-[12px]"
                          style={{ color: "var(--text-2)" }}
                        >
                          {appt.date_of_birth && (
                            <div>DOB: {appt.date_of_birth}</div>
                          )}
                          {appt.insurance_provider && (
                            <div>{appt.insurance_provider}</div>
                          )}
                          {appt.insurance_member_id && (
                            <div
                              className="text-[11px]"
                              style={{ color: "var(--text-4)" }}
                            >
                              ID: {appt.insurance_member_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-2)" }}
                        >
                          {(appt as Appointment & { service?: Service }).service
                            ?.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-3)" }}
                        >
                          {formatDateTime(appt.scheduled_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background:
                              appt.payment_status === "paid" ||
                              appt.payment_status === "cash"
                                ? "rgba(5,150,105,0.10)"
                                : appt.payment_status === "partial"
                                  ? "rgba(217,119,6,0.10)"
                                  : appt.payment_status === "refunded"
                                    ? "rgba(99,102,241,0.10)"
                                    : "rgba(13,115,119,0.07)",
                            color:
                              appt.payment_status === "paid" ||
                              appt.payment_status === "cash"
                                ? "#059669"
                                : appt.payment_status === "partial"
                                  ? "#d97706"
                                  : appt.payment_status === "refunded"
                                    ? "#6366f1"
                                    : "var(--text-3)",
                          }}
                        >
                          {appt.payment_status === "paid"
                            ? "✓ Paid (Stripe)"
                            : appt.payment_status === "cash"
                              ? "✓ Paid (Cash)"
                              : appt.payment_status === "partial"
                                ? "⬤ Partial"
                                : appt.payment_status === "refunded"
                                  ? "Refunded"
                                  : "Unpaid"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={appt.status} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            {/* Quick action buttons */}
                            {appt.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(appt.id, "confirmed")
                                  }
                                  disabled={updatingId === appt.id}
                                  title="Approve"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:scale-105"
                                  style={{
                                    background: "rgba(5,150,105,0.10)",
                                    color: "#059669",
                                  }}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(appt.id, "cancelled")
                                  }
                                  disabled={updatingId === appt.id}
                                  title="Cancel"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:scale-105"
                                  style={{
                                    background: "rgba(220,38,38,0.08)",
                                    color: "#dc2626",
                                  }}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {appt.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(appt.id, "completed")
                                }
                                disabled={updatingId === appt.id}
                                title="Mark complete"
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:scale-105"
                                style={{
                                  background: "rgba(13,115,119,0.08)",
                                  color: "#0d7377",
                                }}
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* Reschedule button */}
                            {!["completed", "cancelled", "no_show"].includes(
                              appt.status,
                            ) && (
                              <button
                                onClick={() => {
                                  setReschedulingId(
                                    reschedulingId === appt.id ? null : appt.id,
                                  );
                                  setNewDateTime("");
                                }}
                                title="Reschedule"
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:scale-105"
                                style={{
                                  background: "rgba(99,102,241,0.09)",
                                  color: "#6366f1",
                                }}
                              >
                                <CalendarClock className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* View detail button */}
                            <button
                              onClick={() => {
                                setDetailAppt(appt);
                                setShowCashInput(false);
                                setShowPartialInput(false);
                                setCashAmountInput("");
                                setPartialAmountInput("");
                              }}
                              title="View details"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:scale-105"
                              style={{
                                background: "rgba(13,115,119,0.08)",
                                color: "#0d7377",
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* Full status dropdown */}
                            <Select
                              options={APPOINTMENT_STATUSES.map((s) => ({
                                value: s.value,
                                label: s.label,
                              }))}
                              value={appt.status}
                              onChange={(e) =>
                                handleStatusChange(appt.id, e.target.value)
                              }
                              className="text-[11px] py-1 w-28"
                            />
                          </div>

                          {/* Inline reschedule picker */}
                          <AnimatePresence>
                            {reschedulingId === appt.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center gap-1.5 pt-1">
                                  <input
                                    type="datetime-local"
                                    value={newDateTime}
                                    onChange={(e) =>
                                      setNewDateTime(e.target.value)
                                    }
                                    className="text-[11px] px-2 py-1 rounded-lg outline-none flex-1"
                                    style={{
                                      background: "#f8fafa",
                                      border: "1px solid rgba(99,102,241,0.25)",
                                      color: "#0a2e30",
                                    }}
                                  />
                                  <button
                                    onClick={() => handleReschedule(appt.id)}
                                    disabled={rescheduling || !newDateTime}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1 disabled:opacity-50"
                                    style={{ background: "#6366f1" }}
                                  >
                                    {rescheduling ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CalendarClock className="w-3 h-3" />
                                    )}
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReschedulingId(null);
                                      setNewDateTime("");
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-medium"
                                    style={{
                                      background: "rgba(99,102,241,0.08)",
                                      color: "#6366f1",
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {total > PAGE_SIZE && (
              <div
                className="flex items-center justify-between mt-4 pt-4"
                style={{ borderTop: "1px solid rgba(13,115,119,0.10)" }}
              >
                <span
                  className="text-[12px]"
                  style={{ color: "var(--text-3)" }}
                >
                  Showing {page * PAGE_SIZE + 1}–
                  {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={(page + 1) * PAGE_SIZE >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ── Appointment Detail Slide-over ──────────────────────────── */}
      <AnimatePresence>
        {detailAppt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(10,46,48,0.35)",
                backdropFilter: "blur(2px)",
              }}
              onClick={() => {
                setDetailAppt(null);
                setShowCashInput(false);
                setShowPartialInput(false);
              }}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full z-50 overflow-y-auto"
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
                  <p className="text-[16px] font-bold text-white">
                    Appointment Details
                  </p>
                  <p className="text-[11px] text-white/60">
                    ID: {detailAppt.id.slice(0, 8)}…
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDetailAppt(null);
                    setShowCashInput(false);
                    setShowPartialInput(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <StatusBadge status={detailAppt.status} />
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background:
                        detailAppt.payment_status === "paid" ||
                        detailAppt.payment_status === "cash"
                          ? "rgba(5,150,105,0.10)"
                          : detailAppt.payment_status === "partial"
                            ? "rgba(217,119,6,0.10)"
                            : detailAppt.payment_status === "refunded"
                              ? "rgba(99,102,241,0.10)"
                              : "rgba(13,115,119,0.07)",
                      color:
                        detailAppt.payment_status === "paid" ||
                        detailAppt.payment_status === "cash"
                          ? "#059669"
                          : detailAppt.payment_status === "partial"
                            ? "#d97706"
                            : detailAppt.payment_status === "refunded"
                              ? "#6366f1"
                              : "#64748b",
                    }}
                  >
                    {detailAppt.payment_status === "paid"
                      ? "✓ Paid (Stripe)"
                      : detailAppt.payment_status === "cash"
                        ? "✓ Paid (Cash)"
                        : detailAppt.payment_status === "partial"
                          ? "⬤ Partial"
                          : detailAppt.payment_status === "refunded"
                            ? "Refunded"
                            : "Unpaid"}
                  </span>
                </div>

                {/* Patient info */}
                <Section title="Patient Information">
                  <DetailRow
                    icon={<User className="w-3.5 h-3.5" />}
                    label="Full Name"
                    value={detailAppt.customer_name}
                  />
                  {detailAppt.customer_phone && (
                    <DetailRow
                      icon={<Phone className="w-3.5 h-3.5" />}
                      label="Phone"
                      value={detailAppt.customer_phone}
                    />
                  )}
                  {detailAppt.customer_email && (
                    <DetailRow
                      icon={<Mail className="w-3.5 h-3.5" />}
                      label="Email"
                      value={detailAppt.customer_email}
                    />
                  )}
                  {detailAppt.date_of_birth && (
                    <DetailRow
                      icon={<Calendar className="w-3.5 h-3.5" />}
                      label="Date of Birth"
                      value={detailAppt.date_of_birth}
                    />
                  )}
                </Section>

                {/* Insurance */}
                {(detailAppt.insurance_provider ||
                  detailAppt.insurance_member_id) && (
                  <Section title="Insurance">
                    {detailAppt.insurance_provider && (
                      <DetailRow
                        icon={<Shield className="w-3.5 h-3.5" />}
                        label="Provider"
                        value={detailAppt.insurance_provider}
                      />
                    )}
                    {detailAppt.insurance_member_id && (
                      <DetailRow
                        icon={<Shield className="w-3.5 h-3.5" />}
                        label="Member ID"
                        value={detailAppt.insurance_member_id}
                      />
                    )}
                  </Section>
                )}

                {/* Appointment info */}
                <Section title="Appointment">
                  <DetailRow
                    icon={<Clock className="w-3.5 h-3.5" />}
                    label="Scheduled"
                    value={formatDateTime(detailAppt.scheduled_at)}
                  />
                  <DetailRow
                    icon={<Clock className="w-3.5 h-3.5" />}
                    label="Duration"
                    value={`${detailAppt.duration_minutes} minutes`}
                  />
                  {(detailAppt as Appointment & { service?: Service }).service
                    ?.name && (
                    <DetailRow
                      icon={<FileText className="w-3.5 h-3.5" />}
                      label="Service"
                      value={
                        (detailAppt as Appointment & { service?: Service })
                          .service!.name
                      }
                    />
                  )}
                </Section>

                {/* Notes */}
                {detailAppt.notes && (
                  <Section title="Notes">
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{ color: "#334155" }}
                    >
                      {detailAppt.notes}
                    </p>
                  </Section>
                )}

                {/* Payment Management */}
                <Section title="Payment Management">
                  {/* Current amounts if any */}
                  {(detailAppt.amount_paid ?? 0) > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-1">
                      <div
                        className="rounded-lg p-2 text-center"
                        style={{
                          background: "rgba(5,150,105,0.06)",
                          border: "1px solid rgba(5,150,105,0.12)",
                        }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wide"
                          style={{ color: "#94a3b8" }}
                        >
                          Paid
                        </p>
                        <p
                          className="text-[15px] font-bold"
                          style={{ color: "#059669" }}
                        >
                          ${detailAppt.amount_paid?.toFixed(2) ?? "0.00"}
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
                          className="text-[10px] font-semibold uppercase tracking-wide"
                          style={{ color: "#94a3b8" }}
                        >
                          Remaining
                        </p>
                        <p
                          className="text-[15px] font-bold"
                          style={{ color: "#d97706" }}
                        >
                          ${detailAppt.amount_remaining?.toFixed(2) ?? "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* {detailAppt.payment_tx_hash && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>USDC Tx Hash</p>
                      <p className="text-[11px] break-all font-mono" style={{ color: '#0d7377' }}>{detailAppt.payment_tx_hash}</p>
                    </div>
                  )} */}

                  {/* Payment action buttons */}
                  {detailAppt.payment_status !== "paid" &&
                    detailAppt.payment_status !== "cash" &&
                    detailAppt.payment_status !== "refunded" && (
                      <div className="space-y-2">
                        {/* Mark as Cash Paid */}
                        {!showCashInput ? (
                          <button
                            onClick={() => {
                              setShowCashInput(true);
                              setShowPartialInput(false);
                              setCashAmountInput("");
                            }}
                            disabled={paymentUpdating}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
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
                            className="rounded-lg p-3 space-y-2"
                            style={{
                              background: "rgba(5,150,105,0.05)",
                              border: "1px solid rgba(5,150,105,0.18)",
                            }}
                          >
                            <p
                              className="text-[11px] font-semibold"
                              style={{ color: "#059669" }}
                            >
                              Cash payment amount
                            </p>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder={
                                detailAppt.payment_amount
                                  ? `Total: $${detailAppt.payment_amount}`
                                  : "Enter amount paid..."
                              }
                              value={cashAmountInput}
                              onChange={(e) =>
                                setCashAmountInput(e.target.value)
                              }
                              className="w-full px-3 py-1.5 rounded-lg text-[12px] outline-none"
                              style={{
                                background: "#fff",
                                border: "1px solid rgba(5,150,105,0.25)",
                                color: "#0a2e30",
                              }}
                            />
                            {/* Show remaining if partial */}
                            {cashAmountInput &&
                              detailAppt.payment_amount &&
                              parseFloat(cashAmountInput) <
                                detailAppt.payment_amount && (
                                <p
                                  className="text-[11px] font-medium"
                                  style={{ color: "#d97706" }}
                                >
                                  Remaining: $
                                  {(
                                    detailAppt.payment_amount -
                                    parseFloat(cashAmountInput)
                                  ).toFixed(2)}
                                </p>
                              )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const paid = cashAmountInput
                                    ? parseFloat(cashAmountInput)
                                    : undefined;
                                  const total =
                                    detailAppt.payment_amount ?? undefined;
                                  const isFull =
                                    paid !== undefined &&
                                    total !== undefined &&
                                    paid >= total;
                                  handlePaymentUpdate(
                                    detailAppt.id,
                                    isFull ? "cash" : "partial",
                                    paid,
                                    total,
                                    "cash",
                                  );
                                }}
                                disabled={paymentUpdating || !cashAmountInput}
                                className="flex-1 py-1.5 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                                style={{
                                  background: "#059669",
                                  opacity: paymentUpdating ? 0.7 : 1,
                                }}
                              >
                                {paymentUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Confirm Cash
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

                        {/* Record Partial Payment */}
                        {!showPartialInput ? (
                          <button
                            onClick={() => {
                              setShowPartialInput(true);
                              setShowCashInput(false);
                              setPartialAmountInput("");
                            }}
                            disabled={paymentUpdating}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
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
                            className="rounded-lg p-3 space-y-2"
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
                              {detailAppt.payment_amount ? (
                                <span
                                  style={{ color: "#94a3b8", fontWeight: 400 }}
                                >
                                  {" "}
                                  (total: ${detailAppt.payment_amount})
                                </span>
                              ) : (
                                ""
                              )}
                            </p>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Amount received..."
                              value={partialAmountInput}
                              onChange={(e) =>
                                setPartialAmountInput(e.target.value)
                              }
                              className="w-full px-3 py-1.5 rounded-lg text-[12px] outline-none"
                              style={{
                                background: "#fff",
                                border: "1px solid rgba(217,119,6,0.25)",
                                color: "#0a2e30",
                              }}
                            />
                            {partialAmountInput &&
                              detailAppt.payment_amount && (
                                <p
                                  className="text-[11px] font-medium"
                                  style={{ color: "#d97706" }}
                                >
                                  Remaining after this: $
                                  {Math.max(
                                    0,
                                    detailAppt.payment_amount -
                                      (detailAppt.amount_paid ?? 0) -
                                      parseFloat(partialAmountInput),
                                  ).toFixed(2)}
                                </p>
                              )}
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handlePaymentUpdate(
                                    detailAppt.id,
                                    "partial",
                                    (detailAppt.amount_paid ?? 0) +
                                      (parseFloat(partialAmountInput) || 0),
                                    detailAppt.payment_amount ?? undefined,
                                    "partial",
                                  )
                                }
                                disabled={
                                  paymentUpdating || !partialAmountInput
                                }
                                className="flex-1 py-1.5 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                                style={{
                                  background: "#d97706",
                                  opacity: paymentUpdating ? 0.7 : 1,
                                }}
                              >
                                {paymentUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <DollarSign className="w-3 h-3" />
                                )}
                                Save Partial
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

                        {/* Mark as Fully Paid (USDC already done) */}
                        {detailAppt.payment_tx_hash && (
                          <button
                            onClick={() =>
                              handlePaymentUpdate(
                                detailAppt.id,
                                "paid",
                                detailAppt.payment_amount ?? undefined,
                                undefined,
                                "stripe",
                              )
                            }
                            disabled={paymentUpdating}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
                            style={{
                              background: "rgba(13,115,119,0.08)",
                              color: "#0d7377",
                              border: "1px solid rgba(13,115,119,0.18)",
                            }}
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Mark as Paid
                            (Stripe)
                          </button>
                        )}
                      </div>
                    )}

                  {/* Refund button — for paid appointments */}
                  {(detailAppt.payment_status === "paid" ||
                    detailAppt.payment_status === "cash" ||
                    detailAppt.payment_status === "partial") && (
                    <button
                      onClick={() =>
                        handlePaymentUpdate(
                          detailAppt.id,
                          "refunded",
                          undefined,
                          undefined,
                          undefined,
                        )
                      }
                      disabled={paymentUpdating}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90 mt-1"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        color: "#6366f1",
                        border: "1px solid rgba(99,102,241,0.18)",
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Issue Refund
                    </button>
                  )}

                  {/* Reset to unpaid — for refunded */}
                  {detailAppt.payment_status === "refunded" && (
                    <button
                      onClick={() =>
                        handlePaymentUpdate(
                          detailAppt.id,
                          "unpaid",
                          0,
                          undefined,
                          undefined,
                        )
                      }
                      disabled={paymentUpdating}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
                      style={{
                        background: "rgba(13,115,119,0.07)",
                        color: "#0d7377",
                        border: "1px solid rgba(13,115,119,0.14)",
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset to Unpaid
                    </button>
                  )}
                </Section>

                {/* Quick status actions */}
                {!["completed", "cancelled"].includes(detailAppt.status) && (
                  <Section title="Quick Actions">
                    <div className="flex flex-wrap gap-2">
                      {detailAppt.status === "pending" && (
                        <button
                          onClick={() => {
                            handleStatusChange(detailAppt.id, "confirmed");
                            setDetailAppt((prev) =>
                              prev ? { ...prev, status: "confirmed" } : prev,
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#059669,#047857)",
                          }}
                        >
                          ✓ Approve
                        </button>
                      )}
                      {detailAppt.status === "confirmed" && (
                        <button
                          onClick={() => {
                            handleStatusChange(detailAppt.id, "completed");
                            setDetailAppt((prev) =>
                              prev ? { ...prev, status: "completed" } : prev,
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#0d7377,#0a3d40)",
                          }}
                        >
                          Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleStatusChange(detailAppt.id, "cancelled");
                          setDetailAppt((prev) =>
                            prev ? { ...prev, status: "cancelled" } : prev,
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                        style={{
                          background: "rgba(220,38,38,0.08)",
                          color: "#dc2626",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </Section>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Book Appointment Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Book Appointment"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              placeholder="Jane Smith"
              error={errors.customer_name?.message}
              required
              {...register("customer_name")}
            />
            <Input
              label="Phone Number"
              placeholder="(555) 000-0000"
              error={errors.customer_phone?.message}
              {...register("customer_phone")}
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="patient@email.com"
            error={errors.customer_email?.message}
            {...register("customer_email")}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              {...register("date_of_birth")}
            />
            <Input
              label="Insurance Provider"
              placeholder="Blue Cross, Aetna..."
              {...register("insurance_provider")}
            />
            <Input
              label="Member ID / Policy #"
              placeholder="Optional"
              {...register("insurance_member_id")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Service"
              options={[
                { value: "", label: "Select service" },
                ...services.map((s) => ({ value: s.id, label: s.name })),
              ]}
              {...register("service_id")}
            />
            <Input
              label="Date & Time"
              type="datetime-local"
              error={errors.scheduled_at?.message}
              required
              {...register("scheduled_at")}
            />
          </div>
          <Select
            label="Status"
            options={APPOINTMENT_STATUSES.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
            {...register("status")}
          />
          <Textarea
            label="Notes"
            rows={2}
            placeholder="Any notes..."
            {...register("notes")}
          />

          {/* Info banner about emails */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-[12px]"
            style={{
              background: "rgba(13,115,119,0.06)",
              border: "1px solid rgba(13,115,119,0.14)",
              color: "var(--text-2)",
            }}
          >
            <Bell
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
              style={{ color: "#0d7377" }}
            />
            <span>
              The patient will receive an email notification when their
              appointment status changes to <strong>Approved</strong> or{" "}
              <strong>Cancelled</strong>.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
