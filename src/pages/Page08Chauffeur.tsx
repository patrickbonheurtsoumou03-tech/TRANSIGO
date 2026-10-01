import React, { useState, useEffect } from 'react';
import { PageId, Vehicle } from '../types';
import { DEMO_VEHICLES } from '../data/demoData';
import { gpsSimulator } from '../services/gpsSimulator';
import { TransigoLogo } from '../components/TransigoLogo';
import { userService, UserLocationState } from '../services/userService';

interface Page08Props {
  onNavigate: (page: PageId, params?: any) => void;
}

export const Page08Chauffeur: React.FC<Page08Props> = ({ onNavigate }) => {
  const [vehicle, setVehicle] = useState<Vehicle>(DEMO_VEHICLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ status: 'valid' | 'invalid' | null; message: string }>({
    status: null,
    message: '',
  });
  const [ticketInput, setTicketInput] = useState('');
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState('traffic');
  const [incidentNote, setIncidentNote] = useState('');
  const [incidentSent, setIncidentSent] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'actif' | 'pause' | 'termine'>('actif');

  // Live real GPS tracking for driver
  const [userLocation, setUserLocation] = useState<UserLocationState>(userService.getLocation());
  const [isGpsStreaming, setIsGpsStreaming] = useState<boolean>(userService.getUser().isDriverOnDuty || false);

  useEffect(() => {
    const unsubSim = gpsSimulator.subscribe((list) => {
      const current = list.find((v) => v.id === 'BUS-DEMO-001');
      if (current) setVehicle(current);
    });

    const unsubUser = userService.subscribe(() => {
      setUserLocation(userService.getLocation());
    });

    return () => {
      unsubSim();
      unsubUser();
    };
  }, []);

  const handleToggleGpsDuty = () => {
    const nextState = !isGpsStreaming;
    setIsGpsStreaming(nextState);
    userService.toggleDriverDuty(nextState);
    if (nextState) {
      setServiceStatus('actif');
    } else {
      setServiceStatus('termine');
    }
  };

  const handleValidateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    if (ticketInput.includes('99') || ticketInput.includes('CIT') || ticketInput.length > 5) {
      setScanResult({
        status: 'valid',
        message: 'Billet Validé • 150 FCFA • Passager Citoyen OK',
      });
    } else {
      setScanResult({
        status: 'invalid',
        message: 'Titre Non Reconnu ou Déjà Utilisé',
      });
    }

    setTimeout(() => {
      setScanResult({ status: null, message: '' });
      setTicketInput('');
    }, 3000);
  };

  const handleSendIncident = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentSent(true);
    setTimeout(() => {
      setIncidentSent(false);
      setIncidentModalOpen(false);
      setIncidentNote('');
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-stone-900 text-stone-100 font-sans pb-16">
      {/* Driver Cockpit Header */}
      <div className="bg-stone-950 border-b border-stone-800 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white p-1 border border-stone-700 flex items-center justify-center shrink-0 shadow-sm">
              <TransigoLogo size="custom" className="h-full w-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Poste de Conduite Embarqué • TRANSIGO</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                    isGpsStreaming
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isGpsStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                  <span>{isGpsStreaming ? 'Service en cours' : 'Hors service'}</span>
                </span>
              </div>
              <h1 className="text-base font-extrabold text-white">
                Chauffeur Démo 01 • {vehicle.id} ({vehicle.plate})
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleGpsDuty}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isGpsStreaming
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isGpsStreaming ? 'sensors' : 'sensors_off'}
              </span>
              <span>{isGpsStreaming ? 'Émission GPS Active' : 'Démarrer le Service & GPS'}</span>
            </button>

            <button
              onClick={() => onNavigate('carte-gps')}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Carte GPS
            </button>
            <button
              onClick={() => setIncidentModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-xs font-bold flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-sm">warning</span>
              Incident
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Real GPS Transmission Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isGpsStreaming && userLocation.available
                  ? 'bg-emerald-500 animate-ping'
                  : 'bg-stone-600'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Télémétrie GPS Embarquée</span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Source: {userLocation.source}
                </span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                {userLocation.available
                  ? `Lat: ${userLocation.latitude?.toFixed(4)}, Lng: ${userLocation.longitude?.toFixed(4)} • Précision: ±${userLocation.accuracy}m • Vitesse: ${userLocation.speed || vehicle.speed} km/h`
                  : 'Cliquez sur "Démarrer le Service & GPS" pour transmettre vos coordonnées exactes aux voyageurs.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => userService.requestRealGeolocation()}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold"
            >
              Forcer Ping GPS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Instrument Cluster */}
          <div className="lg:col-span-8 space-y-6">
            {/* Speedometer & Route Progress Banner */}
            <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Speedometer dial representation */}
                <div className="text-center p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
                  <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                    Vitesse Réelle
                  </div>
                  <div className="text-5xl font-black text-emerald-400 mt-2 font-mono">
                    {userLocation.speed !== null && userLocation.speed > 0
                      ? userLocation.speed
                      : vehicle.speed}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">KM / H</div>

                  <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-[10px] text-stone-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Limite Urbaine: 50 km/h
                  </div>
                </div>

                {/* Next Stop Info */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                        Prochain Arrêt Réglementaire
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                        ETA: {vehicle.etaNextStop}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1">
                      {vehicle.nextStop}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      Ligne 01 • Axe Bacongo ⇄ Moungali (Avenue des 3 Martyrs)
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-300 font-semibold">Taux de Remplissage</span>
                      <span className="font-bold text-emerald-400">
                        {vehicle.occupancy.current} / {vehicle.capacity.max} passagers (
                        {vehicle.occupancy.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2.5 mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${vehicle.occupancy.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Quick Flight Controls */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-800/80">
                <button
                  onClick={() => alert("Statut: 'Départ d'arrêt' transmis au PCC de régulation")}
                  className="py-3 px-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">play_arrow</span>
                  <span>Départ d'arrêt</span>
                </button>

                <button
                  onClick={() => alert("Statut: 'Arrivée à quai' notifié aux usagers de l'abribus")}
                  className="py-3 px-2 rounded-xl bg-sky-900/40 hover:bg-sky-900/70 border border-sky-500/30 text-sky-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">pause</span>
                  <span>Arrivée à quai</span>
                </button>

                <button
                  onClick={() => setServiceStatus(serviceStatus === 'actif' ? 'pause' : 'actif')}
                  className="py-3 px-2 rounded-xl bg-amber-900/40 hover:bg-amber-900/70 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">timer</span>
                  <span>{serviceStatus === 'actif' ? 'Pause Régulation' : 'Reprendre'}</span>
                </button>
              </div>
            </div>

            {/* Validation Terminal / QR Scanner */}
            <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">qr_code_scanner</span>
                  <h3 className="text-base font-bold text-white">
                    Pupitre Validateur Billettique Embarqué
                  </h3>
                </div>
                <span className="text-xs text-stone-400">Caméra Validateur: Active</span>
              </div>

              {scanResult.status && (
                <div
                  className={`mt-4 p-4 rounded-2xl flex items-center gap-3 transition-all ${
                    scanResult.status === 'valid'
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-200'
                      : 'bg-red-950 border border-red-500 text-red-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {scanResult.status === 'valid' ? 'check_circle' : 'cancel'}
                  </span>
                  <div className="text-sm font-bold">{scanResult.message}</div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Simulated scan view */}
                <div className="h-44 bg-stone-900 rounded-2xl border-2 border-dashed border-stone-700 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                  <div className="w-16 h-16 rounded-xl bg-stone-800 flex items-center justify-center text-stone-400 mb-2">
                    <span className="material-symbols-outlined text-3xl">photo_camera</span>
                  </div>
                  <div className="text-xs font-semibold text-stone-300">
                    Présentez le smartphone du voyageur
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Détection automatique du QR code Pass TRANSIGO
                  </p>

                  <button
                    onClick={() => {
                      setScanResult({
                        status: 'valid',
                        message: 'Billet Validé • 150 FCFA • Débit Mobile Money Effectué',
                      });
                      setTimeout(() => setScanResult({ status: null, message: '' }), 3000);
                    }}
                    className="mt-3 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Simuler Scan Réussi
                  </button>
                </div>

                {/* Manual entry */}
                <form onSubmit={handleValidateTicket} className="space-y-3">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Saisie Manuelle Code Billet
                  </label>
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="Ex: CIT-BZV-2026-8941 ou 15099"
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    Valider le titre
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Shift Stats & Incident Drawer */}
          <div className="lg:col-span-4 space-y-6">
            {/* Vacation Stats Card */}
            <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">query_stats</span>
                Bilan Vacation Journalière
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Temps de Conduite</span>
                  <span className="text-sm font-bold text-white font-mono">03h 42m</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Passagers Validés</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">284 usagers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Recette Billettique</span>
                  <span className="text-sm font-bold text-white font-mono">42 600 FCFA</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Ponctualité Globale</span>
                  <span className="text-xs font-bold text-emerald-400">96.4% dans les temps</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800">
                <button
                  onClick={() => alert("Vacation clôturée. Rapport transmis au transporteur.")}
                  className="w-full py-2.5 rounded-xl border border-stone-700 hover:bg-stone-900 text-stone-300 text-xs font-bold transition-all"
                >
                  Clôturer la Vacation
                </button>
              </div>
            </div>

            {/* Direct Line Dispatch Audio Channel */}
            <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400">headset_mic</span>
                Liaison Radio Régulation
              </h3>
              <p className="text-xs text-stone-400 mb-4">
                Canal direct sécurisé avec le Régulateur PCC Brazzaville.
              </p>

              <button
                onClick={() => alert("Appel Radio émis vers le Centre de Contrôle")}
                className="w-full py-3 rounded-xl bg-sky-900/40 hover:bg-sky-900/60 border border-sky-500/30 text-sky-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">mic</span>
                Appuyer pour Parler (Push-to-Talk)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                Signaler un Incident de Ligne
              </h3>
              <button
                onClick={() => setIncidentModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {incidentSent ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-2">check_circle</span>
                <div className="text-sm font-bold text-white">Alerte transmise au PCC !</div>
                <p className="text-xs text-stone-400 mt-1">Le régulateur adapte l'intervalle des bus.</p>
              </div>
            ) : (
              <form onSubmit={handleSendIncident} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase mb-1">
                    Nature de la perturbation
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-medium text-white outline-none"
                  >
                    <option value="traffic">Embouteillage exceptionnel</option>
                    <option value="breakdown">Panne mécanique véhicule</option>
                    <option value="accident">Accident de la circulation</option>
                    <option value="medical">Urgence voyageur à bord</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase mb-1">
                    Précisions / Localisation
                  </label>
                  <textarea
                    rows={3}
                    value={incidentNote}
                    onChange={(e) => setIncidentNote(e.target.value)}
                    placeholder="Ex: Ralentissement sévère après le Rond-Point Total..."
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white outline-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Envoyer l'alerte prioritaire
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
