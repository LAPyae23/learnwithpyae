'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

import { navItems, sectionLabels, type NavItem } from './navItems';
import { logout, useCurrentUser } from './useCurrentUser';

interface SidebarProps {
  activePath?: string;
}

export default function Sidebar({ activePath = '/dashboard' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useCurrentUser();

  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const sec = item.section || 'main';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(item);
    return acc;
  }, {});

  const sections: NavItem['section'][] = ['main', 'practice', 'ai', 'account'];

  return (
    <aside
      className="hidden md:flex flex-col bg-card border-r border-border flex-shrink-0 overflow-hidden"
      style={{
        width: collapsed ? 64 : 240,
        transition: 'width 300ms ease',
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? 'justify-center px-0 py-4' : 'gap-2 px-4 py-4'}`}
      >
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-bold text-[15px] text-foreground tracking-tight whitespace-nowrap">
            NihongoAcademy
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {sections.map((section) => {
          const items = groupedItems[section]?.filter(
            (i) =>
              (!i.adminOnly || user?.role === 'admin') &&
              (!i.roles || (!!user && i.roles.includes(user.role as 'student')))
          );
          if (!items || items.length === 0) return null;
          return (
            <div key={`section-${section}`} className="mb-1">
              {!collapsed && (
                <p className="px-4 pt-3 pb-1 text-[11.5px] font-semibold text-muted-foreground">
                  {sectionLabels[section]}
                </p>
              )}
              {items.map((item) => {
                const isActive = activePath === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center mx-2 rounded-lg text-[13.5px] font-medium
                      transition-all duration-150 group relative
                      ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2'}
                      ${
                        isActive
                          ? 'bg-secondary text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon
                      name={item.icon as Parameters<typeof Icon>[0]['name']}
                      size={18}
                      className={
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }
                    />
                    {!collapsed && <span className="whitespace-nowrap flex-1">{item.label}</span>}
                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && item.badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 flex-shrink-0 space-y-1">
        <button
          onClick={logout}
          className={`w-full flex items-center rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-danger-bg hover:text-danger transition-all duration-150 ${collapsed ? 'justify-center px-0' : 'gap-2'}`}
          title="အကောင့်မှ ထွက်ရန်"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={16} />
          {!collapsed && <span>အကောင့်မှ ထွက်ရန်</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ${collapsed ? 'justify-center px-0' : 'gap-2'}`}
          title={collapsed ? 'ချဲ့ရန်' : 'ချုံ့ရန်'}
        >
          <Icon name={collapsed ? 'ChevronDoubleRightIcon' : 'ChevronDoubleLeftIcon'} size={16} />
          {!collapsed && <span>ချုံ့ရန်</span>}
        </button>
      </div>
    </aside>
  );
}
