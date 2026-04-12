import React, { useState } from 'react';
import { useEditStore } from '../../stores/editStore';
import type { HslAdjustments } from '@ymshots/types';

const ACCENT = '#E0943A';
const HSL_CHANNELS = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'] as const;
const CHANNEL_COLORS: Record<string, string> = {
  red: '#ff4444', orange: '#ff8833', yellow: '#ffcc00', green: '#44cc44',
  aqua: '#44cccc', blue: '#4488ff', purple: '#8844ff', magenta: '#cc44cc',
};

export function ChromaDeskView() {
  const { current, updateField } = useEditStore();
  const [activeTab, setActiveTab] = useState<'hsl' | 'curves' | 'wheels'>('hsl');

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Preview */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#080808',
      }}>
        <div style={{
          width: '65%', aspectRatio: '3/2', borderRadius: 4,
          backgroundColor: '#111', border: '1px solid #1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: 'rgba(255,255,255,0.15)',
        }}>
          ChromaDesk Preview
        </div>
      </div>

      {/* Controls panel */}
      <div style={{ width: 300, borderLeft: '1px solid #1a1a1a', overflow: 'auto' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #1a1a1a',
        }}>
          {(['hsl', 'curves', 'wheels'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px', border: 'none', fontSize: 11,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: activeTab === tab ? ACCENT : 'rgba(255,255,255,0.3)',
              borderBottom: activeTab === tab ? `2px solid ${ACCENT}` : '2px solid transparent',
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* HSL Panel */}
        {activeTab === 'hsl' && (
          <div style={{ padding: '12px 16px' }}>
            {HSL_CHANNELS.map(channel => (
              <div key={channel} style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: CHANNEL_COLORS[channel],
                  textTransform: 'capitalize', marginBottom: 6,
                }}>
                  {channel}
                </div>
                {(['hue', 'saturation', 'luminance'] as const).map(prop => {
                  const value = (current.hsl as any)[channel][prop];
                  const min = prop === 'hue' ? -30 : -100;
                  const max = prop === 'hue' ? 30 : 100;
                  return (
                    <div key={prop} style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                        <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>{prop}</span>
                        <span style={{ color: value !== 0 ? ACCENT : 'rgba(255,255,255,0.2)' }}>{value}</span>
                      </div>
                      <input
                        type="range" min={min} max={max} value={value}
                        onChange={(e) => {
                          const newHsl = { ...current.hsl } as any;
                          newHsl[channel] = { ...newHsl[channel], [prop]: Number(e.target.value) };
                          updateField('hsl', newHsl);
                        }}
                        style={{ width: '100%', height: 2, accentColor: CHANNEL_COLORS[channel] }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Tone Curves Panel */}
        {activeTab === 'curves' && (
          <div style={{ padding: '16px' }}>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: 6,
              backgroundColor: '#0A0A0A', border: '1px solid #1a1a1a',
              position: 'relative', marginBottom: 12,
            }}>
              {/* Grid lines */}
              <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                {[0.25, 0.5, 0.75].map(t => (
                  <React.Fragment key={t}>
                    <line x1={`${t * 100}%`} y1="0" x2={`${t * 100}%`} y2="100%" stroke="#1a1a1a" />
                    <line x1="0" y1={`${t * 100}%`} x2="100%" y2={`${t * 100}%`} stroke="#1a1a1a" />
                  </React.Fragment>
                ))}
                {/* Diagonal (identity line) */}
                <line x1="0" y1="100%" x2="100%" y2="0" stroke="#333" strokeDasharray="4" />
                {/* Curve visualization */}
                <polyline
                  points={current.toneCurve.rgb.map(p => `${(p.x / 255) * 100}%,${(1 - p.y / 255) * 100}%`).join(' ')}
                  fill="none" stroke={ACCENT} strokeWidth="2"
                />
              </svg>
              <div style={{
                position: 'absolute', bottom: 8, right: 8,
                fontSize: 10, color: 'rgba(255,255,255,0.2)',
              }}>
                Click to add points (Konva in full build)
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
              RGB · Red · Green · Blue channels
            </div>
          </div>
        )}

        {/* Color Wheels Panel */}
        {activeTab === 'wheels' && (
          <div style={{ padding: '16px' }}>
            {(['shadows', 'midtones', 'highlights'] as const).map(range => (
              <div key={range} style={{ marginBottom: 20, textAlign: 'center' }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                  textTransform: 'capitalize', marginBottom: 8,
                }}>
                  {range}
                </div>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
                  border: '2px solid #222',
                  background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  opacity: 0.5, position: 'relative', cursor: 'pointer',
                }}>
                  {/* Center dot (current position) */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: '#fff', border: '1px solid #000',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                  H: {(current.colorWheels as any)[range].hue} · S: {(current.colorWheels as any)[range].saturation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
