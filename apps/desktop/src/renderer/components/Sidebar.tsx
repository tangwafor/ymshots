import React from 'react';
import { useAppStore, type AppView } from '../stores/appStore';
import { usePrefsStore } from '../stores/prefsStore';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKey } from '@ymshots/types';

interface NavItem {
  view: AppView;
  labelKey: TranslationKey;
  icon: string;
  section: 'create' | 'business' | 'learn' | 'system';
}

const NAV: NavItem[] = [
  { view: 'vault',      labelKey: 'nav.library',     icon: '\u25A6', section: 'create' },
  { view: 'edit',       labelKey: 'nav.edit',         icon: '\u25CE', section: 'create' },
  { view: 'styleforge', labelKey: 'nav.styleforge',  icon: '\u2728', section: 'create' },
  { view: 'gallery',    labelKey: 'nav.galleries',   icon: '\u25A1', section: 'business' },
  { view: 'invoices',   labelKey: 'nav.invoices',    icon: '\u20AC', section: 'business' },
  { view: 'shottalk',   labelKey: 'nav.shottalk',    icon: '\u25C9', section: 'business' },
  { view: 'lens-biz',   labelKey: 'nav.analytics',   icon: '\u25B2', section: 'business' },
  { view: 'academy',    labelKey: 'nav.academy',     icon: '\u2605', section: 'learn' },
  { view: 'settings',   labelKey: 'nav.settings',    icon: '\u2699', section: 'system' },
  { view: 'admin',      labelKey: 'nav.admin',       icon: '\u2630', section: 'system' },
];

const SECTION_KEYS: Record<string, TranslationKey> = {
  create: 'nav.create', business: 'nav.business', learn: 'nav.learn', system: 'nav.system',
};

export function Sidebar() {
  const { currentView, setView } = useAppStore();
  const { fullName, planTier } = usePrefsStore();
  const { t } = useTranslation();

  const sections = ['create', 'business', 'learn', 'system'];

  return (
    <aside style={{
      width: 200,
      backgroundColor: '#0D0D0D',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
    }}>
      {/* App branding */}
      <div style={{
        padding: '16px 14px 12px',
        borderBottom: '1px solid #1a1a1a',
        cursor: 'pointer',
      }} onClick={() => setView('vault')}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>YmShotS</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
          your moments. your shots.
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {sections.map(section => {
          const items = NAV.filter(n => n.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em', padding: '8px 10px 4px',
              }}>
                {t(SECTION_KEYS[section])}
              </div>
              {items.map(({ view, labelKey, icon }) => {
                const label = t(labelKey);
                const active = currentView === view;
                return (
                  <button
                    key={view}
                    onClick={() => setView(view)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '8px 10px',
                      border: 'none', borderRadius: 5, cursor: 'pointer',
                      fontSize: 12, textAlign: 'left',
                      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                      backgroundColor: active ? '#E0943A22' : 'transparent',
                      borderLeft: active ? '2px solid #E0943A' : '2px solid transparent',
                      transition: 'all 0.12s',
                    }}
                  >
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid #1a1a1a',
        fontSize: 11,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
          {fullName || 'Photographer'}
        </div>
        <div style={{
          display: 'inline-block',
          padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600,
          backgroundColor: planTier === 'STUDIO' ? '#7C4DFF22' : planTier === 'PRO' ? '#E0943A22' : '#33333344',
          color: planTier === 'STUDIO' ? '#7C4DFF' : planTier === 'PRO' ? '#E0943A' : '#666',
        }}>
          {planTier}
        </div>
      </div>
    </aside>
  );
}
