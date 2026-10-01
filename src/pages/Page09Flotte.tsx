import React, { useState, useEffect } from 'react';
import { PageId, Vehicle, VehicleStatus, ServiceStatus, GPSStatus } from '../types';
import { gpsSimulator } from '../services/gpsSimulator';
import { TransigoLogo } from '../components/TransigoLogo';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';
import { resolveVehicleState, runStateMachineTests } from '../services/vehicleStateMachine';

interface Page09Props {
  onNavigate: (page: PageId, params?: any) => void;
}

export const Page09Flotte: React.FC<Page09Props> = ({ onNavigate }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(gpsSimulator.getVehicles());
  const [filterGpsStatus, setFilterGpsStatus] = useState<string>('ALL');
  const [testResults, setTestResults] = useState<{ pass: boolean; results: { name: string; success: boolean; details: string }[] } | null>(null);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);

  useEffect(() => {
    const unsub = gpsSimulator.subscribe((list) => {
      setVehicles([...list]);
    });
    return () => unsub();
  }, []);

  const handleRunStateMachineTests = () => {
    const results = runStateMachineTests();
    setTestResults(results);
    setShowTestModal(true);
  };

  const filtered = vehicles.filter((v) => {
    if (filterGpsStatus === 'ALL') return true;
    const resolved = resolveVehicleState({
      vehicleStatus: v.vehicleStatus || 'ACTIVE',
      serviceStatus: v.serviceStatus || 'ACTIVE',
      gpsStatus: v.gpsStatus,
      lastGpsTimestamp: v.lastGpsTimestamp || v.lastGpsUpdate,
    });
    if (filterGpsStatus === 'LIVE') return resolved.effectiveStatus === 'IN_SERVICE_LIVE';
    if (filterGpsStatus === 'RECENT') return resolved.effectiveStatus === 'IN_SERVICE_RECENT';
    if (filterGpsStatus === 'STALE') return resolved.effectiveStatus === 'IN_SERVICE_STALE';
    if (filterGpsStatus === 'MAINTENANCE') return resolved.vehicleStatus === 'MAINTENANCE';
    if (filterGpsStatus === 'OFFLINE') return resolved.effectiveStatus === 'IN_SERVICE_NO_GPS';
    return true;
  });

  const totalSeats = vehicles.reduce((acc, v) => acc + v.capacity.max, 0);
  const currentPassengers = vehicles.reduce((acc, v) => acc + v.occupancy.current, 0);
  const globalOccupancy = totalSeats > 0 ? Math.round((currentPassengers / totalSeats) * 100) : 0;

  const liveVehiclesCount = vehicles.filter((v) => {
    const res = resolveVehicleState({
      vehicleStatus: v.vehicleStatus || 'ACTIVE',
      serviceStatus: v.serviceStatus || 'ACTIVE',
      gpsStatus: v.gpsStatus,
      lastGpsTimestamp: v.lastGpsTimestamp || v.lastGpsUpdate,
    });
    return res.effectiveStatus === 'IN_SERVICE_LIVE';
  }).length;

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Fleet Header */}
      <section className="bg-stone-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white p-1 border border-stone-700 shadow-md shrink-0 hidden sm:flex items-center justify-center">
              <TransigoLogo size="custom" className="h-full w-full" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-2">
                <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                Supervision Transporteur • Machine d’États Centralisée
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Gestionnaire de Flotte & Supervision Télémétrique
              </h1>
              <p className="mt-2 text-stone-300 text-sm max-w-2xl">
                Suivi télémétrique des bus, état technique des parcs, ponctualité aux arrêts et régulation en temps réel à Brazzaville.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunStateMachineTests}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-base text-amber-400">rule</span>
              Tests Machine d’États
            </button>
            <button
              onClick={() => onNavigate('carte-gps')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-base">map</span>
              Supervision GPS Flotte
            </button>
          </div>
        </div>
      </section>

      {/* Fleet KPI Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Véhicules LIVE</span>
            </div>
            <div className="text-2xl font-black text-stone-900 mt-2 flex items-baseline gap-2">
              <span>{liveVehiclesCount} / {vehicles.length}</span>
              <span className="text-xs font-bold text-emerald-600">≤ 15s</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">4 Lignes Urbaines Desservies</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Taux d'Affluence Réseau
            </div>
            <div className="text-2xl font-black text-stone-900 mt-2 flex items-baseline gap-2">
              <span>{globalOccupancy}%</span>
              <span className="text-xs font-semibold text-stone-500">
                {currentPassengers}/{totalSeats}
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Capacité fluide</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Vitesse Moyenne Réseau
            </div>
            <div className="text-2xl font-black text-stone-900 mt-2 flex items-baseline gap-2">
              <span>28.4</span>
              <span className="text-xs font-normal text-stone-500">km/h</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Ralentissement modéré RN1</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Recettes Billettiques (Jour)
            </div>
            <div className="text-2xl font-black text-[#006948] mt-2">
              254 000 FCFA
            </div>
            <div className="text-[11px] text-stone-500 mt-1">1 693 validations dématérialisées</div>
          </div>
        </div>

        {/* Fleet Main Table */}
        <div className="mt-8 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                État Opérationnel de la Flotte & Statuts Centralisés
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Télémétrie GPS normalisée selon la machine d'états officielle (vehicleStatus, serviceStatus, gpsStatus).
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterGpsStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterGpsStatus === 'ALL'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tous ({vehicles.length})
              </button>
              <button
                onClick={() => setFilterGpsStatus('LIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterGpsStatus === 'LIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>LIVE (≤15s)</span>
              </button>
              <button
                onClick={() => setFilterGpsStatus('RECENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterGpsStatus === 'RECENT'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>RECENT (≤60s)</span>
              </button>
              <button
                onClick={() => setFilterGpsStatus('STALE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterGpsStatus === 'STALE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>STALE (Dernière connue)</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-6">Véhicule & Plaque</th>
                  <th className="py-3 px-6">Statut Officiel (Machine d'États)</th>
                  <th className="py-3 px-6">Ligne & Chauffeur</th>
                  <th className="py-3 px-6">Vitesse / Suivi</th>
                  <th className="py-3 px-6">Affluence</th>
                  <th className="py-3 px-6">Prochain Arrêt / ETA</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filtered.map((veh) => {
                  const resolved = resolveVehicleState({
                    vehicleStatus: veh.vehicleStatus || 'ACTIVE',
                    serviceStatus: veh.serviceStatus || 'ACTIVE',
                    gpsStatus: veh.gpsStatus,
                    lastGpsTimestamp: veh.lastGpsTimestamp || veh.lastGpsUpdate,
                  });

                  return (
                    <tr key={veh.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-stone-900">{veh.id}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{veh.plate}</div>
                      </td>

                      <td className="py-4 px-6">
                        <VehicleStatusBadge
                          vehicle={veh}
                          vehicleStatus={veh.vehicleStatus}
                          serviceStatus={veh.serviceStatus}
                          gpsStatus={veh.gpsStatus}
                          lastGpsTimestamp={veh.lastGpsTimestamp || veh.lastGpsUpdate}
                          size="sm"
                          showAge={true}
                        />
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold text-[11px]">
                          {veh.lineName}
                        </span>
                        <div className="text-[11px] text-stone-600 font-medium mt-1">
                          {veh.driverName}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{veh.speed} km/h</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              resolved.isTrackable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {resolved.isTrackable ? 'Trackable' : 'Non tracké'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="w-24 bg-stone-200 rounded-full h-2 overflow-hidden mb-1">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${veh.occupancy.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-600">
                          {veh.occupancy.current}/{veh.capacity.max} ({veh.occupancy.percentage}%)
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">{veh.nextStop}</div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          ETA: {resolved.canCalculateEta ? veh.etaNextStop : 'Non garantie'}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate('vehicule', { id: veh.id })}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-[#006948] rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">qr_code</span>
                            Fiche QR
                          </button>
                          <button
                            onClick={() => onNavigate('carte-gps', { vehicleId: veh.id })}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 transition-all cursor-pointer"
                            title="Localiser sur la carte"
                          >
                            <span className="material-symbols-outlined text-sm">gps_fixed</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Regulation Advice Box */}
        <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-700 text-3xl shrink-0">speed</span>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Recommandation Algorithmique de Régulation (PCC)
              </h4>
              <p className="text-xs text-emerald-800 mt-1 max-w-3xl leading-relaxed">
                Intervalle cible sur Ligne 01 : 6 minutes. Maintenez le bus BUS-DEMO-002 à l'arrêt Rond-Point Moungali pendant 90 secondes supplémentaires pour éviter le trainage et régulariser l'espacement.
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Consigne de temporisation transmise au chauffeur BUS-DEMO-002")}
            className="px-4 py-2.5 bg-[#006948] hover:bg-[#005238] text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
          >
            Appliquer la consigne
          </button>
        </div>
      </div>

      {/* State Machine Test Suite Modal */}
      {showTestModal && testResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  testResults.pass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  <span className="material-symbols-outlined">
                    {testResults.pass ? 'verified' : 'error'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Banc d'Essai de la Machine d’États TRANSIGO
                  </h3>
                  <p className="text-xs text-stone-500">
                    Validation des règles de compatibilité et d'expiration GPS (Sections 44 & 45)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {testResults.results.map((test, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    test.success
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-semibold">{test.name}</div>
                  <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-white border border-current">
                    {test.details}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <span>Résultat Global :</span>
                {testResults.pass ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>100% Validé et Conforme</span>
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>Erreurs détectées</span>
                  </span>
                )}
              </span>
              <button
                onClick={() => setShowTestModal(false)}
                className="px-5 py-2.5 bg-[#006948] text-white rounded-xl text-xs font-bold hover:bg-[#005238] transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
