import { usePrefsStore } from '../stores/prefsStore';
import { t, type TranslationKey, type Locale } from '@ymshots/types';

/**
 * useTranslation hook — reads locale from prefs store,
 * returns a t() function bound to the current locale.
 *
 * Usage:
 *   const { t, locale } = useTranslation();
 *   <span>{t('nav.library')}</span>
 *   <span>{t('vault.selected', { n: count })}</span>
 */
export function useTranslation() {
  const locale = usePrefsStore(s => s.locale) as Locale;

  return {
    t: (key: TranslationKey, params?: Record<string, string | number>) => t(key, locale, params),
    locale,
  };
}
