'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { jlptSessionLabel, upcomingJlptSessions } from '@/lib/jlpt';
import { api } from '@/lib/api';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  targetLevel: string;
  examDate: string;
  agreeTerms: boolean;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const jlptLevels = [
  { id: 'level-unsure', value: '', label: 'မသေချာသေးဘူး — အဆင့်စစ်ဆေးမှု ဖြေမယ်' },
  { id: 'level-n5', value: 'N5', label: 'N5 — လုံးဝ မသိသေးသူ' },
  { id: 'level-n4', value: 'N4', label: 'N4 — ဟီရဂန/ခတခန တတ်ပြီးသူ' },
  { id: 'level-n3', value: 'N3', label: 'N3 — အလယ်အလတ်' },
];

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await api('/api/auth/register', {
        method: 'POST',
        json: {
          name: data.fullName,
          email: data.email,
          password: data.password,
          targetLevel: data.targetLevel,
          examDate: data.examDate,
          // Invite links: /login?ref=CODE (remembered in case the page is reloaded)
          ref:
            new URLSearchParams(window.location.search).get('ref') ??
            localStorage.getItem('na_ref') ??
            undefined,
        },
      });
    } catch (err) {
      setError((err as { status?: number }).status === 409 ? 'email' : 'fullName', {
        message: (err as Error).message,
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setRegistered(true);
    toast.success('အကောင့် ဖွင့်ပြီးပါပြီ! NihongoAcademy မှ ကြိုဆိုပါတယ် 🎉');
  };

  if (registered) {
    return (
      <div className="text-center py-8 animate-slide-up">
        <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircleIcon" size={32} className="text-success" variant="solid" />
        </div>
        <h2 className="text-[20px] font-bold text-foreground mb-2">အကောင့် ဖွင့်ပြီးပါပြီ!</h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          သင့်တော်တဲ့ JLPT အဆင့်ကို သိရဖို့ အခမဲ့ အဆင့်စစ်ဆေးမှုကို အရင် ဖြေကြည့်ပါ။
        </p>
        <a
          href="/dashboard"
          className="block w-full py-3 bg-primary text-white font-bold text-[14.5px] rounded-xl hover:bg-accent transition-colors active:scale-95 text-center mb-3"
        >
          အဆင့်စစ်ဆေးမယ် — အခမဲ့
        </a>
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ကျော်မယ် — ပင်မစာမျက်နှာ သွားမယ်
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-foreground mb-1">အကောင့်ဖွင့်ပါ</h2>
        <p className="text-[14px] text-muted-foreground">
          အခမဲ့ပါ — Credit card မလိုပါ။{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-semibold hover:underline"
          >
            အကောင့် ရှိပြီးသားလား?
          </button>
        </p>
      </div>

      {/* Full name */}
      <div className="mb-4">
        <label
          htmlFor="reg-name"
          className="block text-[13.5px] font-semibold text-foreground mb-1.5"
        >
          အမည်
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder="မောင်မောင်"
          className={`w-full h-11 px-3.5 rounded-xl border text-[14px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
            errors.fullName
              ? 'border-danger focus:ring-danger/30'
              : 'border-input hover:border-ring/50'
          }`}
          {...register('fullName', {
            required: 'အမည် ထည့်ပါ',
            minLength: { value: 2, message: 'အမည် အနည်းဆုံး ၂ လုံး ရှိရပါမယ်' },
          })}
        />
        {errors.fullName && (
          <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={13} className="text-danger flex-shrink-0" />
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="reg-email"
          className="block text-[13.5px] font-semibold text-foreground mb-1.5"
        >
          Email လိပ်စာ
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
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
        <label
          htmlFor="reg-password"
          className="block text-[13.5px] font-semibold text-foreground mb-1.5"
        >
          Password
          <span className="ml-1 text-[11px] text-muted-foreground font-normal">
            (အနည်းဆုံး ၈ လုံး)
          </span>
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="ခိုင်မာတဲ့ password တစ်ခု ဖန်တီးပါ"
            className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-[14px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              errors.password
                ? 'border-danger focus:ring-danger/30'
                : 'border-input hover:border-ring/50'
            }`}
            {...register('password', {
              required: 'Password ထည့်ပါ',
              minLength: { value: 8, message: 'Password အနည်းဆုံး ၈ လုံး ရှိရပါမယ်' },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[0-9])/,
                message: 'စာလုံးကြီး (A-Z) တစ်လုံးနဲ့ ဂဏန်း တစ်လုံး အနည်းဆုံး ပါရပါမယ်',
              },
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

      {/* Confirm password */}
      <div className="mb-4">
        <label
          htmlFor="reg-confirm"
          className="block text-[13.5px] font-semibold text-foreground mb-1.5"
        >
          Password ထပ်ရိုက်ပါ
        </label>
        <div className="relative">
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Password ကို ထပ်ရိုက်ပါ"
            className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-[14px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              errors.confirmPassword
                ? 'border-danger focus:ring-danger/30'
                : 'border-input hover:border-ring/50'
            }`}
            {...register('confirmPassword', {
              required: 'Password ကို ထပ်ရိုက်ပါ',
              validate: (v) => v === passwordValue || 'Password နှစ်ခု မတူပါ',
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirm ? 'Password ဖျောက်ရန်' : 'Password ပြရန်'}
          >
            <Icon name={showConfirm ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={13} className="text-danger flex-shrink-0" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Target JLPT level */}
      <div className="mb-4">
        <label
          htmlFor="reg-level"
          className="block text-[13.5px] font-semibold text-foreground mb-1"
        >
          ဖြေမယ့် JLPT အဆင့်
        </label>
        <p className="text-[12px] text-muted-foreground mb-1.5">
          မသေချာရင် အဆင့်စစ်ဆေးမှုပြီးမှ အကြံပြုပေးပါမယ်။
        </p>
        <select
          id="reg-level"
          className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none"
          {...register('targetLevel')}
        >
          {jlptLevels.map((level) => (
            <option key={level.id} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Exam date */}
      <div className="mb-5">
        <label
          htmlFor="reg-exam-date"
          className="block text-[13.5px] font-semibold text-foreground mb-1"
        >
          ဖြေမယ့် စာမေးပွဲ
          <span className="ml-1 text-[11px] text-muted-foreground font-normal">
            (မဖြစ်မနေ မဟုတ်)
          </span>
        </label>
        <p className="text-[12px] text-muted-foreground mb-1.5">
          စာမေးပွဲရက်အမီ သင့်အတွက် လေ့လာရေး အစီအစဉ် ဆွဲပေးပါမယ်။
        </p>
        <select
          id="reg-exam-date"
          className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none"
          {...register('examDate')}
        >
          <option value="">မဆုံးဖြတ်ရသေးပါ</option>
          {upcomingJlptSessions(3).map((d) => {
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return (
              <option key={value} value={value}>
                {jlptSessionLabel(d)} (JLPT)
              </option>
            );
          })}
        </select>
      </div>

      {/* Terms */}
      <div className="mb-5">
        <div className="flex items-start gap-2.5">
          <input
            id="reg-terms"
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-input accent-primary cursor-pointer flex-shrink-0"
            {...register('agreeTerms', {
              required: 'အကောင့်ဖွင့်ဖို့ စည်းကမ်းချက်တွေကို သဘောတူရပါမယ်',
            })}
          />
          <label
            htmlFor="reg-terms"
            className="text-[13px] text-muted-foreground cursor-pointer leading-snug"
          >
            <Link
              href="/terms"
              target="_blank"
              className="text-primary font-semibold hover:underline"
            >
              ဝန်ဆောင်မှု စည်းကမ်းချက်
            </Link>{' '}
            နဲ့{' '}
            <Link
              href="/privacy"
              target="_blank"
              className="text-primary font-semibold hover:underline"
            >
              ကိုယ်ရေးအချက်အလက် မူဝါဒ
            </Link>{' '}
            ကို သဘောတူပါတယ်။
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1 ml-6">
            <Icon name="ExclamationCircleIcon" size={13} className="text-danger flex-shrink-0" />
            {errors.agreeTerms.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-primary text-white font-bold text-[14.5px] rounded-xl hover:bg-accent transition-all duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Icon name="ArrowPathIcon" size={17} className="animate-spin" />
            အကောင့်ဖွင့်နေပါတယ်...
          </>
        ) : (
          'အကောင့်ဖွင့်မယ် — အခမဲ့'
        )}
      </button>
    </form>
  );
}
