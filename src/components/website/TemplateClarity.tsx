"use client";

import { WebsiteContent } from "@/types";
import { useState } from "react";
import { VoiceWidget } from "../voice/VoiceWidget";

// inside the component, add:

interface Props {
  content: WebsiteContent;
  primaryColor: string;
  secondaryColor: string;
  fontStyle: string;
  agentId?: string | null;
  businessId?: string;
  appUrl?: string;
  preview?: boolean;
}

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  poppins: "'Poppins', system-ui, sans-serif",
};

export function TemplateClarity({
  content,
  primaryColor,
  secondaryColor,
  fontStyle,
  businessId,
  agentId,
  appUrl,
  preview,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  // const widgetInjected = useRef(false);
  const font = FONT_MAP[fontStyle] || FONT_MAP.inter;
  const c = content;

  const branding = c.branding || {};
  const h = c.hero || {};
  const ab = c.about || {};
  const services = c.services || [];
  const team = c.team || [];
  const testimonials = c.testimonials || [];
  const insurances = c.insurances || [];
  const faqs = c.faq || [];
  const contact = c.contact || {};
  const footer = c.footer || {};

  const navTitle =
    branding.siteTitle || h.headline?.split(" ")[0] || "HealthCare";

  // useEffect(() => {
  //   if (preview || !businessId || widgetInjected.current) return;
  //   widgetInjected.current = true;
  //   const s = document.createElement("script");
  //   s.src = `${appUrl || ""}/api/widget-script`;
  //   s.setAttribute("data-business-id", businessId);
  //   if (agentId) s.setAttribute("data-agent-id", agentId);
  //   s.setAttribute("data-position", "bottom-right");
  //   s.setAttribute("data-color", primaryColor);
  //   document.body.appendChild(s);
  // }, [businessId, agentId, appUrl, preview, primaryColor]);

  return (
    <div style={{ fontFamily: font, color: "#1e293b", background: "#fff" }}>
      {/* NAV */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        {businessId && (
          <VoiceWidget
            businessId={businessId}
            primaryColor={primaryColor}
            greeting="hello there"
            agentId={agentId || undefined}
          />
        )}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={navTitle}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  objectFit: "contain",
                  background: "#f0f9ff",
                  border: "1px solid #e2e8f0",
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: primaryColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
            )}
            <span
              style={{ fontWeight: 700, fontSize: 18, color: primaryColor }}
            >
              {navTitle}
            </span>
          </div>
          <div
            style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500 }}
            className="clarity-desktop-nav"
          >
            {["Services", "About", "Team", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                style={{ color: "#475569", textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = primaryColor)
                }
                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
              >
                {l}
              </a>
            ))}
          </div>

          {/* 
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {contact.phone && (
              <button
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    (window as any).__mediCallOpen
                  )
                    (window as any).__mediCallOpen("call");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: primaryColor,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .06h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" />
                </svg>
                {contact.phone}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="clarity-mobile-menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#1e293b",
                padding: 4,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div> */}
        </div>
        {menuOpen && (
          <div
            style={{
              background: "#fff",
              borderTop: "1px solid #e2e8f0",
              padding: "12px 24px 16px",
            }}
          >
            {["Services", "About", "Team", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 0",
                  color: "#475569",
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: "none",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        style={{
          background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 999,
                background: `${primaryColor}12`,
                border: `1px solid ${primaryColor}30`,
                fontSize: 12,
                fontWeight: 600,
                color: primaryColor,
                marginBottom: 20,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Now Accepting New Patients
            </div>
            <h1
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#0f172a",
                marginBottom: 20,
                letterSpacing: "-0.5px",
              }}
            >
              {h.headline || "Compassionate Care for Your Family"}
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#475569",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              {h.subheadline ||
                "Expert medical care delivered with warmth and precision by our dedicated team of specialists."}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                // onClick={() => {
                //   if (
                //     typeof window !== "undefined" &&
                //     (window as any).__mediCallOpen
                //   )
                //     (window as any).__mediCallOpen("book");
                // }}
                onClick={() => setBookingOpen(true)}
                style={{
                  padding: "13px 28px",
                  borderRadius: 12,
                  background: primaryColor,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: `0 6px 24px ${primaryColor}35`,
                }}
              >
                {h.ctaPrimary || "Book Appointment"}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <a
                href="#services"
                style={{
                  padding: "13px 28px",
                  borderRadius: 12,
                  border: `2px solid ${primaryColor}30`,
                  color: primaryColor,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                {h.ctaSecondary || "Our Services"}
              </a>
            </div>
            <div
              style={{
                display: "flex",
                gap: 32,
                marginTop: 44,
                paddingTop: 32,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              {[
                {
                  value: h.yearsExperience ? `${h.yearsExperience}+` : "15+",
                  label: "Years Experience",
                },
                {
                  value: h.patientsServed
                    ? Number(h.patientsServed) >= 1000
                      ? Math.round(Number(h.patientsServed) / 1000) + "k+"
                      : h.patientsServed + "+"
                    : "10k+",
                  label: "Patients Served",
                },
                {
                  value: h.satisfactionRate ? `${h.satisfactionRate}%` : "98%",
                  label: "Satisfaction",
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: primaryColor,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
              aspectRatio: "4/3",
            }}
          >
            {h.heroImage ? (
              <img
                src={h.heroImage}
                alt="Medical"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 300,
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}10 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={`${primaryColor}50`}
                  strokeWidth="1"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <p style={{ color: `${primaryColor}60`, fontSize: 13 }}>
                  Upload hero image in editor
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section
          id="services"
          style={{ padding: "80px 24px", background: "#fff" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: primaryColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                What We Offer
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
                Our Medical Services
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#64748b",
                  marginTop: 12,
                  maxWidth: 500,
                  margin: "12px auto 0",
                }}
              >
                Comprehensive care tailored to every stage of life
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {services.map((svc, i) => (
                <div
                  key={i}
                  style={{
                    padding: 28,
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    transition: "box-shadow .2s, transform .2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    const d = e.currentTarget as HTMLDivElement;
                    d.style.boxShadow = `0 12px 32px ${primaryColor}15`;
                    d.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const d = e.currentTarget as HTMLDivElement;
                    d.style.boxShadow = "none";
                    d.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 16 }}>
                    {svc.icon || "🏥"}
                  </div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    {svc.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#64748b",
                      lineHeight: 1.65,
                      marginBottom: 16,
                    }}
                  >
                    {svc.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 14,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    {svc.duration && (
                      <span
                        style={{
                          fontSize: 13,
                          color: primaryColor,
                          fontWeight: 600,
                        }}
                      >
                        {svc.duration}
                      </span>
                    )}
                    {svc.price && (
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {svc.price}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section
        id="about"
        style={{ padding: "80px 24px", background: "#f8fafc" }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 16px 48px rgba(0,0,0,0.10)",
              aspectRatio: "4/3",
            }}
          >
            {ab.image ? (
              <img
                src={ab.image}
                alt="About"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 260,
                  background: `linear-gradient(135deg, ${primaryColor}12 0%, ${secondaryColor}08 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={`${primaryColor}40`}
                  strokeWidth="1"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              About Us
            </div>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 20,
                lineHeight: 1.15,
              }}
            >
              {ab.headline || "Dedicated to Your Health & Wellbeing"}
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#475569",
                lineHeight: 1.8,
                marginBottom: 16,
              }}
            >
              {ab.mission ||
                "We are committed to providing the highest quality healthcare with a patient-first approach."}
            </p>
            {ab.story && (
              <p
                style={{
                  fontSize: 15,
                  color: "#475569",
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}
              >
                {ab.story}
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {(
                ab.badges || [
                  "Board Certified",
                  "Accepting New Patients",
                  "Telehealth Available",
                  "Insurance Accepted",
                ]
              )
                .slice(0, 4)
                .map((b: string, i: number) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: `${primaryColor}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={primaryColor}
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      {b}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      {team.length > 0 && (
        <section id="team" style={{ padding: "80px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: primaryColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                Our Experts
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
                Meet Our Team
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 28,
              }}
            >
              {team.map((member, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: 28,
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      overflow: "hidden",
                      margin: "0 auto 16px",
                      border: `3px solid ${primaryColor}30`,
                      background: `${primaryColor}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color: primaryColor,
                        }}
                      >
                        {member.name?.[0] || "D"}
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 4,
                    }}
                  >
                    {member.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: primaryColor,
                      fontWeight: 600,
                      marginBottom: 10,
                    }}
                  >
                    {member.role}
                  </p>
                  {member.bio && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        lineHeight: 1.6,
                      }}
                    >
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section
          style={{
            padding: "80px 24px",
            background: `linear-gradient(135deg, ${primaryColor}06, ${secondaryColor}04)`,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: primaryColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                Patient Stories
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
                What Our Patients Say
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    padding: 28,
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <svg
                        key={j}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#f59e0b"
                        stroke="none"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#475569",
                      lineHeight: 1.7,
                      marginBottom: 16,
                      fontStyle: "italic",
                    }}
                  >
                    "{t.quote}"
                  </p>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {t.name}
                    </div>
                    {t.condition && (
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {t.condition}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSURANCE */}
      {insurances.length > 0 && (
        <section style={{ padding: "60px 24px", background: "#fff" }}>
          <div
            style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 28,
              }}
            >
              Insurance We Accept
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
              }}
            >
              {insurances.map((ins, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 999,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {ins.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#f8fafc" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
                Frequently Asked Questions
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqs.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {item.question}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      style={{
                        transform: openFaq === i ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 20px 16px",
                        fontSize: 14,
                        color: "#475569",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section
        id="contact"
        style={{ padding: "80px 24px", background: "#fff" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              Get In Touch
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
              Contact Us
            </h2>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                {
                  svg: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .06h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" />
                    </svg>
                  ),
                  label: "Phone",
                  value: contact.phone,
                },
                {
                  svg: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: "Email",
                  value: contact.email,
                },
                {
                  svg: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  label: "Address",
                  value: contact.address,
                },
                {
                  svg: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  label: "Hours",
                  value: contact.hours,
                },
              ]
                .filter((i) => i.value)
                .map(({ svg, label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${primaryColor}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: primaryColor,
                      }}
                    >
                      {svg}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 2,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                minHeight: 300,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {contact.mapEmbed ? (
                <iframe
                  src={contact.mapEmbed}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div
                  style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ margin: "0 auto 8px", display: "block" }}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div style={{ fontSize: 14 }}>Add Google Maps embed URL</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#0f172a",
          color: "#94a3b8",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {footer.tagline && (
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              {footer.tagline}
            </div>
          )}
          {footer.copyright && (
            <div style={{ fontSize: 12 }}>{footer.copyright}</div>
          )}
          {!footer.tagline && !footer.copyright && (
            <div style={{ fontSize: 12 }}>
              © {new Date().getFullYear()} · All rights reserved
            </div>
          )}
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .clarity-desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .clarity-mobile-menu { display: none !important; }
        }
      `}</style>
      {bookingOpen && businessId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setBookingOpen(false)}
        >
          <div
            style={{
              width: 340,
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(8,14,16,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "10px 12px 0",
              }}
            >
              <button
                onClick={() => setBookingOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            {/* <BookingPanel businessId={businessId} color={primaryColor} /> */}
          </div>
        </div>
      )}
    </div>
  );
}
