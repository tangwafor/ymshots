import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';

const ACCENT = '#E0943A';

interface Effect {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

const EFFECTS: Effect[] = [
  { id: 'CARTOON',          name: 'Cartoon',       description: 'Bold outlines, flat colors',       category: 'illustration', icon: '\u{1F3A8}' },
  { id: 'COMIC',            name: 'Comic Book',    description: 'Halftone dots, bold shadows',      category: 'illustration', icon: '\u{1F4A5}' },
  { id: 'WATERCOLOR',       name: 'Watercolor',    description: 'Soft washes, paper texture',       category: 'painting',     icon: '\u{1F308}' },
  { id: 'OIL_PAINTING',     name: 'Oil Painting',  description: 'Rich brushstrokes, deep color',    category: 'painting',     icon: '\u{1F5BC}' },
  { id: 'PENCIL_SKETCH',    name: 'Pencil Sketch', description: 'Graphite lines, subtle shading',   category: 'drawing',      icon: '\u{270F}' },
  { id: 'CHARCOAL',         name: 'Charcoal',      description: 'Deep blacks, textured strokes',    category: 'drawing',      icon: '\u{1F311}' },
  { id: 'POP_ART',          name: 'Pop Art',       description: 'Warhol-inspired color blocks',     category: 'artistic',     icon: '\u{1F308}' },
  { id: 'THREE_D_CHARACTER', name: '3D Character', description: 'Pixar-style 3D rendering',         category: 'artistic',     icon: '\u{1F9CA}' },
  { id: 'ANIME',            name: 'Anime',         description: 'Japanese animation style',         category: 'illustration', icon: '\u{2B50}' },
  { id: 'CARICATURE',       name: 'Caricature',    description: 'Exaggerated features, playful',    category: 'artistic',     icon: '\u{1F60E}' },
  { id: 'MOSAIC',           name: 'Mosaic',        description: 'Tile pattern reconstruction',      category: 'artistic',     icon: '\u{1F4A0}' },
  { id: 'NEON_GLOW',        name: 'Neon Glow',     description: 'Glowing edges on dark',            category: 'artistic',     icon: '\u{1F4A1}' },
];

const CATEGORIES = ['all', 'illustration', 'painting', 'drawing', 'artistic'];

export function StyleForgeView() {
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [intensity, setIntensity] = useState(1.0);
  const { editingPhotoId, setView } = useAppStore();

  const filtered = category === 'all' ? EFFECTS : EFFECTS.filter(e => e.category === category);
  const activeEffect = EFFECTS.find(e => e.id === selectedEffect);

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Effect picker */}
      <div style={{ width: 300, borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>StyleForge</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
            AI creative effects — all processed on-device
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '3px 10px', borderRadius: 4, fontSize: 10,
                border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                backgroundColor: category === cat ? `${ACCENT}33` : 'transparent',
                color: category === cat ? ACCENT : 'rgba(255,255,255,0.3)',
              }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Effect grid */}
        <div style={{
          flex: 1, overflow: 'auto', padding: 8,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 6, alignContent: 'start',
        }}>
          {filtered.map(effect => (
            <button
              key={effect.id}
              onClick={() => setSelectedEffect(effect.id)}
              style={{
                padding: '12px 10px', borderRadius: 6, border: 'none',
                backgroundColor: selectedEffect === effect.id ? `${ACCENT}22` : '#111',
                borderLeft: selectedEffect === effect.id ? `2px solid ${ACCENT}` : '2px solid transparent',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{effect.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: selectedEffect === effect.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                {effect.name}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                {effect.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview + controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Preview area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {!editingPhotoId ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>Select a photo first</div>
              <button onClick={() => setView('vault')} style={{
                padding: '8px 20px', borderRadius: 5, border: 'none',
                backgroundColor: ACCENT, color: '#fff', fontSize: 12,
                fontWeight: 600, cursor: 'pointer',
              }}>
                Go to Library
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {/* Original */}
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textAlign: 'center' }}>Original</div>
                <div style={{
                  width: 280, aspectRatio: '3/2', borderRadius: 6,
                  backgroundColor: '#1a1a1a', border: '1px solid #222',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'rgba(255,255,255,0.15)',
                }}>
                  Photo preview
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 20, color: '#333' }}>{'\u2192'}</div>

              {/* Effect result */}
              <div>
                <div style={{ fontSize: 10, color: ACCENT, marginBottom: 4, textAlign: 'center' }}>
                  {activeEffect?.name ?? 'Select an effect'}
                </div>
                <div style={{
                  width: 280, aspectRatio: '3/2', borderRadius: 6,
                  backgroundColor: selectedEffect ? '#111' : '#0d0d0d',
                  border: `1px solid ${selectedEffect ? ACCENT + '44' : '#222'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'rgba(255,255,255,0.15)',
                }}>
                  {selectedEffect ? `${activeEffect?.name} preview` : 'Effect preview'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        {selectedEffect && editingPhotoId && (
          <div style={{
            padding: '12px 24px', borderTop: '1px solid #1a1a1a',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Intensity</span>
                <span style={{ color: ACCENT }}>{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.05}
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                style={{ width: '100%', accentColor: ACCENT }}
              />
            </div>
            <button style={{
              padding: '10px 24px', borderRadius: 6, border: 'none',
              backgroundColor: ACCENT, color: '#fff', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
            }}>
              Apply {activeEffect?.name}
            </button>
            <button style={{
              padding: '10px 20px', borderRadius: 6,
              border: '1px solid #333', backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer',
            }}>
              Save as preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
