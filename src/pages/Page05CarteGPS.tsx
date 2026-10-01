import React, { useState, useEffect } from 'react';
import { PageId, Vehicle, TransportMode, GPSStatus } from '../types';
import { DEMO_BOARDING_POINTS } from '../data/demoData';
import { gpsSimulator } from '../services/gpsSimulator';
import { TransigoGoogleMap } from '../components/TransigoGoogleMap';

interface Page05Props {
  onNavigate: (page: PageId, params?: any) => void;
  selectedVehicleId?: string;
}

export const Page05CarteGPS: React.FC<Page05Props> = ({ onNavigate, selectedVehicleId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(gpsSimulator.getVehicles());
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [selectedModeFilter, setSelectedModeFilter] = useState<TransportMode | 'ALL'>('ALL');
  const [selectedGpsStateFilter, setSelectedGpsStateFilter] = useState<string>('ALL');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<string>('');
  const [showStops, setShowStops] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showMyPosition, setShowMyPosition] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapEngine, setMapEngine] = useState<'google' | 'radar'>('google');

  useEffect(() => {
    const unsubscribe = gpsSimulator.subscribe((updated) => {
      setVehicles([...updated]);
      if (activeVehicle) {
        const found = updated.find((v) => v.id === activeVehicle.id);
        if (found) setActiveVehicle(found);
      }
    });

    if (selectedVehicleId) {
      const v = gpsSimulator.getVehicle(selectedVehicleId);
      if (v) setActiveVehicle(v);
    } else {
      setActiveVehicle(gpsSimulator.getVehicles()[0]);
    }

    return () => unsubscribe();
  }, [selectedVehicleId]);

  // Coordinate projection from Brazzaville GPS (-4.23 to -4.31 Lat, 15.22 to 15.31 Lng) to SVG viewBox (0 0 1000 700)
  const projectCoords = (lat: number, lng: number) => {
    const minLat = -4.31;
    const maxLat = -4.22;
    const minLng = 15.22;
    const maxLng = 15.31;

    const x = ((lng - minLng) / (maxLng - minLng)) * 860 + 70;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 580 + 60;
    return { x, y };
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchMode = selectedModeFilter === 'ALL' || v.mode === selectedModeFilter;
    const matchGpsState =
      selectedGpsStateFilter === 'ALL' ||
      (selectedGpsStateFilter === 'LIVE' && v.gpsStatus === 'LIVE') ||
      (selectedGpsStateFilter === 'RECENT' && v.gpsStatus === 'RECENT') ||
      (selectedGpsStateFilter === 'STALE' && v.gpsStatus === 'STALE') ||
      (selectedGpsStateFilter === 'OFFLINE' && (v.gpsStatus === 'OFFLINE' || v.vehicleStatus !== 'ACTIVE'));

    const matchSearch =
      !vehicleSearchQuery ||
      v.id.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      v.plate.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      v.lineName.toLowerCase().includes(vehicleSearchQuery.toLowerCase());

    return matchMode && matchGpsState && matchSearch;
  });

  return (
    <div className="w-full min-h-screen bg-stone-900 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Top Map Control Bar */}
      <div className="bg-stone-950/95 backdrop-blur-md border-b border-stone-800 z-30 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('accueil')}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
            title="Retour à l'accueil"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Supervision Multimodale & Télémétrie GPS
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="px-2 py-0.5 rounded-sm bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                MACHINE D'ÉTATS OFFICIELLE
              </span>
              <span>•</span>
              <span>Agglomération de Brazzaville</span>
            </div>
          </div>
        </div>

        {/* Vehicle Search Bar */}
        <div className="relative w-48 sm:w-60">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-base">
            search
          </span>
          <input
            type="text"
            value={vehicleSearchQuery}
            onChange={(e) => setVehicleSearchQuery(e.target.value)}
            placeholder="Rechercher bus (ex: BUS-001)..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-400 outline-none focus:border-emerald-500"
          />
        </div>

        {/* State Machine Hierarchy Filters (Section 39) */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800 overflow-x-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'LIVE', label: 'GPS Live (≤15s)', color: 'bg-emerald-500' },
            { id: 'RECENT', label: 'Récent (≤60s)', color: 'bg-teal-500' },
            { id: 'STALE', label: 'Dernière position', color: 'bg-amber-500' },
            { id: 'OFFLINE', label: 'Hors Ligne', color: 'bg-rose-500' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedGpsStateFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedGpsStateFilter === f.id
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {f.color && <span className={`w-2 h-2 rounded-full ${f.color}`} />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800 overflow-x-auto text-xs font-bold">
          {(['ALL', 'bus', 'coaster', 'minibus', 'taxi'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModeFilter(m)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedModeFilter === m
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {m === 'ALL' ? 'Tous Modes' : m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowMyPosition(!showMyPosition)}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
              showMyPosition
                ? 'bg-stone-800 border-emerald-500/50 text-emerald-300'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
            Moi (Bacongo)
          </button>

          <button
            onClick={() => setShowStops(!showStops)}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
              showStops
                ? 'bg-stone-800 border-emerald-500/50 text-emerald-300'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">signpost</span>
            Arrêts
          </button>

          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
              showTraffic
                ? 'bg-stone-800 border-amber-500/50 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">traffic</span>
            Trafic
          </button>

          {/* Google Maps Platform vs Radar Engine Switcher */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 ml-auto">
            <button
              onClick={() => setMapEngine('google')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapEngine === 'google'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">map</span>
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapEngine('radar')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapEngine === 'radar'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">radar</span>
              <span>Radar Transit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative flex-1 w-full bg-[#121815] overflow-hidden flex items-center justify-center select-none">
        {mapEngine === 'google' ? (
          <TransigoGoogleMap
            vehicles={filteredVehicles}
            activeVehicle={activeVehicle}
            onSelectVehicle={(v) => setActiveVehicle(v)}
            showStops={showStops}
            showTraffic={showTraffic}
          />
        ) : (
          /* SVG Interactive Map Container */
          <div
            className="w-full h-full relative transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full max-h-[calc(100vh-140px)] drop-shadow-2xl"
            style={{ backgroundColor: '#101714' }}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2923" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d324d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1a4c6e" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <rect width="1000" height="700" fill="url(#grid)" />

            {/* Fleuve Congo */}
            <path
              d="M 820,0 C 800,150 780,300 810,450 C 840,580 870,640 920,700 L 1000,700 L 1000,0 Z"
              fill="url(#riverGradient)"
            />
            <text
              x="890"
              y="240"
              fill="#6ba4cd"
              fontSize="13"
              fontWeight="bold"
              letterSpacing="3"
              transform="rotate(75, 890, 240)"
            >
              FLEUVE CONGO
            </text>

            {/* District Labels */}
            <text x="210" y="580" fill="#3b5947" fontSize="16" fontWeight="bold" letterSpacing="1">
              BACONGO
            </text>
            <text x="140" y="640" fill="#3b5947" fontSize="14" fontWeight="bold" letterSpacing="1">
              MAKÉLÉKÉLÉ
            </text>
            <text x="440" y="490" fill="#3b5947" fontSize="16" fontWeight="bold" letterSpacing="1">
              POTO-POTO
            </text>
            <text x="360" y="320" fill="#3b5947" fontSize="16" fontWeight="bold" letterSpacing="1">
              MOUNGALI
            </text>
            <text x="560" y="270" fill="#3b5947" fontSize="16" fontWeight="bold" letterSpacing="1">
              OUENZÉ
            </text>
            <text x="480" y="110" fill="#3b5947" fontSize="16" fontWeight="bold" letterSpacing="1">
              TALANGAÏ
            </text>
            <text x="310" y="90" fill="#3b5947" fontSize="14" fontWeight="bold" letterSpacing="1">
              MIKALOU
            </text>
            <text
              x="550"
              y="460"
              fill="#4d725d"
              fontSize="15"
              fontWeight="extrabold"
              letterSpacing="1"
            >
              CENTRE-VILLE
            </text>

            {/* Arteries & Roads */}
            <path
              d="M 230,660 Q 320,490 400,340 T 480,180 T 490,50"
              fill="none"
              stroke={showTraffic ? '#22c55e' : '#2f4035'}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M 400,340 L 640,430 L 760,450"
              fill="none"
              stroke={showTraffic ? '#eab308' : '#2f4035'}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 200,600 L 530,520 L 720,480"
              fill="none"
              stroke="#2f4035"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* BoardingPoints rendering */}
            {showStops &&
              DEMO_BOARDING_POINTS.map((bp) => {
                const { x, y } = projectCoords(bp.latitude, bp.longitude);
                return (
                  <g key={bp.id} className="cursor-pointer group">
                    <circle cx={x} cy={y} r="6" fill="#1c1917" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={x} cy={y} r="2.5" fill="#006948" />
                    <text
                      x={x + 10}
                      y={y + 4}
                      fill="#e7e5e4"
                      fontSize="10"
                      fontWeight="600"
                      className="opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      {bp.name}
                    </text>
                  </g>
                );
              })}

            {/* User Location Marker with proximity radar rings */}
            {showMyPosition && (() => {
               const { x, y } = projectCoords(-4.2882, 15.2514);
               return (
                 <g transform={`translate(${x}, ${y})`} className="cursor-pointer">
                   <circle r="45" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                   <circle r="75" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
                   <circle r="14" fill="#2563eb" opacity="0.3" className="animate-ping" />
                   <circle r="9" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                   <g transform="translate(0, -18)">
                     <rect x="-42" y="-10" width="84" height="16" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
                     <text textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="9" fontWeight="bold">
                       Ma position (Bacongo)
                     </text>
                   </g>
                 </g>
               );
             })()}

            {/* Vehicles rendering: 4 Levels of Map Representation (Section 32 & 35) */}
            {filteredVehicles.map((veh) => {
              const { x, y } = projectCoords(veh.latitude, veh.longitude);
              const isSelected = activeVehicle?.id === veh.id;
              const isLive = veh.gpsStatus === 'LIVE' && veh.vehicleStatus === 'ACTIVE';
              const isRecent = veh.gpsStatus === 'RECENT' && veh.vehicleStatus === 'ACTIVE';
              const isStale = veh.gpsStatus === 'STALE';
              const isMaintenance = veh.vehicleStatus === 'MAINTENANCE';
              const isSuspended = veh.vehicleStatus === 'SUSPENDED';

              // Visual marker color based on official State Machine (Section 41)
              let markerBg = '#64748b'; // Grey default
              if (isLive) markerBg = '#006948'; // Vert LIVE
              else if (isRecent) markerBg = '#0d9488'; // Teal/Vert-bleu
              else if (isStale) markerBg = '#f59e0b'; // Jaune
              else if (isMaintenance) markerBg = '#ea580c'; // Orange
              else if (isSuspended) markerBg = '#dc2626'; // Rouge

              const modeShort = veh.mode === 'taxi' ? 'TAXI' : veh.mode === 'coaster' ? 'COAST' : 'BUS';

              return (
                <g
                  key={veh.id}
                  onClick={() => setActiveVehicle(veh)}
                  className="cursor-pointer transition-transform duration-500 ease-out"
                  transform={`translate(${x}, ${y})`}
                >
                  {/* Ping effect ONLY if live connected */}
                  {isLive && (
                    <circle r="22" fill="#22c55e" opacity="0.3" className="animate-ping" />
                  )}

                  <circle
                    r={isSelected ? '15' : '12'}
                    fill={markerBg}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Mode Label in center */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={isSelected ? '8' : '7'}
                    fontWeight="900"
                  >
                    {modeShort}
                  </text>

                  {/* Plate pill badge */}
                  <g transform={`translate(0, ${isSelected ? -22 : -18})`}>
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="18"
                      rx="4"
                      fill={isSelected ? markerBg : '#1c1917'}
                      stroke={isSelected ? '#ffffff' : '#3f3f46'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {veh.id}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        )}

        {/* Floating Zoom Controls */}
        <div className="absolute right-6 top-6 flex flex-col gap-2 z-20">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="w-10 h-10 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title="Zoomer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="w-10 h-10 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title="Dézoomer"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-10 h-10 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title="Recentrer Brazzaville"
          >
            <span className="material-symbols-outlined text-lg">center_focus_strong</span>
          </button>
        </div>

        {/* Official State Machine Legend (Section 32, 41, 43) */}
        <div className="absolute left-6 bottom-6 z-20 bg-stone-950/90 backdrop-blur-md p-4 rounded-2xl border border-stone-800 text-xs space-y-2 max-w-xs shadow-xl hidden sm:block">
          <div className="font-extrabold text-stone-200 uppercase tracking-wider text-[10px]">
            Statuts Officiels TRANSIGO
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#006948] border border-white" />
            <span className="text-stone-300">GPS en direct (≤ 15s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-600 border border-white" />
            <span className="text-stone-300">Position récente (&lt; 60s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
            <span className="text-stone-300">Dernière position connue (STALE)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white" />
            <span className="text-stone-300">GPS hors ligne (&gt; 5 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-600 border border-white" />
            <span className="text-stone-300">En maintenance atelier</span>
          </div>
        </div>

        {/* Selected Vehicle Drawer with Complete State Machine Dimensions */}
        {activeVehicle && (
          <div className="absolute right-0 sm:right-6 bottom-0 sm:bottom-6 w-full sm:w-96 bg-stone-950/95 backdrop-blur-md border border-stone-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 z-30 transition-all">
            <div className="flex items-start justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-700 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  <span className="material-symbols-outlined text-2xl">
                    {activeVehicle.mode === 'bus' ? 'directions_bus' : activeVehicle.mode === 'coaster' ? 'airport_shuttle' : 'local_taxi'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-stone-100 text-base">{activeVehicle.id}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700 font-mono">
                      {activeVehicle.plate}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {activeVehicle.operatorName}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveVehicle(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Official State Display Banner */}
            <div className="mt-3">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-white">
                    {activeVehicle.displayStatus}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-400">
                    {activeVehicle.effectiveStatus}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center gap-2">
                  <span>Âge GPS : {activeVehicle.gpsAgeSeconds}s</span>
                  <span>•</span>
                  <span>{activeVehicle.lastGpsUpdate}</span>
                </div>
              </div>
            </div>

            {/* Line & Direction */}
            <div className="mt-3 p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-400">Ligne :</span>
                <span className="font-bold text-white">{activeVehicle.lineName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Direction :</span>
                <span className="font-bold text-emerald-400">{activeVehicle.direction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Prochain arrêt :</span>
                <span className="font-semibold text-stone-200">{activeVehicle.nextStop}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-800">
                <span className="text-stone-400">Estimation ETA :</span>
                <span className={`font-bold ${activeVehicle.canCalculateEta ? 'text-emerald-400 font-mono' : 'text-amber-400 text-[11px]'}`}>
                  {activeVehicle.canCalculateEta ? activeVehicle.etaNextStop : 'ETA non garantie (GPS STALE/OFFLINE)'}
                </span>
              </div>
            </div>

            {/* Telemetry numbers if live */}
            {activeVehicle.isTrackable && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Vitesse</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">{activeVehicle.speed} km/h</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Occupation</div>
                  <div className="text-lg font-black text-white mt-0.5">{activeVehicle.occupancy.percentage}%</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center gap-2">
              <button
                onClick={() => onNavigate('vehicule', { id: activeVehicle.id })}
                className="flex-1 py-2 px-3 rounded-xl bg-[#006948] hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                Fiche Véhicule
              </button>

              <button
                onClick={() => onNavigate('itineraires', { origin: 'Total Bacongo', destination: activeVehicle.direction })}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                Itinéraire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
