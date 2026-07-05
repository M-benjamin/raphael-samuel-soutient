"use client";

import Navbar from "@/components/layout/navbar";
import { navLinks } from "@/lib/constant";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    full_name: z.string().min(2, "Full name required"),
    email: z.string().email("Valid email required"),
    phone: z
      .string()
      .min(7, "Valid phone required")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function PortalRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError("");

    // Verify the email has been used for a booking
    const checkRes = await fetch("/api/portal/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    const checkJson = await checkRes.json();

    if (!checkJson.exists) {
      setServerError(
        "No appointment found with this email address. Please use the same email you provided when booking.",
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/portal/appointments`,
        data: {
          full_name: data.full_name,
          phone: data.phone || null,
          role: "patient",
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        setServerError(
          "An account with this email already exists. Please sign in instead.",
        );
      } else {
        setServerError(error.message);
      }
      return;
    }

    // Create patient profile
    const supabase2 = createClient();
    const {
      data: { user },
    } = await supabase2.auth.getUser();
    if (user) {
      await supabase2.from("patient_profiles").upsert({
        id: user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || null,
      });
    }

    router.push("/portal/appointments");
  };

  const inputClass =
    "w-full py-2.5 rounded-xl text-[14px] outline-none transition-all";
  const inputStyle = (hasError: boolean) => ({
    background: "#f8fafc",
    border: `1.5px solid ${hasError ? "#f87171" : "#e2e8f0"}`,
    color: "#0f172a",
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <Navbar navLinks={navLinks} />
        <div className="flex flex-col items-center mb-8">
          {/* <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: "linear-gradient(135deg, #14a8b5, #0d7377)",
              boxShadow: "0 8px 24px rgba(13,115,119,0.30)",
            }}
          >
            <HeartPulse className="w-6 h-6 text-white" />
          </div> */}
          <h1 className="text-[22px] font-bold" style={{ color: "#0a2e30" }}>
            Create Patient Account
          </h1>
          <p
            className="text-[13px] mt-1 text-center"
            style={{ color: "#64748b" }}
          >
            Use the same email you provided when booking
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 32px rgba(13,115,119,0.10)",
            border: "1px solid rgba(13,115,119,0.10)",
          }}
        >
          {/* Info banner */}
          <div
            className="flex items-start gap-2.5 mb-5 p-3 rounded-xl"
            style={{
              background: "rgba(13,115,119,0.07)",
              border: "1px solid rgba(13,115,119,0.15)",
            }}
          >
            <Info
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#0d7377" }}
            />
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "#0d7377" }}
            >
              Your email must match one you used when booking an appointment via
              our AI receptionist.
            </p>
          </div>

          {serverError && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-[13px]"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.20)",
                color: "#dc2626",
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label
                className="block text-[12px] font-semibold mb-1.5"
                style={{ color: "#374151" }}
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  {...register("full_name")}
                  placeholder="Your full name"
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle(!!errors.full_name)}
                />
              </div>
              {errors.full_name && (
                <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-[12px] font-semibold mb-1.5"
                style={{ color: "#374151" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Booking email address"
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                className="block text-[12px] font-semibold mb-1.5"
                style={{ color: "#374151" }}
              >
                Phone <span style={{ color: "#94a3b8" }}>(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle(!!errors.phone)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-[12px] font-semibold mb-1.5"
                style={{ color: "#374151" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  className={`${inputClass} pl-10 pr-10`}
                  style={inputStyle(!!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                className="block text-[12px] font-semibold mb-1.5"
                style={{ color: "#374151" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  {...register("confirm_password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle(!!errors.confirm_password)}
                />
              </div>
              {errors.confirm_password && (
                <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 mt-2 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #14a8b5, #0d7377)",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p
            className="text-center text-[12px] mt-5"
            style={{ color: "#94a3b8" }}
          >
            Already have an account?{" "}
            <Link
              href="/portal/login"
              className="font-semibold"
              style={{ color: "#0d7377" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
