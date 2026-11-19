// Service de gestion des factures - Supabase + fallback localStorage
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
    invoiceNumber: row.invoice_number,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientAddress: row.patient_address,
    careTypeTitle: row.care_type_title,
    sessionsCount: row.sessions_count,
    unitPriceMAD: Number(row.unit_price_mad),
    totalMAD: Number(row.total_mad),
    date: row.date,
    status: row.status,
    paymentMethod: row.payment_method,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export const invoiceService = {
  getAll: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(normalizeInvoice);
      } catch (err) {
        console.warn('Supabase invoices error, fallback local :', err);
      }
    }
    // Fallback localStorage
    try {
      const data = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_INVOICES));
        return INITIAL_SAMPLE_INVOICES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAMPLE_INVOICES;
    }
  },

  create: async (invoiceData) => {
    const list = await invoiceService.getAll();
    const count = list.length + 1;
    const invoiceNumber = invoiceData.invoiceNumber || `FACT-2026-${String(count).padStart(3, '0')}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .insert([{
            invoice_number: invoiceNumber,
            patient_name: invoiceData.patientName,
            patient_phone: invoiceData.patientPhone,
            patient_address: invoiceData.patientAddress,
            care_type_title: invoiceData.careTypeTitle,
            sessions_count: Number(invoiceData.sessionsCount) || 1,
            unit_price_mad: Number(invoiceData.unitPriceMAD) || 200,
            date: invoiceData.date || new Date().toISOString().split('T')[0],
            status: invoiceData.status || 'en_attente',
            payment_method: invoiceData.paymentMethod,
            notes: invoiceData.notes,
          }])
          .select()
          .single();
        if (error) throw error;
        return normalizeInvoice(data);
      } catch (err) {
        console.warn('Supabase invoice create error, fallback local :', err);
      }
    }
    // Fallback localStorage
    const newInvoice = {
      ...invoiceData,
      id: 'inv-' + Date.now().toString(36),
      invoiceNumber,
      totalMAD: (Number(invoiceData.sessionsCount) || 1) * (Number(invoiceData.unitPriceMAD) || 200),
      createdAt: new Date().toISOString(),
    };
    const updated = [newInvoice, ...list];
    try { localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(updated)); } catch {}
    return newInvoice;
  },

  delete: async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase invoice delete error, fallback local :', err);
      }
    }
    const list = await invoiceService.getAll();
    const updated = list.filter(i => i.id !== id);
    try { localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(updated)); } catch {}
    return updated;
  }
};
