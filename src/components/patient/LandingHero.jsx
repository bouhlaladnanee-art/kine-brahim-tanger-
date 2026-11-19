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
  CheckCircle2
} from 'lucide-react';
import Button from '../common/Button';
import { PRACTITIONER_INFO } from '../../data/constants';
import { availabilityService } from '../../services/availabilityService';

export default function LandingHero({ onStartBooking }) {
  const nextAvailability = availabilityService.getNextAvailabilityText();
  return (
    <div className="relative overflow-hidden bg-white rounded-b-3xl border-b border-slate-100 shadow-sm">
      {/* Fond décoratif subtil aux couleurs vert sauge et corail */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-70" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-50 rounded-full blur-2xl -z-10 -translate-x-1/4 translate-y-1/4 opacity-60" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Badge disponibilité Tanger en temps réel */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-100/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nextAvailability}</span>
          </span>
          <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-accent" /> Tanger intra-muros
          </span>
        </div>

        {/* Profil du Kinésithérapeute */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Avatar / Photo professionnelle soignée */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-0.5 shadow-soft flex items-center justify-center text-white text-2xl font-black overflow-hidden relative group">
              <div className="w-full h-full bg-primary-700 flex flex-col items-center justify-center rounded-[14px]">
                <span className="text-2xl font-bold tracking-tight">BM</span>
                <span className="text-[9px] uppercase tracking-wider text-primary-200 font-semibold">Kiné</span>
              </div>
              <div className="absolute bottom-1 right-1 bg-white text-primary rounded-full p-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main leading-tight">
                {PRACTITIONER_INFO.name}
              </h1>
            </div>
            <p className="text-xs font-bold text-primary">
              {PRACTITIONER_INFO.title}
            </p>
            <p className="text-[11px] text-text-muted leading-tight line-clamp-2">
              Soins & Rééducation exclusivement à votre domicile à Tanger
            </p>
          </div>
        </div>

        {/* Bio courte rassurante */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-xs text-text-main leading-relaxed">
          <p>
            {PRACTITIONER_INFO.bio}
          </p>
        </div>

        {/* Carte de Tarification transparente en MAD */}
        <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50/40 p-4 rounded-2xl border border-primary-100 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                Tarification transparente
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-text-main">
                  À partir de {PRACTITIONER_INFO.basePriceMAD} DH
                </span>
                <span className="text-xs text-text-muted">/ séance</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-white text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg border border-primary-200/60 shadow-xs">
                Paiement sur place
              </span>
              <p className="text-[10px] text-text-muted mt-1">Facture / Attestation mutuelle</p>
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-primary-100/80 flex flex-wrap gap-y-1 gap-x-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Matériel apporté à domicile
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Durée : 45 à 60 min
            </span>
          </div>
        </div>

        {/* Bouton CTA Principal Corail */}
        <div className="space-y-2 pt-1">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={onStartBooking}
            icon={ArrowRight}
            iconPosition="right"
            className="shadow-lg shadow-accent/25 py-4 text-base font-bold"
          >
            Prendre rendez-vous en ligne
          </Button>
          <p className="text-center text-[11px] text-text-muted">
            Réservation rapide en 4 étapes • Réponse sous 30 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
