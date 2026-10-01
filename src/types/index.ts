export type PageId =
  | 'accueil'
  | 'authentification'
  | 'passager'
  | 'itineraires'
  | 'carte-gps'
  | 'lignes-arrets'
  | 'profil'
  | 'chauffeur'
  | 'flotte'
  | 'vehicule'
  | 'administration'
  | 'parametres-systeme';

export type TransportMode = 'bus' | 'minibus' | 'coaster' | 'taxi' | 'marche';

// ==========================================
// TRANSIGO OFFICIAL STATE MACHINE TYPES
// ==========================================

export type VehicleStatus =
  | 'REGISTERED'  // Le véhicule existe dans TRANSIGO mais n'est pas encore opérationnel
  | 'ACTIVE'      // Le véhicule est autorisé et opérationnel
  | 'INACTIVE'    // Le véhicule est temporairement désactivé
  | 'MAINTENANCE' // Le véhicule est en maintenance
  | 'SUSPENDED'   // Le véhicule est temporairement suspendu
  | 'RETIRED';    // Le véhicule est définitivement retiré du service

export type ServiceStatus =
  | 'NOT_STARTED' // Aucun service n'a encore été démarré
  | 'STARTING'    // Le chauffeur initialise son service
  | 'ACTIVE'      // Le service de transport est officiellement en cours
  | 'PAUSED'      // Service en pause régulation
  | 'ENDING'      // Clôture du service en cours
  | 'COMPLETED'   // Service terminé normalement
  | 'CANCELLED';  // Service annulé

export type GPSStatus =
  | 'NO_DATA'             // Aucune donnée GPS reçue
  | 'PERMISSION_REQUIRED' // Autorisation GPS requise
  | 'LIVE'                // Position reçue <= seuil (ex: <= 15s)
  | 'RECENT'              // Position récente (15s < age <= 60s)
  | 'STALE'               // Dernière position connue (60s < age <= 5min)
  | 'OFFLINE'             // Aucune mise à jour depuis > 5min
  | 'INVALID';            // Coordonnées incohérentes ou erronées

export type TrackingStatus =
  | 'TRACKABLE'               // Véhicule autorisé et position exploitable
  | 'TEMPORARILY_UNTRACKABLE' // Suivi momentanément indisponible (STALE)
  | 'NOT_TRACKABLE';          // Suivi désactivé / hors service

export type AvailabilityStatus =
  | 'AVAILABLE'   // Proposé comme transport disponible maintenant
  | 'LIMITED'     // Informations limitées / incertaines
  | 'UNAVAILABLE' // Indisponible pour embarquement
  | 'UNKNOWN';    // Disponibilité non confirmée

export type EffectiveStatus =
  | 'IN_SERVICE_LIVE'
  | 'IN_SERVICE_RECENT'
  | 'IN_SERVICE_STALE'
  | 'IN_SERVICE_NO_GPS'
  | 'READY_NOT_STARTED'
  | 'SERVICE_STARTING'
  | 'SERVICE_PAUSED'
  | 'SERVICE_ENDING'
  | 'SERVICE_COMPLETED'
  | 'SERVICE_CANCELLED'
  | 'MAINTENANCE'
  | 'SUSPENDED'
  | 'INACTIVE'
  | 'RETIRED'
  | 'REGISTERED'
  | 'NO_DATA'
  | 'GPS_PERMISSION_REQUIRED'
  | 'GPS_INVALID';

export type DisplayStatus =
  | 'En service — GPS en direct'
  | 'En service — position récente'
  | 'En service — dernière position connue'
  | 'En service — GPS indisponible'
  | 'Service non démarré'
  | 'Démarrage du service'
  | 'Service en pause'
  | 'Fin du service'
  | 'Service terminé'
  | 'Service annulé'
  | 'En maintenance'
  | 'Suspendu'
  | 'Inactif'
  | 'Retiré du service';

// Legacy compatibility helper
export type GPSConnectionStatus =
  | 'connected_live' // GPS en direct
  | 'last_known'     // Dernière position connue
  | 'unconnected'    // Véhicule non connecté
  | 'out_of_service';// Véhicule hors service

export type VerificationStatus =
  | 'VERIFIED'       // Donnée officielle ou relevé certifié
  | 'UNVERIFIED'     // Donnée indicative / non vérifiée
  | 'OUTDATED'       // Donnée ancienne à actualiser
  | 'PENDING_REVIEW' // Donnée soumise en attente de validation
  | 'UNAVAILABLE';   // Donnée indisponible

export type FarePricingModel =
  | 'FIXED'          // Tarif fixe certifié
  | 'ZONE_BASED'     // Tarif par zone
  | 'ROUTE_BASED'    // Tarif calculé sur le parcours
  | 'INDICATIVE'     // Tarif indicatif / négocié
  | 'UNKNOWN';       // Tarif non disponible

export type DataSourceType =
  | 'ADMIN'
  | 'TRANSPORT_OPERATOR'
  | 'OFFICIAL_DATA'
  | 'GPS_DEVICE'
  | 'USER_REPORT'
  | 'MAPPING_PROVIDER';

export interface FareInfo {
  amount?: number;
  currency: string; // 'FCFA'
  fareType: 'fixe' | 'trajet' | 'zone' | 'indicatif' | 'indisponible';
  pricingModel?: FarePricingModel;
  displayPrice: string; // e.g. "150 FCFA", "Prix indicatif : 700 - 1 200 FCFA", "Tarif non disponible"
  effectiveFrom?: string;
  effectiveTo?: string;
  source: string;
  sourceType?: DataSourceType;
  verified: boolean;
  verificationStatus: VerificationStatus;
  confidenceScore?: number; // 0-100
  lastUpdated: string;
}

export type BoardingPointType =
  | 'arret_officiel'
  | 'station'
  | 'point_de_montee'
  | 'terminus'
  | 'carrefour'
  | 'point_local'
  | 'correspondance';

export interface BoardingPoint {
  id: string; // e.g. "POINT-DEMO-001"
  name: string;
  type: BoardingPointType;
  zone: string; // Quartier / Arrondissement (Bacongo, Moungali, etc.)
  latitude: number;
  longitude: number;
  availableModes: TransportMode[];
  lines: string[];
  directions: string[];
  landmarkNote?: string;
  status: 'ACTIF' | 'EN_TRAVAUX' | 'TEMPORAIRE';
  source: string;
  sourceType?: DataSourceType;
  verificationStatus: VerificationStatus;
  lastUpdated: string;
}

export interface GeoPlace {
  id: string;
  name: string;
  type: 'neighborhood' | 'landmark' | 'market' | 'intersection' | 'station' | 'terminal' | 'hospital' | 'school';
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  nearestBoardingPointId: string;
  walkingDistanceMeters: number;
  verificationStatus: VerificationStatus;
  source: string;
  sourceType?: DataSourceType;
}

export interface Vehicle {
  id: string; // e.g. "BUS-DEMO-001"
  plate: string;
  type: string; // e.g. "Bus Articulé Climatisé", "Toyota Coaster 30 Places", "Minibus Hiace 18 Places", "Taxi Vert & Blanc"
  mode: TransportMode;
  operatorName: string; // e.g. "STPU Brazzaville", "Coopérative Express Bacongo", "Artisans Taxis 100/100"
  capacity: { seated: number; standing: number; max: number };
  currentLoad?: number;
  routeId?: string;
  lineId: string;
  lineName: string;
  direction: string; // e.g. "Rond-Point Moungali"
  driverName: string;
  driverId?: string;

  // Official State Machine Dimensions (Unified Architecture)
  vehicleStatus: VehicleStatus;
  serviceStatus: ServiceStatus;
  gpsStatus: GPSStatus;
  trackingStatus: TrackingStatus;
  availabilityStatus: AvailabilityStatus;
  effectiveStatus: EffectiveStatus;
  displayStatus: DisplayStatus;

  // Computed Flags
  isAvailableNow: boolean;
  isTrackable: boolean;
  canCalculateEta: boolean;

  // Timestamps & Freshness
  lastGpsTimestamp: string; // ISO format or time string when GPS recorded pos
  receivedAt?: string;      // ISO format when backend ingested pos
  gpsAgeSeconds: number;   // Age in seconds

  // Legacy fields preserved for view components
  status?: 'active' | 'delayed' | 'en_course' | 'a_quai' | 'pause' | 'maintenance';
  gpsConnectionStatus: GPSConnectionStatus;
  lastGpsUpdate: string; // Formatted string: "Mis à jour il y a 8s", "Il y a 3 min", etc.

  speed: number;
  speedKmH?: number;
  heading?: number;
  latitude: number;
  longitude: number;
  nextStop: string;
  nextBoardingPointId?: string;
  etaNextStop: string;
  remainingStopsCount?: number;
  occupancy: {
    current: number;
    percentage: number;
  };
  amenities?: { ac: boolean; wifi: boolean; pmr: boolean; cctv: boolean };
  fare?: FareInfo;
  sourceType?: DataSourceType;
  verificationStatus?: VerificationStatus;
}

export interface Stop {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  lines: string[];
}

export interface Route {
  id: string;
  code: string;
  name: string;
  mode: TransportMode;
  origin: string;
  destination: string;
  category?: string;
  color: string;
  fare: string;
  fareFCFA?: number;
  fareInfo?: FareInfo;
  frequency: string;
  frequencyMinutes?: string;
  stopsCount: number;
  operatingHours: string;
  totalDistanceKm?: number;
  activeBusCount?: number;
  punctualityRate?: number;
  operatorName?: string;
  verificationStatus?: VerificationStatus;
  sourceType?: DataSourceType;
}

export interface RouteLegStep {
  type: 'walk' | 'wait' | 'ride' | 'transfer';
  mode?: TransportMode;
  instruction: string;
  distanceText?: string;
  durationText: string;
  boardingPointName?: string;
  transferDetails?: string;
  detail?: string;
}

export interface MultimodalOption {
  id: string;
  title: string;
  mode: TransportMode;
  operatorName: string;
  boardingPoint: BoardingPoint;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  transitDurationMinutes: number;
  totalDurationMinutes: number;
  stopsCount?: number;
  fare: FareInfo;
  gpsStatus: GPSStatus;
  effectiveStatus?: EffectiveStatus;
  displayStatus?: DisplayStatus;
  isTrackable?: boolean;
  canCalculateEta?: boolean;
  vehicleId?: string;
  lineCode?: string;
  direction: string;
  steps: RouteLegStep[];
  co2SavingsGrams?: number;
  ac?: boolean;
  pmr?: boolean;
  hasTransfer?: boolean;
  transferPointName?: string;
}

export interface SmartFavorite {
  id: string;
  type: 'home' | 'work' | 'school' | 'university' | 'market' | 'custom' | 'route' | 'stop';
  label: string;
  originPlace: string;
  destinationPlace: string;
  icon: string;
  badge?: string;
}

export interface ProximityAlertRule {
  id: string;
  type: 'BUS_APPROACHING_500M' | 'BUS_ARRIVING_BOARDING_POINT' | 'STOP_APPROACHING' | 'TRANSFER_REQUIRED';
  enabled: boolean;
  label: string;
  description: string;
}

export interface ActiveJourneyState {
  active: boolean;
  option: MultimodalOption;
  destinationName: string;
  currentStepIndex: number;
  startTime: string;
  etaArrivalTime: string;
  currentVehicleId?: string;
  currentVehicleSpeed: number;
  currentVehicleNextStop: string;
  distanceToBoardingMeters: number;
  remainingStops: number;
  proximityAlerts: ProximityAlertRule[];
  notificationsLog: { time: string; message: string; type: 'info' | 'approach' | 'alarm' }[];
}

export interface UserReport {
  id: string;
  category:
    | 'BUS_ABSENT'
    | 'ARRET_INCORRECT'
    | 'TARIF_DIFFERENT'
    | 'ROUTE_BLOQUEE'
    | 'GPS_INCORRECT'
    | 'VEHICULE_PANNE'
    | 'INFO_OBSOLETE'
    | 'AUTRE';
  description: string;
  reportedPlaceOrLine: string;
  authorName: string;
  authorPhone?: string;
  timestamp: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  adminDecision?: string;
  reviewerNotes?: string;
}

export interface Trip {
  id: string;
  date: string;
  departureTime?: string;
  arrivalTime?: string;
  origin: string;
  destination: string;
  mode?: TransportMode;
  lineCode: string;
  busId: string;
  priceFCFA?: number;
  paymentMethod?: string;
  ticketRef?: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  type: 'approach' | 'telemetry' | 'disruption' | 'system';
  title: string;
  message: string;
  timeAgo: string;
  badge?: string;
  read: boolean;
}

export interface GTFSFeedSummary {
  agencyName: string;
  feedVersion: string;
  routesCount: number;
  stopsCount: number;
  tripsCount: number;
  status: 'VALID' | 'WARNINGS' | 'ERROR';
  lastImported: string;
}
