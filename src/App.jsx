import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileContainer from './components/layout/MobileContainer';
import PatientHome from './pages/PatientHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MobileContainer>
          <Routes>
            {/* Espace Patient */}
            <Route path="/" element={<PatientHome />} />

            {/* Espace Kiné Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Redirection fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileContainer>
      </BrowserRouter>
    </AuthProvider>
  );
}
