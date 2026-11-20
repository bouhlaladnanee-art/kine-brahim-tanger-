import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileContainer from './components/layout/MobileContainer';
import PatientHome from './pages/PatientHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import BookingTracking from './pages/BookingTracking';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <MobileContainer>
            <Routes>
              <Route path="/" element={<PatientHome />} />
              <Route path="/suivi/:token" element={<BookingTracking />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MobileContainer>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
