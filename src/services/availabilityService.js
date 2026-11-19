// Service de gestion des disponibilités - sync (localStorage) + sync Supabase en arrière-plan
import { supabase, isSupabaseConfigured } from './supabase';
import { TIME_SLOTS } from '../data/constants';

const AVAILABILITY_STORAGE_KEY = 'kine_tanger_availability_v1';
const AVAILABILITY_ROW_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_WEEKLY_TEMPLATE = {
  1: ['fin_journee'],
  2: ['fin_journee'],
  3: ['apres_midi', 'fin_journee'],
  4: ['fin_journee'],
  5: ['fin_journee'],
  6: ['matin', 'apres_midi'],
  0: [],
};

// ─── Helpers localStorage (sync) ─────────────────────────────────────────────

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
  try { localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(config)); } catch {}
}

// ─── Sync Supabase en arrière-plan au démarrage ───────────────────────────────

if (isSupabaseConfigured && supabase) {
  supabase
    .from('availability')
    .select('*')
    .eq('id', AVAILABILITY_ROW_ID)
    .single()
    .then(({ data }) => {
      if (data) {
        const config = {
          weeklyTemplate: data.weekly_template || DEFAULT_WEEKLY_TEMPLATE,
          customDates: data.custom_dates || {},
          blockedDates: data.blocked_dates || [],
        };
        saveConfigToLocal(config);
      }
    })
    .catch(() => {}); // silencieux si offline
}

// ─── Save async vers Supabase ─────────────────────────────────────────────────

async function persistToSupabase(config) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase
      .from('availability')
      .update({
        weekly_template: config.weeklyTemplate,
        custom_dates: config.customDates,
        blocked_dates: config.blockedDates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', AVAILABILITY_ROW_ID);
  } catch {}
}

// ─── Service public (tout synchrone côté composants) ─────────────────────────

export const availabilityService = {
  getConfig: () => getConfigFromLocal(),

  saveConfig: (config) => {
    saveConfigToLocal(config);
    persistToSupabase(config); // fire-and-forget
    return config;
  },

  toggleWeeklySlot: (dayIndex, slotId) => {
    const config = availabilityService.getConfig();
    const current = config.weeklyTemplate[dayIndex] || [];
    config.weeklyTemplate[dayIndex] = current.includes(slotId)
      ? current.filter(s => s !== slotId)
      : [...current, slotId];
    return availabilityService.saveConfig(config);
  },

  toggleCustomDateSlot: (dateISO, slotId) => {
    const config = availabilityService.getConfig();
    const current = availabilityService.getAvailableSlotsForDate(dateISO).map(s => s.id);
    config.customDates[dateISO] = current.includes(slotId)
      ? current.filter(s => s !== slotId)
      : [...current, slotId];
    return availabilityService.saveConfig(config);
  },

  toggleBlockDate: (dateISO) => {
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
        result.push({
          iso,
          label: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
          sublabel: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : '',
          dateObj: d,
          availableSlotsCount: slots.length,
          slots,
        });
      }
    }
    return result;
  },

  getNextAvailabilityText: () => {
    const upcoming = availabilityService.getAvailableUpcomingDates(7);
    if (upcoming.length === 0) return 'Sur rendez-vous préalable';
    const first = upcoming[0];
    if (first.sublabel === "Aujourd'hui") return `Aujourd'hui dès ${first.slots[0].hours.split('–')[0].trim()}`;
    if (first.sublabel === 'Demain') return `Demain dès ${first.slots[0].hours.split('–')[0].trim()}`;
    return `${first.label} (${first.slots.map(s => s.hours).join(' ou ')})`;
  },
};
