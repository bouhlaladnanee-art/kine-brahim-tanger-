import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Phone, KeyRound, ArrowRight, Home, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { PRACTITIONER_INFO } from '../data/constants';

export default function AdminLogin() {
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('+212');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [error, setError] = useState('');
  const { login, sendPhoneCode, confirmPhoneCode, loading } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err?.message || 'Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await sendPhoneCode(phoneNumber, 'recaptcha-container');
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer le code SMS. Vérifiez le numéro.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await confirmPhoneCode(confirmationResult, otpCode);
      navigate('/admin');
    } catch {
      setError('Code SMS invalide ou expiré.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 bg-white min-h-screen">
      <div className="pt-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-soft ring-4 ring-primary-50/50">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-main">
              Espace Kinésithérapeute
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Tournée & Gestion des rendez-vous • {PRACTITIONER_INFO.name}
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'email' ? 'bg-white text-primary shadow-xs' : 'text-text-muted'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('phone'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'phone' ? 'bg-white text-primary shadow-xs' : 'text-text-muted'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Numéro de mobile (SMS)</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        {authMode === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              💡 Identifiants configurés. Cliquez sur <strong>Connexion</strong> pour accéder à l'espace praticien.
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
        ) : (
          <div className="space-y-4">
            <div id="recaptcha-container"></div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>Numéro de téléphone marocain</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-text-muted">
                  📱 Un code de vérification SMS à 6 chiffres sera envoyé à ce numéro.
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
                  Recevoir mon code par SMS
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    <span>Code SMS reçu à 6 chiffres</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center tracking-widest text-lg font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Code envoyé au {phoneNumber}. En mode test : tapez <strong>123456</strong>.</span>
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
                  Valider et accéder à la tournée
                </Button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs font-semibold text-text-muted hover:text-primary py-1"
                >
                  Modifier le numéro
                </button>
              </form>
            )}
          </div>
        )}
      </div>

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
