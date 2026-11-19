# 🏛️ Architecture Technique & Fonctionnelle — Kiné Tanger PWA

Application web Mobile-First (Progressive Web App) pour kinésithérapeute exerçant exclusivement à domicile à **Tanger (Maroc)**.

---

## 1. Vue d'ensemble & Objectifs

- **Activité :** Kinésithérapie exclusive à domicile à Tanger.
- **Cible Patients :** Patients cherchant des soins à domicile (post-opératoire, sciatique, personnes âgées, kiné respiratoire, sportifs), souvent en situation de douleur ou peu familiers avec la technologie. Zéro friction, 4 étapes simples, confirmation instantanée via WhatsApp.
- **Cible Praticien :** Kinésithérapeute en mobilité dans Tanger. Espace admin optimisé à une main sur smartphone avec tournée du jour, géolocalisation GPS en un clic (Google Maps / Waze), appel direct et messages WhatsApp pré-remplis.
- **Modèle économique :** Paiement direct sur place en Dirhams Marocains (MAD / DH), à partir d'un tarif indicatif clair (ex: 200 DH / séance).

---

## 2. Stack Technique

| Domaine | Technologie | Justification |
| :--- | :--- | :--- |
| **Front-end Framework** | React 18 + Vite | Performance maximale, rechargement instantané (HMR), bundle ultra-léger |
| **Styles & Design System** | Tailwind CSS 3 | Utility-first, mobile-first absolu, tokens personnalisés |
| **Icônes** | Lucide React | Icônes médicales et fonctionnelles légères et cohérentes |
| **Routage** | React Router DOM v6 | Navigation fluide entre l'espace Patient (`/`) et l'espace Kiné (`/admin`) |
| **Base de Données** | Firebase Firestore (Spark) | NoSQL temps réel, mode hors-ligne natif, collection `appointments` |
| **Stockage Médias** | Firebase Cloud Storage | Téléversement sécurisé des photos d'ordonnances médicales |
| **Authentification** | Firebase Auth | Authentification Email/Mot de passe dédiée uniquement au praticien |
| **PWA & Mobile** | Manifest JSON + Service Worker | Installation sur l'écran d'accueil iOS/Android sans passer par les stores |

---

## 3. Schéma de Données (Firestore)

### Collection principale : `appointments`

Chaque document représente une réservation :

```typescript
interface Appointment {
  id: string; // ID généré automatiquement par Firestore
  patientName: string; // Nom et prénom du patient
  phone: string; // Format marocain (ex: 0612345678 ou +212612345678)
  careType: string; // Post-opératoire, sciatique, respiratoire, personne âgée, sport, etc.
  prescriptionUrl?: string; // URL Cloud Storage sécurisée si fournie (optionnel)
  
  // Localisation Tanger
  neighborhood: string; // Ex: Malabata, Centre-ville, Iberia, Boukhalef, etc.
  addressDetails: string; // Résidence, bâtiment, étage, n° porte, repères visuels
  geoCoordinates?: { // Coordonnées GPS capturées via navigateur (optionnel)
    latitude: number;
    longitude: number;
    accuracy?: number; // Précision en mètres
  };

  // Date et créneau
  date: string; // Format ISO YYYY-MM-DD
  timeSlot: 'matin' | 'apres_midi' | 'fin_journee'; // Plage horaire choisie
  timeSlotLabel: string; // "Matin (9h-12h)", "Après-midi (14h-17h)", "Fin de journée (17h-20h)"
  
  // Statut & Horodatage
  status: 'en_attente' | 'confirme' | 'accompli' | 'annule';
  notes?: string; // Remarques du patient (pathologie, antécédents, etc.)
  createdAt: FirebaseFirestore.Timestamp; // Date de création
  updatedAt: FirebaseFirestore.Timestamp; // Date de dernière mise à jour
}
```

---

## 4. Règles de Sécurité Firebase (Ébauche Phase 4)

- **Firestore :**
  - `create` : Accessible en écriture publique (permet à tout patient de soumettre une demande sans créer de compte préalable).
  - `read`, `update`, `delete` : Strictement restreint aux utilisateurs authentifiés (`request.auth != null`). Seul le kiné peut consulter la liste des rendez-vous et modifier les statuts.
- **Storage :**
  - `write` : Création de fichiers d'images autorisée pour les nouveaux uploads sous `/prescriptions/{id}` (taille limitée à 10 Mo, types MIME images).
  - `read` : Strictement réservé au kiné authentifié.

---

## 5. Arborescence du Projet

```text
BRAHIM APP/
├── public/
│   ├── favicon.svg          # Icône vectorielle médicale
│   ├── manifest.json        # Configuration PWA
│   └── icons/               # Icônes pour installation PWA (192x192, 512x512)
├── src/
│   ├── assets/              # Images, logos et illustrations
│   ├── components/          # Composants réutilisables
│   │   ├── common/          # Boutons, badges, modales, loaders
│   │   ├── layout/          # En-têtes, conteneurs mobile, barre de navigation
│   │   ├── patient/         # Composants spécifiques à la landing & tunnel
│   │   └── admin/           # Composants tournée, gestion des demandes, calendrier
│   ├── data/                # Constantes (quartiers de Tanger, soins, tarifs)
│   ├── hooks/               # Custom hooks (géolocalisation, auth, tournée)
│   ├── pages/               # Pages de l'application
│   │   ├── PatientHome.jsx  # Landing page + déclencheur de réservation
│   │   ├── BookingFlow.jsx  # Tunnel de réservation en 4 étapes
│   │   ├── AdminLogin.jsx   # Connexion sécurisée praticien
│   │   └── AdminDashboard.jsx # Dashboard 3 onglets (Tournée, Demandes, Historique)
│   ├── services/            # Intégrations Firebase, GPS, WhatsApp, Calendar .ics
│   ├── utils/               # Formateurs de numéros marocains, dates, liens maps
│   ├── App.jsx              # Configuration des routes
│   ├── index.css            # Styles Tailwind & utilitaires
│   └── main.jsx             # Point d'entrée React
├── .env.example             # Modèle des variables d'environnement
├── ARCHITECTURE.md          # Présente documentation
├── PROGRESS.md              # Journal de bord et traçabilité des phases
├── package.json
├── tailwind.config.js       # Tokens de design (Sage, Coral, Anthracite)
└── vite.config.js           # Configuration Vite + PWA
```

---

## 6. Design System & Direction Artistique

### Palette de Couleurs

- **Fond principal :** `#F8FAFC` (Slate 50 — reposant, lumineux, propre)
- **Couleur Primaire (Santé & Apaisement) :** `#2E6F65` (Vert sauge méditerranéen)
  - Nuances de soutien : `#F0F7F5` (50), `#D9ECE8` (100), `#255A52` (600)
- **Couleur d'Accentuation (CTA & Chaleur) :** `#E07A5F` (Corail doux terracotta)
  - Nuances : `#FDF4F2` (50), `#C95F44` (600)
- **Typographie & Textes :**
  - Titres et corps : *Plus Jakarta Sans* / *Inter*
  - Texte principal : `#1E293B` (Gris anthracite profond, excellent ratio de contraste WCAG AAA)
  - Texte secondaire : `#64748B` (Slate 500)
- **Statuts :**
  - `en_attente` : Ambre `#F59E0B`
  - `confirme` : Émeraude `#10B981`
  - `accompli` : Vert sauge `#2E6F65`
  - `annule` : Rouge corail `#EF4444`

---

## 7. Fonctionnalités Clés & Intégrations Tanger

1. **Quartiers de Tanger intégrés :**
   - Malabata, Centre-ville / Boulevard, Iberia, Marshan, Castilla, Val Fleuri, Mesnana, Moujahidine, Boukhalef, Tanger Balia, Autre.
2. **Géolocalisation HTML5 :**
   - Bouton *"Utiliser ma position GPS"* : capture `navigator.geolocation.getCurrentPosition`.
   - Lien direct Waze & Google Maps pour le praticien (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`).
3. **WhatsApp Deep Links :**
   - Confirmation patient vers kiné : message pré-rempli avec détails de la réservation.
   - Message kiné vers patient : *"Bonjour, je suis votre kiné, j'arrive dans 10 minutes"*.
4. **Générateur Google Calendar & Fichier .ics :**
   - Création d'événements pour le calendrier personnel du kiné en un clic.
