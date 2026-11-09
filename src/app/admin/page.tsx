'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AdminOverviewBento from './components/AdminOverviewBento';
import UserManagementTable from './components/UserManagementTable';
import ContentManagement from './components/ContentManagement';
import RevenueAnalytics from './components/RevenueAnalytics';
import SystemHealth from './components/SystemHealth';
import PaymentApprovals from './components/PaymentApprovals';

type AdminTab = 'payments' | 'overview' | 'users' | 'content' | 'revenue' | 'system';

const tabs: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'content', label: 'Content', icon: '📚' },
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
        <div className="flex items-center gap-1 mt-5 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium rounded-t-lg transition-all duration-150 border-b-2 -mb-px ${
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
      {activeTab === 'content' && <ContentManagement />}
      {activeTab === 'revenue' && <RevenueAnalytics />}
      {activeTab === 'system' && <SystemHealth />}
    </AppLayout>
  );
}
