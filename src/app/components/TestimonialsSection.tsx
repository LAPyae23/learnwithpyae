import React from 'react';
import Icon from '@/components/ui/AppIcon';

const testimonials = [
  {
    id: 'test-001',
    name: 'Thida Maung',
    role: 'Software Engineer',
    location: 'Yangon, Myanmar',
    level: 'N2',
    levelClass: 'level-badge-n2',
    avatar: 'TM',
    avatarBg: 'bg-orange-100',
    avatarColor: 'text-orange-700',
    quote:
      'I passed N2 on my first attempt after 8 months of daily study with NihongoAcademy. The spaced repetition flashcards made kanji retention so much easier than any textbook I had tried before.',
    passed: 'Passed N2 — July 2025',
    rating: 5,
    mockScore: '76/100',
  },
  {
    id: 'test-002',
    name: 'Kenji Watanabe',
    role: 'University Student',
    location: 'Osaka, Japan',
    level: 'N1',
    levelClass: 'level-badge-n1',
    avatar: 'KW',
    avatarBg: 'bg-red-100',
    avatarColor: 'text-red-700',
    quote:
      'As a heritage speaker who never formally studied grammar, the N1 grammar database was exactly what I needed. I could search patterns I had heard but never understood structurally.',
    passed: 'Passed N1 — December 2025',
    rating: 5,
    mockScore: '82/100',
  },
  {
    id: 'test-003',
    name: 'Priya Anand',
    role: 'Visa Applicant — Japan Work Visa',
    location: 'Chennai, India',
    level: 'N3',
    levelClass: 'level-badge-n3',
    avatar: 'PA',
    avatarBg: 'bg-amber-100',
    avatarColor: 'text-amber-700',
    quote:
      'Needed N3 for my work visa application. The mock tests were incredibly accurate — my actual JLPT score was almost identical to my average mock score over the last month. Passed with 68/100.',
    passed: 'Passed N3 — July 2025',
    rating: 5,
    mockScore: '71/100',
  },
  {
    id: 'test-004',
    name: 'Min Zaw Oo',
    role: 'Japanese Language Teacher',
    location: 'Mandalay, Myanmar',
    level: 'N1',
    levelClass: 'level-badge-n1',
    avatar: 'MZ',
    avatarBg: 'bg-purple-100',
    avatarColor: 'text-purple-700',
    quote:
      'I recommend NihongoAcademy to all my students. The Burmese interface support is excellent, and the video explanations are clearer than most textbooks I have used in 12 years of teaching.',
    passed: 'N1 Holder — Instructor',
    rating: 5,
    mockScore: '91/100',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-4">
            <Icon name="ChatBubbleLeftRightIcon" size={14} className="text-primary" />
            <span className="text-primary text-[13px] font-semibold">Student Success Stories</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Real results from real learners
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-lg mx-auto">
            89% of NihongoAcademy students who complete the full course pass their target JLPT
            level.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {testimonials?.map((t) => (
            <div
              key={t?.id}
              className="bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col card-hover"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t?.rating })?.map((_, si) => (
                  <Icon
                    key={`${t?.id}-star-${si}`}
                    name="StarIcon"
                    size={14}
                    className="text-amber-400"
                    variant="solid"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[13.5px] text-muted-foreground leading-relaxed flex-1 mb-5">
                &ldquo;{t?.quote}&rdquo;
              </p>

              {/* Pass badge */}
              <div className="flex items-center gap-1.5 bg-success-bg border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <Icon name="CheckBadgeIcon" size={14} className="text-success" />
                <span className="text-[12px] font-semibold text-success">{t?.passed}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${t?.avatarBg} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`text-[13px] font-bold ${t?.avatarColor}`}>{t?.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold text-[14px] text-foreground">{t?.name}</p>
                  <p className="text-[12px] text-muted-foreground">{t?.role}</p>
                  <p className="text-[11px] text-muted-foreground">{t?.location}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${t?.levelClass}`}>
                    {t?.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
