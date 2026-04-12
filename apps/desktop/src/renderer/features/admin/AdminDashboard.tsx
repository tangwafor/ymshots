import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { OverviewPanel } from './components/OverviewPanel';
import { UsersPanel } from './components/UsersPanel';
import { ShootsPanel } from './components/ShootsPanel';
import { GalleriesPanel } from './components/GalleriesPanel';
import { InvoicesPanel } from './components/InvoicesPanel';
import { AcademyPanel } from './components/AcademyPanel';
import { StyleProfilesPanel } from './components/StyleProfilesPanel';
import { ExportsPanel } from './components/ExportsPanel';
import { PitchPanel } from './components/PitchPanel';
import { SystemHealthPanel } from './components/SystemHealthPanel';

export type AdminTab =
  | 'overview' | 'users' | 'shoots' | 'galleries'
  | 'invoices' | 'academy' | 'styles' | 'exports'
  | 'pitch' | 'health';

const API_BASE = 'http://localhost:3001/api/v1/admin';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const panels: Record<AdminTab, React.ReactNode> = {
    overview: <OverviewPanel apiBase={API_BASE} />,
    users: <UsersPanel apiBase={API_BASE} />,
    shoots: <ShootsPanel apiBase={API_BASE} />,
    galleries: <GalleriesPanel apiBase={API_BASE} />,
    invoices: <InvoicesPanel apiBase={API_BASE} />,
    academy: <AcademyPanel apiBase={API_BASE} />,
    styles: <StyleProfilesPanel apiBase={API_BASE} />,
    exports: <ExportsPanel apiBase={API_BASE} />,
    pitch: <PitchPanel apiBase={API_BASE} />,
    health: <SystemHealthPanel apiBase={API_BASE} />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0A0A0A', color: '#fff' }}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {panels[activeTab]}
      </main>
    </div>
  );
}
