import { AI_ENABLED } from '@/lib/features';

/**
 * Navigation is split into "modes", like switching between a personal profile and a page:
 * each role gets its own home, menu and phone tab bar. Teachers and admins can switch to
 * the student mode to learn.
 */
export type Mode = 'student' | 'teacher' | 'agency' | 'admin';
export type Role = 'student' | 'teacher' | 'admin' | 'agency';

export interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: string;
  /** Only for these roles (e.g. "become a teacher" only for students) */
  roles?: Role[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface ModeConfig {
  id: Mode;
  label: string;
  emoji: string;
  home: string;
  /** Phone tab bar (4 tabs + "more") */
  tabs: NavItem[];
  /** Sidebar / "more" sheet */
  sections: NavSection[];
}

const ai = (items: NavItem[]) => (AI_ENABLED ? items : []);

export const MODES: Record<Mode, ModeConfig> = {
  student: {
    id: 'student',
    label: 'ကျောင်းသား',
    emoji: '🎓',
    home: '/dashboard',
    tabs: [
      { href: '/dashboard', label: 'ပင်မ', icon: 'HomeIcon' },
      { href: '/lesson', label: 'သင်ခန်းစာ', icon: 'PlayCircleIcon' },
      { href: '/flashcards', label: 'Flashcard', icon: 'RectangleStackIcon' },
      { href: '/groups', label: 'အုပ်စု', icon: 'UsersIcon' },
    ],
    sections: [
      {
        label: 'လေ့လာရန်',
        items: [
          { href: '/dashboard', label: 'ပင်မစာမျက်နှာ', icon: 'HomeIcon' },
          { href: '/lesson', label: 'သင်ခန်းစာများ', icon: 'PlayCircleIcon' },
          { href: '/flashcards', label: 'Flashcard', icon: 'RectangleStackIcon' },
          { href: '/exam', label: 'JLPT Mock Test', icon: 'DocumentTextIcon' },
          { href: '/plan', label: 'လေ့လာရေး အစီအစဉ်', icon: 'CalendarDaysIcon' },
        ],
      },
      {
        label: 'လေ့ကျင့်ရန်',
        items: [
          { href: '/kanji', label: 'Kanji လက်ရေး', icon: 'PencilSquareIcon' },
          { href: '/speak', label: 'အသံထွက် လေ့ကျင့်', icon: 'SpeakerWaveIcon' },
          ...ai([
            { href: '/sensei', label: 'AI ဆရာ', icon: 'SparklesIcon' },
            { href: '/interview', label: 'အင်တာဗျူး လေ့ကျင့်', icon: 'BriefcaseIcon' },
          ]),
        ],
      },
      {
        label: 'အတူတူ',
        items: [
          { href: '/groups', label: 'စာလုပ်ဖော် အုပ်စု', icon: 'UsersIcon' },
          { href: '/teachers', label: 'ဆရာ / ဆရာမများ', icon: 'UserGroupIcon' },
          { href: '/classes', label: '1-on-1 class', icon: 'VideoCameraIcon' },
        ],
      },
      {
        label: 'အနာဂတ်',
        items: [
          { href: '/jobs', label: '🇯🇵 အလုပ်အကိုင်', icon: 'BuildingOffice2Icon' },
          { href: '/rewards', label: 'Premium အခမဲ့ ရယူရန်', icon: 'GiftIcon' },
          { href: '/billing', label: 'Premium / ပံ့ပိုးရန်', icon: 'CreditCardIcon' },
          {
            href: '/teach',
            label: 'ဆရာ အဖြစ် ပါဝင်ရန်',
            icon: 'AcademicCapIcon',
            roles: ['student'],
          },
          { href: '/profile', label: 'ကိုယ်ရေးအချက်အလက်', icon: 'UserCircleIcon' },
        ],
      },
    ],
  },
  teacher: {
    id: 'teacher',
    label: 'ဆရာ',
    emoji: '👩‍🏫',
    home: '/teacher',
    tabs: [
      { href: '/teacher', label: 'ပင်မ', icon: 'HomeIcon' },
      { href: '/studio', label: 'သင်ခန်းစာ', icon: 'PencilIcon' },
      { href: '/teacher/classes', label: '1-on-1', icon: 'VideoCameraIcon' },
      { href: '/messages', label: 'စာများ', icon: 'ChatBubbleLeftRightIcon' },
    ],
    sections: [
      {
        label: 'ဆရာ',
        items: [
          { href: '/teacher', label: 'ဆရာ ပင်မ', icon: 'HomeIcon' },
          { href: '/studio', label: 'သင်ခန်းစာ Studio', icon: 'PencilIcon' },
          { href: '/teacher/classes', label: '1-on-1 class စီမံရန်', icon: 'VideoCameraIcon' },
          { href: '/messages', label: 'Admin ထံ စာများ', icon: 'ChatBubbleLeftRightIcon' },
          { href: '/teachers', label: 'ဆရာများ', icon: 'UserGroupIcon' },
          { href: '/profile', label: 'ကိုယ်ရေးအချက်အလက်', icon: 'UserCircleIcon' },
        ],
      },
    ],
  },
  agency: {
    id: 'agency',
    label: 'Agency',
    emoji: '🏢',
    home: '/agency',
    tabs: [
      { href: '/agency', label: 'ဝန်ထမ်း ရှာ', icon: 'MagnifyingGlassIcon' },
      { href: '/profile', label: 'ကျွန်ုပ်', icon: 'UserCircleIcon' },
    ],
    sections: [
      {
        label: 'Agency',
        items: [
          { href: '/agency', label: 'ဝန်ထမ်း ရှာရန်', icon: 'MagnifyingGlassIcon' },
          { href: '/profile', label: 'အကောင့်', icon: 'UserCircleIcon' },
        ],
      },
    ],
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    emoji: '🛡',
    home: '/admin',
    tabs: [
      { href: '/admin?tab=overview', label: 'အကျဉ်း', icon: 'ChartBarIcon' },
      { href: '/admin?tab=payments', label: 'ငွေ', icon: 'BanknotesIcon' },
      { href: '/admin?tab=teachers', label: 'ဆရာ', icon: 'AcademicCapIcon' },
      { href: '/admin?tab=users', label: 'Users', icon: 'UsersIcon' },
    ],
    sections: [
      {
        label: 'စီမံရန်',
        items: [
          { href: '/admin?tab=overview', label: 'အကျဉ်းချုပ်', icon: 'ChartBarIcon' },
          { href: '/admin?tab=payments', label: 'ငွေပေးချေမှု', icon: 'BanknotesIcon' },
          { href: '/admin?tab=teachers', label: 'ဆရာများ', icon: 'AcademicCapIcon' },
          { href: '/admin?tab=content', label: 'သင်ခန်းစာ စစ်ရန်', icon: 'BookOpenIcon' },
          { href: '/admin?tab=bookings', label: '1-on-1 booking', icon: 'VideoCameraIcon' },
          { href: '/admin?tab=agencies', label: 'Agency', icon: 'BuildingOffice2Icon' },
          { href: '/messages', label: 'ဆရာတွေဆီက စာ', icon: 'ChatBubbleLeftRightIcon' },
        ],
      },
      {
        label: 'ငွေနဲ့ Users',
        items: [
          { href: '/admin?tab=users', label: 'Users', icon: 'UsersIcon' },
          { href: '/admin?tab=revenue', label: 'ဝင်ငွေ', icon: 'CurrencyDollarIcon' },
          { href: '/admin?tab=earnings', label: 'ဆရာ ဝင်ငွေ', icon: 'WalletIcon' },
          { href: '/admin?tab=scholarships', label: 'ပညာသင်ဆု', icon: 'GiftIcon' },
          { href: '/admin?tab=settings', label: 'Settings', icon: 'Cog6ToothIcon' },
          { href: '/studio', label: 'သင်ခန်းစာ Studio', icon: 'PencilIcon' },
        ],
      },
    ],
  },
};

/** Modes a role can use, default first. */
export function modesFor(role: string | undefined): Mode[] {
  if (role === 'admin') return ['admin', 'teacher', 'student'];
  if (role === 'teacher') return ['teacher', 'student'];
  if (role === 'agency') return ['agency'];
  return ['student'];
}

/** The mode a page belongs to, or null for pages shared by every mode (profile, billing…). */
export function modeOfPath(path: string): Mode | null {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/agency')) return 'agency';
  if (
    path === '/teacher' ||
    path.startsWith('/teacher/') ||
    path.startsWith('/studio') ||
    path.startsWith('/messages')
  )
    return 'teacher';
  if (path === '/profile' || path === '/billing' || path.startsWith('/teachers')) return null;
  return 'student';
}

/** Page titles by exact href (admin tabs include ?tab=) and by path (first item wins). */
export const pageTitles: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const item of Object.values(MODES).flatMap((m) => m.sections.flatMap((s) => s.items))) {
    out[item.href] ??= item.label;
    out[item.href.split('?')[0]] ??= item.label;
  }
  return out;
})();
