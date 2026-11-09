'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AdminOverviewBento from './components/AdminOverviewBento';
import UserManagementTable from './components/UserManagementTable';
import Link from 'next/link';
import RevenueAnalytics from './components/RevenueAnalytics';
import PaymentApprovals from './components/PaymentApprovals';
import TeacherApplications from './components/TeacherApplications';
import SiteSettingsEditor from './components/SiteSettingsEditor';
import { useAdminStats } from './components/adminStats';
import ScholarshipQueue from './components/ScholarshipQueue';
import TeacherEarnings from './components/TeacherEarnings';

type AdminTab =
  | 'overview'
  | 'payments'
  | 'teachers'
  | 'content'
  | 'users'
  | 'revenue'
  | 'scholarships'
  | 'earnings'
  | 'settings';

const tabs: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'အကျဉ်းချုပ်', icon: '📊' },
  { id: 'payments', label: 'ငွေပေးချေမှု', icon: '💳' },
  { id: 'teachers', label: 'ဆရာများ', icon: '👩‍🏫' },
  { id: 'content', label: 'သင်ခန်းစာ', icon: '📚' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'revenue', label: 'ဝင်ငွေ', icon: '💰' },
  { id: 'scholarships', label: 'ပညာသင်ဆု', icon: '🎓' },
  { id: 'earnings', label: 'ဆရာ ဝင်ငွေ', icon: '💵' },
  { id: 'settings', label: 'Settings', icon: '🛠️' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { stats, error, reload } = useAdminStats();

  const open = (tab: AdminTab) => {
    // Numbers may have changed after approving payments, teachers, etc.
    if (tab === 'overview' || tab === 'revenue') reload();
    setActiveTab(tab);
  };

  return (
    <AppLayout activePath="/admin">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-[24px] font-bold text-foreground tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              ငွေပေးချေမှု၊ ဆရာ၊ သင်ခန်းစာ၊ user တွေကို စီမံရန်
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => open(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap text-[13.5px] font-medium rounded-t-lg transition-all duration-150 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-secondary/40'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'payments' && !!stats?.content.pendingPayments && (
                <span className="ml-1 bg-warning text-white text-[10px] font-bold rounded-full px-1.5">
                  {stats.content.pendingPayments}
                </span>
              )}
              {tab.id === 'teachers' && !!stats?.content.pendingTeachers && (
                <span className="ml-1 bg-warning text-white text-[10px] font-bold rounded-full px-1.5">
                  {stats.content.pendingTeachers}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'payments' && <PaymentApprovals />}
      {activeTab === 'overview' && <AdminOverviewBento stats={stats} error={error} goTo={open} />}
      {activeTab === 'users' && <UserManagementTable onChanged={reload} />}
      {activeTab === 'teachers' && <TeacherApplications />}
      {activeTab === 'settings' && <SiteSettingsEditor />}
      {activeTab === 'scholarships' && <ScholarshipQueue />}
      {activeTab === 'earnings' && <TeacherEarnings />}
      {activeTab === 'content' && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
          <p className="font-bold text-[15px] mb-1">📚 သင်ခန်းစာ စီမံရန်</p>
          <p className="text-[13px] text-muted-foreground mb-4">
            သင်ခန်းစာ အသစ်ရေးတာ၊ video link ပြောင်းတာ၊ ဆရာတွေ ပို့ထားတာကို စစ်ပြီး ထုတ်ဝေတာ Studio
            မှာ လုပ်ပါ။
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/studio?scope=pending"
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              စစ်ရန် သင်ခန်းစာများ
            </Link>
            <Link
              href="/messages"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold"
            >
              📥 ဆရာတွေဆီက စာများ
            </Link>
            <Link
              href="/studio?new=1"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold"
            >
              + အသစ် ရေးမယ်
            </Link>
          </div>
        </div>
      )}
      {activeTab === 'revenue' && <RevenueAnalytics stats={stats} error={error} />}
    </AppLayout>
  );
}
