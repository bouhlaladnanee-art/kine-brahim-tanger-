import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { getMyBookings, removeMyBooking, formatDateLong } from '../../utils/myBookings';

// Libellé + couleur du statut, vu côté patient
function statusChip(apt) {
  if (!apt) return { label: '…', cls: 'bg-slate-100 text-slate-500' };
  if (apt.status === 'annule') return { label: 'Annulée', cls: 'bg-slate-100 text-slate-600' };
  if (apt.status === 'accompli') return { label: 'Effectuée', cls: 'bg-primary-50 text-primary-700' };
  if (apt.status === 'confirme') return { label: 'Confirmée', cls: 'bg-emerald-50 text-emerald-700' };
  if (apt.proposedDate) return { label: 'Nouvel horaire proposé', cls: 'bg-amber-100 text-amber-900' };
  return { label: 'En attente', cls: 'bg-amber-50 text-amber-800' };
}

export default function MyBookingsCard() {
  const [bookings] = useState(() => getMyBookings().slice(0, 3));
  const [live, setLive] = useState({});

  useEffect(() => {
    let cancelled = false;
    bookings.forEach(async (b) => {
      try {
        const data = await appointmentService.getByToken(b.token);
        if (cancelled) return;
        if (!data) {
          removeMyBooking(b.token);
          return;
        }
        setLive(prev => ({ ...prev, [b.token]: data }));
      } catch {
        // Hors ligne : on affiche le résumé mémorisé
      }
    });
    return () => { cancelled = true; };
  }, [bookings]);

  if (bookings.length === 0) return null;

  return (
    <section className="px-4 pt-4 sm:px-6">
      <h2 className="text-sm font-extrabold text-text-main mb-2">Mes réservations</h2>
      <div className="space-y-2">
        {bookings.map((b) => {
          const apt = live[b.token];
          const chip = statusChip(apt);
          const date = apt?.date || b.date;
          const slot = apt?.timeSlotLabel || b.timeSlotLabel;
          return (
            <Link
              key={b.token}
              to={`/suivi/${b.token}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-primary-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-main capitalize truncate">{formatDateLong(date)}</p>
                <p className="text-xs text-text-muted truncate">{slot} • {apt?.patientName || b.patientName}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${chip.cls}`}>{chip.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
