import React from 'react';
import { ShieldCheck, PhoneCall, ArrowLeft } from 'lucide-react';
import { PRACTITIONER_INFO } from '../../data/constants';

export default function Header({
  showBack = false,
  onBack,
  title,
  subtitle,
  compact = false
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Retour"
              className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-text-main transition-colors -ml-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base font-bold text-text-main leading-tight">
                {title || PRACTITIONER_INFO.name}
              </h1>
            </div>
            <p className="text-xs text-text-muted">
              {subtitle || 'Kiné à Domicile • Tanger'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${PRACTITIONER_INFO.phone}`}
            className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-100 transition-colors"
            title="Appel direct"
          >
            <PhoneCall className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xs:inline">Appel</span>
          </a>
        </div>
      </div>
    </header>
  );
}
