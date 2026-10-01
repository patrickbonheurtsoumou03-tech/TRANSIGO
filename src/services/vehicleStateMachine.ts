import {
  VehicleStatus,
  ServiceStatus,
  GPSStatus,
  TrackingStatus,
  AvailabilityStatus,
  EffectiveStatus,
  DisplayStatus,
  GPSConnectionStatus,
} from '../types';

export interface StateMachineConfig {
  liveThresholdSeconds: number;   // default: 15s
  recentThresholdSeconds: number; // default: 60s
  staleThresholdSeconds: number;  // default: 300s (5 min)
}

export const DEFAULT_STATE_MACHINE_CONFIG: StateMachineConfig = {
  liveThresholdSeconds: 15,
  recentThresholdSeconds: 60,
  staleThresholdSeconds: 300,
};

export interface ResolveVehicleParams {
  vehicleStatus: VehicleStatus;
  serviceStatus: ServiceStatus;
  gpsStatus?: GPSStatus;
  authorization?: boolean; // Default true
  lastGpsTimestamp?: string | number | Date;
  receivedAt?: string | number | Date;
  currentTime?: string | number | Date;
  expectedGpsInterval?: number; // In seconds
}

export interface ResolvedVehicleState {
  vehicleStatus: VehicleStatus;
  serviceStatus: ServiceStatus;
  gpsStatus: GPSStatus;
  trackingStatus: TrackingStatus;
  availabilityStatus: AvailabilityStatus;
  effectiveStatus: EffectiveStatus;
  displayStatus: DisplayStatus;
  isAvailableNow: boolean;
  isTrackable: boolean;
  canCalculateEta: boolean;
  gpsAgeSeconds: number;
  lastGpsUpdateFormatted: string;
  legacyGpsStatus: GPSConnectionStatus;
  statusColor: {
    bg: string;
    text: string;
    border: string;
    ring: string;
    hex: string;
  };
  statusIcon: string;
  correctionLog?: string;
}

/**
 * TRANSIGO OFFICIAL STATE MACHINE RESOLVER
 * Resolves the unified state of a vehicle based on the official decision table.
 */
export function resolveVehicleState(
  params: ResolveVehicleParams,
  config: StateMachineConfig = DEFAULT_STATE_MACHINE_CONFIG
): ResolvedVehicleState {
  let {
    vehicleStatus,
    serviceStatus,
    gpsStatus,
    authorization = true,
    lastGpsTimestamp,
    currentTime = new Date(),
    expectedGpsInterval = 10,
  } = params;

  let correctionLog: string | undefined = undefined;

  // 1. Calculate precise GPS Age in seconds from actual recorded timestamp (Never receivedAt alone)
  const nowMs = new Date(currentTime).getTime();
  let gpsAgeSeconds = 0;

  if (lastGpsTimestamp) {
    const timestampMs = new Date(lastGpsTimestamp).getTime();
    if (!isNaN(timestampMs) && timestampMs > 0) {
      gpsAgeSeconds = Math.max(0, Math.round((nowMs - timestampMs) / 1000));
    }
  }

  // 2. Adjust live threshold dynamically if expected update interval is higher
  const effectiveLiveThreshold = Math.max(config.liveThresholdSeconds, expectedGpsInterval + 5);
  const effectiveRecentThreshold = Math.max(config.recentThresholdSeconds, expectedGpsInterval * 2);

  // 3. Compute GPS Status automatically if not explicitly given or invalid
  if (!gpsStatus) {
    if (!lastGpsTimestamp) {
      gpsStatus = 'NO_DATA';
    } else if (gpsAgeSeconds <= effectiveLiveThreshold) {
      gpsStatus = 'LIVE';
    } else if (gpsAgeSeconds <= effectiveRecentThreshold) {
      gpsStatus = 'RECENT';
    } else if (gpsAgeSeconds <= config.staleThresholdSeconds) {
      gpsStatus = 'STALE';
    } else {
      gpsStatus = 'OFFLINE';
    }
  }

  // 4. INCOMPATIBILITY CHECKS & AUTOMATIC RECTIFICATION
  // Rule: RETIRED, SUSPENDED, INACTIVE, MAINTENANCE cannot have serviceStatus = ACTIVE in passenger circulation
  if (vehicleStatus === 'RETIRED' && serviceStatus === 'ACTIVE') {
    serviceStatus = 'COMPLETED';
    correctionLog = 'Rejet incompatibilité : un véhicule RETIRED ne peut avoir un service ACTIVE. Forcé à COMPLETED.';
  } else if (vehicleStatus === 'SUSPENDED' && serviceStatus === 'ACTIVE') {
    serviceStatus = 'PAUSED';
    correctionLog = 'Rejet incompatibilité : un véhicule SUSPENDED ne peut avoir un service ACTIVE. Forcé à PAUSED.';
  } else if (vehicleStatus === 'INACTIVE' && serviceStatus === 'ACTIVE') {
    serviceStatus = 'NOT_STARTED';
    correctionLog = 'Rejet incompatibilité : un véhicule INACTIVE ne peut avoir un service ACTIVE. Forcé à NOT_STARTED.';
  }

  // 5. OFFICIAL DECISION TABLE EVALUATION
  let trackingStatus: TrackingStatus = 'NOT_TRACKABLE';
  let availabilityStatus: AvailabilityStatus = 'UNAVAILABLE';
  let effectiveStatus: EffectiveStatus = 'NO_DATA';
  let displayStatus: DisplayStatus = 'Service non démarré';
  let isAvailableNow = false;
  let isTrackable = false;
  let canCalculateEta = false;

  // PRIORITY 1: AUTHORIZATION (Without authorization, tracking is strictly disabled)
  if (!authorization) {
    trackingStatus = 'NOT_TRACKABLE';
    isTrackable = false;
    canCalculateEta = false;
  }

  // PRIORITY 2: VEHICLE ADMINISTRATIVE STATE
  if (vehicleStatus === 'RETIRED') {
    trackingStatus = 'NOT_TRACKABLE';
    availabilityStatus = 'UNAVAILABLE';
    effectiveStatus = 'RETIRED';
    displayStatus = 'Retiré du service';
  } else if (vehicleStatus === 'SUSPENDED') {
    trackingStatus = 'NOT_TRACKABLE';
    availabilityStatus = 'UNAVAILABLE';
    effectiveStatus = 'SUSPENDED';
    displayStatus = 'Suspendu';
  } else if (vehicleStatus === 'MAINTENANCE') {
    trackingStatus = 'NOT_TRACKABLE';
    availabilityStatus = 'UNAVAILABLE';
    effectiveStatus = 'MAINTENANCE';
    displayStatus = 'En maintenance';
  } else if (vehicleStatus === 'INACTIVE') {
    trackingStatus = 'NOT_TRACKABLE';
    availabilityStatus = 'UNAVAILABLE';
    effectiveStatus = 'INACTIVE';
    displayStatus = 'Inactif';
  } else if (vehicleStatus === 'REGISTERED') {
    trackingStatus = 'NOT_TRACKABLE';
    availabilityStatus = 'UNKNOWN';
    effectiveStatus = 'REGISTERED';
    displayStatus = 'Service non démarré';
  } else if (vehicleStatus === 'ACTIVE') {
    // PRIORITY 3: SERVICE STATE FOR ACTIVE VEHICLES
    if (serviceStatus === 'CANCELLED') {
      trackingStatus = 'NOT_TRACKABLE';
      availabilityStatus = 'UNAVAILABLE';
      effectiveStatus = 'SERVICE_CANCELLED';
      displayStatus = 'Service annulé';
    } else if (serviceStatus === 'COMPLETED') {
      trackingStatus = 'NOT_TRACKABLE';
      availabilityStatus = 'UNAVAILABLE';
      effectiveStatus = 'SERVICE_COMPLETED';
      displayStatus = 'Service terminé';
    } else if (serviceStatus === 'NOT_STARTED') {
      trackingStatus = 'NOT_TRACKABLE';
      availabilityStatus = 'UNKNOWN';
      effectiveStatus = 'READY_NOT_STARTED';
      displayStatus = 'Service non démarré';
    } else if (serviceStatus === 'STARTING') {
      trackingStatus = authorization ? 'TRACKABLE' : 'NOT_TRACKABLE';
      availabilityStatus = 'LIMITED';
      effectiveStatus = 'SERVICE_STARTING';
      displayStatus = 'Démarrage du service';
      isTrackable = authorization;
    } else if (serviceStatus === 'PAUSED') {
      trackingStatus = authorization ? 'TRACKABLE' : 'NOT_TRACKABLE';
      availabilityStatus = 'LIMITED';
      effectiveStatus = 'SERVICE_PAUSED';
      displayStatus = 'Service en pause';
      isTrackable = authorization;
    } else if (serviceStatus === 'ENDING') {
      trackingStatus = authorization ? 'TRACKABLE' : 'NOT_TRACKABLE';
      availabilityStatus = 'LIMITED';
      effectiveStatus = 'SERVICE_ENDING';
      displayStatus = 'Fin du service';
      isTrackable = authorization;
    } else if (serviceStatus === 'ACTIVE') {
      // PRIORITY 4 & 5: GPS FRESHNESS & VALIDITY
      if (gpsStatus === 'INVALID') {
        trackingStatus = 'NOT_TRACKABLE';
        availabilityStatus = 'LIMITED';
        effectiveStatus = 'GPS_INVALID';
        displayStatus = 'En service — GPS indisponible';
      } else if (gpsStatus === 'PERMISSION_REQUIRED') {
        trackingStatus = 'NOT_TRACKABLE';
        availabilityStatus = 'LIMITED';
        effectiveStatus = 'GPS_PERMISSION_REQUIRED';
        displayStatus = 'En service — GPS indisponible';
      } else if (gpsStatus === 'NO_DATA' || gpsStatus === 'OFFLINE') {
        trackingStatus = 'NOT_TRACKABLE';
        availabilityStatus = 'LIMITED';
        effectiveStatus = 'IN_SERVICE_NO_GPS';
        displayStatus = 'En service — GPS indisponible';
      } else if (gpsStatus === 'STALE') {
        trackingStatus = authorization ? 'TEMPORARILY_UNTRACKABLE' : 'NOT_TRACKABLE';
        availabilityStatus = 'LIMITED';
        effectiveStatus = 'IN_SERVICE_STALE';
        displayStatus = 'En service — dernière position connue';
        isTrackable = false; // Cannot follow in live realtime
        canCalculateEta = false; // ETA non garantie
      } else if (gpsStatus === 'RECENT') {
        trackingStatus = authorization ? 'TRACKABLE' : 'NOT_TRACKABLE';
        availabilityStatus = 'AVAILABLE';
        effectiveStatus = 'IN_SERVICE_RECENT';
        displayStatus = 'En service — position récente';
        isAvailableNow = true;
        isTrackable = authorization;
        canCalculateEta = authorization; // ETA calculable avec prudence
      } else if (gpsStatus === 'LIVE') {
        trackingStatus = authorization ? 'TRACKABLE' : 'NOT_TRACKABLE';
        availabilityStatus = 'AVAILABLE';
        effectiveStatus = 'IN_SERVICE_LIVE';
        displayStatus = 'En service — GPS en direct';
        isAvailableNow = true;
        isTrackable = authorization;
        canCalculateEta = authorization; // Realtime ETA fully guaranteed
      }
    }
  }

  // 6. Format human-readable age
  let lastGpsUpdateFormatted = 'GPS indisponible';
  if (lastGpsTimestamp) {
    if (gpsAgeSeconds < 10) {
      lastGpsUpdateFormatted = 'Mis à jour à l’instant';
    } else if (gpsAgeSeconds < 60) {
      lastGpsUpdateFormatted = `Mis à jour il y a ${gpsAgeSeconds}s`;
    } else if (gpsAgeSeconds < 3600) {
      const mins = Math.floor(gpsAgeSeconds / 60);
      lastGpsUpdateFormatted = `Mis à jour il y a ${mins} min`;
    } else {
      lastGpsUpdateFormatted = 'Position trop ancienne';
    }
  }

  // 7. Legacy GPS connection mapping
  let legacyGpsStatus: GPSConnectionStatus = 'unconnected';
  if (gpsStatus === 'LIVE') legacyGpsStatus = 'connected_live';
  else if (gpsStatus === 'RECENT' || gpsStatus === 'STALE') legacyGpsStatus = 'last_known';
  else if (gpsStatus === 'OFFLINE' || vehicleStatus !== 'ACTIVE') legacyGpsStatus = 'out_of_service';

  // 8. Official Design System Colors & Icons Mapping
  const statusColor = getStatusColorConfig(effectiveStatus, gpsStatus);
  const statusIcon = getStatusIcon(effectiveStatus, gpsStatus);

  return {
    vehicleStatus,
    serviceStatus,
    gpsStatus,
    trackingStatus,
    availabilityStatus,
    effectiveStatus,
    displayStatus,
    isAvailableNow,
    isTrackable,
    canCalculateEta,
    gpsAgeSeconds,
    lastGpsUpdateFormatted,
    legacyGpsStatus,
    statusColor,
    statusIcon,
    correctionLog,
  };
}

function getStatusColorConfig(effectiveStatus: EffectiveStatus, gpsStatus: GPSStatus) {
  if (effectiveStatus === 'IN_SERVICE_LIVE') {
    return {
      bg: 'bg-emerald-50',
      text: 'text-[#006948]',
      border: 'border-emerald-300',
      ring: 'ring-emerald-500/20',
      hex: '#006948',
    };
  }
  if (effectiveStatus === 'IN_SERVICE_RECENT') {
    return {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-300',
      ring: 'ring-teal-500/20',
      hex: '#0d9488',
    };
  }
  if (effectiveStatus === 'IN_SERVICE_STALE' || effectiveStatus === 'SERVICE_PAUSED' || effectiveStatus === 'SERVICE_STARTING') {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      ring: 'ring-amber-500/20',
      hex: '#f59e0b',
    };
  }
  if (effectiveStatus === 'IN_SERVICE_NO_GPS' || effectiveStatus === 'GPS_INVALID' || effectiveStatus === 'SUSPENDED') {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      ring: 'ring-rose-500/20',
      hex: '#e11d48',
    };
  }
  if (effectiveStatus === 'MAINTENANCE') {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-300',
      ring: 'ring-orange-500/20',
      hex: '#ea580c',
    };
  }
  if (effectiveStatus === 'RETIRED') {
    return {
      bg: 'bg-stone-100',
      text: 'text-stone-800',
      border: 'border-stone-400',
      ring: 'ring-stone-500/20',
      hex: '#334155',
    };
  }

  return {
    bg: 'bg-stone-50',
    text: 'text-stone-700',
    border: 'border-stone-200',
    ring: 'ring-stone-500/10',
    hex: '#64748b',
  };
}

function getStatusIcon(effectiveStatus: EffectiveStatus, gpsStatus: GPSStatus): string {
  switch (effectiveStatus) {
    case 'IN_SERVICE_LIVE':
      return 'sensors';
    case 'IN_SERVICE_RECENT':
      return 'schedule';
    case 'IN_SERVICE_STALE':
      return 'history';
    case 'IN_SERVICE_NO_GPS':
    case 'GPS_INVALID':
      return 'gps_off';
    case 'SERVICE_PAUSED':
      return 'pause_circle';
    case 'SERVICE_STARTING':
      return 'play_circle';
    case 'SERVICE_COMPLETED':
      return 'check_circle';
    case 'SERVICE_CANCELLED':
      return 'cancel';
    case 'MAINTENANCE':
      return 'build';
    case 'SUSPENDED':
      return 'do_not_disturb';
    case 'RETIRED':
      return 'archive';
    case 'READY_NOT_STARTED':
    default:
      return 'radio_button_unchecked';
  }
}

/**
 * Validates State Machine In-Memory Tests (Section 44 & 45)
 */
export function runStateMachineTests(): { pass: boolean; results: { name: string; success: boolean; details: string }[] } {
  const tests = [
    {
      name: 'ACTIVE + ACTIVE + LIVE -> IN_SERVICE_LIVE (Available, Trackable)',
      run: () => {
        const res = resolveVehicleState({
          vehicleStatus: 'ACTIVE',
          serviceStatus: 'ACTIVE',
          lastGpsTimestamp: new Date().toISOString(),
        });
        return res.effectiveStatus === 'IN_SERVICE_LIVE' && res.isAvailableNow && res.isTrackable && res.canCalculateEta;
      },
    },
    {
      name: 'ACTIVE + ACTIVE + STALE -> IN_SERVICE_STALE (Limited, Untrackable, No ETA guarantee)',
      run: () => {
        const past = new Date(Date.now() - 120000).toISOString(); // 2 mins ago
        const res = resolveVehicleState({
          vehicleStatus: 'ACTIVE',
          serviceStatus: 'ACTIVE',
          lastGpsTimestamp: past,
        });
        return res.effectiveStatus === 'IN_SERVICE_STALE' && res.availabilityStatus === 'LIMITED' && !res.isTrackable && !res.canCalculateEta;
      },
    },
    {
      name: 'MAINTENANCE + LIVE -> MAINTENANCE (Unavailable, Not Trackable)',
      run: () => {
        const res = resolveVehicleState({
          vehicleStatus: 'MAINTENANCE',
          serviceStatus: 'ACTIVE',
          lastGpsTimestamp: new Date().toISOString(),
        });
        return res.effectiveStatus === 'MAINTENANCE' && res.availabilityStatus === 'UNAVAILABLE' && !res.isTrackable;
      },
    },
    {
      name: 'SUSPENDED + LIVE -> SUSPENDED (Unavailable, Not Trackable)',
      run: () => {
        const res = resolveVehicleState({
          vehicleStatus: 'SUSPENDED',
          serviceStatus: 'ACTIVE',
          lastGpsTimestamp: new Date().toISOString(),
        });
        return res.effectiveStatus === 'SUSPENDED' && res.availabilityStatus === 'UNAVAILABLE' && !res.isTrackable;
      },
    },
    {
      name: 'RETIRED + ACTIVE -> RETIRED (Rejection & Incompatibility rectified)',
      run: () => {
        const res = resolveVehicleState({
          vehicleStatus: 'RETIRED',
          serviceStatus: 'ACTIVE',
          lastGpsTimestamp: new Date().toISOString(),
        });
        return res.effectiveStatus === 'RETIRED' && res.availabilityStatus === 'UNAVAILABLE' && !res.isTrackable;
      },
    },
    {
      name: 'ACTIVE + NOT_STARTED + LIVE -> READY_NOT_STARTED (Not available for now)',
      run: () => {
        const res = resolveVehicleState({
          vehicleStatus: 'ACTIVE',
          serviceStatus: 'NOT_STARTED',
          lastGpsTimestamp: new Date().toISOString(),
        });
        return res.effectiveStatus === 'READY_NOT_STARTED' && !res.isAvailableNow && !res.isTrackable;
      },
    },
  ];

  const results = tests.map((t) => {
    try {
      const success = t.run();
      return { name: t.name, success, details: success ? 'OK' : 'ÉCHEC assertion' };
    } catch (err: any) {
      return { name: t.name, success: false, details: err.message || 'Erreur exception' };
    }
  });

  const pass = results.every((r) => r.success);
  return { pass, results };
}
