import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { CreatorSignature } from '../../components/CreatorSignature';
import { PRICING } from '@ymshots/types';

const ACCENT = '#E0943A';

interface Slide {
  render: (next: () => void) => React.ReactNode;
}

export function PitchDeck() {
  const [current, setCurrent] = useState(0);
  const { setView, setOnboardingCompleted, isFirstLaunch } = useAppStore();

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
  };
  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const skip = () => {
    setOnboardingCompleted();
    setView('welcome');
  };
  const start = () => {
    setOnboardingCompleted();
    setView('welcome');
  };

  const slides: Slide[] = [
    // 1. Hero
    {
      render: (next) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 12 }}>
            YmShotS
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'lowercase', marginBottom: 40 }}>
            your moments. your shots.
          </div>
          {/* Animated shutter */}
          <div style={{
            width: 80, height: 80, margin: '0 auto 40px',
            borderRadius: '50%', border: `3px solid ${ACCENT}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 2s ease infinite',
          }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: ACCENT }} />
          </div>
          <CreatorSignature placement="splash" />
          <Btn label="See what's inside" onClick={next} style={{ marginTop: 32 }} />
        </div>
      ),
    },
    // 2. Problem
    {
      render: (next) => (
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.3, marginBottom: 24 }}>
            Every other app makes you choose.
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 16 }}>
            Edit here. Cull there. Deliver somewhere else. Invoice on another platform.
            Message clients on WhatsApp. Six apps. Six subscriptions. Six logins.
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
            You didn't become a photographer to manage software.
          </div>
          <Btn label="There's a better way" onClick={next} />
        </div>
      ),
    },
    // 3. Solution — engine list
    {
      render: (next) => (
        <div style={{ maxWidth: 540 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
            One app. Every tool.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
            {[
              ['VaultGrid', 'Import, cull, organize'],
              ['RawPulse', 'RAW editing pipeline'],
              ['ChromaDesk', 'Color grading suite'],
              ['SignatureAI', 'Your personal style AI'],
              ['StyleForge', 'AI cartoon, sketch, watercolor'],
              ['GlowKit', 'Skin & beauty tools'],
              ['ShotTalk', 'Client chat — no WhatsApp needed'],
              ['GalleryBox', 'Client delivery portal'],
              ['PayShot', 'MoMo, Orange, card & cash'],
              ['AcademyMode', 'In-app learning'],
            ].map(([name, desc]) => (
              <div key={name} style={{
                padding: '10px 14px', borderRadius: 6,
                backgroundColor: '#111', border: '1px solid #1a1a1a',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Btn label="Meet SignatureAI" onClick={next} />
          </div>
        </div>
      ),
    },
    // 4. SignatureAI
    {
      render: (next) => (
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            An AI that edits exactly like you.
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: ACCENT, marginBottom: 8 }}>
            96%
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            less time editing after 100 photos trained
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 12 }}>
            SignatureAI watches how you edit. After just 10 photos, it starts forming your style fingerprint.
            By 50, it can edit like you. By 100, your style is unmistakable.
          </div>
          <div style={{
            padding: 16, borderRadius: 8, backgroundColor: '#111',
            border: '1px solid #1a1a1a', marginBottom: 32, fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
          }}>
            All AI runs on your machine. Your photos never leave your computer.
          </div>
          <Btn label="Keep going" onClick={next} />
        </div>
      ),
    },
    // 5. Academy
    {
      render: (next) => (
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Learn while you shoot.
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            marginBottom: 24, textAlign: 'left',
          }}>
            <Stat value="30" label="lessons" />
            <Stat value="4" label="skill tracks" />
            <Stat value="8" label="coach tips" />
            <Stat value="100+" label="challenges" />
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
            From your first import to mastering color science — AcademyMode teaches you at exactly the right moment, in the flow of real work.
          </div>
          <Btn label="One more thing" onClick={next} />
        </div>
      ),
    },
    // 6. ShotTalk + StyleForge
    {
      render: (next) => (
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
            Talk to clients. Transform photos.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#111', border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>ShotTalk</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Chat with clients right inside YmShotS. Tap any photo to pin feedback on the exact spot. No WhatsApp. No email. No app install for clients.
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#111', border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>StyleForge</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Turn any photo into a cartoon, watercolor, sketch, or 3D character. 12 AI effects — all on your machine. Give clients something they can't get anywhere else.
              </div>
            </div>
          </div>
          <div style={{
            padding: 12, borderRadius: 6, backgroundColor: '#111',
            border: '1px solid #1a1a1a', fontSize: 12, color: 'rgba(255,255,255,0.4)',
            marginBottom: 24,
          }}>
            Pay with MTN MoMo, Orange Money, card, or cash — PayShot handles it all.
          </div>
          <Btn label="Almost there" onClick={next} />
        </div>
      ),
    },
    // 7. Release
    {
      render: (next) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: '6px 20px', borderRadius: 20,
            border: `1px solid ${ACCENT}`, color: ACCENT, fontSize: 12,
            fontWeight: 600, letterSpacing: '0.05em', marginBottom: 20,
          }}>
            v1.0 RELEASE
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
            You're here first.
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
            This is the first version of YmShotS. You're among the first photographers to use it. That means something to us.
          </div>
          <CreatorSignature placement="about" />
          <Btn label="See pricing" onClick={next} style={{ marginTop: 24 }} />
        </div>
      ),
    },
    // 7. Pricing
    {
      render: () => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
            Choose your plan.
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
            <PlanCard
              name="FREE"
              price="$0"
              period="forever"
              features={['15 AI edits/day', 'All manual RAW tools', '30 filters', 'Export up to 24MP']}
              onSelect={start}
              btnLabel="Start free"
            />
            <PlanCard
              name="PRO"
              price="$9.99"
              period="/mo or $79 one-time"
              features={['Unlimited AI', 'SignatureAI', '150+ filters', 'GalleryBox', 'PayShot', 'Academy', 'Mobile sync', 'Video retouch']}
              highlighted
              onSelect={start}
              btnLabel="Go Pro"
            />
            <PlanCard
              name="STUDIO"
              price="$24.99"
              period="/mo"
              features={['Everything in Pro', '3 team seats', 'Shared style library', 'Team analytics', 'White-label galleries']}
              onSelect={start}
              btnLabel="Go Studio"
            />
          </div>
          <button onClick={start} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
          }}>
            Skip for now
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#0A0A0A', color: '#fff',
    }}>
      {/* Skip button */}
      {current < slides.length - 1 && (
        <button onClick={skip} style={{
          position: 'absolute', top: 16, right: 20, background: 'none',
          border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12,
          cursor: 'pointer', zIndex: 10,
        }}>
          Skip
        </button>
      )}

      {/* Slide content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
      }}>
        {slides[current].render(next)}
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 6,
        padding: '0 0 24px',
      }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === current ? 20 : 6, height: 6,
            borderRadius: 3,
            backgroundColor: i === current ? ACCENT : '#333',
            transition: 'all 0.3s',
            cursor: 'pointer',
          }} onClick={() => setCurrent(i)} />
        ))}
      </div>

      {/* Nav arrows */}
      {current > 0 && (
        <button onClick={prev} style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
          fontSize: 24, cursor: 'pointer',
        }}>
          \u2039
        </button>
      )}
      {current < slides.length - 1 && (
        <button onClick={next} style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
          fontSize: 24, cursor: 'pointer',
        }}>
          \u203A
        </button>
      )}
    </div>
  );
}

// ─── Sub-components ───

function Btn({ label, onClick, style }: { label: string; onClick: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 28px', borderRadius: 6, border: 'none',
      backgroundColor: ACCENT, color: '#fff', fontSize: 14,
      fontWeight: 600, cursor: 'pointer', ...style,
    }}>
      {label}
    </button>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 6,
      backgroundColor: '#111', border: '1px solid #1a1a1a',
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: ACCENT }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
    </div>
  );
}

function PlanCard({ name, price, period, features, highlighted, onSelect, btnLabel }: {
  name: string; price: string; period: string; features: string[];
  highlighted?: boolean; onSelect: () => void; btnLabel: string;
}) {
  return (
    <div style={{
      width: 200, padding: '24px 16px', borderRadius: 10, textAlign: 'left',
      backgroundColor: highlighted ? '#111' : '#0D0D0D',
      border: highlighted ? `1px solid ${ACCENT}44` : '1px solid #1a1a1a',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: highlighted ? ACCENT : '#666', marginBottom: 8 }}>
        {name}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700 }}>{price}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>{period}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', fontSize: 12 }}>
        {features.map(f => (
          <li key={f} style={{ color: 'rgba(255,255,255,0.5)', padding: '3px 0' }}>
            <span style={{ color: ACCENT, marginRight: 6 }}>\u2713</span>{f}
          </li>
        ))}
      </ul>
      <button onClick={onSelect} style={{
        width: '100%', padding: '8px', borderRadius: 5, border: 'none',
        backgroundColor: highlighted ? ACCENT : '#222', color: '#fff',
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>
        {btnLabel}
      </button>
    </div>
  );
}
