import React from 'react';
import VocabRetentionChart from './VocabRetentionChart';
import StudyTimeChart from './StudyTimeChart';

export default function DashboardChartsRow() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-0">
      <VocabRetentionChart />
      <StudyTimeChart />
    </div>
  );
}
