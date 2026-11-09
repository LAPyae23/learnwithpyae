import { AI_ENABLED } from '@/lib/features';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: string;
  href: string;
  badge?: number;
  section: 'main' | 'practice' | 'ai' | 'account';
  mobile?: boolean;
  adminOnly?: boolean;
  /** Only show to these roles (checked against the database role). */
  roles?: ('student' | 'teacher' | 'admin')[];
}

const allNavItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'ပင်မစာမျက်နှာ',
    shortLabel: 'ပင်မ',
    icon: 'HomeIcon',
    href: '/dashboard',
    section: 'main',
    mobile: true,
  },
  {
    id: 'nav-plan',
    label: 'လေ့လာရေး အစီအစဉ်',
    icon: 'CalendarDaysIcon',
    href: '/plan',
    section: 'main',
  },
  {
    id: 'nav-lessons',
    label: 'သင်ခန်းစာများ',
    icon: 'PlayCircleIcon',
    href: '/lesson',
    section: 'main',
  },
  {
    id: 'nav-teachers',
    label: 'ဆရာ / ဆရာမများ',
    icon: 'UserGroupIcon',
    href: '/teachers',
    section: 'main',
  },
  {
    id: 'nav-groups',
    label: 'စာလုပ်ဖော် အုပ်စု',
    icon: 'UsersIcon',
    href: '/groups',
    section: 'main',
  },
  {
    id: 'nav-flashcards',
    label: 'Flashcard',
    shortLabel: 'Flashcard',
    icon: 'RectangleStackIcon',
    href: '/flashcards',
    section: 'practice',
    mobile: true,
  },
  {
    id: 'nav-exam',
    label: 'JLPT Mock Test',
    shortLabel: 'Mock Test',
    icon: 'DocumentTextIcon',
    href: '/exam',
    section: 'practice',
    mobile: true,
  },
  {
    id: 'nav-kanji',
    label: 'Kanji လက်ရေး',
    icon: 'PencilSquareIcon',
    href: '/kanji',
    section: 'practice',
    mobile: !AI_ENABLED,
  },
  {
    id: 'nav-speak',
    label: 'အသံထွက် လေ့ကျင့်',
    icon: 'SpeakerWaveIcon',
    href: '/speak',
    section: 'practice',
  },
  {
    id: 'nav-sensei',
    label: 'AI ဆရာ',
    shortLabel: 'AI ဆရာ',
    icon: 'SparklesIcon',
    href: '/sensei',
    section: 'ai',
    mobile: true,
  },
  {
    id: 'nav-interview',
    label: 'အင်တာဗျူး လေ့ကျင့်',
    icon: 'BriefcaseIcon',
    href: '/interview',
    section: 'ai',
  },
  {
    id: 'nav-studio',
    label: 'သင်ခန်းစာ Studio',
    icon: 'PencilIcon',
    href: '/studio',
    section: 'account',
    roles: ['teacher', 'admin'],
  },
  {
    id: 'nav-messages',
    label: 'Admin ထံ စာများ',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/messages',
    section: 'account',
    roles: ['teacher', 'admin'],
  },
  {
    id: 'nav-teach',
    label: 'ဆရာ အဖြစ် ပါဝင်ရန်',
    icon: 'AcademicCapIcon',
    href: '/teach',
    section: 'account',
    roles: ['student'],
  },
  {
    id: 'nav-billing',
    label: 'Premium / ငွေပေးချေ',
    icon: 'CreditCardIcon',
    href: '/billing',
    section: 'account',
  },
  {
    id: 'nav-profile',
    label: 'ကိုယ်ရေးအချက်အလက်',
    shortLabel: 'ကျွန်ုပ်',
    icon: 'UserCircleIcon',
    href: '/profile',
    section: 'account',
    mobile: true,
  },
  {
    id: 'nav-admin',
    label: 'Admin',
    icon: 'Cog8ToothIcon',
    href: '/admin',
    section: 'account',
    adminOnly: true,
  },
];

// AI pages are hidden when no AI key is configured
export const navItems = allNavItems.filter((i) => AI_ENABLED || i.section !== 'ai');

export const sectionLabels: Record<NavItem['section'], string> = {
  main: 'လေ့လာရန်',
  practice: 'လေ့ကျင့်ရန်',
  ai: 'AI',
  account: 'အကောင့်',
};

export const pageTitles: Record<string, string> = Object.fromEntries(
  allNavItems.map((i) => [i.href, i.label])
);
