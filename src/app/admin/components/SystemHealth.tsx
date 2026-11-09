'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const services = [
  {
    name: 'API Gateway',
    status: 'Operational',
    uptime: '99.98%',
    latency: '42ms',
    icon: 'ServerIcon',
  },
  {
    name: 'Database (Supabase)',
    status: 'Operational',
    uptime: '99.99%',
    latency: '18ms',
    icon: 'CircleStackIcon',
  },
  {
    name: 'Auth Service',
    status: 'Operational',
    uptime: '100%',
    latency: '31ms',
    icon: 'ShieldCheckIcon',
  },
  { name: 'Media CDN', status: 'Degraded', uptime: '98.2%', latency: '210ms', icon: 'CloudIcon' },
  {
    name: 'Email Service',
    status: 'Operational',
    uptime: '99.9%',
    latency: '55ms',
    icon: 'EnvelopeIcon',
  },
  {
    name: 'Payment Gateway',
    status: 'Operational',
    uptime: '99.95%',
    latency: '88ms',
    icon: 'CreditCardIcon',
  },
];

const recentLogs = [
  {
    id: 'l1',
    level: 'WARN',
    message: 'Media CDN response time elevated (>200ms)',
    time: '14:32:11',
    service: 'CDN',
  },
  {
    id: 'l2',
    level: 'INFO',
    message: 'Scheduled backup completed successfully',
    time: '14:00:00',
    service: 'Database',
  },
  {
    id: 'l3',
    level: 'INFO',
    message: '234 new user registrations processed',
    time: '13:45:22',
    service: 'Auth',
  },
  {
    id: 'l4',
    level: 'ERROR',
    message: 'Payment webhook retry #3 for txn_8821',
    time: '13:12:05',
    service: 'Payments',
  },
  {
    id: 'l5',
    level: 'INFO',
    message: 'Content cache invalidated for N2 lessons',
    time: '12:58:44',
    service: 'CDN',
  },
  {
    id: 'l6',
    level: 'INFO',
    message: 'SSL certificate renewed (expires Jan 2027)',
    time: '11:00:00',
    service: 'API',
  },
];

const logColors: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-600',
  WARN: 'bg-amber-50 text-amber-600',
  ERROR: 'bg-danger-bg text-danger',
};

const statusColors: Record<string, string> = {
  Operational: 'text-success',
  Degraded: 'text-warning',
  Down: 'text-danger',
};

const statusDotColors: Record<string, string> = {
  Operational: 'bg-success',
  Degraded: 'bg-warning',
  Down: 'bg-danger',
};

const platformSettings = [
  {
    label: 'Maintenance Mode',
    description: 'Temporarily disable access for all users',
    enabled: false,
  },
  { label: 'New Registrations', description: 'Allow new users to sign up', enabled: true },
  { label: 'Email Notifications', description: 'Send automated emails to users', enabled: true },
  { label: 'Debug Logging', description: 'Enable verbose logging for diagnostics', enabled: false },
];

export default function SystemHealth() {
  const [settings, setSettings] = useState(platformSettings);

  const toggleSetting = (index: number) => {
    setSettings((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  };

  return (
    <div className="space-y-6">
      {/* Service Status Grid */}
      <div>
        <h2 className="text-[14px] font-semibold text-foreground mb-3">Service Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc, i) => (
            <div
              key={`svc-${i}`}
              className="bg-card border border-border rounded-2xl shadow-card p-4 flex items-start gap-3"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${svc.status === 'Operational' ? 'bg-success-bg' : 'bg-amber-50'}`}
              >
                <Icon
                  name={svc.icon as Parameters<typeof Icon>[0]['name']}
                  size={18}
                  className={svc.status === 'Operational' ? 'text-success' : 'text-warning'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-foreground truncate">{svc.name}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusDotColors[svc.status]}`} />
                    <span className={`text-[11px] font-semibold ${statusColors[svc.status]}`}>
                      {svc.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    Uptime: <span className="font-semibold text-foreground">{svc.uptime}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Latency: <span className="font-semibold text-foreground">{svc.latency}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Settings + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Platform Settings</h2>
          <div className="space-y-3">
            {settings.map((setting, i) => (
              <div
                key={`setting-${i}`}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-[13px] font-medium text-foreground">{setting.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(i)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${setting.enabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-foreground">System Logs</h2>
            <button className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowPathIcon" size={13} />
              Refresh
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2.5 py-2 border-b border-border last:border-0"
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${logColors[log.level]}`}
                >
                  {log.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground leading-snug">{log.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{log.service}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="ExclamationTriangleIcon" size={16} className="text-danger" />
          <h2 className="text-[14px] font-semibold text-danger">Danger Zone</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-red-200 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-foreground mb-1">Clear Cache</p>
            <p className="text-[11px] text-muted-foreground mb-3">
              Flush all CDN and application caches
            </p>
            <button className="w-full py-1.5 border border-red-300 text-danger text-[12px] font-semibold rounded-lg hover:bg-danger-bg transition-colors">
              Clear Cache
            </button>
          </div>
          <div className="border border-red-200 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-foreground mb-1">Force Logout All</p>
            <p className="text-[11px] text-muted-foreground mb-3">
              Invalidate all active user sessions
            </p>
            <button className="w-full py-1.5 border border-red-300 text-danger text-[12px] font-semibold rounded-lg hover:bg-danger-bg transition-colors">
              Force Logout
            </button>
          </div>
          <div className="border border-red-200 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-foreground mb-1">Enable Maintenance</p>
            <p className="text-[11px] text-muted-foreground mb-3">
              Take platform offline for maintenance
            </p>
            <button className="w-full py-1.5 border border-red-300 text-danger text-[12px] font-semibold rounded-lg hover:bg-danger-bg transition-colors">
              Go Offline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
