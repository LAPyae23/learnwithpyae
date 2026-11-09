'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  level: string;
  plan: 'Free' | 'Basic' | 'Premium';
  status: 'Active' | 'Inactive' | 'Suspended';
  joined: string;
  lastActive: string;
}

const users: User[] = [
  {
    id: 'u1',
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@nihongoacademy.demo',
    role: 'Student',
    level: 'N2',
    plan: 'Premium',
    status: 'Active',
    joined: 'Jan 12, 2026',
    lastActive: '2h ago',
  },
  {
    id: 'u2',
    name: 'Kenji Watanabe',
    email: 'kenji.w@example.com',
    role: 'Student',
    level: 'N3',
    plan: 'Premium',
    status: 'Active',
    joined: 'Feb 3, 2026',
    lastActive: '5m ago',
  },
  {
    id: 'u3',
    name: 'Sakura Ito',
    email: 'sakura.ito@example.com',
    role: 'Student',
    level: 'N4',
    plan: 'Basic',
    status: 'Active',
    joined: 'Mar 15, 2026',
    lastActive: '1d ago',
  },
  {
    id: 'u4',
    name: 'Hiroshi Nakamura',
    email: 'h.nakamura@example.com',
    role: 'Teacher',
    level: 'N1',
    plan: 'Premium',
    status: 'Active',
    joined: 'Dec 1, 2025',
    lastActive: '30m ago',
  },
  {
    id: 'u5',
    name: 'Aiko Sato',
    email: 'aiko.sato@example.com',
    role: 'Student',
    level: 'N2',
    plan: 'Free',
    status: 'Inactive',
    joined: 'Apr 20, 2026',
    lastActive: '2w ago',
  },
  {
    id: 'u6',
    name: 'Ryo Yamamoto',
    email: 'ryo.y@example.com',
    role: 'Student',
    level: 'N5',
    plan: 'Basic',
    status: 'Active',
    joined: 'May 8, 2026',
    lastActive: '3h ago',
  },
  {
    id: 'u7',
    name: 'Mei Kobayashi',
    email: 'mei.k@example.com',
    role: 'Teacher',
    level: 'N1',
    plan: 'Premium',
    status: 'Active',
    joined: 'Nov 14, 2025',
    lastActive: '1h ago',
  },
  {
    id: 'u8',
    name: 'Taro Suzuki',
    email: 'taro.s@example.com',
    role: 'Student',
    level: 'N3',
    plan: 'Free',
    status: 'Suspended',
    joined: 'Jun 2, 2026',
    lastActive: '5d ago',
  },
];

const roleColors: Record<string, string> = {
  Student: 'bg-blue-100 text-blue-700',
  Teacher: 'bg-purple-100 text-purple-700',
  Admin: 'bg-amber-100 text-amber-700',
};

const planColors: Record<string, string> = {
  Free: 'bg-muted text-muted-foreground',
  Basic: 'bg-blue-50 text-blue-600',
  Premium: 'bg-amber-50 text-amber-600',
};

const statusColors: Record<string, string> = {
  Active: 'bg-success-bg text-success',
  Inactive: 'bg-muted text-muted-foreground',
  Suspended: 'bg-danger-bg text-danger',
};

export default function UserManagementTable() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedUsers(selectedUsers.length === filtered.length ? [] : filtered.map((u) => u.id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Icon
              name="MagnifyingGlassIcon"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="All">All Roles</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity">
              <Icon name="PlusIcon" size={14} />
              Add User
            </button>
          </div>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-[12px] text-muted-foreground">
              {selectedUsers.length} selected
            </span>
            <button className="text-[12px] font-semibold text-danger hover:underline">
              Suspend
            </button>
            <button className="text-[12px] font-semibold text-muted-foreground hover:underline">
              Export
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-muted/30 transition-colors ${selectedUsers.includes(user.id) ? 'bg-secondary/20' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold text-foreground">{user.level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${planColors[user.plan]}`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{user.joined}</td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{user.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit user"
                      >
                        <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="View profile"
                      >
                        <Icon name="EyeIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-danger-bg transition-colors"
                        title="Suspend user"
                      >
                        <Icon name="NoSymbolIcon" size={14} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Showing {filtered.length} of {users.length} users
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-[12px] font-medium bg-primary text-primary-foreground rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
