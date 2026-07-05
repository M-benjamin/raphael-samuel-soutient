"use client";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { VoiceWidget } from "@/components/voice/VoiceWidget";
import { footerLinks, navLinks } from "@/lib/constant";

import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Code2,
  Globe,
  Headphones,
  Heart,
  HeartPulse,
  LineChart,
  Lock,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  Play,
  PlugZap,
  Repeat2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

/* ─── Data ───────────────────────────────────────────────────────── */

// import { useEffect, useRef } from 'react'
// import notFound from './not-found'

const heroStats = [
  { value: "24/7", label: "Availability", icon: Clock },
  { value: "<1s", label: "Voice Latency", icon: Zap },
  { value: "3×", label: "More Bookings", icon: TrendingUp },
  { value: "98%", label: "Patient Satisfaction", icon: BadgeCheck },
];

const steps = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Set Up Your Practice",
    desc: "Add your services, FAQs, pricing, and clinic hours. Takes under 10 minutes.",
    highlight: "Practice profile ready in minutes",
  },
  {
    num: "02",
    icon: Bot,
    title: "Configure Your AI Agent",
    desc: "Choose a voice, personality, and greeting. The AI learns your specific practice details.",
    highlight: "Trained on your exact services",
  },
  {
    num: "03",
    icon: Globe,
    title: "Embed on Your Website",
    desc: "Paste one script tag. Patients can instantly call your AI receptionist.",
    highlight: "Live in under 30 seconds",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Watch Bookings Grow",
    desc: "Every call is logged, transcribed, and turned into booked appointments.",
    highlight: "Zero missed opportunities",
  },
];

const testimonials = [
  {
    quote:
      "Our missed call rate dropped to zero overnight. MediCall handles every patient inquiry, books appointments, and routes urgent cases appropriately. Best investment our clinic made this year.",
    author: "Dr. Sarah Mitchell",
    role: "Medical Director",
    business: "Sunrise Family Health, Austin TX",
    rating: 5,
    metric: "0 missed calls",
  },
  {
    quote:
      "I was skeptical about AI handling patient calls, but the voice quality is incredible. Patients genuinely can't tell they're talking to an AI. Our bookings are up 40% since deployment.",
    author: "Dr. James Lin",
    role: "Practice Owner",
    business: "ClearPath Medical, Chicago IL",
    rating: 5,
    metric: "+40% bookings",
  },
  {
    quote:
      "ROI in the first week. The AI booked over $3,200 in appointments that would have gone to voicemail. It pays for itself many times over every single month.",
    author: "Maria Rivera, RN",
    role: "Operations Manager",
    business: "Riverside Wellness Clinic, Miami FL",
    rating: 5,
    metric: "$3,200 week 1",
  },
  {
    quote:
      "Setup was surprisingly fast. We had it live on our website in 20 minutes. The dashboard analytics help us understand what patients are calling about most.",
    author: "Dr. David Chen",
    role: "Clinic Director",
    business: "Pacific Health Group, Seattle WA",
    rating: 5,
    metric: "Live in 20 min",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever · self-hosted",
    desc: "Perfect for a single practice testing AI voice.",
    features: [
      "1 Practice profile",
      "1 AI Voice Agent",
      "Unlimited conversations",
      "Appointment booking",
      "Analytics dashboard",
      "Embeddable widget",
      "Conversation transcripts",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    desc: "For growing practices that need more power.",
    features: [
      "Multiple practice locations",
      "Unlimited AI agents",
      "Priority support",
      "Custom domains",
      "Advanced analytics",
      "API access",
      "White-label widget",
    ],
    cta: "Join Waitlist",
    href: "/signup",
    highlight: true,
    badge: "Coming Soon",
  },
];

/* ─── Page ───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const demoBizId = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || "";
  // const widgetInjected = useRef(false);

  // const supabase = createClient();

  // const { data: website } = (
  //   supabase.from("doctor_websites") as any,
  // ).select("*");

  return (
    <div
      className="min-h-screen text-[#0a2e30] font-sans antialiased overflow-x-hidden"
      style={{ background: "#051c1e" }}
    >
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <Navbar navLinks={navLinks} />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Dark deep-teal background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #051c1e 0%, #072b2e 30%, #0a3d40 60%, #0d5257 100%)",
          }}
        />
        {/* Radial glow top-center */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, #14a8b5, transparent 70%)",
          }}
        />
        {/* Bottom-left glow */}
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(ellipse at center, #0d7377, transparent 70%)",
          }}
        />
        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(20,168,181,0.8) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* ECG pulse strip at top */}
        <div className="absolute top-16 left-0 right-0 h-[2px] ecg-line opacity-20" />

        {/* ── Center content ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16 pb-8">
          {/* Floating badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-10"
            style={{
              background: "rgba(20,168,181,0.12)",
              border: "1px solid rgba(20,168,181,0.35)",
              color: "#22c4d0",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22c4d0" }}
            />
            Powered by OpenAI GPT-4o Realtime
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06] text-white mb-7">
            Never Miss
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #14a8b5 0%, #22c4d0 50%, #14a8b5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Another Patient Call
            </span>
          </h1>

          <p
            className="text-[18px] leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Your AI voice receptionist answers 24/7, books appointments, and
            handles every inquiry — so your team focuses on what matters:
            excellent patient care.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-2xl text-white transition-all duration-150 hover:scale-[1.03] hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #14a8b5, #0d7377)",
                boxShadow:
                  "0 0 0 1px rgba(20,168,181,0.40), 0 8px 32px rgba(20,168,181,0.30)",
              }}
            >
              Start Free — No Card Needed
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link
              href="#demo"
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-2xl transition-all duration-150 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Play className="w-4 h-4" style={{ color: "#22c4d0" }} />
              See Live Demo
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 flex-wrap mb-20">
            <div className="flex -space-x-2.5">
              {["SM", "JL", "MR", "DC"].map((init, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    background: `hsl(${178 + i * 10},45%,${30 + i * 6}%)`,
                    borderColor: "#072b2e",
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p
                className="text-[12px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Trusted by 200+ healthcare practices
              </p>
            </div>
            <div
              className="w-px h-8 hidden sm:block"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Shield className="w-3.5 h-3.5" style={{ color: "#14a8b5" }} />
              HIPAA-Compliant Infrastructure
            </div>
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <BadgeCheck
                className="w-3.5 h-3.5"
                style={{ color: "#14a8b5" }}
              />
              SOC 2 Type II Certified
            </div>
          </div>
        </div>
        {
          <VoiceWidget
            businessId={demoBizId}
            primaryColor={"#0d7377"}
            greeting="hello there"
            // agentId={website.agent_id || undefined}
          />
        }

        {/* ── Floating feature cards ── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: PhoneIncoming,
                label: "Live Call Active",
                sub: "Annual physical inquiry",
                accent: "#14a8b5",
                pill: "LIVE",
                pillColor: "#22c4d0",
                waveform: true,
              },
              {
                icon: Calendar,
                label: "22 Bookings Today",
                sub: "Up 31% from yesterday",
                accent: "#7c3aed",
                stat: "+31%",
                statColor: "#a78bfa",
              },
              {
                icon: Clock,
                label: "< 1s Response",
                sub: "Avg voice latency",
                accent: "#0d7377",
                stat: "24/7",
                statColor: "#22c4d0",
              },
              {
                icon: BadgeCheck,
                label: "98% Satisfaction",
                sub: "Patient NPS score",
                accent: "#059669",
                stat: "↑ 4pts",
                statColor: "#34d399",
              },
            ].map(
              ({
                icon: Icon,
                label,
                sub,
                accent,
                pill,
                pillColor,
                waveform,
                stat,
                statColor,
              }) => (
                <div
                  key={label}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${accent}22`,
                        border: `1px solid ${accent}44`,
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
                    </div>
                    {pill && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1"
                        style={{
                          background: `${pillColor}22`,
                          color: pillColor,
                          border: `1px solid ${pillColor}44`,
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full animate-pulse"
                          style={{ background: pillColor }}
                        />
                        {pill}
                      </span>
                    )}
                    {stat && (
                      <span
                        className="text-[13px] font-bold"
                        style={{ color: statColor }}
                      >
                        {stat}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white leading-snug">
                      {label}
                    </div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: "rgba(255,255,255,0.40)" }}
                    >
                      {sub}
                    </div>
                  </div>
                  {waveform && (
                    <div className="flex gap-0.5 items-end h-4">
                      {[3, 5, 4, 7, 3, 6, 4, 5].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full"
                          style={{
                            height: `${h * 2.5}px`,
                            background: "#14a8b5",
                            animation: `wave 1.2s ease-in-out ${i * 0.12}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ opacity: 0.35 }}
        >
          <span
            className="text-[11px]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Scroll to explore
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-white" />
        </div>
      </section>

      {/* ── FEATURES BENTO ──────────────────────────────────────── */}
      <section
        id="features"
        className="py-28 px-6"
        style={{ background: "#eaf6f7" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
              style={{
                background: "rgba(13,115,119,0.08)",
                border: "1px solid rgba(20,168,181,0.28)",
                color: "#0d7377",
              }}
            >
              <Zap className="w-3 h-3" /> Core Features
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ color: "#0a2e30" }}
            >
              Everything your practice
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #0d7377, #14a8b5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                needs to grow
              </span>
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#1e5457" }}>
              Production-ready from day one. Real AI, real patient data, real
              results for your healthcare practice.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Large hero feature */}
            <div
              className="md:col-span-2 lg:col-span-2 rounded-2xl p-8 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(13,115,119,0.08), rgba(20,168,181,0.04))",
                border: "1px solid rgba(20,168,181,0.25)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{
                  background: "radial-gradient(circle, #14a8b5, transparent)",
                }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold mb-5"
                  style={{
                    background: "rgba(13,115,119,0.10)",
                    color: "#0d7377",
                  }}
                >
                  <BrainCircuit className="w-3 h-3" /> AI Core
                </div>
                <h3
                  className="text-2xl font-bold mb-3 leading-tight"
                  style={{ color: "#0a2e30" }}
                >
                  GPT-4o Realtime Voice Engine
                </h3>
                <p
                  className="text-[14px] leading-relaxed mb-6"
                  style={{ color: "#1e5457" }}
                >
                  Sub-second latency, natural turn-taking, smart interruption
                  handling. Patients have genuine conversations — not robotic
                  phone trees.
                </p>
                {/* Waveform viz */}
                <div className="flex items-end gap-1 h-10">
                  {[
                    4, 7, 5, 9, 6, 8, 5, 10, 7, 6, 9, 5, 8, 6, 10, 7, 5, 8, 6,
                    9,
                  ].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h * 10}%`,
                        background: `rgba(13,115,119,${0.3 + (i % 3) * 0.2})`,
                        animation: `wave 1.2s ease-in-out ${i * 0.07}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <div
                  className="text-[11px] mt-2"
                  style={{ color: "rgba(13,115,119,0.55)" }}
                >
                  Live voice waveform simulation
                </div>
              </div>
            </div>

            {/* Regular features */}
            {[
              {
                icon: Calendar,
                accent: "#7c3aed",
                tag: "Scheduling",
                title: "Smart Appointment Booking",
                desc: "Checks real availability and books directly — no double bookings, ever.",
              },
              {
                icon: Timer,
                accent: "#d97706",
                tag: "Always On",
                title: "24/7 — Nights & Weekends",
                desc: "Every patient call answered even when your clinic is closed.",
              },
              {
                icon: LineChart,
                accent: "#059669",
                tag: "Analytics",
                title: "Conversation Intelligence",
                desc: "Sentiment, call topics, conversion rates — all tracked automatically.",
              },
              {
                icon: SlidersHorizontal,
                accent: "#ea580c",
                tag: "Config",
                title: "Fully Configurable",
                desc: "Voice, personality, FAQs, services. Trained on your exact practice.",
              },
              {
                icon: PlugZap,
                accent: "#db2777",
                tag: "Embed",
                title: "One Script Tag Setup",
                desc: "Works on WordPress, Wix, Webflow, Squarespace — any platform.",
              },
              {
                icon: Shield,
                accent: "#0d7377",
                tag: "Security",
                title: "Enterprise Security",
                desc: "Row-level security, isolated data, zero permanent key exposure.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 relative overflow-hidden group cursor-default hover:scale-[1.02] transition-all duration-200 bg-white"
                style={{
                  border: "1px solid rgba(13,115,119,0.10)",
                  boxShadow: "0 1px 4px rgba(13,115,119,0.06)",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"
                  style={{ background: f.accent }}
                />
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold mb-4"
                  style={{ background: `${f.accent}15`, color: f.accent }}
                >
                  <f.icon className="w-2.5 h-2.5" /> {f.tag}
                </div>
                <h3
                  className="text-[14px] font-bold mb-2 leading-snug"
                  style={{ color: "#0a2e30" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "#5a9098" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "#f2f8f9" }}
      >
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #14a8b5, transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
              style={{
                background: "rgba(13,115,119,0.08)",
                border: "1px solid rgba(20,168,181,0.28)",
                color: "#0d7377",
              }}
            >
              <Repeat2 className="w-3 h-3" /> Quick Setup
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ color: "#0a2e30" }}
            >
              From zero to AI receptionist
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #0d7377, #14a8b5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                in under 30 minutes
              </span>
            </h2>
            <p className="text-lg" style={{ color: "#1e5457" }}>
              No engineering degree required. If you can copy-paste, you can
              deploy this.
            </p>
          </div>

          {/* Steps — alternating layout */}
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
              >
                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <div
                      className="rounded-2xl p-8 relative overflow-hidden bg-white"
                      style={{
                        border: "1px solid rgba(13,115,119,0.10)",
                        boxShadow: "0 2px 12px rgba(13,115,119,0.07)",
                      }}
                    >
                      <div
                        className="absolute top-4 right-4 text-[64px] font-black tabular-nums leading-none select-none"
                        style={{ color: "rgba(13,115,119,0.05)" }}
                      >
                        {step.num}
                      </div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                        style={{
                          background: "rgba(13,115,119,0.08)",
                          border: "1px solid rgba(20,168,181,0.22)",
                        }}
                      >
                        <step.icon
                          className="w-6 h-6"
                          style={{ color: "#0d7377" }}
                        />
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                        style={{
                          background: "rgba(13,115,119,0.08)",
                          color: "#0d7377",
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {step.highlight}
                      </div>
                    </div>
                    {/* Connector */}
                    {i < steps.length - 1 && (
                      <div
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-8"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(13,115,119,0.4), transparent)",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 max-w-md">
                  <div
                    className="text-[11px] font-bold uppercase tracking-widest mb-3"
                    style={{ color: "rgba(13,115,119,0.50)" }}
                  >
                    Step {step.num}
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3 tracking-tight"
                    style={{ color: "#0a2e30" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: "#1e5457" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "#eaf6f7" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
                style={{
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  color: "#d97706",
                }}
              >
                <Star className="w-3 h-3 fill-amber-400" /> Reviews
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight"
                style={{ color: "#0a2e30" }}
              >
                Practices that
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#d97706,#b45309)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  never look back
                </span>
              </h2>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: "#0a2e30" }}>
                4.9<span className="text-amber-500">/5</span>
              </div>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div className="text-[11px] mt-1" style={{ color: "#5a9098" }}>
                200+ verified reviews
              </div>
            </div>
          </div>

          {/* 2-column testimonial grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="rounded-2xl p-7 relative overflow-hidden bg-white"
                style={{
                  border: "1px solid rgba(13,115,119,0.10)",
                  boxShadow: "0 1px 6px rgba(13,115,119,0.07)",
                }}
              >
                {/* Quote mark */}
                <div
                  className="absolute top-4 right-6 text-[80px] font-black leading-none select-none"
                  style={{ color: "rgba(13,115,119,0.05)" }}
                >
                  "
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                {/* Quote */}
                <p
                  className="text-[15px] leading-relaxed mb-6"
                  style={{ color: "#1e5457" }}
                >
                  "{t.quote}"
                </p>
                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #0d7377, #0a3d40)",
                      }}
                    >
                      {t.author
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div>
                      <div
                        className="text-[13px] font-semibold"
                        style={{ color: "#0a2e30" }}
                      >
                        {t.author}
                      </div>
                      <div className="text-[11px]" style={{ color: "#5a9098" }}>
                        {t.role} · {t.business}
                      </div>
                    </div>
                  </div>
                  {/* Metric badge */}
                  <div
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={{
                      background: "rgba(13,115,119,0.08)",
                      border: "1px solid rgba(20,168,181,0.22)",
                      color: "#0d7377",
                    }}
                  >
                    {t.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATION / CODE ──────────────────────────────────── */}
      <section
        id="integration"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "#f2f8f9" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-6"
                style={{
                  background: "rgba(13,115,119,0.08)",
                  border: "1px solid rgba(20,168,181,0.28)",
                  color: "#0d7377",
                }}
              >
                <Code2 className="w-3 h-3" /> Integration
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                style={{ color: "#0a2e30" }}
              >
                Add it to your site
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #0d7377, #14a8b5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  in 30 seconds
                </span>
              </h2>
              <p
                className="text-[16px] leading-relaxed mb-8"
                style={{ color: "#1e5457" }}
              >
                Copy two lines. Paste before the closing body tag. Works on
                WordPress, Squarespace, Wix, Webflow, custom HTML — everything.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Globe, text: "Works on any website platform" },
                  {
                    icon: Zap,
                    text: "No server setup or configuration needed",
                  },
                  {
                    icon: Lock,
                    text: "Practice ID is public-safe — no keys exposed",
                  },
                  {
                    icon: Heart,
                    text: "HIPAA-conscious architecture by default",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(13,115,119,0.08)" }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: "#0d7377" }}
                      />
                    </div>
                    <span className="text-[14px]" style={{ color: "#1e5457" }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-xl text-white transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, #0d7377, #0a4a4d)",
                  boxShadow: "0 0 0 1px rgba(13,115,119,0.25)",
                }}
              >
                Get Your Embed Code
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — code block (keep dark for contrast) */}
            <div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 60px rgba(10,61,64,0.18)",
                }}
              >
                {/* Window chrome */}
                <div
                  className="flex items-center gap-2 px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span
                    className="ml-3 text-[11px] font-mono"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    index.html
                  </span>
                </div>
                {/* Code */}
                <div className="p-6 font-mono text-[13px] leading-loose overflow-x-auto">
                  <div style={{ color: "#6b7280" }}>
                    {"<!-- Paste before </body> -->"}
                  </div>
                  <div className="mt-3">
                    <span style={{ color: "#f97316" }}>{"<script "}</span>
                    <span style={{ color: "#38bdf8" }}>src</span>
                    <span style={{ color: "#e2e8f0" }}>=</span>
                    <span style={{ color: "#38bdf8" }}>
                      "https://yourapp.com/api/widget-script"
                    </span>
                    <span style={{ color: "#f97316" }}>{" />"}</span>
                  </div>
                  <div className="mt-2">
                    <span style={{ color: "#f97316" }}>{"<script>"}</span>
                  </div>
                  <div className="ml-6">
                    <span style={{ color: "#e2e8f0" }}>MediCall.</span>
                    <span style={{ color: "#38bdf8" }}>init</span>
                    <span style={{ color: "#e2e8f0" }}>{"({"}</span>
                  </div>
                  <div className="ml-12">
                    <span style={{ color: "#fbbf24" }}>businessId</span>
                    <span style={{ color: "#e2e8f0" }}>: </span>
                    <span style={{ color: "#38bdf8" }}>"your-practice-id"</span>
                    <span style={{ color: "#e2e8f0" }}>,</span>
                  </div>
                  <div className="ml-12">
                    <span style={{ color: "#fbbf24" }}>position</span>
                    <span style={{ color: "#e2e8f0" }}>: </span>
                    <span style={{ color: "#38bdf8" }}>"bottom-right"</span>
                    <span style={{ color: "#e2e8f0" }}>,</span>
                  </div>
                  <div className="ml-6">
                    <span style={{ color: "#e2e8f0" }}>{"})"}</span>
                  </div>
                  <div>
                    <span style={{ color: "#f97316" }}>{"</script>"}</span>
                  </div>
                </div>
                {/* Footer bar */}
                <div
                  className="flex items-center gap-2 px-5 py-3"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#14a8b5" }}
                  />
                  <span className="text-[11px]" style={{ color: "#22c4d0" }}>
                    Widget active — ready for patient calls
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO SECTION ───────────────────────────────────── */}
      <section
        id="demo"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "#eaf6f7" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(13,115,119,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-7"
                style={{
                  background: "rgba(13,115,119,0.08)",
                  border: "1px solid rgba(20,168,181,0.28)",
                  color: "#0d7377",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#14a8b5" }}
                />
                Live Demo — No Login Required
              </div>

              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.1]"
                style={{ color: "#0a2e30" }}
              >
                Talk to our AI
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #0d7377, #14a8b5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  receptionist now
                </span>
              </h2>

              <p
                className="text-[16px] leading-relaxed mb-10 max-w-md"
                style={{ color: "#1e5457" }}
              >
                Click the teal phone button in the bottom-right corner. Ask it
                anything — services, pricing, hours, or how to book an
                appointment.
              </p>

              {/* Feature checklist */}
              <div className="space-y-4">
                {[
                  {
                    icon: Headphones,
                    title: "Natural voice conversation",
                    desc: "Speaks and listens like a real medical receptionist",
                  },
                  {
                    icon: Zap,
                    title: "Sub-second response time",
                    desc: "No awkward pauses — instant GPT-4o Realtime",
                  },
                  {
                    icon: Calendar,
                    title: "Can book appointments",
                    desc: 'Try asking "I need a checkup this week"',
                  },
                  {
                    icon: MessageSquare,
                    title: "Full conversation transcript",
                    desc: "Every word captured in real time",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(13,115,119,0.08)",
                        border: "1px solid rgba(20,168,181,0.22)",
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "#0d7377" }} />
                    </div>
                    <div>
                      <div
                        className="text-[13px] font-semibold"
                        style={{ color: "#0a2e30" }}
                      >
                        {title}
                      </div>
                      <div
                        className="text-[12px] mt-0.5"
                        style={{ color: "#5a9098" }}
                      >
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual call-to-action card */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-sm rounded-2xl p-8 text-center overflow-hidden bg-white"
                style={{
                  border: "1px solid rgba(20,168,181,0.25)",
                  boxShadow: "0 8px 40px rgba(13,115,119,0.12)",
                }}
              >
                {/* Top glow */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl opacity-20 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse, #14a8b5, transparent)",
                  }}
                />

                {/* Animated orb */}
                <div className="relative flex items-center justify-center mb-6">
                  <div
                    className="absolute w-32 h-32 rounded-full"
                    style={{
                      background: "rgba(13,115,119,0.07)",
                      animation: "demo-pulse-outer 2.2s ease-out infinite",
                    }}
                  />
                  <div
                    className="absolute w-24 h-24 rounded-full"
                    style={{
                      background: "rgba(13,115,119,0.09)",
                      animation: "demo-pulse-outer 2.2s ease-out 0.4s infinite",
                    }}
                  />
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #0d7377, #0a3d40)",
                      boxShadow:
                        "0 8px 32px rgba(13,115,119,0.40), 0 2px 8px rgba(10,61,64,0.20)",
                    }}
                  >
                    <PhoneCall className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div
                  className="text-[18px] font-bold mb-2"
                  style={{ color: "#0a2e30" }}
                >
                  Try It Right Now
                </div>
                <p
                  className="text-[13px] mb-6 leading-relaxed"
                  style={{ color: "#1e5457" }}
                >
                  Our AI demo agent is live and ready to chat. Click the{" "}
                  <span style={{ color: "#0d7377" }}>teal phone button</span> in
                  the corner.
                </p>

                {/* Suggested questions */}
                <div className="space-y-2 text-left">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{ color: "#5a9098" }}
                  >
                    Try asking…
                  </div>
                  {[
                    '"What services do you offer?"',
                    '"How much is a general consultation?"',
                    '"Can I book for tomorrow at 10am?"',
                    '"What are your clinic hours?"',
                  ].map((q) => (
                    <div
                      key={q}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px]"
                      style={{
                        background: "rgba(13,115,119,0.05)",
                        border: "1px solid rgba(13,115,119,0.12)",
                        color: "#1e5457",
                      }}
                    >
                      <MessageSquare
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: "#0d7377" }}
                      />
                      {q}
                    </div>
                  ))}
                </div>

                <div
                  className="mt-6 flex items-center justify-center gap-2 text-[12px]"
                  style={{ color: "#0d7377" }}
                >
                  <span>Click the phone button below</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes demo-pulse-outer {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "#f2f8f9" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(13,115,119,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
              style={{
                background: "rgba(13,115,119,0.08)",
                border: "1px solid rgba(20,168,181,0.28)",
                color: "#0d7377",
              }}
            >
              <BadgeCheck className="w-3 h-3" /> Pricing
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
              style={{ color: "#0a2e30" }}
            >
              Simple, honest pricing
            </h2>
            <p className="text-lg" style={{ color: "#1e5457" }}>
              You bring the OpenAI key. We provide everything else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-8"
                style={
                  plan.highlight
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(13,115,119,0.07), rgba(20,168,181,0.04))",
                        border: "1px solid rgba(20,168,181,0.30)",
                        boxShadow:
                          "0 0 0 1px rgba(13,115,119,0.08), 0 20px 40px rgba(13,115,119,0.10)",
                      }
                    : {
                        background: "#ffffff",
                        border: "1px solid rgba(13,115,119,0.12)",
                        boxShadow: "0 2px 12px rgba(13,115,119,0.07)",
                      }
                }
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="px-4 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider text-white"
                      style={{
                        background: "linear-gradient(135deg, #0d7377, #0a4a4d)",
                      }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.badge && (
                  <span
                    className="absolute top-5 right-5 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider"
                    style={{
                      background: "rgba(251,191,36,0.12)",
                      border: "1px solid rgba(251,191,36,0.25)",
                      color: "#d97706",
                    }}
                  >
                    {plan.badge}
                  </span>
                )}

                <div
                  className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#5a9098" }}
                >
                  {plan.name}
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span
                    className="text-5xl font-black tabular-nums"
                    style={{ color: "#0a2e30" }}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== "Free" && (
                    <span
                      className="text-[14px] mb-2"
                      style={{ color: "#5a9098" }}
                    >
                      / mo
                    </span>
                  )}
                </div>
                <div className="text-[12px] mb-2" style={{ color: "#5a9098" }}>
                  {plan.period}
                </div>
                <p
                  className="text-[13px] mb-7 pb-7"
                  style={{
                    color: "#1e5457",
                    borderBottom: "1px solid rgba(13,115,119,0.10)",
                  }}
                >
                  {plan.desc}
                </p>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(13,115,119,0.10)" }}
                      >
                        <CheckCircle2
                          className="w-3 h-3"
                          style={{ color: "#0d7377" }}
                        />
                      </div>
                      <span
                        className="text-[13px]"
                        style={{ color: "#1e5457" }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="block w-full text-center py-3 rounded-xl text-[13px] font-bold transition-all duration-150"
                  style={
                    plan.highlight
                      ? {
                          background:
                            "linear-gradient(135deg, #0d7377, #0a4a4d)",
                          color: "#fff",
                          boxShadow: "0 2px 12px rgba(13,115,119,0.25)",
                        }
                      : {
                          background: "rgba(13,115,119,0.07)",
                          border: "1px solid rgba(13,115,119,0.18)",
                          color: "#0d7377",
                        }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p
            className="text-center text-[12px] mt-10"
            style={{ color: "#5a9098" }}
          >
            Questions?{" "}
            <a
              href="mailto:support@medicall.ai"
              className="transition-colors"
              style={{ color: "#0d7377" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#0a4a4d";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#0d7377";
              }}
            >
              support@medicall.ai
            </a>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section
        className="py-28 px-6 relative overflow-hidden"
        style={{ background: "#eaf6f7" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(13,115,119,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(13,115,119,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,115,119,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{
              background: "rgba(13,115,119,0.10)",
              border: "1px solid rgba(20,168,181,0.25)",
            }}
          >
            <HeartPulse className="w-8 h-8" style={{ color: "#0d7377" }} />
          </div>
          <h2
            className="text-5xl md:text-6xl font-black tracking-tight mb-6"
            style={{ color: "#0a2e30" }}
          >
            Stop losing patients.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #0d7377, #14a8b5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Start booking more.
            </span>
          </h2>
          <p
            className="text-xl mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: "#1e5457" }}
          >
            Join 200+ healthcare practices that never miss a patient call. Setup
            takes less than 30 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-bold rounded-xl text-white transition-all duration-150 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #0d7377, #0a4a4d)",
                boxShadow:
                  "0 0 0 1px rgba(13,115,119,0.25), 0 8px 28px rgba(13,115,119,0.25)",
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-xl transition-all duration-150"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(13,115,119,0.15)",
                color: "#1e5457",
                boxShadow: "0 1px 4px rgba(13,115,119,0.07)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(13,115,119,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#ffffff";
              }}
            >
              Sign In
            </Link>
          </div>
          <p className="text-[12px] mt-5" style={{ color: "#5a9098" }}>
            No credit card required · Free plan available · Deploy in 30 min
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <Footer footerLinks={footerLinks} />

      {/* ── LIVE DEMO WIDGET — home page only ───────────────────── */}
      {demoBizId && (
        <Script id="medicall-demo-init" strategy="afterInteractive">
          {`
            (function() {
              if (window.location.pathname !== '/') return;
              var s = document.createElement('script');
              s.src = '${appUrl}/widget.js';
              s.onload = function() {
                MediCall.init({ businessId: '${demoBizId}', position: 'bottom-right' });
              };
              document.body.appendChild(s);
            })();
          `}
        </Script>
      )}
    </div>
  );
}
