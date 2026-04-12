import React, { useState } from 'react';

const ACCENT = '#E0943A';

interface Lesson {
  slug: string;
  title: string;
  description: string;
  xpReward: number;
  steps: Array<{
    stepNumber: number;
    title: string;
    instruction: string;
    animationHint: string;
  }>;
  tip: string;
}

export function LessonPlayer({ lesson, onComplete, onClose }: {
  lesson: Lesson;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep >= lesson.steps.length - 1;
  const step = lesson.steps[currentStep];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 480, maxHeight: '80vh', borderRadius: 12,
        backgroundColor: '#111', border: '1px solid #222',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #1a1a1a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{lesson.title}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              Step {currentStep + 1} of {lesson.steps.length} · {lesson.xpReward} XP
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            fontSize: 18, cursor: 'pointer',
          }}>×</button>
        </div>

        {/* Step content */}
        {step && (
          <div style={{ padding: '24px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: ACCENT }}>
              {step.title}
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
            }}>
              {step.instruction}
            </div>

            {/* Spotlight area placeholder */}
            <div style={{
              marginTop: 16, height: 120, borderRadius: 8,
              backgroundColor: '#0A0A0A', border: '1px dashed #222',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'rgba(255,255,255,0.15)',
            }}>
              Interactive spotlight: {step.animationHint}
            </div>
          </div>
        )}

        {/* Tip (shows on last step) */}
        {isLastStep && lesson.tip && (
          <div style={{
            margin: '0 20px 16px', padding: 12, borderRadius: 6,
            backgroundColor: `${ACCENT}11`, border: `1px solid ${ACCENT}33`,
            fontSize: 12, color: ACCENT,
          }}>
            Pro tip: {lesson.tip}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #1a1a1a',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              padding: '8px 16px', borderRadius: 5, border: '1px solid #333',
              backgroundColor: 'transparent', color: currentStep === 0 ? '#333' : 'rgba(255,255,255,0.5)',
              fontSize: 12, cursor: currentStep === 0 ? 'default' : 'pointer',
            }}
          >
            Back
          </button>
          <button
            onClick={isLastStep ? onComplete : () => setCurrentStep(currentStep + 1)}
            style={{
              padding: '8px 20px', borderRadius: 5, border: 'none',
              backgroundColor: ACCENT, color: '#fff', fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isLastStep ? `Complete (+${lesson.xpReward} XP)` : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CoachBeacon — Pulsing dot that appears on first-use UI elements.
 * Tap to see a contextual tip + link to relevant lesson.
 */
export function CoachBeacon({ tip, onDismiss }: {
  tip: { headline: string; body: string; lessonSlug: string; position: string };
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Pulsing dot */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: ACCENT, cursor: 'pointer',
          animation: 'pulse 2s ease infinite',
          boxShadow: `0 0 8px ${ACCENT}66`,
        }}
      />

      {/* Tooltip */}
      {expanded && (
        <div style={{
          position: 'absolute', top: 16, left: -8, zIndex: 50,
          width: 220, padding: 12, borderRadius: 8,
          backgroundColor: '#111', border: `1px solid ${ACCENT}44`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>
            {tip.headline}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 8 }}>
            {tip.body}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onDismiss} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              fontSize: 10, cursor: 'pointer',
            }}>Got it</button>
            <button style={{
              background: 'none', border: 'none', color: ACCENT,
              fontSize: 10, cursor: 'pointer',
            }}>Learn more →</button>
          </div>
        </div>
      )}
    </div>
  );
}
