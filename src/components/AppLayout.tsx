import React from 'react';
import Sidebar from './Sidebar';
import DashboardTopbar from './DashboardTopbar';
import MobileBottomNav from './MobileBottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activePath={activePath} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar activePath={activePath} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 xl:px-10 py-6 md:py-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav activePath={activePath} />
    </div>
  );
}
