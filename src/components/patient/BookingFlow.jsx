import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  Banknote,
  ShieldCheck
} from 'lucide-react';
import Button from '../common/Button';
import { 
  CARE_TYPES, 
  TANGER_NEIGHBORHOODS, 
  TIME_SLOTS, 
  PRACTITIONER_INFO 
} from '../../data/constants';
import { getCurrentCoordinates } from '../../utils/geolocation';
import { generatePatientWhatsAppLink } from '../../utils/whatsapp';
import { appointmentService } from '../../services/appointmentService';
import { availabilityService } from '../../services/availabilityService';
import { useLanguage } from '../../context/LanguageContext';

export default function BookingFlow({ initialCareType = null, onCancel, onCompleted }) {
  const { t, isRTL, currentLanguage } = useLanguage();
  
  // Tunnel optimisé en 2 étapes rapides
  // Étape 1 : Soin & Quartier
  // Étape 2 : Créneau & Coordonnées
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] = useState(null);

  // Section dépliable facultative pour l'adresse détaillée & ordonnance à l'étape 1
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  // Disponibilités en direct synchronisées avec Supabase Realtime
  const [availableDates, setAvailableDates] = useState(() => availabilityService.getAvailableUpcomingDates(14));

  useEffect(() => {
    const unsubscribe = availabilityService.subscribe(() => {
      const dates = availabilityService.getAvailableUpcomingDates(14);
      setAvailableDates(dates);
    });
    return () => unsubscribe();
  }, []);

  const initialDate = availableDates.length > 0 ? availableDates[0].iso : new Date().toISOString().split('T')[0];
  const initialSlots = availabilityService.getAvailableSlotsForDate(initialDate);
  const initialSlotId = initialSlots.length > 0 ? initialSlots[0].id : '';

  // Form State
  const [formData, setFormData] = useState({
    careTypeId: initialCareType || CARE_TYPES[0].id,
    prescriptionFile: null,
    prescriptionPreview: null,
    neighborhoodId: TANGER_NEIGHBORHOODS[0].id,
    addressDetails: '',
    geoCoordinates: null,
    date: initialDate,
    timeSlotId: initialSlotId,
    timeSlotCustomLabel: '',
    patientName: '',
    phone: '',
    notes: '',
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Créneaux ouverts pour la date sélectionnée
  const activeDateSlots = availabilityService.getAvailableSlotsForDate(formData.date);

  // Mise à jour de la date avec ajustement du créneau
  const handleSelectDate = (dateIso) => {
    const slots = availabilityService.getAvailableSlotsForDate(dateIso);
    const hasCurrentSlot = slots.some(s => s.id === formData.timeSlotId);
    setFormData(prev => ({
      ...prev,
      date: dateIso,
      timeSlotId: hasCurrentSlot ? prev.timeSlotId : (slots[0]?.id || ''),
      timeSlotCustomLabel: ''
    }));
  };

  // Upload d'ordonnance médicale
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
      setShowOptionalDetails(true);
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
      setShowOptionalDetails(true);
    } catch (err) {
      setGpsError(err.message);
      setGpsSuccess(false);
    } finally {
      setGpsLoading(false);
    }
  };

  // Navigation entre les 2 étapes
  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      if (!formData.careTypeId) {
        setValidationError("Veuillez sélectionner un motif de soin.");
        return;
      }
      if (!formData.neighborhoodId) {
        setValidationError("Veuillez sélectionner votre quartier à Tanger.");
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setValidationError('');
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  // Soumission finale de la réservation
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    if (!formData.date || !formData.timeSlotId) {
      setValidationError("Veuillez choisir une date et un créneau.");
      return;
    }

    if (!formData.patientName.trim()) {
      setValidationError("Veuillez indiquer votre nom complet.");
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
        timeSlotLabel: formData.timeSlotCustomLabel || (selectedSlot ? `${selectedSlot.label} (${selectedSlot.hours})` : 'Plage convenue'),
        notes: formData.notes.trim(),
      };

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

  const currentCare = CARE_TYPES.find(c => c.id === formData.careTypeId);
  const currentNeighborhood = TANGER_NEIGHBORHOODS.find(n => n.id === formData.neighborhoodId);
  const currentSlot = TIME_SLOTS.find(s => s.id === formData.timeSlotId);

  // ----------------------------------------------------
  // ÉCRAN DE CONFIRMATION FINAL (AVEC BOUTON WHATSAPP)
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
      kinePhone: PRACTITIONER_INFO.whatsappNumber,
      language: currentLanguage
    });

    return (
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-6 bg-white min-h-[80vh]">
        <div className="space-y-6 text-center pt-4 max-w-md mx-auto w-full">
          {/* Cercle d'approbation */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t('confirmedBadge')}
            </span>
            <h2 className="text-2xl font-black text-text-main">
              {t('confirmedTitle')}
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              {t('confirmedDesc')}
            </p>
          </div>

          {/* Récapitulatif clair & synthétique */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-text-muted">Patient :</span>
              <span className="font-bold text-text-main">{submittedAppointment.patientName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-text-muted">Soin :</span>
              <span className="font-bold text-primary">{submittedAppointment.careTypeTitle}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-text-muted">Quartier :</span>
              <span className="font-bold text-text-main">{submittedAppointment.neighborhoodName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-text-muted">Créneau :</span>
              <span className="font-bold text-text-main">{submittedAppointment.date} • {submittedAppointment.timeSlotLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Tarif indicatif :</span>
              <span className="font-bold text-slate-800">À partir de {PRACTITIONER_INFO.basePriceMAD} DH (sur place)</span>
            </div>
            <p className="text-[10px] text-slate-500 italic text-right pt-0.5">
              * {t('priceNoticeDiagnostic')}
            </p>
          </div>

          {/* GROS BOUTON VERT WHATSAPP */}
          <div className="space-y-3 pt-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-md transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{t('btnConfirmWA')}</span>
            </a>
            <p className="text-[11px] text-text-muted">
              {t('waAutoMessageNotice')}
            </p>
          </div>
        </div>

        {/* Bouton retour accueil */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            {t('btnBackHome')}
          </Button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TUNNEL EN 2 ÉTAPES RAPIDES & INTUITIVES
  // ----------------------------------------------------
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Barre supérieure du formulaire */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors py-1 px-2 rounded-lg"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{step === 1 ? t('btnCancel') : t('btnPrev')}</span>
        </button>

        <span className="text-xs font-bold text-primary">
          {isRTL ? `المرحلة ${step} من 2` : `Étape ${step} sur 2`}
        </span>

        <span className="text-xs text-text-muted font-medium">
          {step === 1 ? 'Soin & Quartier' : 'Créneau & Contact'}
        </span>
      </div>

      {/* Barre de progression épurée */}
      <div className="w-full bg-slate-100 h-1">
        <div 
          className="bg-primary h-full transition-all duration-300 rounded-r-full"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      {/* Contenu de l'étape */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* ÉTAPE 1 : MOTIF DE SOIN & QUARTIER                          */}
        {/* ------------------------------------------------------------ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-text-main">
                1. Motif de soin & Quartier
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Sélectionnez le type de prise en charge et votre localisation à Tanger.
              </p>
            </div>

            {/* Choix du soin (5 cartes simples et lisibles) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main block">
                Type de rééducation souhaité <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CARE_TYPES.map(care => {
                  const isSelected = formData.careTypeId === care.id;
                  return (
                    <div
                      key={care.id}
                      onClick={() => setFormData({ ...formData, careTypeId: care.id })}
                      className={`
                        p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                        ${isSelected 
                          ? 'border-primary bg-primary-50/50 ring-2 ring-primary/20 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold text-sm text-text-main block">{care.title}</span>
                        <p className="text-xs text-text-muted leading-tight">{care.description}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quartier à Tanger */}
            <div className="space-y-1.5 pt-2">
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

            {/* Détails facultatifs (Accordéon dépliable pour ne pas surcharger) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span>Adresse précise, GPS ou ordonnance (facultatif)</span>
                </span>
                {showOptionalDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showOptionalDetails && (
                <div className="p-4 border-t border-slate-200 space-y-4 bg-white">
                  {/* Précisions d'adresse */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-main">
                      Précisions d'adresse (Résidence, Étage, Porte, Repère)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex : Résidence Tanger Baie, Immeuble C, 3ème étage..."
                      value={formData.addressDetails}
                      onChange={(e) => setFormData({ ...formData, addressDetails: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>

                  {/* Bouton GPS Tanger */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Button
                      type="button"
                      variant={gpsSuccess ? "outline" : "primary"}
                      size="sm"
                      onClick={handleCaptureGPS}
                      loading={gpsLoading}
                      icon={Navigation}
                      className="text-xs py-2 px-3"
                    >
                      {gpsSuccess ? "Position GPS enregistrée ✓" : "Utiliser ma position GPS"}
                    </Button>
                    {gpsError && (
                      <span className="text-[10px] text-rose-600 truncate max-w-[150px]">{gpsError}</span>
                    )}
                  </div>

                  {/* Upload photo ordonnance */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-primary" />
                      <span>Photo de l'ordonnance médicale</span>
                    </label>
                    {formData.prescriptionPreview ? (
                      <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2">
                          <img 
                            src={formData.prescriptionPreview} 
                            alt="Ordonnance" 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                          />
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Prête
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removePrescription}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-slate-300 hover:border-primary-400 bg-slate-50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center text-xs font-semibold text-slate-600 hover:text-primary">
                        <Upload className="w-4 h-4 text-primary" />
                        <span>Prendre en photo l'ordonnance</span>
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
            </div>

            {/* Tarif informatif discret */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <span className="font-semibold">Tarif indicatif :</span>
              <span className="font-bold text-slate-900">À partir de {PRACTITIONER_INFO.basePriceMAD} DH • Paiement sur place</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* ÉTAPE 2 : DATE, CRÉNEAU & VOS COORDONNÉES                    */}
        {/* ------------------------------------------------------------ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-text-main">
                2. Date, Créneau & Coordonnées
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Sélectionnez votre créneau et vos informations de contact pour confirmer la séance.
              </p>
            </div>

            {/* 1. Sélection de la Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Date souhaitée <span className="text-rose-500">*</span></span>
              </label>

              {availableDates.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-xs text-amber-800">
                  Aucun créneau ouvert pour le moment. Contactez directement Ibrahim sur WhatsApp.
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
                  {availableDates.map(d => {
                    const isSelected = formData.date === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => handleSelectDate(d.iso)}
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
                        <span className={`text-[9px] font-semibold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {d.availableSlotsCount} créneau{d.availableSlotsCount > 1 ? 'x' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Créneaux disponibles pour la date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Créneau horaire <span className="text-rose-500">*</span></span>
                </label>
                {new Date(formData.date + 'T00:00:00').getDay() === 0 || new Date(formData.date + 'T00:00:00').getDay() === 6 ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Week-end ouvert
                  </span>
                ) : activeDateSlots.length > 0 ? (
                  <span className="text-[10px] font-bold text-primary bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                    Créneau ouvert en semaine
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    Créneaux vides par défaut
                  </span>
                )}
              </div>

              {activeDateSlots.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-2.5">
                  <p className="text-xs font-semibold text-text-main">
                    Aucun créneau ouvert pour cette date
                  </p>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Ibrahim exerce principalement les week-ends (toute la journée). Pour convenir d’une séance en semaine ou à un horaire sur mesure, vous pouvez lui écrire directement.
                  </p>
                  <a
                    href={`https://wa.me/${PRACTITIONER_INFO.whatsappNumber}?text=${encodeURIComponent("Bonjour Ibrahim, je souhaite convenir d'une séance de kiné à domicile pour le " + formData.date + " à Tanger.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Demander cette date sur WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {activeDateSlots.map(slot => {
                    const isSelected = formData.timeSlotId === slot.id && !formData.timeSlotCustomLabel;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setFormData({ ...formData, timeSlotId: slot.id, timeSlotCustomLabel: '' })}
                        className={`
                          p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                          ${isSelected
                            ? 'border-primary bg-primary-50/50 ring-2 ring-primary/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
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

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-white' : 'border border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Coordonnées du patient */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-text-main block">
                Vos coordonnées de contact
              </label>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{t('patientNameLabel')} <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('patientNamePlaceholder')}
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>{t('phoneLabel')} <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t('phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('notesLabel')}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder={t('notesPlaceholder')}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Récapitulatif clair avant validation */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-text-main block">
                {t('summaryTitle')}
              </span>
              <div className="space-y-1 text-slate-600">
                <p>• <strong className="text-text-main">{t('waCare')} :</strong> {currentCare ? currentCare.title : ''}</p>
                <p>• <strong className="text-text-main">{t('waNeighborhood')} :</strong> {currentNeighborhood ? currentNeighborhood.name : ''}</p>
                <p>• <strong className="text-text-main">{t('waSlot')} :</strong> {formData.date} ({formData.timeSlotCustomLabel || (currentSlot ? currentSlot.label : '')})</p>
                <p>• <strong className="text-text-main">Tarif :</strong> À partir de {PRACTITIONER_INFO.basePriceMAD} DH (sur place après la séance)</p>
                <p className="text-[10px] text-slate-500 italic">* {t('priceNoticeDiagnostic')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'action fixe en bas */}
      <div className="p-4 border-t border-slate-100 bg-white/95 backdrop-blur-md safe-bottom">
        {step === 1 ? (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleNext}
            icon={ArrowRight}
            iconPosition={isRTL ? "left" : "right"}
            className="shadow-md shadow-accent/20 py-3.5 text-sm font-black rounded-2xl"
          >
            Continuer vers les disponibilités (Étape 2/2)
          </Button>
        ) : (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={Check}
            iconPosition={isRTL ? "left" : "right"}
            className="shadow-lg shadow-accent/25 py-3.5 text-sm font-black rounded-2xl"
          >
            {t('btnSubmit')}
          </Button>
        )}
      </div>
    </div>
  );
}
