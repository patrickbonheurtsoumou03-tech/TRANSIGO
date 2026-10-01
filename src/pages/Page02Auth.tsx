import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { TransigoLogo } from '../components/TransigoLogo';
import { userService, UserRole } from '../services/userService';
import {
  firebaseLoginWithEmail,
  firebaseRegisterWithEmail,
  firebaseResetPassword,
  googleSignIn,
} from '../services/firebase';

interface Page02Props {
  onNavigate: (page: PageId) => void;
  onOpenOnboarding?: () => void;
}

export const Page02Auth: React.FC<Page02Props> = ({ onNavigate, onOpenOnboarding }) => {
  const [authState, setAuthState] = useState<'login' | 'register' | 'otp' | 'reset'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('mabiala.serge@transigo.cg');
  const [phone, setPhone] = useState('06 912 34 56');
  const [password, setPassword] = useState('SecuredPass2026');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regProfile, setRegProfile] = useState('passenger');
  const [regPassword, setRegPassword] = useState('');

  // OTP state (6 cells)
  const [otp, setOtp] = useState(['4', '8', '1', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(272);

  // Reset state
  const [resetId, setResetId] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authState === 'otp' && timerSeconds > 0) {
      const interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [authState, timerSeconds]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (loginMethod === 'email') {
      setIsLoading(true);
      try {
        await firebaseLoginWithEmail(email, password);
        showToast('Connexion Firebase réussie ! Bienvenue sur TRANSIGO.');
        setTimeout(() => onNavigate('passager'), 600);
      } catch (err: any) {
        let msg = 'Identifiants invalides ou compte introuvable.';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          msg = 'Adresse e-mail ou mot de passe incorrect.';
        } else if (err.code === 'auth/user-not-found') {
          msg = 'Aucun compte trouvé avec cet e-mail. Veuillez vous inscrire.';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = "L'authentification Email/Mot de passe doit être activée dans la console Firebase (Authentication > Sign-in method).";
        } else if (err.message) {
          msg = err.message;
        }
        setAuthError(msg);
        showToast(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast('Code de sécurité SMS envoyé. Validation requise.');
      setAuthState('otp');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      await firebaseRegisterWithEmail(
        regEmail,
        regPassword,
        `${regFirstName} ${regLastName}`.trim(),
        regProfile
      );
      showToast('Compte créé dans Firebase Authentication ! Bienvenue sur TRANSIGO.');
      setTimeout(() => onNavigate('passager'), 600);
    } catch (err: any) {
      let msg = "Erreur lors de la création du compte.";
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Cette adresse e-mail est déjà utilisée par un autre compte.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = "L'authentification Email/Mot de passe doit être activée dans la console Firebase (Authentication > Sign-in method).";
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = () => {
    showToast('Authentification réussie ! Connexion à votre espace passager...');
    setTimeout(() => {
      onNavigate('passager');
    }, 1000);
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        showToast(`Connexion Google Firebase réussie (${res.user.displayName || res.user.email}) !`);
        setTimeout(() => onNavigate('passager'), 600);
      }
    } catch (err: any) {
      let msg = 'Erreur lors de la connexion avec Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Fenêtre de connexion Google fermée par l’utilisateur.';
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!resetId.includes('@')) {
      const msg = 'Veuillez saisir une adresse e-mail valide pour la réinitialisation.';
      setAuthError(msg);
      showToast(msg);
      return;
    }
    setIsLoading(true);
    try {
      await firebaseResetPassword(resetId);
      showToast('E-mail de réinitialisation envoyé par Firebase ! Consultez votre messagerie.');
      setAuthState('login');
    } catch (err: any) {
      const msg = err.message || 'Erreur lors de la réinitialisation.';
      setAuthError(msg);
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 max-w-[1440px] mx-auto py-8 lg:py-12">
      {/* Top System Live Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f2f3ff] px-4 py-2.5 rounded-2xl shadow-sm mb-8">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#006948] animate-ping" />
          <span className="font-mono text-[#006948] font-bold uppercase tracking-wider">
            Passerelle Télécom Brazzaville
          </span>
          <span className="text-[#3d4a42] hidden sm:inline">
            • Lignes STPU, Taxis 100/100 & Express Bacongo synchronisés
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#00855d] text-white rounded font-mono text-[10px] font-bold">
            DEMO DATA ONLY
          </span>
          <span className="font-mono text-xs text-[#6d7a72] hidden md:inline">Latence SMS &lt; 1.4s</span>
        </div>
      </div>

      {/* Main Split-Screen Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: Immersive Congolese Visual & Telemetry Snapshot */}
        <div className="lg:col-span-5 flex flex-col justify-between relative rounded-3xl overflow-hidden shadow-2xl min-h-[580px] lg:min-h-[780px] bg-[#283044] text-white p-6 lg:p-8">
          {/* Background Urban Bus Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCs9BgA36uQ5gOcVuxvlEf_Ta6WGpk9sWOe9-AEitZ73rJrQhZHmSGh1HmAE8kbMhqLNU1JKlesTi-OegTzJfePZQhkVKgu2TLwzx0EwrVpux4UwNAzeO49Y6NQQLnV8PgwB_V4U0Th4ui8BIdY2KEj9hpwlOwYgg2KcA0B77l9r2Fy_RAcrHdA8tlZhb6p37txCs_JKBLCa0hQ-XVMl0xlJqFcVTE8zmnLllUJrJcs5lcdHjrLO0-Z')`,
            }}
          />
          {/* Deep Emerald & Slate Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e] via-[#131b2e]/85 to-[#00855d]/40" />

          {/* Top Layer Content */}
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-sm flex items-center justify-center">
                  <TransigoLogo size="custom" className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-white leading-none">
                    TRANSIGO
                  </span>
                  <span className="text-[10px] text-[#85f8c4] font-medium">Brazza Transport Hub</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#006948]/90 backdrop-blur-sm text-white text-[10px] font-bold">
                v2.4 Active
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs uppercase tracking-widest text-[#85f8c4] font-bold">
                Portail Unifié Citoyen & Pro
              </span>
              <h1 className="text-3xl lg:text-4xl font-black text-white mt-1 leading-tight">
                Votre mobilité commence ici.
              </h1>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                Accédez au premier réseau intelligent de transport urbain connecté de Brazzaville. Suivi GPS en direct, alertes d'approche sur le boulevard Denis Sassou Nguesso et titres dématérialisés.
              </p>
            </div>
          </div>

          {/* Middle Live Telemetry Snapshot Card */}
          <div className="relative z-10 my-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex flex-col gap-3 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">satellite_alt</span>
                  Réseau en direct
                </span>
                <span className="px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] text-[10px] font-mono font-bold">
                  14 LIGNES ACTIVES
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex flex-col bg-[#131b2e]/60 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-300">Poto-Poto → Bacongo</span>
                  <span className="text-xs font-bold text-[#85f8c4]">Ligne 10 (Bus 102)</span>
                  <span className="text-[10px] text-slate-300">Passage ds 3 min</span>
                </div>
                <div className="flex flex-col bg-[#131b2e]/60 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-300">Total Makélékélé</span>
                  <span className="text-xs font-bold text-[#dbe1ff]">Express 04</span>
                  <span className="text-[10px] text-slate-300">Trafic Fluide (98%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-300 text-xs pt-1">
                <span>Gare Centrale → CHU</span>
                <span className="text-[#85f8c4] font-bold text-[11px]">GPS BRAZZA OK</span>
              </div>
            </div>
          </div>

          {/* Bottom Civic Trust Indicator */}
          <div className="relative z-10 p-4 bg-[#131b2e]/80 backdrop-blur-md rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#85f8c4] text-[24px] shrink-0 mt-0.5">
                verified
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Homologué & Sécurisé</span>
                <span className="text-[11px] text-slate-300 leading-normal">
                  Conforme aux directives d'interopérabilité de la Communauté Urbaine de Brazzaville et de la Délégation Générale aux Grands Travaux.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Multi-State Authentication Hub */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-white rounded-3xl shadow-xl border border-[#eaedff] p-6 sm:p-8 flex flex-col">
            {/* Unified Master Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#f2f3ff] p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setAuthState('login')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  authState === 'login'
                    ? 'bg-[#006948] text-white shadow-md'
                    : 'text-[#3d4a42] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Connexion</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthState('register')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  authState === 'register'
                    ? 'bg-[#006948] text-white shadow-md'
                    : 'text-[#3d4a42] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Inscription</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthState('otp')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  authState === 'otp'
                    ? 'bg-[#006948] text-white shadow-md'
                    : 'text-[#3d4a42] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">sms</span>
                <span>Code OTP</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthState('reset')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  authState === 'reset'
                    ? 'bg-[#006948] text-white shadow-md'
                    : 'text-[#3d4a42] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-rose-600 text-base shrink-0 mt-0.5">error</span>
                <div className="flex-1 leading-relaxed">
                  <div>{authError}</div>
                  {authError.includes('console Firebase') && (
                    <div className="mt-1 text-[11px] text-rose-700 font-normal">
                      Conseil : Pour autoriser les inscriptions e-mail / mot de passe, activez le fournisseur dans votre console Firebase sous <strong>Authentication &gt; Sign-in method</strong>.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STATE 1: CONNEXION (LOGIN) */}
            {authState === 'login' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                {/* Official Logo Banner Above Form (Instruction 7) */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#eaedff]">
                  <div className="h-16 w-16 rounded-2xl bg-white p-1 border border-stone-200 shadow-sm flex items-center justify-center shrink-0">
                    <TransigoLogo size="custom" className="h-full w-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xl text-[#006948] tracking-tight">TRANSIGO</span>
                    <span className="text-xs text-[#3d4a42] font-semibold">Votre itinéraire, notre priorité</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Plateforme Officielle de Mobilité • Brazzaville</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="px-2.5 py-0.5 rounded bg-[#f2f3ff] text-[#006948] font-mono text-[10px] font-bold uppercase w-fit">
                    Accès Voyageur & Transporteur
                  </span>
                  <h2 className="text-2xl font-black text-[#131b2e] tracking-tight">
                    Bienvenue sur TRANSIGO
                  </h2>
                  <p className="text-xs text-[#3d4a42]">
                    Connectez-vous à votre espace passager, chauffeur ou gestionnaire de ligne.
                  </p>
                </div>

                {/* Email vs Phone Toggle */}
                <div className="flex items-center gap-1 bg-[#eaedff] p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      loginMethod === 'email' ? 'bg-white text-[#006948] shadow-sm' : 'text-[#3d4a42]'
                    }`}
                  >
                    Par E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      loginMethod === 'phone' ? 'bg-white text-[#006948] shadow-sm' : 'text-[#3d4a42]'
                    }`}
                  >
                    Par Numéro de Téléphone
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 mt-1">
                  {loginMethod === 'email' ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#131b2e] flex justify-between">
                        <span>Adresse e-mail</span>
                        <span className="text-[#6d7a72] font-normal">Requis</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[#6d7a72] text-[20px]">
                          alternate_email
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="mabiala.serge@transigo.cg"
                          className="w-full h-12 pl-11 pr-4 bg-[#f2f3ff] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#131b2e] flex justify-between">
                        <span>Numéro Mobile Congo</span>
                        <span className="text-[#006948] font-bold font-mono">Airtel / MTN</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="h-12 px-3 bg-[#eaedff] rounded-xl flex items-center gap-1.5 text-xs font-bold text-[#131b2e] shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#006948]" />
                          <span>+242</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="06 912 34 56"
                          className="w-full h-12 px-4 bg-[#f2f3ff] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password with Reveal */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#131b2e]">Mot de passe</label>
                      <button
                        type="button"
                        onClick={() => setAuthState('reset')}
                        className="text-xs text-[#006948] font-bold hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#6d7a72] text-[20px]">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-12 pl-11 pr-11 bg-[#f2f3ff] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[#6d7a72] hover:text-[#131b2e]"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#006948] accent-[#006948]"
                      />
                      <span className="text-xs text-[#3d4a42]">Maintenir ma session active 30 jours</span>
                    </label>
                    <span className="text-[10px] text-[#6d7a72] font-mono">Brazzaville GMT+1</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#006948] hover:bg-[#00855d] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#006948]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        <span>Connexion Firebase en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter à TRANSIGO</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center my-1">
                    <div className="flex-grow h-px bg-[#eaedff]" />
                    <span className="px-3 text-[10px] font-bold text-[#6d7a72] uppercase">OU</span>
                    <div className="flex-grow h-px bg-[#eaedff]" />
                  </div>

                  {/* Alternative Auth Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isLoading}
                      className="h-11 px-4 bg-[#f2f3ff] hover:bg-[#eaedff] disabled:opacity-60 text-[#131b2e] rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Continuer avec Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthState('otp')}
                      className="h-11 px-4 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#006948] text-[18px]">
                        phonelink_ring
                      </span>
                      <span>Connexion SMS Direct</span>
                    </button>
                  </div>

                  <p className="text-center text-xs text-[#3d4a42] mt-2">
                    Pas encore d'identifiant de mobilité ?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthState('register')}
                      className="text-[#006948] font-bold hover:underline"
                    >
                      Créer un compte
                    </button>
                  </p>
                </form>
              </div>
            )}

            {/* STATE 2: INSCRIPTION (REGISTER) */}
            {authState === 'register' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1">
                  <span className="px-2.5 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-mono text-[10px] font-bold uppercase w-fit">
                    Nouveau Passager & Chauffeur
                  </span>
                  <h2 className="text-2xl font-black text-[#131b2e] tracking-tight">
                    Rejoignez le réseau TRANSIGO
                  </h2>
                  <p className="text-xs text-[#3d4a42]">
                    Créez votre profil en 1 minute pour enregistrer vos lignes et recharger vos titres de transport.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#131b2e]">Prénom</label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="ex: Aurélien"
                        className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#131b2e]">Nom</label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="ex: Loubaki"
                        className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#131b2e]">E-mail</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nom@exemple.cg"
                        className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#131b2e]">Téléphone (+242)</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="06 600 00 00"
                        className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#131b2e]">
                      Type de profil dans l'écosystème
                    </label>
                    <select
                      value={regProfile}
                      onChange={(e) => setRegProfile(e.target.value)}
                      className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006948] cursor-pointer"
                    >
                      <option value="passenger">Passager quotidien (Bus STPU, Taxis-bus, Express)</option>
                      <option value="driver">Chauffeur Partenaire / Conducteur agréé</option>
                      <option value="operator">Transporteur privé / Gestionnaire de flotte</option>
                      <option value="municipal">Agent de régulation municipale Brazzaville</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#131b2e]">Mot de passe sécurisé</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="8+ caractères"
                      className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="cgu"
                      required
                      className="w-4 h-4 mt-0.5 rounded text-[#006948] accent-[#006948]"
                    />
                    <label htmlFor="cgu" className="text-xs text-[#3d4a42] cursor-pointer leading-normal">
                      J'accepte les Conditions Générales d'Utilisation de TRANSIGO et consens au traitement de ma localisation lors des trajets à Brazzaville.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#006948] hover:bg-[#00855d] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all mt-2 active:scale-95 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        <span>Création du compte Firebase...</span>
                      </>
                    ) : (
                      <>
                        <span>Créer mon compte TRANSIGO</span>
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#3d4a42]">
                    Déjà enregistré ?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthState('login')}
                      className="text-[#006948] font-bold hover:underline"
                    >
                      Se connecter
                    </button>
                  </p>
                </form>
              </div>
            )}

            {/* STATE 3: VALIDATION CODE OTP */}
            {authState === 'otp' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-mono text-[10px] font-bold uppercase w-fit">
                    Sécurité renforcée par SMS Congo
                  </span>
                  <h2 className="text-2xl font-black text-[#131b2e] tracking-tight">
                    Vérification de votre numéro
                  </h2>
                  <p className="text-xs text-[#3d4a42]">
                    Nous avons envoyé un code de validation à 6 chiffres par SMS au{' '}
                    <strong className="text-[#131b2e]">+242 06 912 •• 42</strong>
                  </p>
                </div>

                <div className="bg-[#f2f3ff] p-6 rounded-2xl flex flex-col items-center gap-4">
                  <span className="text-[10px] uppercase font-bold text-[#6d7a72] tracking-wider">
                    Saisissez le code de contrôle
                  </span>
                  {/* 6 Digit Cells */}
                  <div className="flex items-center gap-2 sm:gap-3 justify-center">
                    {otp.map((digit, idx) => (
                      <React.Fragment key={idx}>
                        {idx === 3 && <span className="text-lg font-bold text-[#6d7a72]">-</span>}
                        <input
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black bg-white text-[#006948] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                        />
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex items-center justify-between w-full pt-1 text-xs text-[#3d4a42]">
                    <span className="flex items-center gap-1 font-mono text-[#6d7a72]">
                      <span className="material-symbols-outlined text-[16px]">timer</span>
                      Code valide : {formatTimer(timerSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTimerSeconds(300);
                        showToast('Nouveau SMS de validation renvoyé.');
                      }}
                      className="text-[#006948] font-bold hover:underline"
                    >
                      Renvoyer le code
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleValidateOtp}
                  className="w-full h-12 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#006948]/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Valider et accéder à TRANSIGO</span>
                </button>

                <div className="flex items-center justify-between text-xs text-[#3d4a42]">
                  <button
                    type="button"
                    onClick={() => setAuthState('login')}
                    className="flex items-center gap-1 text-[#6d7a72] hover:text-[#131b2e]"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Changer d'identifiant</span>
                  </button>
                  <span className="text-[#006948] font-medium">Aide réception SMS (+242)</span>
                </div>
              </div>
            )}

            {/* STATE 4: RÉINITIALISER (RESET) */}
            {authState === 'reset' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1">
                  <span className="px-2.5 py-0.5 rounded bg-[#eaedff] text-[#007bb9] font-mono text-[10px] font-bold uppercase w-fit">
                    Procédure de Récupération
                  </span>
                  <h2 className="text-2xl font-black text-[#131b2e] tracking-tight">
                    Réinitialiser l'accès au compte
                  </h2>
                  <p className="text-xs text-[#3d4a42]">
                    Suivez les 3 étapes rapides pour réactiver votre compte TRANSIGO sécurisé.
                  </p>
                </div>

                {/* 3 Steps Breadcrumb */}
                <div className="grid grid-cols-3 gap-2 bg-[#f2f3ff] p-2 rounded-xl text-center text-xs">
                  <div className="p-2 rounded-lg bg-white shadow-sm flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#006948] text-white text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <span className="text-[11px] font-bold text-[#006948] mt-1">Identification</span>
                  </div>
                  <div className="p-2 rounded-lg text-[#6d7a72] flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#eaedff] text-[#6d7a72] text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <span className="text-[11px] font-medium mt-1">Code temporaire</span>
                  </div>
                  <div className="p-2 rounded-lg text-[#6d7a72] flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#eaedff] text-[#6d7a72] text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    <span className="text-[11px] font-medium mt-1">Nouveau passe</span>
                  </div>
                </div>

                <form
                  onSubmit={handleResetSubmit}
                  className="flex flex-col gap-4 mt-1"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#131b2e]">
                      E-mail ou Téléphone lié au compte
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#6d7a72] text-[20px]">
                        badge
                      </span>
                      <input
                        type="text"
                        required
                        value={resetId}
                        onChange={(e) => setResetId(e.target.value)}
                        placeholder="ex: mabiala.serge@transigo.cg ou +242 06..."
                        className="w-full h-12 pl-11 pr-4 bg-[#f2f3ff] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
                      />
                    </div>
                    <span className="text-[11px] text-[#6d7a72]">
                      Un jeton à 6 chiffres vous sera instantanément délivré par SMS ou notification courriel.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#006948] hover:bg-[#00855d] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        <span>Envoi de l'e-mail Firebase...</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer le lien de réinitialisation</span>
                        <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthState('login')}
                    className="w-full h-11 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Retour à l'écran de connexion</span>
                  </button>
                </form>
              </div>
            )}

            {/* Quick Assistance Help Footnote */}
            <div className="mt-6 pt-4 border-t border-[#eaedff] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#3d4a42]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006948] text-[20px]">
                  support_agent
                </span>
                <span>Besoin d'assistance à la Gare Centrale ?</span>
              </div>
              <a
                href="tel:+242060000000"
                className="font-bold text-[#006948] hover:underline flex items-center gap-1"
              >
                <span>+242 06 000 00 00</span>
                <span className="material-symbols-outlined text-[16px]">call</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Supplementary 3 Bento Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#85f8c4] text-[#002114]">
            <span className="material-symbols-outlined text-[20px]">speed</span>
          </div>
          <div>
            <span className="text-sm font-bold text-[#131b2e] block">Télémétrie Instantanée</span>
            <span className="text-xs text-[#6d7a72] mt-0.5 block">
              Fréquence de rafraîchissement GPS toutes les 2 secondes sur tout le réseau urbain.
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#dbe1ff] text-[#0051d5]">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <div>
            <span className="text-sm font-bold text-[#131b2e] block">Paiements Mobile Money</span>
            <span className="text-xs text-[#6d7a72] mt-0.5 block">
              Recharge instantanée de cartes de transport par Airtel Money et MTN Mobile Money.
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#cce5ff] text-[#006194]">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div>
            <span className="text-sm font-bold text-[#131b2e] block">Protection des Données</span>
            <span className="text-xs text-[#6d7a72] mt-0.5 block">
              Conforme aux lois congolaises sur la sécurité numérique et l'anonymisation des trajets.
            </span>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
