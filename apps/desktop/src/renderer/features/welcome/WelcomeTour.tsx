import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';

const ACCENT = '#E0943A';

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: TourStep[] = [
  {
    title: 'Import your first shoot',
    description: 'Drag a folder of photos or connect your camera. YmShotS reads RAW, JPEG, HEIF, PNG — all at once. Your originals are never modified.',
    icon: '\u25A6',
  },
  {
    title: 'Cull with confidence',
    description: 'Flag your best shots with P, reject with X. Let SharpEye AI score focus, faces, and expressions to help you pick faster.',
    icon: '\u2713',
  },
  {
    title: 'Edit your way',
    description: 'RawPulse handles exposure, tone, and detail. ChromaDesk does color grading. GlowKit retouches skin. Every edit is non-destructive.',
    icon: '\u25CE',
  },
  {
    title: 'Let SignatureAI learn your eye',
    description: 'Every edit you save teaches your personal AI. After 10 photos, your style fingerprint appears. After 50, one click edits everything like you.',
    icon: '\u2661',
  },
  {
    title: 'Deliver to your clients',
    description: 'Create a GalleryBox gallery — dark, elegant, your brand everywhere. Clients tap hearts to select favourites. You get notified in real time.',
    icon: '\u25A1',
  },
  {
    title: 'Get paid and grow',
    description: 'Send PayShot invoices, track revenue in LensBiz, and level up your skills in AcademyMode. Your whole business, one place.',
    icon: '\u2605',
  },
];

export function WelcomeTour() {
  const [step, setStep] = useState(0);
  const { setView } = useAppStore();

  const finish = () => setView('vault');
  const current = STEPS[step];

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0A0A0A', color: '#fff', padding: 40,
    }}>
      {/* Step indicator */}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 32, letterSpacing: '0.1em' }}>
        STEP {step + 1} OF {STEPS.length}
      </div>

      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        border: `2px solid ${ACCENT}33`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 24,
      }}>
        {current.icon}
      </div>

      {/* Content */}
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
        {current.title}
      </div>
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
        maxWidth: 440, textAlign: 'center', marginBottom: 40,
      }}>
        {current.description}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{
            padding: '10px 24px', borderRadius: 6, border: '1px solid #333',
            backgroundColor: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, cursor: 'pointer',
          }}>
            Back
          </button>
        )}
        <button onClick={step < STEPS.length - 1 ? () => setStep(step + 1) : finish} style={{
          padding: '10px 28px', borderRadius: 6, border: 'none',
          backgroundColor: ACCENT, color: '#fff', fontSize: 13,
          fontWeight: 600, cursor: 'pointer',
        }}>
          {step < STEPS.length - 1 ? 'Next' : 'Start shooting'}
        </button>
      </div>

      {/* Skip */}
      <button onClick={finish} style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
        fontSize: 11, cursor: 'pointer', marginTop: 20,
      }}>
        Skip tour
      </button>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 16 : 6, height: 6, borderRadius: 3,
            backgroundColor: i === step ? ACCENT : '#333',
            transition: 'all 0.3s', cursor: 'pointer',
          }} onClick={() => setStep(i)} />
        ))}
      </div>
    </div>
  );
}
