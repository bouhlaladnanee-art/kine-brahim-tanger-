import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  User
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { getGoogleMapsUrl, getWazeUrl } from '../../utils/maps';
import { generateKineArrivalWhatsAppLink } from '../../utils/whatsapp';

export default function TourTodayTab({ appointments, onUpdateStatus }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeGpsMenuId, setActiveGpsMenuId] = useState(null);

  // Filtrer les rendez-vous confirmés pour la date sélectionnée
  const tourAppointments = appointments
    .filter(a => a.date === selectedDate && (a.status === 'confirme' || a.status === 'accompli'))
    .sort((a, b) => {
      // Tri par tranche horaire ou heure exacte
      const slotOrder = { matin: 1, apres_midi: 2, fin_journee: 3 };
      return (slotOrder[a.timeSlot] || 99) - (slotOrder[b.timeSlot] || 99);
    });

  const completedCount = tourAppointments.filter(a => a.status === 'accompli').length;
  const totalTourCount = tourAppointments.length;

  // Sélecteur rapide de dates (Hier, Aujourd'hui, Demain, Après-demain)
  const dateOptions = [-1, 0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const iso = d.toISOString().split('T')[0];
    let label = 'Aujourd’hui';
    if (offset === -1) label = 'Hier';
    if (offset === 1) label = 'Demain';
    if (offset === 2) {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      label = `${days[d.getDay()]} ${d.getDate()}`;
    }
    return { iso, label, dateObj: d };
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Sélecteur de date de tournée */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-1.5">
        {dateOptions.map(opt => {
          const isSelected = selectedDate === opt.iso;
          return (
            <button
              key={opt.iso}
              onClick={() => setSelectedDate(opt.iso)}
              className={`
                flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all text-center
                ${isSelected 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Résumé de la tournée du jour */}
      <div className="bg-gradient-to-r from-primary to-primary-700 text-white p-4 rounded-2xl shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs text-primary-200 uppercase tracking-wider font-semibold">
            Progression de la tournée
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black">{completedCount} / {totalTourCount}</span>
            <span className="text-xs text-primary-100">séances accomplies</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-sm font-semibold">
            {selectedDate === new Date().toISOString().split('T')[0] ? "Aujourd'hui" : selectedDate}
          </span>
        </div>
      </div>

      {/* Liste des rendez-vous de la tournée */}
      {tourAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-text-main text-sm">
              Aucun passage prévu pour cette date
            </h3>
            <p className="text-xs text-text-muted">
              Consultez l'onglet « Demandes » pour valider de nouvelles réservations.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tourAppointments.map((apt, index) => {
            const isAccomplished = apt.status === 'accompli';
            const mapsUrl = getGoogleMapsUrl(apt);
            const wazeUrl = getWazeUrl(apt);
            const arrivalWaUrl = generateKineArrivalWhatsAppLink(apt.phone, apt.patientName);

            return (
              <Card
                key={apt.id}
                className={`space-y-3 transition-all ${isAccomplished ? 'opacity-70 bg-slate-50/70 border-slate-200' : 'bg-white'}`}
              >
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-800 text-xs font-black flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-text-main flex items-center gap-1.5">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs font-semibold text-primary">
                        {apt.careTypeTitle}
                      </p>
                    </div>
                  </div>

                  <Badge status={apt.status} size="sm">
                    {isAccomplished ? 'Accompli' : apt.timeSlotLabel.split(' ')[0]}
                  </Badge>
                </div>

                {/* Localisation & Adresse */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-text-main">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{apt.neighborhoodName}</span>
                  </div>
                  {apt.addressDetails && (
                    <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
                      {apt.addressDetails}
                    </p>
                  )}
                  {apt.geoCoordinates && (
                    <div className="pl-5 pt-0.5 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      GPS exact (précision ~{apt.geoCoordinates.accuracy || 10}m)
                    </div>
                  )}
                </div>

                {/* Notes patient si présentes */}
                {apt.notes && (
                  <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/60">
                    "{apt.notes}"
                  </div>
                )}

                {/* ACTIONS RAPIDES À UNE MAIN SUR MOBILE */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {/* Ligne 1 : Navigation & Communication */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Bouton GPS (Google Maps / Waze) */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveGpsMenuId(activeGpsMenuId === apt.id ? null : apt.id)}
                        className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-primary" />
                        <span>GPS</span>
                      </button>

                      {/* Dropdown choix Maps / Waze */}
                      {activeGpsMenuId === apt.id && (
                        <div className="absolute left-0 bottom-full mb-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 w-36 space-y-1 text-xs font-semibold animate-in fade-in duration-150">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-1.5 rounded-lg hover:bg-slate-100 text-text-main flex items-center gap-1.5"
                          >
                            <span>🗺️ Google Maps</span>
                          </a>
                          <a
                            href={wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-1.5 rounded-lg hover:bg-slate-100 text-text-main flex items-center gap-1.5"
                          >
                            <span>🚗 Waze</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Bouton Appel Direct */}
                    <a
                      href={`tel:${apt.phone}`}
                      className="bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>Appeler</span>
                    </a>

                    {/* Bouton WhatsApp "10 min" */}
                    <a
                      href={arrivalWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                      title="Prévenir : J'arrive dans 10 min"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>10 min</span>
                    </a>
                  </div>

                  {/* Ligne 2 : Statut de la séance */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!isAccomplished ? (
                      <>
                        <button
                          onClick={() => onUpdateStatus(apt.id, 'accompli')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✅ Accompli</span>
                        </button>
                        <button
                          onClick={() => onUpdateStatus(apt.id, 'annule')}
                          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>❌ Annulé / Absent</span>
                        </button>
                      </>
                    ) : (
                      <div className="col-span-2 flex items-center justify-between bg-primary-50 px-3 py-1.5 rounded-xl text-xs font-bold text-primary">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Séance accomplie avec succès
                        </span>
                        <button
                          onClick={() => onUpdateStatus(apt.id, 'confirme')}
                          className="text-[10px] text-slate-500 underline"
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
