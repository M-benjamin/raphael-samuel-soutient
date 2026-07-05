'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Sparkles,
  Calendar, CreditCard, MapPin, UserPlus, Pill, FlaskConical, Monitor,
  Send, Baby, Brain, Zap, Lock, CheckCircle2, Search, X,
} from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '@/services/faqs';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqSchema, type FaqFormData } from '@/validations';
import { SUGGESTED_FAQS } from '@/constants';
import type { FAQ } from '@/types';

/* ── Category meta ─────────────────────────────────────────── */
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string }> = {
  'Appointments':       { icon: <Calendar className="w-4 h-4" />,      color: '#0d7377' },
  'Insurance & Billing':{ icon: <CreditCard className="w-4 h-4" />,    color: '#7c3aed' },
  'Hours & Location':   { icon: <MapPin className="w-4 h-4" />,        color: '#0891b2' },
  'New Patients':       { icon: <UserPlus className="w-4 h-4" />,      color: '#059669' },
  'Prescriptions':      { icon: <Pill className="w-4 h-4" />,          color: '#ea580c' },
  'Test Results':       { icon: <FlaskConical className="w-4 h-4" />,  color: '#6366f1' },
  'Telehealth':         { icon: <Monitor className="w-4 h-4" />,       color: '#0284c7' },
  'Referrals':          { icon: <Send className="w-4 h-4" />,          color: '#14a8b5' },
  'Pediatrics':         { icon: <Baby className="w-4 h-4" />,          color: '#f59e0b' },
  'Mental Health':      { icon: <Brain className="w-4 h-4" />,         color: '#8b5cf6' },
  'Urgent Care':        { icon: <Zap className="w-4 h-4" />,           color: '#dc2626' },
  'Privacy & HIPAA':    { icon: <Lock className="w-4 h-4" />,          color: '#374151' },
};

const ALL_CATEGORIES = Array.from(new Set(SUGGESTED_FAQS.map((f) => f.category)));

export default function FaqsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Gallery state */
  const [showGallery, setShowGallery] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaqs, setSelectedFaqs] = useState<Set<string>>(new Set());
  const [addingSingle, setAddingSingle] = useState<string | null>(null);
  const [addingBulk, setAddingBulk] = useState(false);
  const [previewFaq, setPreviewFaq] = useState<typeof SUGGESTED_FAQS[number] | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: { is_active: true, sort_order: 0 },
  });

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      setFaqs(await getFaqs(business.id));
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  const openCreate = () => {
    setEditingFaq(null);
    reset({ is_active: true, sort_order: faqs.length });
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    reset({ question: faq.question, answer: faq.answer, category: faq.category || '', is_active: faq.is_active, sort_order: faq.sort_order });
    setModalOpen(true);
  };

  const onSubmit = async (data: FaqFormData) => {
    if (!business) return;
    try {
      if (editingFaq) {
        const updated = await updateFaq(editingFaq.id, data);
        setFaqs((prev) => prev.map((f) => f.id === updated.id ? updated : f));
        toast.success('FAQ updated');
      } else {
        const created = await createFaq(business.id, data);
        setFaqs((prev) => [...prev, created]);
        toast.success('FAQ added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(editingFaq ? 'Failed to update FAQ' : 'Failed to add FAQ', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const alreadyAdded = (question: string) => faqs.some((f) => f.question === question);

  const addSingle = async (s: typeof SUGGESTED_FAQS[number]) => {
    if (!business) return;
    setAddingSingle(s.question);
    try {
      const created = await createFaq(business.id, {
        question: s.question, answer: s.answer, category: s.category,
        is_active: true, sort_order: faqs.length,
      });
      setFaqs((prev) => [...prev, created]);
      toast.success('FAQ added');
    } catch (err) {
      toast.error('Failed to add FAQ', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAddingSingle(null);
    }
  };

  const addBulk = async () => {
    if (!business || selectedFaqs.size === 0) return;
    setAddingBulk(true);
    const toAdd = SUGGESTED_FAQS.filter((s) => selectedFaqs.has(s.question) && !alreadyAdded(s.question));
    let added = 0;
    try {
      for (const s of toAdd) {
        const created = await createFaq(business.id, {
          question: s.question, answer: s.answer, category: s.category,
          is_active: true, sort_order: faqs.length + added,
        });
        setFaqs((prev) => [...prev, created]);
        added++;
      }
      toast.success(`${added} FAQ${added !== 1 ? 's' : ''} added`);
      setSelectedFaqs(new Set());
    } catch (err) {
      toast.error('Failed to add some FAQs', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAddingBulk(false);
    }
  };

  const toggleSelect = (question: string) => {
    setSelectedFaqs((prev) => {
      const next = new Set(prev);
      next.has(question) ? next.delete(question) : next.add(question);
      return next;
    });
  };

  const selectCategory = (category: string) => {
    const catQs = SUGGESTED_FAQS.filter((s) => s.category === category && !alreadyAdded(s.question)).map((s) => s.question);
    const allSel = catQs.every((q) => selectedFaqs.has(q));
    setSelectedFaqs((prev) => {
      const next = new Set(prev);
      if (allSel) catQs.forEach((q) => next.delete(q));
      else catQs.forEach((q) => next.add(q));
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error('Failed to delete FAQ', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  /* Filtered & grouped suggestions */
  const filtered = SUGGESTED_FAQS.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || s.question.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.answer.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const grouped = ALL_CATEGORIES
    .filter((cat) => activeCategory === 'All' || cat === activeCategory)
    .map((cat) => ({
      category: cat,
      meta: CATEGORY_META[cat] ?? { icon: <HelpCircle className="w-4 h-4" />, color: '#0d7377' },
      items: filtered.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const selectedNotAdded = [...selectedFaqs].filter((q) => !alreadyAdded(q));

  return (
    <div className="space-y-6">

      {/* ── Active FAQs ──────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Knowledge Base"
          description={faqs.length > 0 ? `${faqs.length} Q&A pair${faqs.length !== 1 ? 's' : ''} training your AI` : 'Q&A pairs that train your AI agent'}
          icon={<HelpCircle className="w-4 h-4" />}
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Custom FAQ</Button>}
        />

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(13,115,119,0.06)' }} />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
            style={{ background: 'rgba(13,115,119,0.03)', border: '1px dashed rgba(13,115,119,0.18)' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(20,168,181,0.22)' }}>
              <HelpCircle className="w-5 h-5" style={{ color: '#0d7377' }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>No FAQs yet</p>
            <p className="text-[12px] max-w-sm" style={{ color: 'var(--text-3)' }}>
              Add common patient questions so your AI can provide accurate information on every call
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq) => {
              const meta = CATEGORY_META[faq.category ?? ''] ?? { color: '#0d7377' };
              return (
                <div key={faq.id} className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(13,115,119,0.14)' }}>
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer transition-colors duration-100"
                    style={{ background: 'rgba(13,115,119,0.02)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,115,119,0.02)'; }}
                    onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}14`, color: meta.color }}>
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{faq.question}</span>
                        {faq.category && <Badge variant="teal">{faq.category}</Badge>}
                        {!faq.is_active && <Badge variant="gray">Inactive</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={(e) => { e.stopPropagation(); openEdit(faq); }} />
                      <Button variant="ghost" size="sm" icon={<Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />} onClick={(e) => { e.stopPropagation(); setDeleteId(faq.id); }} />
                      {expanded === faq.id
                        ? <ChevronUp className="w-4 h-4 ml-1" style={{ color: 'var(--text-3)' }} />
                        : <ChevronDown className="w-4 h-4 ml-1" style={{ color: 'var(--text-3)' }} />
                      }
                    </div>
                  </div>
                  {expanded === faq.id && (
                    <div className="px-12 pb-4 text-[13px] leading-relaxed"
                      style={{ color: 'var(--text-2)', background: 'rgba(13,115,119,0.03)', borderTop: '1px solid rgba(13,115,119,0.08)' }}>
                      <div className="pt-3">{faq.answer}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── FAQ Suggestion Gallery ────────────────────────────── */}
      <div>
        {/* Collapsible header */}
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, rgba(13,115,119,0.07), rgba(20,168,181,0.04))',
            border: '1px solid rgba(13,115,119,0.14)',
            borderBottom: showGallery ? 'none' : '1px solid rgba(13,115,119,0.14)',
            borderRadius: showGallery ? '16px 16px 0 0' : '16px',
          }}
          onClick={() => setShowGallery((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(13,115,119,0.10)', border: '1px solid rgba(20,168,181,0.25)' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#0d7377' }} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-1)' }}>FAQ Templates</h2>
              <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                {SUGGESTED_FAQS.length} pre-written patient Q&As across {ALL_CATEGORIES.length} topics — add in one click
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedNotAdded.length > 0 && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)', boxShadow: '0 2px 10px rgba(13,115,119,0.30)' }}
                onClick={(e) => { e.stopPropagation(); addBulk(); }}
                disabled={addingBulk}
              >
                {addingBulk
                  ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Plus className="w-3.5 h-3.5" />
                }
                Add {selectedNotAdded.length} Selected
              </button>
            )}
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{ color: 'var(--text-3)', transform: showGallery ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </div>

        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              style={{ border: '1px solid rgba(13,115,119,0.14)', borderTop: 'none', borderRadius: '0 0 16px 16px', background: '#ffffff' }}
            >
              <div className="p-5 space-y-5">
                {/* Search + clear row */}
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-4)' }} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions…"
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-[13px] outline-none transition-all"
                      style={{ background: 'rgba(13,115,119,0.04)', border: '1px solid rgba(13,115,119,0.14)', color: 'var(--text-1)' }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="w-3 h-3" style={{ color: 'var(--text-4)' }} />
                      </button>
                    )}
                  </div>
                  {selectedNotAdded.length > 0 && (
                    <button onClick={() => setSelectedFaqs(new Set())}
                      className="text-[12px] px-3 py-2 rounded-lg"
                      style={{ color: 'var(--text-3)', background: 'rgba(13,115,119,0.06)' }}>
                      Clear selection
                    </button>
                  )}
                </div>

                {/* Category filter tabs */}
                <div className="flex gap-2 flex-wrap">
                  {['All', ...ALL_CATEGORIES].map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const count = cat === 'All' ? SUGGESTED_FAQS.length : SUGGESTED_FAQS.filter((s) => s.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap"
                        style={activeCategory === cat ? {
                          background: meta?.color ?? '#0d7377',
                          color: '#ffffff',
                          boxShadow: `0 2px 8px ${(meta?.color ?? '#0d7377')}40`,
                        } : {
                          background: 'rgba(13,115,119,0.05)',
                          color: 'var(--text-2)',
                          border: '1px solid rgba(13,115,119,0.12)',
                        }}
                      >
                        {meta && cat !== 'All' && (
                          <span style={{ color: activeCategory === cat ? 'rgba(255,255,255,0.85)' : meta.color }}>
                            {meta.icon}
                          </span>
                        )}
                        {cat === 'All' ? 'All Topics' : cat}
                        <span style={{ opacity: 0.65 }}>· {count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Grouped FAQ list */}
                {grouped.length === 0 ? (
                  <div className="text-center py-8" style={{ color: 'var(--text-3)' }}>
                    <p className="text-[13px]">No FAQs match your search.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {grouped.map(({ category, meta, items }) => {
                      const catQs = items.filter((s) => !alreadyAdded(s.question)).map((s) => s.question);
                      const allCatSel = catQs.length > 0 && catQs.every((q) => selectedFaqs.has(q));
                      return (
                        <div key={category}>
                          {/* Category row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: `${meta.color}18`, color: meta.color }}>
                                {meta.icon}
                              </div>
                              <span className="text-[13px] font-bold" style={{ color: 'var(--text-1)' }}>{category}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{ background: `${meta.color}12`, color: meta.color }}>
                                {items.length}
                              </span>
                            </div>
                            {catQs.length > 0 && (
                              <button
                                onClick={() => selectCategory(category)}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
                                style={{
                                  background: allCatSel ? `${meta.color}18` : 'rgba(13,115,119,0.05)',
                                  color: allCatSel ? meta.color : 'var(--text-3)',
                                  border: `1px solid ${allCatSel ? meta.color + '40' : 'rgba(13,115,119,0.12)'}`,
                                }}
                              >
                                {allCatSel ? 'Deselect all' : 'Select all'}
                              </button>
                            )}
                          </div>

                          {/* FAQ items */}
                          <div className="space-y-2">
                            {items.map((s) => {
                              const added = alreadyAdded(s.question);
                              const selected = selectedFaqs.has(s.question);
                              const isPreview = previewFaq?.question === s.question;
                              return (
                                <motion.div
                                  key={s.question}
                                  layout
                                  className="rounded-xl overflow-hidden transition-all duration-150 cursor-pointer"
                                  style={{
                                    border: added
                                      ? `1px solid ${meta.color}40`
                                      : selected
                                      ? `1px solid ${meta.color}60`
                                      : '1px solid rgba(13,115,119,0.12)',
                                    background: added
                                      ? `${meta.color}06`
                                      : selected
                                      ? `${meta.color}0c`
                                      : '#ffffff',
                                  }}
                                  onClick={() => !added && toggleSelect(s.question)}
                                >
                                  <div className="flex items-start gap-3 px-4 py-3">
                                    {/* Checkbox */}
                                    <div className="mt-0.5 flex-shrink-0">
                                      {added ? (
                                        <CheckCircle2 className="w-4 h-4" style={{ color: meta.color }} />
                                      ) : selected ? (
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: meta.color }}>
                                          <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border-2 mt-0.5" style={{ borderColor: 'rgba(13,115,119,0.22)' }} />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>
                                        {s.question}
                                      </p>
                                      {/* Answer preview — shown when expanded */}
                                      <AnimatePresence>
                                        {isPreview && (
                                          <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-[12px] leading-relaxed mt-2 pb-1"
                                            style={{ color: 'var(--text-2)' }}
                                          >
                                            {s.answer}
                                          </motion.p>
                                        )}
                                      </AnimatePresence>
                                      {added && (
                                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: meta.color }}>
                                          ✓ In your knowledge base
                                        </p>
                                      )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                      <button
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:scale-[1.03]"
                                        style={{
                                          background: isPreview ? `${meta.color}15` : 'rgba(13,115,119,0.06)',
                                          color: isPreview ? meta.color : 'var(--text-3)',
                                          border: `1px solid ${isPreview ? meta.color + '30' : 'rgba(13,115,119,0.12)'}`,
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setPreviewFaq(isPreview ? null : s); }}
                                      >
                                        {isPreview ? 'Hide' : 'Preview'}
                                      </button>
                                      {!added && (
                                        <button
                                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.03]"
                                          style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`, boxShadow: `0 1px 6px ${meta.color}30` }}
                                          onClick={(e) => { e.stopPropagation(); addSingle(s); }}
                                          disabled={addingSingle === s.question}
                                        >
                                          {addingSingle === s.question
                                            ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                            : '+ Add'
                                          }
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sticky bulk-add bar */}
                <AnimatePresence>
                  {selectedNotAdded.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="sticky bottom-4 flex items-center justify-between px-5 py-3.5 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #072b2e, #0a3d40)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(20,168,181,0.25)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(20,168,181,0.15)', border: '1px solid rgba(20,168,181,0.30)' }}>
                          <HelpCircle className="w-4 h-4" style={{ color: '#22c4d0' }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white">
                            {selectedNotAdded.length} FAQ{selectedNotAdded.length !== 1 ? 's' : ''} selected
                          </p>
                          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            Click "Add All" to train your AI with these answers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedFaqs(new Set())}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
                        >
                          Clear
                        </button>
                        <button
                          onClick={addBulk}
                          disabled={addingBulk}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                          style={{ background: 'linear-gradient(135deg, #14a8b5, #0d7377)', boxShadow: '0 2px 12px rgba(20,168,181,0.40)' }}
                        >
                          {addingBulk
                            ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <Plus className="w-3.5 h-3.5" />
                          }
                          Add All {selectedNotAdded.length}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingFaq ? 'Edit FAQ' : 'Add Custom FAQ'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Question" placeholder="What are your office hours?" error={errors.question?.message} required {...register('question')} />
          <Textarea label="Answer" rows={4} placeholder="We are open Monday through Friday from 8am to 5pm..." error={errors.answer?.message} required {...register('answer')} />
          <Input label="Category (optional)" placeholder="Hours, Insurance, Services..." {...register('category')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editingFaq ? 'Save' : 'Add FAQ'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete FAQ" size="sm">
        <p className="text-[13px] mb-5" style={{ color: 'var(--text-2)' }}>
          This FAQ will be removed from your AI knowledge base.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingId === deleteId} onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
