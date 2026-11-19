import React from 'react';
import { X, FileText, Download } from 'lucide-react';

export default function PrescriptionModal({ imageUrl, fileName, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-text-main truncate max-w-[200px]">
              {fileName || "Ordonnance médicale"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/10">
          <img
            src={imageUrl}
            alt="Ordonnance du patient"
            className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
          />
        </div>

        <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
          <a
            href={imageUrl}
            download={fileName || "ordonnance-patient.jpg"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-50 px-4 py-2.5 rounded-xl hover:bg-primary-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'ordonnance</span>
          </a>
        </div>
      </div>
    </div>
  );
}
