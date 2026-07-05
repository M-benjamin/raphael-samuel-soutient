'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { HeartPulse, Eye, EyeOff, ArrowRight, Phone, Calendar, BarChart3, Zap, Shield, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const features = [
  { icon: Phone, label: 'Never miss a patient call', desc: 'AI answers 24/7, even after clinic hours' },
  { icon: Calendar, label: 'Auto-book appointments', desc: 'Patients schedule while they talk' },
  { icon: BarChart3, label: 'Real-time analytics', desc: 'Track calls, leads & conversions' },
];

const stats = [
  { value: '24/7', label: 'Availability' },
  { value: '3 min', label: 'Setup time' },
  { value: '10x', label: 'More leads' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) { setServerError('Invalid email or password.'); return; }
    router.push(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <div className="relative">
        <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Your password" error={errors.password?.message} {...register('password')} />
        <button type="button" onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[30px] transition-colors"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--teal-600)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}>
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {serverError && (
        <div className="px-3 py-2.5 rounded-lg text-[12px] font-medium" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#dc2626' }}>
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg" icon={<ArrowRight className="w-3.5 h-3.5" />}>
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #072b2e 0%, #0a3d40 35%, #0d5257 70%, #0d6b70 100%)' }}>
        {/* ECG decorative line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] ecg-line opacity-30" />
        {/* Decorative glow orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(20,168,181,0.12) 0%,transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(13,115,119,0.15) 0%,transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(20,168,181,0.20)', border: '1px solid rgba(20,168,181,0.35)', boxShadow: '0 0 24px rgba(20,168,181,0.25)' }}>
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[20px] font-bold tracking-tight text-white">
                MediCall <span style={{ color: '#22c4d0' }}>AI</span>
              </span>
              <p className="text-[11px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>AI Voice Receptionist Platform</p>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(20,168,181,0.15)', border: '1px solid rgba(20,168,181,0.30)' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#22c4d0' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#22c4d0' }}>Powered by GPT-4o Realtime</span>
            </div>

            <h2 className="text-[36px] font-bold leading-[1.15] tracking-tight mb-4 text-white">
              Your practice&apos;s<br />
              <span style={{ background: 'linear-gradient(90deg,#22c4d0,#14a8b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI receptionist
              </span><br />
              never sleeps.
            </h2>
            <p className="text-[14px] leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.60)', maxWidth: '340px' }}>
              Handle patient calls, book appointments, and capture leads automatically — while you focus on delivering excellent care.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(20,168,181,0.15)', border: '1px solid rgba(20,168,181,0.28)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#22c4d0' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{label}</p>
                    <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 grid grid-cols-3 gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(20,168,181,0.20)' }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-[22px] font-bold" style={{ color: '#22c4d0' }}>{value}</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #0d7377, #0a3d40)', boxShadow: '0 0 20px rgba(13,115,119,0.30)' }}>
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            MediCall <span style={{ color: 'var(--teal-600)' }}>AI</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Trust badges */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--teal-600)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>SSL Secured</span>
            </div>
            <div className="w-[1px] h-3" style={{ background: 'rgba(13,115,119,0.15)' }} />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--teal-600)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>99.9% Uptime</span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-7 relative" style={{ background: '#ffffff', border: '1px solid rgba(13,115,119,0.14)', boxShadow: '0 8px 40px rgba(10,61,64,0.10)' }}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #0d7377, #14a8b5, #0d7377)' }} />

            <h1 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>Welcome back</h1>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>Sign in to your MediCall dashboard</p>

            <Suspense fallback={
              <div className="h-36 flex items-center justify-center text-[13px]" style={{ color: 'var(--text-3)' }}>Loading...</div>
            }>
              <LoginForm />
            </Suspense>

            <p className="text-center text-[12px] mt-5" style={{ color: 'var(--text-3)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold transition-colors" style={{ color: 'var(--teal-600)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--teal-700)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--teal-600)'; }}>
                Create one free
              </Link>
            </p>
          </div>

          {/* Bottom note */}
          <p className="text-center text-[11px] mt-5" style={{ color: 'var(--text-4)' }}>
            By signing in you agree to our{' '}
            <span style={{ color: 'var(--text-3)' }}>Terms of Service</span>
            {' '}&amp;{' '}
            <span style={{ color: 'var(--text-3)' }}>Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
