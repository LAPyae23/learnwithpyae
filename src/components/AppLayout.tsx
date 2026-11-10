import React, { Suspense } from 'react';
import Sidebar from './Sidebar';
import DashboardTopbar from './DashboardTopbar';
import MobileBottomNav from './MobileBottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Kept for existing pages; the active item is now derived from the URL. */
  activePath?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Suspense
        fallback={<div className="hidden md:block w-[240px] border-r border-border bg-card" />}
      >
        <Sidebar />
      </Suspense>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Suspense fallback={<div className="h-14 md:h-16 border-b border-border bg-card" />}>
          <DashboardTopbar />
        </Suspense>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 xl:px-10 py-4 md:py-8 pb-28 md:pb-8">
            {children}
          </div>
        </main>
      </div>
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
