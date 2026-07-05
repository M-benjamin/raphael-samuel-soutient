"use client";

import Navbar from "@/components/layout/navbar";
import { navLinks } from "@/lib/constant";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HeartPulse, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function PortalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get("error");
  const urlErrorMessage =
    urlError === "link_expired"
      ? "Your verification link has expired or already been used. Please sign in below."
      : null;

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
    const supabase = createClient();
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    console.log("Supabase auth response:::::", { error, authData });

    setLoading(false);
    if (error) {
      setServerError("Invalid email or password. Please try again.");
      return;
    }
    router.push("/portal/appointments");
  };

  return (
    <Suspense>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-[400px]">
          <Navbar navLinks={navLinks} />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: "linear-gradient(135deg, #14a8b5, #0d7377)",
                boxShadow: "0 8px 24px rgba(13,115,119,0.30)",
              }}
            >
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[22px] font-bold" style={{ color: "#0a2e30" }}>
              Patient Portal
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "#64748b" }}>
              Sign in to manage your appointments
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 32px rgba(13,115,119,0.10)",
              border: "1px solid rgba(13,115,119,0.10)",
            }}
          >
            {urlErrorMessage && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-[13px]"
                style={{
                  background: "rgba(217,119,6,0.08)",
                  border: "1px solid rgba(217,119,6,0.25)",
                  color: "#b45309",
                }}
              >
                {urlErrorMessage}
              </div>
            )}

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
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[14px] outline-none transition-all"
                    style={{
                      background: "#f8fafc",
                      border: errors.email
                        ? "1.5px solid #f87171"
                        : "1.5px solid #e2e8f0",
                      color: "#0f172a",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#0d7377";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        errors.email ? "#f87171" : "#e2e8f0";
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                    {errors.email.message}
                  </p>
                )}
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
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-[14px] outline-none transition-all"
                    style={{
                      background: "#f8fafc",
                      border: errors.password
                        ? "1.5px solid #f87171"
                        : "1.5px solid #e2e8f0",
                      color: "#0f172a",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#0d7377";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        errors.password ? "#f87171" : "#e2e8f0";
                    }}
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p
              className="text-center text-[12px] mt-5"
              style={{ color: "#94a3b8" }}
            >
              New patient?{" "}
              <Link
                href="/portal/register"
                className="font-semibold"
                style={{ color: "#0d7377" }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
