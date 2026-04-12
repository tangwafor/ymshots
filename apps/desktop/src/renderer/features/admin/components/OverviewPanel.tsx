import React from 'react';
import { useAdminData, StatCard, StatsGrid, SectionHeader, LoadingState, ErrorState, formatCents } from './shared';

interface DashboardData {
  users: { total: number; free: number; pro: number; studio: number };
  content: { shoots: number; photos: number; galleries: number; styleProfiles: number; exports: number; tetherSessions: number };
  revenue: { totalCents: number; invoicesTotal: number; invoicesPaid: number; conversionRate: number };
  academy: { lessons: number; completions: number };
  pitch: { views: number; conversions: number; conversionRate: number };
}

export function OverviewPanel({ apiBase }: { apiBase: string }) {
  const { data, loading, error } = useAdminData<DashboardData>(apiBase, '/dashboard');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed to load'} />;

  return (
    <div>
      <SectionHeader title="Dashboard Overview" />

      {/* Users */}
      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Users</h3>
      <StatsGrid>
        <StatCard label="Total Users" value={data.users.total} />
        <StatCard label="Free" value={data.users.free} />
        <StatCard label="Pro" value={data.users.pro} color="#E0943A" />
        <StatCard label="Studio" value={data.users.studio} color="#7C4DFF" />
      </StatsGrid>

      {/* Content */}
      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content</h3>
      <StatsGrid>
        <StatCard label="Shoots" value={data.content.shoots} />
        <StatCard label="Photos" value={data.content.photos.toLocaleString()} />
        <StatCard label="Galleries" value={data.content.galleries} />
        <StatCard label="Style Profiles" value={data.content.styleProfiles} />
        <StatCard label="Exports" value={data.content.exports} />
        <StatCard label="Tether Sessions" value={data.content.tetherSessions} />
      </StatsGrid>

      {/* Revenue */}
      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</h3>
      <StatsGrid>
        <StatCard label="Total Revenue" value={formatCents(data.revenue.totalCents)} color="#4CAF50" />
        <StatCard label="Invoices Sent" value={data.revenue.invoicesTotal} />
        <StatCard label="Invoices Paid" value={data.revenue.invoicesPaid} color="#4CAF50" />
        <StatCard label="Conversion" value={`${data.revenue.conversionRate}%`} />
      </StatsGrid>

      {/* Academy & Pitch */}
      <h3 style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academy & Pitch</h3>
      <StatsGrid>
        <StatCard label="Lessons" value={data.academy.lessons} />
        <StatCard label="Completions" value={data.academy.completions} />
        <StatCard label="Pitch Views" value={data.pitch.views} />
        <StatCard label="Pitch Conversions" value={data.pitch.conversions} sub={`${data.pitch.conversionRate}% rate`} color="#E0943A" />
      </StatsGrid>
    </div>
  );
}
