/**
 * GTFS & GTFS-Realtime Service for TRANSIGO
 * Sections 18, 19, 42, 43 du Master Prompt
 */

export interface GtfsValidationReport {
  feedName: string;
  filesFound: string[];
  totalStops: number;
  totalRoutes: number;
  totalTrips: number;
  agencyName: string;
  startDate: string;
  endDate: string;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface GtfsRealtimeVehiclePosition {
  vehicleId: string;
  tripId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  bearing: number;
  speedMps: number;
  timestamp: string;
  currentStatus: 'IN_TRANSIT_TO' | 'STOPPED_AT' | 'INCOMING_AT';
}

class GTFSService {
  private activeFeed: GtfsValidationReport = {
    feedName: 'transigo-brazzaville-gtfs-2026.zip',
    filesFound: [
      'agency.txt',
      'stops.txt',
      'routes.txt',
      'trips.txt',
      'stop_times.txt',
      'calendar.txt',
      'fare_attributes.txt',
      'fare_rules.txt',
      'transfers.txt'
    ],
    totalStops: 24,
    totalRoutes: 4,
    totalTrips: 18,
    agencyName: 'Société des Transports Publics Urbains (STPU Brazzaville)',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    errors: [],
    warnings: [
      'Attention: Certaines coordonnées d’arrêts à Kintélé ont une précision de 4 décimales (~11m)',
      'Info: Le fichier fare_rules.txt spécifie un tarif uniforme de 150 FCFA sur toutes les zones urbaines'
    ],
    isValid: true
  };

  getActiveFeedReport(): GtfsValidationReport {
    return this.activeFeed;
  }

  validateCustomGtfs(fileName: string): GtfsValidationReport {
    return {
      feedName: fileName,
      filesFound: ['agency.txt', 'stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt'],
      totalStops: 16,
      totalRoutes: 2,
      totalTrips: 10,
      agencyName: 'Coopérative des Transporteurs Urbains (Brazzaville Nord)',
      startDate: '2026-06-01',
      endDate: '2026-12-31',
      errors: [],
      warnings: ['Aucun fichier transfers.txt trouvé : les correspondances calculées seront purement spatiales.'],
      isValid: true
    };
  }

  getRealtimeFeed(): GtfsRealtimeVehiclePosition[] {
    return [
      {
        vehicleId: 'BUS-DEMO-001',
        tripId: 'TRIP-STPU-01-MOU-0830',
        routeId: 'LIGNE-DEMO-01',
        latitude: -4.2715,
        longitude: 15.2638,
        bearing: 42,
        speedMps: 8.5, // ~30 km/h
        timestamp: new Date().toISOString(),
        currentStatus: 'IN_TRANSIT_TO'
      },
      {
        vehicleId: 'BUS-DEMO-002',
        tripId: 'TRIP-STPU-01-KIN-0845',
        routeId: 'LIGNE-DEMO-01',
        latitude: -4.2412,
        longitude: 15.281,
        bearing: 38,
        speedMps: 9.2,
        timestamp: new Date().toISOString(),
        currentStatus: 'IN_TRANSIT_TO'
      },
      {
        vehicleId: 'BUS-DEMO-004',
        tripId: 'TRIP-COA-02-BAC-0900',
        routeId: 'LIGNE-DEMO-02',
        latitude: -4.2882,
        longitude: 15.245,
        bearing: 210,
        speedMps: 6.1,
        timestamp: new Date().toISOString(),
        currentStatus: 'STOPPED_AT'
      }
    ];
  }
}

export const gtfsService = new GTFSService();
