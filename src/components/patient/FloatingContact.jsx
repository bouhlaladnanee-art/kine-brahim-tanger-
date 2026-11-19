import React from 'react';
import { MessageCircle } from 'lucide-react';
import { PRACTITIONER_INFO } from '../../data/constants';
import { useLanguage } from '../../context/LanguageContext';

export default function FloatingContact() {
  const { t, currentLanguage, isRTL } = useLanguage();

  const getWaText = () => {
    if (currentLanguage === 'ar') {
      return "السلام عليكم إبراهيم، أريد الاستفسار عن حصة ترويض طبي منزلي في طنجة.";
    }
    if (currentLanguage === 'en') {
      return "Hello Ibrahim, I would like to inquire about home physiotherapy in Tangier.";
    }
    if (currentLanguage === 'es') {
      return "Hola Ibrahim, quisiera información sobre sesiones de fisioterapia a domicilio en Tánger.";
    }
    return "Bonjour Ibrahim, je souhaite un renseignement pour une séance de kiné à domicile à Tanger.";
  };

  const directWhatsAppUrl = `https://wa.me/${PRACTITIONER_INFO.whatsappNumber}?text=${encodeURIComponent(getWaText())}`;

  return (
    <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-40 flex flex-col gap-2.5 items-end`}>
      {/* Bouton WhatsApp Flottant */}
      <a
        href={directWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('emergencyWhatsApp')}
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-floating hover:brightness-105 active:scale-95 transition-all text-xs font-bold border-2 border-white"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="pr-1 hidden xs:inline">{t('emergencyWhatsApp')}</span>
      </a>
    </div>
  );
}
