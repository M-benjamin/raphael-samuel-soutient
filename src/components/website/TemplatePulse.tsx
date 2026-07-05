'use client';

import { useEffect, useRef, useState } from 'react';
import { WebsiteContent } from '@/types';

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

const fontMap: Record<string, string> = {
  inter: "'Inter', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  poppins: "'Poppins', system-ui, sans-serif",
};

export function TemplatePulse({ content, primaryColor, secondaryColor, fontStyle, businessId, agentId, appUrl, preview }: Props) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const widgetInjected = useRef(false);
  const font = fontMap[fontStyle] || fontMap.inter;

  const branding = content.branding || {};
  const h = content.hero || {};
  const ab = content.about || {};
  const services = content.services || [];
  const team = content.team || [];
  const testimonials = content.testimonials || [];
  const insurances = content.insurances || [];
  const faqs = content.faq || [];
  const contact = content.contact || {};
  const footer = content.footer || {};

  const navTitle = branding.siteTitle || (h.headline ? h.headline.split(' ')[0] : 'MedPulse');

  useEffect(() => {
    if (preview || !businessId || widgetInjected.current) return;
    widgetInjected.current = true;
    const s = document.createElement('script');
    s.src = `${appUrl || ''}/api/widget-script`;
    s.setAttribute('data-business-id', businessId);
    if (agentId) s.setAttribute('data-agent-id', agentId);
    s.setAttribute('data-position', 'bottom-right');
    s.setAttribute('data-color', primaryColor);
    document.body.appendChild(s);
  }, [businessId, agentId, appUrl, preview, primaryColor]);

  const nav = ['Services', 'About', 'Team', 'Testimonials', 'Contact'];

  return (
    <div style={{ fontFamily: font, background: '#0a1628', color: '#f0f4f8', margin: 0, padding: 0 }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${primaryColor}33` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {branding.logoUrl
              ? <img src={branding.logoUrl} alt={navTitle} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', background: 'rgba(255,255,255,0.08)', border: `1px solid ${primaryColor}44` }} />
              : <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
            }
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{navTitle}</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="pulse-desktop-nav">
            {nav.map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} style={{ color: 'rgba(240,244,248,0.65)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,248,0.65)')}
              >{n}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {contact.phone && (
              <button onClick={() => { if (typeof window !== 'undefined' && (window as any).__mediCallOpen) (window as any).__mediCallOpen('call'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 40, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .06h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>
                Call Now
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }} className="pulse-mobile-menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: '#0d1f38', borderTop: `1px solid ${primaryColor}22`, padding: '12px 24px 16px' }}>
            {nav.map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'rgba(240,244,248,0.75)', fontSize: 15, fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{n}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '80px 24px' }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${secondaryColor}18 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', top: '40%', left: '50%', width: 2, height: 2, boxShadow: `0 0 120px 60px ${primaryColor}15`, borderRadius: '50%' }} />
        </div>

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${primaryColor}08 1px, transparent 1px), linear-gradient(90deg, ${primaryColor}08 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 40, background: `${primaryColor}20`, border: `1px solid ${primaryColor}40`, marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: primaryColor, letterSpacing: 1, textTransform: 'uppercase' }}>Now Accepting Patients</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20, color: '#fff', letterSpacing: '-1.5px' }}>
              {h.headline || 'Advanced Healthcare for a Healthier Tomorrow'}
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(240,244,248,0.65)', marginBottom: 36, maxWidth: 480 }}>
              {h.subheadline || 'Experience cutting-edge medical care delivered with compassion and precision by our expert team.'}
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => { if (typeof window !== 'undefined' && (window as any).__mediCallOpen) (window as any).__mediCallOpen('book'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: `0 8px 32px ${primaryColor}40` }}>
                {h.ctaPrimary || 'Book Appointment'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => { if (typeof window !== 'undefined' && (window as any).__mediCallOpen) (window as any).__mediCallOpen('call'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, border: `1px solid rgba(240,244,248,0.2)`, color: 'rgba(240,244,248,0.85)', fontWeight: 600, fontSize: 15, background: 'transparent', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .06h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>
                {h.ctaSecondary || 'Call Now'}
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(240,244,248,0.08)' }}>
              {[
                { v: h.yearsExperience ? `${h.yearsExperience}+` : '15+', l: 'Years Experience' },
                { v: h.patientsServed ? `${Number(h.patientsServed) >= 1000 ? Math.round(Number(h.patientsServed)/1000)+'k+' : h.patientsServed+'+'}` : '12k+', l: 'Patients Served' },
                { v: h.satisfactionRate ? `${h.satisfactionRate}%` : '98%', l: 'Satisfaction Rate' },
              ].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,244,248,0.45)', fontWeight: 500, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -2, borderRadius: 24, background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}20)`, filter: 'blur(1px)' }} />
            {h.heroImage ? (
              <img src={h.heroImage} alt="Medical team" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 22, position: 'relative', zIndex: 1 }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 22, background: `linear-gradient(135deg, ${primaryColor}30 0%, #0d1f38 60%, ${secondaryColor}20 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: `${primaryColor}20`, border: `2px solid ${primaryColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  <p style={{ color: `${primaryColor}80`, fontSize: 13 }}>Upload hero image</p>
                </div>
              </div>
            )}

            {/* Floating cards */}
            <div style={{ position: 'absolute', bottom: 24, left: -32, background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${primaryColor}30`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Quick Booking</div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.5)' }}>Same day available</div>
              </div>
            </div>

            <div style={{ position: 'absolute', top: 24, right: -24, background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${primaryColor}30`, borderRadius: 16, padding: '14px 18px', zIndex: 2 }}>
              <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.5)', marginBottom: 4 }}>AI Voice Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>24/7 Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 38, borderRadius: 12, border: `1px solid rgba(240,244,248,0.2)`, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <div style={{ width: 4, height: 8, borderRadius: 2, background: primaryColor, animation: 'pulse-scroll 1.5s infinite' }} />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section id="services" style={{ padding: '100px 24px', background: '#0d1f38' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 40, background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                Our Services
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 16 }}>Comprehensive Medical Care</h2>
              <p style={{ fontSize: 16, color: 'rgba(240,244,248,0.55)', maxWidth: 500, margin: '0 auto' }}>Advanced treatments and preventive care tailored to your unique health needs.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {services.map((s, i) => (
                <div key={i} style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, padding: 28, transition: 'all .3s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${primaryColor}50`; (e.currentTarget as HTMLDivElement).style.background = `${primaryColor}08`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${primaryColor}25, ${secondaryColor}15)`, border: `1px solid ${primaryColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 24 }}>
                    {s.icon || '🏥'}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{s.name}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.5)', lineHeight: 1.7, marginBottom: 16 }}>{s.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {s.duration && <span style={{ fontSize: 12, color: 'rgba(240,244,248,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {s.duration}
                    </span>}
                    {s.price && <span style={{ fontSize: 13, fontWeight: 700, color: primaryColor }}>{s.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" style={{ padding: '100px 24px', background: '#0a1628' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Image side */}
          <div style={{ position: 'relative' }}>
            {ab.image ? (
              <img src={ab.image} alt="About" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 24 }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 24, background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}10)`, border: `1px solid ${primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={`${primaryColor}50`} strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </div>
            )}
            {/* Stats overlay */}
            <div style={{ position: 'absolute', bottom: -24, right: -24, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, borderRadius: 20, padding: '24px 28px', boxShadow: `0 20px 60px ${primaryColor}40` }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{h.yearsExperience || 15}+</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Years of Excellence</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 40, background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              About Us
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 }}>
              {ab.headline || 'Dedicated to Your Health & Wellbeing'}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(240,244,248,0.6)', lineHeight: 1.8, marginBottom: 20 }}>
              {ab.mission || 'We believe every patient deserves personalized, compassionate care. Our team of specialists combines decades of expertise with the latest medical technology.'}
            </p>
            {ab.story && <p style={{ fontSize: 15, color: 'rgba(240,244,248,0.5)', lineHeight: 1.8, marginBottom: 32 }}>{ab.story}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {(ab.badges || ['Board Certified', 'Accepting New Patients', 'Telehealth Available', 'Insurance Accepted']).slice(0, 4).map((b: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${primaryColor}20`, border: `1px solid ${primaryColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(240,244,248,0.7)', fontWeight: 500 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      {team.length > 0 && (
        <section id="team" style={{ padding: '100px 24px', background: '#0d1f38' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 40, background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                Our Team
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 16 }}>Meet Our Specialists</h2>
              <p style={{ fontSize: 16, color: 'rgba(240,244,248,0.5)', maxWidth: 480, margin: '0 auto' }}>Expert physicians committed to delivering exceptional care.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {team.map((m, i) => (
                <div key={i} style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {m.image ? (
                    <img src={m.image} alt={m.name} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 240, background: `linear-gradient(135deg, ${primaryColor}25 0%, #0d1f38 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${primaryColor}20`, border: `2px solid ${primaryColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: primaryColor }}>
                        {m.name?.[0] || 'D'}
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ fontSize: 11, color: primaryColor, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>{m.role}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{m.name}</h3>
                    {m.bio && <p style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)', lineHeight: 1.6 }}>{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="testimonials" style={{ padding: '100px 24px', background: '#0a1628' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 40, background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                Patient Reviews
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>What Our Patients Say</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: 28, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 48, color: `${primaryColor}20`, lineHeight: 1, fontFamily: 'Georgia, serif', fontWeight: 900 }}>"</div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={primaryColor} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(240,244,248,0.65)', lineHeight: 1.75, marginBottom: 20 }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', fontWeight: 700 }}>
                      {t.name?.[0] || 'P'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                      {t.condition && <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.4)' }}>{t.condition}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSURANCE */}
      {insurances.length > 0 && (
        <section style={{ padding: '80px 24px', background: `linear-gradient(135deg, ${primaryColor}12 0%, #0d1f38 50%, ${secondaryColor}08 100%)`, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h3 style={{ fontWeight: 700, color: 'rgba(240,244,248,0.6)', textAlign: 'center', marginBottom: 36, letterSpacing: 2, textTransform: 'uppercase', fontSize: 13 }}>Insurance Accepted</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {insurances.map((ins, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 40, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: 13, color: 'rgba(240,244,248,0.65)', fontWeight: 500 }}>{ins.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section style={{ padding: '100px 24px', background: '#0d1f38' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 40, background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>FAQ</div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>Common Questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ borderRadius: 16, border: `1px solid ${faqOpen === i ? primaryColor + '40' : 'rgba(255,255,255,0.07)'}`, background: faqOpen === i ? `${primaryColor}08` : 'rgba(255,255,255,0.02)', overflow: 'hidden', transition: 'all .2s' }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: faqOpen === i ? '#fff' : 'rgba(240,244,248,0.8)', paddingRight: 16 }}>{f.question}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={faqOpen === i ? primaryColor : 'rgba(240,244,248,0.4)'} strokeWidth="2" style={{ flexShrink: 0, transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: '0 24px 20px', fontSize: 14, color: 'rgba(240,244,248,0.5)', lineHeight: 1.75 }}>{f.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" style={{ padding: '100px 24px', background: '#0a1628' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 40, background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Contact Us</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 16 }}>Get in Touch</h2>
            <p style={{ fontSize: 16, color: 'rgba(240,244,248,0.5)', maxWidth: 440, margin: '0 auto' }}>Our team is here to help. Reach out to schedule or ask any questions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .06h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>, label: 'Phone', val: contact.phone || 'Not set', href: `tel:${contact.phone}` },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', val: contact.email || 'Not set', href: `mailto:${contact.email}` },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Address', val: contact.address || 'Not set' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Hours', val: contact.hours || 'Mon–Fri 8am–6pm' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${primaryColor}18`, border: `1px solid ${primaryColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(240,244,248,0.4)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>{item.label.toUpperCase()}</div>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 15, color: 'rgba(240,244,248,0.8)', fontWeight: 500, textDecoration: 'none' }}>{item.val}</a>
                    ) : (
                      <span style={{ fontSize: 15, color: 'rgba(240,244,248,0.8)', fontWeight: 500 }}>{item.val}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${primaryColor}25`, minHeight: 320 }}>
              {contact.mapEmbed ? (
                <iframe src={contact.mapEmbed} width="100%" height="100%" style={{ border: 0, minHeight: 320 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              ) : (
                <div style={{ width: '100%', height: '100%', minHeight: 320, background: `linear-gradient(135deg, ${primaryColor}10, #0d1f38)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={`${primaryColor}50`} strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <p style={{ color: 'rgba(240,244,248,0.3)', fontSize: 13 }}>Add map embed URL</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#060f1e', borderTop: `1px solid ${primaryColor}15`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {branding.logoUrl
              ? <img src={branding.logoUrl} alt={navTitle} style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'contain' }} />
              : <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
            }
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{navTitle}</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(240,244,248,0.3)' }}>{footer.tagline || 'Advanced healthcare for a healthier tomorrow'}</p>
          <p style={{ fontSize: 12, color: 'rgba(240,244,248,0.25)' }}>{footer.copyright || `© ${new Date().getFullYear()} All rights reserved`}</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .pulse-desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .pulse-mobile-menu { display: none !important; }
        }
        @keyframes pulse-scroll {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.3; transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}
