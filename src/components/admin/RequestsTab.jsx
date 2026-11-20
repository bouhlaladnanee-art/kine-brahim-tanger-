import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Phone, 
  MessageCircle, 
  Eye, 
  CalendarPlus,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import PrescriptionModal from './PrescriptionModal';
import { generateGoogleCalendarUrl, downloadICSFile } from '../../utils/calendar';
import { formatWhatsAppNumber } from '../../utils/whatsapp';

export default function RequestsTab({ 
  appointments, 
  onUpdateStatus, 
  onOpenInvoice 
}) {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [confirmedModalApt, setConfirmedModalApt] = useState(null);

  // Filtrer les rendez-vous en attente
  const pendingAppointments = appointments.filter(a => a.status === 'en_attente');

  const handleValidate = (apt) => {
    onUpdateStatus(apt.id, 'confirme');
    setConfirmedModalApt(apt);
  };

  const handleReject = (apt) => {
    if (window.confirm(`Confirmez-vous le refus de la demande de ${apt.patientName} ?`)) {
      onUpdateStatus(apt.id, 'annule');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* En-tête */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-text-main">
            Nouvelles demandes
          </h3>
          <p className="text-xs text-text-muted">
            {pendingAppointments.length} réservation{pendingAppointments.length > 1 ? 's' : ''} en attente de validation
          </p>
        </div>
        <span className="bg-amber-100 text-amber-800 font-black text-xs px-2.5 py-1 rounded-full">
          {pendingAppointments.length}
        </span>
      </div>

      {/* Liste des demandes */}
      {pendingAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-text-main text-sm">
              Toutes les demandes ont été traitées
            </h3>
            <p className="text-xs text-text-muted">
              Les nouvelles réservations soumises par les patients apparaîtront ici instantanément.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingAppointments.map((apt) => {
            const hasPrescription = !!apt.prescriptionUrl;

            return (
              <Card key={apt.id} className="space-y-3 bg-white border-amber-200/80 shadow-soft">
                {/* En-tête de carte */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-base text-text-main">
                      {apt.patientName}
                    </h4>
                    <p className="text-xs font-semibold text-primary">
                      {apt.careTypeTitle}
                    </p>
                  </div>
                  <Badge status="en_attente" size="sm">
                    En attente
                  </Badge>
                </div>

                {/* Date et Plage horaire */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl flex items-center gap-1.5 text-text-main">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-bold truncate">{apt.date}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl flex items-center gap-1.5 text-text-main">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold truncate">{(apt.timeSlotLabel || 'Créneau à préciser').split('(')[0].trim()}</span>
                  </div>
                </div>

                {/* Localisation Tanger */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-text-main">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{apt.neighborhoodName}</span>
                  </div>
                  {apt.addressDetails && (
                    <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
                      {apt.addressDetails}
                    </p>
                  )}
                  {apt.geoCoordinates && (
                    <p className="text-emerald-700 font-semibold pl-5 text-[10px]">
                      📍 Coordonnées GPS fournies
                    </p>
                  )}
                </div>

                {/* Ordonnance jointe */}
                {hasPrescription && (
                  <div className="flex items-center justify-between bg-primary-50/70 border border-primary-200/60 p-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[200px]">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-semibold text-primary truncate">
                        {apt.prescriptionFileName || "Photo d'ordonnance"}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedPrescription({
                        url: apt.prescriptionUrl,
                        name: apt.prescriptionFileName
                      })}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Voir la photo</span>
                    </button>
                  </div>
                )}

                {/* Notes éventuelles */}
                {apt.notes && (
                  <div className="text-[11px] text-slate-500 italic bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                    "{apt.notes}"
                  </div>
                )}

                {/* Actions Kiné */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleValidate(apt)}
                    className="bg-primary hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-soft"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Valider & Planifier</span>
                  </button>

                  <button
                    onClick={() => handleReject(apt)}
                    className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Refuser</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMATION & AJOUT AGENDA */}
      {confirmedModalApt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-text-main">
                Rendez-vous Validé !
              </h3>
              <p className="text-xs text-text-muted">
                La séance de {confirmedModalApt.patientName} est confirmée et intégrée dans votre tournée.
              </p>
            </div>

            {/* Actions Calendrier & WhatsApp */}
            <div className="space-y-2 pt-2">
              <a
                href={generateGoogleCalendarUrl(confirmedModalApt)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-primary" />
                <span>Ajouter à Google Calendar</span>
              </a>

              <button
                onClick={() => downloadICSFile(confirmedModalApt)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>Télécharger fichier (.ics)</span>
              </button>

              <a
                href={`https://wa.me/${formatWhatsAppNumber(confirmedModalApt.phone)}?text=${encodeURIComponent(`Bonjour ${confirmedModalApt.patientName}, votre demande de kinésithérapie à domicile à Tanger pour le ${confirmedModalApt.date} (${confirmedModalApt.timeSlotLabel}) est bien confirmée. À très bientôt ! BOUHLAL Ibrahim.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmer par WhatsApp au patient</span>
              </a>
            </div>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setConfirmedModalApt(null)}
            >
              Fermer
            </Button>
          </div>
        </div>
      )}

      {/* Visualiseur d'ordonnance médicale */}
      {selectedPrescription && (
        <PrescriptionModal
          imageUrl={selectedPrescription.url}
          fileName={selectedPrescription.name}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
}
