import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Check, 
  ArrowRight, 
  MessageCircle, 
  Phone,
  FileCheck,
  Banknote
} from 'lucide-react';
import Button from '../common/Button';
import { PRACTITIONER_INFO } from '../../data/constants';
import { availabilityService } from '../../services/availabilityService';
import { useLanguage } from '../../context/LanguageContext';

export default function LandingHero({ onStartBooking }) {
  const { t, isRTL, currentLanguage } = useLanguage();
  const [nextAvailability, setNextAvailability] = useState(() => availabilityService.getNextAvailabilityText());

  useEffect(() => {
    const unsubscribe = availabilityService.subscribe(() => {
      setNextAvailability(availabilityService.getNextAvailabilityText());
    });
    return () => unsubscribe();
  }, []);

  // Message WhatsApp direct personnalisé
  const directWaText = currentLanguage === 'ar'
    ? "السلام عليكم إبراهيم، أريد حجز موعد لحصة ترويض طبي منزلي في طنجة."
    : "Bonjour Ibrahim, je souhaite convenir d'un rendez-vous pour une séance de kiné à domicile à Tanger.";
  const directWhatsAppLink = `https://wa.me/${PRACTITIONER_INFO.whatsappNumber}?text=${encodeURIComponent(directWaText)}`;

  return (
    <div className="bg-white">
      <div className="p-4 sm:p-6 space-y-5">
        
        {/* En-tête : Badge Praticien Diplômé & Périmètre Tanger */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>{t('officialBadge')}</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Tanger & environs
          </span>
        </div>

        {/* Fiche Profil Praticien */}
        <div className="flex items-center gap-4 pt-1">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-primary-800 to-slate-900 p-0.5 shadow-sm flex items-center justify-center text-white overflow-hidden relative">
              <div className="w-full h-full bg-primary-900/90 flex flex-col items-center justify-center rounded-[14px]">
                <span className="text-2xl font-black tracking-tight text-white">BI</span>
                <span className="text-[9px] uppercase tracking-wider text-primary-200 font-bold">Kiné Tanger</span>
              </div>
              <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-1 shadow-xs border-2 border-white">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-text-main leading-tight truncate">
              {PRACTITIONER_INFO.name}
            </h1>
            <p className="text-xs font-extrabold text-primary">
              {t('practitionerTitle')}
            </p>
            <p className="text-[11px] text-text-muted leading-tight">
              {t('practitionerSubtitle')}
            </p>
          </div>
        </div>

        {/* Badge disponibilité réactive (Supabase Realtime) */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold w-full justify-center sm:justify-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{nextAvailability}</span>
        </div>

        {/* Présentation / Bio sobre */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs text-text-main leading-relaxed">
          <p>{t('practitionerBio')}</p>
        </div>

        {/* Bloc Tarif clair & Rassurance médicale */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tarif de la séance à domicile
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xs font-semibold text-slate-500">{t('startingAt')}</span>
                <span className="text-2xl sm:text-3xl font-black text-text-main">
                  {PRACTITIONER_INFO.basePriceMAD} DH
                </span>
                <span className="text-xs text-text-muted font-medium">/ séance</span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded-full font-bold">
              Sur place en espèces
            </span>
          </div>

          <p className="text-[11px] text-slate-600 font-medium border-t border-slate-200/70 pt-2">
            * {t('priceNoticeDiagnostic')}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zéro avance bancaire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Attestation mutuelle & CNSS</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LES 2 SEULES ACTIONS PRINCIPALES (CLAIRES, INTUITIVES, NETTES) */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-3 pt-2">
          {/* Action 1 : Prise de rendez-vous en ligne (Bouton d'accent principal) */}
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={onStartBooking}
            icon={ArrowRight}
            iconPosition={isRTL ? "left" : "right"}
            className="shadow-md shadow-accent/20 py-4 text-base font-black rounded-2xl"
          >
            {t('ctaBook')} (1 min)
          </Button>

          {/* Action 2 : WhatsApp direct (Bouton secondaire clair et identifiable) */}
          <a
            href={directWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-sm transition-all active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>Contacter directement sur WhatsApp</span>
          </a>

          {/* Lien d'appel discret pour urgence ou personne âgée */}
          <div className="text-center pt-1">
            <a
              href={`tel:${PRACTITIONER_INFO.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors py-1"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Ou appelez au <strong className="font-mono text-slate-900">{PRACTITIONER_INFO.phoneDisplay}</strong></span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
