import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Award, 
  PhoneCall, 
  CalendarCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Share2,
  Phone,
  MessageCircle,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import Button from '../common/Button';
import { PRACTITIONER_INFO } from '../../data/constants';
import { availabilityService } from '../../services/availabilityService';
import { useLanguage } from '../../context/LanguageContext';

export default function LandingHero({ onStartBooking }) {
  const { t, isRTL, currentLanguage } = useLanguage();
  const nextAvailability = availabilityService.getNextAvailabilityText();

  // Lien de partage viral WhatsApp
  const shareUrl = window.location.origin;
  const shareWhatsAppMessage = `${t('shareMessageText')}\n${shareUrl}`;
  const shareWhatsAppLink = `https://wa.me/?text=${encodeURIComponent(shareWhatsAppMessage)}`;

  // Message WhatsApp direct adapté
  const directWaText = currentLanguage === 'ar'
    ? "السلام عليكم إبراهيم، أريد حجز موعد لحصة ترويض طبي منزلي في طنجة."
    : "Bonjour Brahim, je souhaite convenir d'un rendez-vous pour une séance de kiné à domicile à Tanger.";
  const directWhatsAppLink = `https://wa.me/${PRACTITIONER_INFO.whatsappNumber}?text=${encodeURIComponent(directWaText)}`;

  return (
    <div className="relative overflow-hidden bg-white rounded-b-3xl border-b border-slate-100 shadow-sm">
      {/* Fond décoratif doux */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-70" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent-50 rounded-full blur-2xl -z-10 -translate-x-1/4 translate-y-1/4 opacity-60" />

      <div className="p-4 sm:p-6 space-y-5">
        {/* En-tête officiel Praticien de Santé */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>{t('officialBadge')}</span>
          </span>
          <span className="text-[11px] font-bold text-text-muted flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-accent" /> {t('tangerIntramuros')}
          </span>
        </div>

        {/* Profil du Kinésithérapeute (Style Carte Médicale Officielle) */}
        <div className="flex items-center gap-4 pt-1">
          <div className="relative">
            {/* Avatar médical soigné */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-0.5 shadow-soft flex items-center justify-center text-white overflow-hidden relative">
              <div className="w-full h-full bg-primary-700 flex flex-col items-center justify-center rounded-[14px]">
                <span className="text-2xl font-black tracking-tight">BM</span>
                <span className="text-[9px] uppercase tracking-wider text-primary-200 font-bold">Kiné Tanger</span>
              </div>
              <div className="absolute bottom-1 right-1 bg-white text-primary rounded-full p-1 shadow-sm">
                <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-text-main leading-tight">
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

        {/* Bio courte et chaleureuse */}
        <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-text-main leading-relaxed">
          <p>{t('practitionerBio')}</p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LE NUMÉRO DE TÉLÉPHONE EN GRAND & CONTACT DIRECT IMMÉDIAT     */}
        {/* Pensé spécialement pour les personnes âgées / urgence          */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {t('callNumberDirect')}
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
              {nextAvailability}
            </span>
          </div>

          {/* Numéro géant cliquable */}
          <div className="text-center py-1">
            <a
              href={`tel:${PRACTITIONER_INFO.phone}`}
              className="text-2xl sm:text-3xl font-black text-emerald-400 hover:text-emerald-300 tracking-wider block font-mono active:scale-95 transition-transform"
            >
              {PRACTITIONER_INFO.phoneDisplay}
            </a>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Appel direct ou message vocal WhatsApp
            </span>
          </div>

          {/* 2 Boutons tactiles géants d'action directe */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Bouton Appel Normal */}
            <a
              href={`tel:${PRACTITIONER_INFO.phone}`}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-3 rounded-2xl shadow-md transition-all active:scale-[0.98] text-center"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>{t('callPhoneBtn')}</span>
            </a>

            {/* Bouton WhatsApp Vocal / Message */}
            <a
              href={directWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs py-3 px-3 rounded-2xl shadow-md transition-all active:scale-[0.98] text-center"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARTE TARIFAIRE TRANSPARENTE ET RASSURANTE (ANTI-STRESS)      */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-primary-50/50 p-4 rounded-3xl border border-primary-200/70 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              {t('transparentPricing')}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-slate-500">{t('startingAt')}</span>
              <span className="text-3xl font-black text-text-main">
                {PRACTITIONER_INFO.basePriceMAD} DH
              </span>
              <span className="text-xs text-text-muted font-bold">/ {t('perSession')}</span>
            </div>
            <p className="text-xs text-primary-800 mt-1 font-semibold">
              * {t('priceNoticeDiagnostic')}
            </p>
          </div>

          {/* 3 Garanties écrites en clair pour les patients */}
          <div className="pt-2 border-t border-primary-100/80 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{t('noCardRequired')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('mutuelleReceipt')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('equipmentIncluded')}</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOUTON FORMULAIRE EN ÉTAPES (OPTIONNEL & SIMPLE)              */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-2.5 pt-1">
          <div className="text-center">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              — {t('twoWaysToBookSubtitle')} —
            </span>
          </div>

          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={onStartBooking}
            icon={ArrowRight}
            iconPosition={isRTL ? "left" : "right"}
            className="shadow-xl shadow-accent/25 py-4 text-base font-black"
          >
            {t('ctaBook')}
          </Button>

          {/* Bouton Recommander / Partager la fiche sur WhatsApp */}
          <a
            href={shareWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-2xl border border-slate-200 transition-all active:scale-[0.99]"
          >
            <Share2 className="w-4 h-4 text-primary" />
            <span>{t('sharePractitioner')}</span>
          </a>

          <p className="text-center text-[11px] text-text-muted">
            {t('ctaSubtext')}
          </p>
        </div>
      </div>
    </div>
  );
}
