import React from 'react';
import { usePrefsStore } from '../../stores/prefsStore';
import { useAppStore } from '../../stores/appStore';
import { useTranslation } from '../../hooks/useTranslation';

const ACCENT = '#E0943A';

export function SettingsPage() {
  const prefs = usePrefsStore();
  const { setView } = useAppStore();
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Theme">
          <SegmentedControl
            options={['light', 'dark', 'system']}
            value={prefs.theme}
            onChange={(v) => prefs.setPref('theme', v as any)}
          />
        </Row>
        <Row label="Grid size">
          <SegmentedControl
            options={['small', 'medium', 'large']}
            value={prefs.gridSize}
            onChange={(v) => prefs.setPref('gridSize', v as any)}
          />
        </Row>
        <Row label="Show histogram">
          <Toggle value={prefs.showHistogram} onChange={(v) => prefs.setPref('showHistogram', v)} />
        </Row>
      </Section>

      {/* Sound */}
      <Section title="Sound & Haptics (SoundPulse)">
        <Row label="Sound enabled">
          <Toggle value={prefs.soundEnabled} onChange={(v) => prefs.setPref('soundEnabled', v)} />
        </Row>
        <Row label="Volume">
          <input
            type="range" min={0} max={1} step={0.05}
            value={prefs.soundVolume}
            onChange={(e) => prefs.setPref('soundVolume', Number(e.target.value))}
            style={{ width: 140, accentColor: ACCENT }}
          />
          <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>{Math.round(prefs.soundVolume * 100)}%</span>
        </Row>
        <Row label="Haptics">
          <Toggle value={prefs.hapticsEnabled} onChange={(v) => prefs.setPref('hapticsEnabled', v)} />
        </Row>
      </Section>

      {/* Export defaults */}
      <Section title="Export Defaults (FinalPass)">
        <Row label="Format">
          <SegmentedControl
            options={['JPEG', 'TIFF', 'PNG', 'WEBP']}
            value={prefs.defaultExportFormat}
            onChange={(v) => prefs.setPref('defaultExportFormat', v as any)}
          />
        </Row>
        <Row label="Quality">
          <input
            type="range" min={50} max={100} step={1}
            value={prefs.defaultExportQuality}
            onChange={(e) => prefs.setPref('defaultExportQuality', Number(e.target.value))}
            style={{ width: 120, accentColor: ACCENT }}
          />
          <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>{prefs.defaultExportQuality}%</span>
        </Row>
        <Row label="Color profile">
          <select
            value={prefs.defaultColorProfile}
            onChange={(e) => prefs.setPref('defaultColorProfile', e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #333', backgroundColor: '#111', color: '#fff', fontSize: 12 }}
          >
            <option value="sRGB">sRGB</option>
            <option value="Adobe RGB">Adobe RGB</option>
            <option value="ProPhoto RGB">ProPhoto RGB</option>
          </select>
        </Row>
      </Section>

      {/* Language */}
      <Section title={t('settings.language')}>
        <Row label={t('settings.language')}>
          <SegmentedControl
            options={['en', 'fr']}
            value={prefs.locale}
            onChange={(v) => prefs.setPref('locale', v as any)}
          />
        </Row>
      </Section>

      {/* Academy */}
      <Section title="Academy">
        <Row label="Show coach tips">
          <Toggle value={prefs.showCoachTips} onChange={(v) => prefs.setPref('showCoachTips', v)} />
        </Row>
      </Section>

      {/* Branding — the feature we discussed */}
      <Section title="Branding & Signature">
        <div style={{
          padding: 12, borderRadius: 6, backgroundColor: '#111',
          border: '1px solid #1a1a1a', marginBottom: 12, fontSize: 12,
          color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
        }}>
          Control where "YmShotS" and "Built by ta-tech" appears.
          {prefs.planTier === 'FREE' && (
            <span style={{ color: ACCENT }}> Upgrade to PRO to hide branding on client-facing materials.</span>
          )}
        </div>

        <Row label="YmShotS in export EXIF metadata">
          <Toggle
            value={prefs.brandingOnExportExif}
            onChange={(v) => prefs.canHideBranding() ? prefs.setPref('brandingOnExportExif', v) : setView('pitch')}
            locked={!prefs.canHideBranding()}
          />
        </Row>
        <Row label="'Built by ta-tech' on gallery footer">
          <Toggle
            value={prefs.brandingOnGallery}
            onChange={(v) => prefs.canHideBranding() ? prefs.setPref('brandingOnGallery', v) : setView('pitch')}
            locked={!prefs.canHideBranding()}
          />
        </Row>
        <Row label="'Powered by YmShotS' on invoices">
          <Toggle
            value={prefs.brandingOnInvoice}
            onChange={(v) => prefs.canHideBranding() ? prefs.setPref('brandingOnInvoice', v) : setView('pitch')}
            locked={!prefs.canHideBranding()}
          />
        </Row>

        {!prefs.canHideBranding() && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button onClick={() => setView('pitch')} style={{
              padding: '6px 16px', borderRadius: 5, border: 'none',
              backgroundColor: ACCENT, color: '#fff', fontSize: 11,
              fontWeight: 600, cursor: 'pointer',
            }}>
              Upgrade to hide branding
            </button>
          </div>
        )}
      </Section>

      {/* About */}
      <Section title="About">
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
          <p><strong style={{ color: 'rgba(255,255,255,0.6)' }}>YmShotS v1.0</strong> — your moments. your shots.</p>
          <p style={{ marginTop: 8 }}>Built by ta-tech — because every creative deserves tools as exceptional as their vision.</p>
          <p style={{ marginTop: 8, fontStyle: 'italic' }}>This is the v1.0. You flew it first.</p>
        </div>
      </Section>
    </div>
  );
}

// ─── Shared components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{
        fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #1a1a1a',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 0', fontSize: 13, color: 'rgba(255,255,255,0.6)',
    }}>
      <span>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, locked }: { value: boolean; onChange: (v: boolean) => void; locked?: boolean }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 36, height: 20, borderRadius: 10, border: 'none',
      backgroundColor: value ? ACCENT : '#333',
      cursor: locked ? 'not-allowed' : 'pointer',
      position: 'relative', transition: 'all 0.2s',
      opacity: locked ? 0.5 : 1,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        backgroundColor: '#fff', position: 'absolute',
        top: 2, left: value ? 18 : 2,
        transition: 'left 0.2s',
      }} />
      {locked && <span style={{ position: 'absolute', right: -18, top: 2, fontSize: 10 }}>🔒</span>}
    </button>
  );
}

function SegmentedControl({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', border: '1px solid #222' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: '4px 10px', border: 'none', fontSize: 11,
          backgroundColor: value === opt ? ACCENT + '33' : 'transparent',
          color: value === opt ? '#fff' : 'rgba(255,255,255,0.3)',
          cursor: 'pointer', textTransform: 'capitalize',
        }}>
          {opt}
        </button>
      ))}
    </div>
  );
}
