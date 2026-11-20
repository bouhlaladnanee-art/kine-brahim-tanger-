
const STORAGE_KEY = 'kine_tanger_appointments_v1';

const INITIAL_SAMPLE_APPOINTMENTS = [
  {
    id: 'apt-sample-01',
    patientName: 'Yassine Benali',
    phone: '0661234567',
    careType: 'post_op',
    careTypeTitle: 'Rééducation post-opératoire (Genou)',
    prescriptionUrl: null,
    prescriptionPreview: null,
    neighborhood: 'malabata',
    neighborhoodName: 'Malabata / Baie de Tanger',
    addressDetails: 'Résidence Panorama Baie, Immeuble B, 4ème étage, Apt 14',
    geoCoordinates: {
      latitude: 35.7765,
      longitude: -5.7892,
      accuracy: 12
    },
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'matin',
    timeSlotLabel: 'Matin (09h00 – 12h00)',
    timeExact: '10:00',
    status: 'confirme',
    notes: 'Opération des ligaments croisés il y a 3 semaines. Béquilles.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'apt-sample-02',
    patientName: 'Fatima Zahra Mansouri',
    phone: '0672889900',
    careType: 'dos_sciatique',
    careTypeTitle: 'Mal de dos & Sciatique',
    prescriptionUrl: null,
    prescriptionPreview: null,
    neighborhood: 'iberia',
    neighborhoodName: 'Iberia / Place du Koweït',
    addressDetails: 'Avenue de la Paix, Résidence El Yakout, 2ème étage',
    geoCoordinates: {
      latitude: 35.7812,
      longitude: -5.8143,
      accuracy: 8
    },
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'apres_midi',
    timeSlotLabel: 'Après-midi (14h00 – 17h00)',
    timeExact: '15:30',
    status: 'confirme',
    notes: 'Sciatique aiguë côté droit, marche difficile.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'apt-sample-03',
    patientName: 'Mohamed Tazi',
    phone: '0663445566',
    careType: 'personnes_agees',
    careTypeTitle: 'Maintien de l’autonomie & Seniors',
    prescriptionUrl: null,
    prescriptionPreview: null,
    neighborhood: 'marshan',
    neighborhoodName: 'Marshan / Vieille Montagne',
    addressDetails: 'Près du Palais Marchan, Villa Jasmin',
    geoCoordinates: {
      latitude: 35.7901,
      longitude: -5.8211,
      accuracy: 15
    },
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: 'matin',
    timeSlotLabel: 'Matin (09h00 – 12h00)',
    timeExact: '11:00',
    status: 'en_attente',
    notes: 'Reprise de la marche douce après hospitalisation.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

export const mockStorage = {
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_APPOINTMENTS));
        return INITIAL_SAMPLE_APPOINTMENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn("Storage error fallback", e);
      return INITIAL_SAMPLE_APPOINTMENTS;
    }
  },

  create: (appointmentData) => {
    const list = mockStorage.getAll();
    const newAppointment = {
      ...appointmentData,
      id: 'apt-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      status: 'en_attente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newAppointment, ...list];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return newAppointment;
  },

  updateStatus: (id, newStatus) => {
    const list = mockStorage.getAll();
    const updated = list.map(apt => {
      if (apt.id === id) {
        return {
          ...apt,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return apt;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated.find(a => a.id === id);
  },

  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_APPOINTMENTS));
    return INITIAL_SAMPLE_APPOINTMENTS;
  }
};
