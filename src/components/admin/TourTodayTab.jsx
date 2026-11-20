import React, { useState } from 'react';
import { Navigation, Phone, MessageCircle, Check, MapPin, FileText } from 'lucide-react';
import ExercisesModal from './ExercisesModal';
import { getGoogleMapsUrl, getWazeUrl } from '../../utils/maps';
import { generateKineArrivalWhatsAppLink } from '../../utils/whatsapp';

const SLOT_ORDER = { matin: 1, apres_midi: 2, fin_journee: 3 };
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function dayOptions() {
  return [0, 1, 2, 3].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const label = offset === 0 ? "Aujourd'hui" : offset === 1 ? 'Demain' : `${DAY_NAMES[d.getDay()]} ${d.getDate()}`;
    return { iso: d.toISOString().split('T')[0], label };
  });
}

export default function TourTodayTab({ appointments, onUpdateStatus, onOpenInvoice }) {
  const days = dayOptions();
  const [selectedDate, setSelectedDate] = useState(days[0].iso);
  const [exerciseApt, setExerciseApt] = useState(null);

  const visits = appointments
    .filter(a => a.date === selectedDate && (a.status === 'confirme' || a.status === 'accompli'))
    .sort((a, b) => (SLOT_ORDER[a.timeSlot] || 99) - (SLOT_ORDER[b.timeSlot] || 99));
  const doneCount = visits.filter(a => a.status === 'accompli').length;

  const markAbsent = (apt) => {
    if (window.confirm(`Marquer ${apt.patientName} comme absent / annulé ?`)) {
      onUpdateStatus(apt.id, 'annule');
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-text-main">Tournée</h2>
        {visits.length > 0 && (
          <span className="text-sm text-text-muted">{doneCount}/{visits.length} faites</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {days.map(d => (
          <button
            key={d.iso}
            onClick={() => setSelectedDate(d.iso)}
            className={`py-2.5 rounded-xl text-sm font-bold ${selectedDate === d.iso ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {visits.length === 0 && (
        <p className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-text-muted">
          Aucune visite prévue ce jour-là.
        </p>
      )}

      {visits.map((apt, index) => {
        const done = apt.status === 'accompli';
        return (
          <article
            key={apt.id}
            className={`rounded-2xl border p-4 space-y-3 ${done ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-primary uppercase">
                  {index + 1}. {(apt.timeSlotLabel || 'Horaire à préciser').split('(')[0].trim()}
                </p>
                <p className={`text-lg font-bold ${done ? 'text-slate-500' : 'text-text-main'}`}>{apt.patientName}</p>
                <p className="text-sm text-text-muted">{apt.careTypeTitle}</p>
              </div>
              {done && (
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-700">
                  <Check className="w-4 h-4" /> Faite
                </span>
              )}
            </div>

            {!done && (
              <>
                <div className="text-sm text-text-main flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {apt.neighborhoodName}
                    {apt.addressDetails && <span className="text-text-muted">, {apt.addressDetails}</span>}
                    <a href={getWazeUrl(apt)} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary font-semibold underline">
                      Waze
                    </a>
                  </span>
                </div>
                {apt.notes && <p className="text-sm text-text-muted italic">« {apt.notes} »</p>}

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={getGoogleMapsUrl(apt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 bg-primary-50 text-primary-800 rounded-xl py-2.5 text-xs font-bold"
                  >
                    <Navigation className="w-5 h-5" /> Itinéraire
                  </a>
                  <a
                    href={`tel:${apt.phone}`}
                    className="flex flex-col items-center gap-1 bg-slate-100 text-text-main rounded-xl py-2.5 text-xs font-bold"
                  >
                    <Phone className="w-5 h-5" /> Appeler
                  </a>
                  <a
                    href={generateKineArrivalWhatsAppLink(apt.phone, apt.patientName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 bg-[#25D366]/15 text-[#128C7E] rounded-xl py-2.5 text-xs font-bold"
                  >
                    <MessageCircle className="w-5 h-5" /> J'arrive
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'accompli')}
                    className="col-span-2 bg-emerald-600 text-white rounded-xl py-3.5 text-base font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Séance faite
                  </button>
                  <button
                    onClick={() => markAbsent(apt)}
                    className="bg-slate-100 text-slate-600 rounded-xl py-3.5 text-sm font-bold"
                  >
                    Absent
                  </button>
                </div>
              </>
            )}

            {done && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExerciseApt(apt)}
                  className="bg-[#25D366]/15 text-[#128C7E] rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" /> Exercices
                </button>
                <button
                  onClick={() => onOpenInvoice?.(apt)}
                  className="bg-white border border-slate-200 text-text-main rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Attestation
                </button>
                <button
                  onClick={() => onUpdateStatus(apt.id, 'confirme')}
                  className="col-span-2 text-xs text-slate-500 underline"
                >
                  Annuler « faite »
                </button>
              </div>
            )}
          </article>
        );
      })}

      {exerciseApt && <ExercisesModal appointment={exerciseApt} onClose={() => setExerciseApt(null)} />}
    </section>
  );
}
