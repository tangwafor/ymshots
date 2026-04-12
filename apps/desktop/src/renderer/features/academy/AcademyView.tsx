import React from 'react';

const ACCENT = '#E0943A';

const TRACKS = [
  { name: 'Beginner', lessons: 6, color: '#4CAF50', unlocked: true },
  { name: 'Intermediate', lessons: 9, color: '#FF9800', unlocked: false },
  { name: 'Advanced', lessons: 9, color: '#E0943A', unlocked: false },
  { name: 'Master', lessons: 6, color: '#7C4DFF', unlocked: false },
];

export function AcademyView() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>AcademyMode</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
        30 lessons. 4 tracks. Learn photography editing at the exact moment you need it.
      </p>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <MiniStat label="XP" value="0" />
        <MiniStat label="Streak" value="0 days" />
        <MiniStat label="Completed" value="0 / 30" />
        <MiniStat label="Level" value="Beginner" color="#4CAF50" />
      </div>

      {/* Tracks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TRACKS.map(track => (
          <div key={track.name} style={{
            padding: 16, borderRadius: 8, backgroundColor: '#111',
            border: '1px solid #1a1a1a', opacity: track.unlocked ? 1 : 0.5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: track.color }}>{track.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>{track.lessons} lessons</span>
              </div>
              {!track.unlocked && (
                <span style={{ fontSize: 10, color: '#444', padding: '2px 8px', borderRadius: 3, border: '1px solid #333' }}>
                  Locked
                </span>
              )}
            </div>
            {track.unlocked && (
              <div style={{ marginTop: 8, height: 3, borderRadius: 2, backgroundColor: '#222' }}>
                <div style={{ width: '0%', height: '100%', borderRadius: 2, backgroundColor: track.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: '8px 14px', borderRadius: 6, backgroundColor: '#111', border: '1px solid #1a1a1a' }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color ?? '#fff', marginTop: 2 }}>{value}</div>
    </div>
  );
}
