import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext(null);

const LANG_STORAGE_KEY = 'kine_tanger_preferred_language';

export const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && ['fr', 'ar', 'en', 'es'].includes(saved)) {
        return saved;
      }
      return 'fr';
    } catch {
      return 'fr';
    }
  });

  // Applique la direction RTL pour l'Arabe et la langue dans le DOM
  useEffect(() => {
    const isArabic = currentLanguage === 'ar';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;

    if (isArabic) {
      document.body.classList.add('rtl-arabic');
    } else {
      document.body.classList.remove('rtl-arabic');
    }
  }, [currentLanguage]);

  const changeLanguage = (langCode) => {
    if (['fr', 'ar', 'en', 'es'].includes(langCode)) {
      setCurrentLanguage(langCode);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, langCode);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['fr'];
    return langDict[key] || TRANSLATIONS['fr'][key] || key;
  };

  const isRTL = currentLanguage === 'ar';

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage: changeLanguage,
      t,
      isRTL,
      availableLanguages: LANGUAGES,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
