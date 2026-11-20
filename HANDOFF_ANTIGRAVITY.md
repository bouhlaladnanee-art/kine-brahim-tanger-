# Passation — Kiné à domicile Tanger (pour Antigravity)

> Copie le bloc « PROMPT » ci-dessous dans Antigravity, en ouvrant ce dossier comme projet.
> Le reste du document est la référence détaillée que le prompt lui demande de lire.

---

## PROMPT

```
Tu reprends le développement d'une PWA de kinésithérapie à domicile à Tanger (Maroc).
Lis d'abord HANDOFF_ANTIGRAVITY.md à la racine du projet en entier, puis ARCHITECTURE.md.

Contexte métier (à respecter strictement) :
- Praticien : BOUHLAL Ibrahim, kinésithérapeute diplômé d'État, uniquement à domicile à Tanger.
- Patients : seniors, post-opératoire, mal de dos, sportifs ; souvent un proche réserve pour un parent âgé.
- WhatsApp est le canal principal. Paiement en espèces sur place après la séance (aucun paiement en ligne).
  Attestation fournie pour mutuelle / CNSS. Tarif « à partir de 200 DH ».
- Disponibilités : week-ends ouverts par défaut, semaine fermée sauf déverrouillage par le kiné.

Stack : React 18 + Vite 5 + Tailwind 3 + vite-plugin-pwa, Supabase (base, auth, realtime, storage),
hébergement Firebase Hosting (https://brahim-projet-kine.web.app). Code en JavaScript (pas TypeScript).

Règles de travail :
1. Ne casse jamais le parcours de réservation. Après toute modification touchant la réservation,
   vérifie : réservation patient → apparition dans l'admin (onglet Aujourd'hui) → page de suivi /suivi/:token.
2. Les patients sont ANONYMES côté Supabase : ils n'ont PAS le droit de lire la table appointments
   (données de santé). Ils écrivent une demande (insert sans .select()) et lisent UNIQUEMENT leur
   demande via les fonctions SQL get_appointment_by_token / respond_to_proposal / cancel_appointment_by_token.
   Ne donne jamais SELECT sur appointments au rôle anon.
3. Toute modification de schéma ou de droits = un nouveau fichier SQL dans supabase/, que l'utilisateur
   exécute lui-même dans Supabase → SQL Editor. Déploie le code qui en dépend SEULEMENT après
   confirmation que le SQL est exécuté (sinon les réservations cassent).
4. Ne mets jamais d'identifiants, mots de passe ou clés dans le code ou la doc. Les clés sont dans .env (non versionné).
5. Jamais de faux succès : si Supabase échoue, affiche l'erreur et propose WhatsApp en secours.
6. Commentaires de code : uniquement pour expliquer un « pourquoi » non évident (sécurité, piège). Pas de commentaires qui répètent le code.
7. Interface : mobile d'abord, texte ≥ 13 px (corps 15 px), zones tactiles ≥ 44 px, sobriété médicale
   (pas de badges promo, pas d'animations clignotantes, pas de dégradés criards).
8. Déploiement : npm run build puis npm run deploy:hosting. Commits en anglais style conventional commits.

Ta première tâche : lis la section « Reste à faire » de HANDOFF_ANTIGRAVITY.md, propose-moi un plan
par ordre de priorité, et attends ma validation avant de coder.
```

---

## 1. Où en est le projet (20 novembre 2026)

Tout fonctionne en production et a été testé de bout en bout :

| Fonction | État |
|---|---|
| Réservation patient en 2 étapes | ✅ arrive dans l'admin avec téléphone, quartier, adresse, GPS, créneau |
| Suivi patient `/suivi/:token` | ✅ statut en direct (en attente, horaire proposé, confirmé, effectué, annulé), annulation |
| « Mes réservations » sur l'accueil | ✅ liste les demandes mémorisées sur l'appareil |
| Admin 3 onglets (Aujourd'hui / Planning / Plus) | ✅ accepter, autre horaire, refuser, tournée, séance faite, absent, attestation |
| Proposition d'un autre horaire | ✅ codé ; ⚠️ le parcours complet admin → patient accepte n'a pas encore été testé en production |
| Planning admin → visible côté patient | ✅ vérifié (lecture publique du planning, écriture admin seulement) |
| Cache PWA | ✅ la page HTML vient toujours du réseau, seuls JS/CSS/images sont en cache |
| Numéro praticien | ✅ via `VITE_KINE_PHONE` dans `.env` (07 63 96 15 82) |

## 2. Architecture utile

```
src/
  pages/
    PatientHome.jsx        accueil patient (+ MyBookingsCard)
    BookingTracking.jsx    page de suivi /suivi/:token
    AdminDashboard.jsx     admin : onglets jour / planning / plus
    AdminLogin.jsx
  components/patient/
    LandingHero.jsx        fiche praticien, tarif, 2 CTA (réserver, WhatsApp)
    BookingFlow.jsx        tunnel 2 étapes + écran de confirmation
    MyBookingsCard.jsx     « Mes réservations »
  components/admin/
    AdminBottomNav.jsx     3 onglets
    RequestsTab.jsx        demandes « À valider »
    TourTodayTab.jsx       tournée du jour
    AvailabilityTab.jsx    planning 14 jours + semaine type
    ProposeTimeModal.jsx   proposer un autre horaire
    HistoryTab.jsx, InvoicesTab.jsx, InvoiceModal.jsx, ExercisesModal.jsx
  services/
    appointmentService.js  create / subscribe / updateStatus / getByToken / respondToProposal / cancelByToken / proposeNewTime
    availabilityService.js planning (cache localStorage + Supabase + realtime + rafraîchissement 60 s)
    invoiceService.js      factures (⚠️ stockage local uniquement, voir « Reste à faire »)
    mockStorage.js         données de démo quand Supabase n'est pas configuré
  utils/
    whatsapp.js            messages WhatsApp pré-remplis (FR/AR/EN/ES)
    myBookings.js          jetons de suivi en localStorage, formatDateLong
    maps.js                liens Google Maps / Waze
  data/constants.js        PRACTITIONER_INFO, quartiers, types de soins, créneaux, statuts
  i18n/translations.js     FR / AR / EN / ES
supabase/                  scripts SQL (tous déjà exécutés)
```

### Table `appointments` (Supabase)
Colonnes utilisées : `id, patient_name, patient_phone, patient_address, care_type, care_type_title, date,
time_slot, time_slot_hours, notes, prescription_url, prescription_file_name, status, language,
tracking_token, proposed_date, proposed_time_slot, proposed_time_label, kine_message, patient_response,
created_at, updated_at`.

Pièges :
- `patient_address` contient un **JSON** `{neighborhood, neighborhoodName, addressDetails, geoCoordinates}`
  (il n'y a pas de colonne dédiée). `normalizeAppointment()` le relit.
- `time_slot_hours` contient le **libellé** du créneau (ex. « Matinée (09h00 – 12h00) »).
- `status` : `en_attente` | `confirme` | `accompli` | `annule`. Une proposition d'horaire = `en_attente` + `proposed_date` non nul.
- `patient_response` : `accepte` | `refuse` | `annule_par_patient`.

### Droits Supabase (état actuel)
- `anon` : INSERT sur `appointments` (statut `en_attente`, sans champs kiné), SELECT sur `availability`,
  EXECUTE sur les 3 fonctions de suivi. Rien d'autre.
- `authenticated` (le kiné) : accès complet à `appointments`, UPDATE sur `availability`.

### Table `availability`
Une seule ligne, id `00000000-0000-0000-0000-000000000001` : `weekly_template` (0=dimanche … 6=samedi),
`custom_dates` (`{"2026-11-21": ["matin","apres_midi"]}`), `blocked_dates` (liste de dates).

## 3. Reste à faire (par priorité)

### Actions de l'utilisateur (hors code)
- [ ] Supprimer les demandes de test « TEST CLAUDE … » dans l'admin.
- [ ] Changer le mot de passe admin dans Supabase (l'ancien est visible dans l'historique Git).
- [ ] Supabase → Authentication → désactiver « Allow new users to sign up » (sinon n'importe qui devient « authenticated » et lit toutes les demandes).
- [ ] Exécuter `supabase/tracking_token_default.sql` si ce n'est pas fait.

### Sécurité / conformité
1. **Ordonnances** : stockées via `getPublicUrl` dans le bucket `prescriptions` → probablement publiques.
   Passer le bucket en privé + `createSignedUrl` côté admin (données de santé, loi 09-08 / CNDP).
   Vérifier aussi que `anon` a bien le droit d'upload (sinon l'ordonnance est ignorée silencieusement, la réservation passe quand même).
2. Remplacer la politique `praticien_acces_complet` (tout `authenticated`) par une restriction à l'UID du kiné.

### Fonctionnel
3. **Tester en production** « Proposer une autre heure » → le patient accepte / refuse depuis son suivi.
4. **Factures** : `invoiceService` est en localStorage → perdues si le téléphone change. Les passer dans Supabase.
5. **Capacité des créneaux** : un créneau peut être réservé à l'infini, et les créneaux déjà passés du jour restent proposés. Filtrer par heure et éventuellement limiter le nombre de patients par créneau.
6. Dates calculées avec `toISOString()` (UTC) : décalage d'un jour entre minuit et 1 h au Maroc. Utiliser la date locale partout (service + admin) en gardant les mêmes clés des deux côtés.

### UX patient (issues de l'audit)
7. **GPS mis en avant** : sortir « Envoyer ma position » de l'accordéon facultatif, grand bouton sous le quartier.
8. **« Je réserve pour un proche »** : choix Pour moi / Pour un proche ; prénom + âge du patient, étage, case « pas d'ascenseur » ; le message WhatsApp le mentionne.
9. **Lisibilité seniors** : retirer `maximum-scale=1, user-scalable=no` de `index.html`, aucun texte < 13 px, pas de choix pré-sélectionné (motif + quartier) — désactiver « Continuer » tant qu'ils ne sont pas choisis.
10. **Traduction arabe incomplète** : beaucoup de textes du tunnel sont en dur en français dans `BookingFlow.jsx`, `LandingHero.jsx`, `BookingTracking.jsx`. Les passer dans `translations.js`.
11. **Confiance** : remplacer le monogramme « BI » à coche verte par une vraie photo + « Diplômé ISPITS · 8 ans d'expérience · N° INPE » ; supprimer les points verts clignotants (`animate-pulse`) ; réafficher quelques quartiers desservis.
12. Police : `font-black` (900) utilisé mais Plus Jakarta Sans chargée jusqu'à 800 → remplacer par `font-extrabold`. Les classes `animate-in`/`fade-in` ne font rien (plugin `tailwindcss-animate` absent).

## 4. Commandes

```bash
npm install
npm run dev               # http://localhost:3000
npm run build
npm run deploy:hosting    # Firebase Hosting
```

`.env` (non versionné, déjà présent dans le dossier) contient `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_KINE_PHONE=212763961582`, `VITE_KINE_PRICE_START=200`.

Pour tester l'admin sans toucher aux vraies données : lancer Vite avec `VITE_SUPABASE_URL` et
`VITE_SUPABASE_ANON_KEY` vides → mode démo local (données de `mockStorage.js`, connexion simulée).
