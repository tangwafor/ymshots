import React from 'react';
import { useEditStore } from '../../stores/editStore';
import { useAppStore } from '../../stores/appStore';
import { DEFAULT_EDIT_STATE } from '@ymshots/types';

const ACCENT = '#E0943A';

export function EditWorkspace() {
  const { editingPhotoId, setView } = useAppStore();
  const { current, updateField, reset, isComparing } = useEditStore();

  if (!editingPhotoId) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)', fontSize: 14,
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 8 }}>No photo selected</p>
          <button onClick={() => setView('vault')} style={{
            padding: '8px 20px', borderRadius: 5, border: 'none',
            backgroundColor: ACCENT, color: '#fff', fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Go to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Canvas area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          width: '70%', aspectRatio: '3/2', borderRadius: 4,
          backgroundColor: isComparing ? '#1a1a1a' : '#111',
          border: '1px solid #222',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'rgba(255,255,255,0.2)',
        }}>
          {isComparing ? 'BEFORE' : 'Preview (RawPulse pipeline)'}
        </div>

        {/* SignatureAI panel — dormant state (no train button, just progress) */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          padding: '10px 14px', borderRadius: 8,
          backgroundColor: '#111', border: '1px solid #1a1a1a',
          fontSize: 11,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>SignatureAI</div>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Your style is being noticed.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #222', position: 'relative' }}>
              <svg width="40" height="40" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="20" cy="20" r="17" fill="none" stroke="#222" strokeWidth="2" />
                <circle cx="20" cy="20" r="17" fill="none" stroke={ACCENT} strokeWidth="2"
                  strokeDasharray={`${(0 / 10) * 107} 107`} />
              </svg>
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, color: '#666' }}>0</span>
            </div>
            <span style={{ color: '#444', fontSize: 10 }}>0 / 10 pairs</span>
          </div>
        </div>
      </div>

      {/* Right panel — sliders */}
      <div style={{
        width: 280, borderLeft: '1px solid #1a1a1a',
        overflowY: 'auto', padding: '12px 0',
      }}>
        {/* Tone */}
        <PanelSection title="Tone" engine="RawPulse">
          <Slider label="Exposure" value={current.exposure} min={-5} max={5} step={0.1}
            onChange={v => updateField('exposure', v)} />
          <Slider label="Highlights" value={current.highlights} min={-100} max={100}
            onChange={v => updateField('highlights', v)} />
          <Slider label="Shadows" value={current.shadows} min={-100} max={100}
            onChange={v => updateField('shadows', v)} />
          <Slider label="Whites" value={current.whites} min={-100} max={100}
            onChange={v => updateField('whites', v)} />
          <Slider label="Blacks" value={current.blacks} min={-100} max={100}
            onChange={v => updateField('blacks', v)} />
          <Slider label="Contrast" value={current.contrast} min={-100} max={100}
            onChange={v => updateField('contrast', v)} />
          <Slider label="Clarity" value={current.clarity} min={-100} max={100}
            onChange={v => updateField('clarity', v)} />
          <Slider label="Vibrance" value={current.vibrance} min={-100} max={100}
            onChange={v => updateField('vibrance', v)} />
          <Slider label="Saturation" value={current.saturation} min={-100} max={100}
            onChange={v => updateField('saturation', v)} />
        </PanelSection>

        {/* Color */}
        <PanelSection title="Color" engine="ChromaDesk">
          <Slider label="Temperature" value={current.temperature} min={2000} max={16000} step={100}
            onChange={v => updateField('temperature', v)} />
          <Slider label="Tint" value={current.tint} min={-150} max={150}
            onChange={v => updateField('tint', v)} />
        </PanelSection>

        {/* Detail */}
        <PanelSection title="Detail">
          <Slider label="Sharpening" value={current.sharpening} min={0} max={150}
            onChange={v => updateField('sharpening', v)} />
          <Slider label="Noise Reduction" value={current.noiseReduction} min={0} max={100}
            onChange={v => updateField('noiseReduction', v)} />
        </PanelSection>

        {/* GrainLab */}
        <PanelSection title="Film Grain" engine="GrainLab">
          <Slider label="Amount" value={current.grainAmount} min={0} max={100}
            onChange={v => updateField('grainAmount', v)} />
          <Slider label="Size" value={current.grainSize} min={0} max={100}
            onChange={v => updateField('grainSize', v)} />
          <Slider label="Roughness" value={current.grainRoughness} min={0} max={100}
            onChange={v => updateField('grainRoughness', v)} />
        </PanelSection>

        {/* Reset */}
        <div style={{ padding: '12px 16px' }}>
          <button onClick={reset} style={{
            width: '100%', padding: '8px', borderRadius: 5,
            border: '1px solid #333', backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer',
          }}>
            Reset all to default
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel section ───
function PanelSection({ title, engine, children }: {
  title: string; engine?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ borderBottom: '1px solid #111' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '8px 16px', border: 'none', cursor: 'pointer',
        backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 11,
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        <span>
          {title}
          {engine && <span style={{ color: ACCENT, fontWeight: 400, marginLeft: 6, fontSize: 9 }}>{engine}</span>}
        </span>
        <span style={{ fontSize: 8 }}>{open ? '\u25BC' : '\u25B6'}</span>
      </button>
      {open && <div style={{ padding: '0 16px 8px' }}>{children}</div>}
    </div>
  );
}

// ─── Slider ───
function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const isDefault = value === (min === 0 ? 0 : (min + max) / 2) || value === 0 || value === 5500;

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
        <span
          style={{ color: isDefault ? 'rgba(255,255,255,0.2)' : ACCENT, cursor: 'pointer', fontSize: 10 }}
          onDoubleClick={() => onChange(min === -5 ? 0 : min === 2000 ? 5500 : 0)}
        >
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 3,
          appearance: 'none', WebkitAppearance: 'none',
          background: `linear-gradient(to right, ${ACCENT} ${pct}%, #222 ${pct}%)`,
          borderRadius: 2, outline: 'none', cursor: 'pointer',
        }}
      />
    </div>
  );
}
