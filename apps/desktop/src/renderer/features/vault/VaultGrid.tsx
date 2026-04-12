import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';

const ACCENT = '#E0943A';

export function VaultGrid() {
  const { activeShootId, setActiveShoot, setView, setEditingPhoto } = useAppStore();
  const [isDragOver, setIsDragOver] = useState(false);

  // Placeholder — no real photos yet. Show import UI.
  const hasShoot = !!activeShootId;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <ToolBtn label="Import" icon="\u2795" primary onClick={() => {/* TODO: trigger import */}} />
          <ToolBtn label="Grid" icon="\u25A6" active />
          <ToolBtn label="Loupe" icon="\u25CB" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ToolBtn label="Flag (P)" icon="\u2691" />
          <ToolBtn label="Reject (X)" icon="\u2717" />
          <ToolBtn label="SharpEye AI" icon="\u2606" />
        </div>
      </div>

      {/* Grid / Import area */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {!hasShoot ? (
          <ImportDropZone isDragOver={isDragOver} setIsDragOver={setIsDragOver} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 8,
          }}>
            {/* Placeholder thumbnails */}
            {Array.from({ length: 24 }, (_, i) => (
              <PhotoThumbnail
                key={i}
                index={i}
                onDoubleClick={() => {
                  setEditingPhoto(`photo-${i}`);
                  setView('edit');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar: keyboard shortcuts hint */}
      <div style={{
        padding: '6px 16px', borderTop: '1px solid #1a1a1a',
        fontSize: 10, color: 'rgba(255,255,255,0.2)',
        display: 'flex', gap: 16,
      }}>
        <span>P Flag</span>
        <span>X Reject</span>
        <span>1-5 Rate</span>
        <span>E Edit</span>
        <span>Space Before/After</span>
        <span>Cmd+E Export</span>
      </div>
    </div>
  );
}

function ImportDropZone({ isDragOver, setIsDragOver }: {
  isDragOver: boolean; setIsDragOver: (v: boolean) => void;
}) {
  const { setActiveShoot } = useAppStore();

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        // TODO: handle file drop, trigger import via IPC
        setActiveShoot('demo-shoot');
      }}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        border: `2px dashed ${isDragOver ? ACCENT : '#222'}`,
        borderRadius: 12, transition: 'all 0.2s',
        backgroundColor: isDragOver ? '#E0943A08' : 'transparent',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16, color: isDragOver ? ACCENT : '#333' }}>
        {'\u25A6'}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
        Import your first shoot
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
        Drag a folder here, or click to browse
      </div>
      <button
        onClick={() => setActiveShoot('demo-shoot')}
        style={{
          padding: '10px 24px', borderRadius: 6, border: 'none',
          backgroundColor: ACCENT, color: '#fff', fontSize: 13,
          fontWeight: 600, cursor: 'pointer',
        }}
      >
        Browse files
      </button>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>
        Supports RAW, JPEG, HEIF, PNG, TIFF
      </div>
    </div>
  );
}

function PhotoThumbnail({ index, onDoubleClick }: { index: number; onDoubleClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={onDoubleClick}
      style={{
        aspectRatio: '3/2', borderRadius: 4, overflow: 'hidden',
        backgroundColor: `hsl(${(index * 37) % 360}, 15%, ${12 + (index % 5) * 2}%)`,
        border: '1px solid #1a1a1a', cursor: 'pointer',
        position: 'relative', transition: 'transform 0.1s',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Placeholder pattern */}
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: 'rgba(255,255,255,0.15)',
      }}>
        DSC_{String(index + 1).padStart(4, '0')}
      </div>
      {/* Star rating placeholder */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 4, left: 4,
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
        }}>
          {'★'.repeat(Math.floor(Math.random() * 3) + 3)}
        </div>
      )}
    </div>
  );
}

function ToolBtn({ label, icon, primary, active, onClick }: {
  label: string; icon: string; primary?: boolean; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '5px 10px', borderRadius: 4, fontSize: 11,
      border: primary ? 'none' : '1px solid #222',
      backgroundColor: primary ? ACCENT : active ? '#1a1a1a' : 'transparent',
      color: primary ? '#fff' : active ? '#fff' : 'rgba(255,255,255,0.4)',
      cursor: 'pointer',
    }}>
      <span>{icon}</span> {label}
    </button>
  );
}
