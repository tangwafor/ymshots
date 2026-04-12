import { create } from 'zustand';

export type AppView =
  | 'pitch'        // PitchDeck (first launch / upgrade)
  | 'welcome'      // WelcomeTour (first-time guided tour)
  | 'vault'        // VaultGrid — library, cull, organize
  | 'edit'         // Edit workspace (RawPulse + ChromaDesk + etc.)
  | 'styleforge'   // StyleForge — AI creative effects
  | 'gallery'      // GalleryBox management
  | 'invoices'     // PayShot invoicing
  | 'shottalk'     // ShotTalk — in-app messaging
  | 'academy'      // AcademyMode
  | 'lens-biz'     // LensBiz analytics
  | 'settings'     // User settings
  | 'admin'        // Vendor dashboard
  | 'about';       // About screen

interface AppState {
  // Navigation
  currentView: AppView;
  previousView: AppView | null;
  setView: (view: AppView) => void;
  goBack: () => void;

  // App lifecycle
  isFirstLaunch: boolean;
  onboardingCompleted: boolean;
  setOnboardingCompleted: () => void;
  splashDone: boolean;
  setSplashDone: () => void;

  // Currently selected shoot
  activeShootId: string | null;
  setActiveShoot: (id: string | null) => void;

  // Currently selected photo(s)
  selectedPhotoIds: string[];
  setSelectedPhotos: (ids: string[]) => void;
  togglePhotoSelection: (id: string) => void;
  clearSelection: () => void;

  // Edit mode
  editingPhotoId: string | null;
  setEditingPhoto: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'pitch',
  previousView: null,
  setView: (view) => set({ currentView: view, previousView: get().currentView }),
  goBack: () => {
    const prev = get().previousView;
    if (prev) set({ currentView: prev, previousView: null });
  },

  isFirstLaunch: true,
  onboardingCompleted: false,
  setOnboardingCompleted: () => set({ onboardingCompleted: true, isFirstLaunch: false }),
  splashDone: false,
  setSplashDone: () => set({ splashDone: true }),

  activeShootId: null,
  setActiveShoot: (id) => set({ activeShootId: id }),

  selectedPhotoIds: [],
  setSelectedPhotos: (ids) => set({ selectedPhotoIds: ids }),
  togglePhotoSelection: (id) => {
    const current = get().selectedPhotoIds;
    set({
      selectedPhotoIds: current.includes(id)
        ? current.filter(p => p !== id)
        : [...current, id],
    });
  },
  clearSelection: () => set({ selectedPhotoIds: [] }),

  editingPhotoId: null,
  setEditingPhoto: (id) => set({ editingPhotoId: id }),
}));
