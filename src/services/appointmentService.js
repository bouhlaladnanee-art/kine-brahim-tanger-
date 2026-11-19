// Service Unifié pour la gestion des Rendez-vous (Firestore / Firebase Storage / Fallback Mock)
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { mockStorage } from './mockStorage';

export const appointmentService = {
  /**
   * Crée un nouveau rendez-vous dans Firestore (avec upload d'ordonnance sur Storage si fournie)
   */
  create: async (appointmentData, prescriptionFile = null) => {
    let prescriptionUrl = null;
    let prescriptionFileName = null;

    if (isFirebaseConfigured && db) {
      try {
        // Upload sur Firebase Storage si une ordonnance est jointe
        if (prescriptionFile && storage) {
          const safeName = prescriptionFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileRef = ref(storage, `prescriptions/${Date.now()}_${safeName}`);
          const uploadResult = await uploadBytes(fileRef, prescriptionFile);
          prescriptionUrl = await getDownloadURL(uploadResult.ref);
          prescriptionFileName = prescriptionFile.name;
        }

        const docRef = await addDoc(collection(db, 'appointments'), {
          ...appointmentData,
          prescriptionUrl: prescriptionUrl || appointmentData.prescriptionUrl || null,
          prescriptionFileName: prescriptionFileName || appointmentData.prescriptionFileName || null,
          status: 'en_attente',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return {
          id: docRef.id,
          ...appointmentData,
          prescriptionUrl,
          prescriptionFileName,
          status: 'en_attente',
        };
      } catch (error) {
        console.error("Erreur Firestore lors de la création, bascule locale :", error);
        return mockStorage.create(appointmentData);
      }
    } else {
      return mockStorage.create(appointmentData);
    }
  },

  /**
   * Écoute en temps réel les rendez-vous (Firestore onSnapshot)
   */
  subscribe: (callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Conversion timestamps Firestore
            date: doc.data().date || new Date().toISOString().split('T')[0],
          }));
          callback(list);
        }, (error) => {
          console.warn("Erreur écouteur Firestore, utilisation des données locales :", error);
          callback(mockStorage.getAll());
        });
        return unsubscribe;
      } catch (err) {
        callback(mockStorage.getAll());
        return () => {};
      }
    } else {
      callback(mockStorage.getAll());
      // Rechargement local si des modifications surviennent
      const interval = setInterval(() => {
        callback(mockStorage.getAll());
      }, 3000);
      return () => clearInterval(interval);
    }
  },

  /**
   * Met à jour le statut d'un rendez-vous ('confirme', 'accompli', 'annule')
   */
  updateStatus: async (id, newStatus) => {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'appointments', id);
        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (error) {
        console.error("Erreur mise à jour Firestore :", error);
        mockStorage.updateStatus(id, newStatus);
        return false;
      }
    } else {
      mockStorage.updateStatus(id, newStatus);
      return true;
    }
  }
};
