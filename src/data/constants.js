// Données constantes pour l'application Kiné Tanger

export const PRACTITIONER_INFO = {
  name: "BOUHLAL Ibrahim",
  title: "Kinésithérapeute Diplômé d'État",
  subtitle: "Soins & Rééducation exclusivement à domicile",
  city: "Tanger, Maroc",
  phone: "+212661000000",
  phoneDisplay: "06 61 00 00 00",
  whatsappNumber: "212661000000",
  basePriceMAD: 200,
  experienceYears: "8+",
  diploma: "Diplômé de l'Institut Supérieur des Professions Infirmières et Techniques de Santé (ISPITS)",
  bio: "Prise en charge personnalisée à votre domicile à Tanger. Ponctualité, hygiène rigoureuse et écoute attentive pour soulager vos douleurs et restaurer votre mobilité.",
};

// Quartiers de Tanger couverts
export const TANGER_NEIGHBORHOODS = [
  { id: 'malabata', name: 'Malabata / Baie de Tanger' },
  { id: 'centre_ville', name: 'Centre-ville / Boulevard Pasteur' },
  { id: 'iberia', name: 'Iberia / Place du Koweït' },
  { id: 'marshan', name: 'Marshan / Vieille Montagne' },
  { id: 'castilla', name: 'Castilla / Plaza Toro' },
  { id: 'val_fleuri', name: 'Val Fleuri / Souani' },
  { id: 'mesnana', name: 'Mesnana / Ziaten' },
  { id: 'moujahidine', name: 'Moujahidine / Branès' },
  { id: 'boukhalef', name: 'Boukhalef / Aéroport / Gzenaya' },
  { id: 'tanger_balia', name: 'Tanger Balia / Moghogha' },
  { id: 'autre', name: 'Autre quartier de Tanger' },
];

// Spécialités et motifs de consultation
export const CARE_TYPES = [
  {
    id: 'post_op',
    title: 'Rééducation post-opératoire',
    description: 'Prothèse hanche/genou, chirurgie ligamentaire, fractures.',
    icon: 'Activity'
  },
  {
    id: 'dos_sciatique',
    title: 'Mal de dos & Sciatique',
    description: 'Lumbago, hernie discale, cervicalgies, blocages aigus.',
    icon: 'ShieldAlert'
  },
  {
    id: 'personnes_agees',
    title: 'Maintien de l’autonomie & Seniors',
    description: 'Prévention des chutes, renforcement, reprise de marche.',
    icon: 'HeartHandshake'
  },
  {
    id: 'sport',
    title: 'Kiné du sport & Traumatologie',
    description: 'Entorses, déchirures musculaires, tendinites, reprise d’appui.',
    icon: 'Zap'
  },
  {
    id: 'autre_soin',
    title: 'Autre motif de rééducation',
    description: 'Évaluation personnalisée selon ordonnance médicale.',
    icon: 'Stethoscope'
  }
];

// Créneaux horaires
export const TIME_SLOTS = [
  {
    id: 'matin',
    label: 'Matinée',
    hours: '09h00 – 12h00',
    description: 'Séance en matinée (09h00 – 12h00)',
    isDaytime: true,
  },
  {
    id: 'apres_midi',
    label: 'Après-midi',
    hours: '14h00 – 17h00',
    description: 'Séance l’après-midi (14h00 – 17h00)',
    isDaytime: true,
  },
  {
    id: 'fin_journee',
    label: 'Soirée',
    hours: '17h00 – 20h00',
    description: 'Séance en soirée (17h00 – 20h00)',
    isEvening: true,
  }
];

// Statuts des rendez-vous
export const APPOINTMENT_STATUS = {
  en_attente: {
    label: 'En attente',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    color: '#F59E0B'
  },
  confirme: {
    label: 'Confirmé',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    color: '#10B981'
  },
  accompli: {
    label: 'Accompli',
    badgeClass: 'bg-primary-50 text-primary-700 border-primary-200',
    dotClass: 'bg-primary-500',
    color: '#2E6F65'
  },
  annule: {
    label: 'Annulé',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    color: '#EF4444'
  }
};
