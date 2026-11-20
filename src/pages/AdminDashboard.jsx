import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
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
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('jour');
  const [moreTab, setMoreTab] = useState('historique');
  const [appointments, setAppointments] = useState([]);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const unsubscribe = appointmentService.subscribe(
      (list) => setAppointments(list),
      (error) => setLoadError(error ? (error.message || 'Erreur de connexion') : '')
    );
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = (id, newStatus) => appointmentService.updateStatus(id, newStatus);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleOpenInvoice = (apt) => {
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
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
            BI
          </div>
          <div>
            <p className="text-base font-bold text-text-main leading-tight">Espace Kiné</p>
            <p className="text-xs text-text-muted">{PRACTITIONER_INFO.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            aria-label="Voir le site patient"
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <Home className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Déconnexion"
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 space-y-6">
        {loadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-sm space-y-1">
            <p className="font-bold">Impossible de charger les demandes.</p>
            <p>Votre session a peut-être expiré ({loadError}).</p>
            <button onClick={handleLogout} className="font-bold underline">Se reconnecter</button>
          </div>
        )}

        {activeTab === 'jour' && (
          <>
            <RequestsTab appointments={appointments} onUpdateStatus={handleUpdateStatus} />
            <TourTodayTab
              appointments={appointments}
              onUpdateStatus={handleUpdateStatus}
              onOpenInvoice={handleOpenInvoice}
            />
          </>
        )}

        {activeTab === 'planning' && <AvailabilityTab />}

        {activeTab === 'plus' && (
          <>
            <div className="bg-slate-200/70 p-1 rounded-xl grid grid-cols-2 gap-1">
              {[['historique', 'Historique'], ['factures', 'Factures']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMoreTab(id)}
                  className={`py-2.5 rounded-lg text-sm font-bold ${moreTab === id ? 'bg-white text-primary shadow-sm' : 'text-slate-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {moreTab === 'historique' && (
              <HistoryTab appointments={appointments} onGenerateInvoice={handleOpenInvoice} />
            )}
            {moreTab === 'factures' && (
              <InvoicesTab onOpenInvoiceForAppointment={handleOpenInvoice} />
            )}
          </>
        )}
      </main>

      {invoiceModalData && (
        <InvoiceModal
          initialData={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
          onSaved={() => setInvoiceModalData(null)}
        />
      )}

      <AdminBottomNav activeTab={activeTab} onSelectTab={setActiveTab} pendingCount={pendingCount} />
    </div>
  );
}
