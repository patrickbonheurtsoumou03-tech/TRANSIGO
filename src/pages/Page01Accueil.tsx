import React, { useState, useEffect } from 'react';
import { PageId, TransportMode, BoardingPoint, Vehicle } from '../types';
import { gpsSimulator } from '../services/gpsSimulator';
import {
  DEMO_BOARDING_POINTS,
  DEMO_GEO_PLACES,
  DEMO_VEHICLES,
  OFFICIAL_FARE_BUS,
  OFFICIAL_FARE_COASTER,
  INDICATIVE_FARE_TAXI
} from '../data/demoData';
import { findNearbyTransports, NearbyVehicle } from '../services/multimodalRouter';
import { smartFavoritesService } from '../services/smartFavoritesService';
import { TransigoGoModal } from '../components/TransigoGoModal';
import { UserReportModal } from '../components/UserReportModal';
import { TransigoLogo } from '../components/TransigoLogo';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';
import { REAL_CAROUSEL_SLIDES } from '../data/vehiclePhotos';

interface Page01Props {
  onNavigate: (page: PageId, params?: any) => void;
  onOpenOnboarding?: () => void;
}

export const Page01Accueil: React.FC<Page01Props> = ({ onNavigate, onOpenOnboarding }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMode, setSelectedMode] = useState<TransportMode | 'all'>('all');
  
  // Modals state
  const [goModalOpen, setGoModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Geolocation state (Step 1 of Prompt)
  const [userLocationName, setUserLocationName] = useState<string>('Total Bacongo (Quai Central)');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: -4.2882,
    longitude: 15.2514
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsAccuracyText, setGpsAccuracyText] = useState<string>('Position GPS détectée (Précision ±12m)');

  // Destination search state (Step 2 of Prompt)
  const [destinationQuery, setDestinationQuery] = useState<string>('Rond-Point Moungali (Terminus)');
  const [suggestionsOpen, setSuggestionsOpen] = useState<boolean>(false);

  // Proximity Radar Modal ("Y a-t-il un transport près de moi ?" - Step 11)
  const [nearbyModalOpen, setNearbyModalOpen] = useState<boolean>(false);
  const [nearbyList, setNearbyList] = useState<NearbyVehicle[]>([]);
  const [nearbyFilterMode, setNearbyFilterMode] = useState<TransportMode | 'all'>('all');

  // "Trouver un transport" tab state (Step 17)
  const [findModeTab, setFindModeTab] = useState<'bus' | 'coaster' | 'taxi'>('bus');

  // Live vehicles from simulator
  const [vehicles, setVehicles] = useState<Vehicle[]>(gpsSimulator.getVehicles());

  // Smart favorites
  const favorites = smartFavoritesService.getFavorites();

  useEffect(() => {
    const unsub = gpsSimulator.subscribe((list) => {
      setVehicles([...list]);
    });
    return () => unsub();
  }, []);

  // Update nearby list when opening modal or on simulator update
  useEffect(() => {
    if (nearbyModalOpen) {
      const modeArg = nearbyFilterMode === 'all' ? undefined : nearbyFilterMode;
      const res = findNearbyTransports(userCoords.latitude, userCoords.longitude, modeArg);
      setNearbyList(res);
    }
  }, [nearbyModalOpen, nearbyFilterMode, vehicles, userCoords]);

  const slidesData = REAL_CAROUSEL_SLIDES.map((slide) => ({
    title: slide.title,
    subtext: slide.subtitle,
    bgGradient: 'from-[#006948]/90 via-[#131b2e]/70 to-[#131b2e]/90',
    tag: slide.category,
    tagLabel: slide.category,
    image: slide.imageUrl,
    route: slide.route,
  }));

  // Auto carousel rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slidesData.length]);

  // Request browser geolocation (Step 1)
  const handleDetectGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setUserLocationName('Position GPS précise (Détectée)');
          setGpsAccuracyText(`Précision : ±${Math.round(pos.coords.accuracy)}m • Brazzaville`);
        },
        () => {
          setIsLocating(false);
          setUserLocationName('Total Bacongo (Quai Central)');
          setGpsAccuracyText('Localisation par défaut (Brazzaville Sud)');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Submit Point A -> Point B Search (Step 3)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationQuery.trim()) return;

    onNavigate('itineraires', {
      origin: userLocationName,
      destination: destinationQuery.trim(),
      userCoords,
      preferredMode: selectedMode
    });
  };

  const handleFavoriteClick = (origin: string, destination: string) => {
    onNavigate('itineraires', {
      origin,
      destination,
      userCoords
    });
  };

  const openNearbyRadar = (modeFilter: TransportMode | 'all' = 'all') => {
    setNearbyFilterMode(modeFilter);
    setNearbyModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full font-sans bg-stone-50 pb-20">
      
      {/* 1. HERO SLIDER SECTION WITH MULTIMODAL PROMISE */}
      <section className="relative w-full overflow-hidden bg-[#131b2e] min-h-[580px] lg:min-h-[640px] flex items-center">
        {slidesData.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${slide.bgGradient}`} />
          </div>
        ))}

        {/* Hero Overlay Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col justify-between">
          <div className="max-w-3xl flex flex-col gap-4">
            
            {/* Official Logo Brand Lockup */}
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white p-1.5 shadow-xl flex items-center justify-center shrink-0">
                <TransigoLogo size="custom" className="h-full w-full" />
              </div>
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 w-fit text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                    Plateforme de Mobilité Multimodale • Grand Brazzaville
                  </span>
                </div>
                <span className="text-xs text-emerald-300 font-semibold mt-1">
                  Logo Officiel • Votre itinéraire, notre priorité
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {slidesData[currentSlide].title}
            </h1>

            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl leading-relaxed drop-shadow">
              {slidesData[currentSlide].subtext}
            </p>

            {/* Section 1 & 27: Prominent TRANSIGO GO Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setGoModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-stone-950 font-black text-base shadow-xl shadow-emerald-950/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span className="px-2 py-0.5 rounded-lg bg-stone-950 text-emerald-300 text-xs font-black">
                  GO
                </span>
                <span>LANCER TRANSIGO GO</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => onNavigate('passager')}
                className="px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Planifier un itinéraire</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3.5 py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500/35 text-red-200 font-bold text-xs backdrop-blur-md border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Signaler un incident sur la voie ou un bus"
              >
                <span className="material-symbols-outlined text-[18px] text-red-400">report_problem</span>
                <span>Signaler un problème</span>
              </button>
            </div>

            {/* Multimodal Modes Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider mr-1">Modes actifs :</span>
              <button
                onClick={() => openNearbyRadar('bus')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-300">directions_bus</span>
                Trouver un Bus
              </button>
              <button
                onClick={() => openNearbyRadar('coaster')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-300">airport_shuttle</span>
                Trouver un Coaster
              </button>
              <button
                onClick={() => openNearbyRadar('taxi')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-sky-300">local_taxi</span>
                Trouver un Taxi
              </button>
            </div>

            {/* Slide Navigation Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-2xl">
              {slidesData.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`text-left p-2 rounded-xl transition-all flex flex-col gap-0.5 backdrop-blur-md cursor-pointer ${
                    idx === currentSlide
                      ? 'bg-white text-stone-900 shadow-lg ring-2 ring-emerald-400'
                      : 'bg-white/20 text-white hover:bg-white/35'
                  }`}
                >
                  <span
                    className={`text-[9px] uppercase font-extrabold tracking-wider ${
                      idx === currentSlide ? 'text-[#006948]' : 'text-emerald-200'
                    }`}
                  >
                    {slide.tag}
                  </span>
                  <span className="text-xs font-bold truncate">{slide.tagLabel}</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE MAIN PASSENGER JOURNEY WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 -mt-12 mb-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 flex flex-col gap-6">
          
          {/* Top Bar: Geolocation Status & Quick Radar Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-xl">near_me</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                    Étape 1 • Votre Localisation
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="text-sm font-extrabold text-stone-900 mt-0.5">
                  {userLocationName}
                </div>
                <div className="text-[11px] text-stone-500">{gpsAccuracyText}</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Actualiser ma position GPS"
              >
                <span className={`material-symbols-outlined text-base ${isLocating ? 'animate-spin' : ''}`}>
                  my_location
                </span>
                <span>{isLocating ? 'Détection...' : 'Ma position'}</span>
              </button>

              <button
                type="button"
                onClick={() => openNearbyRadar('all')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">radar</span>
                <span>Autour de moi</span>
              </button>

              <button
                type="button"
                onClick={() => setGoModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer animate-go-pulse active:scale-95"
                title="Départ immédiat en 1 clic (TRANSIGO GO)"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>GO</span>
              </button>
            </div>
          </div>

          {/* Section 10: Smart Favorites 1-Click Bar */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-amber-500">star</span>
              <span>Favoris intelligents (1 clic pour démarrer) :</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => handleFavoriteClick(fav.originPlace, fav.destinationPlace)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-200/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">
                    {fav.icon}
                  </span>
                  <span>{fav.label}</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    ({fav.destinationPlace})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Multimodal Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              
              {/* Origin */}
              <div className="lg:col-span-5 relative">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Point de départ (Position actuelle ou lieu)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">
                    my_location
                  </span>
                  <input
                    type="text"
                    value={userLocationName}
                    onChange={(e) => setUserLocationName(e.target.value)}
                    placeholder="Ex: Total Bacongo, Rond-Point Moungali..."
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#006948] focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="lg:col-span-5 relative">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Je veux aller à : (Arrêt, quartier, marché, carrefour)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">
                    location_on
                  </span>
                  <input
                    type="text"
                    value={destinationQuery}
                    onFocus={() => setSuggestionsOpen(true)}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      setSuggestionsOpen(true);
                    }}
                    placeholder="Taper un lieu, quartier ou point connu..."
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#006948] focus:bg-white outline-none"
                    required
                  />

                  {/* Suggestion Dropdown with REAL Configured Locations */}
                  {suggestionsOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-40 max-h-64 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Lieux & Points de Prise en Charge Homologués
                      </div>
                      {DEMO_GEO_PLACES.map((geo) => (
                        <button
                          key={geo.id}
                          type="button"
                          onClick={() => {
                            setDestinationQuery(geo.name);
                            setSuggestionsOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs flex items-center justify-between text-stone-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-stone-400 text-base">pin_drop</span>
                            <div>
                              <div className="font-bold text-stone-900">{geo.name}</div>
                              <div className="text-[10px] text-stone-500">{geo.district} • Brazzaville</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Vérifié
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="lg:col-span-2 pt-4 lg:pt-5">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#006948] hover:bg-[#005238] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">route</span>
                  <span>Calculer</span>
                </button>
              </div>
            </div>

            {/* Mode selection filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-bold text-[11px]">Filtrer le mode :</span>
                {(['all', 'bus', 'coaster', 'minibus', 'taxi'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMode(m)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                      selectedMode === m
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {m === 'all'
                      ? 'Tous les modes'
                      : m === 'bus'
                      ? 'Bus'
                      : m === 'coaster'
                      ? 'Coaster'
                      : m === 'minibus'
                      ? 'Minibus'
                      : 'Taxi'}
                  </button>
                ))}
              </div>

              {/* Reliability Indicator Badge */}
              <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  GPS en direct
                </span>
                <span className="flex items-center gap-1 font-semibold text-stone-700">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                  Tarifs vérifiés (DGTTMU)
                </span>
              </div>
            </div>

          </form>

        </div>
      </section>

      {/* 3. MULTIMODAL COMPARISON CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold text-[#006948] uppercase tracking-wider">
              Multimodalité Réelle à Brazzaville
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900 mt-0.5">
              Les différents moyens de transport disponibles
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              TRANSIGO ne favorise pas un transport unique. Choisissez selon la rapidité, le confort ou le budget parmi les données réelles configurées.
            </p>
          </div>

          <button
            onClick={() => onNavigate('carte-gps')}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5 w-fit"
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>Voir toute la flotte sur la carte</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Bus */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  BUS URBAIN STPU
                </span>
                <span className="text-emerald-700 font-extrabold text-sm">150 FCFA</span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900 mb-1">
                Lignes Structurantes Réglementées
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Circule sur les grands corridors (Bifouiti, Kintélé, Bacongo, Talangaï). Arrêts avec abribus et correspondance officielle.
              </p>
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                  <span>Suivi GPS en direct (BUS-DEMO-001)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                  <span>Tarif officiel homologué : 150 FCFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                  <span>PMR & Climatisation active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => openNearbyRadar('bus')}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <span>Trouver un Bus STPU proche</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          {/* Card Coaster */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                  COASTER & MINIBUS
                </span>
                <span className="text-amber-800 font-extrabold text-sm">150 FCFA</span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900 mb-1">
                Transport Collectif Semi-Formel
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Toyota Coaster 30 places et Hiace 18 places. Points de montée aux grands carrefours et terminus populaires.
              </p>
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base">check_circle</span>
                  <span>Fréquence rapide aux heures de pointe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base">check_circle</span>
                  <span>Arrêts aux points de montée locaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base">check_circle</span>
                  <span>Tarif réglementé standard : 150 FCFA</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => openNearbyRadar('coaster')}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <span>Trouver un Coaster / Minibus</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          {/* Card Taxi */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
                  TAXIS 100/100
                </span>
                <span className="text-sky-800 font-extrabold text-sm">700 - 1 500 FCFA</span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900 mb-1">
                Course Directe Porte-à-Porte
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Taxis urbains vert et blanc traditionnels. Prise en charge immédiate pour les trajets directs ou les urgences.
              </p>
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-base">check_circle</span>
                  <span>Trajet direct sans arrêt intermédiaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-base">info</span>
                  <span>Tarif indicatif négocié selon la distance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-base">check_circle</span>
                  <span>Disponibles aux stations et carrefours</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => openNearbyRadar('taxi')}
              className="mt-6 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <span>Trouver un Taxi à proximité</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Floating GO Trigger on Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden">
        <button
          onClick={() => setGoModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-[#006948] text-white font-black text-sm shadow-2xl flex items-center gap-2 border-2 border-emerald-400 animate-bounce"
        >
          <span className="px-1.5 py-0.5 rounded bg-white text-emerald-900 text-xs font-black">
            GO
          </span>
          <span>TRANSIGO GO</span>
        </button>
      </div>

      {/* Modals */}
      <TransigoGoModal
        isOpen={goModalOpen}
        onClose={() => setGoModalOpen(false)}
        onNavigate={onNavigate}
        userCoords={userCoords}
      />

      <UserReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultPlaceOrLine={userLocationName}
      />

      {/* Proximity Radar Modal ("Autour de moi") */}
      {nearbyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 p-6 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">radar</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-stone-900">
                      Transports en direct autour de vous
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      GPS Actif
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Position de référence : <strong>{userLocationName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNearbyModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Filter by Mode in Modal */}
            <div className="flex items-center gap-1.5 py-3 border-b border-stone-100 overflow-x-auto">
              {(['all', 'bus', 'coaster', 'minibus', 'taxi'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setNearbyFilterMode(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    nearbyFilterMode === m
                      ? 'bg-[#006948] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {m === 'all' ? 'Tous' : m.toUpperCase()}
                </button>
              ))}
            </div>

            {/* List of Vehicles */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {nearbyList.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  Aucun véhicule connecté détecté dans ce rayon.
                </div>
              ) : (
                nearbyList.map((item) => {
                  const v = item.vehicle;

                  return (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-sm shrink-0">
                          <span className="material-symbols-outlined text-xl text-emerald-800">
                            {v.mode === 'bus' ? 'directions_bus' : v.mode === 'coaster' ? 'airport_shuttle' : 'local_taxi'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-900 text-sm">{v.id}</span>
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[10px] font-bold">
                              {v.plate}
                            </span>
                            <VehicleStatusBadge
                              vehicle={v}
                              vehicleStatus={v.vehicleStatus}
                              serviceStatus={v.serviceStatus}
                              gpsStatus={v.gpsStatus}
                              lastGpsTimestamp={v.lastGpsTimestamp || v.lastGpsUpdate}
                              size="xs"
                              showAge={true}
                            />
                          </div>

                          <div className="text-stone-700 font-semibold mt-1">
                            {v.lineName} • Direction : <strong className="text-stone-900">{v.direction}</strong>
                          </div>

                          <div className="text-stone-500 text-[11px] mt-0.5">
                            Prochain arrêt : {v.nextStop} • Vitesse : {v.speed} km/h
                          </div>
                        </div>
                      </div>

                      {/* Distance & ETA Badge */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        <div className="text-emerald-700 font-extrabold text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">near_me</span>
                          {item.distanceKmText}
                        </div>
                        <div className="text-[11px] font-bold text-stone-600">
                          ETA ≈ {item.etaMinutes} min
                        </div>
                        <button
                          onClick={() => {
                            setNearbyModalOpen(false);
                            onNavigate('carte-gps', { vehicleId: v.id });
                          }}
                          className="mt-1 text-[11px] font-bold text-[#006948] hover:underline cursor-pointer"
                        >
                          Suivre sur la carte
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="pt-3 border-t border-stone-100 text-center text-[11px] text-stone-400">
              Seuls les véhicules connectés avec transmission GPS active sont localisables en temps réel.
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
