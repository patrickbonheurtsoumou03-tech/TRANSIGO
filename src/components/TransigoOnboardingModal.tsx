import React, { useState } from 'react';
import { userService, UserRole, UserLocationState, DriverVehicleAssociation } from '../services/userService';
import { TransigoLogo } from './TransigoLogo';
import { googleSignIn } from '../services/firebase';

interface TransigoOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const TransigoOnboardingModal: React.FC<TransigoOnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  // Step navigation: 0 = Welcome, 1..6 = Role specific steps
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Common User states
  const [selectedRole, setSelectedRole] = useState<UserRole>('PASSAGER');
  const [firstName, setFirstName] = useState<string>('Serge');
  const [lastName, setLastName] = useState<string>('Mabiala');

  // Auth Method
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | 'phone'>('google');
  const [email, setEmail] = useState<string>('mabiala.serge@transigo.cg');
  const [password, setPassword] = useState<string>('Secured2026!');
  const [confirmPassword, setConfirmPassword] = useState<string>('Secured2026!');
  const [phone, setPhone] = useState<string>('+242 06 912 34 56');
  const [otpCode, setOtpCode] = useState<string[]>(['4', '8', '1', '9', '2', '0']);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Language
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  // Passenger specific: Habitual places (Optional)
  const [homeAddress, setHomeAddress] = useState<string>('Total Bacongo, Rue Mbochi');
  const [workAddress, setWorkAddress] = useState<string>('Centre-Ville, Avenue Amilcar Cabral');
  const [schoolAddress, setSchoolAddress] = useState<string>('');
  const [otherAddress, setOtherAddress] = useState<string>('');

  // Driver specific states (Sections 21-26)
  const [driverLicense, setDriverLicense] = useState<string>('PC-CG-2024-8849');
  const [driverExpYears, setDriverExpYears] = useState<number>(6);
  const [driverVehicleCode, setDriverVehicleCode] = useState<string>('BUS-DEMO-001');
  const [driverVehiclePlate, setDriverVehiclePlate] = useState<string>('RC-1049-BZV');
  const [driverVehicleType, setDriverVehicleType] = useState<string>('Bus Articulé Climatisé');
  const [driverVehicleBrand, setDriverVehicleBrand] = useState<string>('Mercedes-Benz Citaro');
  const [driverVehicleCapacity, setDriverVehicleCapacity] = useState<number>(75);
  const [driverLineId, setDriverLineId] = useState<string>('LIGNE-DEMO-01');
  const [driverLineName, setDriverLineName] = useState<string>('Ligne 01 • Bacongo ⇄ Moungali');

  // Geolocation
  const [geoState, setGeoState] = useState<UserLocationState>(userService.getLocation());
  const [isRequestingGeo, setIsRequestingGeo] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalSteps = selectedRole === 'CHAUFFEUR' ? 6 : 6;

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        const parts = (res.user.displayName || '').split(' ');
        setFirstName(parts[0] || 'Voyageur');
        setLastName(parts.slice(1).join(' ') || 'TRANSIGO');
        setEmail(res.user.email || 'patrickbonheurtsoumou03@gmail.com');
      }
      handleNext();
    } catch (e) {
      console.warn('Google Auth notice in onboarding:', e);
      handleNext();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRequestGps = async () => {
    setIsRequestingGeo(true);
    try {
      const loc = await userService.requestRealGeolocation();
      setGeoState(loc);
    } catch (e) {
      // handled inside service
    } finally {
      setIsRequestingGeo(false);
    }
  };

  const handleFinishOnboarding = () => {
    const favorites = [];
    if (homeAddress.trim()) {
      favorites.push({
        id: 'fav-home',
        type: 'home' as const,
        label: 'Maison',
        address: homeAddress,
        nearestStop: 'Arrêt Total Bacongo',
      });
    }
    if (workAddress.trim()) {
      favorites.push({
        id: 'fav-work',
        type: 'work' as const,
        label: 'Travail',
        address: workAddress,
        nearestStop: 'Gare Centrale',
      });
    }
    if (schoolAddress.trim()) {
      favorites.push({
        id: 'fav-school',
        type: 'school' as const,
        label: 'École / Université',
        address: schoolAddress,
      });
    }
    if (otherAddress.trim()) {
      favorites.push({
        id: 'fav-other',
        type: 'other' as const,
        label: 'Autre lieu habituel',
        address: otherAddress,
      });
    }

    const driverVeh: DriverVehicleAssociation | undefined =
      selectedRole === 'CHAUFFEUR'
        ? {
            vehicleId: driverVehicleCode,
            plate: driverVehiclePlate,
            type: driverVehicleType,
            brand: driverVehicleBrand,
            model: 'Citaro G',
            color: 'Vert & Blanc STPU',
            capacity: driverVehicleCapacity,
            assignedLineId: driverLineId,
            assignedLineName: driverLineName,
            direction: 'Rond-Point Moungali',
            isAuthorized: true,
          }
        : undefined;

    userService.updateUser({
      role: selectedRole,
      firstName: firstName.trim() || 'Voyageur',
      lastName: lastName.trim() || 'TRANSIGO',
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      authProvider: authMethod,
      language: language,
      favoritePlaces: favorites,
      onboardingCompleted: true,
      isVerified: true,
      lastLogin: new Date().toISOString(),
      driverLicenseNumber: driverLicense,
      driverExperienceYears: driverExpYears,
      driverVehicle: driverVeh,
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-modal-pop">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#006948] to-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-sm flex items-center justify-center">
              <TransigoLogo size="custom" className="w-full h-full" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-tight">
                {selectedRole === 'CHAUFFEUR' ? 'TRANSIGO DRIVER ONBOARDING' : 'BIENVENUE SUR TRANSIGO'}
              </h2>
              <p className="text-[11px] text-emerald-200">
                {selectedRole === 'CHAUFFEUR' ? 'Poste de Conduite & Télémétrie' : 'Votre mobilité urbaine à portée de main'}
              </p>
            </div>
          </div>

          {currentStep > 0 && (
            <div className="text-right">
              <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full text-emerald-100">
                Étape {currentStep} / {totalSteps}
              </span>
            </div>
          )}
        </div>

        {/* Step Content Container */}
        <div className="p-6 sm:p-8">
          {/* STEP 0: WELCOME SCREEN (Section 3) */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl p-3 border-2 border-emerald-200 shadow-sm flex items-center justify-center">
                <TransigoLogo size="custom" className="w-full h-full" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Bienvenue sur TRANSIGO
                </h1>
                <p className="text-stone-600 text-sm sm:text-base mt-2 font-medium max-w-md mx-auto">
                  Votre compagnon pour trouver et suivre les transports autour de vous.
                </p>
              </div>

              <div className="w-full bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-left text-xs text-stone-700 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006948] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Véritable géolocalisation :</strong> Localisation précise par puce GPS de l'appareil (Google = Identité uniquement).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006948] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Véhicules connectés :</strong> Seuls les véhicules en service transmettant leur GPS apparaissent en direct.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006948] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Tarifs certifiés :</strong> 150 FCFA en bus urbain, tarifs par zones pour taxis et coasters.</span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-900/20 transition-all transform active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Commencer</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
          )}

          {/* QUESTION 1: QUI ÊTES-VOUS ? (Section 4) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                  Question 1 sur 6
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  Comment souhaitez-vous utiliser TRANSIGO ?
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Pour un utilisateur normal, la valeur par défaut est <strong>Passager</strong>.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option Passager (Default) */}
                <label
                  onClick={() => setSelectedRole('PASSAGER')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRole === 'PASSAGER'
                      ? 'border-[#006948] bg-emerald-50/70 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'PASSAGER'}
                    onChange={() => setSelectedRole('PASSAGER')}
                    className="mt-1 text-[#006948] focus:ring-[#006948] h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900 text-base">Passager</span>
                      <span className="text-[10px] font-bold bg-[#006948] text-white px-2 py-0.5 rounded-full">
                        Par défaut
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Une personne qui utilise TRANSIGO pour chercher un trajet et se déplacer.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006948] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                </label>

                {/* Option Chauffeur */}
                <label
                  onClick={() => setSelectedRole('CHAUFFEUR')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRole === 'CHAUFFEUR'
                      ? 'border-[#006948] bg-emerald-50/70 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'CHAUFFEUR'}
                    onChange={() => setSelectedRole('CHAUFFEUR')}
                    className="mt-1 text-[#006948] focus:ring-[#006948] h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900 text-base">Chauffeur</span>
                      <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full">
                        Professionnel
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Une personne autorisée à conduire un véhicule enregistré et pouvant transmettre sa position GPS lorsqu'elle commence un service.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">directions_bus</span>
                  </div>
                </label>

                {/* Option Transporteur */}
                <label
                  onClick={() => setSelectedRole('TRANSPORTEUR')}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRole === 'TRANSPORTEUR'
                      ? 'border-[#006948] bg-emerald-50/70 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === 'TRANSPORTEUR'}
                    onChange={() => setSelectedRole('TRANSPORTEUR')}
                    className="mt-1 text-[#006948] focus:ring-[#006948] h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900 text-base">Transporteur</span>
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Gestion Flotte
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Un opérateur ou gestionnaire pouvant gérer ses véhicules, chauffeurs, lignes et services.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">business</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 2: VOTRE NOM (Section 5) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                  Question 2 sur 6 • {selectedRole === 'CHAUFFEUR' ? 'Profil Chauffeur' : 'Profil Passager'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  {selectedRole === 'CHAUFFEUR' ? 'Identité & Permis de Conduire' : 'Comment vous appelez-vous ?'}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedRole === 'CHAUFFEUR'
                    ? 'Ces données sont enregistrées dans votre registre de conduite officiel TRANSIGO Driver.'
                    : 'Ces données seront conservées dans votre profil passager et pass citoyen.'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Serge"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ex: Mabiala"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 text-stone-900 text-sm font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                {selectedRole === 'CHAUFFEUR' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        N° Permis de Conduire (Congo)
                      </label>
                      <input
                        type="text"
                        value={driverLicense}
                        onChange={(e) => setDriverLicense(e.target.value)}
                        placeholder="PC-CG-2024-8849"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 font-mono text-sm font-bold text-stone-900 outline-none focus:border-[#006948]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Années d'Expérience
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={driverExpYears}
                        onChange={(e) => setDriverExpYears(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 outline-none focus:border-[#006948]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 3: AUTHENTIFICATION / VÉHICULE SI CHAUFFEUR (Sections 6-9, 23-24) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {selectedRole === 'CHAUFFEUR' ? (
                /* Chauffeur: Association Véhicule */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Étape 3 sur 6 • Association Véhicule
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      Véhicule Autorisé du Chauffeur
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Un chauffeur ne peut transmettre la position GPS que d'un véhicule auquel il est réellement autorisé à être associé.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Code Véhicule</label>
                        <input
                          type="text"
                          value={driverVehicleCode}
                          onChange={(e) => setDriverVehicleCode(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Immatriculation</label>
                        <input
                          type="text"
                          value={driverVehiclePlate}
                          onChange={(e) => setDriverVehiclePlate(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Type de véhicule</label>
                        <select
                          value={driverVehicleType}
                          onChange={(e) => setDriverVehicleType(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-semibold"
                        >
                          <option value="Bus Articulé Climatisé">Bus Urbain Climatisé</option>
                          <option value="Toyota Coaster 30 Places">Toyota Coaster (30 places)</option>
                          <option value="Minibus Hiace 18 Places">Minibus Hiace (18 places)</option>
                          <option value="Taxi Urbain Vert-Blanc">Taxi Vert & Blanc 100/100</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Capacité passagers</label>
                        <input
                          type="number"
                          value={driverVehicleCapacity}
                          onChange={(e) => setDriverVehicleCapacity(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Passager: Auth Choice */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Question 3 sur 6 • Inscription & Connexion
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      Comment créer votre compte ?
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Choisissez votre méthode d'identification sécurisée.
                    </p>
                  </div>

                  {/* Clarification banner: Google ≠ GPS (Section 2) */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                    <span className="material-symbols-outlined text-base text-amber-700 shrink-0 mt-0.5">info</span>
                    <div>
                      <strong className="font-bold">Règle technique absolue :</strong> La connexion par compte Google ou e-mail sert uniquement à l'identité du compte. Votre position GPS provient de la puce de votre appareil après votre autorisation distincte.
                    </div>
                  </div>

                  {/* Auth tabs */}
                  <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1.5 rounded-2xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('google')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        authMethod === 'google'
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Option A • Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('email')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        authMethod === 'email'
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Option B • E-mail
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('phone')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        authMethod === 'phone'
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Option C • Téléphone
                    </button>
                  </div>

                  {/* Option A: Google */}
                  {authMethod === 'google' && (
                    <div className="space-y-4 py-2 text-center">
                      <p className="text-xs text-stone-600">
                        Connexion avec votre compte Google. Récupération sécurisée du nom, prénom, e-mail et photo autorisée.
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading}
                        className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border-2 border-stone-200 rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                          />
                        </svg>
                        <span>
                          {isGoogleLoading ? 'Authentification en cours...' : 'Continuer avec Google'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Option B: E-mail */}
                  {authMethod === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Adresse e-mail
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="mabiala.serge@transigo.cg"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#006948]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                            Mot de passe
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#006948]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                            Confirmation
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#006948]"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full mt-2 py-3 rounded-2xl bg-[#006948] text-white font-bold text-sm shadow-md"
                      >
                        Créer mon compte e-mail
                      </button>
                    </div>
                  )}

                  {/* Option C: Téléphone */}
                  {authMethod === 'phone' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                          Numéro de téléphone (+242 Congo)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+242 06 912 34 56"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#006948]"
                          />
                          <button
                            type="button"
                            onClick={() => setIsOtpSent(true)}
                            className="px-4 py-2.5 bg-emerald-100 text-[#006948] font-bold text-xs rounded-xl hover:bg-emerald-200"
                          >
                            {isOtpSent ? 'Renvoyer code' : 'Recevoir le code'}
                          </button>
                        </div>
                      </div>

                      {isOtpSent && (
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                          <span className="text-xs font-bold text-stone-700">Code OTP reçu par SMS :</span>
                          <div className="flex justify-between gap-2">
                            {otpCode.map((digit, idx) => (
                              <input
                                key={idx}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => {
                                  const copy = [...otpCode];
                                  copy[idx] = e.target.value;
                                  setOtpCode(copy);
                                }}
                                className="w-10 h-12 text-center text-lg font-black bg-white rounded-xl border border-stone-300 focus:border-[#006948]"
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleNext}
                            className="w-full mt-2 py-2.5 bg-[#006948] text-white font-bold text-xs rounded-xl"
                          >
                            Vérifier et continuer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50"
                >
                  Retour
                </button>
                {selectedRole !== 'CHAUFFEUR' && authMethod !== 'email' && !isOtpSent && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm"
                  >
                    Passer l'étape d'authentification →
                  </button>
                )}
                {selectedRole === 'CHAUFFEUR' && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
                  >
                    Continuer vers Ligne & Service →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* QUESTION 4: LANGUE OU LIGNE DE SERVICE SI CHAUFFEUR (Section 10 & 24) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {selectedRole === 'CHAUFFEUR' ? (
                /* Driver: Ligne & Service */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Étape 4 sur 6 • Ligne & Service
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      Affectation de la Ligne
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Sélectionnez l'axe officiel sur lequel vous effectuerez vos rotations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'LIGNE-DEMO-01', name: 'Ligne 01 • Bacongo ⇄ Moungali (Axe 3 Martyrs)', terminus: 'Rond-Point Moungali' },
                      { id: 'LIGNE-DEMO-02', name: 'Ligne 02 • Gare Centrale ⇄ Marché Mikalou', terminus: 'Marché Mikalou' },
                      { id: 'LIGNE-DEMO-03', name: 'Ligne 03 • Bifouiti ⇄ Talangaï (Boulevard des Armées)', terminus: 'Terminus Talangaï' },
                    ].map((l) => (
                      <label
                        key={l.id}
                        onClick={() => {
                          setDriverLineId(l.id);
                          setDriverLineName(l.name);
                        }}
                        className={`p-4 rounded-2xl border-2 flex items-start justify-between cursor-pointer transition-all ${
                          driverLineId === l.id
                            ? 'border-[#006948] bg-emerald-50/70 shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-stone-900 text-sm">{l.name}</div>
                          <div className="text-xs text-stone-500 mt-0.5">Direction: {l.terminus}</div>
                        </div>
                        <input
                          type="radio"
                          name="driver_line"
                          checked={driverLineId === l.id}
                          onChange={() => {
                            setDriverLineId(l.id);
                            setDriverLineName(l.name);
                          }}
                          className="mt-1 text-[#006948]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                /* Passenger: Language */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Question 4 sur 6 • Langue
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      Quelle langue souhaitez-vous utiliser ?
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Le français est la langue officielle par défaut.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setLanguage('fr')}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all ${
                        language === 'fr'
                          ? 'border-[#006948] bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#006948] flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">translate</span>
                      </div>
                      <span className="font-extrabold text-base text-stone-900">Français</span>
                      <span className="text-[11px] text-emerald-800 font-semibold">Par défaut (Congo)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all ${
                        language === 'en'
                          ? 'border-[#006948] bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">language</span>
                      </div>
                      <span className="font-extrabold text-base text-stone-900">English</span>
                      <span className="text-[11px] text-stone-500 font-medium">International</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 5: DESTINATIONS HABITUELLES (PASSAGER) OU EXPLICATION GPS (CHAUFFEUR) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {selectedRole === 'CHAUFFEUR' ? (
                /* Driver: GPS Explanation & Consent (Section 26 & 35) */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Étape 5 sur 6 • Confidentialité & GPS Service
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      Autorisation GPS Chauffeur
                    </h2>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
                      <span className="material-symbols-outlined text-base">sensors</span>
                      <span>TRANSIGO Driver utilise votre position GPS</span>
                    </div>
                    <p className="leading-relaxed">
                      La position GPS est utilisée pour afficher le véhicule sur TRANSIGO pendant le service lorsque le chauffeur a autorisé le partage. À la fin du service, le GPS s'arrête automatiquement.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-2">
                    <div className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      Relation de sécurité vérifiée :
                    </div>
                    <div className="font-mono text-stone-800 bg-white p-2.5 rounded-xl border border-stone-200">
                      {firstName} {lastName} (Chauffeur) → {driverVehicleCode} → {driverLineId}
                    </div>
                  </div>
                </div>
              ) : (
                /* Passenger: Habitual Places (Section 11) */
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                        Question 5 sur 6 • Raccourcis
                      </span>
                      <span className="text-[11px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        Optionnel
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      Quels sont vos endroits habituels ?
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Ces raccourcis facilitent vos recherches quotidiennes. Pas besoin d'adresse privée ultra-précise.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-emerald-700">home</span>
                        <span>Maison / Quartier</span>
                      </label>
                      <input
                        type="text"
                        value={homeAddress}
                        onChange={(e) => setHomeAddress(e.target.value)}
                        placeholder="Ex: Total Bacongo, Arrêt Mbochi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 outline-none focus:border-[#006948]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-blue-700">work</span>
                        <span>Travail / Bureau</span>
                      </label>
                      <input
                        type="text"
                        value={workAddress}
                        onChange={(e) => setWorkAddress(e.target.value)}
                        placeholder="Ex: Centre-Ville, Avenue Amilcar Cabral"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 outline-none focus:border-[#006948]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-purple-700">school</span>
                        <span>École / Université (Optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={schoolAddress}
                        onChange={(e) => setSchoolAddress(e.target.value)}
                        placeholder="Ex: Université Marien Ngouabi, Bayardelle"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 outline-none focus:border-[#006948]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50"
                >
                  Retour
                </button>
                {selectedRole !== 'CHAUFFEUR' && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50"
                  >
                    Passer pour l'instant
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
                >
                  Continuer vers le GPS
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 6: GÉOLOCALISATION EXPLICITE & VALIDATION (Sections 12-14, 26-27) */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                  Étape 6 sur 6 • Géolocalisation Réelle
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-[#006948]">my_location</span>
                  {selectedRole === 'CHAUFFEUR'
                    ? 'Activation GPS Pupitre Chauffeur'
                    : 'Trouver les transports autour de vous'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  {selectedRole === 'CHAUFFEUR'
                    ? 'Autorisez l’accès GPS pour émettre les coordonnées en direct de votre véhicule aux passagers lors de votre prise de service.'
                    : 'TRANSIGO utilise votre position GPS pour vous montrer les arrêts, points de prise en charge et véhicules connectés à proximité.'}
                </p>
              </div>

              {/* Real GPS telemetry status card */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  geoState.available
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : geoState.permission === 'denied'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                {geoState.available ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <strong className="text-sm font-black text-emerald-800">
                        Localisation GPS activée
                      </strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <span className="text-stone-500 text-[10px] block">Coordonnées GPS</span>
                        <strong>
                          {geoState.latitude?.toFixed(4)}, {geoState.longitude?.toFixed(4)}
                        </strong>
                      </div>
                      <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                        <span className="text-stone-500 text-[10px] block">Précision réelle</span>
                        <strong>±{geoState.accuracy} mètres</strong>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Source : {geoState.source} • Horodatage : {geoState.timestamp}
                    </div>
                  </div>
                ) : geoState.permission === 'denied' ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <strong className="font-bold text-rose-900">La localisation est désactivée</strong>
                    </div>
                    <p className="text-stone-600 text-[11px]">
                      Vous pouvez l'activer plus tard dans les paramètres de votre navigateur ou appareil.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl">sensors</span>
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-bold">Autorisation matérielle requise</strong>
                      <span>Le navigateur va solliciter l'accès au capteur GPS de votre appareil.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {!geoState.available && (
                  <button
                    type="button"
                    onClick={handleRequestGps}
                    disabled={isRequestingGeo}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <span className="material-symbols-outlined text-lg">my_location</span>
                    <span>
                      {isRequestingGeo ? 'Interrogation du GPS...' : 'Autoriser ma position'}
                    </span>
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-all"
                  >
                    {geoState.available ? 'Terminer la configuration' : 'Plus tard'}
                  </button>
                  {geoState.available && (
                    <button
                      type="button"
                      onClick={handleFinishOnboarding}
                      className="flex-1 py-3 rounded-2xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Ouvrir l'application</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
