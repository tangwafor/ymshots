import React from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, LoadingState, ErrorState, formatDate } from './shared';

interface ProfilesData {
  profiles: Array<{
    id: string; name: string; shootType: string; confidenceScore: string;
    isActive: boolean; createdAt: string;
    user: { fullName: string; email: string };
    _count: { trainingPairs: number };
  }>;
  total: number;
}

interface ProfileStats {
  totalProfiles: number; activeProfiles: number; totalPairs: number; avgPairsPerProfile: number;
}

export function StyleProfilesPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error } = useAdminData<ProfilesData>(apiBase, '/style-profiles');
  const { data: stats } = useAdminData<ProfileStats>(apiBase, '/style-profiles/stats');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title={`SignatureAI Profiles (${data.total})`} />

      {stats && (
        <StatsGrid>
          <StatCard label="Total Profiles" value={stats.totalProfiles} />
          <StatCard label="Active" value={stats.activeProfiles} color="#4CAF50" />
          <StatCard label="Training Pairs" value={stats.totalPairs.toLocaleString()} color="#E0943A" />
          <StatCard label="Avg Pairs/Profile" value={stats.avgPairsPerProfile} />
        </StatsGrid>
      )}

      <DataTable
        columns={[
          { key: 'name', label: 'Profile', width: 160 },
          { key: 'photographer', label: 'Photographer', width: 150 },
          { key: 'type', label: 'Shoot Type', width: 100 },
          { key: 'pairs', label: 'Pairs', width: 70 },
          { key: 'confidence', label: 'Confidence', width: 90 },
          { key: 'active', label: 'Active', width: 70 },
          { key: 'date', label: 'Created', width: 100 },
        ]}
        rows={data.profiles.map(p => ({
          name: p.name,
          photographer: p.user.fullName,
          type: p.shootType,
          pairs: p._count.trainingPairs,
          confidence: p.confidenceScore ? `${(Number(p.confidenceScore) * 100).toFixed(0)}%` : '—',
          active: p.isActive ? 'Yes' : 'No',
          date: formatDate(p.createdAt),
        }))}
      />
    </div>
  );
}
