import React from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, Badge, LoadingState, ErrorState } from './shared';

interface HealthData {
  database: string;
  last24h: {
    newUsers: number;
    newShoots: number;
    exports: number;
    failedExports: number;
  };
  timestamp: string;
}

interface SoundData {
  totalPlays: number;
  byEvent: Array<{ eventKey: string; _count: number }>;
}

export function SystemHealthPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error, refetch } = useAdminData<HealthData>(apiBase, '/health');
  const { data: sounds } = useAdminData<SoundData>(apiBase, '/sound-events');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title="System Health">
        <button onClick={refetch} style={{
          padding: '6px 16px', borderRadius: 6, border: '1px solid #333',
          backgroundColor: '#111', color: '#fff', fontSize: 13, cursor: 'pointer',
        }}>
          Refresh
        </button>
      </SectionHeader>

      <StatsGrid>
        <StatCard label="Database" value={data.database === 'healthy' ? 'Healthy' : 'Down'}
          color={data.database === 'healthy' ? '#4CAF50' : '#e74c3c'} />
        <StatCard label="Last Check" value={new Date(data.timestamp).toLocaleTimeString()} />
      </StatsGrid>

      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>Last 24 Hours</h3>
      <StatsGrid>
        <StatCard label="New Users" value={data.last24h.newUsers} color="#4CAF50" />
        <StatCard label="New Shoots" value={data.last24h.newShoots} />
        <StatCard label="Exports" value={data.last24h.exports} />
        <StatCard label="Failed Exports" value={data.last24h.failedExports}
          color={data.last24h.failedExports > 0 ? '#e74c3c' : '#4CAF50'} />
      </StatsGrid>

      {sounds && (
        <>
          <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '16px 0 8px', textTransform: 'uppercase' }}>
            SoundPulse Events ({sounds.totalPlays} total plays)
          </h3>
          <StatsGrid>
            {sounds.byEvent.slice(0, 12).map(e => (
              <StatCard key={e.eventKey} label={e.eventKey.replace(/_/g, ' ')} value={e._count} />
            ))}
          </StatsGrid>
        </>
      )}

      <div style={{
        marginTop: 24, padding: 16, borderRadius: 8, border: '1px solid #1a1a1a',
        backgroundColor: '#111', fontSize: 12, color: 'rgba(255,255,255,0.4)',
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.6)' }}>YmShotS v1.0</strong> — Built by ta-tech
        <br />API: localhost:3001 | DB: Supabase PostgreSQL | 36 tables | 21 enums
      </div>
    </div>
  );
}
