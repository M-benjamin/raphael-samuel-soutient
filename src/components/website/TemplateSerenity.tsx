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

export function TemplateSerenity({ content, primaryColor, secondaryColor, fontStyle, businessId, agentId, appUrl, preview }: Props) {
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

  const navTitle = branding.siteTitle || 'Serenity Care';

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

  /* warm background derived from primaryColor with very low opacity */
  const warmBg = '#fdfaf7';
  const warmCard = '#fff9f5';

  return (
    <div style={{ fontFamily: font, background: warmBg, color: '#2d2320', margin: 0, padding: 0 }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(253,250,247,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(45,35,32,0.08)', boxShadow: '0 2px 20px rgba(45,35,32,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {branding.logoUrl
              ? <img src={branding.logoUrl} alt={navTitle} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'contain', background: '#fff9f5', border: '1px solid rgba(45,35,32,0.1)' }} />
              : <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </div>
            }
            <span style={{ fontSize: 19, fontWeight: 700, color: '#2d2320', letterSpacing: '-0.3px' }}>{navTitle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="seren-desktop-nav">
            {['Services', 'About', 'Team', 'Reviews', 'Contact'].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} style={{ color: 'rgba(45,35,32,0.6)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = primaryColor)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(45,35,32,0.6)')}
              >{n}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {contact.phone && (
              <button onClick={() => { if (typeof window !== 'undefined' && (window as any).__mediCallOpen) (window as any).__mediCallOpen('call'); }} style={{ padding: '9px 20px', borderRadius: 40, background: primaryColor, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 16px ${primaryColor}35` }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .06h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>
                {contact.phone}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="seren-mobile-menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d2320', padding: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: warmBg, borderTop: '1px solid rgba(45,35,32,0.06)', padding: '12px 24px 16px' }}>
            {['Services', 'About', 'Team', 'Reviews', 'Contact'].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'rgba(45,35,32,0.7)', fontSize: 15, fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(45,35,32,0.05)' }}>{n}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" style={{ padding: '72px 24px 80px', background: warmBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 40, background: `${primaryColor}12`, border: `1px solid ${primaryColor}25`, marginBottom: 28 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={primaryColor} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: primaryColor }}>Trusted by thousands of patients</span>
            </div>

            <h1 style={{ fontSize: 'clamp(34px, 4.5vw, 58px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#2d2320', marginBottom: 20 }}>
              {h.headline || 'Healing with Heart, Expertise with Care'}
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(45,35,32,0.6)', marginBottom: 36, maxWidth: 460 }}>
              {h.subheadline || 'Where compassionate care meets clinical excellence. Your health journey starts here, guided by our dedicated team of specialists.'}
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <button onClick={() => { if (typeof window !== 'undefined' && (window as any).__mediCallOpen) (window as any).__mediCallOpen('book'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 40, background: primaryColor, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: `0 8px 28px ${primaryColor}35` }}>
                Book Appointment
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <a href="#services" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 40, background: 'transparent', border: `1.5px solid ${primaryColor}40`, color: primaryColor, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                View Services
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { val: h.yearsExperience ? `${h.yearsExperience}+` : '20+', label: 'Years Experience' },
                { val: h.patientsServed ? `${Number(h.patientsServed) >= 1000 ? Math.round(Number(h.patientsServed)/1000) + 'k+' : h.patientsServed+'+'}` : '30k+', label: 'Happy Patients' },
                { val: h.satisfactionRate ? `${h.satisfactionRate}%` : '99%', label: 'Satisfaction' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: primaryColor, letterSpacing: '-0.5px' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: 'rgba(45,35,32,0.45)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image mosaic */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {h.heroImage ? (
                <img src={h.heroImage} alt="Doctor" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 28, boxShadow: '0 20px 60px rgba(45,35,32,0.12)' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 28, background: `linear-gradient(145deg, ${primaryColor}15 0%, ${secondaryColor}10 100%)`, border: `1px solid ${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={`${primaryColor}80`} strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  <p style={{ color: `${primaryColor}60`, fontSize: 12 }}>Upload hero image</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 32 }}>
              <div style={{ borderRadius: 24, background: warmCard, border: '1px solid rgba(45,35,32,0.06)', padding: 20, boxShadow: '0 8px 32px rgba(45,35,32,0.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${primaryColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2d2320', marginBottom: 4 }}>AI Voice Care</div>
                <div style={{ fontSize: 12, color: 'rgba(45,35,32,0.45)', lineHeight: 1.5 }}>24/7 instant health guidance</div>
              </div>
              <div style={{ borderRadius: 24, background: primaryColor, padding: 20, boxShadow: `0 12px 40px ${primaryColor}35` }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>A+</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>Accreditation Rating</div>
              </div>
              <div style={{ borderRadius: 24, background: warmCard, border: '1px solid rgba(45,35,32,0.06)', padding: 20, boxShadow: '0 8px 32px rgba(45,35,32,0.06)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(j => <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(45,35,32,0.5)', lineHeight: 1.5 }}>"Best care I've ever received"</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section id="services" style={{ padding: '100px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>What We Offer</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#2d2320', letterSpacing: '-1px', marginBottom: 14 }}>Our Specialties</h2>
              <p style={{ fontSize: 16, color: 'rgba(45,35,32,0.5)', maxWidth: 480, margin: '0 auto' }}>Comprehensive care for your whole family delivered with warmth and precision.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {services.map((s, i) => (
                <div key={i} style={{ borderRadius: 24, background: warmCard, border: '1px solid rgba(45,35,32,0.06)', padding: 28, boxShadow: '0 4px 24px rgba(45,35,32,0.05)', transition: 'all .25s', cursor: 'default' }}
                  onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-4px)'; d.style.boxShadow = `0 16px 48px ${primaryColor}18`; }}
                  onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(0)'; d.style.boxShadow = '0 4px 24px rgba(45,35,32,0.05)'; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: `${primaryColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>
                    {s.icon || '🌿'}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d2320', marginBottom: 10 }}>{s.name}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(45,35,32,0.55)', lineHeight: 1.75, marginBottom: 16 }}>{s.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(45,35,32,0.06)' }}>
                    {s.duration && <span style={{ fontSize: 12, color: 'rgba(45,35,32,0.4)' }}>{s.duration}</span>}
                    {s.price && <span style={{ fontSize: 13, fontWeight: 700, color: primaryColor }}>{s.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section id="about" style={{ padding: '100px 24px', background: warmBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>About Us</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#2d2320', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 }}>
              {ab.headline || 'Rooted in Compassion, Built on Excellence'}
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(45,35,32,0.6)', lineHeight: 1.8, marginBottom: 20 }}>
              {ab.mission || 'Our practice was founded on a simple belief: every patient deserves attentive, personalised care. We take the time to listen, understand, and partner with you on your health journey.'}
            </p>
            {ab.story && <p style={{ fontSize: 15, color: 'rgba(45,35,32,0.5)', lineHeight: 1.8, marginBottom: 32 }}>{ab.story}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {(ab.badges || ['Patient-Centered Philosophy', 'Board Certified Physicians', 'Same-Day Appointments', 'Telehealth Available']).slice(0, 4).map((b: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${primaryColor}15`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(45,35,32,0.7)', fontWeight: 500 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {ab.image ? (
              <img src={ab.image} alt="About" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 32, boxShadow: '0 24px 64px rgba(45,35,32,0.12)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 32, background: `linear-gradient(145deg, ${primaryColor}12 0%, ${secondaryColor}08 100%)`, border: `1px solid ${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={`${primaryColor}40`} strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: -20, left: -20, background: '#fff', borderRadius: 20, padding: '16px 22px', boxShadow: '0 12px 40px rgba(45,35,32,0.1)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2d2320' }}>{h.patientsServed ? `${Number(h.patientsServed) >= 1000 ? Math.round(Number(h.patientsServed)/1000)+'k+' : h.patientsServed+'+'}` : '30k+'}</div>
                <div style={{ fontSize: 12, color: 'rgba(45,35,32,0.5)' }}>Patients helped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      {team.length > 0 && (
        <section id="team" style={{ padding: '100px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Our Team</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#2d2320', letterSpacing: '-1px', marginBottom: 14 }}>Meet Your Caregivers</h2>
              <p style={{ fontSize: 16, color: 'rgba(45,35,32,0.5)', maxWidth: 480, margin: '0 auto' }}>Our physicians bring warmth, expertise, and dedication to every visit.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
              {team.map((m, i) => (
                <div key={i} style={{ borderRadius: 28, overflow: 'hidden', background: warmCard, border: '1px solid rgba(45,35,32,0.06)', boxShadow: '0 4px 24px rgba(45,35,32,0.06)', transition: 'all .25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 56px ${primaryColor}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(45,35,32,0.06)'; }}
                >
                  {m.image ? (
                    <img src={m.image} alt={m.name} style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 260, background: `linear-gradient(145deg, ${primaryColor}12 0%, ${secondaryColor}08 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: primaryColor, fontWeight: 700 }}>
                        {m.name?.[0] || 'D'}
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '20px 22px 24px' }}>
                    <div style={{ fontSize: 11, color: primaryColor, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{m.role}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d2320', marginBottom: 8 }}>{m.name}</h3>
                    {m.bio && <p style={{ fontSize: 13, color: 'rgba(45,35,32,0.5)', lineHeight: 1.6 }}>{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="reviews" style={{ padding: '100px 24px', background: warmBg }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Patient Stories</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#2d2320', letterSpacing: '-1px', marginBottom: 14 }}>Words from Our Patients</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{ borderRadius: 24, background: '#fff', border: '1px solid rgba(45,35,32,0.06)', padding: 28, boxShadow: '0 4px 20px rgba(45,35,32,0.05)' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <svg key={j} width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(45,35,32,0.65)', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(45,35,32,0.06)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: primaryColor, fontWeight: 700 }}>
                      {t.name?.[0] || 'P'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2d2320' }}>{t.name}</div>
                      {t.condition && <div style={{ fontSize: 11, color: 'rgba(45,35,32,0.4)' }}>{t.condition}</div>}
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
        <section style={{ padding: '72px 24px', background: `${primaryColor}06`, borderTop: '1px solid rgba(45,35,32,0.05)', borderBottom: '1px solid rgba(45,35,32,0.05)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(45,35,32,0.45)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 28 }}>We Accept These Insurance Plans</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {insurances.map((ins, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 40, background: '#fff', border: '1px solid rgba(45,35,32,0.08)', boxShadow: '0 2px 12px rgba(45,35,32,0.05)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: 13, color: 'rgba(45,35,32,0.7)', fontWeight: 500 }}>{ins.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section style={{ padding: '100px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>FAQ</p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#2d2320', letterSpacing: '-1px' }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ borderRadius: 18, border: `1px solid ${faqOpen === i ? primaryColor + '30' : 'rgba(45,35,32,0.07)'}`, background: faqOpen === i ? `${primaryColor}05` : '#fff', overflow: 'hidden', transition: 'all .2s' }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: faqOpen === i ? primaryColor : '#2d2320', paddingRight: 16 }}>{f.question}</span>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: faqOpen === i ? `${primaryColor}15` : 'rgba(45,35,32,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={faqOpen === i ? primaryColor : 'rgba(45,35,32,0.4)'} strokeWidth="2.5" style={{ transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: '0 22px 18px', fontSize: 14, color: 'rgba(45,35,32,0.55)', lineHeight: 1.8 }}>{f.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" style={{ padding: '100px 24px', background: warmBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Get in Touch</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#2d2320', letterSpacing: '-1px', marginBottom: 14 }}>We'd Love to Hear from You</h2>
            <p style={{ fontSize: 16, color: 'rgba(45,35,32,0.5)', maxWidth: 440, margin: '0 auto' }}>Reach out to schedule a visit or ask us anything — our friendly team is always here.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.71 13 19.79 19.79 0 011.65 4.4a2 2 0 011.99-2.19h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.29 6.29l1.77-1.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label: 'Phone', val: contact.phone || 'Not set', href: contact.phone ? `tel:${contact.phone}` : undefined },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', val: contact.email || 'Not set', href: contact.email ? `mailto:${contact.email}` : undefined },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Address', val: contact.address || 'Not set' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Hours', val: contact.hours || 'Mon–Fri 8am–6pm' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, borderRadius: 20, background: '#fff', border: '1px solid rgba(45,35,32,0.06)', boxShadow: '0 4px 16px rgba(45,35,32,0.04)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${primaryColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(45,35,32,0.4)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>{item.label.toUpperCase()}</div>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 15, color: '#2d2320', fontWeight: 500, textDecoration: 'none' }}>{item.val}</a>
                    ) : (
                      <span style={{ fontSize: 15, color: '#2d2320', fontWeight: 500 }}>{item.val}</span>
                    )}
                  </div>
                </div>
              ))}

              <button onClick={() => { if (typeof window !== 'undefined' && (window as any).__mediCallOpen) (window as any).__mediCallOpen('book'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 28px', borderRadius: 40, background: primaryColor, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: `0 8px 28px ${primaryColor}35`, marginTop: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Schedule an Appointment
              </button>
            </div>

            <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(45,35,32,0.08)', boxShadow: '0 8px 40px rgba(45,35,32,0.08)', minHeight: 380 }}>
              {contact.mapEmbed ? (
                <iframe src={contact.mapEmbed} width="100%" height="100%" style={{ border: 0, minHeight: 380 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              ) : (
                <div style={{ width: '100%', height: '100%', minHeight: 380, background: `${primaryColor}06`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${primaryColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`${primaryColor}60`} strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <p style={{ color: 'rgba(45,35,32,0.35)', fontSize: 13 }}>Add Google Maps embed URL in contact settings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#2d2320', padding: '48px 24px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {branding.logoUrl
                ? <img src={branding.logoUrl} alt={navTitle} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'contain' }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
              }
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{navTitle}</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>{footer.tagline || 'Healing with heart, excellence in care'}</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Services', 'About', 'Contact'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>{footer.copyright || `© ${new Date().getFullYear()} ${navTitle} · All rights reserved`}</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .seren-desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .seren-mobile-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}
