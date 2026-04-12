import React from 'react';

const ACCENT = '#E0943A';

export function GalleryManager() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Galleries</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
        Create and manage client delivery galleries. Dark. Elegant. Your brand everywhere.
      </p>

      <button style={{
        padding: '10px 20px', borderRadius: 6, border: 'none',
        backgroundColor: ACCENT, color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', marginBottom: 24,
      }}>
        + New Gallery
      </button>

      <div style={{
        padding: 40, textAlign: 'center', borderRadius: 8,
        border: '1px dashed #222', color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
      }}>
        No galleries yet. Import a shoot, then create a gallery from your flagged photos.
      </div>
    </div>
  );
}
