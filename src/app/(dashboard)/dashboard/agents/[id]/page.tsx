'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bot, Mic, MicOff, PhoneOff, Loader2,
  Settings2, MessageSquare, CheckCircle2, AlertCircle,
  Wand2, Play, RotateCcw, Clock, User, Calendar,
} from 'lucide-react';

import Link from 'next/link';
import { useBusinessStore } from '@/store/business';
import { getAgents, updateAgent } from '@/services/agents';
import { getServices } from '@/services/services';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { useVoiceStore } from '@/store/voice';
import { AppointmentConfirmForm } from '@/components/voice/AppointmentConfirmForm';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentSchema, type AgentFormData } from '@/validations';
import { AGENT_VOICES, AGENT_PERSONALITIES, INTERRUPT_SENSITIVITIES } from '@/constants';
import { cn } from '@/lib/utils';
import type { Agent, Service } from '@/types';

interface PageProps {
  params: { id: string };
}

export default function AgentDetailPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { business } = useBusinessStore();
  const toast = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'configure' | 'test'>('configure');
  const [testTab, setTestTab] = useState<'voice' | 'book'>('voice');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ name: string; scheduledAt: string } | null>(null);
  const [bookForm, setBookForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    date_of_birth: '', service_id: '', scheduled_at: '', notes: '',
  });

  const { transcript, connectionState, pendingAppointment, setPendingAppointment, reset: resetVoice } = useVoiceStore();
  const { connect, disconnect, toggleMute, resumeAfterConfirmation, isMuted } = useRealtimeVoice({
    businessId: business?.id || '',
    agentId: id,
    onConversationEnd: () => {
      if (callTimer) clearInterval(callTimer);
      setCallDuration(0);
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
  });

  useEffect(() => {
    if (!business) return;
    Promise.all([getAgents(business.id), getServices(business.id)])
      .then(([agents, svcs]) => {
        const found = agents.find((a) => a.id === id);
        if (!found) { router.push('/dashboard/agents'); return; }
        setAgent(found);
        setServices(svcs.filter((s) => s.is_active));
        reset({
          name: found.name, voice: found.voice, language: found.language, personality: found.personality,
          greeting_message: found.greeting_message || '', system_prompt: found.system_prompt || '',
          max_call_duration: found.max_call_duration, interrupt_sensitivity: found.interrupt_sensitivity,
          is_active: found.is_active,
        });
      })
      .catch(() => toast.error('Failed to load agent'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, id]);

  useEffect(() => {
    return () => {
      disconnect();
      resetVoice();
      if (callTimer) clearInterval(callTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (connectionState.status === 'listening' || connectionState.status === 'speaking') {
      if (!callTimer) {
        const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
        setCallTimer(timer);
      }
    } else if (connectionState.status === 'idle') {
      if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState.status]);

  const onSave = async (data: AgentFormData) => {
    if (!agent) return;
    try {
      const updated = await updateAgent(agent.id, data);
      setAgent(updated);
      toast.success('Agent saved', 'Changes will apply to the next call');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to save agent', msg);
    }
  };

  const handleConnect = async () => {
    if (!business) { toast.error('No business configured'); return; }
    setCallDuration(0);
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
    if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
    setCallDuration(0);
  };

  const handleReset = () => {
    resetVoice();
    setCallDuration(0);
    if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setBookingSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        customer_name: bookForm.customer_name,
        customer_email: bookForm.customer_email,
        date_of_birth: bookForm.date_of_birth,
        scheduled_at: new Date(bookForm.scheduled_at).toISOString(),
        businessId: business.id,
      };
      if (bookForm.customer_phone) payload.customer_phone = bookForm.customer_phone;
      if (bookForm.service_id) payload.service_id = bookForm.service_id;
      if (bookForm.notes) payload.notes = bookForm.notes;

      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBookingSuccess({ name: bookForm.customer_name, scheduledAt: bookForm.scheduled_at });
      setBookForm({ customer_name: '', customer_email: '', customer_phone: '', date_of_birth: '', service_id: '', scheduled_at: '', notes: '' });
      toast.success('Appointment booked', `Confirmation sent to ${bookForm.customer_email}`);
    } catch (err) {
      toast.error('Booking failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const isConnected = ['listening', 'speaking', 'connected'].includes(connectionState.status);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'rgba(13,115,119,0.04)' }} />
          <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'rgba(13,115,119,0.04)' }} />
        </div>
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))', border: '1px solid rgba(20,168,181,0.25)', color: 'var(--teal-600)' }}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{agent.name}</h1>
            <div className="flex items-center gap-1.5">
              <Badge variant={agent.is_active ? 'green' : 'gray'}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>Voice: {agent.voice} · {agent.personality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit"
        style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.12)' }}>
        {([
          { id: 'configure', label: 'Configure', icon: Settings2 },
          { id: 'test', label: 'Test Live', icon: Play },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
            style={activeTab === tab.id
              ? { background: '#ffffff', color: 'var(--teal-700)', border: '1px solid rgba(13,115,119,0.18)', boxShadow: '0 1px 4px rgba(13,115,119,0.10)' }
              : { color: 'var(--text-3)' }
            }
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'configure' ? (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader title="Agent Configuration" description="Update how this agent behaves on patient calls" icon={<Settings2 className="w-4 h-4" />} />
              <form onSubmit={handleSubmit(onSave)} className="space-y-5">
                <Input label="Agent Name" placeholder="Reception AI" error={errors.name?.message} required {...register('name')} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Voice" options={AGENT_VOICES.map((v) => ({ value: v.value, label: v.label }))} error={errors.voice?.message} {...register('voice')} />
                  <Select label="Personality" options={AGENT_PERSONALITIES.map((p) => ({ value: p.value, label: p.label }))} error={errors.personality?.message} {...register('personality')} />
                </div>
                <Select label="Interruption Sensitivity" options={INTERRUPT_SENSITIVITIES.map((i) => ({ value: i.value, label: i.label }))} {...register('interrupt_sensitivity')} />
                <Textarea
                  label="Greeting Message"
                  rows={2}
                  placeholder="Hello! Thank you for calling..."
                  hint="First thing the AI says when the call connects"
                  {...register('greeting_message')}
                />
                <Textarea
                  label="System Prompt"
                  rows={8}
                  placeholder="You are a professional healthcare receptionist..."
                  hint="Full instructions for how the AI should behave, what it knows, and how it handles calls"
                  {...register('system_prompt')}
                />
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(13,115,119,0.10)' }}>
                  <Button type="submit" loading={isSubmitting} icon={<Wand2 className="w-4 h-4" />}>
                    Save Configuration
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveTab('test')} icon={<Play className="w-4 h-4" />}>
                    Test This Agent
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="test"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Test sub-tabs */}
            <div className="flex gap-1 rounded-xl p-1 w-fit"
              style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.12)' }}>
              {([
                { id: 'voice', label: 'Voice Call', icon: Mic },
                { id: 'book', label: 'Book Appointment', icon: Calendar },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setTestTab(tab.id); setBookingSuccess(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                  style={testTab === tab.id
                    ? { background: '#ffffff', color: 'var(--teal-700)', border: '1px solid rgba(13,115,119,0.18)', boxShadow: '0 1px 4px rgba(13,115,119,0.10)' }
                    : { color: 'var(--text-3)' }
                  }
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {testTab === 'voice' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Left: Voice Interface */}
            <div className="lg:col-span-2 relative">
              {/* Appointment confirmation overlay */}
              {pendingAppointment && (
                <AppointmentConfirmForm
                  pending={pendingAppointment}
                  primaryColor="#0d7377"
                  onConfirmed={(callId, result) => resumeAfterConfirmation(callId, result)}
                  onDismiss={() => setPendingAppointment(null)}
                />
              )}
              <Card className="h-full">
                <CardHeader title="Live Test" description="Talk to your agent in real time" icon={<Mic className="w-4 h-4" />} />

                {/* Agent Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
                  style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(20,168,181,0.18)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))', border: '1px solid rgba(20,168,181,0.25)', color: 'var(--teal-600)' }}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{agent.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{agent.voice} voice · {agent.personality}</div>
                  </div>
                  <Badge variant={agent.is_active ? 'green' : 'gray'}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Orb + Controls */}
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="relative flex items-center justify-center">
                    {connectionState.status === 'speaking' && (
                      <>
                        <motion.div
                          className="absolute w-36 h-36 rounded-full"
                          style={{ background: 'rgba(13,115,119,0.10)' }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute w-44 h-44 rounded-full"
                          style={{ background: 'rgba(20,168,181,0.06)' }}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                      </>
                    )}
                    {connectionState.status === 'listening' && (
                      <motion.div
                        className="absolute w-36 h-36 rounded-full"
                        style={{ border: '2px solid rgba(20,168,181,0.35)' }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <motion.button
                      onClick={isConnected ? toggleMute : handleConnect}
                      whileTap={{ scale: 0.95 }}
                      disabled={connectionState.status === 'connecting'}
                      className={cn(
                        'w-28 h-28 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                        connectionState.status === 'connecting' && 'cursor-not-allowed',
                        connectionState.status === 'error' && 'cursor-pointer',
                        isMuted && isConnected && 'cursor-pointer',
                      )}
                      style={
                        connectionState.status === 'connecting'
                          ? { background: 'rgba(13,115,119,0.08)', border: '2px solid rgba(13,115,119,0.20)' }
                          : connectionState.status === 'error'
                          ? { background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.25)' }
                          : isMuted && isConnected
                          ? { background: 'rgba(13,115,119,0.06)', border: '2px solid rgba(13,115,119,0.20)' }
                          : {
                              background: 'linear-gradient(135deg, #0d7377, #0a4a4d)',
                              boxShadow: '0 0 40px rgba(13,115,119,0.35), 0 0 80px rgba(13,115,119,0.15)',
                            }
                      }
                    >
                      {connectionState.status === 'connecting' ? (
                        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--teal-600)' }} />
                      ) : connectionState.status === 'error' ? (
                        <AlertCircle className="w-10 h-10" style={{ color: '#f87171' }} />
                      ) : isConnected ? (
                        isMuted ? (
                          <MicOff className="w-10 h-10" style={{ color: 'var(--text-3)' }} />
                        ) : (
                          <Mic className="w-10 h-10 text-white" />
                        )
                      ) : (
                        <Mic className="w-10 h-10 text-white" />
                      )}
                    </motion.button>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    {connectionState.status === 'idle' && (
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Ready to test</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>Click the mic to start a call</p>
                      </div>
                    )}
                    {connectionState.status === 'connecting' && (
                      <p className="text-[13px] font-medium" style={{ color: 'var(--teal-600)' }}>Connecting...</p>
                    )}
                    {connectionState.status === 'listening' && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <motion.div className="w-2 h-2 rounded-full" style={{ background: 'var(--teal-500)' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                          <span className="text-[13px] font-medium" style={{ color: 'var(--teal-600)' }}>Listening</span>
                        </div>
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>Speak now — the agent is hearing you</span>
                      </div>
                    )}
                    {connectionState.status === 'speaking' && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <motion.div className="w-2 h-2 rounded-full" style={{ background: 'var(--teal-400)' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          <span className="text-[13px] font-medium" style={{ color: 'var(--teal-600)' }}>Agent Speaking</span>
                        </div>
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>The AI is responding</span>
                      </div>
                    )}
                    {connectionState.status === 'error' && (
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: '#dc2626' }}>Connection failed</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{connectionState.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  {isConnected && callDuration > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(callDuration)}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {isConnected && (
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-full transition-colors"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#dc2626' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        End Call
                      </button>
                    )}
                    {(connectionState.status === 'idle' || connectionState.status === 'error') && transcript.length > 0 && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-full transition-colors"
                        style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)', color: 'var(--text-3)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.10)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.06)'; }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(20,168,181,0.18)' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--teal-700)' }}>Testing tips</p>
                  <ul className="text-[11px] space-y-1" style={{ color: 'var(--text-3)' }}>
                    <li>· Allow microphone access when prompted</li>
                    <li>· Test booking an appointment end-to-end</li>
                    <li>· Ask about services, hours, and pricing</li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Right: Transcript */}
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader
                  title="Conversation Transcript"
                  description={transcript.length > 0 ? `${transcript.length} messages` : 'Transcript appears here during the call'}
                  icon={<MessageSquare className="w-4 h-4" />}
                  action={
                    transcript.length > 0 ? (
                      <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
                        Clear
                      </Button>
                    ) : undefined
                  }
                />

                <div className="flex-1 min-h-0">
                  {transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                        style={{ background: 'linear-gradient(135deg, rgba(20,168,181,0.12), rgba(13,115,119,0.08))', border: '1px solid rgba(20,168,181,0.25)', color: 'var(--teal-600)' }}>
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>No conversation yet</p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>Start a call to see the transcript in real time</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 pb-2">
                      {transcript.map((entry, i) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={cn('flex gap-2.5', entry.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                        >
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                            style={entry.role === 'assistant'
                              ? { background: 'rgba(13,115,119,0.12)', color: 'var(--teal-700)', border: '1px solid rgba(20,168,181,0.25)' }
                              : { background: 'rgba(13,115,119,0.06)', color: 'var(--text-3)', border: '1px solid rgba(13,115,119,0.14)' }
                            }>
                            {entry.role === 'assistant'
                              ? <Bot className="w-3.5 h-3.5" />
                              : <User className="w-3.5 h-3.5" />
                            }
                          </div>
                          <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                            style={entry.role === 'assistant'
                              ? { background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(20,168,181,0.18)', color: 'var(--text-1)', borderTopLeftRadius: 4 }
                              : { background: '#f8fcfd', border: '1px solid rgba(13,115,119,0.12)', color: 'var(--text-2)', borderTopRightRadius: 4 }
                            }>
                            {entry.content}
                            <div className="text-[10px] mt-1" style={{ color: entry.role === 'assistant' ? 'rgba(13,115,119,0.5)' : 'var(--text-4)' }}>
                              {entry.role === 'assistant' ? agent.name : 'You'} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Live typing indicator */}
                      {connectionState.status === 'speaking' && (
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: 'rgba(13,115,119,0.12)', color: 'var(--teal-700)', border: '1px solid rgba(20,168,181,0.25)' }}>
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                            style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(20,168,181,0.18)' }}>
                            <div className="flex gap-1 items-center h-4">
                              {[0, 0.2, 0.4].map((delay) => (
                                <motion.div
                                  key={delay}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: 'var(--teal-500)' }}
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Call ended summary */}
                {!isConnected && transcript.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(13,115,119,0.10)' }}>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-3)' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#059669' }} />
                      <span>Call ended · {transcript.length} messages exchanged · {formatDuration(callDuration)}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
            </div>
            ) : (
            /* ── Book Appointment Panel ── */
            <Card>
              <CardHeader
                title="Book Appointment"
                description="Manually create an appointment for a patient"
                icon={<Calendar className="w-4 h-4" />}
              />
              {bookingSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.25)' }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-1)' }}>Appointment Booked!</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                      {bookingSuccess.name} · {new Date(bookingSuccess.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setBookingSuccess(null)}>
                    Book Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                        Full Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        required
                        value={bookForm.customer_name}
                        onChange={(e) => setBookForm((f) => ({ ...f, customer_name: e.target.value }))}
                        placeholder="Jane Smith"
                        className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors"
                        style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                        Phone
                      </label>
                      <input
                        value={bookForm.customer_phone}
                        onChange={(e) => setBookForm((f) => ({ ...f, customer_phone: e.target.value }))}
                        placeholder="(555) 000-0000"
                        type="tel"
                        className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors"
                        style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                      Email <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={bookForm.customer_email}
                      onChange={(e) => setBookForm((f) => ({ ...f, customer_email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors"
                      style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                        Date of Birth <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        required
                        type="date"
                        value={bookForm.date_of_birth}
                        onChange={(e) => setBookForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                        className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors"
                        style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                        Service
                      </label>
                      <select
                        value={bookForm.service_id}
                        onChange={(e) => setBookForm((f) => ({ ...f, service_id: e.target.value }))}
                        className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors"
                        style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                      >
                        <option value="">— Select a service —</option>
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.id}>
                            {svc.name}{svc.duration_minutes ? ` (${svc.duration_minutes} min)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                        Date &amp; Time <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        required
                        type="datetime-local"
                        value={bookForm.scheduled_at}
                        onChange={(e) => setBookForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                        className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors"
                        style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      value={bookForm.notes}
                      onChange={(e) => setBookForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Any additional notes or patient concerns…"
                      className="px-3 py-2 rounded-xl text-[13px] outline-none transition-colors resize-none"
                      style={{ border: '1px solid rgba(13,115,119,0.18)', background: 'rgba(13,115,119,0.03)', color: 'var(--text-1)' }}
                    />
                  </div>

                  <div className="pt-1">
                    <Button type="submit" loading={bookingSubmitting} icon={<Calendar className="w-4 h-4" />}>
                      Book Appointment
                    </Button>
                  </div>
                </form>
              )}
            </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
