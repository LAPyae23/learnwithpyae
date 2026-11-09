import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { navItems } from './navItems';

export default function MobileBottomNav({ activePath }: { activePath?: string }) {
  const items = navItems.filter((i) => i.mobile);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="အဓိက မီနူး"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const isActive = activePath === item.href;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon
                  name={item.icon as Parameters<typeof Icon>[0]['name']}
                  size={22}
                  variant={isActive ? 'solid' : 'outline'}
                />
                <span className="leading-tight">{item.shortLabel ?? item.label}</span>
                {item.badge ? (
                  <span className="absolute top-1 right-[calc(50%-18px)] bg-danger text-white text-[9px] font-bold rounded-full px-1 min-w-[16px] text-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
