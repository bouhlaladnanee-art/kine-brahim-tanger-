// Service de gestion des disponibilités - Supabase + fallback localStorage
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

async function getConfigFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('id', AVAILABILITY_ROW_ID)
      .single();
    if (error || !data) return null;
    return {
      weeklyTemplate: data.weekly_template || DEFAULT_WEEKLY_TEMPLATE,
      customDates: data.custom_dates || {},
      blockedDates: data.blocked_dates || [],
    };
  } catch {
    return null;
  }
}

async function saveConfigToSupabase(config) {
  if (!isSupabaseConfigured || !supabase) return false;
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
    return !error;
  } catch {
    return false;
  }
}

function getConfigFromLocal() {
  try {
    const data = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (!data) {
      const initialConfig = {
        weeklyTemplate: DEFAULT_WEEKLY_TEMPLATE,
        customDates: {},
        blockedDates: []
      };
      localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(initialConfig));
      return initialConfig;
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

export const availabilityService = {
  getConfig: async () => {
    const remote = await getConfigFromSupabase();
    if (remote) return remote;
    return getConfigFromLocal();
  },

  saveConfig: async (config) => {
    const saved = await saveConfigToSupabase(config);
    if (!saved) saveConfigToLocal(config);
    return config;
  },

  toggleWeeklySlot: async (dayIndex, slotId) => {
    const config = await availabilityService.getConfig();
    const currentSlots = config.weeklyTemplate[dayIndex] || [];
    config.weeklyTemplate[dayIndex] = currentSlots.includes(slotId)
      ? currentSlots.filter(s => s !== slotId)
      : [...currentSlots, slotId];
    return availabilityService.saveConfig(config);
  },

  toggleCustomDateSlot: async (dateISO, slotId) => {
    const config = await availabilityService.getConfig();
    const currentSlots = availabilityService.getSlotsForDate(config, dateISO).map(s => s.id);
    config.customDates[dateISO] = currentSlots.includes(slotId)
      ? currentSlots.filter(s => s !== slotId)
      : [...currentSlots, slotId];
    return availabilityService.saveConfig(config);
  },

  toggleBlockDate: async (dateISO) => {
    const config = await availabilityService.getConfig();
    const blocked = config.blockedDates || [];
    config.blockedDates = blocked.includes(dateISO)
      ? blocked.filter(d => d !== dateISO)
      : [...blocked, dateISO];
    return availabilityService.saveConfig(config);
  },

  getSlotsForDate: (config, dateISO) => {
    if (config.blockedDates?.includes(dateISO)) return [];
    if (config.customDates?.[dateISO] !== undefined) {
      return TIME_SLOTS.filter(slot => config.customDates[dateISO].includes(slot.id));
    }
    const dayOfWeek = new Date(dateISO + 'T00:00:00').getDay();
    return TIME_SLOTS.filter(slot => (config.weeklyTemplate[dayOfWeek] || []).includes(slot.id));
  },

  getAvailableSlotsForDate: async (dateISO) => {
    const config = await availabilityService.getConfig();
    return availabilityService.getSlotsForDate(config, dateISO);
  },

  getAvailableUpcomingDates: async (daysAhead = 14) => {
    const config = await availabilityService.getConfig();
    const availableDates = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    for (let i = 0; i < daysAhead; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const slots = availabilityService.getSlotsForDate(config, iso);
      if (slots.length > 0) {
        availableDates.push({
          iso,
          label: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
          sublabel: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : '',
          dateObj: d,
          availableSlotsCount: slots.length,
          slots,
        });
      }
    }
    return availableDates;
  },

  getNextAvailabilityText: async () => {
    const upcoming = await availabilityService.getAvailableUpcomingDates(7);
    if (upcoming.length === 0) return "Sur rendez-vous préalable";
    const first = upcoming[0];
    if (first.sublabel === "Aujourd'hui") return `Aujourd'hui dès ${first.slots[0].hours.split('–')[0].trim()}`;
    if (first.sublabel === 'Demain') return `Demain dès ${first.slots[0].hours.split('–')[0].trim()}`;
    return `${first.label} (${first.slots.map(s => s.hours).join(' ou ')})`;
  }
};
