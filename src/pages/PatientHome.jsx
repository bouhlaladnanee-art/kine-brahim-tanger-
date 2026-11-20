import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Header from '../components/common/Header';
import LandingHero from '../components/patient/LandingHero';
import BookingFlow from '../components/patient/BookingFlow';
import { PRACTITIONER_INFO } from '../data/constants';
import { useLanguage } from '../context/LanguageContext';

export default function PatientHome() {
  const { t } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleStartBooking = () => {
    setIsBookingOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <Header
        showBack={isBookingOpen}
        onBack={handleCloseBooking}
        title={isBookingOpen ? "Réservation en ligne" : PRACTITIONER_INFO.name}
        subtitle={isBookingOpen ? "Tanger • Prise de rendez-vous express" : t('appTitle')}
      />

      {/* Pages distinctes : SOIT la Fiche de présentation, SOIT le Formulaire par étapes */}
      {isBookingOpen ? (
        <BookingFlow
          onCancel={handleCloseBooking}
          onCompleted={(apt) => {
            console.log("Nouvelle réservation effectuée :", apt);
          }}
        />
      ) : (
        /* PAGE UNIQUE : FICHE DE PRÉSENTATION MÉDICALE OFFICIELLE */
        <div className="flex-1 flex flex-col justify-between">
          <LandingHero onStartBooking={handleStartBooking} />

          {/* Footer discret avec lien Espace Kiné (/admin) */}
          <footer className="p-4 text-center border-t border-slate-100 bg-white/50 space-y-2 mt-6">
            <p className="text-[11px] text-text-muted">
              © {new Date().getFullYear()} {PRACTITIONER_INFO.name} — Kinésithérapie à domicile à Tanger.
            </p>
            <div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-[11px] py-1 px-2.5 rounded-lg border border-slate-200 bg-white shadow-xs"
              >
                <Lock className="w-3 h-3 text-primary" />
                <span>{t('adminSpace')}</span>
              </Link>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
