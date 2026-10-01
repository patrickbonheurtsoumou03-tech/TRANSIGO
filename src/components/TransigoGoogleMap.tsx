import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Vehicle } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

interface TransigoGoogleMapProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  onSelectVehicle: (v: Vehicle) => void;
  showStops: boolean;
  showTraffic: boolean;
}

export const TransigoGoogleMap: React.FC<TransigoGoogleMapProps> = ({
  vehicles,
  activeVehicle,
  onSelectVehicle,
}) => {
  // Try environment key, then fallback to Firebase config API key
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    firebaseConfig.apiKey ||
    '';

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  const defaultCenter = activeVehicle
    ? { lat: activeVehicle.latitude, lng: activeVehicle.longitude }
    : { lat: -4.2634, lng: 15.2429 }; // Brazzaville center

  return (
    <div className="w-full h-full relative min-h-[500px]">
      <APIProvider apiKey={apiKey} language="fr" region="CG">
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          mapTypeId={mapType}
        >
          {vehicles.map((v) => {
            const isLive = v.gpsStatus === 'LIVE';
            const isRecent = v.gpsStatus === 'RECENT';
            const isStale = v.gpsStatus === 'STALE';
            const isSelected = activeVehicle?.id === v.id;

            const pinBg = isLive
              ? '#10b981'
              : isRecent
              ? '#059669'
              : isStale
              ? '#f59e0b'
              : '#64748b';

            return (
              <AdvancedMarker
                key={v.id}
                position={{ lat: v.latitude, lng: v.longitude }}
                onClick={() => onSelectVehicle(v)}
                title={`${v.id} (${v.plate}) - ${v.lineName}`}
              >
                <div className="flex flex-col items-center cursor-pointer group">
                  <div
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white shadow-md mb-1 whitespace-nowrap transition-transform ${
                      isSelected
                        ? 'bg-stone-900 border border-emerald-400 scale-110 ring-2 ring-emerald-400'
                        : 'bg-stone-900/90'
                    }`}
                  >
                    {v.id} • {v.speed} km/h
                  </div>
                  <Pin
                    background={pinBg}
                    borderColor={isSelected ? '#ffffff' : '#1e293b'}
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.25 : 1.0}
                  />
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Map Type Switcher Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-stone-900/90 backdrop-blur-md rounded-xl p-1 border border-stone-700 shadow-xl">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapType === 'roadmap'
              ? 'bg-[#006948] text-white shadow-xs'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          Plan
        </button>
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapType === 'hybrid'
              ? 'bg-[#006948] text-white shadow-xs'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Live Brazzaville Overlay Badge */}
      <div className="absolute bottom-4 left-4 z-20 bg-stone-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-700 shadow-xl flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <div className="text-xs">
          <div className="font-extrabold text-white">Google Maps Platform • Brazzaville</div>
          <div className="text-stone-400 text-[10px]">
            {vehicles.filter((v) => v.gpsStatus === 'LIVE').length} bus en direct actif
          </div>
        </div>
      </div>
    </div>
  );
};
