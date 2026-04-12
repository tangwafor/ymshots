import React from 'react';

const ACCENT = '#E0943A';

export function InvoiceManager() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Invoices</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
        Send beautiful invoices. Get paid via Stripe. Track everything in LensBiz.
      </p>

      <button style={{
        padding: '10px 20px', borderRadius: 6, border: 'none',
        backgroundColor: ACCENT, color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', marginBottom: 24,
      }}>
        + New Invoice
      </button>

      <div style={{
        padding: 40, textAlign: 'center', borderRadius: 8,
        border: '1px dashed #222', color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
      }}>
        No invoices yet. Create one after delivering a gallery to get paid faster.
      </div>
    </div>
  );
}
