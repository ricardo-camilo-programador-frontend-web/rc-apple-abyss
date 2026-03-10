import { Language } from './types';
import { LOCALIZATION } from './constants';

export class LocalizationSystem {
  private currentLanguage: Language = 'en';

  constructor(initialLanguage?: Language) {
    if (initialLanguage) {
      this.currentLanguage = initialLanguage;
    } else if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (Object.keys(LOCALIZATION.game_title).includes(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string, params: Record<string, string | number> = {}): string {
    const entry = LOCALIZATION[key];
    if (!entry) return key;
    
    let text = entry[this.currentLanguage] || entry['en'];
    
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
    
    return text;
  }
}
