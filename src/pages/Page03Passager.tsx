import React, { useState, useEffect } from 'react';
import { PageId, TransportMode, Vehicle, BoardingPoint } from '../types';
import { DEMO_ROUTES, DEMO_BOARDING_POINTS, DEMO_GEO_PLACES, DEMO_VEHICLES } from '../data/demoData';
import { userService, UserLocationState, calculateDistanceMeters } from '../services/userService';
import { gpsSimulator } from '../services/gpsSimulator';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';
import { REAL_VEHICLE_PHOTOS } from '../data/vehiclePhotos';

interface Page03Props {
  onNavigate: (page: PageId, params?: any) => void;
}

export const Page03Passager: React.FC<Page03Props> = ({ onNavigate }) => {
  const [origin, setOrigin] = useState('Total Bacongo (Quai Central)');
  const [destination, setDestination] = useState('Rond-Point Moungali (Terminus)');
  const [selectedMode, setSelectedMode] = useState<TransportMode | 'all'>('all');
  const [departureTime, setDepartureTime] = useState('maintenant');
  const [filterAc, setFilterAc] = useState(false);
  const [filterPmr, setFilterPmr] = useState(false);
  const [activeTab, setActiveTab] = useState<'recherche' | 'proximite' | 'favoris' | 'horaires'>('recherche');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // User GPS & Telemetry (Sections 15 & 16)
  const [location, setLocation] = useState<UserLocationState>(userService.getLocation());
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(gpsSimulator.getVehicles());

  useEffect(() => {
    const unsubUser = userService.subscribe(() => {
      setLocation(userService.getLocation());
    });
    const unsubSim = gpsSimulator.subscribe((list) => {
      setVehicles([...list]);
    });
    return () => {
      unsubUser();
      unsubSim();
    };
  }, []);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleUseGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await userService.requestRealGeolocation();
      if (loc.available && loc.latitude && loc.longitude) {
        setOrigin(`Ma position GPS (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`);
      } else {
        setOrigin('Total Bacongo (Position par défaut)');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('itineraires', { origin, destination, mode: selectedMode, filterAc, filterPmr });
  };

  // Base user coords for proximity calculations (Real GPS or Bacongo fallback)
  const userLat = location.latitude ?? -4.2812;
  const userLng = location.longitude ?? 15.2534;

  // Real computed proximity to nearest items (Section 16)
  const nearestStops = [...DEMO_BOARDING_POINTS]
    .map((point) => ({
      ...point,
      distance: calculateDistanceMeters(userLat, userLng, point.latitude, point.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearestVehicles = vehicles
    .map((v) => ({
      ...v,
      distance: calculateDistanceMeters(userLat, userLng, v.latitude, v.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearestBus = nearestVehicles.find((v) => v.mode === 'bus');
  const nearestCoaster = nearestVehicles.find((v) => v.mode === 'coaster' || v.mode === 'minibus');
  const nearestTaxi = nearestVehicles.find((v) => v.mode === 'taxi');

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-[#006948] to-emerald-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-emerald-200 mb-3">
                <span className="material-symbols-outlined text-[16px] text-emerald-300">directions_bus</span>
                Recherche Multimodale • Grand Brazzaville
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Comment aller d'un point A à un point B ?
              </h1>
              <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Trouvez la meilleure façon de vous déplacer depuis votre position actuelle. Bus, coasters, minibus ou taxis : comparez les temps de parcours réels et les tarifs vérifiés.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('carte-gps')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-sm font-semibold text-white transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-emerald-300">map</span>
                Carte temps réel
              </button>
              <button
                onClick={() => onNavigate('profil')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined">qr_code_scanner</span>
                Mon Pass & Tickets
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Modes Référencés</div>
              <div className="text-xl font-bold mt-1 text-white">Bus, Coaster, Minibus, Taxi</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Points de Prise en Charge</div>
              <div className="text-xl font-bold mt-1 text-emerald-300">{DEMO_BOARDING_POINTS.length} Points Réels</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Tarif Urbain Homologué</div>
              <div className="text-xl font-bold mt-1 text-white">150 FCFA / trajet</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Suivi GPS Satellitaire</div>
              <div className="text-xl font-bold mt-1 text-emerald-300">
                {vehicles.filter((v) => v.gpsConnectionStatus === 'connected_live').length} Véhicules LIVE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Real Passenger GPS Radar Banner (Section 15 & 16) */}
        <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-4 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006948] shrink-0">
              <span className="material-symbols-outlined text-2xl">my_location</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                  Vous êtes ici • {location.placeName || 'Brazzaville'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                    location.available
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${location.available ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'}`} />
                  <span>
                    {location.available
                      ? `GPS Actif (Précision : ±${location.accuracy}m)`
                      : 'GPS Non Autorisé'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {location.available
                  ? `Dernière mise à jour : ${location.timestamp} (${location.source})`
                  : 'Autorisez votre position pour détecter automatiquement les arrêts et bus autour de vous.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseGPS}
              disabled={isLocating}
              className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>{isLocating ? 'Recherche GPS...' : 'Actualiser ma position'}</span>
            </button>
          </div>
        </div>

        {/* Real Proximity Metrics from GPS (Section 16) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#006948]">signpost</span>
                <span>Arrêt proche</span>
              </span>
              <span className="font-mono text-xs font-black text-[#006948]">
                {nearestStops[0]?.distance ?? 300} m
              </span>
            </div>
            <div className="text-sm font-bold text-stone-900 mt-1 truncate">
              {nearestStops[0]?.name || 'Total Bacongo'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
            <img
              src={REAL_VEHICLE_PHOTOS['BUS-DEMO-001'].thumbnailUrl}
              alt="Autobus Urbain STPU"
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-700">directions_bus</span>
                  Bus connecté
                </span>
                <span className="font-mono text-xs font-black text-emerald-600">
                  {nearestBus?.distance ?? 450} m
                </span>
              </div>
              <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                {nearestBus?.id || 'BUS-DEMO-001'} (Ligne 01)
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
            <img
              src={REAL_VEHICLE_PHOTOS['COASTER-DEMO-003'].thumbnailUrl}
              alt="Coaster Minibus"
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-700">airport_shuttle</span>
                  Coaster
                </span>
                <span className="font-mono text-xs font-black text-amber-600">
                  {nearestCoaster?.distance ?? 650} m
                </span>
              </div>
              <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                {nearestCoaster?.id || 'COASTER-002'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
            <img
              src={REAL_VEHICLE_PHOTOS['TAXI-DEMO-005'].thumbnailUrl}
              alt="Taxi Urbain"
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-blue-700">local_taxi</span>
                  Taxi connecté
                </span>
                <span className="font-mono text-xs font-black text-blue-600">
                  {nearestTaxi?.distance ?? 800} m
                </span>
              </div>
              <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                {nearestTaxi?.id || 'TAXI-BZV-102'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Search Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8">
              {/* Tabs */}
              <div className="flex border-b border-stone-100 pb-4 mb-6 gap-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('recherche')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'recherche'
                      ? 'border-[#006948] text-[#006948]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">route</span>
                  Recherche d'itinéraire
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('proximite')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'proximite'
                      ? 'border-[#006948] text-[#006948]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">radar</span>
                  Radar Proximité ({nearestVehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('favoris')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'favoris'
                      ? 'border-[#006948] text-[#006948]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  Trajets Favoris
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('horaires')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'horaires'
                      ? 'border-[#006948] text-[#006948]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  Fiches Horaires
                </button>
              </div>

              {activeTab === 'recherche' && (
                <form onSubmit={handleSearch} className="space-y-5">
                  <div className="relative space-y-4">
                    {/* Origin */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                          Point de départ (Position actuelle)
                        </label>
                        <button
                          type="button"
                          onClick={handleUseGPS}
                          className="text-[11px] text-[#006948] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">my_location</span>
                          Utiliser ma position GPS
                        </button>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">
                          my_location
                        </span>
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="Ex: Total Bacongo, Rond-Point Moungali..."
                          className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:ring-2 focus:ring-[#006948] focus:bg-white outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center -my-2 relative z-10">
                      <button
                        type="button"
                        onClick={handleSwap}
                        title="Intervertir départ et destination"
                        className="p-2 bg-stone-100 hover:bg-emerald-50 hover:text-[#006948] border border-stone-200 rounded-full text-stone-600 transition-all shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg block">swap_vert</span>
                      </button>
                    </div>

                    {/* Destination */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        Point d'arrivée (Destination)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">
                          location_on
                        </span>
                        <input
                          type="text"
                          value={destination}
                          onFocus={() => setSuggestionsOpen(true)}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setSuggestionsOpen(true);
                          }}
                          placeholder="Tapez un lieu (ex: Rond-Point Moungali, Marché Total...)"
                          className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:ring-2 focus:ring-[#006948] focus:bg-white outline-none"
                          required
                        />
                      </div>

                      {/* Autocomplete */}
                      {suggestionsOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-30 max-h-56 overflow-y-auto">
                          <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Lieux Connus & Points de Prise en Charge
                          </div>
                          {DEMO_GEO_PLACES.map((geo) => (
                            <button
                              key={geo.id}
                              type="button"
                              onClick={() => {
                                setDestination(geo.name);
                                setSuggestionsOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs flex items-center justify-between text-stone-800 transition-colors"
                            >
                              <span className="font-bold text-stone-900">{geo.name}</span>
                              <span className="text-[10px] text-stone-500">{geo.district}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      Filtrer par mode de transport
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['all', 'bus', 'coaster', 'minibus', 'taxi'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMode(m)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedMode === m
                              ? 'bg-[#006948] text-white shadow-xs'
                              : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {m === 'all'
                            ? 'Tous les modes'
                            : m === 'bus'
                            ? 'Bus Urbain'
                            : m === 'coaster'
                            ? 'Coaster'
                            : m === 'minibus'
                            ? 'Minibus'
                            : 'Taxi'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-[#006948] hover:bg-[#005238] text-white font-bold text-base shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                        search
                      </span>
                      Calculer les meilleures options de transport
                    </button>
                  </div>
                </form>
              )}

              {/* TAB PROXIMITÉ (Sections 16, 31, 32, 38) */}
              {activeTab === 'proximite' && (
                <div className="space-y-4 py-2">
                  <div className="text-xs text-stone-500">
                    Véhicules connectés émettant leur position GPS autour de votre localisation actuelle :
                  </div>

                  <div className="space-y-3">
                    {nearestVehicles.slice(0, 4).map((veh) => {
                      const photo = REAL_VEHICLE_PHOTOS[veh.id]?.thumbnailUrl || REAL_VEHICLE_PHOTOS['BUS-DEMO-001'].thumbnailUrl;
                      return (
                        <div
                          key={veh.id}
                          className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={photo}
                              alt={veh.id}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-stone-900">{veh.id}</span>
                                <VehicleStatusBadge
                                  vehicle={veh}
                                  vehicleStatus={veh.vehicleStatus}
                                  serviceStatus={veh.serviceStatus}
                                  gpsStatus={veh.gpsStatus}
                                  lastGpsTimestamp={veh.lastGpsTimestamp || veh.lastGpsUpdate}
                                  size="xs"
                                  showAge={true}
                                />
                              </div>
                              <div className="text-stone-600 mt-0.5">
                                {veh.lineName} • Direction : {veh.direction}
                              </div>
                              <div className="text-[11px] text-stone-400 mt-0.5">
                                Prochain arrêt : <strong>{veh.nextStop}</strong> • ETA : {veh.etaNextStop}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0">
                            <div className="font-mono font-black text-sm text-[#006948]">
                              {veh.distance} m
                            </div>
                            <button
                              onClick={() => onNavigate('carte-gps', { vehicleId: veh.id })}
                              className="mt-1 text-[11px] font-bold text-[#006948] hover:underline block flex items-center gap-1"
                            >
                              <span>Suivre sur carte</span>
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'favoris' && (
                <div className="space-y-3 py-2">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-300 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#006948] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">home</span>
                        <span>Maison vers Travail</span>
                      </div>
                      <div className="text-sm font-semibold text-stone-800 mt-0.5">Total Bacongo vers Centre-Ville (Gare)</div>
                      <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                        <span>Ligne 01</span>
                        <span>•</span>
                        <span>15 min</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">150 FCFA</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('itineraires', { origin: 'Total Bacongo', destination: 'Gare Centrale CFCO' })}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Partir
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'horaires' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-stone-500">
                    Sélectionnez une ligne pour consulter les passages journaliers homologués.
                  </p>
                  {DEMO_ROUTES.map((route) => (
                    <div key={route.id} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#006948] text-white flex items-center justify-center font-bold text-xs">
                          {route.code}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-stone-800">{route.name}</div>
                          <div className="text-[11px] text-stone-500">Amplitude : {route.operatingHours} • Tarif: {route.fare}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('lignes-arrets')}
                        className="text-xs font-bold text-[#006948] hover:underline cursor-pointer"
                      >
                        Consulter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Popular Routes & Smart Point Finder */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006948]">trending_up</span>
                  Liaisons Populaires à Brazzaville
                </h3>
                <button
                  onClick={() => onNavigate('lignes-arrets')}
                  className="text-xs font-bold text-[#006948] hover:underline cursor-pointer"
                >
                  Voir tout
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: '1', title: 'Ligne 01 • Bacongo ⇄ Moungali', origin: 'Total Bacongo', dest: 'Rond-Point Moungali', mode: 'Bus Urbain', time: '18 min', price: '150 FCFA', status: 'Fluide' },
                  { id: '2', title: 'Ligne 02 • Mikalou ⇄ Centre-Ville', origin: 'Marché Mikalou', dest: 'Gare Centrale', mode: 'Bus Transurbain', time: '24 min', price: '150 FCFA', status: 'Ralentissement' },
                  { id: '3', title: 'Ligne 03 • Talangaï ⇄ Poto-Poto', origin: 'Arrêt Intendance', dest: 'Marché Poto-Poto', mode: 'Coaster', time: '14 min', price: '150 FCFA', status: 'Optimal' },
                ].map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setOrigin(r.origin);
                      setDestination(r.dest);
                      onNavigate('itineraires', { origin: r.origin, destination: r.dest });
                    }}
                    className="p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 group-hover:text-[#006948]">
                        {r.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-stone-400">timer</span>
                        {r.time} ({r.mode})
                      </span>
                      <span className="font-semibold text-stone-800">{r.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Point Finder */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-[11px] font-semibold text-emerald-300 mb-2">
                <span className="material-symbols-outlined text-xs">radar</span>
                Point de prise en charge le plus proche
              </div>
              <h3 className="text-lg font-black">Trouver où monter autour de vous</h3>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                TRANSIGO identifie les arrêts, carrefours et stations proches pour vous indiquer la marche à pied exacte.
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-300">Point le plus proche</div>
                  <div className="text-sm font-bold text-white">{nearestStops[0]?.name || 'Total Bacongo'}</div>
                </div>
                <button
                  onClick={() => onNavigate('carte-gps')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <span>Localiser ({nearestStops[0]?.distance || 300}m)</span>
                  <span className="material-symbols-outlined text-[14px]">near_me</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
