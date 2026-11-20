import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TIME_SLOTS } from '../../data/constants';
import { availabilityService } from '../../services/availabilityService';

const WEEK = [
  { index: 6, name: 'Samedi' },
  { index: 0, name: 'Dimanche' },
  { index: 1, name: 'Lundi' },
  { index: 2, name: 'Mardi' },
  { index: 3, name: 'Mercredi' },
  { index: 4, name: 'Jeudi' },
  { index: 5, name: 'Vendredi' },
];
const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const SHORT_LABEL = { matin: 'Matin', apres_midi: 'Après-midi', fin_journee: 'Soir' };

function SlotToggles({ activeIds, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TIME_SLOTS.map(slot => {
        const on = activeIds.includes(slot.id);
        return (
          <button
            key={slot.id}
            onClick={() => onToggle(slot.id)}
            aria-pressed={on}
            className={`rounded-xl py-2.5 text-sm font-bold border ${on ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200'}`}
          >
            {SHORT_LABEL[slot.id] || slot.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AvailabilityTab() {
  const [config, setConfig] = useState(() => availabilityService.getConfig());
  const [showTemplate, setShowTemplate] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const unsubscribe = availabilityService.subscribe((next) => setConfig({ ...next }));
    return () => unsubscribe();
  }, []);

  const save = async (action) => {
    const res = await action();
    setToast(res?.success ? 'Enregistré' : 'Enregistré sur ce téléphone seulement (pas de réseau)');
    setTimeout(() => setToast(''), 2500);
  };

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const prefix = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : DAY_NAMES[d.getDay()];
    return {
      iso,
      title: `${prefix} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      slotIds: availabilityService.getAvailableSlotsForDate(iso).map(s => s.id),
      isBlocked: config.blockedDates?.includes(iso),
    };
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-text-main">Mes disponibilités</h2>
        <p className="text-sm text-text-muted">Touchez un créneau pour l'ouvrir ou le fermer aux patients.</p>
      </div>

      <div className="space-y-2.5">
        {days.map(day => (
          <div
            key={day.iso}
            className={`rounded-2xl border p-3.5 space-y-2.5 ${day.isBlocked ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-base font-bold ${day.isBlocked ? 'text-slate-400 line-through' : 'text-text-main'}`}>
                {day.title}
              </p>
              <button
                onClick={() => save(() => availabilityService.toggleBlockDate(day.iso))}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${day.isBlocked ? 'bg-primary-50 text-primary' : 'text-slate-500'}`}
              >
                {day.isBlocked ? 'Rouvrir' : 'Bloquer'}
              </button>
            </div>
            {!day.isBlocked && (
              <SlotToggles
                activeIds={day.slotIds}
                onToggle={(slotId) => save(() => availabilityService.toggleCustomDateSlot(day.iso, slotId))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <button
          onClick={() => setShowTemplate(v => !v)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span>
            <span className="block text-base font-bold text-text-main">Semaine type</span>
            <span className="block text-sm text-text-muted">Créneaux ouverts par défaut chaque semaine</span>
          </span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showTemplate ? 'rotate-180' : ''}`} />
        </button>

        {showTemplate && (
          <div className="border-t border-slate-100 p-4 space-y-4">
            {WEEK.map(day => (
              <div key={day.index} className="space-y-2">
                <p className="text-sm font-bold text-text-main">{day.name}</p>
                <SlotToggles
                  activeIds={config.weeklyTemplate[day.index] || []}
                  onToggle={(slotId) => save(() => availabilityService.toggleWeeklySlot(day.index, slotId))}
                />
              </div>
            ))}
            <button
              onClick={() => {
                if (window.confirm('Revenir au réglage par défaut ? (week-ends ouverts, semaine fermée)')) {
                  save(() => availabilityService.resetToDefaults());
                }
              }}
              className="w-full text-sm font-semibold text-slate-500 py-2"
            >
              Revenir au réglage par défaut
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </section>
  );
}
