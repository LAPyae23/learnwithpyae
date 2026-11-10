import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { dueCount } from '@/lib/telegram';
import { AgencyContact } from '@/models/Jobs';
import { Booking } from '@/models/Tutoring';
import { Ticket } from '@/models/Ticket';
import { Lesson } from '@/models/Lesson';
import { Payment } from '@/models/Payment';
import { TeacherApplication } from '@/models/TeacherApplication';
import { Agency } from '@/models/Jobs';
import { Scholarship } from '@/models/Reward';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Notice {
  id: string;
  icon: string;
  text: string;
  href: string;
}

/** Things that need the user's attention in the given ?mode= (computed live, nothing stored). */
export async function GET(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const mode = new URL(req.url).searchParams.get('mode') ?? 'student';
  const out: Notice[] = [];
  const add = (cond: number | boolean, n: Notice) => {
    if (cond) out.push(n);
  };

  if (mode === 'admin' && actor.role === 'admin') {
    const [pay, apps, lessons, books, agencies, schol, tickets] = await Promise.all([
      Payment.countDocuments({ status: 'pending' }),
      TeacherApplication.countDocuments({ status: 'pending' }),
      Lesson.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'pending' }),
      Agency.countDocuments({ status: 'pending' }),
      Scholarship.countDocuments({ status: 'pending' }),
      Ticket.countDocuments({ unreadByAdmin: true, status: { $ne: 'closed' } }),
    ]);
    add(pay, {
      id: 'pay',
      icon: '💳',
      text: `စစ်ရန် ငွေပေးချေမှု ${pay} ခု`,
      href: '/admin?tab=payments',
    });
    add(apps, {
      id: 'apps',
      icon: '👩‍🏫',
      text: `ဆရာ လျှောက်လွှာ ${apps} ခု`,
      href: '/admin?tab=teachers',
    });
    add(lessons, {
      id: 'lessons',
      icon: '📚',
      text: `စစ်ရန် သင်ခန်းစာ ${lessons} ခု`,
      href: '/studio?scope=pending',
    });
    add(books, {
      id: 'books',
      icon: '📅',
      text: `1-on-1 ငွေစစ်ရန် ${books} ခု`,
      href: '/admin?tab=bookings',
    });
    add(agencies, {
      id: 'agencies',
      icon: '🏢',
      text: `Agency လျှောက်လွှာ ${agencies} ခု`,
      href: '/admin?tab=agencies',
    });
    add(tickets, {
      id: 'tickets',
      icon: '📥',
      text: `ဆရာတွေဆီက စာအသစ် ${tickets} စောင်`,
      href: '/messages',
    });
    add(schol, {
      id: 'schol',
      icon: '🎓',
      text: `ပညာသင်ဆု စောင့်နေသူ ${schol} ယောက်`,
      href: '/admin?tab=scholarships',
    });
  } else if (mode === 'teacher' && (actor.role === 'teacher' || actor.role === 'admin')) {
    const [replies, needLink, rejected, upcoming] = await Promise.all([
      Ticket.countDocuments({ user: actor.id, unreadByUser: true }),
      Booking.countDocuments({ teacher: actor.id, status: 'confirmed', meetingLink: '' }),
      Lesson.countDocuments({ author: actor.id, status: 'rejected' }),
      Booking.countDocuments({
        teacher: actor.id,
        status: 'confirmed',
        startAt: { $gt: new Date(), $lt: new Date(Date.now() + 86400000) },
      }),
    ]);
    add(needLink, {
      id: 'link',
      icon: '🔗',
      text: `Meeting link ထည့်ရန် class ${needLink} ခု`,
      href: '/teacher/classes',
    });
    add(upcoming, {
      id: 'soon',
      icon: '⏰',
      text: `၂၄ နာရီအတွင်း class ${upcoming} ခု`,
      href: '/teacher/classes',
    });
    add(replies, {
      id: 'replies',
      icon: '📩',
      text: `Admin က ပြန်ဖြေထားတဲ့ စာ ${replies} စောင်`,
      href: '/messages',
    });
    add(rejected, {
      id: 'rejected',
      icon: '✏️',
      text: `ပြန်ပြင်ရန် သင်ခန်းစာ ${rejected} ခု`,
      href: '/studio',
    });
  } else if (mode === 'agency' && actor.role === 'agency') {
    const accepted = await AgencyContact.countDocuments({
      agency: actor.id,
      status: 'accepted',
      respondedAt: { $gt: new Date(Date.now() - 7 * 86400000) },
    });
    add(accepted, {
      id: 'acc',
      icon: '✅',
      text: `ဒီအပတ် လက်ခံခဲ့တဲ့ ကျောင်းသား ${accepted} ယောက်`,
      href: '/agency',
    });
  } else {
    const [due, offers, classes] = await Promise.all([
      dueCount(actor.id),
      AgencyContact.countDocuments({ student: actor.id, status: 'pending' }),
      Booking.countDocuments({
        student: actor.id,
        status: 'confirmed',
        startAt: { $gt: new Date(), $lt: new Date(Date.now() + 86400000) },
      }),
    ]);
    add(due, {
      id: 'due',
      icon: '🗂',
      text: `ဒီနေ့ ပြန်လှန်ရမယ့် ကတ် ${due} ခု`,
      href: '/flashcards',
    });
    add(classes, {
      id: 'class',
      icon: '⏰',
      text: `၂၄ နာရီအတွင်း 1-on-1 class ${classes} ခု`,
      href: '/classes',
    });
    add(offers, {
      id: 'offers',
      icon: '🇯🇵',
      text: `Agency ဆီက အလုပ်ကမ်းလှမ်းစာ ${offers} စောင်`,
      href: '/jobs',
    });
  }
  return NextResponse.json({ notices: out });
}
