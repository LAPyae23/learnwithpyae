'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { api } from '@/lib/api';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: true },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await api('/api/auth/login', { method: 'POST', json: data });
    } catch (err) {
      setError('email', { message: (err as Error).message });
      setIsLoading(false);
      return;
    }

    toast.success('ပြန်လည် ကြိုဆိုပါတယ်!');
    // Only follow same-site relative paths from ?next= to avoid open redirects
    const next = new URLSearchParams(window.location.search).get('next');
    const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
    window.location.href = target;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-foreground mb-1">ပြန်လည် ကြိုဆိုပါတယ်</h2>
        <p className="text-[14px] text-muted-foreground">
          JLPT ပြင်ဆင်မှုကို ဆက်လုပ်ပါ။{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary font-semibold hover:underline"
          >
            အကောင့်အသစ် ဖွင့်မလား?
          </button>
        </p>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="login-email"
          className="block text-[13.5px] font-semibold text-foreground mb-1.5"
        >
          Email လိပ်စာ
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          className={`w-full h-11 px-3.5 rounded-xl border text-[14px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
            errors.email
              ? 'border-danger focus:ring-danger/30'
              : 'border-input hover:border-ring/50'
          }`}
          {...register('email', {
            required: 'Email ထည့်ပါ',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email ပုံစံ မှန်အောင် ထည့်ပါ',
            },
          })}
        />
        {errors.email && (
          <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={13} className="text-danger flex-shrink-0" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="login-password"
            className="block text-[13.5px] font-semibold text-foreground"
          >
            Password
          </label>
          <Link href="/" className="text-[12.5px] text-primary font-semibold hover:underline">
            Password မေ့နေလား?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="သင့် password"
            className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-[14px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              errors.password
                ? 'border-danger focus:ring-danger/30'
                : 'border-input hover:border-ring/50'
            }`}
            {...register('password', {
              required: 'Password ထည့်ပါ',
              minLength: { value: 6, message: 'Password အနည်းဆုံး ၆ လုံး ရှိရပါမယ်' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Password ဖျောက်ရန်' : 'Password ပြရန်'}
          >
            <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={13} className="text-danger flex-shrink-0" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2.5 mb-6">
        <input
          id="login-remember"
          type="checkbox"
          className="w-4 h-4 rounded border-input accent-primary cursor-pointer"
          {...register('rememberMe')}
        />
        <label
          htmlFor="login-remember"
          className="text-[13.5px] text-muted-foreground cursor-pointer select-none"
        >
          ရက် ၃၀ မှတ်ထားပါ
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-primary text-white font-bold text-[14.5px] rounded-xl hover:bg-accent transition-all duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ minWidth: 0 }}
      >
        {isLoading ? (
          <>
            <Icon name="ArrowPathIcon" size={17} className="animate-spin" />
            ဝင်နေပါတယ်...
          </>
        ) : (
          'အကောင့်ဝင်မယ်'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] text-muted-foreground">သို့မဟုတ်</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Social auth */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'google', label: 'Google', icon: 'GlobeAltIcon' },
          { id: 'facebook', label: 'Facebook', icon: 'UserGroupIcon' },
        ].map((social) => (
          <button
            key={`social-${social.id}`}
            type="button"
            className="h-10 border border-border rounded-xl text-[13px] font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Icon
              name={social.icon as Parameters<typeof Icon>[0]['name']}
              size={16}
              className="text-muted-foreground"
            />
            {social.label}
          </button>
        ))}
      </div>
    </form>
  );
}
