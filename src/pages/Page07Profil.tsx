import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { PageId } from '../types';
import {
  userService,
  UserProfile,
  UserLocationState,
  UserRole,
  UserSession,
  DriverVehicleAssociation,
} from '../services/userService';
import { GoogleWorkspacePanel } from '../components/GoogleWorkspacePanel';

interface Page07Props {
  onNavigate: (page: PageId, params?: any) => void;
  onOpenOnboarding?: () => void;
}

export const Page07Profil: React.FC<Page07Props> = ({ onNavigate, onOpenOnboarding }) => {
  const [activeSection, setActiveSection] = useState<
    'mes_donnees' | 'google_workspace' | 'pass' | 'geolocalisation' | 'chauffeur_service' | 'historique' | 'recharge' | 'notifs' | 'securite'
  >('mes_donnees');

  const [user, setUser] = useState<UserProfile>(userService.getUser());
  const [sessions, setSessions] = useState<UserSession[]>(userService.getSessions());
  const [location, setLocation] = useState<UserLocationState>(userService.getLocation());
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Form edit states
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Driver vehicle edit states
  const [vehCode, setVehCode] = useState(user.driverVehicle?.vehicleId || 'BUS-DEMO-001');
  const [vehPlate, setVehPlate] = useState(user.driverVehicle?.plate || 'RC-1049-BZV');
  const [vehLine, setVehLine] = useState(user.driverVehicle?.assignedLineName || 'Ligne 01 • Bacongo ⇄ Moungali');

  // QR and recharge states
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [rechargeAmount, setRechargeAmount] = useState<number>(2000);
  const [momoOperator, setMomoOperator] = useState<'airtel' | 'mtn'>('mtn');
  const [momoPhone, setMomoPhone] = useState('06 912 34 56');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState(2450);

  // New favorite place inputs
  const [newFavLabel, setNewFavLabel] = useState('');
  const [newFavAddress, setNewFavAddress] = useState('');
  const [newFavType, setNewFavType] = useState<'home' | 'work' | 'school' | 'other'>('other');

  useEffect(() => {
    const unsub = userService.subscribe(() => {
      setUser(userService.getUser());
      setSessions(userService.getSessions());
      setLocation(userService.getLocation());
    });
    return unsub;
  }, []);

  // Generate real QR code for citizen pass
  useEffect(() => {
    const passPayload = JSON.stringify({
      citizenId: user.id || 'CIT-BZV-2026-8941',
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      passType: 'Pass Mensuel Illimité Urbain',
      validUntil: '2026-10-31T23:59:59Z',
      securityDigest: 'SHA256:7f823a46-transigo-gov-cg',
    });

    QRCode.toDataURL(passPayload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#006948',
        light: '#FFFFFF',
      },
    }).then(setQrDataUrl);
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    userService.updateUser({
      firstName,
      lastName,
      email: email || undefined,
      phone: phone || undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveDriverVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.driverVehicle) {
      userService.updateDriverVehicle({
        ...user.driverVehicle,
        vehicleId: vehCode,
        plate: vehPlate,
        assignedLineName: vehLine,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSwitchRole = (role: UserRole) => {
    userService.setRole(role);
    if (role === 'CHAUFFEUR') {
      setActiveSection('chauffeur_service');
    }
  };

  const handleRequestRealGps = async () => {
    setIsLocating(true);
    try {
      await userService.requestRealGeolocation();
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavLabel.trim() || !newFavAddress.trim()) return;
    userService.addFavoritePlace({
      type: newFavType,
      label: newFavLabel.trim(),
      address: newFavAddress.trim(),
    });
    setNewFavLabel('');
    setNewFavAddress('');
  };

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    setRechargeSuccess(true);
    setTimeout(() => {
      setUserBalance((prev) => prev + rechargeAmount);
      setRechargeSuccess(false);
      setActiveSection('pass');
    }, 1500);
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; desc: string; iconName: string }> = {
    PASSAGER: {
      label: 'Passager',
      badge: 'bg-[#006948] text-white',
      desc: 'Recherche de trajets, consultation des arrêts proches et validation de titres de transport.',
      iconName: 'person',
    },
    CHAUFFEUR: {
      label: 'Chauffeur',
      badge: 'bg-amber-500 text-stone-950',
      desc: 'Prise de service, transmission GPS du véhicule en direct, comptage passagers et liaison régulation.',
      iconName: 'directions_bus',
    },
    TRANSPORTEUR: {
      label: 'Transporteur',
      badge: 'bg-blue-600 text-white',
      desc: 'Gestion des véhicules, affectation des chauffeurs, suivi de flotte et ponctualité.',
      iconName: 'domain',
    },
    ADMIN: {
      label: 'Administrateur',
      badge: 'bg-purple-700 text-white',
      desc: 'Supervision globale de la plateforme, gestion des lignes et contrôle des autorisations.',
      iconName: 'admin_panel_settings',
    },
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Profile Top Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-[#006948] to-emerald-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 flex items-center justify-center font-black text-2xl shadow-inner">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${roleLabels[user.role].badge}`}>
                  <span className="material-symbols-outlined text-sm">{roleLabels[user.role].iconName}</span>
                  <span>{roleLabels[user.role].label}</span>
                </span>
                {user.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase">
                    Compte Vérifié
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200 mt-1 flex items-center gap-2 flex-wrap">
                <span>ID: <strong>{user.id}</strong></span>
                <span>•</span>
                <span>{user.email || user.phone}</span>
                <span>•</span>
                <span className="uppercase font-mono text-[10px] bg-white/15 px-1.5 py-0.5 rounded">
                  Auth: {user.authProvider}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Balance & Onboarding Replay */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl">
              <div className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">
                Solde TRANSIGO
              </div>
              <div className="text-xl font-black text-white">
                {userBalance.toLocaleString()} FCFA
              </div>
            </div>

            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 shadow-xs"
                title="Relancer le guide d'onboarding complet"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                <span>Relancer Onboarding</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-sm space-y-1">
              <button
                onClick={() => setActiveSection('mes_donnees')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                  activeSection === 'mes_donnees'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">manage_accounts</span>
                  <span>Mes Données & Identité</span>
                </div>
                <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">
                  {user.role}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('google_workspace')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                  activeSection === 'google_workspace'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-emerald-600">workspace_premium</span>
                  <span>Google Workspace (Contacts, Gmail, Drive)</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  1P
                </span>
              </button>

              <button
                onClick={() => setActiveSection('geolocalisation')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                  activeSection === 'geolocalisation'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">my_location</span>
                  <span>Gestion Localisation & GPS</span>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    location.available ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                />
              </button>

              {user.role === 'CHAUFFEUR' && (
                <button
                  onClick={() => setActiveSection('chauffeur_service')}
                  className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                    activeSection === 'chauffeur_service'
                      ? 'bg-[#006948] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">drive_eta</span>
                    <span>Mon Profil Chauffeur</span>
                  </div>
                  <span className="material-symbols-outlined text-amber-500 text-sm">verified</span>
                </button>
              )}

              <button
                onClick={() => setActiveSection('pass')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 ${
                  activeSection === 'pass'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">qr_code_2</span>
                <span>Mon Pass & QR de Voyage</span>
              </button>

              <button
                onClick={() => setActiveSection('historique')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 ${
                  activeSection === 'historique'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">history</span>
                <span>Historique des Trajets</span>
              </button>

              <button
                onClick={() => setActiveSection('recharge')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 ${
                  activeSection === 'recharge'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                <span>Recharge Mobile Money (Airtel / MTN)</span>
              </button>

              <button
                onClick={() => setActiveSection('notifs')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 ${
                  activeSection === 'notifs'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">notifications</span>
                <span>Préférences & Notifications</span>
              </button>

              <button
                onClick={() => setActiveSection('securite')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 ${
                  activeSection === 'securite'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>Sécurité & Sessions ({sessions.length})</span>
              </button>
            </div>

            {/* Support Info */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006948] text-base">support_agent</span>
                Assistance TRANSIGO Brazzaville
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Des questions sur votre compte ou vos titres ? Appelez le numéro vert gratuit <strong>8080</strong>.
              </p>
            </div>
          </div>

          {/* Main Action Content Area */}
          <div className="lg:col-span-8">
            {/* SECTION: MES DONNÉES (Sections 17, 18, 45, 47) */}
            {activeSection === 'mes_donnees' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                    Espace Voyageur & Données Personnelles
                  </span>
                  <h2 className="text-xl font-black text-stone-900 mt-0.5">
                    Mes données
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Gérez votre identité, vos préférences de connexion et vos autorisations.
                  </p>
                </div>

                {/* Role Switcher Matrix */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Mode d'utilisation actif :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['PASSAGER', 'CHAUFFEUR', 'TRANSPORTEUR', 'ADMIN'] as UserRole[]).map((r) => {
                      const cfg = roleLabels[r];
                      const isSelected = user.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSwitchRole(r)}
                          className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                            isSelected
                              ? 'border-[#006948] bg-emerald-50 text-[#006948] shadow-xs'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <div className="flex justify-center mb-1">
                            <span className="material-symbols-outlined text-xl">{cfg.iconName}</span>
                          </div>
                          <div>{cfg.label}</div>
                          {isSelected && <div className="text-[10px] text-emerald-800 font-bold">Actif</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-section 1: Identité */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#006948]">person</span>
                    1. Identité
                  </h3>

                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Prénom</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold outline-none focus:border-[#006948]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Nom</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold outline-none focus:border-[#006948]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Téléphone (+242)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold outline-none focus:border-[#006948]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Adresse E-mail</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold outline-none focus:border-[#006948]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                      >
                        Enregistrer mes coordonnées
                      </button>
                      {saveSuccess && (
                        <span className="text-xs font-bold text-emerald-700 animate-fade-in flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Modifications sauvegardées !</span>
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* Sub-section 2: Compte & Méthode de Connexion (Section 47) */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
                  <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#006948]">vpn_key</span>
                    2. Compte & Méthode de Connexion
                  </h3>

                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006948] flex items-center justify-center font-bold">
                        G
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">
                          {user.authProvider === 'google'
                            ? 'Compte Google connecté'
                            : user.authProvider === 'phone'
                            ? 'Compte Téléphone SMS vérifié'
                            : 'Compte E-mail sécurisé'}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <span>{user.email || user.phone}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>Statut : Vérifié</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-[#006948] rounded text-[10px] font-bold">
                      Authentifié
                    </span>
                  </div>

                  {/* Absolute rule reminder */}
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    <strong>Règle de séparation des données :</strong> Votre compte sert uniquement à vous authentifier. Votre position géographique provient exclusivement du capteur GPS de votre appareil suite à votre accord explicite.
                  </div>
                </div>

                {/* Sub-section 3: Préférences de Langue */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#006948]">language</span>
                    3. Préférences de Langue
                  </h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => userService.setLanguage('fr')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        user.language === 'fr'
                          ? 'bg-white border-[#006948] text-[#006948] shadow-xs'
                          : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#006948]" />
                      <span>Français (Par défaut)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => userService.setLanguage('en')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        user.language === 'en'
                          ? 'bg-white border-[#006948] text-[#006948] shadow-xs'
                          : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-stone-400" />
                      <span>English</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: GOOGLE WORKSPACE (Contacts, Gmail, Drive) */}
            {activeSection === 'google_workspace' && <GoogleWorkspacePanel />}

            {/* SECTION: GESTION DE LA LOCALISATION (Sections 19, 48, 49) */}
            {activeSection === 'geolocalisation' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                    Paramètres & Contrôle GPS
                  </span>
                  <h2 className="text-xl font-black text-stone-900 mt-0.5">
                    Gestion de la localisation
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Contrôlez précisément l'accès au capteur GPS de votre appareil.
                  </p>
                </div>

                {/* Master Switch */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900 text-sm">Utiliser ma position</div>
                    <p className="text-xs text-stone-500 mt-0.5 max-w-md">
                      {user.useLocation
                        ? 'Autorise TRANSIGO à interroger le GPS pour calculer les distances aux arrêts et véhicules.'
                        : 'Les recherches continueront, mais votre position ne sera pas utilisée automatiquement.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !user.useLocation;
                      userService.setUseLocation(next);
                      if (next) {
                        handleRequestRealGps();
                      }
                    }}
                    className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                      user.useLocation ? 'bg-[#006948]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        user.useLocation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Telemetry Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    location.available
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          location.available ? 'bg-emerald-500 animate-ping' : 'bg-stone-400'
                        }`}
                      />
                      <span className="font-black text-sm">
                        {location.available ? 'Localisation : Autorisée' : 'Localisation : Désactivée'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                      {location.source}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-4">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block uppercase">Latitude</span>
                      <strong>{location.latitude ?? '--'}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block uppercase">Longitude</span>
                      <strong>{location.longitude ?? '--'}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block uppercase">Précision</span>
                      <strong className="text-emerald-700">
                        {location.accuracy ? `±${location.accuracy} m` : '--'}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block uppercase">Horodatage</span>
                      <strong>{location.timestamp ?? '--'}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleRequestRealGps}
                      disabled={isLocating}
                      className="px-4 py-2 bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">refresh</span>
                      <span>{isLocating ? 'Acquisition...' : 'Actualiser ma position'}</span>
                    </button>

                    {location.available && (
                      <button
                        onClick={() => userService.disableGeolocation()}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
                      >
                        Désactiver la localisation
                      </button>
                    )}
                  </div>
                </div>

                {/* Destinations habituelles (Section 11) */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <h3 className="text-sm font-bold text-stone-900">Destinations Habituelles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.favoritePlaces.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-[#006948]">
                              {p.type === 'home' ? 'home' : p.type === 'work' ? 'work' : 'place'}
                            </span>
                            <span>{p.label}</span>
                          </div>
                          <div className="text-stone-500 mt-0.5">{p.address}</div>
                        </div>
                        <button
                          onClick={() => userService.removeFavoritePlace(p.id)}
                          className="text-stone-400 hover:text-rose-600 text-sm font-bold flex items-center justify-center w-5 h-5 rounded-md hover:bg-rose-50"
                          title="Supprimer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add form */}
                  <form onSubmit={handleAddFavorite} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex gap-2 flex-wrap text-xs">
                    <select
                      value={newFavType}
                      onChange={(e) => setNewFavType(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 outline-none"
                    >
                      <option value="home">Maison</option>
                      <option value="work">Travail</option>
                      <option value="school">École</option>
                      <option value="other">Autre lieu</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Nom (ex: Salle de sport)"
                      value={newFavLabel}
                      onChange={(e) => setNewFavLabel(e.target.value)}
                      className="px-3 py-1.5 bg-white rounded-lg border border-stone-200 flex-1 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Quartier / Repère"
                      value={newFavAddress}
                      onChange={(e) => setNewFavAddress(e.target.value)}
                      className="px-3 py-1.5 bg-white rounded-lg border border-stone-200 flex-1 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#006948] text-white font-bold rounded-lg hover:bg-emerald-800"
                    >
                      Ajouter
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SECTION: PROFIL PROFESSIONNEL CHAUFFEUR (Sections 21-35, 50, 53) */}
            {activeSection === 'chauffeur_service' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Poste de Conduite & Véhicule Associé
                  </span>
                  <h2 className="text-xl font-black text-stone-900 mt-0.5">
                    Mon profil professionnel
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Gérez l'association de votre véhicule, vos vacations et vos paramètres de transmission GPS.
                  </p>
                </div>

                {/* Association Card */}
                <form onSubmit={handleSaveDriverVehicle} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-amber-600">directions_bus</span>
                    Véhicule Assigné & Ligne
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-600 mb-1">Code Véhicule</label>
                      <input
                        type="text"
                        value={vehCode}
                        onChange={(e) => setVehCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-600 mb-1">Immatriculation</label>
                      <input
                        type="text"
                        value={vehPlate}
                        onChange={(e) => setVehPlate(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-600 mb-1">Ligne de Service</label>
                      <input
                        type="text"
                        value={vehLine}
                        onChange={(e) => setVehLine(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs"
                    >
                      Mettre à jour l'association
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('chauffeur')}
                      className="px-4 py-2 bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Ouvrir le Pupitre de Bord →
                    </button>
                  </div>
                </form>

                {/* GPS Battery & Background Constraints Policy (Section 53 & 54) */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <span className="material-symbols-outlined text-base">battery_charging_full</span>
                    <span>Optimisation Batterie & Conduite en Arrière-Plan</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Pour garantir que la position GPS soit émise en continu pendant votre service même lorsque le smartphone est verrouillé :
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-1 pl-1">
                    <li>Désactivez l'économiseur d'énergie strict pour le navigateur / TRANSIGO Driver.</li>
                    <li>Maintenez l'appareil branché sur la prise allume-cigare du véhicule.</li>
                    <li>En cas de coupure réseau, les points GPS sont conservés localement puis synchronisés dès retour du signal.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SECTION: PASS QR */}
            {activeSection === 'pass' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Titre de Transport Dématérialisé
                    </span>
                    <h2 className="text-xl font-black text-stone-900 mt-0.5">
                      Pass Mensuel Urbain Brazzaville
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Valable sur l'ensemble des bus et coasters partenaires TRANSIGO jusqu'au 31 Octobre 2026.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start">
                    Actif & Valide
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-4">
                  <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#006948]/40 shadow-lg text-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Titre TRANSIGO"
                        className="w-56 h-56 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-56 h-56 bg-stone-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-stone-400">
                        Génération du QR sécurisé...
                      </div>
                    )}
                    <div className="text-[11px] font-mono font-bold text-stone-600 mt-3 uppercase tracking-wider">
                      {user.id}
                    </div>
                  </div>

                  <div className="space-y-4 max-w-xs text-xs">
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <span className="text-stone-400 block font-semibold text-[10px] uppercase">
                        Titulaire
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <span className="text-stone-400 block font-semibold text-[10px] uppercase">
                        Réseau Autorisé
                      </span>
                      <span className="font-bold text-stone-900">
                        STPU Brazzaville, Taxis 100/100, Coasters
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <span className="text-stone-400 block font-semibold text-[10px] uppercase">
                        Empreinte Cryptographique
                      </span>
                      <span className="font-mono text-emerald-800 font-bold text-[10px]">
                        HMAC-SHA256: 7F82-3A46-B941
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: SÉCURITÉ & SESSIONS (Section 46) */}
            {activeSection === 'securite' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                    Sécurité du Compte & Connexions
                  </span>
                  <h2 className="text-xl font-black text-stone-900 mt-0.5">
                    Sessions & Appareils Actifs
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Contrôlez les terminaux actuellement connectés à votre compte TRANSIGO.
                  </p>
                </div>

                <div className="space-y-3">
                  {sessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-2xl text-stone-700">
                          {ses.device.includes('Smartphone') ? 'smartphone' : 'laptop_mac'}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-2">
                            <span>{ses.device}</span>
                            {ses.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Session Actuelle
                              </span>
                            )}
                          </div>
                          <div className="text-stone-600 mt-0.5">
                            {ses.browser} • {ses.os}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {ses.ipLocation} • {ses.lastActive}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-100 flex gap-3">
                  <button
                    onClick={() => {
                      userService.disconnectOtherSessions();
                      alert('Toutes les autres sessions ont été déconnectées.');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs"
                  >
                    Déconnecter les autres sessions
                  </button>
                  <button
                    onClick={() => {
                      userService.disconnectCurrentSession();
                      onNavigate('authentification');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200"
                  >
                    Déconnexion de cet appareil
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: HISTORIQUE */}
            {activeSection === 'historique' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-stone-900 pb-4 border-b border-stone-100">
                  Derniers Déplacements
                </h2>
                <div className="space-y-3">
                  {[
                    { id: '1', line: 'Ligne 01', from: 'Total Bacongo', to: 'Rond-Point Moungali', cost: '150 FCFA', date: 'Aujourd’hui, 08:24' },
                    { id: '2', line: 'Ligne 01', from: 'Avenue de la Paix', to: 'Total Bacongo', cost: '150 FCFA', date: 'Hier, 17:45' },
                    { id: '3', line: 'Ligne 02', from: 'Gare Centrale', to: 'Marché Mikalou', cost: '150 FCFA', date: '26 Septembre, 12:10' },
                  ].map((trip) => (
                    <div
                      key={trip.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-bold text-[#006948]">
                          {trip.line.slice(6)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{trip.from} → {trip.to}</div>
                          <div className="text-stone-500 text-[11px]">{trip.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-stone-900">{trip.cost}</div>
                        <div className="text-[10px] text-emerald-700 font-bold">Validé à bord</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: RECHARGE */}
            {activeSection === 'recharge' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-stone-900 pb-4 border-b border-stone-100">
                  Recharger le Portefeuille TRANSIGO
                </h2>

                {rechargeSuccess ? (
                  <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006948] flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </div>
                    <h3 className="font-bold text-emerald-900">Recharge Mobile Money Confirmée !</h3>
                    <p className="text-xs text-emerald-700">
                      Votre solde a été crédité de {rechargeAmount.toLocaleString()} FCFA.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRecharge} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                        Opérateur Mobile Money Congo
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setMomoOperator('mtn')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            momoOperator === 'mtn'
                              ? 'border-yellow-500 bg-yellow-50/40 ring-1 ring-yellow-500'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="font-extrabold text-stone-900 text-sm">MTN Mobile Money</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">Code USSD: *105#</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMomoOperator('airtel')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            momoOperator === 'airtel'
                              ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="font-extrabold text-stone-900 text-sm">Airtel Money Congo</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">Code USSD: *128#</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                        Montant de la recharge (FCFA)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1000, 2000, 5000, 10000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setRechargeAmount(amt)}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              rechargeAmount === amt
                                ? 'bg-[#006948] text-white border-[#006948]'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {amt.toLocaleString()} F
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 uppercase mb-1.5">
                        Numéro de téléphone payeur (+242)
                      </label>
                      <input
                        type="text"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 outline-none focus:border-[#006948]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
                    >
                      Initier la recharge de {rechargeAmount.toLocaleString()} FCFA
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* SECTION: NOTIFICATIONS */}
            {activeSection === 'notifs' && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-stone-900 pb-4 border-b border-stone-100">
                  Préférences des Notifications SMS & Push
                </h2>
                <div className="space-y-3">
                  {[
                    { title: 'Perturbations en direct sur Ligne 01', desc: 'Alerte immédiate en cas de bouchon ou déviation à Bacongo / Moungali', enabled: true },
                    { title: 'Rappels d’approche aux arrêts favoris', desc: 'Notification 5 minutes avant l’arrivée du bus à votre point de montée', enabled: true },
                    { title: 'Reçus de débit et recharges Mobile Money', desc: 'Confirmation par SMS à chaque transaction', enabled: true },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{item.title}</div>
                        <div className="text-stone-500 text-[11px] mt-0.5">{item.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="w-4 h-4 text-[#006948] rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
