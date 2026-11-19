import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Check, 
  X, 
  Sparkles, 
  Info, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Power,
  RotateCcw
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { TIME_SLOTS } from '../../data/constants';
import { availabilityService } from '../../services/availabilityService';

const DAYS_OF_WEEK = [
  { index: 1, name: 'Lundi', short: 'Lun' },
  { index: 2, name: 'Mardi', short: 'Mar' },
  { index: 3, name: 'Mercredi', short: 'Mer' },
  { index: 4, name: 'Jeudi', short: 'Jeu' },
  { index: 5, name: 'Vendredi', short: 'Ven' },
  { index: 6, name: 'Samedi', short: 'Sam' },
  { index: 0, name: 'Dimanche', short: 'Dim' },
];

export default function AvailabilityTab() {
  const [config, setConfig] = useState(availabilityService.getConfig());
  const [activeSubTab, setActiveSubTab] = useState('weekly'); // 'weekly' | 'calendar'
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const refreshConfig = () => {
    setConfig(availabilityService.getConfig());
  };

  const handleToggleWeekly = (dayIndex, slotId) => {
    const updated = availabilityService.toggleWeeklySlot(dayIndex, slotId);
    setConfig({ ...updated });
    showFeedback("Planning hebdomadaire mis à jour !");
  };

  const handleToggleCustomSlot = (dateISO, slotId) => {
    const updated = availabilityService.toggleCustomDateSlot(dateISO, slotId);
    setConfig({ ...updated });
    showFeedback("Créneau mis à jour pour cette date !");
  };

  const handleToggleBlockDate = (dateISO) => {
    const updated = availabilityService.toggleBlockDate(dateISO);
    setConfig({ ...updated });
    showFeedback("Disponibilité de la journée modifiée !");
  };

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  // Liste des 10 prochains jours pour l'ajustement ponctuel
  const upcomingDays = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    const isToday = i === 0;
    const isTomorrow = i === 1;

    let sublabel = '';
    if (isToday) sublabel = "Aujourd'hui";
    if (isTomorrow) sublabel = 'Demain';

    return {
      iso,
      title: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
      sublabel,
      dateObj: d,
      slots: availabilityService.getAvailableSlotsForDate(iso),
      isBlocked: config.blockedDates?.includes(iso)
    };
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Bannière explicative Heures Supplémentaires */}
      <div className="bg-gradient-to-r from-primary to-primary-700 text-white p-4 sm:p-5 rounded-2xl shadow-soft space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-sm">
              <CalendarClock className="w-3.5 h-3.5 text-accent-300" /> Gestion du Planning
            </span>
            <h2 className="text-lg font-extrabold">Mes Disponibilités Kiné</h2>
            <p className="text-xs text-primary-100 leading-relaxed">
              Puisque vous exercez en heures supplémentaires, <strong>seuls les créneaux activés ci-dessous seront réservables</strong> par les patients.
            </p>
          </div>
        </div>

        {feedbackMessage && (
          <div className="bg-white text-primary text-xs font-bold p-2.5 rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Sélecteur de mode : Planning Hebdo vs Dates Spécifiques */}
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
          Ajustement par Date
        </button>
      </div>

      {/* ---------------- MODE 1 : PLANNING HEBDOMADAIRE TYPE ---------------- */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 text-xs text-text-muted flex items-center gap-2 shadow-xs">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Cliquez sur un créneau pour l'ouvrir ou le fermer pour chaque jour de la semaine.</span>
          </div>

          <div className="space-y-2.5">
            {DAYS_OF_WEEK.map(day => {
              const activeSlots = config.weeklyTemplate[day.index] || [];
              const hasAnyActive = activeSlots.length > 0;

              return (
                <Card key={day.index} className={`p-3.5 space-y-2.5 ${hasAnyActive ? 'bg-white' : 'bg-slate-50/70 border-dashed border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${hasAnyActive ? 'bg-primary-50 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                        {day.short}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-text-main">{day.name}</h4>
                        <span className="text-[10px] text-text-muted">
                          {hasAnyActive ? `${activeSlots.length} créneau(x) ouvert(s)` : 'Indisponible (Repos)'}
                        </span>
                      </div>
                    </div>
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
                            py-2 px-1.5 rounded-xl text-center text-xs transition-all font-semibold border flex flex-col items-center justify-center gap-0.5
                            ${isSlotActive
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-primary-200'
                            }
                          `}
                        >
                          <span className="font-bold text-[11px] leading-tight">{slot.label}</span>
                          <span className={`text-[9px] ${isSlotActive ? 'text-primary-100' : 'text-slate-400'}`}>
                            {slot.hours.split('–')[0]} - {slot.hours.split('–')[1]}
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
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 text-xs text-text-muted flex items-center gap-2 shadow-xs">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Ajustez ponctuellement vos créneaux pour les 10 prochains jours (bloquer un jour, ajouter une heure, etc.).</span>
          </div>

          <div className="space-y-2.5">
            {upcomingDays.map(dayItem => {
              const activeSlotIds = dayItem.slots.map(s => s.id);

              return (
                <Card 
                  key={dayItem.iso} 
                  className={`p-3.5 space-y-2.5 ${dayItem.isBlocked ? 'bg-rose-50/40 border-rose-200' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-text-main">{dayItem.title}</h4>
                        {dayItem.sublabel && (
                          <span className="text-[10px] font-bold bg-accent-50 text-accent px-2 py-0.5 rounded-md">
                            {dayItem.sublabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {dayItem.isBlocked 
                          ? '🚫 Journée bloquée (aucun rendez-vous possible)' 
                          : `${dayItem.slots.length} créneau(x) ouvert(s)`
                        }
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleBlockDate(dayItem.iso)}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-colors ${dayItem.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
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
                                ? 'bg-primary text-white border-primary shadow-xs'
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
