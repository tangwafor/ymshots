import React, { useState, useEffect } from 'react';

// ─── Hook: fetch admin API data ───
export function useAdminData<T>(apiBase: string, endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}${endpoint}`)
      .then(r => r.json())
      .then(json => { setData(json.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [apiBase, endpoint]);

  const refetch = () => {
    setLoading(true);
    fetch(`${apiBase}${endpoint}`)
      .then(r => r.json())
      .then(json => { setData(json.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  return { data, loading, error, refetch };
}

// ─── Stat Card ───
export function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{
      backgroundColor: '#111',
      borderRadius: 8,
      padding: '16px 20px',
      border: '1px solid #1a1a1a',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? '#fff', marginTop: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Section Header ───
export function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{title}</h2>
      {children}
    </div>
  );
}

// ─── Stats Grid ───
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 12,
      marginBottom: 24,
    }}>
      {children}
    </div>
  );
}

// ─── Data Table ───
export function DataTable({ columns, rows }: {
  columns: Array<{ key: string; label: string; width?: number }>;
  rows: Array<Record<string, any>>;
}) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #1a1a1a' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                textAlign: 'left', padding: '10px 12px', fontSize: 11,
                color: 'rgba(255,255,255,0.4)', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                width: col.width,
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid #111',
              backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#0a0a0a',
            }}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>
                  {row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{
                padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)',
              }}>
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Badge ───
export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: `${color}22`,
      color,
    }}>
      {text}
    </span>
  );
}

// ─── Loading / Error states ───
export function LoadingState() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
      Loading...
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#e74c3c' }}>
      Error: {message}
    </div>
  );
}

// ─── Format helpers ───
export function formatCents(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
