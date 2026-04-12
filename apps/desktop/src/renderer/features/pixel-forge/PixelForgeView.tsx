import React, { useState } from 'react';

const ACCENT = '#E0943A';

interface Layer {
  id: string;
  name: string;
  type: 'ADJUSTMENT' | 'MASK' | 'STAMP' | 'HEALING' | 'TEXT';
  blendMode: string;
  opacity: number;
  visible: boolean;
}

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'difference', 'luminosity', 'color'];

export function PixelForgeView() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Background', type: 'ADJUSTMENT', blendMode: 'normal', opacity: 1, visible: true },
  ]);
  const [selectedLayer, setSelectedLayer] = useState('1');
  const [activeTool, setActiveTool] = useState<'move' | 'heal' | 'clone' | 'brush' | 'text'>('move');

  const addLayer = (type: Layer['type']) => {
    const id = String(Date.now());
    setLayers([...layers, {
      id, name: `${type} ${layers.length + 1}`,
      type, blendMode: 'normal', opacity: 1, visible: true,
    }]);
    setSelectedLayer(id);
  };

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Canvas area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tool bar */}
        <div style={{
          padding: '6px 12px', borderBottom: '1px solid #1a1a1a',
          display: 'flex', gap: 4,
        }}>
          {(['move', 'heal', 'clone', 'brush', 'text'] as const).map(tool => (
            <button key={tool} onClick={() => setActiveTool(tool)} style={{
              padding: '5px 10px', borderRadius: 4, fontSize: 11,
              border: activeTool === tool ? `1px solid ${ACCENT}` : '1px solid #222',
              backgroundColor: activeTool === tool ? `${ACCENT}22` : 'transparent',
              color: activeTool === tool ? ACCENT : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {tool}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#080808',
        }}>
          <div style={{
            width: '70%', aspectRatio: '3/2', borderRadius: 4,
            backgroundColor: '#111', border: '1px solid #1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'rgba(255,255,255,0.15)',
          }}>
            PixelForge Canvas (Konva.js)
          </div>
        </div>
      </div>

      {/* Layers panel */}
      <div style={{
        width: 240, borderLeft: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '8px 12px', borderBottom: '1px solid #1a1a1a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>LAYERS</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <SmallBtn label="+" onClick={() => addLayer('ADJUSTMENT')} />
            <SmallBtn label="M" onClick={() => addLayer('MASK')} />
            <SmallBtn label="T" onClick={() => addLayer('TEXT')} />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {[...layers].reverse().map(layer => (
            <div
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              style={{
                padding: '8px 12px', borderBottom: '1px solid #111',
                backgroundColor: selectedLayer === layer.id ? '#1a1a1a' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)); }}
                style={{
                  background: 'none', border: 'none', fontSize: 10,
                  color: layer.visible ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                }}
              >
                {layer.visible ? '◉' : '○'}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{layer.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{layer.blendMode} · {Math.round(layer.opacity * 100)}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected layer controls */}
        {selectedLayer && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Blend Mode</span>
            </div>
            <select
              value={layers.find(l => l.id === selectedLayer)?.blendMode || 'normal'}
              onChange={(e) => setLayers(layers.map(l => l.id === selectedLayer ? { ...l, blendMode: e.target.value } : l))}
              style={{
                width: '100%', padding: '4px 6px', borderRadius: 4,
                border: '1px solid #333', backgroundColor: '#111',
                color: '#fff', fontSize: 11, marginBottom: 8,
              }}
            >
              {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Opacity</span>
              <span style={{ color: ACCENT }}>{Math.round((layers.find(l => l.id === selectedLayer)?.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.01}
              value={layers.find(l => l.id === selectedLayer)?.opacity ?? 1}
              onChange={(e) => setLayers(layers.map(l => l.id === selectedLayer ? { ...l, opacity: Number(e.target.value) } : l))}
              style={{ width: '100%', accentColor: ACCENT }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SmallBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 22, height: 22, borderRadius: 3, border: '1px solid #333',
      backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)',
      fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {label}
    </button>
  );
}
