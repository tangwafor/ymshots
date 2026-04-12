import React from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, Badge, LoadingState, ErrorState, formatDate } from './shared';

interface GalleriesData {
  galleries: Array<{
    id: string; slug: string; title: string; status: string; viewCount: number;
    downloadAllowed: boolean; createdAt: string;
    user: { fullName: string }; shoot: { name: string };
    _count: { photos: number };
  }>;
  total: number;
}

interface GalleryStats {
  byStatus: Array<{ status: string; _count: number }>;
  totalViews: number;
  clientSelections: number;
}

const GALLERY_COLORS: Record<string, string> = {
  DRAFT: '#888', ACTIVE: '#4CAF50', EXPIRED: '#FF9800', ARCHIVED: '#666',
};

export function GalleriesPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error } = useAdminData<GalleriesData>(apiBase, '/galleries');
  const { data: stats } = useAdminData<GalleryStats>(apiBase, '/galleries/stats');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title={`Galleries (${data.total})`} />

      {stats && (
        <StatsGrid>
          {stats.byStatus.map(s => (
            <StatCard key={s.status} label={s.status} value={s._count} color={GALLERY_COLORS[s.status]} />
          ))}
          <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} />
          <StatCard label="Client Selections" value={stats.clientSelections} color="#E0943A" />
        </StatsGrid>
      )}

      <DataTable
        columns={[
          { key: 'title', label: 'Gallery', width: 180 },
          { key: 'photographer', label: 'Photographer', width: 140 },
          { key: 'shoot', label: 'Shoot', width: 140 },
          { key: 'status', label: 'Status', width: 80 },
          { key: 'photos', label: 'Photos', width: 70 },
          { key: 'views', label: 'Views', width: 70 },
          { key: 'date', label: 'Created', width: 100 },
        ]}
        rows={data.galleries.map(g => ({
          title: g.title,
          photographer: g.user.fullName,
          shoot: g.shoot.name,
          status: <Badge text={g.status} color={GALLERY_COLORS[g.status] ?? '#888'} />,
          photos: g._count.photos,
          views: g.viewCount,
          date: formatDate(g.createdAt),
        }))}
      />
    </div>
  );
}
