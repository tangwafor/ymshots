import React, { useState } from 'react';
import { useAdminData, SectionHeader, StatsGrid, StatCard, DataTable, Badge, LoadingState, ErrorState, formatCents, formatDate } from './shared';

interface InvoicesData {
  invoices: Array<{
    id: string; invoiceNumber: string; status: string; totalCents: string;
    currency: string; createdAt: string;
    user: { fullName: string }; client: { fullName: string; email: string };
    _count: { lineItems: number };
  }>;
  total: number;
}

interface RevenueData {
  byStatus: Array<{ status: string; _count: number; _sum: { totalCents: string } }>;
  byCurrency: Array<{ currency: string; _count: number; _sum: { totalCents: string } }>;
}

const INV_COLORS: Record<string, string> = {
  DRAFT: '#888', SENT: '#2196F3', VIEWED: '#FF9800',
  PAID: '#4CAF50', OVERDUE: '#e74c3c', CANCELLED: '#666',
};

export function InvoicesPanel({ apiBase }: { apiBase: string }) {
  const [status, setStatus] = useState('');
  const { data, loading, error } = useAdminData<InvoicesData>(apiBase, `/invoices?status=${status}`);
  const { data: revenue } = useAdminData<RevenueData>(apiBase, '/revenue');

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed'} />;

  return (
    <div>
      <SectionHeader title={`Invoices (${data.total})`}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #333', backgroundColor: '#111', color: '#fff', fontSize: 13 }}>
          <option value="">All Status</option>
          {['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
      </SectionHeader>

      {revenue && (
        <StatsGrid>
          {revenue.byStatus.map(s => (
            <StatCard key={s.status} label={s.status} value={s._count}
              sub={formatCents(Number(s._sum.totalCents ?? 0))}
              color={INV_COLORS[s.status]} />
          ))}
        </StatsGrid>
      )}

      <DataTable
        columns={[
          { key: 'number', label: 'Invoice #', width: 140 },
          { key: 'photographer', label: 'Photographer', width: 130 },
          { key: 'client', label: 'Client', width: 130 },
          { key: 'status', label: 'Status', width: 90 },
          { key: 'total', label: 'Total', width: 100 },
          { key: 'items', label: 'Items', width: 60 },
          { key: 'date', label: 'Created', width: 100 },
        ]}
        rows={data.invoices.map(inv => ({
          number: inv.invoiceNumber,
          photographer: inv.user.fullName,
          client: inv.client.fullName,
          status: <Badge text={inv.status} color={INV_COLORS[inv.status] ?? '#888'} />,
          total: `${formatCents(Number(inv.totalCents))} ${inv.currency}`,
          items: inv._count.lineItems,
          date: formatDate(inv.createdAt),
        }))}
      />
    </div>
  );
}
