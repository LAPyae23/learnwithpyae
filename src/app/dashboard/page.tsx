import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import ActiveCourseCard from './components/ActiveCourseCard';
import FlashcardDueWidget from './components/FlashcardDueWidget';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import TodayPlanCard from './components/TodayPlanCard';

export default function StudentDashboardPage() {
  return (
    <AppLayout activePath="/dashboard">
      <DashboardHeader />
      <TodayPlanCard />
      <MetricsBentoGrid />
      <DashboardChartsRow />
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActiveCourseCard />
        </div>
        <div>
          <FlashcardDueWidget />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </AppLayout>
  );
}
