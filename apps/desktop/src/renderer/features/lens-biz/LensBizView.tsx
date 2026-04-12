import React from 'react';

const ACCENT = '#E0943A';

export function LensBizView() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>LensBiz Analytics</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
        Revenue, time tracking, and business insights — all in one place.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <BigStat label="This month" value="$0" sub="0 invoices paid" color="#4CAF50" />
        <BigStat label="Total revenue" value="$0" sub="lifetime" />
        <BigStat label="Avg job value" value="$0" sub="per shoot" />
        <BigStat label="Shoots" value="0" sub="this month" />
      </div>

      {/* Charts placeholder */}
      <div style={{
        height: 200, borderRadius: 8, backgroundColor: '#111',
        border: '1px solid #1a1a1a', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.15)', fontSize: 13, marginBottom: 24,
      }}>
        Revenue chart will appear here (Recharts)
      </div>

      {/* Time tracking */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
        Time Tracking
      </h2>
      <div style={{
        padding: 32, textAlign: 'center', borderRadius: 8,
        border: '1px dashed #222', color: 'rgba(255,255,255,0.2)', fontSize: 13,
      }}>
        Time logs appear as you work. YmShotS tracks editing, culling, and delivery time automatically.
      </div>
    </div>
  );
}

function BigStat({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 8,
      backgroundColor: '#111', border: '1px solid #1a1a1a',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? '#fff', marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
