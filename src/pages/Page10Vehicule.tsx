import React, { useState, useEffect } from 'react';
import { PageId, Vehicle } from '../types';
import { DEMO_VEHICLES } from '../data/demoData';
import { generateVehicleQR, downloadQRCode, printQRCodeSticker } from '../services/qrService';
import { gpsSimulator } from '../services/gpsSimulator';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';
import { resolveVehicleState } from '../services/vehicleStateMachine';

interface Page10Props {
  onNavigate: (page: PageId, params?: any) => void;
  vehicleId?: string;
}

export const Page10Vehicule: React.FC<Page10Props> = ({ onNavigate, vehicleId: initialVehicleId }) => {
  const [selectedId, setSelectedId] = useState<string>(initialVehicleId || 'BUS-DEMO-001');
  const [vehicle, setVehicle] = useState<Vehicle>(
    DEMO_VEHICLES.find((v) => v.id === selectedId) || DEMO_VEHICLES[0]
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialVehicleId) {
      setSelectedId(initialVehicleId);
    }
  }, [initialVehicleId]);

  useEffect(() => {
    const found = DEMO_VEHICLES.find((v) => v.id === selectedId) || DEMO_VEHICLES[0];
    setVehicle(found);

    // Generate real QR code via qrService using the qrcode library
    generateVehicleQR(found.id).then((result) => {
      setQrCodeDataUrl(result.dataUrl);
      setTargetUrl(result.targetUrl);
    });

    const unsub = gpsSimulator.subscribe((list) => {
      const live = list.find((v) => v.id === selectedId);
      if (live) setVehicle(live);
    });

    return () => unsub();
  }, [selectedId]);

  const handleDownload = () => {
    if (qrCodeDataUrl) {
      downloadQRCode(qrCodeDataUrl, `TRANSIGO-${vehicle.id}-QR.png`);
    }
  };

  const handlePrint = () => {
    if (qrCodeDataUrl) {
      printQRCodeSticker(vehicle.id, vehicle.plate, qrCodeDataUrl);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header Banner */}
      <section className="bg-stone-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-3">
              <span className="material-symbols-outlined text-[16px]">qr_code</span>
              Identifiant Numérique Homologué • TRANSIGO
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Fiche Technique Véhicule & Macaron QR Officiel
            </h1>
            <p className="mt-2 text-stone-300 text-sm max-w-2xl">
              Chaque bus du réseau dispose d'un QR code infalsifiable fixé à bord permettant aux voyageurs de valider leur titre et de consulter les caractéristiques du bus.
            </p>
          </div>

          {/* Quick Vehicle Switcher */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-stone-400 font-semibold">Choisir un bus :</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
            >
              {DEMO_VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.plate} ({v.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Official QR Code Plate (Sticker Card) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#006948] mb-4">
                <span className="material-symbols-outlined text-sm">verified</span>
                Macaron Réglementaire Homologué
              </div>

              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                {vehicle.id}
              </h2>
              <div className="text-sm font-mono font-bold text-stone-600 mt-0.5">
                Immatriculation : {vehicle.plate}
              </div>

              {/* QR Code Container */}
              <div className="my-6 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-[#006948]/30 inline-block shadow-inner">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code officiel pour ${vehicle.id}`}
                    className="w-56 h-56 mx-auto rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-56 h-56 bg-stone-200 animate-pulse rounded-lg flex items-center justify-center text-xs text-stone-500">
                    Génération du QR code dynamique...
                  </div>
                )}
                <div className="text-[10px] font-mono text-stone-500 mt-2">
                  ID: {vehicle.id} • Scan sans secret/token
                </div>
              </div>

              {/* Instructions */}
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed mb-6">
                Scannez ce QR Code avec l'application TRANSIGO ou l'appareil photo de votre smartphone pour ouvrir la fiche véhicule et valider votre titre de transport.
              </p>

              {/* Action Buttons: Download, Print, Copy */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                <button
                  onClick={handleDownload}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Télécharger PNG
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Imprimer Macaron
                </button>
              </div>

              <div className="mt-3">
                <button
                  onClick={handleCopyLink}
                  className="text-[11px] text-[#006948] font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isCopied ? 'check' : 'link'}
                  </span>
                  {isCopied ? 'Lien copié dans le presse-papier !' : 'Copier l’URL publique de ce bus'}
                </button>
              </div>
            </div>

            {/* Live Telemetry Mini Card */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                    Télémétrie en Direct
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('carte-gps', { vehicleId: vehicle.id })}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Localiser</span>
                  <span className="material-symbols-outlined text-sm">near_me</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-800 rounded-xl">
                  <span className="text-stone-400 block text-[10px]">Vitesse GPS</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{vehicle.speed} km/h</span>
                </div>

                <div className="p-3 bg-stone-800 rounded-xl">
                  <span className="text-stone-400 block text-[10px]">Affluence</span>
                  <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                    {vehicle.occupancy.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Technical Specifications Sheet */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Fiche d'Immatriculation & Sécurité
                    </span>
                    <VehicleStatusBadge
                      vehicle={vehicle}
                      vehicleStatus={vehicle.vehicleStatus}
                      serviceStatus={vehicle.serviceStatus}
                      gpsStatus={vehicle.gpsStatus}
                      lastGpsTimestamp={vehicle.lastGpsTimestamp || vehicle.lastGpsUpdate}
                      size="sm"
                      showAge={true}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 mt-0.5">
                    {vehicle.type}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Affecté à la <strong>{vehicle.lineName}</strong> • Exploitant agréé Agglomération de Brazzaville
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('chauffeur')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">airline_seat_recline_extra</span>
                  Cockpit Chauffeur
                </button>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Caractéristiques Générales
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Identifiant Parc</span>
                    <span className="font-extrabold text-stone-900 text-sm">{vehicle.id}</span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Numéro d'Immatriculation</span>
                    <span className="font-extrabold text-stone-900 text-sm font-mono">{vehicle.plate}</span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Capacité Homologuée</span>
                    <span className="font-bold text-stone-800">
                      {vehicle.capacity.seated} places assises • {vehicle.capacity.standing} debout (Max {vehicle.capacity.max})
                    </span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Chauffeur Actuellement en Poste</span>
                    <span className="font-bold text-stone-800">{vehicle.driverName}</span>
                  </div>
                </div>
              </div>

              {/* Equipments & Accessibility */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Équipements & Confort à Bord
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="material-symbols-outlined text-sky-600 text-xl block mb-1">mode_fan</span>
                    <span className="font-bold text-stone-800">Climatisation</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Opérationnelle</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="material-symbols-outlined text-emerald-600 text-xl block mb-1">accessible</span>
                    <span className="font-bold text-stone-800">Rampe PMR</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Certifiée</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="material-symbols-outlined text-purple-600 text-xl block mb-1">videocam</span>
                    <span className="font-bold text-stone-800">Vidéoprotection</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">4 Caméras HD</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="material-symbols-outlined text-amber-600 text-xl block mb-1">wifi</span>
                    <span className="font-bold text-stone-800">Wi-Fi Gratuit</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">TRANSIGO Free</span>
                  </div>
                </div>
              </div>

              {/* Regulatory & Safety Compliance */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Conformité Réglementaire & Visite Technique
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                    <span className="text-stone-600 font-medium">Contrôle Technique Automobile</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Valide jusqu’au 18 Novembre 2026
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                    <span className="text-stone-600 font-medium">Assurance Flotte Transport Public</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Assurance Tous Risques en vigueur
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                    <span className="text-stone-600 font-medium">Extincteurs & Trousse de Secours</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Vérifiés et plombés
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
