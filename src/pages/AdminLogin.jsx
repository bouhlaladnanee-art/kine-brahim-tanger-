import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Home } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { PRACTITIONER_INFO } from '../data/constants';

export default function AdminLogin() {
  const [email, setEmail] = useState('kine@tanger.ma');
  const [password, setPassword] = useState('kine123');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 bg-white min-h-screen">
      <div className="pt-6 space-y-6">
        {/* Logo & Titre */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-soft ring-4 ring-primary-50/50">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-main">
              Espace Kinésithérapeute
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Tournée & Gestion des rendez-vous • Tanger
            </p>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Adresse Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>Mot de passe</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="bg-primary-50/60 p-3 rounded-xl border border-primary-100 text-[11px] text-text-muted">
            💡 Identifiants pré-remplis pour la démonstration. Cliquez simplement sur <strong>Connexion</strong>.
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="shadow-soft"
          >
            Connexion à ma tournée
          </Button>
        </form>
      </div>

      {/* Retour site patient */}
      <div className="pt-6 pb-2 text-center border-t border-slate-100">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Retour à l'espace patient</span>
        </Link>
      </div>
    </div>
  );
}
