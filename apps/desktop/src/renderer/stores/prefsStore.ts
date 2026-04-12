import { create } from 'zustand';
import type { PlanTier, Locale } from '@ymshots/types';

interface UserPrefs {
  // User identity
  userId: string | null;
  fullName: string;
  email: string;
  planTier: PlanTier;

  // Language
  locale: Locale;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  gridSize: 'small' | 'medium' | 'large';
  showHistogram: boolean;

  // Sound
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;

  // Export defaults
  defaultExportFormat: 'JPEG' | 'TIFF' | 'PNG' | 'WEBP';
  defaultExportQuality: number;
  defaultColorProfile: string;

  // Academy
  showCoachTips: boolean;

  // Branding visibility — new feature from our discussion
  // FREE: always show YmShotS branding (trade-off for free)
  // PRO: can hide on galleries and invoices
  // STUDIO: full white-label everywhere
  brandingOnExportExif: boolean;     // "YmShotS 1.0 by ta-tech" in EXIF Software field
  brandingOnGallery: boolean;        // "Built by ta-tech" in gallery footer
  brandingOnInvoice: boolean;        // "Powered by YmShotS" on invoice footer

  // Actions
  setUser: (data: { userId: string; fullName: string; email: string; planTier: PlanTier }) => void;
  setPref: <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => void;
  canHideBranding: () => boolean;
  canWhiteLabel: () => boolean;
}

export const usePrefsStore = create<UserPrefs>((set, get) => ({
  userId: null,
  fullName: '',
  email: '',
  planTier: 'FREE',
  locale: 'en',

  theme: 'dark',
  gridSize: 'medium',
  showHistogram: true,

  soundEnabled: true,
  soundVolume: 0.7,
  hapticsEnabled: true,

  defaultExportFormat: 'JPEG',
  defaultExportQuality: 92,
  defaultColorProfile: 'sRGB',

  showCoachTips: true,

  // Branding: defaults to ON (FREE tier shows branding)
  brandingOnExportExif: true,
  brandingOnGallery: true,
  brandingOnInvoice: true,

  setUser: (data) => set(data),
  setPref: (key, value) => set({ [key]: value } as any),
  canHideBranding: () => get().planTier === 'PRO' || get().planTier === 'STUDIO',
  canWhiteLabel: () => get().planTier === 'STUDIO',
}));
