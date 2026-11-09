'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AdminOverviewBento from './components/AdminOverviewBento';
import UserManagementTable from './components/UserManagementTable';
import Link from 'next/link';
import RevenueAnalytics from './components/RevenueAnalytics';
import SystemHealth from './components/SystemHealth';
import PaymentApprovals from './components/PaymentApprovals';
import TeacherApplications from './components/TeacherApplications';
import SiteSettingsEditor from './components/SiteSettingsEditor';

type AdminTab =
  | 'payments'
  | 'teachers'
  | 'content'
  | 'settings'
  | 'overview'
  | 'users'
  | 'revenue'
  | 'system';

const tabs: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'teachers', label: 'ဆရာများ', icon: '👩‍🏫' },
  { id: 'content', label: 'သင်ခန်းစာ', icon: '📚' },
  { id: 'settings', label: 'Settings', icon: '🛠️' },
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'revenue', label: 'Revenue', icon: '💰' },
  { id: 'system', label: 'System', icon: '⚙️' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('payments');

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
              Platform management & analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-success-bg border border-green-200 text-success text-[12px] font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap text-[13.5px] font-medium rounded-t-lg transition-all duration-150 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-secondary/40'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'payments' && <PaymentApprovals />}
      {activeTab === 'overview' && <AdminOverviewBento />}
      {activeTab === 'users' && <UserManagementTable />}
      {activeTab === 'teachers' && <TeacherApplications />}
      {activeTab === 'settings' && <SiteSettingsEditor />}
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
              href="/studio?new=1"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold"
            >
              + အသစ် ရေးမယ်
            </Link>
          </div>
        </div>
      )}
      {activeTab === 'revenue' && <RevenueAnalytics />}
      {activeTab === 'system' && <SystemHealth />}
    </AppLayout>
  );
}
