import React, { useState } from 'react';
import { Check, X, Clock, MapPin, FileText, Phone, MessageCircle, CalendarPlus } from 'lucide-react';
import PrescriptionModal from './PrescriptionModal';
import ProposeTimeModal from './ProposeTimeModal';
import { generateGoogleCalendarUrl } from '../../utils/calendar';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { formatDateLong, getTrackingUrl } from '../../utils/myBookings';

function confirmationMessage(apt) {
  const tracking = apt.trackingToken ? `\n\nSuivi de votre rendez-vous : ${getTrackingUrl(apt.trackingToken)}` : '';
  return `Bonjour ${apt.patientName}, votre séance de kinésithérapie à domicile du ${formatDateLong(apt.date)} (${apt.timeSlotLabel}) est confirmée. À bientôt !\nBOUHLAL Ibrahim${tracking}`;
}

export default function RequestsTab({ appointments, onUpdateStatus }) {
  const [prescription, setPrescription] = useState(null);
  const [acceptedApt, setAcceptedApt] = useState(null);
  const [proposeApt, setProposeApt] = useState(null);

  const pending = appointments.filter(a => a.status === 'en_attente');
  if (pending.length === 0 && !acceptedApt) return null;

  const accept = (apt) => {
    onUpdateStatus(apt.id, 'confirme');
    setAcceptedApt(apt);
  };

  const decline = (apt) => {
    if (window.confirm(`Refuser la demande de ${apt.patientName} ?`)) {
      onUpdateStatus(apt.id, 'annule');
    }
  };

  return (
    <section className="space-y-3">
      {pending.length > 0 && (
        <h2 className="text-lg font-bold text-text-main">
          À valider <span className="text-amber-600">({pending.length})</span>
        </h2>
      )}

      {pending.map((apt) => (
        <article key={apt.id} className="bg-white rounded-2xl border-2 border-amber-200 p-4 space-y-3">
          <div>
            <p className="text-lg font-bold text-text-main">{apt.patientName}</p>
            <p className="text-sm text-primary font-semibold">{apt.careTypeTitle}</p>
          </div>

          <div className="space-y-1.5 text-sm text-text-main">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="capitalize font-semibold">{formatDateLong(apt.date)}</span>
              <span className="text-text-muted">• {(apt.timeSlotLabel || 'Créneau à préciser').split('(')[0].trim()}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {apt.neighborhoodName}
                {apt.addressDetails && <span className="text-text-muted">, {apt.addressDetails}</span>}
                {apt.geoCoordinates && <span className="text-emerald-700 font-semibold"> • GPS</span>}
              </span>
            </p>
            {apt.notes && <p className="text-text-muted italic">« {apt.notes} »</p>}
            {apt.prescriptionUrl && (
              <button
                onClick={() => setPrescription({ url: apt.prescriptionUrl, name: apt.prescriptionFileName })}
                className="flex items-center gap-2 text-primary font-semibold"
              >
                <FileText className="w-4 h-4" /> Voir l'ordonnance
              </button>
            )}
          </div>

          {apt.proposedDate && (
            <p className="text-sm bg-amber-50 text-amber-900 rounded-xl p-3">
              Vous avez proposé le <span className="capitalize font-semibold">{formatDateLong(apt.proposedDate)}</span>, {apt.proposedTimeLabel}. En attente du patient.
            </p>
          )}
          {!apt.proposedDate && apt.patientResponse === 'refuse' && (
            <p className="text-sm bg-rose-50 text-rose-800 rounded-xl p-3">
              Le patient a refusé l'horaire proposé.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${apt.phone}`}
              className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-text-main"
            >
              <Phone className="w-4 h-4" /> Appeler
            </a>
            <a
              href={`https://wa.me/${formatWhatsAppNumber(apt.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-[#128C7E]"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          <button
            onClick={() => accept(apt)}
            className="w-full bg-primary text-white rounded-xl py-3.5 text-base font-bold flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Accepter
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setProposeApt(apt)}
              className="bg-amber-50 text-amber-900 rounded-xl py-3 text-sm font-bold"
            >
              Autre horaire
            </button>
            <button
              onClick={() => decline(apt)}
              className="bg-slate-100 text-slate-700 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" /> Refuser
            </button>
          </div>
        </article>
      ))}

      {acceptedApt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3">
            <p className="text-lg font-bold text-text-main">Rendez-vous confirmé</p>
            <p className="text-sm text-text-muted">
              {acceptedApt.patientName}, <span className="capitalize">{formatDateLong(acceptedApt.date)}</span>. Il apparaît dans votre tournée.
            </p>
            <a
              href={`https://wa.me/${formatWhatsAppNumber(acceptedApt.phone)}?text=${encodeURIComponent(confirmationMessage(acceptedApt))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white rounded-xl py-3.5 text-base font-bold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> Prévenir le patient
            </a>
            <a
              href={generateGoogleCalendarUrl(acceptedApt)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-100 text-text-main rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" /> Ajouter à mon agenda
            </a>
            <button onClick={() => setAcceptedApt(null)} className="w-full text-sm font-semibold text-slate-500 py-2">
              Fermer
            </button>
          </div>
        </div>
      )}

      {proposeApt && <ProposeTimeModal appointment={proposeApt} onClose={() => setProposeApt(null)} />}

      {prescription && (
        <PrescriptionModal
          imageUrl={prescription.url}
          fileName={prescription.name}
          onClose={() => setPrescription(null)}
        />
      )}
    </section>
  );
}
