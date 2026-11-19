import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Heart, Shield, Award } from 'lucide-react';
import Header from '../components/common/Header';
import LandingHero from '../components/patient/LandingHero';
import SpecialtiesGrid from '../components/patient/SpecialtiesGrid';
import TrustBanner from '../components/patient/TrustBanner';
import FloatingContact from '../components/patient/FloatingContact';
import BookingFlow from '../components/patient/BookingFlow';
import { PRACTITIONER_INFO } from '../data/constants';

export default function PatientHome() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const handleStartBooking = (specialtyId = null) => {
    setSelectedSpecialty(specialtyId);
    setIsBookingOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedSpecialty(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <Header
        showBack={isBookingOpen}
        onBack={handleCloseBooking}
        title={isBookingOpen ? "Réservation à Domicile" : PRACTITIONER_INFO.name}
        subtitle={isBookingOpen ? "Tanger • Étape par étape" : "Kiné à Domicile • Tanger"}
      />

      {/* Affichage conditionnel : Tunnel de réservation OU Landing Page */}
      {isBookingOpen ? (
        <BookingFlow
          initialCareType={selectedSpecialty}
          onCancel={handleCloseBooking}
          onCompleted={(apt) => {
            console.log("Nouvelle réservation effectuée :", apt);
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col pb-16 space-y-2">
          {/* Hero & Profil */}
          <LandingHero onStartBooking={() => handleStartBooking()} />

          {/* Grille des soins et motifs */}
          <SpecialtiesGrid onSelectSpecialty={(id) => handleStartBooking(id)} />

          {/* Bannière de réassurance & quartiers */}
          <TrustBanner />

          {/* Bouton d'action flottant d'urgence */}
          <FloatingContact />

          {/* Footer discret avec accès Espace Kiné (/admin) */}
          <footer className="mt-8 p-6 text-center border-t border-slate-100 space-y-3 bg-white/50">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} {PRACTITIONER_INFO.name} — Kinésithérapie à domicile à Tanger.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors py-1 px-2.5 rounded-lg border border-slate-200 bg-white shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Espace Praticien (Admin)</span>
              </Link>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
