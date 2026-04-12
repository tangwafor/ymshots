import React, { useState } from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, Badge, LoadingState, ErrorState, formatDate } from './shared';

interface UsersData {
  users: Array<{
    id: string; email: string; fullName: string; planTier: string;
    onboardingCompleted: boolean; createdAt: string;
    _count: { shoots: number; galleries: number; invoices: number; styleProfiles: number; academyProgress: number };
  }>;
  total: number;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: '#888', PRO: '#E0943A', STUDIO: '#7C4DFF',
};

export function UsersPanel({ apiBase }: { apiBase: string }) {
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const qs = `?search=${search}&plan=${plan}`;
  const { data, loading, error } = useAdminData<UsersData>(apiBase, `/users${qs}`);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed to load'} />;

  const rows = data.users.map(u => ({
    name: u.fullName,
    email: u.email,
    plan: <Badge text={u.planTier} color={PLAN_COLORS[u.planTier] ?? '#888'} />,
    shoots: u._count.shoots,
    galleries: u._count.galleries,
    invoices: u._count.invoices,
    styles: u._count.styleProfiles,
    academy: u._count.academyProgress,
    joined: formatDate(u.createdAt),
  }));

  return (
    <div>
      <SectionHeader title={`Users (${data.total})`}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid #333',
              backgroundColor: '#111', color: '#fff', fontSize: 13,
            }}
          />
          <select
            value={plan}
            onChange={e => setPlan(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid #333',
              backgroundColor: '#111', color: '#fff', fontSize: 13,
            }}
          >
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="STUDIO">Studio</option>
          </select>
        </div>
      </SectionHeader>

      <DataTable
        columns={[
          { key: 'name', label: 'Name', width: 160 },
          { key: 'email', label: 'Email', width: 200 },
          { key: 'plan', label: 'Plan', width: 80 },
          { key: 'shoots', label: 'Shoots', width: 70 },
          { key: 'galleries', label: 'Galleries', width: 80 },
          { key: 'invoices', label: 'Invoices', width: 70 },
          { key: 'styles', label: 'Styles', width: 60 },
          { key: 'academy', label: 'Academy', width: 70 },
          { key: 'joined', label: 'Joined', width: 100 },
        ]}
        rows={rows}
      />
    </div>
  );
}
