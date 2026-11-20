import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Check, 
  X, 
  Sparkles, 
  Info, 
  Calendar, 
  Clock, 
  Lock,
  Unlock,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { TIME_SLOTS } from '../../data/constants';
import { availabilityService } from '../../services/availabilityService';

const DAYS_OF_WEEK = [
  { index: 6, name: 'Samedi', short: 'Sam', isWeekend: true },
  { index: 0, name: 'Dimanche', short: 'Dim', isWeekend: true },
  { index: 1, name: 'Lundi', short: 'Lun', isWeekend: false },
  { index: 2, name: 'Mardi', short: 'Mar', isWeekend: false },
  { index: 3, name: 'Mercredi', short: 'Mer', isWeekend: false },
  { index: 4, name: 'Jeudi', short: 'Jeu', isWeekend: false },
  { index: 5, name: 'Vendredi', short: 'Ven', isWeekend: false },
];

export default function AvailabilityTab() {
  const [config, setConfig] = useState(() => availabilityService.getConfig());
  const [activeSubTab, setActiveSubTab] = useState('weekly'); // 'weekly' | 'calendar'
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = availabilityService.subscribe((newConfig) => {
      setConfig({ ...newConfig });
    });
    return () => unsubscribe();
  }, []);

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3500);
  };

  const handleToggleWeekly = async (dayIndex, slotId) => {
    setIsSyncing(true);
    const res = await availabilityService.toggleWeeklySlot(dayIndex, slotId);
    setIsSyncing(false);
    if (res?.success) {
      showFeedback("✅ Synchronisé en direct sur le Cloud !");
    } else {
      showFeedback("⚠️ Enregistré en local (Erreur Cloud : " + (res?.error || 'Réseau') + ")");
    }
  };

  const handleSetDayAll = async (dayIndex, active) => {
    setIsSyncing(true);
    const slotIds = active ? ['matin', 'apres_midi', 'fin_journee'] : [];
    const res = await availabilityService.setDaySlots(dayIndex, slotIds);
    setIsSyncing(false);
    if (res?.success) {
      showFeedback(active ? "✅ Journée entièrement déverrouillée !" : "✅ Journée verrouillée !");
    } else {
      showFeedback("⚠️ Enregistré en local");
    }
  };

  const handleUnlockAllWeekdays = async () => {
    setIsSyncing(true);
    const res = await availabilityService.unlockAllWeekdays();
    setIsSyncing(false);
    if (res?.success) {
      showFeedback("✅ Toute la semaine (Lun–Ven) a été déverrouillée !");
    } else {
      showFeedback("⚠️ Enregistré en local");
    }
  };

  const handleLockAllWeekdays = async () => {
    setIsSyncing(true);
    const res = await availabilityService.lockAllWeekdays();
    setIsSyncing(false);
    if (res?.success) {
      showFeedback("✅ Semaine verrouillée (créneaux vides par défaut)");
    } else {
      showFeedback("⚠️ Enregistré en local");
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Rétablir les disponibilités par défaut ? (Week-ends complets ouverts, semaine verrouillée vide)")) return;
    setIsSyncing(true);
    const res = await availabilityService.resetToDefaults();
    setIsSyncing(false);
    if (res?.success) {
      showFeedback("✅ Profil par défaut réinitialisé avec succès !");
    } else {
      showFeedback("⚠️ Enregistré en local");
    }
  };

  const handleToggleCustomSlot = async (dateISO, slotId) => {
    setIsSyncing(true);
    const res = await availabilityService.toggleCustomDateSlot(dateISO, slotId);
    setIsSyncing(false);
    if (res?.success) {
      showFeedback("✅ Créneau synchronisé sur le Cloud !");
    } else {
      showFeedback("⚠️ Enregistré en local");
    }
  };

  const handleToggleBlockDate = async (dateISO) => {
    setIsSyncing(true);
    const res = await availabilityService.toggleBlockDate(dateISO);
    setIsSyncing(false);
    if (res?.success) {
      showFeedback("✅ Date synchronisée sur le Cloud !");
    } else {
      showFeedback("⚠️ Enregistré en local");
    }
  };

  // Liste des 14 prochains jours pour l'ajustement ponctuel
  const upcomingDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    const isToday = i === 0;
    const isTomorrow = i === 1;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    let sublabel = '';
    if (isToday) sublabel = "Aujourd'hui";
    if (isTomorrow) sublabel = 'Demain';
    else if (isWeekend) sublabel = 'Week-end';

    return {
      iso,
      title: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
      sublabel,
      dateObj: d,
      isWeekend,
      slots: availabilityService.getAvailableSlotsForDate(iso),
      isBlocked: config.blockedDates?.includes(iso)
    };
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Bannière principale */}
      <div className="bg-gradient-to-r from-primary to-primary-800 text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-sm">
              <CalendarClock className="w-3.5 h-3.5 text-accent-300" /> Gestion des Disponibilités
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloud Supabase actif
            </span>
          </div>
          <h2 className="text-lg font-black">Planning & Heures d'intervention</h2>
          <p className="text-xs text-primary-100 leading-relaxed">
            <strong>Règle actuelle :</strong> Week-ends activés par défaut (Matin, Midi, Soir). En semaine : créneaux vides par défaut, vous pouvez déverrouiller n'importe quel jour ou horaire en 1 clic.
          </p>
        </div>

        {/* Barre d'actions rapides */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-white/20">
          <button
            type="button"
            onClick={handleLockAllWeekdays}
            className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl transition-all border border-white/20 flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Verrouiller la semaine (Par défaut)</span>
          </button>
          <button
            type="button"
            onClick={handleUnlockAllWeekdays}
            className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl transition-all border border-white/20 flex items-center gap-1"
          >
            <Unlock className="w-3 h-3 text-emerald-300" />
            <span>Tout déverrouiller en semaine</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl transition-all border border-white/20 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-sky-300" />
            <span>Réinitialiser</span>
          </button>
        </div>

        {feedbackMessage && (
          <div className="bg-white text-primary text-xs font-bold p-2.5 rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Sélecteur de sous-onglet */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
        <button
          onClick={() => setActiveSubTab('weekly')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'weekly' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Planning Hebdomadaire Type
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'calendar' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Ajustement par Date (14 jours)
        </button>
      </div>

      {/* ---------------- MODE 1 : PLANNING HEBDOMADAIRE TYPE ---------------- */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-text-muted flex items-center gap-2 shadow-xs">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Cliquez sur un créneau (Matinée, Après-midi, Soirée) pour le déverrouiller ou le verrouiller.</span>
          </div>

          <div className="space-y-2.5">
            {DAYS_OF_WEEK.map(day => {
              const activeSlots = config.weeklyTemplate[day.index] || [];
              const isAllOpen = activeSlots.length === TIME_SLOTS.length;
              const hasAnyActive = activeSlots.length > 0;

              return (
                <Card 
                  key={day.index} 
                  className={`p-3.5 space-y-2.5 transition-all ${
                    day.isWeekend 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : (hasAnyActive ? 'border-primary-200 bg-white' : 'border-slate-200 bg-slate-50/60')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center ${
                        day.isWeekend 
                          ? 'bg-emerald-600 text-white' 
                          : (hasAnyActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600')
                      }`}>
                        {day.short}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-text-main">{day.name}</h4>
                          {day.isWeekend ? (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Week-end (Ouvert par défaut)
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              hasAnyActive 
                                ? 'bg-primary-50 text-primary border-primary-200' 
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}>
                              {hasAnyActive ? `Déverrouillé (${activeSlots.length}/3)` : 'Verrouillé par défaut'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted block mt-0.5">
                          {hasAnyActive 
                            ? `${activeSlots.length} créneau(x) ouvert(s) à la réservation` 
                            : 'Aucun créneau ouvert (Journée bloquée pour les patients)'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Bouton rapide d'activation / désactivation du jour complet */}
                    <button
                      type="button"
                      onClick={() => handleSetDayAll(day.index, !isAllOpen)}
                      className={`text-[11px] font-bold py-1 px-2.5 rounded-xl border transition-colors ${
                        isAllOpen 
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {isAllOpen ? 'Tout verrouiller' : 'Tout déverrouiller'}
                    </button>
                  </div>

                  {/* Boutons des 3 créneaux horaires */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {TIME_SLOTS.map(slot => {
                      const isSlotActive = activeSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleToggleWeekly(day.index, slot.id)}
                          className={`
                            py-2.5 px-2 rounded-xl text-center text-xs transition-all font-semibold border flex flex-col items-center justify-center gap-0.5
                            ${isSlotActive
                              ? 'bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30 font-bold'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-1">
                            {isSlotActive ? (
                              <Unlock className="w-3 h-3 text-accent-300" />
                            ) : (
                              <Lock className="w-3 h-3 text-slate-400" />
                            )}
                            <span className="font-bold text-[11px] leading-tight">{slot.label}</span>
                          </div>
                          <span className={`text-[9px] ${isSlotActive ? 'text-primary-100' : 'text-slate-400'}`}>
                            {slot.hours}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- MODE 2 : AJUSTEMENT DATE PAR DATE ---------------- */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-text-muted flex items-center gap-2 shadow-xs">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Ajustez ponctuellement vos créneaux pour les 14 prochains jours selon vos impératifs.</span>
          </div>

          <div className="space-y-2.5">
            {upcomingDays.map(dayItem => {
              const activeSlotIds = dayItem.slots.map(s => s.id);

              return (
                <Card 
                  key={dayItem.iso} 
                  className={`p-3.5 space-y-2.5 transition-all ${
                    dayItem.isBlocked 
                      ? 'bg-rose-50/40 border-rose-200' 
                      : (dayItem.isWeekend ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-slate-200')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-text-main">{dayItem.title}</h4>
                        {dayItem.sublabel && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            dayItem.isWeekend 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                              : 'bg-accent-50 text-accent border-accent-200'
                          }`}>
                            {dayItem.sublabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {dayItem.isBlocked 
                          ? '🚫 Date bloquée (aucun créneau disponible)' 
                          : `${dayItem.slots.length} créneau(x) ouvert(s)`
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBlockDate(dayItem.iso)}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-colors ${
                        dayItem.isBlocked 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {dayItem.isBlocked ? 'Débloquer' : 'Bloquer le jour'}
                    </button>
                  </div>

                  {!dayItem.isBlocked && (
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {TIME_SLOTS.map(slot => {
                        const isSlotActive = activeSlotIds.includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleToggleCustomSlot(dayItem.iso, slot.id)}
                            className={`
                              py-2 px-1.5 rounded-xl text-center text-xs transition-all font-semibold border flex flex-col items-center justify-center gap-0.5
                              ${isSlotActive
                                ? 'bg-primary text-white border-primary shadow-xs font-bold'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-primary-200'
                              }
                            `}
                          >
                            <span className="font-bold text-[11px] leading-tight">{slot.label}</span>
                            <span className={`text-[9px] ${isSlotActive ? 'text-primary-100' : 'text-slate-400'}`}>
                              {slot.hours}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
