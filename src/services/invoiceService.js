// Service de gestion et persistance des factures (Synchrone localStorage + Sync Supabase en arrière-plan)
import { supabase, isSupabaseConfigured } from './supabase';

const INVOICE_STORAGE_KEY = 'kine_tanger_invoices_v1';

const INITIAL_SAMPLE_INVOICES = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'FACT-2026-001',
    patientName: 'Yassine Benali',
    patientPhone: '0661234567',
    patientAddress: 'Résidence Panorama Baie, Malabata, Tanger',
    careTypeTitle: 'Rééducation post-opératoire (Genou)',
    sessionsCount: 5,
    unitPriceMAD: 200,
    totalMAD: 1000,
    date: new Date().toISOString().split('T')[0],
    status: 'payee',
    paymentMethod: 'Espèces sur place',
    notes: 'Prescription médicale du Dr. Alami. Traitement pour rééducation post-ligamentoplastie.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'inv-2026-002',
    invoiceNumber: 'FACT-2026-002',
    patientName: 'Fatima Zahra Mansouri',
    patientPhone: '0672889900',
    patientAddress: 'Avenue de la Paix, Iberia, Tanger',
    careTypeTitle: 'Mal de dos & Sciatique (Lumbago aigu)',
    sessionsCount: 3,
    unitPriceMAD: 200,
    totalMAD: 600,
    date: new Date().toISOString().split('T')[0],
    status: 'payee',
    paymentMethod: 'Virement bancaire',
    notes: 'Séances de kiné antalgique et décompression discale.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

function normalizeInvoice(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number || row.invoiceNumber,
    patientName: row.patient_name || row.patientName,
    patientPhone: row.patient_phone || row.patientPhone,
    patientAddress: row.patient_address || row.patientAddress,
    careTypeTitle: row.care_type_title || row.careTypeTitle,
    sessionsCount: Number(row.sessions_count || row.sessionsCount) || 1,
    unitPriceMAD: Number(row.unit_price_mad || row.unitPriceMAD) || 200,
    totalMAD: Number(row.total_mad || row.totalMAD) || ((Number(row.sessions_count || row.sessionsCount) || 1) * (Number(row.unit_price_mad || row.unitPriceMAD) || 200)),
    date: row.date || new Date().toISOString().split('T')[0],
    status: row.status || 'en_attente',
    paymentMethod: row.payment_method || row.paymentMethod,
    notes: row.notes,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

function getLocalInvoices() {
  try {
    const data = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_INVOICES));
      return INITIAL_SAMPLE_INVOICES;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_INVOICES;
  } catch {
    return INITIAL_SAMPLE_INVOICES;
  }
}

function saveLocalInvoices(list) {
  try {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

// Synchronisation initiale silencieuse depuis Supabase en tâche de fond
if (isSupabaseConfigured && supabase) {
  supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        saveLocalInvoices(data.map(normalizeInvoice));
      }
    })
    .catch(() => {});
}

export const invoiceService = {
  getAll: () => {
    return getLocalInvoices();
  },

  create: (invoiceData) => {
    const list = getLocalInvoices();
    const count = list.length + 1;
    const invoiceNumber = invoiceData.invoiceNumber || `FACT-2026-${String(count).padStart(3, '0')}`;
    const sessions = Number(invoiceData.sessionsCount) || 1;
    const unitPrice = Number(invoiceData.unitPriceMAD) || 200;

    const newInvoice = {
      ...invoiceData,
      id: 'inv-' + Date.now().toString(36),
      invoiceNumber,
      sessionsCount: sessions,
      unitPriceMAD: unitPrice,
      totalMAD: sessions * unitPrice,
      createdAt: new Date().toISOString(),
    };

    const updated = [newInvoice, ...list];
    saveLocalInvoices(updated);

    // Sync en arrière-plan vers Supabase
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          patient_name: newInvoice.patientName,
          patient_phone: newInvoice.patientPhone,
          patient_address: newInvoice.patientAddress,
          care_type_title: newInvoice.careTypeTitle,
          sessions_count: sessions,
          unit_price_mad: unitPrice,
          date: newInvoice.date || new Date().toISOString().split('T')[0],
          status: newInvoice.status || 'en_attente',
          payment_method: newInvoice.paymentMethod,
          notes: newInvoice.notes,
        }])
        .then(() => {})
        .catch(() => {});
    }

    return newInvoice;
  },

  delete: (id) => {
    const list = getLocalInvoices();
    const updated = list.filter(i => i.id !== id);
    saveLocalInvoices(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('invoices').delete().eq('id', id).then(() => {}).catch(() => {});
    }

    return updated;
  }
};
