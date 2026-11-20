import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  LogOut, 
  ExternalLink, 
  RefreshCw,
  Home
} from 'lucide-react';
import AdminBottomNav from '../components/admin/AdminBottomNav';
import TourTodayTab from '../components/admin/TourTodayTab';
import RequestsTab from '../components/admin/RequestsTab';
import AvailabilityTab from '../components/admin/AvailabilityTab';
import InvoicesTab from '../components/admin/InvoicesTab';
import HistoryTab from '../components/admin/HistoryTab';
import InvoiceModal from '../components/admin/InvoiceModal';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { PRACTITIONER_INFO } from '../data/constants';

export default function AdminDashboard() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tournee'); // 'tournee' | 'demandes' | 'factures' | 'historique'
  const [appointments, setAppointments] = useState([]);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [loadError, setLoadError] = useState('');

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Abonnement en temps réel aux rendez-vous (Firestore onSnapshot / Local)
  useEffect(() => {
    const unsubscribe = appointmentService.subscribe(
      (list) => setAppointments(list),
      (error) => setLoadError(error ? (error.message || 'Erreur de connexion') : '')
    );
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    await appointmentService.updateStatus(id, newStatus);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleGenerateInvoiceFromApt = (apt) => {
    setInvoiceModalData({
      patientName: apt.patientName,
      phone: apt.phone,
      addressDetails: apt.addressDetails,
      neighborhoodName: apt.neighborhoodName,
      careTypeTitle: apt.careTypeTitle,
      sessionsCount: 1,
      unitPriceMAD: PRACTITIONER_INFO.basePriceMAD,
      date: apt.date,
      status: 'payee'
    });
  };

  const pendingCount = appointments.filter(a => a.status === 'en_attente').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Barre supérieure Admin Kiné */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-5 flex items-center justify-between no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-soft">
            BM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-extrabold text-text-main leading-none">
                Espace Kiné Tanger
              </h1>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {currentUser?.displayName || PRACTITIONER_INFO.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Lien vers le site patient */}
          <Link
            to="/"
            title="Voir le site patient"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Contenu principal de l'onglet actif */}
      <main className="flex-1 p-4 sm:p-5">
        {loadError && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm space-y-2">
            <p className="font-bold">Impossible de charger les demandes.</p>
            <p className="text-xs">Votre session a peut-être expiré ({loadError}).</p>
            <button
              onClick={handleLogout}
              className="text-xs font-bold underline"
            >
              Se reconnecter
            </button>
          </div>
        )}
        {activeTab === 'tournee' && (
          <TourTodayTab
            appointments={appointments}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'demandes' && (
          <RequestsTab
            appointments={appointments}
            onUpdateStatus={handleUpdateStatus}
            onOpenInvoice={handleGenerateInvoiceFromApt}
          />
        )}

        {activeTab === 'planning' && (
          <AvailabilityTab />
        )}

        {activeTab === 'factures' && (
          <InvoicesTab
            onOpenInvoiceForAppointment={handleGenerateInvoiceFromApt}
          />
        )}

        {activeTab === 'historique' && (
          <HistoryTab
            appointments={appointments}
            onGenerateInvoice={handleGenerateInvoiceFromApt}
          />
        )}
      </main>

      {/* MODAL FACTURE GÉNÉRÉE DEPUIS UN RDV */}
      {invoiceModalData && (
        <InvoiceModal
          initialData={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
          onSaved={() => setInvoiceModalData(null)}
        />
      )}

      {/* Barre de navigation inférieure fixe */}
      <AdminBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingCount}
      />
    </div>
  );
}
