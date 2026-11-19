import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Wind, 
  HeartHandshake, 
  Zap, 
  Stethoscope, 
  ChevronRight 
} from 'lucide-react';
import { CARE_TYPES } from '../../data/constants';
import { useLanguage } from '../../context/LanguageContext';

const ICON_MAP = {
  Activity,
  ShieldAlert,
  Wind,
  HeartHandshake,
  Zap,
  Stethoscope
};

const CARE_KEY_MAP = {
  post_op: { title: 'care_post_op', desc: 'care_post_op_desc' },
  dos_sciatique: { title: 'care_dos', desc: 'care_dos_desc' },
  respiratoire: { title: 'care_respiratoire', desc: 'care_respiratoire_desc' },
  personnes_agees: { title: 'care_seniors', desc: 'care_seniors_desc' },
  sport: { title: 'care_sport', desc: 'care_sport_desc' },
  autre_soin: { title: 'care_autre', desc: 'care_autre_desc' },
};

export default function SpecialtiesGrid({ onSelectSpecialty }) {
  const { t, isRTL } = useLanguage();

  return (
    <section className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-text-main">
            {t('specialtiesTitle')}
          </h2>
          <p className="text-xs text-text-muted">
            {t('specialtiesSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {CARE_TYPES.map((care) => {
          const IconComponent = ICON_MAP[care.icon] || Activity;
          const translationKeys = CARE_KEY_MAP[care.id] || { title: care.title, desc: care.description };
          const title = t(translationKeys.title) || care.title;
          const description = t(translationKeys.desc) || care.description;

          return (
            <button
              key={care.id}
              onClick={() => onSelectSpecialty(care.id)}
              className="w-full text-left bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-primary-300 shadow-card hover:shadow-soft transition-all duration-200 flex items-center gap-3.5 group active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate">
                    {title}
                  </h3>
                  {care.badge && (
                    <span className="text-[10px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md shrink-0">
                      {care.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {description}
                </p>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-primary-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
