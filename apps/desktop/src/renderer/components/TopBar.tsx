import React from 'react';
import { useAppStore } from '../stores/appStore';
import { useEditStore } from '../stores/editStore';
import { CreatorSignature } from './CreatorSignature';

export function TopBar() {
  const { currentView, selectedPhotoIds, editingPhotoId, activeShootId } = useAppStore();
  const { canUndo, canRedo, undo, redo, isComparing, setComparing } = useEditStore();

  const viewLabels: Record<string, string> = {
    vault: 'Library', edit: 'Edit', gallery: 'Galleries',
    invoices: 'Invoices', academy: 'Academy', 'lens-biz': 'Analytics',
    settings: 'Settings', admin: 'Admin Dashboard', about: 'About',
    pitch: 'Welcome', welcome: 'Getting Started',
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', height: 40,
      borderBottom: '1px solid #1a1a1a',
      backgroundColor: '#0A0A0A',
      WebkitAppRegion: 'drag' as any,
      fontSize: 12,
    }}>
      {/* Left: view name + context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, WebkitAppRegion: 'no-drag' as any }}>
        <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          {viewLabels[currentView] ?? currentView}
        </span>
        {currentView === 'vault' && selectedPhotoIds.length > 0 && (
          <span style={{ color: '#E0943A', fontSize: 11 }}>
            {selectedPhotoIds.length} selected
          </span>
        )}
        {currentView === 'edit' && editingPhotoId && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            Editing photo
          </span>
        )}
      </div>

      {/* Center: edit controls (only in edit view) */}
      {currentView === 'edit' && (
        <div style={{ display: 'flex', gap: 6, WebkitAppRegion: 'no-drag' as any }}>
          <ToolBtn label="Undo" shortcut="Ctrl+Z" disabled={!canUndo()} onClick={undo} />
          <ToolBtn label="Redo" shortcut="Ctrl+Shift+Z" disabled={!canRedo()} onClick={redo} />
          <div style={{ width: 1, backgroundColor: '#222', margin: '0 4px' }} />
          <ToolBtn
            label={isComparing ? 'After' : 'Before'}
            shortcut="Space"
            active={isComparing}
            onClick={() => setComparing(!isComparing)}
          />
        </div>
      )}

      {/* Right: creator signature */}
      <div style={{ WebkitAppRegion: 'no-drag' as any }}>
        <CreatorSignature placement="titlebar" />
      </div>
    </header>
  );
}

function ToolBtn({ label, shortcut, disabled, active, onClick }: {
  label: string; shortcut?: string; disabled?: boolean; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      style={{
        padding: '3px 10px', borderRadius: 4, fontSize: 11,
        border: '1px solid #222', cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#333' : active ? '#E0943A' : 'rgba(255,255,255,0.5)',
        backgroundColor: active ? '#E0943A15' : 'transparent',
      }}
    >
      {label}
    </button>
  );
}
