// Service de gestion et persistance des factures / notes d'honoraires

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
    status: 'payee', // 'payee' | 'en_attente'
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

export const invoiceService = {
  getAll: () => {
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

  create: (invoiceData) => {
    const list = invoiceService.getAll();
    const count = list.length + 1;
    const invoiceNumber = `FACT-2026-${String(count).padStart(3, '0')}`;

    const newInvoice = {
      ...invoiceData,
      id: 'inv-' + Date.now().toString(36),
      invoiceNumber: invoiceData.invoiceNumber || invoiceNumber,
      totalMAD: (Number(invoiceData.sessionsCount) || 1) * (Number(invoiceData.unitPriceMAD) || 200),
      createdAt: new Date().toISOString(),
    };

    const updated = [newInvoice, ...list];
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return newInvoice;
  },

  delete: (id) => {
    const list = invoiceService.getAll();
    const updated = list.filter(i => i.id !== id);
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  }
};
