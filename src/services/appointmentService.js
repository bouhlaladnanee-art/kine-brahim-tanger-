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
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('prescriptions')
            .upload(filePath, prescriptionFile);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('prescriptions')
            .getPublicUrl(filePath);

          prescriptionUrl = urlData?.publicUrl || null;
          prescriptionFileName = prescriptionFile.name;
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert([{
            patient_name: appointmentData.patientName || appointmentData.patient_name,
            patient_phone: appointmentData.patientPhone || appointmentData.patient_phone,
            patient_address: appointmentData.patientAddress || appointmentData.patient_address,
            care_type: appointmentData.careType || appointmentData.care_type,
            care_type_title: appointmentData.careTypeTitle || appointmentData.care_type_title,
            date: appointmentData.date,
            time_slot: appointmentData.timeSlot || appointmentData.time_slot,
            time_slot_hours: appointmentData.timeSlotHours || appointmentData.time_slot_hours,
            notes: appointmentData.notes,
            prescription_url: prescriptionUrl || appointmentData.prescriptionUrl || null,
            prescription_file_name: prescriptionFileName || appointmentData.prescriptionFileName || null,
            status: 'en_attente',
            language: appointmentData.language || 'fr',
          }])
          .select()
          .single();

        if (error) throw error;

        // Normaliser les clés pour compatibilité avec le reste de l'app
        return normalizeAppointment(data);
      } catch (error) {
        console.error('Erreur Supabase lors de la création, bascule locale :', error);
        return mockStorage.create(appointmentData);
      }
    } else {
      return mockStorage.create(appointmentData);
    }
  },

  /**
   * Écoute en temps réel les rendez-vous (Supabase Realtime)
   */
  subscribe: (callback) => {
    if (isSupabaseConfigured && supabase) {
      // Chargement initial
      supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.warn('Erreur Supabase, utilisation des données locales :', error);
            callback(mockStorage.getAll());
          } else {
            callback((data || []).map(normalizeAppointment));
          }
        });

      // Écoute temps réel
      const channel = supabase
        .channel('appointments-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              callback((data || []).map(normalizeAppointment));
            });
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
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
function normalizeAppointment(row) {
  return {
    id: row.id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientAddress: row.patient_address,
    careType: row.care_type,
    careTypeTitle: row.care_type_title,
    date: row.date,
    timeSlot: row.time_slot,
    timeSlotHours: row.time_slot_hours,
    notes: row.notes,
    prescriptionUrl: row.prescription_url,
    prescriptionFileName: row.prescription_file_name,
    status: row.status,
    language: row.language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
