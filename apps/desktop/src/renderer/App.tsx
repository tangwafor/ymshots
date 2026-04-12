import React, { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { useEditStore } from './stores/editStore';
import { SplashScreen } from './components/SplashScreen';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PitchDeck } from './features/pitch/PitchDeck';
import { WelcomeTour } from './features/welcome/WelcomeTour';
import { VaultGrid } from './features/vault/VaultGrid';
import { EditWorkspace } from './features/edit/EditWorkspace';
import { GalleryManager } from './features/vault/GalleryManager';
import { InvoiceManager } from './features/vault/InvoiceManager';
import { AcademyView } from './features/academy/AcademyView';
import { LensBizView } from './features/lens-biz/LensBizView';
import { SettingsPage } from './features/settings/SettingsPage';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { ShotTalkView } from './features/shottalk/ShotTalkView';
import { StyleForgeView } from './features/styleforge/StyleForgeView';
import { CreatorSignature } from './components/CreatorSignature';

export function App() {
  const { splashDone, setSplashDone, currentView } = useAppStore();

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(), 2500);
    return () => clearTimeout(timer);
  }, [setSplashDone]);

  // Keyboard shortcuts — full spec from CLAUDE.md
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const app = useAppStore.getState();
      const edit = useEditStore.getState();
      const mod = e.metaKey || e.ctrlKey;

      // Global
      if (e.key === 'Escape') {
        if (app.currentView === 'edit') app.setView('vault');
        else if (app.currentView === 'styleforge') app.setView('edit');
      }

      // Edit view shortcuts
      if (app.currentView === 'edit' || app.currentView === 'vault') {
        if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); edit.undo(); }
        if (mod && e.key === 'z' && e.shiftKey)  { e.preventDefault(); edit.redo(); }
        if (mod && e.key === 'Z')                 { e.preventDefault(); edit.redo(); }
      }

      if (app.currentView === 'edit') {
        // Space — before/after compare (hold)
        if (e.key === ' ' && e.type === 'keydown') { e.preventDefault(); edit.setComparing(true); }
      }

      if (app.currentView === 'vault') {
        // P — flag, X — reject, U — unflag
        if (e.key === 'p' || e.key === 'P') { /* TODO: flag selected */ }
        if (e.key === 'x' || e.key === 'X') { /* TODO: reject selected */ }
        if (e.key === 'u' || e.key === 'U') { /* TODO: unflag selected */ }
        // 1-5 — star rating
        if (e.key >= '1' && e.key <= '5') { /* TODO: rate selected */ }
        // E — switch to edit view
        if (e.key === 'e' || e.key === 'E') {
          if (app.selectedPhotoIds.length > 0) {
            app.setEditingPhoto(app.selectedPhotoIds[0]);
            app.setView('edit');
          }
        }
        // G — grid view (already here)
        // Tab — next photo, Shift+Tab — prev
        if (e.key === 'Tab') { e.preventDefault(); /* TODO: next/prev photo */ }
        // Cmd+E — export selected
        if (mod && (e.key === 'e' || e.key === 'E')) { e.preventDefault(); /* TODO: trigger export */ }
        // Cmd+A — select all, Cmd+D — deselect
        if (mod && e.key === 'a') { e.preventDefault(); /* TODO: select all */ }
        if (mod && e.key === 'd') { e.preventDefault(); app.clearSelection(); }
      }

      // Cmd+? — open Academy
      if (mod && e.key === '?') { e.preventDefault(); app.setView('academy'); }
      // Cmd+S — save edit session
      if (mod && e.key === 's') { e.preventDefault(); /* TODO: save edit */ }
    };

    const upHandler = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        useEditStore.getState().setComparing(false);
      }
    };

    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  // Show splash
  if (!splashDone) {
    return <SplashScreen />;
  }

  // Full-screen views (no sidebar)
  if (currentView === 'pitch') return <PitchDeck />;
  if (currentView === 'welcome') return <WelcomeTour />;
  if (currentView === 'admin') return <AdminDashboard />;
  if (currentView === 'about') return <AboutScreen />;

  // Main app layout with sidebar
  return (
    <div style={{
      display: 'flex', height: '100vh',
      backgroundColor: '#0A0A0A', color: '#ffffff',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <ViewRouter />
        </main>
      </div>
    </div>
  );
}

function ViewRouter() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case 'vault':      return <VaultGrid />;
    case 'edit':       return <EditWorkspace />;
    case 'styleforge': return <StyleForgeView />;
    case 'gallery':    return <GalleryManager />;
    case 'invoices':   return <InvoiceManager />;
    case 'shottalk':   return <ShotTalkView />;
    case 'academy':    return <AcademyView />;
    case 'lens-biz':   return <LensBizView />;
    case 'settings':   return <SettingsPage />;
    default:           return <VaultGrid />;
  }
}

function AboutScreen() {
  const { setView } = useAppStore();

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0A0A0A', color: '#fff',
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>YmShotS</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32, letterSpacing: '0.08em' }}>
        v1.0 — your moments. your shots.
      </div>
      <CreatorSignature placement="about" />
      <button onClick={() => setView('vault')} style={{
        marginTop: 32, padding: '8px 20px', borderRadius: 5,
        border: '1px solid #333', backgroundColor: 'transparent',
        color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer',
      }}>
        Back to app
      </button>
    </div>
  );
}
