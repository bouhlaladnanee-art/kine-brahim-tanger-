import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Upload, 
  Camera, 
  X, 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  MessageCircle, 
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { 
  CARE_TYPES, 
  TANGER_NEIGHBORHOODS, 
  TIME_SLOTS, 
  PRACTITIONER_INFO 
} from '../../data/constants';
import { getCurrentCoordinates } from '../../utils/geolocation';
import { generatePatientWhatsAppLink } from '../../utils/whatsapp';
import { appointmentService } from '../../services/appointmentService';

export default function BookingFlow({ initialCareType = null, onCancel, onCompleted }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    careTypeId: initialCareType || CARE_TYPES[0].id,
    prescriptionFile: null,
    prescriptionPreview: null,
    neighborhoodId: TANGER_NEIGHBORHOODS[0].id,
    addressDetails: '',
    geoCoordinates: null,
    date: new Date().toISOString().split('T')[0],
    timeSlotId: TIME_SLOTS[0].id,
    patientName: '',
    phone: '',
    notes: '',
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Génération des 14 prochains jours disponibles
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;
    
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    let label = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
    let sublabel = '';
    if (isToday) sublabel = "Aujourd'hui";
    if (isTomorrow) sublabel = 'Demain';

    return { iso, label, sublabel, dateObj: d };
  });

  // Gestion de l'upload de photo d'ordonnance
  const handlePrescriptionUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setValidationError("La photo de l'ordonnance ne doit pas dépasser 8 Mo.");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        prescriptionFile: file,
        prescriptionPreview: previewUrl
      }));
      setValidationError('');
    }
  };

  const removePrescription = () => {
    if (formData.prescriptionPreview) {
      URL.revokeObjectURL(formData.prescriptionPreview);
    }
    setFormData(prev => ({
      ...prev,
      prescriptionFile: null,
      prescriptionPreview: null
    }));
  };

  // Géolocalisation Tanger
  const handleCaptureGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getCurrentCoordinates();
      setFormData(prev => ({
        ...prev,
        geoCoordinates: coords
      }));
      setGpsSuccess(true);
    } catch (err) {
      setGpsError(err.message);
      setGpsSuccess(false);
    } finally {
      setGpsLoading(false);
    }
  };

  // Navigation étapes
  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      if (!formData.careTypeId) {
        setValidationError("Veuillez sélectionner un motif de soin.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.neighborhoodId) {
        setValidationError("Veuillez choisir votre quartier à Tanger.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.date || !formData.timeSlotId) {
        setValidationError("Veuillez choisir une date et un créneau.");
        return;
      }
      setStep(4);
    }
  };

  const handlePrev = () => {
    setValidationError('');
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  // Soumission finale de la réservation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.patientName.trim()) {
      setValidationError("Veuillez renseigner votre nom complet.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setValidationError("Veuillez entrer un numéro de téléphone marocain valide (ex: 06 12 34 56 78).");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCare = CARE_TYPES.find(c => c.id === formData.careTypeId);
      const selectedNeighborhood = TANGER_NEIGHBORHOODS.find(n => n.id === formData.neighborhoodId);
      const selectedSlot = TIME_SLOTS.find(s => s.id === formData.timeSlotId);

      const appointmentRecord = {
        patientName: formData.patientName.trim(),
        phone: formData.phone.trim(),
        careType: formData.careTypeId,
        careTypeTitle: selectedCare ? selectedCare.title : 'Kiné à domicile',
        prescriptionUrl: formData.prescriptionPreview || null,
        prescriptionFileName: formData.prescriptionFile ? formData.prescriptionFile.name : null,
        neighborhood: formData.neighborhoodId,
        neighborhoodName: selectedNeighborhood ? selectedNeighborhood.name : 'Tanger',
        addressDetails: formData.addressDetails.trim(),
        geoCoordinates: formData.geoCoordinates,
        date: formData.date,
        timeSlot: formData.timeSlotId,
        timeSlotLabel: selectedSlot ? `${selectedSlot.label} (${selectedSlot.hours})` : 'Plage convenue',
        notes: formData.notes.trim(),
      };

      // Sauvegarde dans Firestore (ou fallback local) avec upload Storage de l'ordonnance
      const saved = await appointmentService.create(appointmentRecord, formData.prescriptionFile);
      setSubmittedAppointment(saved);
      setIsSubmitting(false);

      if (onCompleted) {
        onCompleted(saved);
      }
    } catch (err) {
      setValidationError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  // Helper pour trouver les objets sélectionnés
  const currentCare = CARE_TYPES.find(c => c.id === formData.careTypeId);
  const currentNeighborhood = TANGER_NEIGHBORHOODS.find(n => n.id === formData.neighborhoodId);
  const currentSlot = TIME_SLOTS.find(s => s.id === formData.timeSlotId);

  // ----------------------------------------------------
  // ÉCRAN DE CONFIRMATION FINAL
  // ----------------------------------------------------
  if (submittedAppointment) {
    const waLink = generatePatientWhatsAppLink({
      patientName: submittedAppointment.patientName,
      phone: submittedAppointment.phone,
      careTypeTitle: submittedAppointment.careTypeTitle,
      neighborhoodName: submittedAppointment.neighborhoodName,
      addressDetails: submittedAppointment.addressDetails,
      dateFormatted: submittedAppointment.date,
      timeSlotLabel: submittedAppointment.timeSlotLabel,
      hasPrescription: !!submittedAppointment.prescriptionUrl,
      coordinates: submittedAppointment.geoCoordinates,
      kinePhone: PRACTITIONER_INFO.whatsappNumber
    });

    return (
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6 text-center pt-4">
          {/* Cercle d'approbation animé */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-soft ring-8 ring-emerald-50 animate-bounce">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Demande enregistrée avec succès
            </span>
            <h2 className="text-2xl font-black text-text-main">
              Rendez-vous en attente
            </h2>
            <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
              Brahim a bien reçu votre demande. Pour accélérer la validation, confirmez-la directement sur WhatsApp :
            </p>
          </div>

          {/* Récapitulatif condensé */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 shadow-card text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-text-muted">Patient :</span>
              <span className="font-bold text-text-main">{submittedAppointment.patientName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-text-muted">Soin :</span>
              <span className="font-bold text-primary">{submittedAppointment.careTypeTitle}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-text-muted">Quartier :</span>
              <span className="font-bold text-text-main">{submittedAppointment.neighborhoodName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-text-muted">Créneau :</span>
              <span className="font-bold text-text-main">{submittedAppointment.date} • {submittedAppointment.timeSlotLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Tarif indicatif :</span>
              <span className="font-bold text-accent">{PRACTITIONER_INFO.basePriceMAD} DH (sur place)</span>
            </div>
          </div>

          {/* GROS BOUTON VERT WHATSAPP */}
          <div className="space-y-3 pt-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white py-4 px-6 rounded-2xl font-extrabold text-base shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              <span>Confirmer ma demande sur WhatsApp</span>
            </a>
            <p className="text-[11px] text-text-muted">
              Ouvre WhatsApp avec votre récapitulatif pré-rempli sans rien avoir à réécrire.
            </p>
          </div>
        </div>

        {/* Bouton retour accueil */}
        <div className="pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            fullWidth
            onClick={onCancel}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FORMULAIRE DU TUNNEL EN 4 ÉTAPES
  // ----------------------------------------------------
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Barre de navigation de formulaire */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors py-1 px-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 1 ? 'Annuler' : 'Précédent'}</span>
        </button>

        <span className="text-xs font-bold text-primary">
          Étape {step} sur 4
        </span>

        <span className="text-xs text-text-muted font-medium">
          {step === 1 && 'Motif'}
          {step === 2 && 'Lieu'}
          {step === 3 && 'Créneau'}
          {step === 4 && 'Contact'}
        </span>
      </div>

      {/* Barre de progression tactile */}
      <div className="w-full bg-slate-100 h-1.5">
        <div 
          className="bg-primary h-full transition-all duration-300 rounded-r-full"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Contenu de l'étape active */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ---------------- ÉTAPE 1 : MOTIF & ORDONNANCE ---------------- */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-text-main">
                Quel est le motif de votre soin ?
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Sélectionnez le type de rééducation souhaité à votre domicile.
              </p>
            </div>

            {/* Grille des soins */}
            <div className="grid grid-cols-1 gap-2.5">
              {CARE_TYPES.map(care => {
                const isSelected = formData.careTypeId === care.id;
                return (
                  <div
                    key={care.id}
                    onClick={() => setFormData({ ...formData, careTypeId: care.id })}
                    className={`
                      p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                      ${isSelected 
                        ? 'border-primary bg-primary-50/40 ring-2 ring-primary/20 shadow-soft' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }
                    `}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-main">{care.title}</span>
                        {care.badge && (
                          <span className="text-[10px] font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-md">
                            {care.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{care.description}</p>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-3 ${isSelected ? 'bg-primary text-white' : 'border border-slate-200'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload d'ordonnance médicale (Facultatif) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>Photo de l'ordonnance médicale</span>
                </label>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Facultatif
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Prenez en photo votre prescription si vous en avez une, cela permet au kiné de préparer le matériel adéquat.
              </p>

              {formData.prescriptionPreview ? (
                <div className="relative rounded-2xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.prescriptionPreview} 
                      alt="Ordonnance" 
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="text-xs truncate max-w-[180px]">
                      <p className="font-semibold text-text-main truncate">
                        {formData.prescriptionFile ? formData.prescriptionFile.name : 'Ordonnance jointe'}
                      </p>
                      <p className="text-emerald-600 font-medium text-[11px] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Prête à être envoyée
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePrescription}
                    className="w-8 h-8 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-slate-600 transition-colors mr-1"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-primary-300 bg-slate-50/60 hover:bg-primary-50/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <Upload className="w-6 h-6 text-primary" />
                  <span className="text-xs font-semibold text-text-main">
                    Prendre une photo ou importer un fichier
                  </span>
                  <span className="text-[10px] text-text-muted">
                    JPG, PNG ou PDF (max 8 Mo)
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    capture="environment"
                    onChange={handlePrescriptionUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* ---------------- ÉTAPE 2 : LOCALISATION À TANGER ---------------- */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-text-main">
                Où se déroule la séance à Tanger ?
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Précisez votre quartier et votre adresse pour guider le praticien.
              </p>
            </div>

            {/* Bouton GPS Tanger */}
            <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-accent" />
                  Géolocalisation précise
                </span>
                {gpsSuccess && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Coordonnées enregistrées
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Activez votre GPS pour que le kiné puisse vous localiser directement via Google Maps ou Waze sans se perdre dans votre ruelle.
              </p>
              
              <Button
                variant={gpsSuccess ? "outline" : "primary"}
                size="md"
                fullWidth
                onClick={handleCaptureGPS}
                loading={gpsLoading}
                icon={Navigation}
              >
                {gpsSuccess ? "Mettre à jour ma position GPS" : "Utiliser ma position GPS actuelle"}
              </Button>

              {gpsError && (
                <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {gpsError}
                </p>
              )}
            </div>

            {/* Sélecteur de quartier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Quartier à Tanger <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={formData.neighborhoodId}
                onChange={(e) => setFormData({ ...formData, neighborhoodId: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {TANGER_NEIGHBORHOODS.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Précisions d'adresse */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">
                Précisions d'adresse (Résidence, Étage, Porte, Repère)
              </label>
              <textarea
                rows={3}
                placeholder="Ex : Résidence Tanger Baie, Immeuble C, 3ème étage, porte n°12. En face de la pharmacie..."
                value={formData.addressDetails}
                onChange={(e) => setFormData({ ...formData, addressDetails: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
              <p className="text-[10px] text-text-muted">
                Ces indications facilitent l'accès au domicile du praticien avec tout son matériel.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- ÉTAPE 3 : DATE & CRÉNEAU ---------------- */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-text-main">
                Choisissez votre date et votre créneau
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Séances disponibles du lundi au samedi.
              </p>
            </div>

            {/* Défilement horizontal des dates */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Date de la séance</span>
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {availableDates.map(d => {
                  const isSelected = formData.date === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setFormData({ ...formData, date: d.iso })}
                      className={`
                        shrink-0 w-24 py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1
                        ${isSelected
                          ? 'border-primary bg-primary text-white shadow-soft font-bold'
                          : 'border-slate-200 bg-white hover:border-primary-200 text-text-main'
                        }
                      `}
                    >
                      {d.sublabel ? (
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-accent-200' : 'text-accent'}`}>
                          {d.sublabel}
                        </span>
                      ) : (
                        <span className={`text-[10px] ${isSelected ? 'text-primary-100' : 'text-text-muted'}`}>
                          {d.label.split(' ')[0]}
                        </span>
                      )}
                      <span className="text-base font-extrabold leading-none">
                        {d.dateObj.getDate()}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-primary-100' : 'text-text-muted'}`}>
                        {d.label.split(' ')[2]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plages horaires */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Plage horaire souhaitée</span>
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {TIME_SLOTS.map(slot => {
                  const isSelected = formData.timeSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setFormData({ ...formData, timeSlotId: slot.id })}
                      className={`
                        p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                        ${isSelected
                          ? 'border-primary bg-primary-50/40 ring-2 ring-primary/20 shadow-soft'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                        }
                      `}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text-main">{slot.label}</span>
                          <span className="text-xs font-semibold text-primary bg-primary-100/60 px-2 py-0.5 rounded-md">
                            {slot.hours}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{slot.description}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-white' : 'border border-slate-200'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-text-muted italic">
                * Le kiné vous confirmera l'heure de passage exacte dans la plage sélectionnée.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- ÉTAPE 4 : COORDONNÉES & VALIDATION ---------------- */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-text-main">
                Vos coordonnées de contact
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Ces informations permettront à Brahim de vous contacter pour confirmer la séance.
              </p>
            </div>

            <div className="space-y-3">
              {/* Nom du patient */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  <span>Nom complet du patient <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Karim El Alami"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Téléphone marocain */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Numéro de téléphone marocain (WhatsApp) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex : 06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Remarques médicales ou d'accès */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Remarques éventuelles (pathologie, étage sans ascenseur, etc.)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Douleur aiguë au réveil, béquilles nécessaires, sonnette au nom de..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Récapitulatif avant validation */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-text-main block">
                📋 Récapitulatif de votre demande :
              </span>
              <div className="space-y-1 text-text-muted">
                <p>• <strong className="text-text-main">Soin :</strong> {currentCare ? currentCare.title : ''}</p>
                <p>• <strong className="text-text-main">Lieu :</strong> {currentNeighborhood ? currentNeighborhood.name : ''}</p>
                <p>• <strong className="text-text-main">Créneau :</strong> {formData.date} ({currentSlot ? currentSlot.label : ''})</p>
                <p>• <strong className="text-text-main">Tarif indicatif :</strong> {PRACTITIONER_INFO.basePriceMAD} DH (paiement sur place)</p>
                {formData.geoCoordinates && (
                  <p className="text-emerald-700 font-semibold">• Coordonnées GPS Tanger incluses</p>
                )}
                {formData.prescriptionFile && (
                  <p className="text-primary font-semibold">• Ordonnance médicale jointe</p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Barre d'action fixe en bas */}
      <div className="p-4 border-t border-slate-100 bg-white/95 backdrop-blur-md safe-bottom">
        {step < 4 ? (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleNext}
            icon={ArrowRight}
            iconPosition="right"
            className="shadow-md shadow-accent/20"
          >
            Continuer
          </Button>
        ) : (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={Check}
            iconPosition="right"
            className="shadow-lg shadow-accent/25"
          >
            Valider ma réservation
          </Button>
        )}
      </div>
    </div>
  );
}
