"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { DAYS_OF_WEEK, TIMEZONES } from "@/constants";
import { createClient } from "@/lib/supabase/client";
import {
  createBusiness,
  getBusinessHours,
  updateBusiness,
  updateBusinessHours,
} from "@/services/business";
import { useBusinessStore } from "@/store/business";
import { businessSchema, type BusinessFormData } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type HourRow = {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
};

const DAY_ABBREV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsPage() {
  const {
    business,
    setBusiness,
    isLoading: businessLoading,
  } = useBusinessStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("business");
  const [hours, setHours] = useState<HourRow[]>([]);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursSaving, setHoursSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: { timezone: "America/New_York" },
  });

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        phone: business.phone || "",
        email: business.email || "",
        address: business.address || "",
        city: business.city || "",
        state: business.state || "",
        zip: business.zip || "",
        website: business.website || "",
        timezone: business.timezone,
      });
    }
  }, [business, reset]);

  useEffect(() => {
    if (!business || activeTab !== "hours") return;
    setHoursLoading(true);
    getBusinessHours(business.id)
      .then((data) => {
        const base: HourRow[] = DAYS_OF_WEEK.map((_, i) => {
          const found = data.find((h) => h.day_of_week === i);
          return {
            day_of_week: i,
            is_open: found?.is_open ?? (i !== 0 && i !== 6),
            open_time: found?.open_time || "08:00",
            close_time: found?.close_time || "17:00",
          };
        });
        setHours(base);
      })
      .catch(() => toast.error("Failed to load business hours"))
      .finally(() => setHoursLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, activeTab]);

  const onBusinessSubmit = async (data: BusinessFormData) => {
    try {
      if (business) {
        const updated = await updateBusiness(business.id, data);
        setBusiness(updated);
        toast.success("Business profile saved");
      } else {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Not authenticated");
          return;
        }
        const created = await createBusiness(user.id, data);
        setBusiness(created);
        toast.success(
          "Business profile created",
          "Your business is now set up",
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to save business profile", msg);
    }
  };

  const saveHours = async () => {
    if (!business) {
      toast.error("Save your business profile first");
      return;
    }
    setHoursSaving(true);
    try {
      await updateBusinessHours(business.id, hours);
      toast.success("Business hours saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to save hours", msg);
    } finally {
      setHoursSaving(false);
    }
  };

  const updateHour = (
    dayIndex: number,
    field: keyof HourRow,
    value: string | boolean,
  ) => {
    setHours((prev) =>
      prev.map((h, i) => (i === dayIndex ? { ...h, [field]: value } : h)),
    );
  };

  const openCount = hours.filter((h) => h.is_open).length;

  // ── Payment config state ──
  // const [paymentConfig, setPaymentConfig] = useState({
  //   network_name: "Polygon",
  //   chain_id: "137",
  //   rpc_url: "https://polygon-rpc.com",
  //   usdc_contract_address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  //   receiver_wallet: "",
  //   usdc_decimals: "6",
  // });
  const [paymentConfig, setPaymentConfig] = useState({
    pubKey: "",
    secretKey: "",
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  useEffect(() => {
    if (!business || activeTab !== "payment") return;
    setPaymentLoading(true);
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("payment_config")
        .select("*")
        .eq("business_id", business.id)
        .maybeSingle();
      if (data) {
        setPaymentConfig({
          pubKey: data.stripe_publishable_key,
          secretKey: data.stripe_secret_key,
        });
      }
      setPaymentLoading(false);
    })();
  }, [business, activeTab]);

  const savePaymentConfig = async () => {
    if (!business) {
      toast.error("Save your business profile first");
      return;
    }
    setPaymentSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("payment_config").upsert(
        {
          business_id: business.id,
          stripe_secret_key: paymentConfig.secretKey,
          stripe_publishable_key: paymentConfig.pubKey,
          // chain_id: parseInt(paymentConfig.chain_id, 10),
          // rpc_url: paymentConfig.rpc_url,
          // usdc_contract_address: paymentConfig.usdc_contract_address,
          // receiver_wallet: paymentConfig.receiver_wallet,
          // usdc_decimals: parseInt(paymentConfig.usdc_decimals, 10),
          is_active: true,
        },
        { onConflict: "business_id" },
      );
      toast.success("Payment config saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to save payment config", msg);
    } finally {
      setPaymentSaving(false);
    }
  };

  const tabs = [
    { id: "business", label: "Business Profile", icon: Building2 },
    { id: "hours", label: "Business Hours", icon: Clock },
    { id: "payment", label: "Stripe Payments", icon: CreditCard },
  ];

  if (businessLoading) {
    return (
      <div className="space-y-5 max-w-4xl">
        <div
          className="h-12 rounded-xl animate-pulse"
          style={{ background: "rgba(13,115,119,0.06)" }}
        />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl animate-pulse"
              style={{ background: "rgba(13,115,119,0.06)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(20,168,181,0.15), rgba(13,115,119,0.10))",
            border: "1px solid rgba(20,168,181,0.25)",
            color: "var(--teal-600)",
          }}
        >
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h1
            className="text-[16px] font-bold"
            style={{ color: "var(--text-1)" }}
          >
            Practice Settings
          </h1>
          <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
            Manage your clinic profile and operating hours
          </p>
        </div>
      </div>

      {/* Custom tab bar */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{
          background: "rgba(13,115,119,0.06)",
          border: "1px solid rgba(13,115,119,0.12)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
            style={
              activeTab === tab.id
                ? {
                    background: "#ffffff",
                    color: "var(--teal-700)",
                    border: "1px solid rgba(13,115,119,0.18)",
                    boxShadow: "0 1px 4px rgba(13,115,119,0.10)",
                  }
                : { color: "var(--text-3)", border: "1px solid transparent" }
            }
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BUSINESS PROFILE TAB ── */}
      {activeTab === "business" && (
        <form onSubmit={handleSubmit(onBusinessSubmit)} className="space-y-5">
          {/* Practice Identity */}
          <Card>
            <CardHeader
              title="Practice Identity"
              description="Your clinic's name and contact information"
              icon={<Building2 className="w-4 h-4" />}
            />
            <div className="space-y-4">
              <Input
                label="Practice / Clinic Name"
                placeholder="Sunrise Family Health"
                error={errors.name?.message}
                required
                {...register("name")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="(555) 000-0000"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="info@yourclinic.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <Input
                label="Website"
                type="url"
                placeholder="https://yourclinic.com"
                error={errors.website?.message}
                {...register("website")}
              />
            </div>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader
              title="Clinic Location"
              description="Physical address shown to patients"
              icon={<MapPin className="w-4 h-4" />}
            />
            <div className="space-y-4">
              <Input
                label="Street Address"
                placeholder="123 Medical Drive, Suite 100"
                {...register("address")}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="Austin"
                  {...register("city")}
                />
                <Input label="State" placeholder="TX" {...register("state")} />
                <Input
                  label="ZIP Code"
                  placeholder="78701"
                  {...register("zip")}
                />
              </div>
            </div>
          </Card>

          {/* Timezone */}
          <Card>
            <CardHeader
              title="Regional Settings"
              description="Timezone used for appointment scheduling"
              icon={<Globe className="w-4 h-4" />}
            />
            <div className="max-w-sm">
              <Select
                label="Timezone"
                options={TIMEZONES.map((tz) => ({
                  value: tz,
                  label: tz.replace("America/", "").replace(/_/g, " "),
                }))}
                {...register("timezone")}
              />
            </div>
          </Card>

          {/* Save button */}
          <div className="flex items-center gap-3 pb-2">
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {business ? "Save Changes" : "Create Practice Profile"}
            </Button>
            {business && (
              <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
                Last saved automatically on profile load
              </span>
            )}
          </div>
        </form>
      )}

      {/* ── CRYPTO PAYMENT CONFIG TAB ── */}
      {activeTab === "payment" && (
        <div className="space-y-5 ">
          {!business ? (
            <Card>
              <div className="py-10 flex flex-col items-center gap-3">
                <AlertCircle
                  className="w-8 h-8"
                  style={{ color: "rgba(13,115,119,0.40)" }}
                />
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--text-2)" }}
                >
                  Save your business profile first
                </p>
                <Button size="sm" onClick={() => setActiveTab("business")}>
                  Go to Business Profile
                </Button>
              </div>
            </Card>
          ) : paymentLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl animate-pulse"
                  style={{ background: "rgba(13,115,119,0.06)" }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader
                title="Appointment Payments(Stipe Account)"
                description="Patient payments will be sent to this Stripe account"
                icon={<CreditCard className="w-4 h-4" />}
              />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[12px] font-semibold mb-1.5"
                      style={{ color: "var(--text-2)" }}
                    >
                      Publishable API Key
                      <span className="text-red-500">(starts with pk_)</span>
                    </label>
                    <input
                      value={paymentConfig.pubKey}
                      onChange={(e) =>
                        setPaymentConfig((p) => ({
                          ...p,
                          pubKey: e.target.value,
                        }))
                      }
                      placeholder="pk_live.... or pk_test...."
                      className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid rgba(13,115,119,0.20)",
                        color: "var(--text-1)",
                      }}
                    />
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "var(--text-3)" }}
                    >
                      Save this key in a safe place
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Secret Key */}
                  <div>
                    <label
                      className="block text-[12px] font-semibold mb-1.5"
                      style={{ color: "var(--text-2)" }}
                    >
                      Secret API Key
                      <span className="text-red-500">(starts with sk_)</span>
                    </label>
                    <div className="relative">
                      <input
                        value={paymentConfig.secretKey}
                        onChange={(e) =>
                          setPaymentConfig((p) => ({
                            ...p,
                            secretKey: e.target.value,
                          }))
                        }
                        type={showSecret ? "text" : "password"}
                        placeholder="pk_live.... or pk_test...."
                        className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid rgba(13,115,119,0.20)",
                          color: "var(--text-1)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret((s) => !s)}
                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[10px] font-semibold"
                      >
                        {showSecret ? "Hide " : "Show"}
                      </button>
                    </div>
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "var(--text-3)" }}
                    >
                      Store this key in a safe place never share
                    </p>
                  </div>
                </div>

                <div
                  className="pt-3 flex items-center gap-3"
                  style={{ borderTop: "1px solid rgba(13,115,119,0.08)" }}
                >
                  <Button
                    onClick={savePaymentConfig}
                    loading={paymentSaving}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Save Payment Config
                  </Button>
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    Changes apply immediately to the patient portal payment
                    modal
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── BUSINESS HOURS TAB ── */}
      {activeTab === "hours" && (
        <div className="space-y-5">
          {!business ? (
            <Card>
              <div className="py-10 flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(13,115,119,0.08)",
                    border: "1px solid rgba(20,168,181,0.22)",
                    color: "var(--teal-600)",
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--text-2)" }}
                >
                  Save your business profile first
                </p>
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  Complete the Business Profile tab before configuring hours.
                </p>
                <Button size="sm" onClick={() => setActiveTab("business")}>
                  Go to Business Profile
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Summary strip */}
              <div
                className="rounded-xl px-5 py-4 flex items-center justify-between"
                style={{
                  background: "rgba(13,115,119,0.05)",
                  border: "1px solid rgba(20,168,181,0.18)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Clock
                    className="w-4 h-4"
                    style={{ color: "var(--teal-600)" }}
                  />
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "var(--text-1)" }}
                  >
                    Open{" "}
                    <span style={{ color: "var(--teal-600)" }}>
                      {openCount}
                    </span>{" "}
                    day
                    {openCount !== 1 ? "s" : ""} a week
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {DAY_ABBREV.map((d, i) => {
                    const h = hours[i];
                    return (
                      <div
                        key={d}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                        style={
                          h?.is_open
                            ? {
                                background: "rgba(13,115,119,0.12)",
                                color: "var(--teal-700)",
                                border: "1px solid rgba(20,168,181,0.30)",
                              }
                            : {
                                background: "rgba(13,115,119,0.04)",
                                color: "var(--text-4)",
                                border: "1px solid rgba(13,115,119,0.10)",
                              }
                        }
                      >
                        {d[0]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hours grid */}
              {hoursLoading ? (
                <Card>
                  <div className="space-y-3">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl animate-pulse"
                        style={{ background: "rgba(13,115,119,0.06)" }}
                      />
                    ))}
                  </div>
                </Card>
              ) : (
                <Card>
                  <CardHeader
                    title="Weekly Schedule"
                    description="Toggle each day and set open/close times"
                    icon={<Clock className="w-4 h-4" />}
                  />
                  <div className="space-y-2">
                    {hours.map((hour, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-100"
                        style={
                          hour.is_open
                            ? {
                                background: "rgba(13,115,119,0.03)",
                                border: "1px solid rgba(20,168,181,0.16)",
                              }
                            : {
                                background: "rgba(13,115,119,0.02)",
                                border: "1px solid rgba(13,115,119,0.08)",
                              }
                        }
                      >
                        {/* Day name */}
                        <div className="w-28 flex items-center gap-2.5 flex-shrink-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={
                              hour.is_open
                                ? {
                                    background: "rgba(13,115,119,0.10)",
                                    color: "var(--teal-700)",
                                    border: "1px solid rgba(20,168,181,0.25)",
                                  }
                                : {
                                    background: "rgba(13,115,119,0.05)",
                                    color: "var(--text-4)",
                                    border: "1px solid rgba(13,115,119,0.10)",
                                  }
                            }
                          >
                            {DAY_ABBREV[hour.day_of_week]}
                          </div>
                          <span
                            className="text-[13px] font-medium"
                            style={{
                              color: hour.is_open
                                ? "var(--text-1)"
                                : "var(--text-3)",
                            }}
                          >
                            {DAYS_OF_WEEK[hour.day_of_week]}
                          </span>
                        </div>

                        {/* Toggle */}
                        <Toggle
                          size="sm"
                          checked={hour.is_open}
                          onChange={(v) => updateHour(i, "is_open", v)}
                        />

                        {/* Time inputs or Closed label */}
                        {hour.is_open ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={hour.open_time}
                              onChange={(e) =>
                                updateHour(i, "open_time", e.target.value)
                              }
                              className="text-[13px] py-2 px-3 rounded-xl outline-none transition-all"
                              style={{
                                background: "#ffffff",
                                border: "1px solid rgba(13,115,119,0.20)",
                                color: "var(--text-1)",
                                colorScheme: "light",
                                minWidth: "130px",
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(20,168,181,0.60)";
                                e.currentTarget.style.boxShadow =
                                  "0 0 0 3px rgba(20,168,181,0.12)";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(13,115,119,0.20)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            />
                            <span
                              className="text-[12px] font-medium px-1"
                              style={{ color: "var(--text-4)" }}
                            >
                              →
                            </span>
                            <input
                              type="time"
                              value={hour.close_time}
                              onChange={(e) =>
                                updateHour(i, "close_time", e.target.value)
                              }
                              className="text-[13px] py-2 px-3 rounded-xl outline-none transition-all"
                              style={{
                                background: "#ffffff",
                                border: "1px solid rgba(13,115,119,0.20)",
                                color: "var(--text-1)",
                                colorScheme: "light",
                                minWidth: "130px",
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(20,168,181,0.60)";
                                e.currentTarget.style.boxShadow =
                                  "0 0 0 3px rgba(20,168,181,0.12)";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(13,115,119,0.20)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            />
                            {/* Duration hint */}
                            {hour.open_time &&
                              hour.close_time &&
                              (() => {
                                const [oh, om] = hour.open_time
                                  .split(":")
                                  .map(Number);
                                const [ch, cm] = hour.close_time
                                  .split(":")
                                  .map(Number);
                                const diff = ch * 60 + cm - (oh * 60 + om);
                                if (diff <= 0) return null;
                                const hrs = Math.floor(diff / 60);
                                const mins = diff % 60;
                                return (
                                  <span
                                    className="text-[11px] ml-1"
                                    style={{ color: "var(--teal-600)" }}
                                  >
                                    {hrs > 0 && `${hrs}h`}
                                    {mins > 0 && ` ${mins}m`}
                                  </span>
                                );
                              })()}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center">
                            <span
                              className="text-[12px] px-3 py-1.5 rounded-lg font-medium"
                              style={{
                                background: "rgba(13,115,119,0.05)",
                                color: "var(--text-4)",
                                border: "1px solid rgba(13,115,119,0.10)",
                              }}
                            >
                              Closed
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-5 pt-4 flex items-center gap-3"
                    style={{ borderTop: "1px solid rgba(13,115,119,0.08)" }}
                  >
                    <Button
                      onClick={saveHours}
                      loading={hoursSaving}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Save Hours
                    </Button>
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--text-3)" }}
                    >
                      Changes apply to the AI agent's scheduling responses
                    </span>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
