import React from 'react';
import { 
  ShieldCheck, 
  Clock3, 
  FileText, 
  Sparkles, 
  MapPin 
} from 'lucide-react';
import { TANGER_NEIGHBORHOODS } from '../../data/constants';
import { useLanguage } from '../../context/LanguageContext';

export default function TrustBanner() {
  const { t } = useLanguage();

  const points = [
    {
      icon: ShieldCheck,
      title: t('trustHygiene'),
      desc: t('trustHygieneDesc')
    },
    {
      icon: Clock3,
      title: t('trustPunctuality'),
      desc: t('trustPunctualityDesc')
    },
    {
      icon: FileText,
      title: t('trustReceipts'),
      desc: t('trustReceiptsDesc')
    }
  ];

  return (
    <section className="p-4 sm:p-5 space-y-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
        <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          {t('whyUsTitle')}
        </h3>

        <div className="space-y-3">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">{p.title}</h4>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zones desservies à Tanger */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-main mb-2">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span>{t('coveredZones')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TANGER_NEIGHBORHOODS.slice(0, 8).map((q) => (
              <span 
                key={q.id} 
                className="text-[11px] bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100 font-medium"
              >
                {q.name.split('/')[0].trim()}
              </span>
            ))}
            <span className="text-[11px] bg-primary-50 text-primary-700 px-2 py-1 rounded-lg font-semibold">
              {t('allCity')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
