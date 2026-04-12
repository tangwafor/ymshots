import React from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, LoadingState, ErrorState } from './shared';

interface PitchData {
  totalViews: number;
  totalConversions: number;
  conversionRate: number;
  bySource: Array<{ source: string; _count: number }>;
  bySlide: Array<{ slideReached: number; _count: number }>;
  conversions: Array<{ planChosen: string; _count: number }>;
}

const SOURCE_LABELS: Record<string, string> = {
  WELCOME: 'Welcome Screen', PLAN_GATE: 'Plan Gate',
  ABOUT: 'About Screen', SHARE_LINK: 'Share Link', UPGRADE_NUDGE: 'Upgrade Nudge',
};

const SLIDE_LABELS: Record<number, string> = {
  1: 'Hero', 2: 'Problem', 3: 'Solution', 4: 'SignatureAI',
  5: 'Academy', 6: 'Release', 7: 'Upgrade',
};

export function PitchPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error } = useAdminData<PitchData>(apiBase, '/pitch');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title="PitchDeck Analytics" />

      <StatsGrid>
        <StatCard label="Total Views" value={data.totalViews} />
        <StatCard label="Conversions" value={data.totalConversions} color="#4CAF50" />
        <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} color="#E0943A" />
      </StatsGrid>

      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>Views by Source</h3>
      <StatsGrid>
        {data.bySource.map(s => (
          <StatCard key={s.source} label={SOURCE_LABELS[s.source] ?? s.source} value={s._count} />
        ))}
      </StatsGrid>

      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>Slide Funnel (drop-off)</h3>
      <DataTable
        columns={[
          { key: 'slide', label: 'Slide', width: 60 },
          { key: 'name', label: 'Name', width: 150 },
          { key: 'reached', label: 'Reached', width: 80 },
        ]}
        rows={data.bySlide.map(s => ({
          slide: s.slideReached,
          name: SLIDE_LABELS[s.slideReached] ?? `Slide ${s.slideReached}`,
          reached: s._count,
        }))}
      />

      {data.conversions.length > 0 && (
        <>
          <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '16px 0 8px', textTransform: 'uppercase' }}>Conversions by Plan</h3>
          <StatsGrid>
            {data.conversions.map(c => (
              <StatCard key={c.planChosen} label={c.planChosen ?? 'Unknown'} value={c._count} color="#E0943A" />
            ))}
          </StatsGrid>
        </>
      )}
    </div>
  );
}
