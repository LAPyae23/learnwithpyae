'use client';
import React, { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useT } from '@/i18n/LocaleProvider';

export interface PracticeTab {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

interface Props {
  path: string;
  flag: string;
  title: string;
  subtitle: string;
  tabs: PracticeTab[];
}

/** Page frame for a language's practice tools: title, tab chips, and the active tool. */
export default function PracticeShell(props: Props) {
  return (
    <AppLayout activePath={props.path}>
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div className="h-60 bg-muted rounded-2xl animate-pulse" />}>
          <Inner {...props} />
        </Suspense>
      </div>
    </AppLayout>
  );
}

function Inner({ flag, title, subtitle, tabs }: Props) {
  const tr = useT();
  const router = useRouter();
  const pathname = usePathname();
  // The tool lives in ?t= so menu links (/korean?t=speak) and the back button work
  const t = useSearchParams()?.get('t');
  const active = tabs.find((x) => x.id === t) ?? tabs[0];

  return (
    <>
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-foreground">
          {flag} {tr(title)}
        </h1>
        <p className="text-[13px] text-muted-foreground">{tr(subtitle)}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() =>
              router.replace(x.id === tabs[0].id ? pathname : `${pathname}?t=${x.id}`, {
                scroll: false,
              })
            }
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap ${
              active.id === x.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {tr(x.label)}
          </button>
        ))}
      </div>
      {active.render()}
    </>
  );
}
