import React, { useState, useEffect } from 'react';
import { PageId, MultimodalOption } from '../types';
import { calculateMultimodalRoutes } from '../services/multimodalRouter';
import { gpsSimulator } from '../services/gpsSimulator';
import { journeyTrackerService } from '../services/journeyTrackerService';
import { SearchResultSkeleton } from '../components/SkeletonLoader';

interface Page04Props {
  onNavigate: (page: PageId, params?: any) => void;
  searchParams?: {
    origin?: string;
    destination?: string;
    mode?: string;
  };
}

export const Page04Itineraires: React.FC<Page04Props> = ({ onNavigate, searchParams }) => {
  const origin = searchParams?.origin || 'Total Bacongo (Quai Central)';
  const destination = searchParams?.destination || 'Rond-Point Moungali (Terminus)';
  
  const [options, setOptions] = useState<MultimodalOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(0);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Live journey tracking simulation (Step 19 of Prompt)
  const [isTrackingJourney, setIsTrackingJourney] = useState<boolean>(false);
  const [trackingStepIdx, setTrackingStepIdx] = useState<number>(0);
  const [journeyNotification, setJourneyNotification] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const calculated = calculateMultimodalRoutes(origin, destination);
    const timer = setTimeout(() => {
      setOptions(calculated);
      setSelectedOptionIdx(0);
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [origin, destination]);

  // Handle live tracking simulation
  useEffect(() => {
    if (!isTrackingJourney) return;

    const notifs = [
      'Vous êtes en route vers le point de prise en charge (180 m restants).',
      'Votre bus approche de votre point de montée (dans 1 min).',
      'Le véhicule BUS-DEMO-001 est arrivé au quai d’embarquement.',
      'Vous êtes à bord. Prochain arrêt : Carrefour Deux Poteaux.',
      'Vous approchez de votre arrêt de descente : Rond-Point Moungali.',
      'Votre arrêt arrive. Préparez-vous à descendre.'
    ];

    let current = 0;
    setJourneyNotification(notifs[0]);

    const timer = setInterval(() => {
      current += 1;
      if (current < notifs.length) {
        setTrackingStepIdx(current);
        setJourneyNotification(notifs[current]);
      } else {
        clearInterval(timer);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [isTrackingJourney]);

  const currentOption = options[selectedOptionIdx] || null;

  const handleBuyTicket = () => {
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketModalOpen(false);
      setTicketSuccess(false);
      onNavigate('profil');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('passager')}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all flex items-center justify-center cursor-pointer"
              title="Modifier la recherche"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <div className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
                <span>Calcul Multimodal Sans Biais</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[#006948] font-bold">Données Certifiées</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2 mt-0.5">
                <span className="truncate max-w-[200px] sm:max-w-xs">{origin}</span>
                <span className="material-symbols-outlined text-stone-400 text-sm">arrow_forward</span>
                <span className="truncate max-w-[200px] sm:max-w-xs">{destination}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('carte-gps')}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">map</span>
              Carte live GPS
            </button>
            <button
              onClick={() => onNavigate('passager')}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              Modifier
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-4">
            <div className="lg:col-span-5">
              <SearchResultSkeleton />
            </div>
            <div className="lg:col-span-7">
              <div className="h-64 rounded-2xl bg-white border border-stone-200 p-6 skeleton-shimmer" />
            </div>
          </div>
        ) : options.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-2xl mx-auto shadow-sm my-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">route_off</span>
            </div>
            <h2 className="text-xl font-black text-stone-900">
              Aucune donnée d'itinéraire disponible.
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Conformément à la politique d'intégrité TRANSIGO : aucun transport fictif n'est inventé. La liaison entre <strong>« {origin} »</strong> et <strong>« {destination} »</strong> ne correspond à aucun tracé ou point de prise en charge homologué dans le système.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('passager')}
                className="px-5 py-2.5 bg-[#006948] text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-800 transition-all cursor-pointer"
              >
                Nouvelle recherche
              </button>
              <button
                onClick={() => onNavigate('lignes-arrets')}
                className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all cursor-pointer"
              >
                Voir les points réels configurés
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Multimodal Options Comparison (Step 7 of Prompt) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {options.length} Possibilités Réellement Disponibles
                </span>
                <span className="text-[11px] text-stone-400">Sans parti pris</span>
              </div>

              {options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx;
                const isLive = opt.gpsStatus === 'LIVE' || (opt.gpsStatus as any) === 'connected_live';

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setSelectedOptionIdx(idx);
                      setIsTrackingJourney(false);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#006948] ring-2 ring-[#006948]/20 shadow-md'
                        : 'bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white'
                    }`}
                  >
                    {/* Header badge & Fare */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                          Option {idx + 1} • {opt.mode.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-600 animate-ping' : 'bg-stone-400'}`} />
                          <span>{isLive ? 'GPS en direct' : 'Suivi indisponible'}</span>
                        </span>
                      </div>
                      <span className="text-base font-extrabold text-[#006948]">
                        {opt.fare.displayPrice}
                      </span>
                    </div>

                    {/* Duration & Distance */}
                    <div className="flex items-baseline justify-between mt-2">
                      <div>
                        <div className="text-2xl font-black text-stone-900 tracking-tight">
                          {opt.totalDurationMinutes} min
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {opt.operatorName}
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="font-semibold text-stone-700 flex items-center justify-end gap-1">
                          <span className="material-symbols-outlined text-[15px] text-stone-500">directions_walk</span>
                          <span>{opt.walkingDistanceMeters} m ({opt.walkingDurationMinutes} min à pied)</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Point : {opt.boardingPoint.name}
                        </div>
                      </div>
                    </div>

                    {/* Fare source indicator */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 truncate max-w-[240px]">
                        Tarif : {opt.fare.source}
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          opt.fare.verified ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {opt.fare.verified ? 'verified' : 'info'}
                        </span>
                        <span>{opt.fare.verified ? 'Vérifié' : 'Indicatif'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Environmental Savings */}
              {currentOption?.co2SavingsGrams ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-700 text-xl shrink-0">eco</span>
                  <div className="text-emerald-900">
                    <strong>{currentOption.co2SavingsGrams} g de CO₂ économisés</strong> en utilisant ce transport collectif plutôt qu'un véhicule individuel.
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column: Detailed Journey Breakdown (Steps 8, 16 & 19 of Prompt) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Active Step-by-Step Card */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                      Détail du parcours (Mode « Comment y aller ? »)
                    </span>
                    <h2 className="text-xl font-black text-stone-900 mt-0.5">
                      {currentOption?.title}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Opérateur : <strong>{currentOption?.operatorName}</strong> • {currentOption?.direction}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isTrackingJourney) {
                          setIsTrackingJourney(false);
                          journeyTrackerService.endJourney();
                        } else if (currentOption) {
                          setIsTrackingJourney(true);
                          journeyTrackerService.startJourney(currentOption, destination);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                        isTrackingJourney
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#006948] hover:bg-[#005238] text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isTrackingJourney ? 'stop' : 'navigation'}
                      </span>
                      <span>{isTrackingJourney ? 'Arrêter suivi' : 'Démarrer le trajet (Live Tracker)'}</span>
                    </button>
                  </div>
                </div>

                {/* Step 19: Live Journey Tracking Notifications Bar */}
                {isTrackingJourney && journeyNotification && (
                  <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-100 border border-emerald-800 flex items-center gap-3 animate-fade-in shadow-lg">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div className="text-xs font-bold flex-1 leading-relaxed">
                      {journeyNotification}
                    </div>
                  </div>
                )}

                {/* STEP 8: « OÙ DOIS-JE ALLER POUR PRENDRE CE TRANSPORT ? » (CRITICAL BOX) */}
                <div className="p-5 rounded-2xl bg-stone-50 border-2 border-dashed border-[#006948]/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#006948] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-lg">directions_walk</span>
                    <span>Où aller pour prendre ce transport ?</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="text-sm font-extrabold text-stone-900">
                        {currentOption?.boardingPoint.name}
                      </div>
                      <div className="text-stone-500 mt-0.5">
                        {currentOption?.boardingPoint.landmarkNote || 'Point de prise en charge homologué'}
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-800 font-bold text-right shrink-0 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-stone-500">directions_walk</span>
                      <span>{currentOption?.walkingDistanceMeters} m ({currentOption?.walkingDurationMinutes} min à pied)</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Leg Details */}
                <div className="space-y-5 pt-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Étapes du trajet
                  </span>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                    {currentOption?.steps.map((st, i) => (
                      <div key={i} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                            i === trackingStepIdx && isTrackingJourney
                              ? 'border-emerald-500 ring-4 ring-emerald-200'
                              : 'border-stone-400'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <h4 className="font-bold text-stone-900">{st.instruction}</h4>
                            <span className="text-stone-400 font-semibold">{st.durationText}</span>
                          </div>
                          {st.detail && (
                            <p className="text-[11px] text-stone-500 mt-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              {st.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 6: VERIFIED FARE BREAKDOWN CARD */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">
                      Tarification du déplacement
                    </div>
                    <div className="text-base font-extrabold text-stone-900 mt-0.5">
                      {currentOption?.fare.displayPrice}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Source : {currentOption?.fare.source}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        currentOption?.fare.verified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {currentOption?.fare.verified ? 'verified' : 'info'}
                      </span>
                      {currentOption?.fare.verified ? 'Tarif vérifié' : 'Prix indicatif — à confirmer'}
                    </span>
                    <div className="text-[10px] text-stone-400 mt-1">
                      Mise à jour : {currentOption?.fare.lastUpdated}
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Action: Buy Ticket or Book */}
                {currentOption?.fare.amount ? (
                  <div className="pt-2">
                    <button
                      onClick={() => setTicketModalOpen(true)}
                      className="w-full py-3 bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">confirmation_number</span>
                      <span>Régler ce trajet ({currentOption.fare.displayPrice})</span>
                    </button>
                  </div>
                ) : null}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Ticket Modal */}
      {ticketModalOpen && currentOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-[#006948]">confirmation_number</span>
              <h3 className="text-lg font-bold text-stone-900 mt-2">Paiement du Titre Multimodal</h3>
              <p className="text-xs text-stone-500 mt-1">
                {currentOption.title} • {origin} vers {destination}
              </p>
            </div>

            {ticketSuccess ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
                <div className="text-sm font-bold text-stone-900 mt-2">Paiement validé avec succès !</div>
                <p className="text-xs text-stone-500 mt-1">Ouverture de votre justificatif numérique...</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Montant :</span>
                    <span className="font-extrabold text-stone-900">{currentOption.fare.displayPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Source :</span>
                    <span className="font-semibold text-stone-700">{currentOption.fare.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Portefeuille :</span>
                    <span className="font-bold text-emerald-700">Solde: 2 450 FCFA</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setTicketModalOpen(false)}
                    className="py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBuyTicket}
                    className="py-2.5 rounded-xl bg-[#006948] hover:bg-[#005238] text-white font-bold transition-all shadow-md cursor-pointer"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
