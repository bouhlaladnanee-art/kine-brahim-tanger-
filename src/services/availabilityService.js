// Service de gestion des disponibilités - Temps réel Supabase + Cache Local synchrone
import { supabase, isSupabaseConfigured } from './supabase';
import { TIME_SLOTS } from '../data/constants';

const AVAILABILITY_STORAGE_KEY = 'kine_tanger_availability_v3';
const AVAILABILITY_ROW_ID = '00000000-0000-0000-0000-000000000001';

// Configuration par défaut demandée par le praticien :
// - En semaine (Lundi à Vendredi) : CRÉNEAUX VIDES par défaut (déverrouillables depuis /admin)
// - Le week-end (Samedi & Dimanche) : TOUT ACTIVÉ par défaut (Matin, Après-midi, Soirée)
export const DEFAULT_WEEKLY_TEMPLATE = {
  1: [],                                      // Lundi : Vides par défaut
  2: [],                                      // Mardi : Vides par défaut
  3: [],                                      // Mercredi : Vides par défaut
  4: [],                                      // Jeudi : Vides par défaut
  5: [],                                      // Vendredi : Vides par défaut
  6: ['matin', 'apres_midi', 'fin_journee'], // Samedi : Tout activé par défaut
  0: ['matin', 'apres_midi', 'fin_journee'], // Dimanche : Tout activé par défaut
};

// ─── Gestion des écouteurs réactifs (listeners) ──────────────────────────────
const listeners = new Set();

function notifyListeners() {
  listeners.forEach(cb => {
    try { cb(availabilityService.getConfig()); } catch (err) { console.error(err); }
  });
}

// ─── Helpers localStorage (sync immédiat) ────────────────────────────────────

function getConfigFromLocal() {
  try {
    const data = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (!data) {
      const initial = { weeklyTemplate: DEFAULT_WEEKLY_TEMPLATE, customDates: {}, blockedDates: [] };
      localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch {
    return { weeklyTemplate: DEFAULT_WEEKLY_TEMPLATE, customDates: {}, blockedDates: [] };
  }
}

function saveConfigToLocal(config) {
  try { 
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(config)); 
  } catch {}
}

// ─── Synchronisation Supabase Réseau & Temps Réel ─────────────────────────────

async function fetchFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('id', AVAILABILITY_ROW_ID)
      .single();

    if (data && !error) {
      const remoteConfig = {
        weeklyTemplate: data.weekly_template || DEFAULT_WEEKLY_TEMPLATE,
        customDates: data.custom_dates || {},
        blockedDates: data.blocked_dates || [],
      };
      saveConfigToLocal(remoteConfig);
      notifyListeners();
    }
  } catch (err) {
    console.warn("Disponibilités : impossible de contacter Supabase, utilisation du cache local.", err);
  }
}

// Lancement immédiat du chargement distant
if (isSupabaseConfigured && supabase) {
  fetchFromSupabase();

  // Écoute en direct des modifications faites par le kiné (depuis le Maroc ou n'importe où)
  supabase
    .channel('availability-realtime-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'availability' },
      (payload) => {
        if (payload?.new) {
          const updated = {
            weeklyTemplate: payload.new.weekly_template || DEFAULT_WEEKLY_TEMPLATE,
            customDates: payload.new.custom_dates || {},
            blockedDates: payload.new.blocked_dates || [],
          };
          saveConfigToLocal(updated);
          notifyListeners();
        } else {
          fetchFromSupabase();
        }
      }
    )
    .subscribe();
}

// ─── Sauvegarde Cloud vers Supabase ──────────────────────────────────────────

async function persistToSupabase(config) {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase non configuré' };
  try {
    const { error } = await supabase
      .from('availability')
      .update({
        weekly_template: config.weeklyTemplate,
        custom_dates: config.customDates,
        blocked_dates: config.blockedDates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', AVAILABILITY_ROW_ID);

    if (error) {
      console.error("❌ Erreur mise à jour Supabase :", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("❌ Exception Supabase :", err);
    return { success: false, error: err.message };
  }
}

// ─── API publique du service ─────────────────────────────────────────────────

export const availabilityService = {
  getConfig: () => getConfigFromLocal(),

  // Abonnement réactif pour les composants React (LandingHero, BookingFlow, etc.)
  subscribe: (callback) => {
    listeners.add(callback);
    callback(availabilityService.getConfig());
    return () => listeners.delete(callback);
  },

  // Forcer un rafraîchissement depuis le cloud
  refreshFromCloud: async () => {
    await fetchFromSupabase();
    return availabilityService.getConfig();
  },

  saveConfig: async (config) => {
    saveConfigToLocal(config);
    notifyListeners();
    const result = await persistToSupabase(config);
    return result;
  },

  // Basculer un créneau individuel pour un jour de la semaine
  toggleWeeklySlot: async (dayIndex, slotId) => {
    const config = availabilityService.getConfig();
    const current = config.weeklyTemplate[dayIndex] || [];
    config.weeklyTemplate[dayIndex] = current.includes(slotId)
      ? current.filter(s => s !== slotId)
      : [...current, slotId];
    return availabilityService.saveConfig(config);
  },

  // Activer ou désactiver tous les créneaux d'un jour donné
  setDaySlots: async (dayIndex, slotIds) => {
    const config = availabilityService.getConfig();
    config.weeklyTemplate[dayIndex] = [...slotIds];
    return availabilityService.saveConfig(config);
  },

  // Déverrouiller tous les créneaux en semaine (Lundi à Vendredi)
  unlockAllWeekdays: async () => {
    const config = availabilityService.getConfig();
    const allSlots = ['matin', 'apres_midi', 'fin_journee'];
    for (let i = 1; i <= 5; i++) {
      config.weeklyTemplate[i] = [...allSlots];
    }
    return availabilityService.saveConfig(config);
  },

  // Verrouiller tous les créneaux en semaine (remise à vide par défaut)
  lockAllWeekdays: async () => {
    const config = availabilityService.getConfig();
    for (let i = 1; i <= 5; i++) {
      config.weeklyTemplate[i] = [];
    }
    return availabilityService.saveConfig(config);
  },

  // Réinitialiser au profil par défaut : Week-ends complets, semaine vide
  resetToDefaults: async () => {
    const config = {
      weeklyTemplate: JSON.parse(JSON.stringify(DEFAULT_WEEKLY_TEMPLATE)),
      customDates: {},
      blockedDates: [],
    };
    return availabilityService.saveConfig(config);
  },

  // Ajustement pour une date spécifique
  toggleCustomDateSlot: async (dateISO, slotId) => {
    const config = availabilityService.getConfig();
    const current = availabilityService.getAvailableSlotsForDate(dateISO).map(s => s.id);
    config.customDates[dateISO] = current.includes(slotId)
      ? current.filter(s => s !== slotId)
      : [...current, slotId];
    return availabilityService.saveConfig(config);
  },

  // Bloquer / Débloquer une journée entière
  toggleBlockDate: async (dateISO) => {
    const config = availabilityService.getConfig();
    const blocked = config.blockedDates || [];
    config.blockedDates = blocked.includes(dateISO)
      ? blocked.filter(d => d !== dateISO)
      : [...blocked, dateISO];
    return availabilityService.saveConfig(config);
  },

  // Retourne les créneaux ouverts pour une date donnée
  getAvailableSlotsForDate: (dateISO) => {
    const config = availabilityService.getConfig();
    if (config.blockedDates?.includes(dateISO)) return [];
    if (config.customDates?.[dateISO] !== undefined) {
      return TIME_SLOTS.filter(s => config.customDates[dateISO].includes(s.id));
    }
    const day = new Date(dateISO + 'T00:00:00').getDay();
    return TIME_SLOTS.filter(s => (config.weeklyTemplate[day] || []).includes(s.id));
  },

  // Retourne les prochaines dates avec au moins 1 créneau ouvert
  getAvailableUpcomingDates: (daysAhead = 14) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const result = [];
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const slots = availabilityService.getAvailableSlotsForDate(iso);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (slots.length > 0) {
        result.push({
          iso,
          label: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
          sublabel: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : (isWeekend ? 'Week-end' : ''),
          dateObj: d,
          isWeekend,
          availableSlotsCount: slots.length,
          slots,
        });
      }
    }
    return result;
  },

  // Texte synthétique de disponibilité affiché sur la page d'accueil
  getNextAvailabilityText: () => {
    const upcoming = availabilityService.getAvailableUpcomingDates(14);
    if (upcoming.length === 0) return 'Week-ends ouverts • Semaine sur demande';
    const first = upcoming[0];
    if (first.sublabel === "Aujourd'hui") return `Aujourd'hui dès ${first.slots[0].hours.split('–')[0].trim()}`;
    if (first.sublabel === 'Demain') return `Demain (${first.label.split(' ')[0]}) dès ${first.slots[0].hours.split('–')[0].trim()}`;
    if (first.isWeekend) return `${first.label} (Week-end ouvert)`;
    return `${first.label} dès ${first.slots[0].hours.split('–')[0].trim()}`;
  },
};
