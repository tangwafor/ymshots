import React from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, Badge, LoadingState, ErrorState } from './shared';

interface AcademyOverview {
  lessonCount: number;
  completions: number;
  inProgress: number;
  challengeSubmissions: number;
  challengesPassed: number;
  challengePassRate: number;
  byLevel: Array<{ currentLevel: string; _count: number }>;
  topLessons: Array<{ title: string; slug: string; completions: number }>;
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#4CAF50', APPRENTICE: '#2196F3', PROFESSIONAL: '#FF9800',
  MASTER: '#E0943A', LEGEND: '#7C4DFF',
};

export function AcademyPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error } = useAdminData<AcademyOverview>(apiBase, '/academy/overview');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title="Academy" />

      <StatsGrid>
        <StatCard label="Lessons" value={data.lessonCount} />
        <StatCard label="Completions" value={data.completions} color="#4CAF50" />
        <StatCard label="In Progress" value={data.inProgress} color="#FF9800" />
        <StatCard label="Challenges" value={data.challengeSubmissions} />
        <StatCard label="Passed" value={data.challengesPassed} color="#4CAF50" />
        <StatCard label="Pass Rate" value={`${data.challengePassRate}%`} />
      </StatsGrid>

      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Users by Level</h3>
      <StatsGrid>
        {data.byLevel.map(l => (
          <StatCard key={l.currentLevel} label={l.currentLevel} value={l._count} color={LEVEL_COLORS[l.currentLevel]} />
        ))}
      </StatsGrid>

      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Lessons</h3>
      <DataTable
        columns={[
          { key: 'title', label: 'Lesson', width: 250 },
          { key: 'slug', label: 'Slug', width: 180 },
          { key: 'completions', label: 'Completions', width: 100 },
        ]}
        rows={data.topLessons}
      />
    </div>
  );
}
