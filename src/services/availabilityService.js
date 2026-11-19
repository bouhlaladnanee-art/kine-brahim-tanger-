// Service de gestion des disponibilités du praticien (Heures supplémentaires / Sur-mesure)
import { TIME_SLOTS } from '../data/constants';

const AVAILABILITY_STORAGE_KEY = 'kine_tanger_availability_v1';

// Par défaut : Créneaux types pour un praticien exerçant en heures supplémentaires
// (Ex : Soirées en semaine 17h-20h + Mercredi après-midi + Samedi matin & après-midi)
const DEFAULT_WEEKLY_TEMPLATE = {
  // 0 = Dimanche, 1 = Lundi, 2 = Mardi, 3 = Mercredi, 4 = Jeudi, 5 = Vendredi, 6 = Samedi
  1: ['fin_journee'],                         // Lundi : 17h-20h
  2: ['fin_journee'],                         // Mardi : 17h-20h
  3: ['apres_midi', 'fin_journee'],           // Mercredi : 14h-17h et 17h-20h
  4: ['fin_journee'],                         // Jeudi : 17h-20h
  5: ['fin_journee'],                         // Vendredi : 17h-20h
  6: ['matin', 'apres_midi'],                 // Samedi : 09h-12h et 14h-17h
  0: [],                                      // Dimanche : Repos par défaut
};

export const availabilityService = {
  /**
   * Récupère la configuration complète des disponibilités
   */
  getConfig: () => {
    try {
      const data = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
      if (!data) {
        const initialConfig = {
          weeklyTemplate: DEFAULT_WEEKLY_TEMPLATE,
          customDates: {}, // Surcharges par date ISO spécifique (ex: '2026-11-25': ['fin_journee'])
          blockedDates: [] // Dates de congés / indisponibilité totale (ex: ['2026-12-25'])
        };
        localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(initialConfig));
        return initialConfig;
      }
      return JSON.parse(data);
    } catch {
      return {
        weeklyTemplate: DEFAULT_WEEKLY_TEMPLATE,
        customDates: {},
        blockedDates: []
      };
    }
  },

  /**
   * Enregistre la configuration
   */
  saveConfig: (config) => {
    try {
      localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Modifie le planning récurrent hebdomadaire pour un jour donné (0-6)
   */
  toggleWeeklySlot: (dayIndex, slotId) => {
    const config = availabilityService.getConfig();
    const currentSlots = config.weeklyTemplate[dayIndex] || [];
    
    let updatedSlots;
    if (currentSlots.includes(slotId)) {
      updatedSlots = currentSlots.filter(s => s !== slotId);
    } else {
      updatedSlots = [...currentSlots, slotId];
    }

    config.weeklyTemplate[dayIndex] = updatedSlots;
    availabilityService.saveConfig(config);
    return config;
  },

  /**
   * Active ou désactive un créneau pour une date spécifique
   */
  toggleCustomDateSlot: (dateISO, slotId) => {
    const config = availabilityService.getConfig();
    const currentSlots = availabilityService.getAvailableSlotsForDate(dateISO).map(s => s.id);
    
    let updatedSlots;
    if (currentSlots.includes(slotId)) {
      updatedSlots = currentSlots.filter(s => s !== slotId);
    } else {
      updatedSlots = [...currentSlots, slotId];
    }

    config.customDates[dateISO] = updatedSlots;
    availabilityService.saveConfig(config);
    return config;
  },

  /**
   * Bloque ou débloque une journée entière (repos / imprévu)
   */
  toggleBlockDate: (dateISO) => {
    const config = availabilityService.getConfig();
    let blocked = config.blockedDates || [];
    if (blocked.includes(dateISO)) {
      blocked = blocked.filter(d => d !== dateISO);
    } else {
      blocked = [...blocked, dateISO];
    }
    config.blockedDates = blocked;
    availabilityService.saveConfig(config);
    return config;
  },

  /**
   * Renvoie la liste exacte des objets TIME_SLOTS disponibles pour une date donnée
   * (Prend en compte les dates bloquées, les surcharges spécifiques et le planning hebdo)
   */
  getAvailableSlotsForDate: (dateISO) => {
    const config = availabilityService.getConfig();

    // Si la journée est totalement bloquée par le kiné
    if (config.blockedDates && config.blockedDates.includes(dateISO)) {
      return [];
    }

    // Si des créneaux personnalisés ont été définis pour cette date précise
    if (config.customDates && config.customDates[dateISO] !== undefined) {
      const allowedSlotIds = config.customDates[dateISO];
      return TIME_SLOTS.filter(slot => allowedSlotIds.includes(slot.id));
    }

    // Sinon, se baser sur le modèle hebdomadaire récurrent
    const dateObj = new Date(dateISO + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 à 6
    const allowedSlotIds = config.weeklyTemplate[dayOfWeek] || [];

    return TIME_SLOTS.filter(slot => allowedSlotIds.includes(slot.id));
  },

  /**
   * Renvoie les dates des 14 prochains jours qui ont AU MOINS UN créneau disponible
   */
  getAvailableUpcomingDates: (daysAhead = 14) => {
    const availableDates = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    for (let i = 0; i < daysAhead; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];

      const slots = availabilityService.getAvailableSlotsForDate(iso);
      if (slots.length > 0) {
        const isToday = i === 0;
        const isTomorrow = i === 1;

        let label = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
        let sublabel = '';
        if (isToday) sublabel = "Aujourd'hui";
        if (isTomorrow) sublabel = 'Demain';

        availableDates.push({
          iso,
          label,
          sublabel,
          dateObj: d,
          availableSlotsCount: slots.length,
          slots
        });
      }
    }

    return availableDates;
  },

  /**
   * Retourne un résumé textuel de la prochaine disponibilité pour la landing page
   */
  getNextAvailabilityText: () => {
    const upcoming = availabilityService.getAvailableUpcomingDates(7);
    if (upcoming.length === 0) {
      return "Sur rendez-vous préalable";
    }
    const first = upcoming[0];
    const slotNames = first.slots.map(s => s.hours).join(' ou ');
    if (first.sublabel === "Aujourd'hui") {
      return `Aujourd'hui dès ${first.slots[0].hours.split('–')[0].trim()}`;
    }
    if (first.sublabel === "Demain") {
      return `Demain dès ${first.slots[0].hours.split('–')[0].trim()}`;
    }
    return `${first.label} (${slotNames})`;
  }
};
