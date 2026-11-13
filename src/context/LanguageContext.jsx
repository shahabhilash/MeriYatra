import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../locales/translations';
import { readStore, writeStore } from '../utils/geo';

const LanguageContext = createContext();
const STORAGE_KEY = 'meriyatra_lang';

export function LanguageProvider({ children }) {
  // Remember the chosen language across visits (defaults to English)
  const [language, setLanguage] = useState(() => {
    const saved = readStore(STORAGE_KEY, 'en');
    return saved === 'hi' ? 'hi' : 'en';
  });

  useEffect(() => {
    writeStore(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'en' ? 'hi' : 'en'));
  };

  // Translation helper with optional {placeholder} replacement
  const t = (key, vars) => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
