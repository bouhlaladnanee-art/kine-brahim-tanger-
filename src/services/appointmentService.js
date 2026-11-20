// Service Unifié pour la gestion des Rendez-vous (Supabase / Fallback Mock)
import { supabase, isSupabaseConfigured } from './supabase';
import { mockStorage } from './mockStorage';

export const appointmentService = {
  /**
   * Crée un nouveau rendez-vous dans Supabase (avec upload d'ordonnance sur Storage si fournie)
   */
  create: async (appointmentData, prescriptionFile = null) => {
    let prescriptionUrl = null;
    let prescriptionFileName = null;

    if (isSupabaseConfigured && supabase) {
      try {
        // Upload sur Supabase Storage si une ordonnance est jointe
        if (prescriptionFile) {
          const safeName = prescriptionFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${Date.now()}_${safeName}`;
          const { error: uploadError } = await supabase.storage
            .from('prescriptions')
            .upload(filePath, prescriptionFile);

          if (uploadError) {
            // L'échec d'upload de l'ordonnance ne doit pas bloquer la réservation
            console.error("Échec de l'upload de l'ordonnance :", uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from('prescriptions')
              .getPublicUrl(filePath);

            prescriptionUrl = urlData?.publicUrl || null;
            prescriptionFileName = prescriptionFile.name;
          }
        }

        // Les champs quartier / adresse / GPS n'ont pas de colonne dédiée :
        // ils sont sérialisés en JSON dans patient_address (relu par normalizeAppointment).
        const location = {
          neighborhood: appointmentData.neighborhood || null,
          neighborhoodName: appointmentData.neighborhoodName || null,
          addressDetails: appointmentData.addressDetails || '',
          geoCoordinates: appointmentData.geoCoordinates || null,
        };

        const row = {
            patient_name: appointmentData.patientName,
            patient_phone: appointmentData.phone || appointmentData.patientPhone || null,
            patient_address: JSON.stringify(location),
            care_type: appointmentData.careType,
            care_type_title: appointmentData.careTypeTitle,
            date: appointmentData.date,
            time_slot: appointmentData.timeSlot,
            time_slot_hours: appointmentData.timeSlotLabel || null,
            notes: appointmentData.notes,
            prescription_url: prescriptionUrl,
            prescription_file_name: prescriptionFileName,
            status: 'en_attente',
            language: appointmentData.language || 'fr',
            // Jeton secret : permet au patient (et à lui seul) de suivre sa demande
            tracking_token: newTrackingToken(),
        };

        // Insertion sans relecture (pas de .select()) : le patient anonyme a le droit
        // d'écrire une demande mais pas de lire la table (données de santé des autres patients).
        const { error } = await supabase.from('appointments').insert([row]);

        if (error) throw error;

        return normalizeAppointment({ ...row, created_at: new Date().toISOString() });
      } catch (error) {
        // Ne jamais simuler un succès : sinon le patient croit avoir réservé
        // alors que le kiné ne reçoit rien. L'appelant affiche l'erreur.
        console.error('Erreur Supabase lors de la création du rendez-vous :', error);
        throw error;
      }
    } else {
      return mockStorage.create({ ...appointmentData, trackingToken: newTrackingToken() });
    }
  },

  /**
   * Suivi patient : lit UNE demande via son jeton (fonction SQL sécurisée)
   */
  getByToken: async (token) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('get_appointment_by_token', { p_token: token });
      if (error) throw error;
      return data || null;
    }
    return mockStorage.getAll().find(a => a.trackingToken === token) || null;
  },

  /**
   * Suivi patient : accepte (true) ou refuse (false) l'horaire proposé par le kiné
   */
  respondToProposal: async (token, accept) => {
    const { data, error } = await supabase.rpc('respond_to_proposal', { p_token: token, p_accept: accept });
    if (error) throw error;
    return data;
  },

  /**
   * Suivi patient : annulation de sa propre demande
   */
  cancelByToken: async (token) => {
    const { data, error } = await supabase.rpc('cancel_appointment_by_token', { p_token: token });
    if (error) throw error;
    return data;
  },

  /**
   * Admin : propose un autre horaire au patient (la demande reste "en attente")
   */
  proposeNewTime: async (id, { date, timeSlot, timeSlotLabel, message }) => {
    const { error } = await supabase
      .from('appointments')
      .update({
        proposed_date: date,
        proposed_time_slot: timeSlot,
        proposed_time_label: timeSlotLabel,
        kine_message: message || null,
        patient_response: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Écoute en temps réel les rendez-vous (Supabase Realtime)
   */
  subscribe: (callback, onError = () => {}) => {
    if (isSupabaseConfigured && supabase) {
      // Jamais de données de démo ici : en cas d'erreur, on le signale au praticien
      const load = () =>
        supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              console.error('Lecture des rendez-vous impossible :', error);
              onError(error);
            } else {
              onError(null);
              callback((data || []).map(normalizeAppointment));
            }
          });

      load();

      // Écoute temps réel + rafraîchissement de secours toutes les 30 s
      const channel = supabase
        .channel('appointments-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
        .subscribe();
      const interval = setInterval(load, 30000);

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    } else {
      callback(mockStorage.getAll());
      const interval = setInterval(() => callback(mockStorage.getAll()), 3000);
      return () => clearInterval(interval);
    }
  },

  /**
   * Met à jour le statut d'un rendez-vous ('confirme', 'accompli', 'annule')
   */
  updateStatus: async (id, newStatus) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Erreur mise à jour Supabase :', error);
        mockStorage.updateStatus(id, newStatus);
        return false;
      }
    } else {
      mockStorage.updateStatus(id, newStatus);
      return true;
    }
  }
};

/**
 * Normalise les clés snake_case Supabase → camelCase pour l'app
 */
function newTrackingToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Repli pour anciens navigateurs (UUID v4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function parseLocation(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // Anciennes lignes : adresse en texte libre
  }
  return { addressDetails: String(raw) };
}

function normalizeAppointment(row) {
  const location = parseLocation(row.patient_address);
  return {
    id: row.id,
    patientName: row.patient_name,
    phone: row.patient_phone || '',
    patientPhone: row.patient_phone || '',
    neighborhood: location.neighborhood || null,
    neighborhoodName: location.neighborhoodName || 'Tanger',
    addressDetails: location.addressDetails || '',
    geoCoordinates: location.geoCoordinates || null,
    careType: row.care_type,
    careTypeTitle: row.care_type_title,
    date: row.date,
    timeSlot: row.time_slot,
    timeSlotLabel: row.time_slot_hours || '',
    notes: row.notes,
    prescriptionUrl: row.prescription_url,
    prescriptionFileName: row.prescription_file_name,
    status: row.status,
    language: row.language,
    trackingToken: row.tracking_token || null,
    proposedDate: row.proposed_date || null,
    proposedTimeSlot: row.proposed_time_slot || null,
    proposedTimeLabel: row.proposed_time_label || null,
    kineMessage: row.kine_message || null,
    patientResponse: row.patient_response || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
