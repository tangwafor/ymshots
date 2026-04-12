import React from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, Badge, LoadingState, ErrorState, formatDateTime } from './shared';

interface ExportsData {
  jobs: Array<{
    id: string; format: string; status: string; progressPct: number;
    quality: number; createdAt: string;
    user: { fullName: string };
  }>;
  total: number;
}

interface ExportStats {
  byStatus: Array<{ status: string; _count: number }>;
  byFormat: Array<{ format: string; _count: number }>;
}

const JOB_COLORS: Record<string, string> = {
  QUEUED: '#888', PROCESSING: '#2196F3', COMPLETE: '#4CAF50', FAILED: '#e74c3c',
};

export function ExportsPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error } = useAdminData<ExportsData>(apiBase, '/exports');
  const { data: stats } = useAdminData<ExportStats>(apiBase, '/exports/stats');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title={`Export Jobs (${data.total})`} />

      {stats && (
        <>
          <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>By Status</h3>
          <StatsGrid>
            {stats.byStatus.map(s => (
              <StatCard key={s.status} label={s.status} value={s._count} color={JOB_COLORS[s.status]} />
            ))}
          </StatsGrid>
          <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>By Format</h3>
          <StatsGrid>
            {stats.byFormat.map(f => (
              <StatCard key={f.format} label={f.format} value={f._count} />
            ))}
          </StatsGrid>
        </>
      )}

      <DataTable
        columns={[
          { key: 'user', label: 'User', width: 140 },
          { key: 'format', label: 'Format', width: 80 },
          { key: 'quality', label: 'Quality', width: 70 },
          { key: 'status', label: 'Status', width: 100 },
          { key: 'progress', label: 'Progress', width: 80 },
          { key: 'date', label: 'Created', width: 140 },
        ]}
        rows={data.jobs.map(j => ({
          user: j.user.fullName,
          format: j.format,
          quality: j.quality ?? '—',
          status: <Badge text={j.status} color={JOB_COLORS[j.status] ?? '#888'} />,
          progress: `${j.progressPct}%`,
          date: formatDateTime(j.createdAt),
        }))}
      />
    </div>
  );
}
