// Service de gestion des disponibilités - Temps réel Supabase + Cache Local synchrone
import { supabase, isSupabaseConfigured } from './supabase';
import { TIME_SLOTS } from '../data/constants';

const AVAILABILITY_STORAGE_KEY = 'kine_tanger_availability_v2';
const AVAILABILITY_ROW_ID = '00000000-0000-0000-0000-000000000001';

// Par défaut : Week-ends complets (Samedi & Dimanche) + Soirées en semaine (17h-20h)
const DEFAULT_WEEKLY_TEMPLATE = {
  1: ['fin_journee'],                         // Lundi : Soirée 17h-20h
  2: ['fin_journee'],                         // Mardi : Soirée 17h-20h
  3: ['fin_journee'],                         // Mercredi : Soirée 17h-20h
  4: ['fin_journee'],                         // Jeudi : Soirée 17h-20h
  5: ['fin_journee'],                         // Vendredi : Soirée 17h-20h
  6: ['matin', 'apres_midi', 'fin_journee'], // Samedi : Toute la journée
  0: ['matin', 'apres_midi', 'fin_journee'], // Dimanche : Toute la journée
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
    // Appel immédiat avec la configuration actuelle
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

  toggleWeeklySlot: async (dayIndex, slotId) => {
    const config = availabilityService.getConfig();
    const current = config.weeklyTemplate[dayIndex] || [];
    config.weeklyTemplate[dayIndex] = current.includes(slotId)
      ? current.filter(s => s !== slotId)
      : [...current, slotId];
    return availabilityService.saveConfig(config);
  },

  toggleCustomDateSlot: async (dateISO, slotId) => {
    const config = availabilityService.getConfig();
    const current = availabilityService.getAvailableSlotsForDate(dateISO).map(s => s.id);
    config.customDates[dateISO] = current.includes(slotId)
      ? current.filter(s => s !== slotId)
      : [...current, slotId];
    return availabilityService.saveConfig(config);
  },

  toggleBlockDate: async (dateISO) => {
    const config = availabilityService.getConfig();
    const blocked = config.blockedDates || [];
    config.blockedDates = blocked.includes(dateISO)
      ? blocked.filter(d => d !== dateISO)
      : [...blocked, dateISO];
    return availabilityService.saveConfig(config);
  },

  getAvailableSlotsForDate: (dateISO) => {
    const config = availabilityService.getConfig();
    if (config.blockedDates?.includes(dateISO)) return [];
    if (config.customDates?.[dateISO] !== undefined) {
      return TIME_SLOTS.filter(s => config.customDates[dateISO].includes(s.id));
    }
    const day = new Date(dateISO + 'T00:00:00').getDay();
    return TIME_SLOTS.filter(s => (config.weeklyTemplate[day] || []).includes(s.id));
  },

  getDaytimeOnDemandSlots: () => {
    return TIME_SLOTS.filter(s => s.isDaytime);
  },

  getAvailableUpcomingDates: (daysAhead = 14) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const result = [];
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const slots = availabilityService.getAvailableSlotsForDate(iso);
      if (slots.length > 0) {
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
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

  getNextAvailabilityText: () => {
    const upcoming = availabilityService.getAvailableUpcomingDates(7);
    if (upcoming.length === 0) return 'Week-ends & Soirées sur RDV';
    const first = upcoming[0];
    if (first.sublabel === "Aujourd'hui") return `Aujourd'hui dès ${first.slots[0].hours.split('–')[0].trim()}`;
    if (first.sublabel === 'Demain') return `Demain dès ${first.slots[0].hours.split('–')[0].trim()}`;
    if (first.isWeekend) return `${first.label} (Week-end)`;
    return `${first.label} dès ${first.slots[0].hours.split('–')[0].trim()}`;
  },
};
