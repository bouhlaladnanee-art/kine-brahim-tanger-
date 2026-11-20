import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  MessageCircle,
  RefreshCw,
  XCircle,
  CalendarClock,
} from 'lucide-react';
import Header from '../components/common/Header';
import { appointmentService } from '../services/appointmentService';
import { PRACTITIONER_INFO } from '../data/constants';
import { formatDateLong, getTrackingUrl, saveMyBooking } from '../utils/myBookings';

const REFRESH_MS = 20000;

// Traduit l'état brut de la demande en un message clair pour le patient
function describe(apt) {
  if (apt.status === 'annule') {
    return apt.patientResponse === 'annule_par_patient'
      ? { key: 'cancelled_by_me', tone: 'slate', icon: XCircle, title: 'Demande annulée', text: 'Vous avez annulé cette demande.' }
      : { key: 'declined', tone: 'rose', icon: XCircle, title: 'Créneau non disponible', text: "Ibrahim n'a pas pu retenir cette demande. Écrivez-lui sur WhatsApp pour trouver un autre moment." };
  }
  if (apt.status === 'accompli') {
    return { key: 'done', tone: 'primary', icon: CheckCircle2, title: 'Séance effectuée', text: 'Merci pour votre confiance. Votre attestation pour la mutuelle / CNSS est disponible sur demande.' };
  }
  if (apt.status === 'confirme') {
    return { key: 'confirmed', tone: 'emerald', icon: CheckCircle2, title: 'Rendez-vous confirmé', text: "Ibrahim vous préviendra sur WhatsApp environ 10 minutes avant son arrivée." };
  }
  if (apt.proposedDate) {
    return { key: 'proposal', tone: 'amber', icon: CalendarClock, title: 'Nouvel horaire proposé', text: "Ibrahim n'est pas disponible au créneau demandé et vous propose un autre horaire." };
  }
  if (apt.patientResponse === 'refuse') {
    return { key: 'refused', tone: 'amber', icon: Hourglass, title: 'En attente', text: "Vous avez refusé l'horaire proposé. Ibrahim va revenir vers vous rapidement." };
  }
  return { key: 'pending', tone: 'amber', icon: Hourglass, title: 'En attente de confirmation', text: 'Ibrahim a bien reçu votre demande et vous répond en général dans la journée.' };
}

const TONES = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  primary: 'bg-primary-50 border-primary-200 text-primary-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
  slate: 'bg-slate-100 border-slate-200 text-slate-800',
};

export default function BookingTracking() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [apt, setApt] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | notfound | error
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await appointmentService.getByToken(token);
      if (!data) {
        setState('notfound');
        return;
      }
      setApt(data);
      setState('ready');
      // Mémorise la demande sur cet appareil (utile si le lien est ouvert depuis WhatsApp)
      saveMyBooking({
        token,
        patientName: data.patientName,
        careTypeTitle: data.careTypeTitle,
        date: data.date,
        timeSlotLabel: data.timeSlotLabel,
      });
    } catch (err) {
      console.error('Suivi indisponible :', err);
      setState(prev => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_MS);
    const onFocus = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  const run = async (action) => {
    setBusy(true);
    setActionError('');
    try {
      const data = await action();
      if (data) setApt(data);
      else await load();
    } catch (err) {
      setActionError(err?.message || 'Action impossible pour le moment. Réessayez ou contactez Ibrahim sur WhatsApp.');
    } finally {
      setBusy(false);
    }
  };

  const waText = apt
    ? `Bonjour Ibrahim, je vous écris au sujet de ma demande de kiné à domicile (${apt.patientName}, ${formatDateLong(apt.date)}). Suivi : ${getTrackingUrl(token)}`
    : `Bonjour Ibrahim, je vous écris au sujet de ma demande de kiné à domicile.`;
  const waLink = `https://wa.me/${PRACTITIONER_INFO.whatsappNumber}?text=${encodeURIComponent(waText)}`;

  const info = apt ? describe(apt) : null;
  const canCancel = apt && (apt.status === 'en_attente' || apt.status === 'confirme');

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <Header showBack onBack={() => navigate('/')} title="Suivi de ma réservation" subtitle="Kiné à domicile • Tanger" />

      <div className="flex-1 p-4 sm:p-6 space-y-5">
        {state === 'loading' && (
          <p className="text-sm text-text-muted text-center pt-10">Chargement de votre réservation…</p>
        )}

        {state === 'notfound' && (
          <div className="text-center space-y-3 pt-8">
            <p className="text-base font-bold text-text-main">Réservation introuvable</p>
            <p className="text-sm text-text-muted">Ce lien de suivi n'est plus valable. Contactez Ibrahim sur WhatsApp.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center space-y-3 pt-8">
            <p className="text-base font-bold text-text-main">Suivi momentanément indisponible</p>
            <p className="text-sm text-text-muted">Vérifiez votre connexion internet puis réessayez.</p>
            <button onClick={load} className="inline-flex items-center gap-2 text-sm font-bold text-primary py-2 px-4">
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        )}

        {state === 'ready' && apt && info && (
          <>
            {/* Statut principal */}
            <div className={`rounded-2xl border p-4 space-y-1.5 ${TONES[info.tone]}`}>
              <div className="flex items-center gap-2">
                <info.icon className="w-5 h-5 shrink-0" />
                <h2 className="text-lg font-extrabold">{info.title}</h2>
              </div>
              <p className="text-sm leading-relaxed">{info.text}</p>
            </div>

            {/* Proposition d'un autre horaire */}
            {info.key === 'proposal' && (
              <div className="rounded-2xl border-2 border-amber-300 p-4 space-y-3">
                <p className="text-sm text-text-muted">Horaire proposé par Ibrahim :</p>
                <p className="text-lg font-extrabold text-text-main capitalize">{formatDateLong(apt.proposedDate)}</p>
                <p className="text-base font-semibold text-text-main">{apt.proposedTimeLabel}</p>
                {apt.kineMessage && (
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">« {apt.kineMessage} »</p>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={busy}
                    onClick={() => run(() => appointmentService.respondToProposal(token, true))}
                    className="bg-primary text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" /> J'accepte
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => run(() => appointmentService.respondToProposal(token, false))}
                    className="bg-slate-100 text-slate-700 font-bold text-sm py-3.5 rounded-xl disabled:opacity-60"
                  >
                    Ça ne me convient pas
                  </button>
                </div>
              </div>
            )}

            {actionError && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{actionError}</p>
            )}

            {/* Récapitulatif */}
            <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between gap-3 p-3.5">
                <span className="text-text-muted">Patient</span>
                <span className="font-semibold text-text-main text-right">{apt.patientName}</span>
              </div>
              <div className="flex justify-between gap-3 p-3.5">
                <span className="text-text-muted">Soin</span>
                <span className="font-semibold text-text-main text-right">{apt.careTypeTitle}</span>
              </div>
              <div className="flex justify-between gap-3 p-3.5">
                <span className="text-text-muted flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</span>
                <span className="font-semibold text-text-main text-right capitalize">{formatDateLong(apt.date)}</span>
              </div>
              <div className="flex justify-between gap-3 p-3.5">
                <span className="text-text-muted flex items-center gap-1.5"><Clock className="w-4 h-4" /> Créneau</span>
                <span className="font-semibold text-text-main text-right">{apt.timeSlotLabel || 'À préciser'}</span>
              </div>
              <div className="flex justify-between gap-3 p-3.5">
                <span className="text-text-muted">Tarif</span>
                <span className="font-semibold text-text-main text-right">À partir de {PRACTITIONER_INFO.basePriceMAD} DH, en espèces après la séance</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm py-3.5 rounded-2xl"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Écrire à Ibrahim sur WhatsApp</span>
              </a>

              {canCancel && (
                <button
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm('Annuler cette demande de rendez-vous ?')) {
                      run(() => appointmentService.cancelByToken(token));
                    }
                  }}
                  className="w-full text-sm font-semibold text-slate-500 hover:text-rose-700 py-2.5 disabled:opacity-60"
                >
                  Annuler ma demande
                </button>
              )}
            </div>

            <p className="text-xs text-text-muted text-center flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Cette page se met à jour automatiquement.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
