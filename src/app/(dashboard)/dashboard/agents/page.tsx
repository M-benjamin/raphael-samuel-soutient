'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Plus, Mic, Trash2, ToggleLeft, ToggleRight, Edit2, Play, HeartPulse,
  Stethoscope, Heart, ClipboardList, Brain, Baby, Zap, Smile, Monitor,
  CheckCircle2, ChevronRight, Sparkles, X, ArrowLeft, ArrowRight, Search,
} from 'lucide-react';
import Link from 'next/link';
import { useBusinessStore } from '@/store/business';
import { getAgents, createAgent, updateAgent, deleteAgent, toggleAgentStatus } from '@/services/agents';
import { getServices } from '@/services/services';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentSchema, type AgentFormData } from '@/validations';
import { AGENT_VOICES, AGENT_PERSONALITIES, INTERRUPT_SENSITIVITIES, AGENT_LANGUAGES, SUGGESTED_AGENTS } from '@/constants';
import { formatPrice } from '@/lib/utils';
import type { Agent, Service } from '@/types';

/* ── Specialty icon map ────────────────────────────────────── */
const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope className="w-5 h-5" />,
  heart:       <Heart className="w-5 h-5" />,
  clipboard:   <ClipboardList className="w-5 h-5" />,
  brain:       <Brain className="w-5 h-5" />,
  baby:        <Baby className="w-5 h-5" />,
  zap:         <Zap className="w-5 h-5" />,
  smile:       <Smile className="w-5 h-5" />,
  monitor:     <Monitor className="w-5 h-5" />,
};

type SuggestedAgent = typeof SUGGESTED_AGENTS[number];

/* ── Service Picker component ──────────────────────────────── */
function ServicePicker({
  services,
  selected,
  onChange,
}: {
  services: Service[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = services.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const selectAll = () => onChange(filtered.map((s) => s.id));
  const clearAll  = () => onChange([]);

  if (services.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
        style={{ background: 'rgba(13,115,119,0.03)', border: '1px dashed rgba(13,115,119,0.18)' }}
      >
        <ClipboardList className="w-8 h-8 mb-3" style={{ color: 'rgba(13,115,119,0.35)' }} />
        <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-2)' }}>No services in your catalog yet</p>
        <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
          Add services first, then assign them to agents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + select all */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-4)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter services…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(13,115,119,0.14)', color: 'var(--text-1)' }}
          />
        </div>
        <button
          type="button"
          onClick={selected.length === filtered.length ? clearAll : selectAll}
          className="px-3 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all"
          style={{ background: 'rgba(13,115,119,0.07)', color: '#0d7377', border: '1px solid rgba(13,115,119,0.18)' }}
        >
          {selected.length === filtered.length && filtered.length > 0 ? 'Clear all' : 'Select all'}
        </button>
      </div>

      {/* Count badge */}
      <div className="flex items-center justify-between">
        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
          {filtered.length} service{filtered.length !== 1 ? 's' : ''} available
        </p>
        {selected.length > 0 && (
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(13,115,119,0.10)', color: '#0d7377' }}
          >
            {selected.length} selected
          </span>
        )}
      </div>

      {/* Service list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map((service) => {
          const isSelected = selected.includes(service.id);
          return (
            <div
              key={service.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{
                border: isSelected ? '1px solid rgba(13,115,119,0.40)' : '1px solid rgba(13,115,119,0.12)',
                background: isSelected ? 'rgba(13,115,119,0.06)' : '#ffffff',
              }}
              onClick={() => toggle(service.id)}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,115,119,0.28)'; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,115,119,0.12)'; }}
            >
              {/* Checkbox */}
              <div
                className="w-4.5 h-4.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isSelected ? '#0d7377' : 'transparent',
                  border: isSelected ? '1px solid #0d7377' : '1.5px solid rgba(13,115,119,0.30)',
                  width: '18px', height: '18px',
                }}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                  {service.name}
                </p>
                {service.description && (
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-4)' }}>
                    {service.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377' }}>
                  {service.duration_minutes}m
                </span>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-2)' }}>
                  {formatPrice(service.price_min, service.price_max, service.price_type)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 2-Step Agent Modal ─────────────────────────────────────── */
function AgentModal({
  open,
  onClose,
  editingAgent,
  services,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editingAgent: Agent | null;
  services: Service[];
  onSave: (data: AgentFormData) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, control, trigger, formState: { errors } } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      voice: 'alloy', language: 'en', personality: 'professional',
      max_call_duration: 600, interrupt_sensitivity: 'medium', is_active: true, service_ids: [],
    },
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      if (editingAgent) {
        reset({
          name: editingAgent.name,
          voice: editingAgent.voice,
          language: editingAgent.language,
          personality: editingAgent.personality,
          greeting_message: editingAgent.greeting_message || '',
          system_prompt: editingAgent.system_prompt || '',
          max_call_duration: editingAgent.max_call_duration,
          interrupt_sensitivity: editingAgent.interrupt_sensitivity,
          is_active: editingAgent.is_active,
          service_ids: editingAgent.service_ids ?? [],
        });
      } else {
        reset({
          voice: 'alloy', language: 'en', personality: 'professional',
          max_call_duration: 600, interrupt_sensitivity: 'medium', is_active: true, service_ids: [],
        });
      }
    }
  }, [open, editingAgent, reset]);

  const onSubmit = async (data: AgentFormData) => {
    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selectedIds = watch('service_ids') ?? [];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(13,115,119,0.10)', background: 'rgba(13,115,119,0.02)' }}
        >
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-1)' }}>
              {editingAgent ? 'Edit Agent' : 'Create AI Agent'}
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              Step {step} of 2 — {step === 1 ? 'Agent Settings' : 'Assign Services'}
            </p>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className="flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold transition-all"
                style={step === s ? {
                  background: 'linear-gradient(135deg, #0d7377, #0a4a4d)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(13,115,119,0.35)',
                } : step > s ? {
                  background: 'rgba(13,115,119,0.12)',
                  color: '#0d7377',
                } : {
                  background: 'rgba(13,115,119,0.07)',
                  color: 'var(--text-4)',
                }}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
            <button onClick={onClose} className="ml-2 p-1.5 rounded-lg hover:bg-black/5 transition-colors">
              <X className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
            </button>
          </div>
        </div>

        <div>
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <Input
                    label="Agent Name"
                    placeholder="e.g. Clara – General Receptionist"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Voice"
                      options={AGENT_VOICES.map((v) => ({ value: v.value, label: v.label }))}
                      error={errors.voice?.message}
                      {...register('voice')}
                    />
                    <Select
                      label="Personality"
                      options={AGENT_PERSONALITIES.map((p) => ({ value: p.value, label: p.label }))}
                      error={errors.personality?.message}
                      {...register('personality')}
                    />
                  </div>
                  <Select
                    label="Interruption Sensitivity"
                    options={INTERRUPT_SENSITIVITIES.map((i) => ({ value: i.value, label: i.label }))}
                    {...register('interrupt_sensitivity')}
                  />
                  <Select
                    label="Language"
                    options={AGENT_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
                    error={errors.language?.message}
                    {...register('language')}
                  />
                  <Textarea
                    label="Greeting Message"
                    rows={2}
                    placeholder="Hello! Thank you for calling…"
                    {...register('greeting_message')}
                  />
                  <Textarea
                    label="System Prompt"
                    rows={4}
                    placeholder="You are a professional healthcare receptionist…"
                    hint="Instructions for how the AI should behave on patient calls"
                    {...register('system_prompt')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  {/* Context banner */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(13,115,119,0.14)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(13,115,119,0.12)', color: '#0d7377' }}
                    >
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>
                        Which services can this agent discuss?
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                        The AI will only recommend and answer questions about the services you select here.
                        Different agents can have different service scopes.
                      </p>
                    </div>
                  </div>

                  <Controller
                    control={control}
                    name="service_ids"
                    render={({ field }) => (
                      <ServicePicker
                        services={services}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div
            className="px-6 py-4 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(13,115,119,0.10)', background: 'rgba(13,115,119,0.02)' }}
          >
            <div>
              {step === 2 && selectedIds.length > 0 && (
                <span className="text-[12px] font-medium" style={{ color: '#0d7377' }}>
                  {selectedIds.length} service{selectedIds.length !== 1 ? 's' : ''} assigned
                </span>
              )}
              {step === 2 && selectedIds.length === 0 && (
                <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>
                  No services selected — agent will handle general inquiries
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {step === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                    style={{ background: 'rgba(13,115,119,0.07)', color: 'var(--text-2)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const valid = await trigger(['name', 'voice', 'personality', 'interrupt_sensitivity', 'language']);
                      if (valid) setStep(2);
                    }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', boxShadow: '0 2px 8px rgba(13,115,119,0.30)' }}
                  >
                    Next: Assign Services
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                    style={{ background: 'rgba(13,115,119,0.07)', color: 'var(--text-2)' }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSubmit(onSubmit)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', boxShadow: '0 2px 8px rgba(13,115,119,0.30)' }}
                  >
                    {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {editingAgent ? 'Save Changes' : 'Create Agent'}
                    {!saving && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function AgentsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingSuggested, setAddingSuggested] = useState<string | null>(null);
  const [previewAgent, setPreviewAgent] = useState<SuggestedAgent | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      const [agentsData, servicesData] = await Promise.all([
        getAgents(business.id),
        getServices(business.id),
      ]);
      setAgents(agentsData);
      setServices(servicesData);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  const openCreate = () => { setEditingAgent(null); setModalOpen(true); };
  const openEdit   = (agent: Agent) => { setEditingAgent(agent); setModalOpen(true); };

  const handleSave = async (data: AgentFormData) => {
    if (!business) { toast.error('No business found'); return; }
    try {
      if (editingAgent) {
        const updated = await updateAgent(editingAgent.id, data);
        setAgents((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        toast.success('Agent updated');
      } else {
        const created = await createAgent(business.id, data);
        setAgents((prev) => [created, ...prev]);
        toast.success('Agent created');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(editingAgent ? 'Failed to update agent' : 'Failed to create agent', msg);
      throw err;
    }
  };

  const addSuggestedAgent = async (suggested: SuggestedAgent) => {
    if (!business) { toast.error('No business found'); return; }
    setAddingSuggested(suggested.name);
    try {
      const created = await createAgent(business.id, {
        name: suggested.name, voice: suggested.voice, language: 'en', personality: suggested.personality,
        greeting_message: suggested.greeting_message, system_prompt: suggested.system_prompt,
        max_call_duration: 600, interrupt_sensitivity: suggested.interrupt_sensitivity,
        is_active: true, service_ids: [],
      });
      setAgents((prev) => [created, ...prev]);
      toast.success(`"${suggested.name}" activated — assign services in Edit`);
      setPreviewAgent(null);
    } catch (err) {
      toast.error('Failed to create agent', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAddingSuggested(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      toast.success('Agent deleted');
    } catch (err) {
      toast.error('Failed to delete agent', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const handleToggle = async (agent: Agent) => {
    try {
      await toggleAgentStatus(agent.id, !agent.is_active);
      setAgents((prev) => prev.map((a) => a.id === agent.id ? { ...a, is_active: !a.is_active } : a));
      toast.success(agent.is_active ? 'Agent deactivated' : 'Agent activated');
    } catch (err) {
      toast.error('Failed to update agent status', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const alreadyAdded = (name: string) => agents.some((a) => a.name === name);
  const filteredSuggestions = activeFilter === 'All'
    ? SUGGESTED_AGENTS
    : SUGGESTED_AGENTS.filter((s) => s.specialty === activeFilter);

  return (
    <div className="space-y-6">

      {/* ── Active Agents ──────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Active AI Agents"
          description="Your deployed voice agents handling patient calls"
          icon={<Bot className="w-4 h-4" />}
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>New Agent</Button>}
        />

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-xl text-center"
            style={{ background: 'rgba(13,115,119,0.03)', border: '1px dashed rgba(13,115,119,0.18)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(20,168,181,0.22)' }}>
              <Bot className="w-6 h-6" style={{ color: '#0d7377' }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>No agents yet</p>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-3)' }}>
              Pick a pre-built agent below or create a custom one
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openCreate}>New Agent</Button>
              <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>or choose a template ↓</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent, i) => {
              const svcCount = agent.service_ids?.length ?? 0;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150"
                  style={{ border: '1px solid rgba(13,115,119,0.12)', background: 'rgba(13,115,119,0.02)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,168,181,0.28)'; (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,115,119,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.02)'; }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))', border: '1px solid rgba(20,168,181,0.25)', color: 'var(--teal-600)' }}>
                    <Mic className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{agent.name}</span>
                      <Badge variant={agent.is_active ? 'green' : 'gray'}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                        Voice: {agent.voice} · {agent.personality} · {agent.interrupt_sensitivity} interruption
                      </span>
                      {svcCount > 0 ? (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(13,115,119,0.10)', color: '#0d7377' }}
                        >
                          {svcCount} service{svcCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#b45309' }}
                        >
                          No services assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <Button variant="teal-ghost" size="sm" icon={<Play className="w-3.5 h-3.5" />}>Test</Button>
                    </Link>
                    <Button variant="ghost" size="sm"
                      icon={agent.is_active
                        ? <ToggleRight className="w-4 h-4" style={{ color: '#059669' }} />
                        : <ToggleLeft className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                      }
                      onClick={() => handleToggle(agent)}
                    />
                    <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={() => openEdit(agent)} />
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" style={{ color: '#dc2626' }} />} onClick={() => setDeleteId(agent.id)} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Agent Template Gallery ──────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))', border: '1px solid rgba(20,168,181,0.25)' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#0d7377' }} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-1)' }}>AI Agent Templates</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>Choose a specialist and activate in one click</p>
            </div>
          </div>
          <div className="text-[12px] px-3 py-1.5 rounded-lg" style={{ background: 'rgba(13,115,119,0.07)', color: '#0d7377' }}>
            {SUGGESTED_AGENTS.length} agents available
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {['All', 'General Practice', 'Mental Health & Therapy', 'Pediatrics & Child Health', 'Urgent & Emergency Care', 'Dental & Oral Health', 'Telehealth & Remote Care', 'Specialist & Premium Care', 'Chronic Care & Wellness'].map((filter) => {
            const count = filter === 'All' ? SUGGESTED_AGENTS.length : SUGGESTED_AGENTS.filter(s => s.specialty === filter).length;
            if (count === 0) return null;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap"
                style={activeFilter === filter ? {
                  background: '#0d7377', color: '#ffffff', boxShadow: '0 2px 8px rgba(13,115,119,0.30)',
                } : {
                  background: 'rgba(13,115,119,0.06)', color: 'var(--text-2)', border: '1px solid rgba(13,115,119,0.12)',
                }}
              >
                {filter} {filter !== 'All' && <span style={{ opacity: 0.65 }}>· {count}</span>}
              </button>
            );
          })}
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSuggestions.map((s, i) => {
              const added = alreadyAdded(s.name);
              return (
                <motion.div
                  key={s.name}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                  className="rounded-2xl p-5 flex flex-col gap-4 relative"
                  style={{
                    background: added ? 'rgba(13,115,119,0.04)' : '#ffffff',
                    border: added ? '1px solid rgba(13,115,119,0.30)' : '1px solid rgba(13,115,119,0.12)',
                    boxShadow: '0 1px 4px rgba(13,115,119,0.06)',
                  }}
                  onMouseEnter={e => { if (!added) { (e.currentTarget as HTMLElement).style.borderColor = `${s.color}55`; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${s.color}18`; } }}
                  onMouseLeave={e => { if (!added) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,115,119,0.12)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(13,115,119,0.06)'; } }}
                >
                  {s.badge && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
                      {s.badge}
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}>
                      {SPECIALTY_ICONS[s.icon] ?? <Bot className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="text-[13px] font-bold leading-tight truncate" style={{ color: 'var(--text-1)' }}>
                        {s.name.split('–')[0].trim()}
                      </div>
                      <div className="text-[11px] mt-0.5 truncate font-semibold" style={{ color: s.color }}>{s.role}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>{s.specialty}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {s.capabilities.slice(0, 3).map((cap) => (
                      <span key={cap} className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                        style={{ background: 'rgba(13,115,119,0.06)', color: 'var(--text-3)' }}>
                        {cap}
                      </span>
                    ))}
                    {s.capabilities.length > 3 && (
                      <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>+{s.capabilities.length - 3} more</span>
                    )}
                  </div>

                  <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                    <span style={{ color: 'var(--text-4)', fontWeight: 500 }}>Best for: </span>
                    {s.bestFor.slice(0, 2).join(', ')}
                  </div>

                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-4)' }}>
                    <Mic className="w-3 h-3" style={{ color: s.color }} />
                    <span className="capitalize">{s.voice}</span>
                    <span>·</span>
                    <span className="capitalize">{s.personality}</span>
                  </div>

                  <div className="flex gap-2 mt-auto pt-1">
                    {added ? (
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold"
                        style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377', border: '1px solid rgba(13,115,119,0.20)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Already Active
                      </div>
                    ) : (
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02]"
                        style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, boxShadow: `0 2px 8px ${s.color}30` }}
                        onClick={() => addSuggestedAgent(s)}
                        disabled={addingSuggested === s.name}
                      >
                        {addingSuggested === s.name
                          ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          : <Plus className="w-3.5 h-3.5" />
                        }
                        {addingSuggested === s.name ? 'Activating…' : 'Activate Agent'}
                      </button>
                    )}
                    <button
                      className="px-3 py-2 rounded-xl text-[11px] font-medium transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(13,115,119,0.06)', color: 'var(--text-2)', border: '1px solid rgba(13,115,119,0.12)' }}
                      onClick={() => setPreviewAgent(s)}
                    >
                      Preview
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Preview Modal ────────────────────────────────────── */}
      {previewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPreviewAgent(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 flex items-start gap-4"
              style={{ background: `linear-gradient(135deg, ${previewAgent.color}18, ${previewAgent.color}06)`, borderBottom: '1px solid rgba(13,115,119,0.10)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${previewAgent.color}22`, border: `1px solid ${previewAgent.color}40`, color: previewAgent.color }}>
                <div className="scale-125">{SPECIALTY_ICONS[previewAgent.icon] ?? <Bot className="w-6 h-6" />}</div>
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-bold" style={{ color: 'var(--text-1)' }}>{previewAgent.name}</div>
                <div className="text-[12px] font-semibold mt-0.5" style={{ color: previewAgent.color }}>{previewAgent.role}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{previewAgent.specialty}</div>
              </div>
              <button onClick={() => setPreviewAgent(null)} className="p-1.5 rounded-lg hover:bg-black/5">
                <X className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Opening Greeting</p>
                <div className="p-3.5 rounded-xl text-[13px] leading-relaxed italic"
                  style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(13,115,119,0.12)', color: 'var(--text-2)' }}>
                  "{previewAgent.greeting_message}"
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Capabilities</p>
                <div className="grid grid-cols-2 gap-2">
                  {previewAgent.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-2)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: previewAgent.color }} />{cap}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Best For</p>
                  {previewAgent.bestFor.map((b) => (
                    <div key={b} className="flex items-center gap-1.5 text-[12px] mb-1" style={{ color: 'var(--text-2)' }}>
                      <ChevronRight className="w-3 h-3" style={{ color: previewAgent.color }} />{b}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Voice Settings</p>
                  {[{ label: 'Voice', value: previewAgent.voice }, { label: 'Style', value: previewAgent.personality }, { label: 'Interrupt', value: previewAgent.interrupt_sensitivity }].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-[12px] mb-1">
                      <span style={{ color: 'var(--text-4)' }}>{label}</span>
                      <span className="font-medium capitalize" style={{ color: 'var(--text-2)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(13,115,119,0.10)', background: 'rgba(13,115,119,0.02)' }}>
              <button
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                style={{ background: `linear-gradient(135deg, ${previewAgent.color}, ${previewAgent.color}bb)`, boxShadow: `0 4px 16px ${previewAgent.color}35` }}
                onClick={() => addSuggestedAgent(previewAgent)}
                disabled={!!addingSuggested || alreadyAdded(previewAgent.name)}
              >
                {alreadyAdded(previewAgent.name) ? <><CheckCircle2 className="w-4 h-4" /> Already Active</> :
                  addingSuggested === previewAgent.name ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Activating…</> :
                  <><Plus className="w-4 h-4" /> Activate This Agent</>}
              </button>
              <button onClick={() => setPreviewAgent(null)} className="px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                style={{ background: 'rgba(13,115,119,0.06)', color: 'var(--text-2)', border: '1px solid rgba(13,115,119,0.12)' }}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 2-Step Agent Modal ───────────────────────────────── */}
      <AgentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingAgent={editingAgent}
        services={services}
        onSave={handleSave}
      />

      {/* ── Delete Confirm ───────────────────────────────────── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Agent" size="sm">
        <p className="text-[13px] mb-5" style={{ color: 'var(--text-2)' }}>Are you sure you want to delete this agent? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingId === deleteId} onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
