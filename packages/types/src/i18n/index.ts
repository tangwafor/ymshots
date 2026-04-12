import { en, type TranslationKey } from './en';
import { fr } from './fr';

export type Locale = 'en' | 'fr';
export type { TranslationKey };

const translations: Record<Locale, Record<TranslationKey, string>> = { en, fr };

export function t(key: TranslationKey, locale: Locale = 'en', params?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] ?? translations.en[key] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}

export { en, fr };
