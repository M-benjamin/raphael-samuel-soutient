'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Plus, Copy, CheckCheck, Trash2, Edit2, Eye,
  Bot, Mic, Sparkles, ChevronRight, CheckCircle2, Phone,
} from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getWidgets, createWidget, updateWidget, deleteWidget } from '@/services/widgets';
import { getAgents } from '@/services/agents';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { widgetSchema, type WidgetFormData } from '@/validations';
import { WIDGET_POSITIONS } from '@/constants';
import { buildEmbedCode, type EmbedFormat } from '@/lib/utils';
import type { EmbeddedWidget, Agent } from '@/types';

/* ── Per-agent colour palette — cycles if more than 8 agents ── */
const AGENT_COLORS = [
  { primary: '#0d7377', accent: '#14a8b5', name: 'Teal' },
  { primary: '#7c3aed', accent: '#a78bfa', name: 'Purple' },
  { primary: '#0369a1', accent: '#38bdf8', name: 'Blue' },
  { primary: '#065f46', accent: '#34d399', name: 'Green' },
  { primary: '#9a3412', accent: '#fb923c', name: 'Orange' },
  { primary: '#be185d', accent: '#f472b6', name: 'Pink' },
  { primary: '#1e3a5f', accent: '#60a5fa', name: 'Navy' },
  { primary: '#3f3f46', accent: '#a1a1aa', name: 'Slate' },
];

/* ── Greeting templates keyed by personality ──────────────── */
const GREETING_BY_PERSONALITY: Record<string, string> = {
  professional: 'Hello! Thank you for contacting us. How may I assist you today?',
  friendly: 'Hi there! 👋 Great to hear from you! What can I help you with?',
  formal: 'Good day. You have reached our virtual receptionist. How may I direct your inquiry?',
  casual: 'Hey! What\'s up? Let me know how I can help!',
};

/* ── Widget FAB preview mini-component ───────────────────── */
function FabPreview({ color, position = 'bottom-right' }: { color: string; position?: string }) {
  return (
    <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: 'rgba(13,115,119,0.04)', border: '1px solid rgba(13,115,119,0.12)' }}>
      <div className="absolute inset-0 flex items-end"
        style={{ justifyContent: position === 'bottom-right' ? 'flex-end' : 'flex-start', padding: '8px' }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: color, boxShadow: `0 4px 16px ${color}66` }}
        >
          <Phone className="w-4 h-4 text-white" />
        </motion.div>
      </div>
      <div className="absolute top-2 left-2 right-2 h-2 rounded-full opacity-20"
        style={{ background: color }} />
      <div className="absolute top-5 left-2 right-6 h-1.5 rounded-full opacity-10"
        style={{ background: color }} />
    </div>
  );
}

export default function WidgetPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [widgets, setWidgets] = useState<EmbeddedWidget[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<EmbeddedWidget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [embedFormats, setEmbedFormats] = useState<Record<string, EmbedFormat>>({});
  const [previewWidget, setPreviewWidget] = useState<EmbeddedWidget | null>(null);
  const [previewColor, setPreviewColor] = useState('#0d7377');

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: { position: 'bottom-right', primary_color: '#0d7377', theme: 'dark', is_active: true },
  });

  const watchedColor = watch('primary_color');
  const watchedPosition = watch('position');

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      const [w, a] = await Promise.all([getWidgets(business.id), getAgents(business.id)]);
      setWidgets(w);
      setAgents(a);
    } catch {
      toast.error('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  useEffect(() => {
    if (watchedColor && watchedColor.startsWith('#')) setPreviewColor(watchedColor);
  }, [watchedColor]);

  const openCreate = () => {
    setEditingWidget(null);
    reset({ position: 'bottom-right', primary_color: '#0d7377', is_active: true, name: 'Main Widget' });
    setPreviewColor('#0d7377');
    setModalOpen(true);
  };

  const openEdit = (w: EmbeddedWidget) => {
    setEditingWidget(w);
    reset({ name: w.name, agent_id: w.agent_id || undefined, position: w.position, primary_color: w.primary_color, greeting: w.greeting || '', theme: w.theme || 'dark', is_active: w.is_active });
    setPreviewColor(w.primary_color);
    setModalOpen(true);
  };

  /* Pre-fill form from a template card and open the modal */
  const useTemplate = (agent: Agent, colorIdx: number) => {
    const palette = AGENT_COLORS[colorIdx % AGENT_COLORS.length];
    const greeting = GREETING_BY_PERSONALITY[agent.personality] || GREETING_BY_PERSONALITY.professional;
    setEditingWidget(null);
    reset({
      name: `${agent.name} Widget`,
      agent_id: agent.id,
      position: 'bottom-right',
      primary_color: palette.primary,
      greeting,
      is_active: true,
    });
    setPreviewColor(palette.primary);
    setModalOpen(true);
  };

  const onSubmit = async (data: WidgetFormData) => {
    if (!business) return;
    try {
      if (editingWidget) {
        const updated = await updateWidget(editingWidget.id, data);
        setWidgets((prev) => prev.map((w) => w.id === updated.id ? updated : w));
        toast.success('Widget updated');
      } else {
        const created = await createWidget(business.id, data);
        setWidgets((prev) => [created, ...prev]);
        toast.success('Widget created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(editingWidget ? 'Failed to update widget' : 'Failed to create widget', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWidget(id);
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      toast.success('Widget deleted');
    } catch (err) {
      toast.error('Failed to delete widget', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const getEmbedCode = (widget: EmbeddedWidget) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fmt = embedFormats[widget.id] ?? 'script';
    return buildEmbedCode(business?.id || '', appUrl, {
      position: widget.position,
      primaryColor: widget.primary_color,
      agentId: widget.agent_id || undefined,
      format: fmt,
    });
  };

  const copyEmbed = (widgetId: string) => {
    const w = widgets.find((x) => x.id === widgetId);
    if (!w) return;
    const code = getEmbedCode(w);
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(widgetId);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => toast.error('Failed to copy to clipboard'));
  };

  const setWidgetFormat = (widgetId: string, fmt: EmbedFormat) => {
    setEmbedFormats((prev) => ({ ...prev, [widgetId]: fmt }));
  };

  const alreadyHasWidget = (agentId: string) => widgets.some((w) => w.agent_id === agentId);

  return (
    <div className="space-y-6">

      {/* ── Active Widgets ───────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Embedded Widgets"
          description="Deploy your AI voice widget on any website"
          icon={<Code2 className="w-4 h-4" />}
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>New Widget</Button>}
        />

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
            ))}
          </div>
        ) : widgets.length === 0 ? (
          <EmptyState
            icon={<Code2 className="w-5 h-5" />}
            title="No widgets yet"
            description="Pick an agent template below or create a custom widget to add to your practice website"
            action={{ label: 'Create Widget', onClick: openCreate }}
          />
        ) : (
          <div className="space-y-4">
            {widgets.map((widget) => {
              const linkedAgent = agents.find((a) => a.id === widget.agent_id);
              return (
                <div key={widget.id} className="rounded-xl p-5"
                  style={{ border: '1px solid rgba(13,115,119,0.14)', background: 'rgba(13,115,119,0.02)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border border-white/50 flex-shrink-0"
                          style={{ backgroundColor: widget.primary_color }} />
                        <span className="text-[14px] font-bold" style={{ color: 'var(--text-1)' }}>{widget.name}</span>
                        <Badge variant={widget.is_active ? 'green' : 'gray'}>
                          {widget.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                          {widget.position}
                        </span>
                        {linkedAgent && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377' }}>
                            <Mic className="w-3 h-3" /> {linkedAgent.name}
                          </span>
                        )}
                        <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                          {widget.total_interactions} interactions · {widget.total_impressions} impressions
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="teal-ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => setPreviewWidget(widget)} />
                      <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={() => openEdit(widget)} />
                      <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" style={{ color: '#dc2626' }} />} onClick={() => setDeleteId(widget.id)} />
                    </div>
                  </div>

                  {/* Embed code section with format tabs */}
                  <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid rgba(13,115,119,0.14)' }}>
                    {/* Tab bar */}
                    <div className="flex items-center justify-between px-4 py-2.5"
                      style={{ background: 'rgba(13,115,119,0.05)', borderBottom: '1px solid rgba(13,115,119,0.10)' }}>
                      <div className="flex gap-1">
                        {(['script', 'jsx', 'iframe'] as EmbedFormat[]).map((fmt) => {
                          const labels: Record<EmbedFormat, string> = { script: '<script>', jsx: 'React / JSX', iframe: 'Full HTML' };
                          const active = (embedFormats[widget.id] ?? 'script') === fmt;
                          return (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => setWidgetFormat(widget.id, fmt)}
                              className="px-3 py-1 rounded-lg text-[11px] font-semibold font-mono transition-all"
                              style={{
                                background: active ? '#0d7377' : 'transparent',
                                color: active ? '#ffffff' : 'var(--text-3)',
                              }}
                            >
                              {labels[fmt]}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        variant="teal-ghost" size="sm"
                        icon={copiedId === widget.id ? <CheckCheck className="w-3.5 h-3.5" style={{ color: '#047857' }} /> : <Copy className="w-3.5 h-3.5" />}
                        onClick={() => copyEmbed(widget.id)}
                      >
                        {copiedId === widget.id ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    {/* Code block */}
                    <div className="p-4 overflow-x-auto" style={{ background: '#f8fafa' }}>
                      <pre className="text-[11px] font-mono whitespace-pre leading-relaxed" style={{ color: '#0a3d3f' }}>
                        {getEmbedCode(widget)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Widget Templates (one per agent) ─────────────────── */}
      {!loading && agents.length > 0 && (
        <div>
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))', border: '1px solid rgba(20,168,181,0.25)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#0d7377' }} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-1)' }}>Widget Templates</h2>
                <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                  One click to create a pre-configured widget for each of your AI agents
                </p>
              </div>
            </div>
            <span className="text-[12px] px-3 py-1.5 rounded-lg" style={{ background: 'rgba(13,115,119,0.07)', color: '#0d7377' }}>
              {agents.length} agent{agents.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {/* Template cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {agents.map((agent, idx) => {
                const palette = AGENT_COLORS[idx % AGENT_COLORS.length];
                const hasWidget = alreadyHasWidget(agent.id);
                const svcCount = agent.service_ids?.length ?? 0;
                const greeting = GREETING_BY_PERSONALITY[agent.personality] || GREETING_BY_PERSONALITY.professional;

                return (
                  <motion.div
                    key={agent.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, delay: idx * 0.05 }}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      border: hasWidget ? `1px solid ${palette.primary}44` : '1px solid rgba(13,115,119,0.12)',
                      background: hasWidget ? `${palette.primary}06` : '#ffffff',
                      boxShadow: '0 2px 12px rgba(13,115,119,0.07)',
                    }}
                  >
                    {/* Card header with colour band */}
                    <div className="px-5 pt-5 pb-4"
                      style={{ background: `linear-gradient(135deg, ${palette.primary}12, ${palette.accent}08)`, borderBottom: `1px solid ${palette.primary}14` }}>
                      <div className="flex items-start justify-between gap-3">
                        {/* Agent avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${palette.primary}18`, border: `1px solid ${palette.primary}30`, color: palette.primary }}>
                            <Bot className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-1)' }}>
                              {agent.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Mic className="w-3 h-3 flex-shrink-0" style={{ color: palette.primary }} />
                              <span className="text-[10px] capitalize font-medium" style={{ color: palette.primary }}>
                                {agent.voice} · {agent.personality}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* FAB preview */}
                        <FabPreview color={palette.primary} />
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 flex-1 space-y-3">
                      {/* Colour chip + position */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: palette.primary }} />
                          <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
                            {palette.name}
                          </span>
                        </div>
                        <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-4)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                          Bottom-right
                        </span>
                        <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-4)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                          {svcCount > 0 ? `${svcCount} service${svcCount !== 1 ? 's' : ''}` : 'All services'}
                        </span>
                      </div>

                      {/* Greeting preview */}
                      <div className="px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(13,115,119,0.04)', border: '1px solid rgba(13,115,119,0.10)' }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>
                          Greeting
                        </p>
                        <p className="text-[12px] leading-relaxed line-clamp-2 italic" style={{ color: 'var(--text-2)' }}>
                          "{greeting}"
                        </p>
                      </div>

                      {/* Status pills */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: 'rgba(13,115,119,0.07)', color: '#0d7377' }}>
                          {agent.is_active ? '● Active agent' : '○ Inactive agent'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: 'rgba(13,115,119,0.07)', color: '#0d7377' }}>
                          {agent.interrupt_sensitivity} interruption
                        </span>
                      </div>
                    </div>

                    {/* Card footer — action buttons */}
                    <div className="px-5 pb-5 pt-1">
                      {hasWidget ? (
                        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold"
                          style={{ background: `${palette.primary}0d`, color: palette.primary, border: `1px solid ${palette.primary}22` }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Widget already created
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => useTemplate(agent, idx)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02]"
                            style={{
                              background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary}cc)`,
                              boxShadow: `0 3px 12px ${palette.primary}35`,
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Use This Template
                          </button>
                          <button
                            onClick={() => openEdit({ id: '', business_id: '', agent_id: agent.id, name: `${agent.name} Widget`, position: 'bottom-right', primary_color: palette.primary, greeting: greeting, is_active: true, allowed_domains: null, total_impressions: 0, total_interactions: 0, created_at: '', updated_at: '' } as EmbeddedWidget)}
                            className="px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all hover:scale-[1.02]"
                            style={{ background: 'rgba(13,115,119,0.06)', color: 'var(--text-2)', border: '1px solid rgba(13,115,119,0.12)' }}
                            title="Customise before creating"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingWidget ? 'Edit Widget' : 'Create Widget'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Live preview strip */}
          <div className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: 'rgba(13,115,119,0.04)', border: '1px solid rgba(13,115,119,0.12)' }}>
            <FabPreview color={previewColor} position={watchedPosition} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold" style={{ color: 'var(--text-2)' }}>Live Preview</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                Updates as you change colour and position
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full border border-white/50" style={{ backgroundColor: previewColor }} />
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>{previewColor}</span>
              </div>
            </div>
          </div>

          <Input label="Widget Name" placeholder="Main Widget" error={errors.name?.message} required {...register('name')} />

          <Select
            label="AI Agent"
            options={[{ value: '', label: 'Default (first active agent)' }, ...agents.map((a) => ({ value: a.id, label: a.name }))]}
            {...register('agent_id')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Position"
              options={WIDGET_POSITIONS.map((p) => ({ value: p.value, label: p.label }))}
              {...register('position')}
            />
            <div>
              <label className="block text-[12px] font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--text-2)' }}>
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register('primary_color')}
                  className="w-10 h-10 rounded-xl cursor-pointer p-1"
                  style={{ background: '#fff', border: '1px solid rgba(13,115,119,0.20)' }}
                />
                <Input {...register('primary_color')} placeholder="#0d7377" className="flex-1" />
              </div>
              {/* Quick colour swatches */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {AGENT_COLORS.map((c) => (
                  <button
                    key={c.primary}
                    type="button"
                    title={c.name}
                    onClick={() => { setValue('primary_color', c.primary); setPreviewColor(c.primary); }}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c.primary,
                      borderColor: previewColor === c.primary ? '#ffffff' : 'transparent',
                      boxShadow: previewColor === c.primary ? `0 0 0 2px ${c.primary}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Input label="Greeting Message" placeholder="Hi! How can I help you today?" {...register('greeting')} />

          <Controller
            control={control}
            name="theme"
            render={({ field }) => (
              <div>
                <label className="block text-[12px] font-semibold mb-2 tracking-wide" style={{ color: 'var(--text-2)' }}>
                  Widget Theme
                </label>
                <div className="flex gap-2">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                      style={field.value === t ? {
                        background: '#0d7377',
                        color: '#ffffff',
                        border: '1px solid #0d7377',
                      } : {
                        background: 'rgba(13,115,119,0.04)',
                        color: 'var(--text-2)',
                        border: '1px solid rgba(13,115,119,0.16)',
                      }}
                    >
                      {t === 'dark'
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      }
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Toggle label="Widget is active" checked={field.value} onChange={field.onChange} />
            )}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editingWidget ? 'Save Changes' : 'Create Widget'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Widget preview modal ─────────────────────────────── */}
      <Modal isOpen={!!previewWidget} onClose={() => setPreviewWidget(null)} title="Widget Preview" size="sm">
        {previewWidget && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative">
              <div className="w-64 h-80 rounded-xl flex items-center justify-center text-[13px]"
                style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(13,115,119,0.14)', color: 'var(--text-3)' }}>
                Your website here
              </div>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute bottom-3 ${previewWidget.position === 'bottom-right' ? 'right-3' : 'left-3'} w-12 h-12 rounded-full flex items-center justify-center cursor-pointer`}
                style={{
                  backgroundColor: previewWidget.primary_color,
                  boxShadow: `0 4px 20px ${previewWidget.primary_color}66`,
                }}
              >
                <Phone className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{previewWidget.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                {previewWidget.position} · {previewWidget.primary_color}
              </p>
              {previewWidget.greeting && (
                <p className="text-[12px] italic mt-2 max-w-[220px]" style={{ color: 'var(--text-2)' }}>
                  "{previewWidget.greeting}"
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete confirm ───────────────────────────────────── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Widget" size="sm">
        <p className="text-[13px] mb-5" style={{ color: 'var(--text-2)' }}>This widget will be deactivated and removed.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingId === deleteId} onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
