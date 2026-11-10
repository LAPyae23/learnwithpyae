'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import ModeSwitcher from './ModeSwitcher';
import { isActive, useMode } from './useMode';
import { logout } from './useCurrentUser';
import { useT } from '@/i18n/LocaleProvider';

/** Desktop sidebar: only the current mode's menu, with a mode switcher on top. */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { mode, config, allowed, user, current } = useMode();
  const tr = useT();

  return (
    <aside
      className="hidden md:flex flex-col bg-card border-r border-border flex-shrink-0 overflow-hidden"
      style={{ width: collapsed ? 64 : 240, transition: 'width 300ms ease' }}
    >
      <Link
        href={config.home}
        className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? 'justify-center py-4' : 'gap-2 px-4 py-4'}`}
      >
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-bold text-[15px] text-foreground tracking-tight whitespace-nowrap">
            NihongoAcademy
          </span>
        )}
      </Link>

      {!collapsed && allowed.length > 1 && (
        <div className="px-3 pt-3">
          <ModeSwitcher mode={mode} allowed={allowed} />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {config.sections.map((section) => {
          const items = section.items.filter(
            (i) => !i.roles || (!!user && i.roles.includes(user.role as 'student'))
          );
          if (!items.length) return null;
          return (
            <div key={section.label} className="mb-1">
              {!collapsed && (
                <p className="px-4 pt-3 pb-1 text-[11.5px] font-semibold text-muted-foreground">
                  {tr(section.label)}
                </p>
              )}
              {items.map((item) => {
                const active = isActive(item.href, current);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? tr(item.label) : undefined}
                    className={`flex items-center mx-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 group ${
                      collapsed ? 'justify-center py-2.5' : 'gap-2.5 px-3 py-2'
                    } ${
                      active
                        ? 'bg-secondary text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon
                      name={item.icon as Parameters<typeof Icon>[0]['name']}
                      size={18}
                      variant={active ? 'solid' : 'outline'}
                      className={
                        active
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }
                    />
                    {!collapsed && (
                      <span className="whitespace-nowrap flex-1">{tr(item.label)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 flex-shrink-0 space-y-1">
        <button
          onClick={logout}
          className={`w-full flex items-center rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-danger-bg hover:text-danger ${collapsed ? 'justify-center px-0' : 'gap-2'}`}
          title="အကောင့်မှ ထွက်ရန်"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={16} />
          {!collapsed && <span>{tr('အကောင့်မှ ထွက်ရန်')}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${collapsed ? 'justify-center px-0' : 'gap-2'}`}
          title={collapsed ? 'ချဲ့ရန်' : 'ချုံ့ရန်'}
        >
          <Icon name={collapsed ? 'ChevronDoubleRightIcon' : 'ChevronDoubleLeftIcon'} size={16} />
          {!collapsed && <span>{tr('ချုံ့ရန်')}</span>}
        </button>
      </div>
    </aside>
  );
}
