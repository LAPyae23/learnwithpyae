import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo size={36} />
              <span className="font-bold text-[17px] text-white tracking-tight">
                NihongoAcademy
              </span>
            </div>
            <p className="text-white/60 text-[14px] leading-relaxed mb-5 max-w-xs">
              ဂျပန်မှာ အလုပ်လုပ်ဖို့၊ ပညာသင်ဖို့ ပြင်ဆင်နေသူတွေအတွက် မြန်မာလို ရှင်းပြတဲ့ JLPT N5–N3
              သင်တန်း။
            </p>
            <div className="flex items-center gap-2">
              {[
                { id: 'social-facebook', icon: 'GlobeAltIcon', label: 'Facebook' },
                { id: 'social-telegram', icon: 'PaperAirplaneIcon', label: 'Telegram' },
                { id: 'social-youtube', icon: 'PlayCircleIcon', label: 'YouTube' },
              ].map((s) => (
                <button
                  key={s.id}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={s.label}
                >
                  <Icon
                    name={s.icon as Parameters<typeof Icon>[0]['name']}
                    size={16}
                    className="text-white/70"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-bold text-[13px] text-white/40 mb-4">သင်တန်းများ</h4>
            <ul className="space-y-2.5">
              {['JLPT N5 — အခြေခံ', 'JLPT N4 — အလယ်အလတ်အောက်', 'JLPT N3 — အလယ်အလတ်'].map((c, i) => (
                <li key={`footer-course-${i}`}>
                  <Link
                    href="/login"
                    className="text-white/60 hover:text-white text-[14px] transition-colors"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-[13px] text-white/40 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {['အဆင့်စစ်ဆေးမှု', 'ဈေးနှုန်း', 'ဆရာများအတွက်', 'ကျောင်းများအတွက်'].map(
                (item, i) => (
                  <li key={`footer-platform-${i}`}>
                    <Link
                      href="/"
                      className="text-white/60 hover:text-white text-[14px] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-[13px] text-white/40 mb-4">ဥပဒေဆိုင်ရာ</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ', href: '/privacy' },
                { label: 'ဝန်ဆောင်မှု စည်းကမ်းချက်', href: '/terms' },
                { label: 'အကောင့်ဖျက်ရန်', href: '/privacy#delete' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/60 hover:text-white text-[14px] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-[13px]">
            © {currentYear} NihongoAcademy. JLPT® သည် Japan Educational Exchanges and Services ၏
            မှတ်ပုံတင် ကုန်အမှတ်တံဆိပ် ဖြစ်ပါသည်။
          </p>
        </div>
      </div>
    </footer>
  );
}
