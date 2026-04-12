// API response envelope
export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  error?: ApiError;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

// Plan tiers
export type PlanTier = 'FREE' | 'PRO' | 'STUDIO';

export const PLAN_LIMITS = {
  FREE: {
    aiEditsPerDay: 15,
    maxExportPx: 24_000_000, // 24MP
    filtersCount: 30,
    signatureAI: false,
    galleryBox: false,
    payShot: false,
    academy: false,
    mobileSync: false,
    videoRetouch: false,
  },
  PRO: {
    aiEditsPerDay: Infinity,
    maxExportPx: Infinity,
    filtersCount: 150,
    signatureAI: true,
    galleryBox: true,
    payShot: true,
    academy: true,
    mobileSync: true,
    videoRetouch: true,
  },
  STUDIO: {
    aiEditsPerDay: Infinity,
    maxExportPx: Infinity,
    filtersCount: 150,
    signatureAI: true,
    galleryBox: true,
    payShot: true,
    academy: true,
    mobileSync: true,
    videoRetouch: true,
    seats: 3,
    sharedStyleLibrary: true,
    teamAnalytics: true,
    whiteLabelGalleries: true,
  },
} as const;

// Pricing (cents)
export const PRICING = {
  PRO_MONTHLY_CENTS: 999,
  PRO_LIFETIME_CENTS: 7900,
  STUDIO_MONTHLY_CENTS: 2499,
} as const;
