"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { PRICE_TYPES, SUGGESTED_SERVICES } from "@/constants";
import { formatPrice } from "@/lib/utils";
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "@/services/services";
import { useBusinessStore } from "@/store/business";
import type { Service } from "@/types";
import { serviceSchema, type ServiceFormData } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Baby,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Edit2,
  Eye,
  FlaskConical,
  GripVertical,
  Heart,
  HeartPulse,
  Leaf,
  Monitor,
  Plus,
  Search,
  Shield,
  Smile,
  Sparkles,
  Stethoscope,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

/* ── Category icon + color map ─────────────────────────────── */
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string }> =
  {
    "Primary & Preventive Care": {
      icon: <Stethoscope className="w-4 h-4" />,
      color: "#0d7377",
    },
    "Urgent & Emergency Care": {
      icon: <Zap className="w-4 h-4" />,
      color: "#dc2626",
    },
    "Telehealth & Virtual Care": {
      icon: <Monitor className="w-4 h-4" />,
      color: "#059669",
    },
    "Diagnostics & Lab": {
      icon: <FlaskConical className="w-4 h-4" />,
      color: "#7c3aed",
    },
    "Mental Health": { icon: <Brain className="w-4 h-4" />, color: "#6366f1" },
    "Women's Health": { icon: <Heart className="w-4 h-4" />, color: "#e11d75" },
    Pediatrics: { icon: <Baby className="w-4 h-4" />, color: "#f59e0b" },
    Dental: { icon: <Smile className="w-4 h-4" />, color: "#0891b2" },
    Dermatology: { icon: <Shield className="w-4 h-4" />, color: "#ea580c" },
    "Orthopedics & PT": {
      icon: <Activity className="w-4 h-4" />,
      color: "#0284c7",
    },
    "Nutrition & Wellness": {
      icon: <Leaf className="w-4 h-4" />,
      color: "#16a34a",
    },
    "Eye Care": { icon: <Eye className="w-4 h-4" />, color: "#0e7490" },
    Cardiology: { icon: <HeartPulse className="w-4 h-4" />, color: "#be123c" },
  };

const ALL_CATEGORIES = Array.from(
  new Set(SUGGESTED_SERVICES.map((s) => s.category)),
);

type SuggestedService = (typeof SUGGESTED_SERVICES)[number];

export default function ServicesPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingSuggested, setAddingSuggested] = useState<string | null>(null);
  const [addingBulk, setAddingBulk] = useState(false);

  /* Gallery state */
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(),
  );
  const [showGallery, setShowGallery] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      price_type: "fixed",
      duration_minutes: 60,
      is_active: true,
      sort_order: 0,
    },
  });
  const priceType = watch("price_type");

  const load = async () => {
    if (!business) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setServices(await getServices(business.id));
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [business]);

  const openCreate = () => {
    setEditingService(null);
    reset({
      price_type: "fixed",
      duration_minutes: 60,
      is_active: true,
      sort_order: services.length,
    });
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      price_type: service.price_type,
      price_min: service.price_min ?? undefined,
      price_max: service.price_max ?? undefined,
      is_active: service.is_active,
      sort_order: service.sort_order,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!business) return;
    try {
      if (editingService) {
        const updated = await updateService(editingService.id, data);
        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success("Service updated");
      } else {
        const created = await createService(business.id, data);
        setServices((prev) => [...prev, created]);
        toast.success("Service added");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(
        editingService ? "Failed to update service" : "Failed to add service",
        err instanceof Error ? err.message : "Unknown error",
      );
    }
  };

  const addSuggestedService = async (suggested: SuggestedService) => {
    if (!business) return;
    setAddingSuggested(suggested.name);
    try {
      const created = await createService(business.id, {
        name: suggested.name,
        description: suggested.description,
        duration_minutes: suggested.duration_minutes,
        price_type: suggested.price_type,
        price_min: suggested.price_min,
        price_max: suggested.price_max ?? undefined,
        is_active: true,
        sort_order: services.length,
      });
      setServices((prev) => [...prev, created]);
      toast.success(`"${suggested.name}" added`);
    } catch (err) {
      toast.error(
        "Failed to add service",
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setAddingSuggested(null);
    }
  };

  const addSelectedBulk = async () => {
    if (!business || selectedServices.size === 0) return;
    setAddingBulk(true);
    const toAdd = SUGGESTED_SERVICES.filter(
      (s) => selectedServices.has(s.name) && !alreadyAdded(s.name),
    );
    let added = 0;
    try {
      for (const s of toAdd) {
        const created = await createService(business.id, {
          name: s.name,
          description: s.description,
          duration_minutes: s.duration_minutes,
          price_type: s.price_type,
          price_min: s.price_min,
          price_max: s.price_max ?? undefined,
          is_active: true,
          sort_order: services.length + added,
        });
        setServices((prev) => [...prev, created]);
        added++;
      }
      toast.success(`${added} service${added !== 1 ? "s" : ""} added`);
      setSelectedServices(new Set());
    } catch (err) {
      toast.error(
        "Failed to add some services",
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setAddingBulk(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service deleted");
    } catch (err) {
      toast.error(
        "Failed to delete service",
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const toggleSelect = (name: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const selectCategory = (category: string) => {
    const catServices = SUGGESTED_SERVICES.filter(
      (s) => s.category === category && !alreadyAdded(s.name),
    );
    const catNames = catServices.map((s) => s.name);
    const allSelected = catNames.every((n) => selectedServices.has(n));
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (allSelected) catNames.forEach((n) => next.delete(n));
      else catNames.forEach((n) => next.add(n));
      return next;
    });
  };

  const alreadyAdded = (name: string) => services.some((s) => s.name === name);

  /* Filtered suggestions */
  const filtered = SUGGESTED_SERVICES.filter((s) => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Group by category for display */
  const grouped = ALL_CATEGORIES.filter(
    (cat) => activeCategory === "All" || cat === activeCategory,
  )
    .map((cat) => ({
      category: cat,
      meta: CATEGORY_META[cat] ?? {
        icon: <ClipboardList className="w-4 h-4" />,
        color: "#0d7377",
      },
      services: filtered.filter((s) => s.category === cat),
    }))
    .filter((g) => g.services.length > 0);

  const selectedNotAdded = [...selectedServices].filter(
    (n) => !alreadyAdded(n),
  );

  return (
    <div className="space-y-6">
      {/* ── Active Services List ──────────────────────────── */}
      <Card>
        <CardHeader
          title="Healthcare Services"
          description={`${services.length} service${services.length !== 1 ? "s" : ""} in your catalog`}
          icon={<ClipboardList className="w-4 h-4" />}
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Custom Service
            </Button>
          }
        />

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "rgba(13,115,119,0.06)" }}
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
            style={{
              background: "rgba(13,115,119,0.03)",
              border: "1px dashed rgba(13,115,119,0.18)",
            }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: "rgba(13,115,119,0.08)",
                border: "1px solid rgba(20,168,181,0.22)",
              }}
            >
              <ClipboardList className="w-5 h-5" style={{ color: "#0d7377" }} />
            </div>
            <p
              className="text-[14px] font-semibold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              No services yet
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
              Pick from the catalog below or add a custom service
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-100"
                style={{
                  border: "1px solid rgba(13,115,119,0.12)",
                  background: "rgba(13,115,119,0.02)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(20,168,181,0.28)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(13,115,119,0.12)";
                }}
              >
                <GripVertical
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--text-4)" }}
                />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(13,115,119,0.08)",
                    color: "var(--teal-600)",
                  }}
                >
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--text-1)" }}
                    >
                      {service.name}
                    </span>
                    {!service.is_active && (
                      <Badge variant="gray">Inactive</Badge>
                    )}
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    {service.duration_minutes} min ·{" "}
                    {formatPrice(
                      service.price_min,
                      service.price_max,
                      service.price_type,
                    )}
                  </div>
                  {service.description && (
                    <div
                      className="text-[11px] mt-0.5 truncate max-w-lg"
                      style={{ color: "var(--text-4)" }}
                    >
                      {service.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={() => openEdit(service)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: "#dc2626" }}
                      />
                    }
                    onClick={() => setDeleteId(service.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Service Catalog Gallery ─────────────────────────── */}
      <div>
        {/* Section header */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-2xl cursor-pointer select-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,115,119,0.07), rgba(20,168,181,0.04))",
            border: "1px solid rgba(13,115,119,0.14)",
            borderBottom: showGallery
              ? "none"
              : "1px solid rgba(13,115,119,0.14)",
            borderRadius: showGallery ? "16px 16px 0 0" : "16px",
          }}
          onClick={() => setShowGallery((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(13,115,119,0.10)",
                border: "1px solid rgba(20,168,181,0.25)",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#0d7377" }} />
            </div>
            <div>
              <h2
                className="text-[15px] font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Service Catalog
              </h2>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {SUGGESTED_SERVICES.length} services across{" "}
                {ALL_CATEGORIES.length} specialties — click to add
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedNotAdded.length > 0 && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #0d7377, #0a4a4d)",
                  boxShadow: "0 2px 10px rgba(13,115,119,0.30)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  addSelectedBulk();
                }}
                disabled={addingBulk}
              >
                {addingBulk ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Add {selectedNotAdded.length} Selected
              </button>
            )}
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{
                color: "var(--text-3)",
                transform: showGallery ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              style={{
                border: "1px solid rgba(13,115,119,0.14)",
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                background: "#ffffff",
              }}
            >
              <div className="p-5 space-y-5">
                {/* Search + filter row */}
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                      style={{ color: "var(--text-4)" }}
                    />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search services…"
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-[13px] outline-none transition-all"
                      style={{
                        background: "rgba(13,115,119,0.04)",
                        border: "1px solid rgba(13,115,119,0.14)",
                        color: "var(--text-1)",
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      >
                        <X
                          className="w-3 h-3"
                          style={{ color: "var(--text-4)" }}
                        />
                      </button>
                    )}
                  </div>
                  {selectedNotAdded.length > 0 && (
                    <button
                      onClick={() => setSelectedServices(new Set())}
                      className="text-[12px] px-3 py-2 rounded-lg transition-all"
                      style={{
                        color: "var(--text-3)",
                        background: "rgba(13,115,119,0.06)",
                      }}
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                {/* Category filter tabs */}
                <div className="flex gap-2 flex-wrap">
                  {["All", ...ALL_CATEGORIES].map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const count =
                      cat === "All"
                        ? SUGGESTED_SERVICES.length
                        : SUGGESTED_SERVICES.filter((s) => s.category === cat)
                            .length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap"
                        style={
                          activeCategory === cat
                            ? {
                                background: meta?.color ?? "#0d7377",
                                color: "#ffffff",
                                boxShadow: `0 2px 8px ${meta?.color ?? "#0d7377"}40`,
                              }
                            : {
                                background: "rgba(13,115,119,0.05)",
                                color: "var(--text-2)",
                                border: "1px solid rgba(13,115,119,0.12)",
                              }
                        }
                      >
                        {meta && cat !== "All" && (
                          <span
                            style={{
                              color:
                                activeCategory === cat
                                  ? "rgba(255,255,255,0.85)"
                                  : meta.color,
                            }}
                          >
                            {meta.icon}
                          </span>
                        )}
                        {cat === "All" ? "All Specialties" : cat}
                        <span style={{ opacity: 0.65 }}>· {count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Services grouped by category */}
                {grouped.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: "var(--text-3)" }}
                  >
                    <p className="text-[13px]">
                      No services match your search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {grouped.map(
                      ({ category, meta, services: catServices }) => {
                        const catNames = catServices
                          .filter((s) => !alreadyAdded(s.name))
                          .map((s) => s.name);
                        const allCatSelected =
                          catNames.length > 0 &&
                          catNames.every((n) => selectedServices.has(n));
                        return (
                          <div key={category}>
                            {/* Category header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{
                                    background: `${meta.color}18`,
                                    color: meta.color,
                                  }}
                                >
                                  {meta.icon}
                                </div>
                                <span
                                  className="text-[13px] font-bold"
                                  style={{ color: "var(--text-1)" }}
                                >
                                  {category}
                                </span>
                                <span
                                  className="text-[11px] px-2 py-0.5 rounded-full"
                                  style={{
                                    background: `${meta.color}12`,
                                    color: meta.color,
                                  }}
                                >
                                  {catServices.length}
                                </span>
                              </div>
                              {catNames.length > 0 && (
                                <button
                                  onClick={() => selectCategory(category)}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
                                  style={{
                                    background: allCatSelected
                                      ? `${meta.color}18`
                                      : "rgba(13,115,119,0.05)",
                                    color: allCatSelected
                                      ? meta.color
                                      : "var(--text-3)",
                                    border: `1px solid ${allCatSelected ? meta.color + "40" : "rgba(13,115,119,0.12)"}`,
                                  }}
                                >
                                  {allCatSelected
                                    ? "Deselect all"
                                    : "Select all"}
                                </button>
                              )}
                            </div>

                            {/* Service cards grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {catServices.map((s) => {
                                const added = alreadyAdded(s.name);
                                const selected = selectedServices.has(s.name);
                                return (
                                  <motion.div
                                    key={s.name}
                                    layout
                                    className="relative rounded-xl p-4 transition-all duration-150 cursor-pointer"
                                    style={{
                                      border: added
                                        ? `1px solid ${meta.color}40`
                                        : selected
                                          ? `1px solid ${meta.color}70`
                                          : "1px solid rgba(13,115,119,0.12)",
                                      background: added
                                        ? `${meta.color}08`
                                        : selected
                                          ? `${meta.color}0e`
                                          : "#ffffff",
                                      boxShadow: selected
                                        ? `0 2px 12px ${meta.color}20`
                                        : "none",
                                    }}
                                    onClick={() =>
                                      !added && toggleSelect(s.name)
                                    }
                                    onMouseEnter={(e) => {
                                      if (!added && !selected) {
                                        (
                                          e.currentTarget as HTMLElement
                                        ).style.borderColor = `${meta.color}44`;
                                        (
                                          e.currentTarget as HTMLElement
                                        ).style.background = `${meta.color}05`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!added && !selected) {
                                        (
                                          e.currentTarget as HTMLElement
                                        ).style.borderColor =
                                          "rgba(13,115,119,0.12)";
                                        (
                                          e.currentTarget as HTMLElement
                                        ).style.background = "#ffffff";
                                      }
                                    }}
                                  >
                                    {/* Checkbox / status indicator */}
                                    <div className="absolute top-3 right-3">
                                      {added ? (
                                        <CheckCircle2
                                          className="w-4 h-4"
                                          style={{ color: meta.color }}
                                        />
                                      ) : selected ? (
                                        <div
                                          className="w-4 h-4 rounded-full flex items-center justify-center"
                                          style={{ background: meta.color }}
                                        >
                                          <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                      ) : (
                                        <div
                                          className="w-4 h-4 rounded-full border-2"
                                          style={{
                                            borderColor:
                                              "rgba(13,115,119,0.20)",
                                          }}
                                        />
                                      )}
                                    </div>

                                    <div className="pr-6">
                                      <div
                                        className="text-[13px] font-semibold leading-snug mb-1"
                                        style={{ color: "var(--text-1)" }}
                                      >
                                        {s.name}
                                      </div>
                                      <div
                                        className="text-[11px] leading-relaxed mb-2.5 line-clamp-2"
                                        style={{ color: "var(--text-3)" }}
                                      >
                                        {s.description}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span
                                          className="text-[11px] font-bold"
                                          style={{ color: meta.color }}
                                        >
                                          {formatPrice(
                                            s.price_min,
                                            s.price_max ?? null,
                                            s.price_type,
                                          )}
                                        </span>
                                        <span
                                          className="text-[10px] px-2 py-0.5 rounded-full"
                                          style={{
                                            background: `${meta.color}10`,
                                            color: meta.color,
                                          }}
                                        >
                                          {s.duration_minutes} min
                                        </span>
                                      </div>
                                    </div>

                                    {/* Quick-add button (only when not added, not selected) */}
                                    {!added && !selected && (
                                      <button
                                        className="absolute bottom-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        style={{
                                          background: `${meta.color}18`,
                                          color: meta.color,
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addSuggestedService(s);
                                        }}
                                        disabled={addingSuggested === s.name}
                                      >
                                        {addingSuggested === s.name ? (
                                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Plus className="w-3 h-3" />
                                        )}
                                      </button>
                                    )}
                                    {added && (
                                      <div
                                        className="mt-2 text-[10px] font-semibold"
                                        style={{ color: meta.color }}
                                      >
                                        ✓ Added to your catalog
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}

                {/* Bulk add sticky bar */}
                <AnimatePresence>
                  {selectedNotAdded.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="sticky bottom-4 flex items-center justify-between px-5 py-3.5 rounded-2xl"
                      style={{
                        background: "linear-gradient(135deg, #072b2e, #0a3d40)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                        border: "1px solid rgba(20,168,181,0.25)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{
                            background: "rgba(20,168,181,0.15)",
                            border: "1px solid rgba(20,168,181,0.30)",
                          }}
                        >
                          <ClipboardList
                            className="w-4 h-4"
                            style={{ color: "#22c4d0" }}
                          />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white">
                            {selectedNotAdded.length} service
                            {selectedNotAdded.length !== 1 ? "s" : ""} selected
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: "rgba(255,255,255,0.50)" }}
                          >
                            Click "Add All" to add them to your catalog
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedServices(new Set())}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.65)",
                          }}
                        >
                          Clear
                        </button>
                        <button
                          onClick={addSelectedBulk}
                          disabled={addingBulk}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                          style={{
                            background:
                              "linear-gradient(135deg, #14a8b5, #0d7377)",
                            boxShadow: "0 2px 12px rgba(20,168,181,0.40)",
                          }}
                        >
                          {addingBulk ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
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
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? "Edit Service" : "Add Custom Service"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="General Consultation"
            error={errors.name?.message}
            required
            {...register("name")}
          />
          <Textarea
            label="Description"
            rows={2}
            placeholder="Brief description for the AI..."
            {...register("description")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              min={15}
              max={480}
              {...register("duration_minutes", { valueAsNumber: true })}
            />
            <Select
              label="Price Type"
              options={PRICE_TYPES.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              {...register("price_type")}
            />
          </div>
          {(priceType === "fixed" || priceType === "starting_at") && (
            <Input
              label="Price ($)"
              type="number"
              min={0}
              step="0.01"
              placeholder="120.00"
              {...register("price_min", { valueAsNumber: true })}
            />
          )}
          {priceType === "range" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Price ($)"
                type="number"
                min={0}
                step="0.01"
                {...register("price_min", { valueAsNumber: true })}
              />
              <Input
                label="Max Price ($)"
                type="number"
                min={0}
                step="0.01"
                {...register("price_max", { valueAsNumber: true })}
              />
            </div>
          )}
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Toggle
                label="Service is active"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingService ? "Save" : "Add Service"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Service"
        size="sm"
      >
        <p className="text-[13px] mb-5" style={{ color: "var(--text-2)" }}>
          This service will be removed. Existing appointments will not be
          affected.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deletingId === deleteId}
            onClick={() => deleteId && handleDelete(deleteId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
