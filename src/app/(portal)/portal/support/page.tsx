'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Paperclip, X, FileText, ImageIcon,
  Loader2, Plus, ChevronLeft, CheckCircle2,
} from 'lucide-react';
import { FilePreview } from '@/components/ui/FilePreview';
import { createClient } from '@/lib/supabase/client';
import { PortalNav } from '@/components/portal/PortalNav';
import type { SupportTicket, SupportMessage } from '@/types';

type TicketWithMessages = SupportTicket & { messages: SupportMessage[] };

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function PortalSupportPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/portal/login'); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? '');

      // Get the business_id from the patient's most recent appointment
      const { data: appt } = await supabase
        .from('appointments')
        .select('business_id')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appt?.business_id) {
        setBusinessId(appt.business_id);
      } else {
        console.warn('[support] No appointment found for user:', user.email);
      }

      await loadTickets(user.id);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTickets = async (uid: string) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('patient_id', uid)
      .order('updated_at', { ascending: false });
    setTickets((data as SupportTicket[]) ?? []);
    setLoading(false);
  };

  const loadTicketMessages = async (ticketId: string) => {
    const supabase = createClient();
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    const { data: messages } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (ticket) {
      setActiveTicket({ ...(ticket as SupportTicket), messages: (messages as SupportMessage[]) ?? [] });
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const createTicket = async () => {
    if (!newSubject.trim()) return;
    if (!userId) return;
    setCreateError('');

    if (!businessId) {
      setCreateError('No appointment found. You must have a booked appointment to open a support ticket.');
      return;
    }

    setCreatingTicket(true);
    const supabase = createClient();

    // Ensure patient_profiles row exists (required by FK before inserting ticket)
    await supabase.from('patient_profiles').upsert(
      { id: userId, email: userEmail },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ business_id: businessId, patient_id: userId, subject: newSubject.trim() })
      .select()
      .single();

    if (error) {
      setCreateError(error.message);
      setCreatingTicket(false);
      return;
    }

    if (data) {
      setTickets(prev => [data as SupportTicket, ...prev]);
      setShowNewForm(false);
      setNewSubject('');
      setCreateError('');
      await loadTicketMessages(data.id);
    }
    setCreatingTicket(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileError('');
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Only images, PDF, and text files are allowed.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError('File must be under 10 MB.');
      return;
    }
    setFile(f);
  };

  const sendMessage = async () => {
    if ((!message.trim() && !file) || !activeTicket || !userId) return;
    setSending(true);
    const supabase = createClient();

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `tickets/${activeTicket.id}/${Date.now()}.${ext}`;
      const { data: uploaded, error: uploadErr } = await supabase.storage
        .from('support-files')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!uploadErr && uploaded) {
        const { data: { publicUrl } } = supabase.storage.from('support-files').getPublicUrl(uploaded.path);
        fileUrl = publicUrl;
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;
      }
    }

    const { data: msg } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: activeTicket.id,
        sender_role: 'patient',
        sender_id: userId,
        content: message.trim(),
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
      })
      .select()
      .single();

    if (msg) {
      setActiveTicket(prev => prev ? { ...prev, messages: [...prev.messages, msg as SupportMessage] } : prev);
    }

    // Update ticket timestamp
    await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('id', activeTicket.id);

    setMessage('');
    setFile(null);
    setSending(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const isImage = (type: string | null) => type?.startsWith('image/');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f2f8f9' }}>
      <PortalNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex gap-4" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Ticket list */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold" style={{ color: '#0a2e30' }}>Support Tickets</h2>
            <button
              onClick={() => setShowNewForm(v => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ background: 'rgba(13,115,119,0.10)', color: '#0d7377' }}
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* New ticket form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl p-3 space-y-2"
                  style={{ background: '#fff', border: '1px solid rgba(13,115,119,0.15)' }}>
                  <p className="text-[11px] font-semibold" style={{ color: '#0d7377' }}>New Support Request</p>
                  <input
                    value={newSubject}
                    onChange={e => { setNewSubject(e.target.value); setCreateError(''); }}
                    placeholder="Describe your issue briefly"
                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                    onKeyDown={e => e.key === 'Enter' && createTicket()}
                  />
                  {createError && (
                    <p className="text-[11px] leading-snug" style={{ color: '#ef4444' }}>{createError}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={createTicket} disabled={creatingTicket || !newSubject.trim()}
                      className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #14a8b5, #0d7377)', opacity: (!newSubject.trim() || creatingTicket) ? 0.6 : 1 }}>
                      {creatingTicket ? 'Creating…' : 'Create'}
                    </button>
                    <button onClick={() => setShowNewForm(false)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                      style={{ background: '#f1f5f9', color: '#64748b' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ticket list items */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0d7377' }} /></div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <MessageSquare className="w-8 h-8" style={{ color: 'rgba(13,115,119,0.25)' }} />
                <p className="text-[12px]" style={{ color: '#94a3b8' }}>No tickets yet</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => loadTicketMessages(ticket.id)}
                  className="w-full text-left px-3 py-3 rounded-xl transition-all"
                  style={{
                    background: activeTicket?.id === ticket.id ? 'rgba(13,115,119,0.10)' : '#ffffff',
                    border: `1px solid ${activeTicket?.id === ticket.id ? 'rgba(13,115,119,0.25)' : 'rgba(13,115,119,0.08)'}`,
                  }}
                >
                  <p className="text-[13px] font-semibold truncate" style={{ color: '#0a2e30' }}>{ticket.subject}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background: ticket.status === 'open' ? 'rgba(13,115,119,0.10)' : 'rgba(5,150,105,0.10)',
                        color: ticket.status === 'open' ? '#0d7377' : '#059669',
                      }}>
                      {ticket.status}
                    </span>
                    <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid rgba(13,115,119,0.10)', boxShadow: '0 2px 16px rgba(13,115,119,0.07)' }}>

          {!activeTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <MessageSquare className="w-12 h-12" style={{ color: 'rgba(13,115,119,0.20)' }} />
              <p className="text-[15px] font-semibold" style={{ color: '#0a2e30' }}>Select a ticket</p>
              <p className="text-[13px]" style={{ color: '#94a3b8' }}>or create a new support request</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(13,115,119,0.10)' }}>
                <button
                  onClick={() => setActiveTicket(null)}
                  className="md:hidden p-1 rounded-lg"
                  style={{ color: '#64748b' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <p className="font-bold text-[14px]" style={{ color: '#0a2e30' }}>{activeTicket.subject}</p>
                  <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                    Opened {new Date(activeTicket.created_at).toLocaleDateString()}
                    {activeTicket.status === 'resolved' && ' · Resolved'}
                  </p>
                </div>
                {activeTicket.status === 'resolved' && (
                  <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: '#059669' }} />
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {activeTicket.messages.length === 0 ? (
                  <p className="text-center text-[13px] py-8" style={{ color: '#94a3b8' }}>
                    No messages yet. Send your first message below.
                  </p>
                ) : (
                  activeTicket.messages.map(msg => {
                    const isPatient = msg.sender_role === 'patient';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="max-w-[70%] px-3.5 py-2.5 rounded-2xl space-y-1"
                          style={{
                            background: isPatient ? 'linear-gradient(135deg, #14a8b5, #0d7377)' : '#f1f5f9',
                            color: isPatient ? '#fff' : '#0f172a',
                          }}
                        >
                          {msg.content && <p className="text-[13px] leading-relaxed">{msg.content}</p>}

                          {/* File attachment */}
                          {msg.file_url && (
                            <FilePreview
                              fileUrl={msg.file_url}
                              fileName={msg.file_name}
                              fileType={msg.file_type}
                              isOutgoing={isPatient}
                            />
                          )}

                          <p className="text-[9px] opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* File preview */}
              {file && (
                <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(13,115,119,0.15)' }}>
                  {isImage(file.type) ? <ImageIcon className="w-4 h-4" style={{ color: '#0d7377' }} /> : <FileText className="w-4 h-4" style={{ color: '#0d7377' }} />}
                  <span className="text-[12px] flex-1 truncate" style={{ color: '#0d7377' }}>{file.name}</span>
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button onClick={() => setFile(null)} style={{ color: '#94a3b8' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {fileError && (
                <p className="mx-4 mb-1 text-[11px]" style={{ color: '#ef4444' }}>{fileError}</p>
              )}

              {/* Input bar */}
              {activeTicket.status !== 'closed' && (
                <div className="px-4 py-3 flex items-end gap-2"
                  style={{ borderTop: '1px solid rgba(13,115,119,0.08)' }}>
                  {/* File attach button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(13,115,119,0.07)', color: '#0d7377' }}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileChange}
                  />

                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder="Type your message… (Enter to send)"
                    rows={1}
                    className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      maxHeight: '120px',
                    }}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={sending || (!message.trim() && !file)}
                    className="flex-shrink-0 p-2.5 rounded-xl text-white transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, #14a8b5, #0d7377)',
                      opacity: (sending || (!message.trim() && !file)) ? 0.5 : 1,
                    }}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
