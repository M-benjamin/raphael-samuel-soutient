'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Loader2, CheckCircle2, Clock,
  XCircle, FileText, X,
} from 'lucide-react';
import { FilePreview } from '@/components/ui/FilePreview';
import { createClient } from '@/lib/supabase/client';
import { useBusinessStore } from '@/store/business';
import { Card, CardHeader } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  patient_id: string;
  patient?: { email: string; full_name: string | null };
}

interface Message {
  id: string;
  ticket_id: string;
  sender_role: 'patient' | 'staff';
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#0d7377', bg: 'rgba(13,115,119,0.10)', icon: MessageSquare },
  in_progress: { label: 'In Progress', color: '#d97706', bg: 'rgba(217,119,6,0.10)',  icon: Clock },
  resolved:    { label: 'Resolved',    color: '#059669', bg: 'rgba(5,150,105,0.10)',  icon: CheckCircle2 },
  closed:      { label: 'Closed',      color: '#64748b', bg: 'rgba(100,116,139,0.10)', icon: XCircle },
};

export default function DashboardSupportPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rtRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  useEffect(() => {
    if (!business) return;
    loadTickets();
    return () => {
      if (channelRef.current && rtRef.current) {
        rtRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const loadTickets = async () => {
    if (!business) return;
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from('support_tickets')
      .select('*, patient:patient_profiles(email, full_name)')
      .eq('business_id', business.id)
      .order('updated_at', { ascending: false });

    setTickets((data as Ticket[]) ?? []);
    setLoading(false);
    startRealtime(supabase);
  };

  const startRealtime = (supabase: ReturnType<typeof createClient>) => {
    if (!business) return;
    // Remove any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    rtRef.current = supabase;
    const channel = supabase
      .channel(`support:${business.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets', filter: `business_id=eq.${business.id}` },
        (payload) => {
          const { eventType, new: newRow } = payload as unknown as { eventType: string; new: Ticket; old: Partial<Ticket> };
          if (eventType === 'INSERT') {
            setTickets(prev => [newRow, ...prev]);
            setUnreadMap(prev => ({ ...prev, [newRow.id]: (prev[newRow.id] ?? 0) + 1 }));
            toast.success('New support ticket', newRow.subject);
          }
          if (eventType === 'UPDATE') {
            setTickets(prev => prev.map(t => t.id === newRow.id ? { ...t, ...newRow } : t));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_role === 'patient') {
            setUnreadMap(prev => ({ ...prev, [msg.ticket_id]: (prev[msg.ticket_id] ?? 0) + 1 }));
            setMessages(prev => {
              if (prev.length > 0 && prev[0].ticket_id === msg.ticket_id) {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
              }
              return prev;
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
          }
        }
      )
      .subscribe();
    channelRef.current = channel;
  };

  const openTicket = async (ticket: Ticket) => {
    setActiveTicket(ticket);
    setUnreadMap(prev => ({ ...prev, [ticket.id]: 0 }));
    setLoadingMsgs(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });
    setMessages((data as Message[]) ?? []);
    setLoadingMsgs(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeTicket) return;
    setSending(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSending(false); return; }

    const { data: msg } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: activeTicket.id,
        sender_role: 'staff',
        sender_id: user.id,
        content: reply.trim(),
      })
      .select()
      .single();

    if (msg) {
      setMessages(prev => [...prev, msg as Message]);
      // Move ticket to top
      setTickets(prev => {
        const t = prev.find(t => t.id === activeTicket.id);
        if (!t) return prev;
        return [{ ...t, status: t.status === 'open' ? 'in_progress' : t.status }, ...prev.filter(t => t.id !== activeTicket.id)];
      });
      // Auto-set to in_progress when staff replies
      if (activeTicket.status === 'open') {
        await supabase.from('support_tickets').update({ status: 'in_progress' }).eq('id', activeTicket.id);
        setActiveTicket(prev => prev ? { ...prev, status: 'in_progress' } : prev);
      }
    }
    setReply('');
    setSending(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const updateStatus = async (status: Ticket['status']) => {
    if (!activeTicket) return;
    setStatusUpdating(true);
    const supabase = createClient();
    await supabase.from('support_tickets').update({ status }).eq('id', activeTicket.id);
    setActiveTicket(prev => prev ? { ...prev, status } : prev);
    setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status } : t));
    setStatusUpdating(false);
    toast.success(`Ticket marked as ${status}`);
  };

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title={`Support Tickets${totalUnread > 0 ? ` (${totalUnread} new)` : ''}`}
          description="Patient support requests — reply to help them"
          icon={<MessageSquare className="w-4 h-4" />}
        />

        <div className="flex gap-4" style={{ height: '62vh', minHeight: 400 }}>

          {/* ── Ticket list ── */}
          <div className="w-72 flex-shrink-0 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
              ))
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <MessageSquare className="w-8 h-8" style={{ color: 'rgba(13,115,119,0.20)' }} />
                <p className="text-[13px]" style={{ color: '#94a3b8' }}>No support tickets yet</p>
              </div>
            ) : (
              tickets.map(ticket => {
                const cfg = STATUS_CONFIG[ticket.status];
                const unread = unreadMap[ticket.id] ?? 0;
                const isActive = activeTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className="w-full text-left px-3 py-3 rounded-xl transition-all relative"
                    style={{
                      background: isActive ? 'rgba(13,115,119,0.10)' : '#f8fafc',
                      border: `1px solid ${isActive ? 'rgba(13,115,119,0.25)' : 'rgba(13,115,119,0.08)'}`,
                    }}
                  >
                    {unread > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                        style={{ background: '#0d7377' }}>
                        {unread}
                      </span>
                    )}
                    <p className="text-[13px] font-semibold truncate pr-5" style={{ color: '#0a2e30' }}>{ticket.subject}</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: '#64748b' }}>
                      {(ticket.patient as Ticket['patient'])?.full_name || (ticket.patient as Ticket['patient'])?.email || 'Patient'}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ── Chat panel ── */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(13,115,119,0.10)' }}>

            {!activeTicket ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <MessageSquare className="w-12 h-12" style={{ color: 'rgba(13,115,119,0.15)' }} />
                <p className="text-[15px] font-semibold" style={{ color: '#0a2e30' }}>Select a ticket</p>
                <p className="text-[13px]" style={{ color: '#94a3b8' }}>Choose a patient request from the left</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: '1px solid rgba(13,115,119,0.10)', background: '#fafcfc' }}>
                  <div>
                    <p className="font-bold text-[14px]" style={{ color: '#0a2e30' }}>{activeTicket.subject}</p>
                    <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                      {(activeTicket.patient as Ticket['patient'])?.full_name || (activeTicket.patient as Ticket['patient'])?.email}
                      {' · '}Opened {new Date(activeTicket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status buttons */}
                    {(['open', 'in_progress', 'resolved', 'closed'] as Ticket['status'][]).map(s => {
                      const cfg = STATUS_CONFIG[s];
                      const isCurrentStatus = activeTicket.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(s)}
                          disabled={statusUpdating || isCurrentStatus}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                          style={{
                            background: isCurrentStatus ? cfg.bg : 'rgba(13,115,119,0.04)',
                            color: isCurrentStatus ? cfg.color : '#94a3b8',
                            border: `1px solid ${isCurrentStatus ? cfg.color + '40' : 'transparent'}`,
                          }}
                        >
                          {statusUpdating && isCurrentStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex justify-center pt-8">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0d7377' }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-[13px] py-8" style={{ color: '#94a3b8' }}>
                      No messages yet. The patient will send their first message shortly.
                    </p>
                  ) : (
                    messages.map(msg => {
                      const isStaff = msg.sender_role === 'staff';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-[70%]">
                            <p className="text-[10px] mb-1 px-1" style={{ color: '#94a3b8' }}>
                              {isStaff ? 'You (Staff)' : 'Patient'}
                              {' · '}{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                            <div
                              className="px-3.5 py-2.5 rounded-2xl"
                              style={{
                                background: isStaff ? 'linear-gradient(135deg, #14a8b5, #0d7377)' : '#f1f5f9',
                                color: isStaff ? '#fff' : '#0f172a',
                              }}
                            >
                              {msg.content && <p className="text-[13px] leading-relaxed">{msg.content}</p>}
                              {msg.file_url && (
                                <FilePreview
                                  fileUrl={msg.file_url}
                                  fileName={msg.file_name}
                                  fileType={msg.file_type}
                                  isOutgoing={isStaff}
                                />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply bar */}
                {!['resolved', 'closed'].includes(activeTicket.status) && (
                  <div className="px-4 py-3 flex items-end gap-2"
                    style={{ borderTop: '1px solid rgba(13,115,119,0.08)' }}>
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder="Type your reply… (Enter to send)"
                      rows={1}
                      className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', maxHeight: '120px' }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !reply.trim()}
                      className="flex-shrink-0 p-2.5 rounded-xl text-white transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #14a8b5, #0d7377)', opacity: (sending || !reply.trim()) ? 0.5 : 1 }}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                {['resolved', 'closed'].includes(activeTicket.status) && (
                  <div className="px-4 py-3 text-center text-[12px]" style={{ color: '#94a3b8', borderTop: '1px solid rgba(13,115,119,0.08)' }}>
                    This ticket is {activeTicket.status}. Change status to reply.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
