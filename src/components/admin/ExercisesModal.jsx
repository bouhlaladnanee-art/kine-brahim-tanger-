import React, { useState } from 'react';
import { X, Activity, MessageCircle, Check, Sparkles } from 'lucide-react';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { PRACTITIONER_INFO } from '../../data/constants';

const PRESET_EXERCISES = [
  { id: 'sciatique', title: 'Étirement du nerf sciatique & fessier', desc: 'Allongé sur le dos, ramener doucement le genou vers l’épaule opposée (3 × 30 sec).' },
  { id: 'lombaire', title: 'Décompression lombaire (Genoux-poitrine)', desc: 'Sur le dos, ramener les deux genoux avec les mains pour relâcher le bas du dos (2 min au réveil).' },
  { id: 'cervical', title: 'Auto-grandissement cervical & menton rentré', desc: 'Assis droit, rentrer légèrement le menton sans pencher la tête pour soulager les disques (5 reps).' },
  { id: 'quadriceps', title: 'Renforcement doux du quadriceps', desc: 'Assis sur une chaise, tendre la jambe 5 secondes puis relâcher lentement (3 séries de 10).' },
  { id: 'respiration', title: 'Respiration diaphragmatique profonde', desc: 'Main sur le ventre, gonfler à l’inspiration lente par le nez, souffler doucement par la bouche (5 min).' },
  { id: 'cheville', title: 'Mobilisation cheville & retour veineux', desc: 'Mouvements lents de flexion/extension du pied pour stimuler la circulation sanguine (20 reps).' }
];

export default function ExercisesModal({ appointment, onClose }) {
  const [selectedIds, setSelectedIds] = useState(['lombaire', 'respiration']);
  const [customNote, setCustomNote] = useState('Pensez à bien vous hydrater après la séance et à marcher 10 minutes tranquillement.');

  const toggleExercise = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSendWhatsApp = () => {
    const phone = formatWhatsAppNumber(appointment.phone);
    const chosen = PRESET_EXERCISES.filter(e => selectedIds.includes(e.id));

    let msg = `Bonjour ${appointment.patientName},\n\n`;
    msg += `Suite à notre séance de kinésithérapie d'aujourd'hui, voici vos exercices recommandés pour consolider votre récupération à domicile :\n\n`;

    chosen.forEach((ex, idx) => {
      msg += `🔹 *Exercice ${idx + 1} : ${ex.title}*\n`;
      msg += `👉 ${ex.desc}\n\n`;
    });

    if (customNote) {
      msg += `💡 *Conseil du kiné :* ${customNote}\n\n`;
    }

    msg += `⚠️ *Règle d'or :* Aucun exercice ne doit provoquer de douleur vive. Allez-y en douceur.\n\n`;
    msg += `Je reste à votre disposition si besoin.\nBon rétablissement !\n*${PRACTITIONER_INFO.name}* (Tanger)`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-text-main">
                Exercices post-séance
              </h3>
              <p className="text-[11px] text-text-muted">
                Patient : {appointment.patientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-text-muted">
            Cochez les exercices à inclure dans le message WhatsApp envoyé au patient :
          </p>

          <div className="space-y-2">
            {PRESET_EXERCISES.map(ex => {
              const isChecked = selectedIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${isChecked ? 'bg-primary-50/50 border-primary shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? 'bg-primary text-white' : 'border border-slate-300'}`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-text-main">{ex.title}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">{ex.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-text-main">
              Conseil supplémentaire personnalisé
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
          <button
            onClick={handleSendWhatsApp}
            disabled={selectedIds.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] disabled:opacity-50 text-white py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Envoyer les exercices sur WhatsApp ({selectedIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
