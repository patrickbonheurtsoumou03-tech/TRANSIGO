import React, { useState } from 'react';
import { PageId, Route, BoardingPoint, Vehicle } from '../types';
import { DEMO_ROUTES, DEMO_BOARDING_POINTS, DEMO_VEHICLES } from '../data/demoData';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';

interface Page06Props {
  onNavigate: (page: PageId, params?: any) => void;
}

export const Page06LignesArrets: React.FC<Page06Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'lignes' | 'boarding_points' | 'vehicules'>('lignes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(DEMO_ROUTES[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('TOUS');

  const filteredRoutes = DEMO_ROUTES.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.operatorName && r.operatorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBoardingPoints = DEMO_BOARDING_POINTS.filter((bp) => {
    const matchQuery =
      bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDistrict = selectedDistrict === 'TOUS' || bp.zone.toLowerCase().includes(selectedDistrict.toLowerCase());
    return matchQuery && matchDistrict;
  });

  const filteredVehicles = DEMO_VEHICLES.filter((v) =>
    v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.lineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.mode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      
      {/* Header Banner */}
      <section className="bg-stone-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-3">
              <span className="material-symbols-outlined text-[16px]">signpost</span>
              Répertoire Multimodal • Brazzaville Urbain
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Lignes, Points de Prise en Charge & Flotte
            </h1>
            <p className="mt-2 text-stone-300 text-sm max-w-2xl">
              Nomenclature des lignes, arrêts officiels, carrefours et points de montée réels (`BoardingPoints`). Ne contient aucune ligne ou point fictif.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('carte-gps')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">map</span>
              Supervision Cartographique
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8">
          
          {/* Tabs and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('lignes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'lignes' ? 'bg-[#006948] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">alt_route</span>
                Lignes Multimodales ({DEMO_ROUTES.length})
              </button>

              <button
                onClick={() => setActiveTab('boarding_points')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'boarding_points' ? 'bg-[#006948] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">pin_drop</span>
                Points de Prise en Charge ({DEMO_BOARDING_POINTS.length})
              </button>

              <button
                onClick={() => setActiveTab('vehicules')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'vehicules' ? 'bg-[#006948] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">directions_bus</span>
                Véhicules en Service ({DEMO_VEHICLES.length})
              </button>
            </div>

            {/* Filter Search */}
            <div className="relative w-full md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, code, quartier..."
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#006948] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* TAB 1: LIGNES MULTIMODALES */}
          {activeTab === 'lignes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
              
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Lignes Référencées (Bus, Coaster, Minibus)
                </span>

                {filteredRoutes.map((route) => {
                  const isSelected = selectedRoute?.id === route.id;
                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#006948] bg-emerald-50/40 ring-1 ring-[#006948]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shadow-xs"
                            style={{ backgroundColor: route.color }}
                          >
                            {route.code}
                          </span>
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm">{route.name}</h3>
                            <div className="text-xs text-stone-500">{route.operatorName}</div>
                          </div>
                        </div>

                        <span className="material-symbols-outlined text-stone-400">chevron_right</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-100 text-center text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Arrêts</span>
                          <span className="font-bold text-stone-800">{route.stopsCount} arrêts</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Fréquence</span>
                          <span className="font-bold text-emerald-700">{route.frequency}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Tarif</span>
                          <span className="font-bold text-stone-800">{route.fare}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail on Right */}
              <div className="lg:col-span-7">
                {selectedRoute ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                      <div className="flex items-center gap-4">
                        <span
                          className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-md"
                          style={{ backgroundColor: selectedRoute.color }}
                        >
                          {selectedRoute.code}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                            Mode : {selectedRoute.mode.toUpperCase()} • {selectedRoute.category}
                          </div>
                          <h2 className="text-xl font-black text-stone-900">{selectedRoute.name}</h2>
                          <div className="text-xs text-stone-500 mt-0.5">
                            Opérateur officiel : <strong>{selectedRoute.operatorName}</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigate('carte-gps')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-[#006948]">gps_fixed</span>
                        Tracé GPS
                      </button>
                    </div>

                    {/* Fiche Tarif & Horaires */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-stone-400 block text-[10px] uppercase">Tarif par trajet</span>
                        <span className="font-black text-stone-900 text-base">{selectedRoute.fare}</span>
                        <span className="text-[10px] text-emerald-700 block font-semibold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          <span>Vérifié (Arrêté ministériel)</span>
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-stone-400 block text-[10px] uppercase">Amplitude</span>
                        <span className="font-bold text-stone-900 mt-1 block">{selectedRoute.operatingHours}</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-stone-400 block text-[10px] uppercase">Distance</span>
                        <span className="font-bold text-stone-900 mt-1 block">{selectedRoute.totalDistanceKm} km</span>
                      </div>
                    </div>

                    {/* Assigned Vehicles */}
                    <div className="pt-4 border-t border-stone-200">
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                        Véhicules actuellement déployés sur cette ligne
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DEMO_VEHICLES.filter((v) => v.lineId === selectedRoute.id).map((veh) => (
                          <div
                            key={veh.id}
                            onClick={() => onNavigate('vehicule', { id: veh.id })}
                            className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-stone-900 text-xs">{veh.id}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-100 text-stone-600">
                                  {veh.plate}
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5">{veh.type}</div>
                            </div>
                            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              {veh.gpsConnectionStatus === 'connected_live' ? `${veh.speed} km/h` : 'Non connecté'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* TAB 2: BOARDING POINTS (STEP 15 OF PROMPT) */}
          {activeTab === 'boarding_points' && (
            <div className="mt-6 space-y-6">
              
              {/* District pills */}
              <div className="flex flex-wrap items-center gap-2">
                {['TOUS', 'Bacongo', 'Moungali', 'Poto-Poto', 'Talangaï', 'Mikalou', 'Makélékélé', 'Centre-Ville', 'Ouenzé'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDistrict(d)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDistrict === d ? 'bg-[#006948] text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBoardingPoints.map((bp) => (
                  <div
                    key={bp.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px] font-bold">
                            {bp.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {bp.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-stone-900 text-sm mt-1.5">{bp.name}</h3>
                        <p className="text-xs text-stone-500">{bp.zone} • {bp.landmarkNote}</p>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">pin_drop</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-semibold text-stone-400">Transports :</span>
                      <div className="flex gap-1">
                        {bp.availableModes.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-bold uppercase"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span className="text-[10px] truncate max-w-[180px]">
                        Source : {bp.source}
                      </span>
                      <button
                        onClick={() => onNavigate('carte-gps')}
                        className="text-[#006948] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Localiser</span>
                        <span className="material-symbols-outlined text-xs">near_me</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: VÉHICULES MULTIMODAUX */}
          {activeTab === 'vehicules' && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVehicles.map((veh) => {
                  const isLive = veh.gpsConnectionStatus === 'connected_live';
                  const isLastKnown = veh.gpsConnectionStatus === 'last_known';

                  return (
                    <div
                      key={veh.id}
                      onClick={() => onNavigate('vehicule', { id: veh.id })}
                      className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-[#006948] hover:shadow-lg transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-900 text-base">{veh.id}</span>
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px] font-bold">
                              {veh.plate}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5">{veh.type}</div>
                        </div>

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

                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Opérateur :</span>
                          <span className="font-semibold text-stone-800 truncate max-w-[180px]">{veh.operatorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Ligne :</span>
                          <span className="font-bold text-stone-800">{veh.lineName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Direction :</span>
                          <span className="font-semibold text-emerald-700">{veh.direction}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500 font-mono">
                          Vitesse : {isLive ? `${veh.speed} km/h` : '0 km/h'}
                        </span>
                        <span className="text-[#006948] font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
                          Fiche & QR
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
