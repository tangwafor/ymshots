import React, { useState } from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, Badge, LoadingState, ErrorState, formatDate } from './shared';

interface ShootsData {
  shoots: Array<{
    id: string; name: string; shootType: string; status: string; createdAt: string;
    user: { fullName: string }; client?: { fullName: string };
    _count: { photos: number; galleries: number };
  }>;
  total: number;
}

interface ShootStats {
  byStatus: Array<{ status: string; _count: number }>;
  byType: Array<{ shootType: string; _count: number }>;
  photoStats: { _count: number; _sum: { fileSizeBytes: number }; _avg: { sharpnessScore: number } };
}

const STATUS_COLORS: Record<string, string> = {
  IMPORTING: '#2196F3', CULLING: '#FF9800', EDITING: '#E0943A',
  DELIVERING: '#4CAF50', ARCHIVED: '#666',
};

export function ShootsPanel({ apiBase }: { apiBase: string }) {
  const [status, setStatus] = useState('');
  const { data, loading, error } = useAdminData<ShootsData>(apiBase, `/shoots?status=${status}`);
  const { data: stats } = useAdminData<ShootStats>(apiBase, '/shoots/stats');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title={`Shoots (${data.total})`}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #333', backgroundColor: '#111', color: '#fff', fontSize: 13 }}>
          <option value="">All Status</option>
          {['IMPORTING', 'CULLING', 'EDITING', 'DELIVERING', 'ARCHIVED'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
      </SectionHeader>

      {stats && (
        <StatsGrid>
          {stats.byStatus.map(s => (
            <StatCard key={s.status} label={s.status} value={s._count} color={STATUS_COLORS[s.status]} />
          ))}
          <StatCard label="Total Photos" value={stats.photoStats._count.toLocaleString()} />
        </StatsGrid>
      )}

      <DataTable
        columns={[
          { key: 'name', label: 'Shoot Name', width: 180 },
          { key: 'photographer', label: 'Photographer', width: 140 },
          { key: 'type', label: 'Type', width: 100 },
          { key: 'status', label: 'Status', width: 100 },
          { key: 'photos', label: 'Photos', width: 70 },
          { key: 'galleries', label: 'Galleries', width: 80 },
          { key: 'date', label: 'Created', width: 100 },
        ]}
        rows={data.shoots.map(s => ({
          name: s.name,
          photographer: s.user.fullName,
          type: s.shootType,
          status: <Badge text={s.status} color={STATUS_COLORS[s.status] ?? '#888'} />,
          photos: s._count.photos,
          galleries: s._count.galleries,
          date: formatDate(s.createdAt),
        }))}
      />
    </div>
  );
}
