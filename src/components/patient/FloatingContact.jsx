import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { PRACTITIONER_INFO } from '../../data/constants';

export default function FloatingContact() {
  const directWhatsAppUrl = `https://wa.me/${PRACTITIONER_INFO.whatsappNumber}?text=${encodeURIComponent("Bonjour Brahim, je souhaite un renseignement pour une séance de kiné à domicile à Tanger.")}`;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 items-end">
      {/* Bouton WhatsApp Flottant */}
      <a
        href={directWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter sur WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-floating hover:brightness-105 active:scale-95 transition-all text-xs font-bold border-2 border-white"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="pr-1 hidden xs:inline">WhatsApp direct</span>
      </a>
    </div>
  );
}
