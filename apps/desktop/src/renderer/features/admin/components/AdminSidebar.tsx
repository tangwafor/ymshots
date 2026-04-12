import React from 'react';
import type { AdminTab } from '../AdminDashboard';

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const NAV_ITEMS: Array<{ tab: AdminTab; label: string; icon: string }> = [
  { tab: 'overview', label: 'Overview', icon: '\u25A0' },
  { tab: 'users', label: 'Users', icon: '\u2630' },
  { tab: 'shoots', label: 'Shoots', icon: '\u25CB' },
  { tab: 'galleries', label: 'Galleries', icon: '\u25A1' },
  { tab: 'invoices', label: 'Invoices', icon: '\u20AC' },
  { tab: 'academy', label: 'Academy', icon: '\u2605' },
  { tab: 'styles', label: 'SignatureAI', icon: '\u2661' },
  { tab: 'exports', label: 'Exports', icon: '\u21E2' },
  { tab: 'pitch', label: 'PitchDeck', icon: '\u25B6' },
  { tab: 'health', label: 'System', icon: '\u2713' },
];

export function AdminSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside style={{
      width: 220,
      borderRight: '1px solid #1a1a1a',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>YmShotS Admin</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
          Vendor Dashboard
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV_ITEMS.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
              backgroundColor: activeTab === tab ? '#E0943A22' : 'transparent',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #1a1a1a',
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
      }}>
        Built by ta-tech
      </div>
    </aside>
  );
}
