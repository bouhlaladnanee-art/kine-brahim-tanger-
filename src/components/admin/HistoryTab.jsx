import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  Filter, 
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { PRACTITIONER_INFO } from '../../data/constants';

export default function HistoryTab({ 
  appointments, 
  onGenerateInvoice 
}) {
  const [filter, setFilter] = useState('tous'); // 'tous' | 'accompli' | 'annule'

  const filteredList = appointments.filter(a => {
    if (filter === 'accompli') return a.status === 'accompli';
    if (filter === 'annule') return a.status === 'annule';
    return true; // Tous
  });

  const completedCount = appointments.filter(a => a.status === 'accompli').length;
  const cancelledCount = appointments.filter(a => a.status === 'annule').length;
  const totalRevenueMAD = completedCount * PRACTITIONER_INFO.basePriceMAD;

  return (
    <div className="space-y-4 pb-20">
      {/* Synthèse comptable & performance */}
      <div className="bg-gradient-to-r from-primary to-primary-700 text-white p-4 sm:p-5 rounded-2xl shadow-soft space-y-3">
        <span className="text-xs text-primary-200 uppercase font-semibold tracking-wider">
          Comptabilité & Suivi d'activité
        </span>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black">{totalRevenueMAD} DH</span>
            </div>
            <p className="text-xs text-primary-100">
              Total séances accomplies ({completedCount} × {PRACTITIONER_INFO.basePriceMAD} DH)
            </p>
          </div>
          <div className="text-right">
            <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
              {completedCount} réussies
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-primary-200 block text-[10px]">Taux de succès</span>
            <strong className="font-bold text-emerald-300">
              {appointments.length > 0 ? Math.round((completedCount / (completedCount + cancelledCount || 1)) * 100) : 100}%
            </strong>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-primary-200 block text-[10px]">Annulations / Absents</span>
            <strong className="font-bold text-rose-300">{cancelledCount} séances</strong>
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setFilter('tous')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${filter === 'tous' ? 'bg-white text-text-main shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Tous ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('accompli')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${filter === 'accompli' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Accomplis ({completedCount})
        </button>
        <button
          onClick={() => setFilter('annule')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${filter === 'annule' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Annulés ({cancelledCount})
        </button>
      </div>

      {/* Liste des rendez-vous passés */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="font-bold text-text-main text-sm">Aucun rendez-vous dans cette catégorie</h4>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((apt) => {
            const isAccomplished = apt.status === 'accompli';

            return (
              <Card key={apt.id} className="space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-text-main">
                      {apt.patientName}
                    </h4>
                    <p className="text-xs font-semibold text-primary">
                      {apt.careTypeTitle}
                    </p>
                  </div>
                  <Badge status={apt.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{apt.neighborhoodName}</span>
                  </div>
                </div>

                {/* Bouton générer facture si accompli */}
                {isAccomplished && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700">
                      Montant : {PRACTITIONER_INFO.basePriceMAD} DH
                    </span>
                    <button
                      onClick={() => onGenerateInvoice(apt)}
                      className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-bold py-1.5 px-3 rounded-xl transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Émettre Facture PDF</span>
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
