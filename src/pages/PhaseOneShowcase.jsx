import React from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Shield, 
  Phone, 
  MessageCircle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Header from '../components/common/Header';
import { PRACTITIONER_INFO, TANGER_NEIGHBORHOODS, CARE_TYPES, APPOINTMENT_STATUS } from '../data/constants';

export default function PhaseOneShowcase() {
  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header />

      <main className="p-4 sm:p-5 space-y-6">
        {/* Bannière de validation Phase 1 */}
        <div className="bg-gradient-to-r from-primary to-primary-700 text-white p-5 rounded-3xl shadow-soft">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent-300" /> Phase 1 Prête
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Design System & PWA</h2>
              <p className="text-xs text-primary-100">
                Application Mobile-First pour Kinésithérapeute à Domicile à Tanger
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-primary-200 block">Tarif de base</span>
              <strong className="text-sm font-bold text-white">{PRACTITIONER_INFO.basePriceMAD} DH / séance</strong>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-primary-200 block">Zone d'intervention</span>
              <strong className="text-sm font-bold text-white">Tanger (10+ zones)</strong>
            </div>
          </div>
        </div>

        {/* Palette de Couleurs */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Palette Visuelle & Tokens
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-primary text-white p-3 rounded-2xl flex flex-col justify-between h-20 shadow-sm">
              <span className="text-[10px] opacity-80">Primaire</span>
              <div className="text-xs font-bold">#2E6F65<br/><span className="font-normal text-[10px]">Vert Sauge</span></div>
            </div>
            <div className="bg-accent text-white p-3 rounded-2xl flex flex-col justify-between h-20 shadow-sm">
              <span className="text-[10px] opacity-80">Accent (CTA)</span>
              <div className="text-xs font-bold">#E07A5F<br/><span className="font-normal text-[10px]">Corail Doux</span></div>
            </div>
            <div className="bg-text-main text-white p-3 rounded-2xl flex flex-col justify-between h-20 shadow-sm">
              <span className="text-[10px] opacity-80">Texte</span>
              <div className="text-xs font-bold">#1E293B<br/><span className="font-normal text-[10px]">Anthracite</span></div>
            </div>
          </div>
        </section>

        {/* Boutons Tactiles */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Composants Boutons Tactiles (Mobile First)
          </h3>
          <div className="space-y-2">
            <Button variant="accent" size="lg" fullWidth icon={ChevronRight} iconPosition="right">
              Prendre rendez-vous à domicile
            </Button>
            <Button variant="primary" size="md" fullWidth icon={MessageCircle}>
              Confirmer sur WhatsApp
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" icon={MapPin}>
                GPS Tanger
              </Button>
              <Button variant="soft" size="sm" icon={Calendar}>
                Agenda .ics
              </Button>
            </div>
          </div>
        </section>

        {/* Statuts des Rendez-vous */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Badges de Statuts Firestore
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge status="en_attente">En attente (Nouvelle demande)</Badge>
            <Badge status="confirme">Confirmé (Tournée)</Badge>
            <Badge status="accompli">Accompli</Badge>
            <Badge status="annule">Annulé</Badge>
          </div>
        </section>

        {/* Échantillon Soins & Quartiers */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Exemple de Carte de Soin Interactive
          </h3>
          <Card interactive selected className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary bg-primary-100/50 px-2.5 py-0.5 rounded-full">
                {CARE_TYPES[0].badge}
              </span>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-text-main text-base">{CARE_TYPES[0].title}</h4>
            <p className="text-xs text-text-muted">{CARE_TYPES[0].description}</p>
          </Card>
        </section>

        {/* Aperçu des quartiers */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Couverture Tanger & Périmètre
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {TANGER_NEIGHBORHOODS.slice(0, 6).map((q) => (
              <span key={q.id} className="text-xs bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl">
                📍 {q.name.split('/')[0].trim()}
              </span>
            ))}
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl">
              + {TANGER_NEIGHBORHOODS.length - 6} autres
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
