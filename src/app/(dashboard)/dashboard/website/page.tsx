'use client';

import { useEffect, useState } from 'react';
import {
  Globe, Save, Eye, EyeOff, Loader2, ChevronDown, ChevronUp,
  Plus, Trash2, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getAgents } from '@/services/agents';
import type { Agent } from '@/types';
import type {
  WebsiteTemplate, WebsiteFontStyle, WebsiteContent,
  WebsiteService, WebsiteTeamMember, WebsiteTestimonial, WebsiteInsurance,
} from '@/types';
import { TemplateClarity } from '@/components/website/TemplateClarity';
import { TemplatePulse } from '@/components/website/TemplatePulse';
import { TemplateSerenity } from '@/components/website/TemplateSerenity';
import { WebsiteSubscriptionModal } from '@/components/website/WebsiteSubscriptionModal';
import { ImageUploader } from '@/components/website/ImageUploader';

type Section = 'branding' | 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'insurances' | 'faq' | 'contact' | 'footer';

function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="wb-label">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.2)', fontSize: 12, color: 'var(--text-1)', resize: 'vertical', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.2)', fontSize: 12, color: 'var(--text-1)', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      )}
    </div>
  );
}

function SectionPanel({ id, label, children, activeSection, setActiveSection }: {
  id: Section; label: string; children: React.ReactNode;
  activeSection: Section | null; setActiveSection: (s: Section | null) => void;
}) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid rgba(13,115,119,0.15)', marginBottom: 8, overflow: 'hidden' }}>
      <button onClick={() => setActiveSection(activeSection === id ? null : id)}
        style={{ width: '100%', background: activeSection === id ? 'rgba(13,115,119,0.08)' : 'rgba(13,115,119,0.03)', border: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{label}</span>
        {activeSection === id ? <ChevronUp className="w-4 h-4" style={{ color: '#0d7377' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-3)' }} />}
      </button>
      {activeSection === id && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(13,115,119,0.10)', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

const TEMPLATES: { id: WebsiteTemplate; label: string; desc: string; preview: string }[] = [
  { id: 'clarity', label: 'Clarity', desc: 'Clean · Minimal · White', preview: 'bg-white border-teal-200' },
  { id: 'pulse', label: 'Pulse', desc: 'Bold · Dark · Modern', preview: 'bg-[#0a1628] border-teal-600' },
  { id: 'serenity', label: 'Serenity', desc: 'Warm · Soft · Elegant', preview: 'bg-[#fdfaf7] border-orange-200' },
];

const FONTS: { id: WebsiteFontStyle; label: string }[] = [
  { id: 'inter', label: 'Inter (Sans)' },
  { id: 'playfair', label: 'Playfair (Serif)' },
  { id: 'poppins', label: 'Poppins (Round)' },
];

const defaultContent = (): WebsiteContent => ({
  hero: {
    headline: 'Expert Healthcare, Compassionate Care',
    subheadline: 'We provide comprehensive medical services tailored to your unique health needs with a team of dedicated professionals.',
    ctaPrimary: 'Book Appointment',
    ctaSecondary: 'Call Now',
    yearsExperience: '15',
    patientsServed: '10000',
    satisfactionRate: '98',
  },
  about: {
    headline: 'Dedicated to Your Health & Wellbeing',
    mission: 'We believe every patient deserves personalized, compassionate care. Our team combines decades of expertise with the latest medical advances.',
    badges: ['Board Certified Physicians', 'Accepting New Patients', 'Telehealth Available', 'Insurance Accepted'],
  },
  services: [
    { name: 'General Practice', description: 'Comprehensive primary care for all ages including annual check-ups and preventive screenings.', icon: '🩺', duration: '30 min', price: 'From $80' },
    { name: 'Cardiology', description: 'Expert heart care including ECG, echocardiography, and cardiovascular risk assessment.', icon: '❤️', duration: '45 min', price: 'From $150' },
    { name: 'Pediatrics', description: 'Specialized care for infants, children, and adolescents including vaccinations and growth monitoring.', icon: '👶', duration: '30 min', price: 'From $90' },
  ],
  team: [
    { name: 'Dr. Sarah Johnson', role: 'Chief Medical Officer', bio: 'Board-certified physician with 20 years of experience in internal medicine.' },
    { name: 'Dr. Michael Chen', role: 'Cardiologist', bio: 'Specialist in cardiovascular disease with expertise in non-invasive cardiology.' },
    { name: 'Dr. Emily Rodriguez', role: 'Pediatrician', bio: 'Dedicated to children\'s health with a gentle, family-centered approach.' },
  ],
  testimonials: [
    { name: 'Sarah M.', quote: 'Absolutely exceptional care. The team was professional, warm, and thorough. I felt truly listened to.', rating: 5, condition: 'General Practice Patient' },
    { name: 'James T.', quote: 'The AI assistant helped me book an appointment at midnight when I had an urgent concern. Amazing service!', rating: 5, condition: 'Cardiology Patient' },
    { name: 'Linda K.', quote: 'Best pediatric care in the city. Dr. Rodriguez is wonderful with my kids. Highly recommend!', rating: 5, condition: 'Pediatrics Patient' },
  ],
  insurances: [
    { name: 'Blue Cross Blue Shield' }, { name: 'Aetna' }, { name: 'UnitedHealthcare' },
    { name: 'Cigna' }, { name: 'Medicare' }, { name: 'Medicaid' },
  ],
  faq: [
    { question: 'How do I book an appointment?', answer: 'You can book via our AI voice assistant 24/7, call our office directly, or use the Book Appointment button on this page.' },
    { question: 'Do you accept walk-ins?', answer: 'We recommend booking in advance, but we do accept same-day appointments based on availability. Call us first to check.' },
    { question: 'What insurance plans do you accept?', answer: 'We accept most major insurance plans including Blue Cross, Aetna, UnitedHealthcare, Cigna, Medicare, and Medicaid.' },
    { question: 'Is telehealth available?', answer: 'Yes! We offer virtual consultations for many conditions. Ask about telehealth when booking your appointment.' },
  ],
  contact: {
    phone: '(555) 123-4567',
    email: 'hello@yourclinic.com',
    address: '123 Medical Center Drive, Suite 100, Your City, ST 12345',
    hours: 'Mon–Fri 8am–6pm · Sat 9am–2pm',
  },
  footer: {
    tagline: 'Compassionate healthcare for your whole family.',
    copyright: `© ${new Date().getFullYear()} Your Clinic · All rights reserved`,
  },
});

export default function WebsitePage() {
  const { business } = useBusinessStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [website, setWebsite] = useState<{ id?: string; slug?: string; is_published?: boolean; subscription_active?: boolean; subscription_paid_at?: string } | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const [template, setTemplate] = useState<WebsiteTemplate>('clarity');
  const [primaryColor, setPrimaryColor] = useState('#0d7377');
  const [secondaryColor, setSecondaryColor] = useState('#14a8b5');
  const [fontStyle, setFontStyle] = useState<WebsiteFontStyle>('inter');
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [agentId, setAgentId] = useState<string>('');
  const [content, setContent] = useState<WebsiteContent>(defaultContent());
  const [agents, setAgents] = useState<Agent[]>([]);

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!business) return;
    const load = async () => {
      const [agentData, res] = await Promise.all([
        getAgents(business.id),
        fetch(`/api/website/get?businessId=${business.id}`),
      ]);
      setAgents(agentData);
      const json = await res.json();
      if (json.website) {
        const w = json.website;
        setWebsite(w);
        setTemplate(w.template || 'clarity');
        setPrimaryColor(w.primary_color || '#0d7377');
        setSecondaryColor(w.secondary_color || '#14a8b5');
        setFontStyle(w.font_style || 'inter');
        setSlug(w.slug || '');
        setAgentId(w.agent_id || '');
        if (w.content && Object.keys(w.content).length > 0) setContent(w.content);
      } else {
        // Auto-generate slug from business name
        const autoSlug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setSlug(autoSlug);
      }
      setLoading(false);
    };
    load();
  }, [business]);

  // Debounced slug uniqueness check
  useEffect(() => {
    if (!slug || !business) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/website/check-slug?slug=${encodeURIComponent(slug)}&businessId=${business.id}`);
        const json = await res.json();
        setSlugAvailable(json.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, business]);

  const handleSave = async () => {
    if (!business || !slug) return;
    if (slugAvailable === false) { setSaveMsg('Site URL is already taken'); return; }
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/website/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, slug, template, primary_color: primaryColor, secondary_color: secondaryColor, font_style: fontStyle, content, agent_id: agentId || null }),
      });
      const json = await res.json();
      if (json.website) setWebsite(json.website);
      setSaveMsg('Saved!');
    } catch {
      setSaveMsg('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 2500);
    }
  };

  const handlePublish = async (publish: boolean) => {
    if (!business) return;
    if (publish && !website?.subscription_active) {
      setShowSubscribeModal(true);
      return;
    }
    setPublishing(true);
    try {
      await handleSave();
      const res = await fetch('/api/website/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, publish }),
      });
      const json = await res.json();
      if (res.ok) {
        setWebsite(prev => ({ ...prev, is_published: publish }));
      } else {
        alert(json.error || 'Publish failed');
      }
    } catch {
      alert('Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const setBranding = (k: string, v: string) => setContent(c => ({ ...c, branding: { ...c.branding, [k]: v } }));
  const setHero = (k: string, v: string) => setContent(c => ({ ...c, hero: { ...c.hero, [k]: v } }));
  const setAbout = (k: string, v: string | string[]) => setContent(c => ({ ...c, about: { ...c.about, [k]: v } }));
  const setContactField = (k: string, v: string) => setContent(c => ({ ...c, contact: { ...c.contact, [k]: v } }));
  const setFooter = (k: string, v: string) => setContent(c => ({ ...c, footer: { ...c.footer, [k]: v } }));

  const addService = () => setContent(c => ({ ...c, services: [...(c.services || []), { name: 'New Service', description: 'Description', icon: '🏥', duration: '30 min', price: '' }] }));
  const updateService = (i: number, k: keyof WebsiteService, v: string) => setContent(c => {
    const s = [...(c.services || [])]; s[i] = { ...s[i], [k]: v }; return { ...c, services: s };
  });
  const removeService = (i: number) => setContent(c => ({ ...c, services: (c.services || []).filter((_, j) => j !== i) }));

  const addTeam = () => setContent(c => ({ ...c, team: [...(c.team || []), { name: 'Dr. Name', role: 'Specialist', bio: '' }] }));
  const updateTeam = (i: number, k: keyof WebsiteTeamMember, v: string) => setContent(c => {
    const t = [...(c.team || [])]; t[i] = { ...t[i], [k]: v }; return { ...c, team: t };
  });
  const removeTeam = (i: number) => setContent(c => ({ ...c, team: (c.team || []).filter((_, j) => j !== i) }));

  const addTestimonial = () => setContent(c => ({ ...c, testimonials: [...(c.testimonials || []), { name: 'Patient Name', quote: 'Great experience!', rating: 5 }] }));
  const updateTestimonial = (i: number, k: keyof WebsiteTestimonial, v: string | number) => setContent(c => {
    const t = [...(c.testimonials || [])]; t[i] = { ...t[i], [k]: v }; return { ...c, testimonials: t };
  });
  const removeTestimonial = (i: number) => setContent(c => ({ ...c, testimonials: (c.testimonials || []).filter((_, j) => j !== i) }));

  const addInsurance = () => setContent(c => ({ ...c, insurances: [...(c.insurances || []), { name: 'Insurance Name' }] }));
  const updateInsurance = (i: number, v: string) => setContent(c => {
    const ins = [...(c.insurances || [])]; ins[i] = { name: v }; return { ...c, insurances: ins };
  });
  const removeInsurance = (i: number) => setContent(c => ({ ...c, insurances: (c.insurances || []).filter((_, j) => j !== i) }));

  const addFaq = () => setContent(c => ({ ...c, faq: [...(c.faq || []), { question: 'New question?', answer: 'Answer here.' }] }));
  const updateFaq = (i: number, k: 'question' | 'answer', v: string) => setContent(c => {
    const f = [...(c.faq || [])]; f[i] = { ...f[i], [k]: v }; return { ...c, faq: f };
  });
  const removeFaq = (i: number) => setContent(c => ({ ...c, faq: (c.faq || []).filter((_, j) => j !== i) }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0d7377' }} />
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Loading website builder…</p>
      </div>
    );
  }

  const TemplateRenderer = template === 'clarity' ? TemplateClarity : template === 'pulse' ? TemplatePulse : TemplateSerenity;
  const isSubscribed = !!website?.subscription_active;
  const isPublished = !!website?.is_published;

  return (
    <>
    <div className="website-builder-root">

      {/* ── TOP BAR ── */}
      <div className="website-builder-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0d7377, #14a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Website Builder</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>
              {isPublished ? <span style={{ color: '#059669' }}>● Live at /sites/{slug}</span> : isSubscribed ? '○ Draft — not published' : '🔒 Design free · 1 USDC/mo to publish'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setPreviewMode(!previewMode)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.25)', background: previewMode ? 'rgba(13,115,119,0.08)' : '#fff', color: '#0d7377', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Eye className="w-3.5 h-3.5" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>

          <button onClick={handleSave} disabled={saving || slugAvailable === false}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.25)', background: '#fff', color: slugAvailable === false ? '#9ca3af' : '#0d7377', fontSize: 12, fontWeight: 600, cursor: saving || slugAvailable === false ? 'not-allowed' : 'pointer' }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saveMsg || 'Save'}
          </button>

          {isPublished ? (
            <button onClick={() => handlePublish(false)} disabled={publishing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
              Unpublish
            </button>
          ) : (
            <button onClick={() => handlePublish(true)} disabled={publishing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none' }}>
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              Publish
            </button>
          )}

          {isPublished && slug && (
            <a href={`/sites/${slug}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <ExternalLink className="w-3.5 h-3.5" />
              View Live
            </a>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="website-builder-body">

        {/* LEFT PANEL — scrollable editor */}
        {!previewMode && (
          <div className="website-builder-panel">

            {/* ─ DESIGN ─ */}
            <div className="wb-section-header">Design</div>

            {/* Template picker */}
            <div className="wb-field-group">
              <label className="wb-label">TEMPLATE</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: template === t.id ? '2px solid #0d7377' : '1px solid rgba(13,115,119,0.15)', background: template === t.id ? 'rgba(13,115,119,0.08)' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ height: 24, borderRadius: 5, marginBottom: 5, background: t.id === 'clarity' ? '#f0f9ff' : t.id === 'pulse' ? '#0a1628' : '#fdfaf7', border: '1px solid', borderColor: t.id === 'clarity' ? '#b3e0e5' : t.id === 'pulse' ? '#0d7377' : '#e8d5c5' }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: template === t.id ? '#0d7377' : 'var(--text-2)' }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="wb-field-group">
              {[{ label: 'Primary Color', val: primaryColor, set: setPrimaryColor }, { label: 'Secondary Color', val: secondaryColor, set: setSecondaryColor }].map(c => (
                <div key={c.label}>
                  <label className="wb-label">{c.label.toUpperCase()}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.2)', background: '#fff' }}>
                    <input type="color" value={c.val} onChange={e => c.set(e.target.value)} style={{ width: 22, height: 22, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'monospace' }}>{c.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Font */}
            <div className="wb-field-group">
              <label className="wb-label">FONT</label>
              <select value={fontStyle} onChange={e => setFontStyle(e.target.value as WebsiteFontStyle)} className="wb-select">
                {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>

            {/* Slug */}
            <div className="wb-field-group">
              <label className="wb-label">SITE URL</label>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: 8, border: `1px solid ${slugAvailable === false ? '#fca5a5' : slugAvailable === true ? 'rgba(34,197,94,0.4)' : 'rgba(13,115,119,0.2)'}`, background: '#fff', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>/sites/</span>
                <input value={slug} onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugAvailable(null); }}
                  placeholder="your-clinic" className="wb-input-bare" />
                {slugChecking && <span style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>…</span>}
                {!slugChecking && slugAvailable === true && <span style={{ fontSize: 11, color: '#16a34a', whiteSpace: 'nowrap' }}>✓ Available</span>}
                {!slugChecking && slugAvailable === false && <span style={{ fontSize: 11, color: '#dc2626', whiteSpace: 'nowrap' }}>✗ Taken</span>}
              </div>
              {slugAvailable === false && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>This URL is already in use. Choose a different one.</p>}
            </div>

            {/* AI Agent */}
            <div className="wb-field-group">
              <label className="wb-label">AI AGENT</label>
              <select value={agentId} onChange={e => setAgentId(e.target.value)} className="wb-select">
                <option value="">No agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* ─ CONTENT ─ */}
            <div className="wb-section-header" style={{ marginTop: 8 }}>Content</div>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="branding" label="Branding">
              <ImageUploader
                label="Logo"
                value={content.branding?.logoUrl || ''}
                onChange={v => setBranding('logoUrl', v)}
                folder="logo"
                aspectHint="1:1"
              />
              <Field label="Site Title" value={content.branding?.siteTitle || ''} onChange={v => setBranding('siteTitle', v)} placeholder="Your Clinic Name" />
              <Field label="Site Description" value={content.branding?.siteDescription || ''} onChange={v => setBranding('siteDescription', v)} multiline placeholder="A short tagline shown in search engines and browser tabs." />
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="hero" label="Hero Section">
              <Field label="Headline" value={content.hero?.headline || ''} onChange={v => setHero('headline', v)} />
              <Field label="Subheadline" value={content.hero?.subheadline || ''} onChange={v => setHero('subheadline', v)} multiline />
              <ImageUploader label="Hero Image" value={content.hero?.heroImage || ''} onChange={v => setHero('heroImage', v)} folder="hero" aspectHint="4:3" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="CTA Primary" value={content.hero?.ctaPrimary || ''} onChange={v => setHero('ctaPrimary', v)} />
                <Field label="CTA Secondary" value={content.hero?.ctaSecondary || ''} onChange={v => setHero('ctaSecondary', v)} />
                <Field label="Years Exp." value={content.hero?.yearsExperience || ''} onChange={v => setHero('yearsExperience', v)} />
                <Field label="Patients" value={content.hero?.patientsServed || ''} onChange={v => setHero('patientsServed', v)} />
                <Field label="Satisfaction %" value={content.hero?.satisfactionRate || ''} onChange={v => setHero('satisfactionRate', v)} />
              </div>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="about" label="About Section">
              <Field label="Headline" value={content.about?.headline || ''} onChange={v => setAbout('headline', v)} />
              <Field label="Mission" value={content.about?.mission || ''} onChange={v => setAbout('mission', v)} multiline />
              <Field label="Story (optional)" value={content.about?.story || ''} onChange={v => setAbout('story', v)} multiline />
              <ImageUploader label="About Photo" value={content.about?.image || ''} onChange={v => setAbout('image', v)} folder="about" aspectHint="4:3" />
              <label className="wb-label" style={{ display: 'block', marginBottom: 6 }}>TRUST BADGES (one per line)</label>
              <textarea value={(content.about?.badges || []).join('\n')} onChange={e => setAbout('badges', e.target.value.split('\n'))} rows={4}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.2)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="services" label="Services">
              {(content.services || []).map((s, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(13,115,119,0.12)', marginBottom: 10, background: 'rgba(13,115,119,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d7377' }}>Service {i + 1}</span>
                    <button onClick={() => removeService(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 8 }}>
                    <Field label="Icon" value={s.icon || ''} onChange={v => updateService(i, 'icon', v)} />
                    <Field label="Name" value={s.name} onChange={v => updateService(i, 'name', v)} />
                  </div>
                  <Field label="Description" value={s.description} onChange={v => updateService(i, 'description', v)} multiline />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Field label="Duration" value={s.duration || ''} onChange={v => updateService(i, 'duration', v)} placeholder="30 min" />
                    <Field label="Price" value={s.price || ''} onChange={v => updateService(i, 'price', v)} placeholder="From $80" />
                  </div>
                </div>
              ))}
              <button onClick={addService} className="wb-add-btn"><Plus className="w-3.5 h-3.5" /> Add Service</button>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="team" label="Team Members">
              {(content.team || []).map((m, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(13,115,119,0.12)', marginBottom: 10, background: 'rgba(13,115,119,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d7377' }}>Member {i + 1}</span>
                    <button onClick={() => removeTeam(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <Field label="Name" value={m.name} onChange={v => updateTeam(i, 'name', v)} />
                  <Field label="Role / Title" value={m.role} onChange={v => updateTeam(i, 'role', v)} />
                  <Field label="Bio" value={m.bio || ''} onChange={v => updateTeam(i, 'bio', v)} multiline />
                  <ImageUploader label="Photo" value={m.image || ''} onChange={v => updateTeam(i, 'image', v)} folder="team" aspectHint="1:1" />
                </div>
              ))}
              <button onClick={addTeam} className="wb-add-btn"><Plus className="w-3.5 h-3.5" /> Add Team Member</button>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="testimonials" label="Testimonials">
              {(content.testimonials || []).map((t, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(13,115,119,0.12)', marginBottom: 10, background: 'rgba(13,115,119,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d7377' }}>Review {i + 1}</span>
                    <button onClick={() => removeTestimonial(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <Field label="Patient Name" value={t.name} onChange={v => updateTestimonial(i, 'name', v)} />
                  <Field label="Quote" value={t.quote} onChange={v => updateTestimonial(i, 'quote', v)} multiline />
                  <Field label="Condition / Type" value={t.condition || ''} onChange={v => updateTestimonial(i, 'condition', v)} placeholder="General Practice Patient" />
                  <div style={{ marginBottom: 8 }}>
                    <label className="wb-label" style={{ display: 'block', marginBottom: 4 }}>RATING</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => updateTestimonial(i, 'rating', n)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid', borderColor: (t.rating || 5) >= n ? '#f59e0b' : 'rgba(13,115,119,0.15)', background: (t.rating || 5) >= n ? '#fef3c7' : '#fff', cursor: 'pointer', fontSize: 14 }}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addTestimonial} className="wb-add-btn"><Plus className="w-3.5 h-3.5" /> Add Testimonial</button>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="insurances" label="Insurance Accepted">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {(content.insurances || []).map((ins, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={ins.name} onChange={e => updateInsurance(i, e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.2)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={() => removeInsurance(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button onClick={addInsurance} className="wb-add-btn"><Plus className="w-3.5 h-3.5" /> Add Insurance</button>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="faq" label="FAQ">
              {(content.faq || []).map((f, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(13,115,119,0.12)', marginBottom: 10, background: 'rgba(13,115,119,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d7377' }}>Q{i + 1}</span>
                    <button onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <Field label="Question" value={f.question} onChange={v => updateFaq(i, 'question', v)} />
                  <Field label="Answer" value={f.answer} onChange={v => updateFaq(i, 'answer', v)} multiline />
                </div>
              ))}
              <button onClick={addFaq} className="wb-add-btn"><Plus className="w-3.5 h-3.5" /> Add FAQ</button>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="contact" label="Contact Info">
              <Field label="Phone" value={content.contact?.phone || ''} onChange={v => setContactField('phone', v)} placeholder="(555) 123-4567" />
              <Field label="Email" value={content.contact?.email || ''} onChange={v => setContactField('email', v)} placeholder="hello@clinic.com" />
              <Field label="Address" value={content.contact?.address || ''} onChange={v => setContactField('address', v)} multiline />
              <Field label="Hours" value={content.contact?.hours || ''} onChange={v => setContactField('hours', v)} placeholder="Mon–Fri 8am–6pm" />
              {/* Google Maps — accepts coordinates, any Maps URL, or short link */}
              <div style={{ marginBottom: 10 }}>
                <label className="wb-label">Google Maps</label>
                <input
                  value={content.contact?.mapEmbed || ''}
                  onChange={e => {
                    const raw = e.target.value.trim();
                    if (!raw) { setContactField('mapEmbed', ''); return; }

                    // "lat, lng" or "lat,lng" typed/pasted directly
                    const bareCoords = raw.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
                    if (bareCoords) {
                      setContactField('mapEmbed', `https://maps.google.com/maps?q=${bareCoords[1]},${bareCoords[2]}&output=embed&z=17`); return;
                    }
                    // Already a working embed URL — use as-is
                    if (raw.includes('/maps/embed') || (raw.includes('maps.google.com/maps') && raw.includes('output=embed'))) {
                      setContactField('mapEmbed', raw); return;
                    }
                    // Full Maps URL with @lat,lng in it
                    const atCoords = raw.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/);
                    if (atCoords) {
                      setContactField('mapEmbed', `https://maps.google.com/maps?q=${atCoords[1]},${atCoords[2]}&output=embed&z=17`); return;
                    }
                    // Place name in URL
                    const placeMatch = raw.match(/\/maps\/place\/([^/@?]+)/);
                    if (placeMatch) {
                      setContactField('mapEmbed', `https://maps.google.com/maps?q=${placeMatch[1]}&output=embed`); return;
                    }
                    // Fallback: store raw (user may have pasted a partial value mid-type)
                    setContactField('mapEmbed', raw);
                  }}
                  placeholder="e.g. 22.5452, 88.3217  or paste any Google Maps URL"
                  style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: '1px solid rgba(13,115,119,0.2)', fontSize: 12, color: 'var(--text-1)', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                {content.contact?.mapEmbed && (content.contact.mapEmbed.includes('output=embed') || content.contact.mapEmbed.includes('/maps/embed')) ? (
                  <p style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>Map ready to embed.</p>
                ) : content.contact?.mapEmbed ? (
                  <p style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>
                    Paste coordinates (e.g. 22.5452, 88.3217) or a full Google Maps link.
                  </p>
                ) : (
                  <p style={{ fontSize: 11, color: 'rgba(13,115,119,0.5)', marginTop: 4 }}>
                    Tip: paste GPS coordinates for the most accurate pin location.
                  </p>
                )}
              </div>
            </SectionPanel>

            <SectionPanel activeSection={activeSection} setActiveSection={setActiveSection} id="footer" label="Footer">
              <Field label="Tagline" value={content.footer?.tagline || ''} onChange={v => setFooter('tagline', v)} />
              <Field label="Copyright Text" value={content.footer?.copyright || ''} onChange={v => setFooter('copyright', v)} />
            </SectionPanel>

            {/* bottom padding so last item clears */}
            <div style={{ height: 32 }} />
          </div>
        )}

        {/* RIGHT — PREVIEW (scrollable) */}
        <div className="website-builder-preview">
          <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '8px 16px', borderBottom: '1px solid rgba(13,115,119,0.08)', background: '#f8fafa', flexShrink: 0 }}>
            Preview · <strong>{template.charAt(0).toUpperCase() + template.slice(1)}</strong> template
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <TemplateRenderer
              content={content}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              fontStyle={fontStyle}
              agentId={agentId || null}
              businessId={business?.id || ''}
              appUrl=""
              preview
            />
          </div>
        </div>
      </div>

      <style>{`
        .website-builder-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        /* Disable parent main scroll when builder is mounted */
        main:has(.website-builder-root) {
          overflow: hidden !important;
        }
        main:has(.website-builder-root) > div {
          padding: 0 !important;
          max-width: none !important;
          margin: 0 !important;
          height: 100%;
        }

        .website-builder-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 52px;
          flex-shrink: 0;
          background: #fff;
          border-bottom: 1px solid rgba(13,115,119,0.12);
          gap: 12px;
        }
        .website-builder-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .website-builder-panel {
          width: 320px;
          flex-shrink: 0;
          overflow-y: auto;
          overflow-x: hidden;
          background: #f8fafa;
          border-right: 1px solid rgba(13,115,119,0.12);
          padding: 16px 14px;
          box-sizing: border-box;
        }
        .website-builder-preview {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .wb-section-header {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-3);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(13,115,119,0.10);
        }
        .wb-field-group {
          margin-bottom: 12px;
        }
        .wb-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-3);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .wb-select {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(13,115,119,0.2);
          font-size: 13px;
          color: var(--text-1);
          background: #fff;
          outline: none;
          font-family: inherit;
        }
        .wb-input-bare {
          flex: 1;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text-1);
          background: none;
          font-family: inherit;
          min-width: 0;
        }
        .wb-add-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 0;
          border-radius: 10px;
          border: 1px dashed rgba(13,115,119,0.3);
          background: none;
          color: #0d7377;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .wb-add-btn:hover {
          background: rgba(13,115,119,0.04);
        }
      `}</style>
    </div>

    {/* Subscription modal — rendered outside builder root to avoid overflow:hidden clip */}
    {showSubscribeModal && business && (
      <WebsiteSubscriptionModal
        businessId={business.id}
        onSuccess={async () => {
          setShowSubscribeModal(false);
          setWebsite(prev => ({ ...prev, subscription_active: true }));
          // Call publish API directly — can't use handlePublish here because
          // the subscription_active state update hasn't flushed yet
          setPublishing(true);
          try {
            await handleSave();
            const res = await fetch('/api/website/publish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ businessId: business.id, publish: true }),
            });
            const json = await res.json();
            if (res.ok) {
              setWebsite(prev => ({ ...prev, is_published: true }));
            } else {
              alert(json.error || 'Publish failed');
            }
          } catch {
            alert('Publish failed');
          } finally {
            setPublishing(false);
          }
        }}
        onClose={() => setShowSubscribeModal(false)}
      />
    )}
    </>
  );
}
