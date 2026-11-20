import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  MessageCircle, 
  Check, 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  Receipt,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Button from '../common/Button';
import { PRACTITIONER_INFO } from '../../data/constants';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { invoiceService } from '../../services/invoiceService';

export default function InvoiceModal({ 
  initialData = null, 
  onClose, 
  onSaved 
}) {
  const [formData, setFormData] = useState({
    patientName: initialData?.patientName || '',
    patientPhone: initialData?.phone || initialData?.patientPhone || '',
    patientAddress: initialData?.addressDetails 
      ? `${initialData.addressDetails}, ${initialData.neighborhoodName || ''}`.trim()
      : initialData?.patientAddress || 'Tanger, Maroc',
    careTypeTitle: initialData?.careTypeTitle || 'Séance de kinésithérapie à domicile',
    sessionsCount: initialData?.sessionsCount || 1,
    unitPriceMAD: initialData?.unitPriceMAD || PRACTITIONER_INFO.basePriceMAD || 200,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    invoiceNumber: initialData?.invoiceNumber || `FACT-2026-${Math.floor(100 + Math.random() * 900)}`,
    status: initialData?.status || 'payee',
    paymentMethod: initialData?.paymentMethod || 'Espèces sur place',
    notes: initialData?.notes || 'Séance de rééducation fonctionnelle et motrice à domicile.',
  });

  const [activeView, setActiveView] = useState('preview'); // 'preview' | 'edit'

  const totalMAD = Number(formData.sessionsCount) * Number(formData.unitPriceMAD);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const saved = invoiceService.create({
      ...formData,
      totalMAD
    });
    if (onSaved) onSaved(saved);
    alert("Facture enregistrée dans votre historique !");
  };

  const handleSendWhatsApp = () => {
    const phone = formatWhatsAppNumber(formData.patientPhone);
    let msg = `Bonjour ${formData.patientName},\n\n`;
    msg += `Voici votre facture / note d'honoraires pour vos soins de kinésithérapie à domicile à Tanger :\n\n`;
    msg += `📄 *Facture N° :* ${formData.invoiceNumber}\n`;
    msg += `🩺 *Prestation :* ${formData.careTypeTitle}\n`;
    msg += `📅 *Date :* ${formData.date}\n`;
    msg += `🔢 *Nombre de séances :* ${formData.sessionsCount}\n`;
    msg += `💰 *Montant Total :* ${totalMAD} DH (${formData.status === 'payee' ? 'Acquitté' : 'À régler'})\n\n`;
    msg += `Vous pouvez présenter cette attestation à votre mutuelle ou à la CNSS pour votre remboursement.\n\n`;
    msg += `Je reste à votre entière disposition.\nBien cordialement,\n*${PRACTITIONER_INFO.name}*\n${PRACTITIONER_INFO.title} • Tanger`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <div>
              <span className="font-extrabold text-sm text-text-main block">
                Facture / Note d'honoraires
              </span>
              <span className="text-[10px] text-text-muted">
                {formData.invoiceNumber} • {totalMAD} DH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveView(activeView === 'preview' ? 'edit' : 'preview')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {activeView === 'preview' ? 'Modifier' : 'Aperçu'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeView === 'edit' ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du patient</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold text-text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Téléphone (WhatsApp)</label>
                  <input
                    type="text"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse à Tanger</label>
                <input
                  type="text"
                  value={formData.patientAddress}
                  onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé de l'acte de kiné</label>
                <input
                  type="text"
                  value={formData.careTypeTitle}
                  onChange={(e) => setFormData({ ...formData, careTypeTitle: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de séances</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sessionsCount}
                    onChange={(e) => setFormData({ ...formData, sessionsCount: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prix unitaire (DH)</label>
                  <input
                    type="number"
                    min="50"
                    value={formData.unitPriceMAD}
                    onChange={(e) => setFormData({ ...formData, unitPriceMAD: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut du paiement</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="payee">Acquittée (Payée)</option>
                    <option value="en_attente">En attente de règlement</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mode de règlement</label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setActiveView('preview')}
              >
                Voir la facture mise en page
              </Button>
            </div>
          ) : (
            <div id="printable-invoice" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-text-main text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold text-primary">
                    {PRACTITIONER_INFO.name}
                  </h3>
                  <p className="font-semibold text-slate-700 text-[11px]">
                    {PRACTITIONER_INFO.title}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Soins exclusivement à domicile • Tanger, Maroc
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tél : {PRACTITIONER_INFO.phoneDisplay}
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="inline-block bg-primary-50 text-primary font-black px-2.5 py-1 rounded text-xs border border-primary-100">
                    NOTE D'HONORAIRES
                  </span>
                  <p className="font-bold text-slate-800 text-[11px] mt-1">
                    N° {formData.invoiceNumber}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Date : {formData.date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">
                    Praticien Diplômé
                  </span>
                  <strong className="text-slate-800 block">{PRACTITIONER_INFO.name}</strong>
                  <span className="text-slate-500 text-[10px]">INPE : 102938475 • Patente : 50493821</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">
                    Patient (Bénéficiaire)
                  </span>
                  <strong className="text-slate-800 block">{formData.patientName}</strong>
                  <span className="text-slate-600 text-[10px] block">{formData.patientPhone}</span>
                  <span className="text-slate-500 text-[10px] truncate block">{formData.patientAddress}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Description de l'acte</th>
                      <th className="p-2 text-center">Séance(s)</th>
                      <th className="p-2 text-right">Tarif unitaire</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium text-slate-800">
                        {formData.careTypeTitle}
                        <span className="block text-[10px] text-slate-400">À domicile • Tanger</span>
                      </td>
                      <td className="p-2 text-center font-bold text-slate-700">
                        {formData.sessionsCount}
                      </td>
                      <td className="p-2 text-right text-slate-600">
                        {formData.unitPriceMAD} DH
                      </td>
                      <td className="p-2 text-right font-bold text-primary">
                        {totalMAD} DH
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end pt-1">
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${formData.status === 'payee' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                    {formData.status === 'payee' ? `Acquitté par ${formData.paymentMethod}` : 'En attente de paiement'}
                  </span>
                  <p className="text-[9px] text-slate-400 max-w-[200px]">
                    Document valant attestation de soins pour remboursement auprès de la CNSS ou Mutuelle.
                  </p>
                </div>

                <div className="bg-primary-50 p-2.5 rounded-xl border border-primary-100 text-right">
                  <span className="text-[10px] text-primary uppercase font-bold block">
                    Total Net à Payer
                  </span>
                  <span className="text-xl font-black text-primary">
                    {totalMAD} DH
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                <div>
                  <span>Fait à Tanger, le {formData.date}</span>
                </div>
                <div className="text-right">
                  <div className="border border-dashed border-primary-300 bg-primary-50/40 p-2 rounded-lg text-center font-bold text-primary text-[9px]">
                    Cachet & Signature<br/>BOUHLAL Ibrahim — Kiné
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2 no-print">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white py-3 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Envoyer sur WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-white py-3 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleSave}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sauvegarder dans l'historique</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
