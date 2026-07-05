"use client";

import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { getAgents } from "@/services/agents";
import { getAppointments } from "@/services/appointments";
import {
  getConversationTrend,
  getDashboardAnalytics,
} from "@/services/conversations";
import { useBusinessStore } from "@/store/business";
import type { Agent, Appointment, DashboardAnalytics } from "@/types";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  Code2,
  HeartPulse,
  MessageSquare,
  Mic,
  PhoneCall,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const { business, isLoading: businessLoading } = useBusinessStore();
  const toast = useToast();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [trend, setTrend] = useState<
    Array<{ date: string; conversations: number; appointments: number }>
  >([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    [],
  );
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const rtRef = useRef<ReturnType<typeof createClient> | null>(null);

  const loadData = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const [analyticsData, trendData, apptData, agentData] = await Promise.all(
        [
          getDashboardAnalytics(business.id),
          getConversationTrend(business.id, 14),
          getAppointments(business.id, { limit: 5 }),
          getAgents(business.id),
        ],
      );
      setAnalytics(analyticsData);
      setTrend(trendData);
      setRecentAppointments(apptData.data);
      setAgents(agentData);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (business) loadData();
    else if (!businessLoading) setLoading(false);
  }, [business, businessLoading]);

  // Real-time: update the recent appointments widget live
  useEffect(() => {
    if (!business) return;
    const supabase = createClient();
    rtRef.current = supabase;
    const channel = supabase
      .channel(`dash-appts:${business.id}`)
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
            setRecentAppointments((prev) =>
              [newRow as Appointment, ...prev].slice(0, 5),
            );
            setAnalytics((a) =>
              a ? { ...a, appointments_booked: a.appointments_booked + 1 } : a,
            );
          }
          if (eventType === "UPDATE") {
            setRecentAppointments((prev) =>
              prev.map((a) =>
                a.id === (newRow as Appointment).id
                  ? { ...a, ...(newRow as Appointment) }
                  : a,
              ),
            );
          }
          if (eventType === "DELETE") {
            const id = (oldRow as Partial<Appointment>).id;
            setRecentAppointments((prev) => prev.filter((a) => a.id !== id));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  if (businessLoading || (loading && !analytics)) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    const setupSteps = [
      {
        step: "01",
        icon: ClipboardList,
        title: "Complete Your Practice Profile",
        desc: "Add your clinic name, phone, address, and business hours so the AI knows your practice.",
        href: "/dashboard/settings",
        cta: "Go to Settings",
        color: "#0d7377",
      },
      {
        step: "02",
        icon: Mic,
        title: "Create an AI Voice Agent",
        desc: "Choose a voice, personality, and greeting. The AI learns your services and FAQs.",
        href: "/dashboard/agents",
        cta: "Create Agent",
        color: "#7c3aed",
      },
      {
        step: "03",
        icon: Code2,
        title: "Embed on Your Website",
        desc: "Copy one script tag and paste it on your site. Patients can call your AI instantly.",
        href: "/dashboard/widget",
        cta: "Get Embed Code",
        color: "#d97706",
      },
    ];

    return (
      <div className="space-y-8">
        {/* Hero welcome banner */}
        <div
          className="relative rounded-2xl overflow-hidden px-8 py-10"
          style={{
            background:
              "linear-gradient(135deg, #072b2e 0%, #0a3d40 50%, #0d5257 100%)",
          }}
        >
          {/* ECG line decoration */}
          <div className="absolute top-0 left-0 right-0 h-[3px] ecg-line opacity-30" />
          {/* Glow orbs */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"
            style={{
              background:
                "radial-gradient(circle, rgba(20,168,181,0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(13,115,119,0.20) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(20,168,181,0.20)",
                  border: "1px solid rgba(20,168,181,0.35)",
                }}
              >
                <HeartPulse
                  className="w-7 h-7 text-white"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(34,196,208,0.6))",
                  }}
                />
              </div>
              <div>
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-2"
                  style={{
                    background: "rgba(20,168,181,0.15)",
                    border: "1px solid rgba(20,168,181,0.30)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#22c4d0" }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#22c4d0" }}
                  >
                    Setup Required
                  </span>
                </div>
                <h1 className="text-[24px] font-bold text-white leading-tight mb-1">
                  Welcome to Raphael Samuel Soutien
                </h1>
                <p
                  className="text-[14px]"
                  style={{ color: "rgba(255,255,255,0.55)", maxWidth: "420px" }}
                >
                  You&apos;re 3 steps away from having an AI receptionist that
                  answers calls 24/7 and books patient appointments
                  automatically.
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings" className="flex-shrink-0">
              <Button icon={<ArrowRight className="w-4 h-4" />}>
                Start Setup
              </Button>
            </Link>
          </div>
        </div>

        {/* Setup steps */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--text-2)" }}
            >
              Complete these steps to go live
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(13,115,119,0.12)" }}
            />
            <span className="text-[12px]" style={{ color: "var(--text-4)" }}>
              0 / 3 done
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {setupSteps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={s.href}>
                  <div
                    className="group relative rounded-2xl p-6 h-full cursor-pointer transition-all duration-150"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(13,115,119,0.12)",
                      boxShadow: "0 1px 4px rgba(13,115,119,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(20,168,181,0.35)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 4px 20px rgba(13,115,119,0.10)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(13,115,119,0.12)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 1px 4px rgba(13,115,119,0.06)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    {/* Step number watermark */}
                    <div
                      className="absolute top-4 right-5 text-[52px] font-black leading-none select-none tabular-nums"
                      style={{ color: "rgba(13,115,119,0.05)" }}
                    >
                      {s.step}
                    </div>

                    <div className="relative">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                        style={{
                          background: `${s.color}12`,
                          border: `1px solid ${s.color}28`,
                          color: s.color,
                        }}
                      >
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div
                        className="text-[11px] font-bold uppercase tracking-widest mb-2"
                        style={{ color: s.color }}
                      >
                        Step {s.step}
                      </div>
                      <h3
                        className="text-[14px] font-bold mb-2 leading-snug"
                        style={{ color: "var(--text-1)" }}
                      >
                        {s.title}
                      </h3>
                      <p
                        className="text-[12px] leading-relaxed mb-5"
                        style={{ color: "var(--text-3)" }}
                      >
                        {s.desc}
                      </p>
                      <div
                        className="flex items-center gap-1.5 text-[12px] font-semibold"
                        style={{ color: s.color }}
                      >
                        {s.cta}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What you'll get */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(13,115,119,0.03)",
            border: "1px solid rgba(13,115,119,0.10)",
          }}
        >
          <div
            className="text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ color: "var(--teal-600)" }}
          >
            What you get after setup
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: PhoneCall,
                label: "24/7 Call Answering",
                desc: "Never miss a patient call",
              },
              {
                icon: Calendar,
                label: "Auto Appointment Booking",
                desc: "Patients book while they talk",
              },
              {
                icon: MessageSquare,
                label: "Full Transcripts",
                desc: "Every call logged & searchable",
              },
              {
                icon: TrendingUp,
                label: "Live Analytics",
                desc: "Track calls & conversions",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(13,115,119,0.08)",
                    border: "1px solid rgba(20,168,181,0.20)",
                    color: "var(--teal-600)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className="text-[12px] font-semibold"
                    style={{ color: "var(--text-1)" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = trend.map((item) => ({
    ...item,
    date: new Date(item.date + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const statItems = [
    {
      label: "Today's Calls",
      value: analytics?.conversations_today ?? 0,
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      color: "#0d7377",
    },
    {
      label: "This Week",
      value: analytics?.conversations_this_week ?? 0,
      icon: <Activity className="w-3.5 h-3.5" />,
      color: "#7c3aed",
    },
    {
      label: "Callbacks Requested",
      value: analytics?.callback_requests ?? 0,
      icon: <PhoneCall className="w-3.5 h-3.5" />,
      color: "#d97706",
    },
    {
      label: "Active Agents",
      value: agents.filter((a) => a.is_active).length,
      icon: <Bot className="w-3.5 h-3.5" />,
      color: "#059669",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0d7377, #0a3d40)" }}
          >
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2
              className="text-[16px] font-bold"
              style={{ color: "var(--text-1)" }}
            >
              Good morning
            </h2>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              {business.name}
            </p>
          </div>
        </div>
        <Button
          variant="teal-ghost"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadData}
        >
          Refresh
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Conversations",
            value: analytics?.total_conversations ?? 0,
            icon: <MessageSquare className="w-4 h-4" />,
            accent: "teal" as const,
          },
          {
            title: "Appointments Booked",
            value: analytics?.appointments_booked ?? 0,
            icon: <Calendar className="w-4 h-4" />,
            accent: "green" as const,
          },
          {
            title: "Conversion Rate",
            value: `${analytics?.conversion_rate ?? 0}%`,
            icon: <TrendingUp className="w-4 h-4" />,
            accent: "purple" as const,
          },
          {
            title: "Avg. Call Duration",
            value: formatDuration(analytics?.avg_call_duration ?? 0),
            icon: <Clock className="w-4 h-4" />,
            accent: "orange" as const,
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <AnalyticsCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Chart + side stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Conversation Trend"
              description="Last 14 days"
              icon={<Activity className="w-4 h-4" />}
            />
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d7377" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0d7377" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#7c3aed"
                        stopOpacity={0.18}
                      />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(13,115,119,0.10)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#5a9098" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#5a9098" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, "auto"]}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(13,115,119,0.16)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--text-1)",
                      boxShadow: "0 4px 20px rgba(13,115,119,0.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="conversations"
                    stroke="#0d7377"
                    strokeWidth={2}
                    fill="url(#colorConv)"
                    name="Conversations"
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#colorAppt)"
                    name="Appointments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Quick Stats"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <div className="space-y-1">
            {statItems.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-3 py-2.5"
                style={{
                  borderBottom:
                    i < statItems.length - 1
                      ? "1px solid rgba(13,115,119,0.08)"
                      : undefined,
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(13,115,119,0.07)",
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-[16px] font-bold"
                    style={{ color: "var(--text-1)" }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent appointments */}
      <Card>
        <CardHeader
          title="Recent Appointments"
          icon={<Calendar className="w-4 h-4" />}
          action={
            <Link href="/dashboard/appointments">
              <Button
                variant="teal-ghost"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            </Link>
          }
        />
        {recentAppointments.length === 0 ? (
          <div
            className="text-center py-10 text-[13px]"
            style={{ color: "var(--text-3)" }}
          >
            No appointments yet. Appointments booked via AI calls will appear
            here.
          </div>
        ) : (
          <div>
            {recentAppointments.map((appt, i) => (
              <div
                key={appt.id}
                className="flex items-center gap-4 py-3.5"
                style={{
                  borderTop:
                    i > 0 ? "1px solid rgba(13,115,119,0.08)" : undefined,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
                  style={{
                    background: "linear-gradient(135deg, #0d7377, #0a3d40)",
                  }}
                >
                  {appt.customer_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "var(--text-1)" }}
                  >
                    {appt.customer_name}
                  </div>
                  <div
                    className="text-[11px] truncate"
                    style={{ color: "var(--text-3)" }}
                  >
                    {appt.date_of_birth && `DOB: ${appt.date_of_birth}`}
                    {appt.insurance_provider && ` · ${appt.insurance_provider}`}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    {formatDateTime(appt.scheduled_at)}
                  </div>
                  <div className="mt-0.5">
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
