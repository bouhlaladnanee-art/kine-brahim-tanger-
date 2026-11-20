import React, { useState } from 'react';
import { CalendarClock, MessageCircle } from 'lucide-react';
import { TIME_SLOTS } from '../../data/constants';
import { appointmentService } from '../../services/appointmentService';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { formatDateLong, getTrackingUrl } from '../../utils/myBookings';

function localIsoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ProposeTimeModal({ appointment, onClose }) {
  const [date, setDate] = useState(appointment.date || localIsoDate(1));
  const [slotId, setSlotId] = useState(TIME_SLOTS[0].id);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const slot = TIME_SLOTS.find(s => s.id === slotId);
  const slotLabel = slot ? `${slot.label} (${slot.hours})` : '';

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await appointmentService.proposeNewTime(appointment.id, {
        date,
        timeSlot: slotId,
        timeSlotLabel: slotLabel,
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(err?.message || "Impossible d'enregistrer la proposition.");
    } finally {
      setSaving(false);
    }
  };

  const trackingLine = appointment.trackingToken
    ? `\n\nVous pouvez accepter ou refuser en un clic ici : ${getTrackingUrl(appointment.trackingToken)}`
    : '\n\nMerci de me répondre ici pour confirmer.';
  const waText = `Bonjour ${appointment.patientName}, je ne suis pas disponible au créneau demandé. Je vous propose le ${formatDateLong(date)}, ${slotLabel}.${message.trim() ? `\n${message.trim()}` : ''}${trackingLine}\n\nBOUHLAL Ibrahim, kinésithérapeute`;
  const waLink = `https://wa.me/${formatWhatsAppNumber(appointment.phone)}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-base text-text-main">Proposer un autre horaire</h3>
        </div>
        <p className="text-sm text-text-muted">
          À {appointment.patientName}. Le patient pourra accepter ou refuser depuis son suivi.
        </p>

        {!sent ? (
          <>
            <label className="block space-y-1">
              <span className="text-sm font-bold text-text-main">Date</span>
              <input
                type="date"
                value={date}
                min={localIsoDate(0)}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-base"
              />
            </label>

            <div className="space-y-1">
              <span className="text-sm font-bold text-text-main">Créneau</span>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlotId(s.id)}
                    className={`rounded-xl border p-2.5 text-sm font-bold ${slotId === s.id ? 'border-primary bg-primary text-white' : 'border-slate-200 text-text-main'}`}
                  >
                    {s.label}
                    <span className={`block text-xs font-medium ${slotId === s.id ? 'text-primary-100' : 'text-text-muted'}`}>{s.hours}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-bold text-text-main">Message (facultatif)</span>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex : Je serai dans votre quartier ce jour-là."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none"
              />
            </label>

            {error && <p className="text-sm text-rose-700">{error}</p>}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={onClose} className="bg-slate-100 text-slate-700 font-bold text-sm py-3 rounded-xl">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !date}
                className="bg-primary text-white font-bold text-sm py-3 rounded-xl disabled:opacity-60"
              >
                {saving ? 'Envoi…' : 'Proposer'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              Proposition enregistrée : <span className="capitalize">{formatDateLong(date)}</span>, {slotLabel}. Elle apparaît déjà dans le suivi du patient.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-sm py-3.5 rounded-xl"
            >
              <MessageCircle className="w-4 h-4" />
              Prévenir le patient sur WhatsApp
            </a>
            <button onClick={onClose} className="w-full text-sm font-semibold text-slate-500 py-2">
              Fermer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
