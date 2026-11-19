import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 text-text-main px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200/60 active:scale-95 select-none"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{activeLang.flag}</span>
        <span className="text-[11px] font-extrabold uppercase tracking-tight">
          {compact ? activeLang.code : activeLang.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`
          absolute mt-1.5 w-36 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150
          ${isRTL ? 'left-0' : 'right-0'}
        `}>
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Choisir la langue
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`
                  w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left
                  ${isSelected ? 'bg-primary-50 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-xs">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
