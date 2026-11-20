import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Printer, 
  MessageCircle, 
  Check, 
  Clock, 
  Search, 
  FileText, 
  Trash2, 
  Eye,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import InvoiceModal from './InvoiceModal';
import { invoiceService } from '../../services/invoiceService';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { PRACTITIONER_INFO } from '../../data/constants';

export default function InvoicesTab({ onOpenInvoiceForAppointment }) {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalData, setActiveModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadInvoices = () => {
    setInvoices(invoiceService.getAll());
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const totalBilledMAD = invoices.reduce((sum, inv) => sum + (Number(inv.totalMAD) || 0), 0);
  const totalPaidMAD = invoices
    .filter(i => i.status === 'payee')
    .reduce((sum, inv) => sum + (Number(inv.totalMAD) || 0), 0);

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    return (
      inv.patientName?.toLowerCase().includes(q) ||
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.careTypeTitle?.toLowerCase().includes(q)
    );
  });

  const handleCreateNew = () => {
    setActiveModalData({
      patientName: '',
      patientPhone: '',
      patientAddress: 'Tanger, Maroc',
      careTypeTitle: 'Séance de kinésithérapie à domicile',
      sessionsCount: 1,
      unitPriceMAD: PRACTITIONER_INFO.basePriceMAD || 200,
      date: new Date().toISOString().split('T')[0],
      status: 'payee'
    });
    setIsModalOpen(true);
  };

  const handleOpenExisting = (inv) => {
    setActiveModalData(inv);
    setIsModalOpen(true);
  };

  const handleDelete = (id, number) => {
    if (window.confirm(`Supprimer la facture ${number} ?`)) {
      invoiceService.delete(id);
      loadInvoices();
    }
  };

  const handleSendWhatsAppDirect = (inv) => {
    const phone = formatWhatsAppNumber(inv.patientPhone);
    let msg = `Bonjour ${inv.patientName},\n\n`;
    msg += `Voici votre facture de soins de kinésithérapie à domicile à Tanger :\n\n`;
    msg += `📄 *Facture N° :* ${inv.invoiceNumber}\n`;
    msg += `🩺 *Prestation :* ${inv.careTypeTitle}\n`;
    msg += `📅 *Date :* ${inv.date}\n`;
    msg += `💰 *Montant :* ${inv.totalMAD} DH (${inv.status === 'payee' ? 'Acquitté' : 'À régler'})\n\n`;
    msg += `Attestation à présenter à votre mutuelle ou CNSS pour remboursement.\n\n`;
    msg += `Bien cordialement,\n*${PRACTITIONER_INFO.name}* (Tanger)`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary text-white p-4 sm:p-5 rounded-2xl shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-primary-200 uppercase font-semibold tracking-wider">
              Notes d'honoraires & Facturation
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black">{totalPaidMAD} DH</span>
              <span className="text-xs text-primary-200">encaissés</span>
            </div>
          </div>

          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-600 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-primary-200 block text-[10px]">Total émis</span>
            <strong className="font-bold text-white">{totalBilledMAD} DH ({invoices.length} factures)</strong>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-primary-200 block text-[10px]">Taux d'encaissement</span>
            <strong className="font-bold text-emerald-300">
              {invoices.length > 0 ? Math.round((totalPaidMAD / totalBilledMAD) * 100) : 100}%
            </strong>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Rechercher par patient, n° facture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-text-main text-sm">
              Aucune facture trouvée
            </h3>
            <p className="text-xs text-text-muted">
              Créez une facture en cliquant sur le bouton « Nouvelle Facture ».
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <Card key={inv.id} className="space-y-3 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-primary bg-primary-50 px-2 py-0.5 rounded">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-xs text-text-muted">• {inv.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-text-main mt-1">
                    {inv.patientName}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {inv.careTypeTitle} ({inv.sessionsCount} séance{inv.sessionsCount > 1 ? 's' : ''})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-text-main block">
                    {inv.totalMAD} DH
                  </span>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'payee' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {inv.status === 'payee' ? 'Acquittée' : 'En attente'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleSendWhatsAppDirect(inv)}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleOpenExisting(inv)}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Voir / Imprimer PDF</span>
                </button>

                <button
                  onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <InvoiceModal
          initialData={activeModalData}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            loadInvoices();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
