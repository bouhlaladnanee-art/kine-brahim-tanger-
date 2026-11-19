import React from 'react';
import { PhoneCall, ArrowLeft } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { PRACTITIONER_INFO } from '../../data/constants';
import { useLanguage } from '../../context/LanguageContext';

export default function Header({
  showBack = false,
  onBack,
  title,
  subtitle,
  compact = false
}) {
  const { t, isRTL } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Retour"
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-text-main transition-colors -ml-1"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-extrabold text-text-main leading-tight">
                {title || PRACTITIONER_INFO.name}
              </h1>
            </div>
            <p className="text-[11px] text-text-muted">
              {subtitle || t('appTitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sélecteur de langue 4 langues */}
          <LanguageSwitcher compact />

          {/* Bouton appel direct */}
          <a
            href={`tel:${PRACTITIONER_INFO.phone}`}
            className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-primary-100 transition-colors"
            title={t('callDirect')}
          >
            <PhoneCall className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xs:inline">{t('callDirect')}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
