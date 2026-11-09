'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ContentItem {
  id: string;
  title: string;
  type: 'Lesson' | 'Quiz' | 'Flashcard Deck' | 'Mock Test';
  level: string;
  status: 'Published' | 'Draft' | 'Review';
  questions: number;
  enrolled: number;
  updatedAt: string;
}

const content: ContentItem[] = [
  {
    id: 'c1',
    title: 'て-form Conditionals',
    type: 'Lesson',
    level: 'N3',
    status: 'Published',
    questions: 0,
    enrolled: 1240,
    updatedAt: 'Jul 10, 2026',
  },
  {
    id: 'c2',
    title: 'N2 Grammar Comprehensive Quiz',
    type: 'Quiz',
    level: 'N2',
    status: 'Published',
    questions: 40,
    enrolled: 876,
    updatedAt: 'Jul 8, 2026',
  },
  {
    id: 'c3',
    title: 'JLPT N3 Full Mock Test',
    type: 'Mock Test',
    level: 'N3',
    status: 'Published',
    questions: 120,
    enrolled: 2103,
    updatedAt: 'Jul 5, 2026',
  },
  {
    id: 'c4',
    title: 'Kanji N4 Core 500',
    type: 'Flashcard Deck',
    level: 'N4',
    status: 'Published',
    questions: 500,
    enrolled: 3412,
    updatedAt: 'Jun 28, 2026',
  },
  {
    id: 'c5',
    title: 'Advanced Keigo Expressions',
    type: 'Lesson',
    level: 'N1',
    status: 'Draft',
    questions: 0,
    enrolled: 0,
    updatedAt: 'Jul 12, 2026',
  },
  {
    id: 'c6',
    title: 'N5 Hiragana Mastery',
    type: 'Flashcard Deck',
    level: 'N5',
    status: 'Review',
    questions: 46,
    enrolled: 0,
    updatedAt: 'Jul 11, 2026',
  },
  {
    id: 'c7',
    title: 'Reading Comprehension N2',
    type: 'Quiz',
    level: 'N2',
    status: 'Draft',
    questions: 25,
    enrolled: 0,
    updatedAt: 'Jul 9, 2026',
  },
];

const typeColors: Record<string, string> = {
  Lesson: 'bg-blue-50 text-blue-600',
  Quiz: 'bg-purple-50 text-purple-600',
  'Flashcard Deck': 'bg-teal-50 text-teal-600',
  'Mock Test': 'bg-orange-50 text-orange-600',
};

const statusColors: Record<string, string> = {
  Published: 'bg-success-bg text-success',
  Draft: 'bg-muted text-muted-foreground',
  Review: 'bg-amber-50 text-amber-600',
};

const levelColors: Record<string, string> = {
  N1: 'text-level-n1',
  N2: 'text-level-n2',
  N3: 'text-level-n3',
  N4: 'text-level-n4',
  N5: 'text-level-n5',
};

export default function ContentManagement() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = content.filter((c) => {
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchType && matchStatus;
  });

  const stats = [
    { label: 'Total Content', value: content.length, icon: '📚' },
    {
      label: 'Published',
      value: content.filter((c) => c.status === 'Published').length,
      icon: '✅',
    },
    { label: 'In Draft', value: content.filter((c) => c.status === 'Draft').length, icon: '📝' },
    {
      label: 'Under Review',
      value: content.filter((c) => c.status === 'Review').length,
      icon: '🔍',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={`cs-${i}`}
            className="bg-card border border-border rounded-2xl shadow-card p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-[22px] font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All Types</option>
            <option value="Lesson">Lesson</option>
            <option value="Quiz">Quiz</option>
            <option value="Flashcard Deck">Flashcard Deck</option>
            <option value="Mock Test">Mock Test</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Review">Review</option>
          </select>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
          <Icon name="PlusIcon" size={14} />
          New Content
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Questions
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Enrolled
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Updated
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-foreground">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeColors[item.type]}`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] font-bold ${levelColors[item.level]}`}>
                      {item.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">
                    {item.questions > 0 ? item.questions : '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-foreground font-medium">
                    {item.enrolled > 0 ? item.enrolled.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{item.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Preview"
                      >
                        <Icon name="EyeIcon" size={14} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-danger-bg transition-colors"
                        title="Delete"
                      >
                        <Icon name="TrashIcon" size={14} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[12px] text-muted-foreground">
            Showing {filtered.length} of {content.length} items
          </p>
        </div>
      </div>
    </div>
  );
}
