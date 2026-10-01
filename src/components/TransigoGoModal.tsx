import React, { useState, useEffect } from 'react';
import { PageId, MultimodalOption, TransportMode } from '../types';
import { calculateMultimodalRoutes } from '../services/multimodalRouter';
import { DEMO_BOARDING_POINTS, DEMO_GEO_PLACES } from '../data/demoData';
import { TransigoLogo } from './TransigoLogo';

interface TransigoGoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId, params?: any) => void;
  userCoords?: { latitude: number; longitude: number };
}

export const TransigoGoModal: React.FC<TransigoGoModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  userCoords = { latitude: -4.2882, longitude: 15.2514 }
}) => {
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<MultimodalOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [quickFilter, setQuickFilter] = useState<TransportMode | 'all'>('all');

  // Direct quick destinations popular in Brazzaville
  const popularDestinations = [
    { name: 'Centre-Ville Plateau', zone: 'Plateau des 15 Ans', icon: 'business' },
    { name: 'Rond-Point Moungali', zone: 'Moungali', icon: 'traffic' },
    { name: 'Marché Total Bacongo', zone: 'Bacongo', icon: 'storefront' },
    { name: 'Université Marien Ngouabi (Bayardelle)', zone: 'Centre-Ville', icon: 'school' },
    { name: 'Aéroport Maya-Maya', zone: 'Moungali Nord', icon: 'flight' },
    { name: 'Stade de Kintélé', zone: 'Kintélé', icon: 'stadium' },
    { name: 'Hôpital Militaire / CHU', zone: 'Centre-Ville', icon: 'local_hospital' },
  ];

  const handleLaunchSearch = (dest: string) => {
    setDestination(dest);
    setHasSearched(true);
    const opts = calculateMultimodalRoutes('Total Bacongo', dest, userCoords);
    setResults(opts);
  };

  const handleSelectOption = (option: MultimodalOption) => {
    onClose();
    onNavigate('itineraires', {
      origin: 'Total Bacongo',
      destination,
      selectedOptionId: option.id
    });
  };

  if (!isOpen) return null;

  const filteredResults =
    quickFilter === 'all' ? results : results.filter((r) => r.mode === quickFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] text-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-500/40 overflow-hidden flex flex-col max-h-[90vh] animate-modal-pop">
        {/* Header Bar with Official Logo */}
        <div className="bg-gradient-to-r from-[#006948] via-[#0051d5] to-[#044e36] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white p-1 border border-white/20 shadow-lg flex items-center justify-center shrink-0">
              <TransigoLogo size="custom" className="h-full w-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">TRANSIGO GO</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950 font-black text-[10px] uppercase">
                  Départ Immédiat
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Votre itinéraire, notre priorité • 1 clic pour partir maintenant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Position Actuelle */}
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">my_location</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wide block">
                  Départ détecté (GPS Actif)
                </span>
                <span className="text-sm font-bold text-white">Total Bacongo • Quartier Bacongo</span>
                <span className="text-[11px] text-stone-400 block">Précision : ±6 mètres</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ici
            </span>
          </div>

          {/* Step 2: Destination Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-emerald-400 tracking-wider">
              Où voulez-vous aller ?
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-stone-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && destination.trim()) {
                    handleLaunchSearch(destination.trim());
                  }
                }}
                placeholder="Tapez un quartier, marché, arrêt ou lieu..."
                className="w-full pl-10 pr-24 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15"
                autoFocus
              />
              <button
                onClick={() => destination.trim() && handleLaunchSearch(destination.trim())}
                className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
              >
                GO !
              </button>
            </div>
          </div>

          {/* Popular Instant Destinations */}
          {!hasSearched && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-stone-400 tracking-wider block">
                Destinations fréquentes en 1 clic
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {popularDestinations.map((dest, i) => (
                  <button
                    key={i}
                    onClick={() => handleLaunchSearch(dest.name)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-emerald-500/40 flex items-center gap-3 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-stone-950 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{dest.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{dest.name}</span>
                      <span className="text-[11px] text-stone-400 block truncate">{dest.zone}</span>
                    </div>
                    <span className="material-symbols-outlined text-stone-500 text-[18px] group-hover:text-emerald-400 transition-colors">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Transports disponibles maintenant</h4>
                  <p className="text-xs text-stone-400">Total Bacongo → {destination}</p>
                </div>
                <button
                  onClick={() => setHasSearched(false)}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  Changer
                </button>
              </div>

              {/* Mode Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['all', 'bus', 'coaster', 'taxi'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setQuickFilter(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      quickFilter === m
                        ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
                        : 'bg-white/10 text-stone-300 hover:bg-white/15'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {m === 'all'
                        ? 'tune'
                        : m === 'bus'
                        ? 'directions_bus'
                        : m === 'coaster'
                        ? 'airport_shuttle'
                        : 'local_taxi'}
                    </span>
                    <span>
                      {m === 'all'
                        ? 'Tous'
                        : m === 'bus'
                        ? 'Bus'
                        : m === 'coaster'
                        ? 'Coaster'
                        : 'Taxi'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Cards List */}
              {filteredResults.length === 0 ? (
                <div className="p-6 bg-white/5 rounded-2xl text-center space-y-2 border border-white/5">
                  <span className="material-symbols-outlined text-stone-500 text-[36px]">
                    error_outline
                  </span>
                  <p className="text-xs text-stone-300">
                    Aucun transport direct configuré pour cette destination exacte. Essayez un arrêt majeur comme <strong>Centre-Ville Plateau</strong> ou <strong>Moungali</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 cursor-pointer transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                            <span className="material-symbols-outlined text-xl">
                              {opt.mode === 'bus' ? 'directions_bus' : opt.mode === 'coaster' ? 'airport_shuttle' : 'local_taxi'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{opt.title}</span>
                            <span className="text-[11px] text-stone-400">{opt.operatorName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 block">
                            {opt.fare.displayPrice}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {opt.fare.verified ? 'Tarif vérifié' : 'Tarif indicatif'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Marche départ</span>
                          <span className="font-bold text-white">{opt.walkingDistanceMeters} m</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Durée totale</span>
                          <span className="font-bold text-emerald-300">{opt.totalDurationMinutes} min</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Statut GPS</span>
                          <span className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-300 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-emerald-400">
                            pin_drop
                          </span>
                          Point de départ : <strong>{opt.boardingPoint.name}</strong>
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          Choisir ce trajet
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
