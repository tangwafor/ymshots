import React, { useState } from 'react';
import { computeConfidence, type SignatureAIState } from '@ymshots/types';

const ACCENT = '#E0943A';

/**
 * SignatureAI Panel — The 5 emotional states from CLAUDE.md.
 *
 * State 1: Dormant (0–9)     — Quiet. Progress ring. No train button.
 * State 2: Learning (10–29)  — Fingerprint bars animate in.
 * State 3: Forming (30–49)   — Style card + "Apply my style" button.
 * State 4: Confident (50–99) — Batch apply unlocked.
 * State 5: Expert (100+)     — Full milestone. Style export card.
 */
export function SignatureAIPanel() {
  // In real app, this comes from the user's profile via API
  const [pairCount, setPairCount] = useState(0);
  const confidence = computeConfidence(pairCount);

  return (
    <div style={{ padding: 16 }}>
      {confidence.state === 'dormant' && <DormantState pairCount={pairCount} />}
      {confidence.state === 'learning' && <LearningState pairCount={pairCount} confidence={confidence} />}
      {confidence.state === 'forming' && <FormingState pairCount={pairCount} confidence={confidence} />}
      {confidence.state === 'confident' && <ConfidentState pairCount={pairCount} confidence={confidence} />}
      {confidence.state === 'expert' && <ExpertState pairCount={pairCount} confidence={confidence} />}
    </div>
  );
}

// ─── State 1: Dormant ───
function DormantState({ pairCount }: { pairCount: number }) {
  const pct = (pairCount / 10) * 100;
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>SignatureAI</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
        Edit your photos as you normally would. Your style is being noticed.
      </div>
      {/* Progress ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1a1a1a" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={ACCENT} strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 126} 126`}
            strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{pairCount}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>of 10 edit pairs</div>
        </div>
      </div>
      {/* NO train button — absence, not disabled */}
    </div>
  );
}

// ─── State 2: Learning ───
function LearningState({ pairCount, confidence }: { pairCount: number; confidence: ReturnType<typeof computeConfidence> }) {
  const fingerprint = { warmth: 62, contrast: 45, clarity: 38, shadowLift: 55 };
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>SignatureAI</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Your eye is forming.</div>
      {/* Fingerprint bars */}
      {Object.entries(fingerprint).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
            <span style={{ color: ACCENT }}>{value}</span>
          </div>
          <div style={{ height: 3, borderRadius: 2, backgroundColor: '#1a1a1a' }}>
            <div style={{
              width: `${value}%`, height: '100%', borderRadius: 2, backgroundColor: ACCENT,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>{pairCount} / 30 pairs</div>
    </div>
  );
}

// ─── State 3: Forming ───
function FormingState({ pairCount, confidence }: { pairCount: number; confidence: ReturnType<typeof computeConfidence> }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>SignatureAI</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Your style is defined.</div>

      {/* Style card */}
      <div style={{
        padding: 12, borderRadius: 8, backgroundColor: '#111',
        border: `1px solid ${ACCENT}33`, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {['Warm', 'Soft contrast', 'Natural', 'Matte shadows'].map(word => (
            <span key={word} style={{
              padding: '2px 8px', borderRadius: 3, fontSize: 10,
              backgroundColor: `${ACCENT}22`, color: ACCENT,
            }}>{word}</span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          After {pairCount} edits, your style is defined.
        </div>
      </div>

      {/* Apply button */}
      <button style={{
        width: '100%', padding: '10px', borderRadius: 6, border: 'none',
        backgroundColor: ACCENT, color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer',
      }}>
        Apply my style
      </button>
    </div>
  );
}

// ─── State 4: Confident ───
function ConfidentState({ pairCount, confidence }: { pairCount: number; confidence: ReturnType<typeof computeConfidence> }) {
  const accuracy = Math.round(78 + (pairCount - 50) * 0.2);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>SignatureAI</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
        SignatureAI knows your eye.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <MiniStat label="Pairs" value={String(pairCount)} />
        <MiniStat label="Accuracy" value={`${accuracy}%`} />
        <MiniStat label="Styled" value="0" />
      </div>

      {/* Apply to selection */}
      <button style={{
        width: '100%', padding: '10px', borderRadius: 6, border: 'none',
        backgroundColor: ACCENT, color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', marginBottom: 8,
      }}>
        Apply my style to selection
      </button>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        Select photos in VaultGrid, then tap here. One click.
      </div>
    </div>
  );
}

// ─── State 5: Expert ───
function ExpertState({ pairCount, confidence }: { pairCount: number; confidence: ReturnType<typeof computeConfidence> }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>SignatureAI — Expert</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
        Your eye is fully known.
      </div>

      {/* Style export card */}
      <div style={{
        padding: 16, borderRadius: 8, backgroundColor: '#111',
        border: `1px solid ${ACCENT}44`, marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Your Visual Identity</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
          {['Warm', 'Soft contrast', 'Natural', 'Matte shadows'].map(word => (
            <span key={word} style={{
              padding: '2px 8px', borderRadius: 3, fontSize: 10,
              backgroundColor: `${ACCENT}22`, color: ACCENT,
            }}>{word}</span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          {pairCount} edits trained • 100% confidence
        </div>
      </div>

      <button style={{
        width: '100%', padding: '10px', borderRadius: 6, border: 'none',
        backgroundColor: ACCENT, color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', marginBottom: 8,
      }}>
        Apply my style to selection
      </button>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, padding: '8px', borderRadius: 5, border: '1px solid #333',
          backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)',
          fontSize: 11, cursor: 'pointer',
        }}>
          Export style card
        </button>
        <button style={{
          flex: 1, padding: '8px', borderRadius: 5, border: '1px solid #333',
          backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)',
          fontSize: 11, cursor: 'pointer',
        }}>
          New shoot profile
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '6px 8px', borderRadius: 4,
      backgroundColor: '#111', border: '1px solid #1a1a1a',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{label}</div>
    </div>
  );
}
