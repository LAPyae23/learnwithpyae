import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const actions = [
  {
    id: 'qa-resume',
    label: 'သင်ခန်းစာ ဆက်သင်မယ်',
    sublabel: 'を နဲ့ に ဝိဘတ် · 14 မိနစ်',
    href: '/lesson',
    icon: 'PlayCircleIcon',
    bg: 'bg-secondary',
    iconColor: 'text-primary',
    textColor: 'text-primary',
    border: 'border-primary/20',
    primary: true,
  },
  {
    id: 'qa-flashcards',
    label: 'Flashcard ပြန်လှန်မယ်',
    sublabel: 'ဒီနေ့ ၂၄ ခု',
    href: '/flashcards',
    icon: 'RectangleStackIcon',
    bg: 'bg-danger-bg',
    iconColor: 'text-danger',
    textColor: 'text-danger',
    border: 'border-red-200',
    primary: false,
  },
  {
    id: 'qa-mock',
    label: 'Mock Test ဖြေမယ်',
    sublabel: 'N5 Mock Test #2',
    href: '/exam',
    icon: 'DocumentTextIcon',
    bg: 'bg-orange-50',
    iconColor: 'text-level-n2',
    textColor: 'text-level-n2',
    border: 'border-orange-200',
    primary: false,
  },
  {
    id: 'qa-grammar',
    label: 'သဒ္ဒါ ရှာမယ်',
    sublabel: 'N5 သဒ္ဒါပုံစံ ~80',
    href: '/lesson',
    icon: 'LanguageIcon',
    bg: 'bg-amber-50',
    iconColor: 'text-level-n3',
    textColor: 'text-level-n3',
    border: 'border-amber-200',
    primary: false,
  },
  {
    id: 'qa-vocab',
    label: 'ဝေါဟာရ စာရင်း',
    sublabel: 'N5 စကားလုံး ၈၀၀',
    href: '/flashcards',
    icon: 'BookOpenIcon',
    bg: 'bg-blue-50',
    iconColor: 'text-level-n5',
    textColor: 'text-level-n5',
    border: 'border-blue-200',
    primary: false,
  },
];

const examReadiness = [
  { id: 'ready-grammar', domain: 'သဒ္ဒါ', score: 72, color: 'bg-primary' },
  { id: 'ready-vocab', domain: 'ဝေါဟာရ', score: 83, color: 'bg-level-n4' },
  { id: 'ready-kanji', domain: 'Kanji', score: 61, color: 'bg-warning' },
  { id: 'ready-reading', domain: 'စာဖတ်', score: 68, color: 'bg-level-n5' },
  { id: 'ready-listening', domain: 'နားထောင်', score: 55, color: 'bg-danger' },
];

export default function QuickActions() {
  return (
    <div className="space-y-5">
      {/* Quick actions */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <h3 className="font-bold text-[15px] text-foreground mb-4">အမြန် လုပ်ဆောင်ရန်</h3>
        <div className="space-y-2">
          {actions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className={`flex items-center gap-3 p-3 rounded-xl border ${action.bg} ${action.border} hover:opacity-90 transition-all duration-150 active:scale-95`}
            >
              <div
                className={`w-9 h-9 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon
                  name={action.icon as Parameters<typeof Icon>[0]['name']}
                  size={17}
                  className={action.iconColor}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] font-semibold ${action.textColor}`}>{action.label}</p>
                <p className="text-[11px] text-muted-foreground">{action.sublabel}</p>
              </div>
              <Icon name="ChevronRightIcon" size={15} className={action.iconColor} />
            </Link>
          ))}
        </div>
      </div>

      {/* JLPT Readiness */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[15px] text-foreground">N5 အသင့်ဖြစ်မှု</h3>
          <span className="text-[12px] text-muted-foreground">စုစုပေါင်း 68%</span>
        </div>
        <div className="space-y-3">
          {examReadiness.map((domain) => (
            <div key={domain.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-medium text-foreground">{domain.domain}</span>
                <span
                  className={`text-[12px] font-bold tabular-nums ${domain.score >= 70 ? 'text-success' : domain.score >= 60 ? 'text-warning' : 'text-danger'}`}
                >
                  {domain.score}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${domain.color} rounded-full progress-bar-fill`}
                  style={{ width: `${domain.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[12px] text-muted-foreground">
            <span className="text-danger font-semibold">နားထောင်စွမ်းရည် အားနည်းနေပါတယ်</span> — 55%
            က အောင်မှတ်အောက် ရောက်နေလို့ ဒီအပတ် ဒီအပိုင်းကို အာရုံစိုက်ပါ။
          </p>
        </div>
      </div>

      {/* Kanji of the day */}
      <div className="bg-gradient-to-br from-primary/5 to-green-50 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="SparklesIcon" size={15} className="text-primary" />
          <span className="text-[12px] font-semibold text-primary">ဒီနေ့ Kanji</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl border border-primary/20 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-[36px] font-bold text-foreground font-jp">学</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground font-jp">がく / まな(ぶ)</p>
            <p className="text-[13px] text-muted-foreground">သင်ယူခြင်း၊ ပညာ</p>
            <p className="text-[12px] text-muted-foreground mt-1">学生 (がくせい) — ကျောင်းသား</p>
            <span className="inline-block mt-1 text-[10px] font-bold level-badge-n5 px-2 py-0.5 rounded">
              N5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
