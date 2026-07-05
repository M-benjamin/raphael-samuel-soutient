"use client";

import type { Service } from "@/types";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BookingPanelProps {
  businessId: string | undefined;
  color: string;
}

type Step = 1 | 2 | 3 | 4;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatAMPM(dt: Date) {
  const h = dt.getHours(),
    m = dt.getMinutes();
  const ampm = h < 12 ? "AM" : "PM";
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${pad2(m)} ${ampm}`;
}

function displayTimeToKey(dateStr: string, displayTime: string) {
  const match = displayTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return `${dateStr}T00:00`;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
  return `${dateStr}T${pad2(h)}:${pad2(m)}`;
}

function getPriceStr(svc: Service): string {
  if (svc.price_type === "fixed" && svc.price_min != null)
    return `$${svc.price_min}`;
  if (
    svc.price_type === "range" &&
    svc.price_min != null &&
    svc.price_max != null
  )
    return `$${svc.price_min}–$${svc.price_max}`;
  if (svc.price_type === "starting_at" && svc.price_min != null)
    return `From $${svc.price_min}`;
  if (svc.price_type === "call_for_price") return "Call for price";
  return "";
}

function StepDots({ current, color }: { current: Step; color: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      {([1, 2, 3, 4] as Step[]).map((n) => (
        <div
          key={n}
          className="w-1.5 h-1.5 rounded-full transition-all"
          style={{
            background:
              n === current ? color : n < current ? `${color}80` : "#2a3f4d",
          }}
        />
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#e2e8f0",
  width: "100%",
  padding: "6px 9px",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 3,
  color: "#64748b",
};

const backBtnStyle: React.CSSProperties = {
  padding: "7px 18px",
  borderRadius: 9,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export function BookingPanel({ businessId, color }: BookingPanelProps) {
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimeKey, setSelectedTimeKey] = useState<string | null>(null);

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [closedDay, setClosedDay] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formInsurance, setFormInsurance] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/widget/config?businessId=${encodeURIComponent(businessId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {})
      .finally(() => setLoadingServices(false));
  }, [businessId]);

  useEffect(() => {
    if (step !== 3 || !selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    setClosedDay(false);
    fetch(
      `/api/widget/slots?businessId=${encodeURIComponent(businessId)}&date=${encodeURIComponent(selectedDate)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.closed) {
          setClosedDay(true);
          return;
        }
        setSlots(data.slots || []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [step, selectedDate, businessId]);

  // Calendar helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () =>
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  const nextMonth = () =>
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });

  let endTimeLabel = "";
  if (selectedTimeKey && selectedService?.duration_minutes) {
    const startDt = new Date(selectedTimeKey);
    const endDt = new Date(
      startDt.getTime() + selectedService.duration_minutes * 60000,
    );
    endTimeLabel = ` – ${formatAMPM(endDt)} (${selectedService.duration_minutes} mins)`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formDob || !selectedTimeKey) {
      setSubmitError(
        "Please fill in name, email, date of birth. Select a date and time.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: Record<string, unknown> = {
        customer_name: formName,
        customer_email: formEmail,
        date_of_birth: formDob,
        scheduled_at: new Date(selectedTimeKey + ":00").toISOString(),
        businessId,
      };
      if (formPhone) payload.customer_phone = formPhone;
      if (selectedService?.id) payload.service_id = selectedService.id;
      if (formNotes) payload.notes = formNotes;
      if (formInsurance) payload.insurance_provider = formInsurance;

      const res = await fetch("/api/appointments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stepHeader = (title: string, subtitle?: string) => (
    <div
      className="px-3.5 pt-3 pb-2"
      style={{ borderBottom: "1px solid rgba(128,128,128,0.12)" }}
    >
      <StepDots current={step} color={color} />
      <div className="text-[13px] font-bold" style={{ color: "#94a3b8" }}>
        {title}
      </div>
      {subtitle && (
        <div className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const stepNav = (
    onBack: (() => void) | null,
    onNext: (() => void) | null,
    nextDisabled?: boolean,
    isSubmit?: boolean,
  ) => (
    <div className="flex justify-between items-center px-3.5 pb-3 pt-2">
      {onBack ? (
        <button type="button" onClick={onBack} style={backBtnStyle}>
          Back
        </button>
      ) : (
        <div />
      )}
      {onNext !== null && (
        <button
          type={isSubmit ? "submit" : "button"}
          onClick={isSubmit ? undefined : onNext}
          disabled={nextDisabled || submitting}
          className="flex items-center gap-1.5 text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            padding: "7px 18px",
            borderRadius: 9,
            border: "none",
            background: color,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {isSubmit && submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Booking…
            </>
          ) : isSubmit ? (
            "Request Appointment"
          ) : (
            "Next"
          )}
        </button>
      )}
    </div>
  );

  // Step 1 — Service selection
  if (step === 1) {
    return (
      <div>
        {stepHeader("Select a Service")}
        <div
          className="flex flex-col gap-1.5 px-3.5 py-2 max-h-60 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {loadingServices ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "#475569" }}
              />
              <span className="text-[12px]" style={{ color: "#475569" }}>
                Loading…
              </span>
            </div>
          ) : services.length === 0 ? (
            <div
              className="text-center text-[12px] py-5"
              style={{ color: "#475569" }}
            >
              No services available. Please contact us directly.
            </div>
          ) : (
            services.map((svc) => {
              const priceStr = getPriceStr(svc);
              const durStr = svc.duration_minutes
                ? `${svc.duration_minutes} min`
                : "";
              const isSelected = selectedService?.id === svc.id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc)}
                  className="w-full text-left px-3 py-2.5 rounded-[10px] transition-all cursor-pointer"
                  style={{
                    background: isSelected
                      ? `${color}18`
                      : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${isSelected ? color : "rgba(255,255,255,0.09)"}`,
                  }}
                >
                  <div
                    className="text-[12px] font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {svc.name}
                  </div>
                  {(durStr || priceStr) && (
                    <div
                      className="flex items-center gap-1.5 mt-0.5 text-[11px]"
                      style={{ color: "#64748b" }}
                    >
                      {durStr && <span>{durStr}</span>}
                      {durStr && priceStr && (
                        <span style={{ opacity: 0.4 }}>·</span>
                      )}
                      {priceStr && <span>{priceStr}</span>}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
        {stepNav(null, () => setStep(2), !selectedService)}
      </div>
    );
  }

  // Step 2 — Calendar
  if (step === 2) {
    return (
      <div>
        {stepHeader("Pick a Date")}
        <div>
          <div className="flex items-center justify-between px-3.5 py-2">
            <button
              type="button"
              onClick={prevMonth}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
              style={{
                color: "#94a3b8",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              className="text-[12px] font-semibold"
              style={{ color: "#94a3b8" }}
            >
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
              style={{
                color: "#94a3b8",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-2.5 pb-1">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: "#475569" }}
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${pad2(calMonth + 1)}-${pad2(day)}`;
              const cellDate = new Date(calYear, calMonth, day);
              cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate < today;
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedTime(null);
                    setSelectedTimeKey(null);
                  }}
                  className="text-center text-[11px] font-medium py-1.5 rounded-md transition-all"
                  style={{
                    color: isPast ? "#2d3f4d" : isSelected ? "#fff" : "#94a3b8",
                    background: isSelected ? color : "transparent",
                    border: `1.5px solid ${isSelected ? color : "transparent"}`,
                    cursor: isPast ? "default" : "pointer",
                    opacity: isPast ? 0.35 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        {stepNav(
          () => setStep(1),
          () => {
            if (selectedDate) setStep(3);
          },
          !selectedDate,
        )}
      </div>
    );
  }

  // Step 3 — Time slots
  if (step === 3) {
    return (
      <div>
        {stepHeader(
          "Pick a Time",
          selectedDate ? formatDateLabel(selectedDate) : undefined,
        )}
        <div className="px-3.5 py-2 min-h-[120px]">
          {loadingSlots ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "#475569" }}
              />
              <span className="text-[12px]" style={{ color: "#475569" }}>
                Loading slots…
              </span>
            </div>
          ) : closedDay ? (
            <div
              className="text-center text-[12px] py-6"
              style={{ color: "#475569" }}
            >
              Closed on this day. Please pick another date.
            </div>
          ) : slots.length === 0 ? (
            <div
              className="text-center text-[12px] py-6"
              style={{ color: "#475569" }}
            >
              No available slots on this day.
            </div>
          ) : (
            <div
              className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {slots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setSelectedTimeKey(displayTimeToKey(selectedDate!, time));
                    }}
                    className="py-1.5 rounded-lg text-[11px] font-medium text-center transition-all"
                    style={{
                      background: isSelected ? color : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${isSelected ? color : "rgba(255,255,255,0.10)"}`,
                      color: isSelected ? "#fff" : "#94a3b8",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {stepNav(
          () => setStep(2),
          () => {
            if (selectedTime) setStep(4);
          },
          !selectedTime,
        )}
      </div>
    );
  }

  // Step 4 — Details form + success
  return (
    <div>
      {success ? (
        <div
          className="flex flex-col items-center justify-center py-10 px-5 gap-1.5 text-center"
          style={{ minHeight: 200 }}
        >
          <CheckCircle className="w-10 h-10 mb-1" style={{ color }} />
          <div className="text-[14px] font-bold" style={{ color: "#f1f5f9" }}>
            Appointment Requested!
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>
            We will confirm for
          </div>
          <div
            className="text-[13px] font-semibold"
            style={{ color: "#94a3b8" }}
          >
            {selectedDate ? formatDateLabel(selectedDate) : ""} at{" "}
            {selectedTime || ""}
            {endTimeLabel}
          </div>
          <div className="text-[10px] mt-1.5" style={{ color: "#334155" }}>
            Check your email for confirmation details.
          </div>
        </div>
      ) : (
        <>
          <div
            className="px-3.5 pt-3 pb-2"
            style={{ borderBottom: "1px solid rgba(128,128,128,0.12)" }}
          >
            <StepDots current={4} color={color} />
            <div
              className="text-[13px] font-bold mb-1.5"
              style={{ color: "#94a3b8" }}
            >
              Your Details
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedService && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#94a3b8",
                  }}
                >
                  {selectedService.name}
                </span>
              )}
              {selectedDate && selectedTime && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#94a3b8",
                  }}
                >
                  {formatDateLabel(selectedDate)} · {selectedTime}
                  {endTimeLabel}
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-1.5 px-3.5 py-2 max-h-[300px] overflow-y-auto"
            style={{ scrollbarWidth: "thin" }}
          >
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Jane Smith"
                required
                style={inputStyle}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <label style={labelStyle}>Email *</label>
                <input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  type="email"
                  placeholder="jane@example.com"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="flex-1 min-w-0">
                <label style={labelStyle}>Phone</label>
                <input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  type="tel"
                  placeholder="(555) 000-0000"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input
                value={formDob}
                onChange={(e) => setFormDob(e.target.value)}
                type="date"
                required
                style={
                  { ...inputStyle, colorScheme: "dark" } as React.CSSProperties
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Insurance Provider</label>
              <input
                value={formInsurance}
                onChange={(e) => setFormInsurance(e.target.value)}
                placeholder="Optional"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Any additional information…"
                rows={2}
                style={
                  {
                    ...inputStyle,
                    resize: "none",
                    lineHeight: 1.4,
                  } as React.CSSProperties
                }
              />
            </div>

            {submitError && (
              <div
                className="text-[11px] px-2 py-1.5 rounded-md"
                style={{
                  color: "#f87171",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {submitError}
              </div>
            )}

            <div className="flex justify-between items-center mt-1 mb-1">
              <button
                type="button"
                onClick={() => setStep(3)}
                style={backBtnStyle}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 text-white transition-opacity disabled:opacity-70"
                style={{
                  padding: "7px 18px",
                  borderRadius: 9,
                  border: "none",
                  background: color,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Booking…
                  </>
                ) : (
                  "Request Appointment"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
