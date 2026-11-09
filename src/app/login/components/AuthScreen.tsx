'use client';
import Link from 'next/link';
import React, { useState } from 'react';

import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthTab = 'login' | 'register';

const levelInfo = [
  {
    id: 'ls-n5',
    level: 'N5',
    labelClass: 'level-badge-n5',
    text: 'ဟီရဂန၊ ခတခန၊ အခြေခံ ဝေါဟာရ ၈၀၀',
  },
  {
    id: 'ls-n4',
    level: 'N4',
    labelClass: 'level-badge-n4',
    text: 'Kanji ၃၀၀၊ နေ့စဉ်သုံး စကားပြော',
  },
  {
    id: 'ls-n3',
    level: 'N3',
    labelClass: 'level-badge-n3',
    text: 'ဖတ်စာ၊ နားထောင်စွမ်းရည်၊ kanji ၆၅၀',
  },
];

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] gradient-hero flex-col justify-between p-10 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <AppLogo size={40} />
          <span className="font-bold text-[18px] text-white tracking-tight">NihongoAcademy</span>
        </div>

        {/* Center content */}
        <div>
          {/* Japanese greeting */}
          <div className="mb-6">
            <p className="text-white/50 text-[13px] font-medium mb-1">ကြိုဆိုပါတယ်</p>
            <h1 className="text-[48px] font-bold text-white leading-none mb-2">ようこそ</h1>
            <p className="text-white/70 text-[16px]">JLPT အောင်မြင်ဖို့ အတူတူ ပြင်ဆင်ကြရအောင်</p>
          </div>

          {/* Levels offered */}
          <div className="space-y-2.5 mb-8">
            {levelInfo.map((ls) => (
              <div key={ls.id} className="flex items-center gap-3">
                <span
                  className={`text-[12px] font-bold w-10 text-center py-0.5 rounded ${ls.labelClass}`}
                >
                  {ls.level}
                </span>
                <span className="text-white/70 text-[13px]">{ls.text}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'trust-burmese', icon: 'LanguageIcon', text: 'မြန်မာလို ရှင်းလင်းချက်' },
              { id: 'trust-mobile', icon: 'DevicePhoneMobileIcon', text: 'ဖုန်းနဲ့ အဆင်ပြေ' },
              { id: 'trust-pay', icon: 'WalletIcon', text: 'KBZPay / WavePay' },
              { id: 'trust-trial', icon: 'ShieldCheckIcon', text: 'အမြဲ အခမဲ့ လေ့လာနိုင်' },
            ].map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5"
              >
                <Icon
                  name={badge.icon as Parameters<typeof Icon>[0]['name']}
                  size={16}
                  className="text-green-300 flex-shrink-0"
                />
                <span className="text-white/80 text-[13px] font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-[12px]">
          © {new Date().getFullYear()} NihongoAcademy · ကိုယ်ရေးအချက်အလက် မူဝါဒ · စည်းကမ်းချက်
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-screen overflow-y-auto py-10 px-6">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <AppLogo size={36} />
          <span className="font-bold text-[16px] text-foreground">NihongoAcademy</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${
                activeTab === 'login'
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              အကောင့်ဝင်ရန်
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${
                activeTab === 'register'
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              အကောင့်ဖွင့်ရန်
            </button>
          </div>

          {/* Form */}
          {activeTab === 'login' ? (
            <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
          )}

          {/* Demo credentials */}
          <DemoCredentials onFill={() => {}} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

interface DemoCredentialsProps {
  onFill: (email: string, password: string) => void;
  activeTab: AuthTab;
}

function DemoCredentials({ activeTab }: DemoCredentialsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const demoAccounts = [
    {
      id: 'demo-student',
      role: 'ကျောင်းသား (N5)',
      email: 'student@nihongoacademy.demo',
      password: 'Demo@2026',
    },
  ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  if (activeTab === 'register') return null;

  return (
    <div className="mt-6 bg-muted/60 border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="InformationCircleIcon" size={15} className="text-muted-foreground" />
        <span className="text-[12px] font-semibold text-muted-foreground">
          စမ်းသပ်ရန် Demo အကောင့်များ
        </span>
      </div>
      <div className="space-y-2">
        {demoAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-card border border-border rounded-lg px-3 py-2.5 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-primary mb-0.5">{account.role}</p>
              <p className="text-[12px] text-foreground truncate font-mono">{account.email}</p>
            </div>
            <button
              onClick={() => handleCopy(account.email, account.id + '-email')}
              className="p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0"
              title="Email ကူးရန်"
            >
              <Icon
                name={copied === account.id + '-email' ? 'CheckIcon' : 'ClipboardDocumentIcon'}
                size={13}
                className={
                  copied === account.id + '-email' ? 'text-success' : 'text-muted-foreground'
                }
              />
            </button>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2.5">
        စမ်းကြည့်ချင်ရင် ဒီ demo အကောင့်နဲ့ ဝင်ပါ — Password: Demo@2026
      </p>
    </div>
  );
}
