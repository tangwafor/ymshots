import React, { useState } from 'react';

const ACCENT = '#E0943A';

export function LiveTetherView() {
  const [connected, setConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'USB' | 'WIFI'>('USB');
  const [photosReceived, setPhotosReceived] = useState(0);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>LiveTether</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
        Connect your camera and see photos appear live as you shoot.
      </p>

      {!connected ? (
        <div style={{
          padding: 40, textAlign: 'center', borderRadius: 12,
          border: '2px dashed #222', maxWidth: 400, margin: '0 auto',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#333' }}>{'\u{1F4F7}'}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            No camera connected
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24, lineHeight: 1.7 }}>
            Connect via USB cable or Wi-Fi. YmShotS will detect your camera automatically.
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {(['USB', 'WIFI'] as const).map(type => (
              <button key={type} onClick={() => setConnectionType(type)} style={{
                padding: '8px 20px', borderRadius: 5, fontSize: 12,
                border: connectionType === type ? `1px solid ${ACCENT}` : '1px solid #333',
                backgroundColor: connectionType === type ? `${ACCENT}22` : 'transparent',
                color: connectionType === type ? ACCENT : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}>
                {type === 'USB' ? 'USB Cable' : 'Wi-Fi'}
              </button>
            ))}
          </div>

          <button onClick={() => setConnected(true)} style={{
            padding: '10px 24px', borderRadius: 6, border: 'none',
            backgroundColor: ACCENT, color: '#fff', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Scan for cameras
          </button>
        </div>
      ) : (
        <div>
          {/* Connected state */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 8,
            backgroundColor: '#111', border: `1px solid ${ACCENT}33`,
            marginBottom: 24,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Camera Connected</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {connectionType} · {photosReceived} photos received
              </div>
            </div>
            <button onClick={() => setConnected(false)} style={{
              marginLeft: 'auto', padding: '6px 12px', borderRadius: 4,
              border: '1px solid #333', backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer',
            }}>
              Disconnect
            </button>
          </div>

          {/* Live photo grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 8,
          }}>
            {photosReceived === 0 && (
              <div style={{
                gridColumn: '1 / -1', padding: 40, textAlign: 'center',
                color: 'rgba(255,255,255,0.2)', fontSize: 13,
              }}>
                Waiting for photos... Take a shot and it appears here instantly.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
