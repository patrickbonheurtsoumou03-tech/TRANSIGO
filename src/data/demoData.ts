import {
  Vehicle,
  Route,
  Stop,
  Trip,
  NotificationItem,
  BoardingPoint,
  GeoPlace,
  FareInfo
} from '../types';
import { resolveVehicleState } from '../services/vehicleStateMachine';

export const OFFICIAL_FARE_BUS: FareInfo = {
  amount: 150,
  currency: 'FCFA',
  fareType: 'fixe',
  displayPrice: '150 FCFA',
  effectiveFrom: '2024-01-01',
  effectiveTo: '2026-12-31',
  source: 'Arrêté Préfectoral DGTT • République du Congo',
  verified: true,
  verificationStatus: 'VERIFIED',
  lastUpdated: '15 Janvier 2026'
};

export const OFFICIAL_FARE_COASTER: FareInfo = {
  amount: 150,
  currency: 'FCFA',
  fareType: 'trajet',
  displayPrice: '150 FCFA',
  effectiveFrom: '2024-06-01',
  effectiveTo: '2026-12-31',
  source: 'Convention Syndicale Transporteurs Urbains Brazzaville',
  verified: true,
  verificationStatus: 'VERIFIED',
  lastUpdated: '10 Février 2026'
};

export const INDICATIVE_FARE_TAXI: FareInfo = {
  currency: 'FCFA',
  fareType: 'indicatif',
  displayPrice: 'Prix indicatif : 700 - 1 500 FCFA',
  source: 'Usage local & Relevé indicatif Syndicat des Taxis (à négocier selon destination)',
  verified: false,
  verificationStatus: 'UNVERIFIED',
  lastUpdated: '20 Mars 2026'
};

export const UNAVAILABLE_FARE: FareInfo = {
  currency: 'FCFA',
  fareType: 'indisponible',
  displayPrice: 'Tarif non disponible',
  source: 'Donnée non encore homologuée par l’administration',
  verified: false,
  verificationStatus: 'PENDING_REVIEW',
  lastUpdated: 'Non renseigné'
};

// Points de prise en charge réels et repères locaux (BoardingPoints)
export const DEMO_BOARDING_POINTS: BoardingPoint[] = [
  {
    id: 'POINT-DEMO-001',
    name: 'Total Bacongo (Quai Central)',
    type: 'arret_officiel',
    zone: 'Bacongo',
    latitude: -4.2882,
    longitude: 15.2514,
    availableModes: ['bus', 'minibus', 'taxi'],
    lines: ['LIGNE-DEMO-01', 'LIGNE-DEMO-04'],
    directions: ['Direction Moungali', 'Direction Ouenzé'],
    landmarkNote: 'En face du Grand Marché Total, face à la pharmacie',
    status: 'ACTIF',
    source: 'Direction Générale des Transports Terrestres (DGTT)',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-02-14'
  },
  {
    id: 'POINT-DEMO-002',
    name: 'Carrefour Deux Poteaux',
    type: 'carrefour',
    zone: 'Poto-Poto',
    latitude: -4.2694,
    longitude: 15.2758,
    availableModes: ['bus', 'coaster', 'taxi'],
    lines: ['LIGNE-DEMO-01', 'LIGNE-DEMO-03'],
    directions: ['Direction Moungali', 'Direction Poto-Poto'],
    landmarkNote: 'Intersection Avenue de la Paix et Rue Mbaka',
    status: 'ACTIF',
    source: 'Relevé topographique homologué Mairie de Brazzaville',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-01-20'
  },
  {
    id: 'POINT-DEMO-003',
    name: 'Rond-Point Moungali (Terminus)',
    type: 'terminus',
    zone: 'Moungali',
    latitude: -4.2541,
    longitude: 15.2789,
    availableModes: ['bus', 'coaster', 'minibus', 'taxi'],
    lines: ['LIGNE-DEMO-01', 'LIGNE-DEMO-02'],
    directions: ['Direction Bacongo', 'Direction Mikalou'],
    landmarkNote: 'Pôle d’échange Rond-Point Moungali',
    status: 'ACTIF',
    source: 'Direction de la Circulation et des Transports Urbains',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-03-01'
  },
  {
    id: 'POINT-DEMO-004',
    name: 'Grand Marché Poto-Poto (Arrêt)',
    type: 'arret_officiel',
    zone: 'Poto-Poto',
    latitude: -4.2638,
    longitude: 15.2861,
    availableModes: ['bus', 'coaster', 'taxi'],
    lines: ['LIGNE-DEMO-03'],
    directions: ['Direction Talangaï', 'Direction Gare Centrale'],
    landmarkNote: 'Angle Avenue de la Paix et Rue Dahomey',
    status: 'ACTIF',
    source: 'DGTT / Arrêté Préfectoral',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-02-10'
  },
  {
    id: 'POINT-DEMO-005',
    name: 'Marché Mikalou (Terminus Nord)',
    type: 'terminus',
    zone: 'Mikalou',
    latitude: -4.2255,
    longitude: 15.2632,
    availableModes: ['bus', 'coaster'],
    lines: ['LIGNE-DEMO-02'],
    directions: ['Direction Centre-Ville (Gare)'],
    landmarkNote: 'Au niveau de la passerelle piétonne RN1',
    status: 'ACTIF',
    source: 'Opérateur STPU / Ministère des Transports',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-01-18'
  },
  {
    id: 'POINT-DEMO-006',
    name: 'Gare Centrale CFCO (Centre-Ville)',
    type: 'correspondance',
    zone: 'Centre-Ville',
    latitude: -4.2719,
    longitude: 15.2895,
    availableModes: ['bus', 'coaster', 'taxi'],
    lines: ['LIGNE-DEMO-02', 'LIGNE-DEMO-03'],
    directions: ['Direction Mikalou', 'Direction Talangaï'],
    landmarkNote: 'Parvis de la Gare CFCO, pôle d’échange multimodal',
    status: 'ACTIF',
    source: 'Communauté Urbaine de Brazzaville',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-03-12'
  },
  {
    id: 'POINT-DEMO-007',
    name: 'Rond-Point Koulounda (Ouenzé)',
    type: 'point_local',
    zone: 'Ouenzé',
    latitude: -4.2482,
    longitude: 15.2831,
    availableModes: ['minibus', 'coaster', 'taxi'],
    lines: ['LIGNE-DEMO-04'],
    directions: ['Direction Makélékélé'],
    landmarkNote: 'Carrefour Koulounda, stationnement des minibus',
    status: 'ACTIF',
    source: 'Syndicat Professionnel des Transporteurs Collectifs',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-02-28'
  },
  {
    id: 'POINT-DEMO-008',
    name: 'Pont du Djoué (Makélékélé)',
    type: 'terminus',
    zone: 'Makélékélé',
    latitude: -4.2980,
    longitude: 15.2410,
    availableModes: ['bus', 'minibus', 'taxi'],
    lines: ['LIGNE-DEMO-04'],
    directions: ['Direction Ouenzé'],
    landmarkNote: 'Tête du pont du Djoué, terminus sud',
    status: 'ACTIF',
    source: 'DGTT / Arrêté de voirie',
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-01-25'
  }
];

export const DEMO_GEO_PLACES: GeoPlace[] = [
  {
    id: 'GEO-01',
    name: 'Marché Total Bacongo',
    type: 'market',
    district: 'Bacongo',
    city: 'Brazzaville',
    latitude: -4.2882,
    longitude: 15.2514,
    nearestBoardingPointId: 'POINT-DEMO-001',
    walkingDistanceMeters: 50,
    verificationStatus: 'VERIFIED',
    source: 'Cadastre Urbain Brazzaville'
  },
  {
    id: 'GEO-02',
    name: 'Rond-Point Moungali',
    type: 'intersection',
    district: 'Moungali',
    city: 'Brazzaville',
    latitude: -4.2541,
    longitude: 15.2789,
    nearestBoardingPointId: 'POINT-DEMO-003',
    walkingDistanceMeters: 60,
    verificationStatus: 'VERIFIED',
    source: 'Cadastre Urbain Brazzaville'
  },
  {
    id: 'GEO-03',
    name: 'Gare Centrale CFCO',
    type: 'station',
    district: 'Centre-Ville',
    city: 'Brazzaville',
    latitude: -4.2719,
    longitude: 15.2895,
    nearestBoardingPointId: 'POINT-DEMO-006',
    walkingDistanceMeters: 40,
    verificationStatus: 'VERIFIED',
    source: 'Donnée officielle CFCO'
  },
  {
    id: 'GEO-04',
    name: 'Marché Mikalou',
    type: 'market',
    district: 'Mikalou',
    city: 'Brazzaville',
    latitude: -4.2255,
    longitude: 15.2632,
    nearestBoardingPointId: 'POINT-DEMO-005',
    walkingDistanceMeters: 90,
    verificationStatus: 'VERIFIED',
    source: 'Cadastre Urbain Brazzaville'
  },
  {
    id: 'GEO-05',
    name: 'Grand Marché Poto-Poto',
    type: 'market',
    district: 'Poto-Poto',
    city: 'Brazzaville',
    latitude: -4.2638,
    longitude: 15.2861,
    nearestBoardingPointId: 'POINT-DEMO-004',
    walkingDistanceMeters: 75,
    verificationStatus: 'VERIFIED',
    source: 'Cadastre Urbain Brazzaville'
  },
  {
    id: 'GEO-06',
    name: 'Université Marien Ngouabi (Faculté)',
    type: 'school',
    district: 'Bacongo',
    city: 'Brazzaville',
    latitude: -4.2790,
    longitude: 15.2590,
    nearestBoardingPointId: 'POINT-DEMO-001',
    walkingDistanceMeters: 420,
    verificationStatus: 'VERIFIED',
    source: 'Université Marien Ngouabi'
  },
  {
    id: 'GEO-07',
    name: 'Carrefour Deux Poteaux',
    type: 'intersection',
    district: 'Poto-Poto',
    city: 'Brazzaville',
    latitude: -4.2694,
    longitude: 15.2758,
    nearestBoardingPointId: 'POINT-DEMO-002',
    walkingDistanceMeters: 30,
    verificationStatus: 'VERIFIED',
    source: 'Donnée de voirie municipale'
  },
  {
    id: 'GEO-08',
    name: 'Mairie Centrale de Brazzaville',
    type: 'landmark',
    district: 'Centre-Ville',
    city: 'Brazzaville',
    latitude: -4.2740,
    longitude: 15.2840,
    nearestBoardingPointId: 'POINT-DEMO-006',
    walkingDistanceMeters: 350,
    verificationStatus: 'VERIFIED',
    source: 'Hôtel de Ville de Brazzaville'
  }
];

export const DEMO_STOPS: Stop[] = DEMO_BOARDING_POINTS.map((bp) => ({
  id: bp.id.replace('POINT-', 'ARRÊT-'),
  name: bp.name,
  district: bp.zone,
  latitude: bp.latitude,
  longitude: bp.longitude,
  lines: bp.lines
}));

export const DEMO_ROUTES: Route[] = [
  {
    id: 'LIGNE-DEMO-01',
    code: '01',
    name: 'Ligne 01 • Bacongo ⇄ Moungali',
    mode: 'bus',
    origin: 'Total Bacongo',
    destination: 'Rond-Point Moungali',
    category: 'STPU Urbain Homologué',
    color: '#006948',
    fare: '150 FCFA',
    fareFCFA: 150,
    fareInfo: OFFICIAL_FARE_BUS,
    frequency: '6 à 8 min',
    frequencyMinutes: '6-8 min',
    stopsCount: 8,
    operatingHours: '05h30 - 21h30',
    totalDistanceKm: 6.4,
    activeBusCount: 12,
    punctualityRate: 98.2,
    operatorName: 'STPU Brazzaville'
  },
  {
    id: 'LIGNE-DEMO-02',
    code: '02',
    name: 'Ligne 02 • Mikalou ⇄ Centre-Ville',
    mode: 'bus',
    origin: 'Marché Mikalou',
    destination: 'Gare Centrale Brazzaville',
    category: 'Radial Nord-Sud Transurbain',
    color: '#0051d5',
    fare: '150 FCFA',
    fareFCFA: 150,
    fareInfo: OFFICIAL_FARE_BUS,
    frequency: '10 à 12 min',
    frequencyMinutes: '10-12 min',
    stopsCount: 11,
    operatingHours: '05h45 - 21h00',
    totalDistanceKm: 8.2,
    activeBusCount: 8,
    punctualityRate: 94.6,
    operatorName: 'Transurbain Congo'
  },
  {
    id: 'LIGNE-DEMO-03',
    code: '03',
    name: 'Ligne 03 • Talangaï ⇄ Poto-Poto',
    mode: 'coaster',
    origin: 'Arrêt Intendance Talangaï',
    destination: 'Grand Marché Poto-Poto',
    category: 'Coaster Semi-Direct',
    color: '#d97706',
    fare: '150 FCFA',
    fareFCFA: 150,
    fareInfo: OFFICIAL_FARE_COASTER,
    frequency: '8 à 10 min',
    frequencyMinutes: '8-10 min',
    stopsCount: 7,
    operatingHours: '06h00 - 20h30',
    totalDistanceKm: 5.9,
    activeBusCount: 6,
    punctualityRate: 96.1,
    operatorName: 'Coopérative des Coasters de Brazzaville'
  },
  {
    id: 'LIGNE-DEMO-04',
    code: '04',
    name: 'Ligne 04 • Makélékélé ⇄ Ouenzé',
    mode: 'minibus',
    origin: 'Pont du Djoué Makélékélé',
    destination: 'Rond-Point Koulounda Ouenzé',
    category: 'Minibus Urbain Collectif',
    color: '#7c3aed',
    fare: '150 FCFA',
    fareFCFA: 150,
    fareInfo: OFFICIAL_FARE_COASTER,
    frequency: '12 à 15 min',
    frequencyMinutes: '12-15 min',
    stopsCount: 9,
    operatingHours: '06h00 - 20h00',
    totalDistanceKm: 9.1,
    activeBusCount: 6,
    punctualityRate: 92.8,
    operatorName: 'Groupement Minibus Hiace Congo'
  }
];

// Helper to construct a fully-resolved State Machine Vehicle
function createDemoVehicle(
  raw: {
    id: string;
    plate: string;
    type: string;
    mode: any;
    operatorName: string;
    capacity: { seated: number; standing: number; max: number };
    lineId: string;
    lineName: string;
    direction: string;
    driverName: string;
    driverId?: string;
    vehicleStatus: any;
    serviceStatus: any;
    lastGpsTimestampAgeSeconds: number; // 0 = now (LIVE), 30 = RECENT, 120 = STALE, 600 = OFFLINE
    speed: number;
    latitude: number;
    longitude: number;
    nextStop: string;
    etaNextStop: string;
    occupancy: { current: number; percentage: number };
    amenities?: any;
    fare: FareInfo;
  }
): Vehicle {
  const now = Date.now();
  const recordedTime = new Date(now - raw.lastGpsTimestampAgeSeconds * 1000).toISOString();

  const resolved = resolveVehicleState({
    vehicleStatus: raw.vehicleStatus,
    serviceStatus: raw.serviceStatus,
    lastGpsTimestamp: recordedTime,
    currentTime: now,
  });

  return {
    id: raw.id,
    plate: raw.plate,
    type: raw.type,
    mode: raw.mode,
    operatorName: raw.operatorName,
    capacity: raw.capacity,
    lineId: raw.lineId,
    lineName: raw.lineName,
    direction: raw.direction,
    driverName: raw.driverName,
    driverId: raw.driverId,

    // Official State Machine Dimensions
    vehicleStatus: resolved.vehicleStatus,
    serviceStatus: resolved.serviceStatus,
    gpsStatus: resolved.gpsStatus,
    trackingStatus: resolved.trackingStatus,
    availabilityStatus: resolved.availabilityStatus,
    effectiveStatus: resolved.effectiveStatus,
    displayStatus: resolved.displayStatus,
    isAvailableNow: resolved.isAvailableNow,
    isTrackable: resolved.isTrackable,
    canCalculateEta: resolved.canCalculateEta,

    lastGpsTimestamp: recordedTime,
    receivedAt: recordedTime,
    gpsAgeSeconds: resolved.gpsAgeSeconds,
    lastGpsUpdate: resolved.lastGpsUpdateFormatted,
    gpsConnectionStatus: resolved.legacyGpsStatus,

    speed: raw.speed,
    latitude: raw.latitude,
    longitude: raw.longitude,
    nextStop: raw.nextStop,
    etaNextStop: raw.etaNextStop,
    occupancy: raw.occupancy,
    amenities: raw.amenities,
    fare: raw.fare,
  };
}

// Flotte unifiée avec statuts réels de la machine d’états
export const DEMO_VEHICLES: Vehicle[] = [
  // 1. LIVE: Bus en circulation temps réel
  createDemoVehicle({
    id: 'BUS-DEMO-001',
    plate: 'BZV-9482-RC',
    type: 'Bus Articulé Climatisé',
    mode: 'bus',
    operatorName: 'STPU Brazzaville',
    capacity: { seated: 28, standing: 32, max: 60 },
    lineId: 'LIGNE-DEMO-01',
    lineName: 'Ligne 01 • Bacongo ⇄ Moungali',
    direction: 'Rond-Point Moungali (Terminus)',
    driverName: 'Chauffeur Démo 01',
    driverId: 'DRV-001',
    vehicleStatus: 'ACTIVE',
    serviceStatus: 'ACTIVE',
    lastGpsTimestampAgeSeconds: 4, // LIVE (4s)
    speed: 34,
    latitude: -4.2678,
    longitude: 15.2712,
    nextStop: 'Carrefour Deux Poteaux',
    etaNextStop: '2 min',
    occupancy: { current: 25, percentage: 42 },
    amenities: { ac: true, wifi: true, pmr: true, cctv: true },
    fare: OFFICIAL_FARE_BUS
  }),

  // 2. LIVE: Standard 45 Places
  createDemoVehicle({
    id: 'BUS-DEMO-002',
    plate: 'BZV-1104-AB',
    type: 'Standard 45 Places',
    mode: 'bus',
    operatorName: 'STPU Brazzaville',
    capacity: { seated: 24, standing: 21, max: 45 },
    lineId: 'LIGNE-DEMO-01',
    lineName: 'Ligne 01 • Bacongo ⇄ Moungali',
    direction: 'Total Bacongo',
    driverName: 'Chauffeur Démo 02',
    driverId: 'DRV-002',
    vehicleStatus: 'ACTIVE',
    serviceStatus: 'ACTIVE',
    lastGpsTimestampAgeSeconds: 8, // LIVE (8s)
    speed: 28,
    latitude: -4.2810,
    longitude: 15.2580,
    nextStop: 'Total Bacongo (Quai Central)',
    etaNextStop: '4 min',
    occupancy: { current: 18, percentage: 40 },
    amenities: { ac: false, wifi: true, pmr: true, cctv: true },
    fare: OFFICIAL_FARE_BUS
  }),

  // 3. RECENT: Toyota Coaster 30 Places
  createDemoVehicle({
    id: 'COASTER-DEMO-003',
    plate: 'BZV-5521-RC',
    type: 'Toyota Coaster 30 Places',
    mode: 'coaster',
    operatorName: 'Coopérative des Coasters de Brazzaville',
    capacity: { seated: 30, standing: 5, max: 35 },
    lineId: 'LIGNE-DEMO-03',
    lineName: 'Ligne 03 • Talangaï ⇄ Poto-Poto',
    direction: 'Grand Marché Poto-Poto',
    driverName: 'Chauffeur Démo 03',
    driverId: 'DRV-003',
    vehicleStatus: 'ACTIVE',
    serviceStatus: 'ACTIVE',
    lastGpsTimestampAgeSeconds: 35, // RECENT (35s)
    speed: 31,
    latitude: -4.2510,
    longitude: 15.2910,
    nextStop: 'Grand Marché Poto-Poto (Arrêt)',
    etaNextStop: '3 min (approximatif)',
    occupancy: { current: 24, percentage: 69 },
    amenities: { ac: true, wifi: true, pmr: false, cctv: true },
    fare: OFFICIAL_FARE_COASTER
  }),

  // 4. STALE: Minibus Hiace (Dernière position connue il y a 2 min)
  createDemoVehicle({
    id: 'MINIBUS-DEMO-004',
    plate: 'BZV-7789-RC',
    type: 'Minibus Hiace 18 Places',
    mode: 'minibus',
    operatorName: 'Groupement Minibus Hiace Congo',
    capacity: { seated: 18, standing: 4, max: 22 },
    lineId: 'LIGNE-DEMO-04',
    lineName: 'Ligne 04 • Makélékélé ⇄ Ouenzé',
    direction: 'Rond-Point Koulounda Ouenzé',
    driverName: 'Chauffeur Démo 04',
    driverId: 'DRV-004',
    vehicleStatus: 'ACTIVE',
    serviceStatus: 'ACTIVE',
    lastGpsTimestampAgeSeconds: 140, // STALE (2 min 20s)
    speed: 16,
    latitude: -4.2480,
    longitude: 15.2810,
    nextStop: 'Rond-Point Koulounda (Ouenzé)',
    etaNextStop: 'ETA non garantie',
    occupancy: { current: 19, percentage: 86 },
    amenities: { ac: false, wifi: false, pmr: false, cctv: false },
    fare: OFFICIAL_FARE_COASTER
  }),

  // 5. LIVE: Taxi Urbain
  createDemoVehicle({
    id: 'TAXI-DEMO-005',
    plate: 'BZV-3342-RC',
    type: 'Taxi Vert & Blanc Brazzaville',
    mode: 'taxi',
    operatorName: 'Artisans Taxis 100/100',
    capacity: { seated: 4, standing: 0, max: 4 },
    lineId: 'TAXI-URBAIN',
    lineName: 'Course Urbaine Brazzaville',
    direction: 'Disponible en zone',
    driverName: 'Chauffeur Taxi Démo 05',
    driverId: 'DRV-005',
    vehicleStatus: 'ACTIVE',
    serviceStatus: 'ACTIVE',
    lastGpsTimestampAgeSeconds: 2, // LIVE (2s)
    speed: 25,
    latitude: -4.2730,
    longitude: 15.2820,
    nextStop: 'Prise en charge à proximité',
    etaNextStop: '1 min',
    occupancy: { current: 1, percentage: 25 },
    amenities: { ac: true, wifi: false, pmr: false, cctv: false },
    fare: INDICATIVE_FARE_TAXI
  }),

  // 6. READY_NOT_STARTED: Véhicule au dépôt, service non démarré
  createDemoVehicle({
    id: 'BUS-DEMO-006',
    plate: 'BZV-9012-RC',
    type: 'Standard 45 Places',
    mode: 'bus',
    operatorName: 'Transurbain Congo',
    capacity: { seated: 24, standing: 21, max: 45 },
    lineId: 'LIGNE-DEMO-02',
    lineName: 'Ligne 02 • Mikalou ⇄ Centre-Ville',
    direction: 'Gare Centrale Brazzaville',
    driverName: 'Chauffeur Démo 06',
    driverId: 'DRV-006',
    vehicleStatus: 'ACTIVE',
    serviceStatus: 'NOT_STARTED',
    lastGpsTimestampAgeSeconds: 600, // OFFLINE
    speed: 0,
    latitude: -4.2719,
    longitude: 15.2895,
    nextStop: 'Dépôt Central STPU',
    etaNextStop: 'Non en service',
    occupancy: { current: 0, percentage: 0 },
    amenities: { ac: true, wifi: true, pmr: true, cctv: true },
    fare: OFFICIAL_FARE_BUS
  }),

  // 7. MAINTENANCE: Véhicule en atelier technique
  createDemoVehicle({
    id: 'BUS-DEMO-007',
    plate: 'BZV-4412-RC',
    type: 'Bus Articulé',
    mode: 'bus',
    operatorName: 'STPU Brazzaville',
    capacity: { seated: 28, standing: 32, max: 60 },
    lineId: 'LIGNE-DEMO-01',
    lineName: 'Ligne 01 • Bacongo ⇄ Moungali',
    direction: 'Atelier STPU',
    driverName: 'Technicien Maintenance',
    vehicleStatus: 'MAINTENANCE',
    serviceStatus: 'NOT_STARTED',
    lastGpsTimestampAgeSeconds: 3600,
    speed: 0,
    latitude: -4.2850,
    longitude: 15.2450,
    nextStop: 'Atelier de Révision',
    etaNextStop: 'Indisponible',
    occupancy: { current: 0, percentage: 0 },
    amenities: { ac: true, wifi: false, pmr: true, cctv: false },
    fare: OFFICIAL_FARE_BUS
  }),

  // 8. SUSPENDU: Véhicule temporairement interdit d'exploitation
  createDemoVehicle({
    id: 'COASTER-DEMO-008',
    plate: 'BZV-8819-RC',
    type: 'Coaster Urbain',
    mode: 'coaster',
    operatorName: 'Coopérative des Coasters',
    capacity: { seated: 30, standing: 5, max: 35 },
    lineId: 'LIGNE-DEMO-03',
    lineName: 'Ligne 03 • Talangaï ⇄ Poto-Poto',
    direction: 'Stationnement Fourrière',
    driverName: 'Contrôle Technique',
    vehicleStatus: 'SUSPENDED',
    serviceStatus: 'PAUSED',
    lastGpsTimestampAgeSeconds: 800,
    speed: 0,
    latitude: -4.2600,
    longitude: 15.2700,
    nextStop: 'Fourrière Municipale',
    etaNextStop: 'Suspendu',
    occupancy: { current: 0, percentage: 0 },
    amenities: { ac: false, wifi: false, pmr: false, cctv: false },
    fare: OFFICIAL_FARE_COASTER
  })
];

export const DEMO_TRIPS: Trip[] = [
  {
    id: 'TRIP-991',
    date: 'Aujourd’hui, 08:24',
    origin: 'Total Bacongo',
    destination: 'Rond-Point Moungali',
    mode: 'bus',
    lineCode: 'Ligne 01',
    busId: 'BUS-DEMO-001',
    status: 'Validé à bord',
    priceFCFA: 150
  },
  {
    id: 'TRIP-984',
    date: 'Hier, 17:45',
    origin: 'Carrefour Deux Poteaux',
    destination: 'Total Bacongo',
    mode: 'coaster',
    lineCode: 'Ligne 03',
    busId: 'COASTER-DEMO-003',
    status: 'Validé à bord',
    priceFCFA: 150
  },
  {
    id: 'TRIP-962',
    date: '26 Septembre, 12:10',
    origin: 'Gare Centrale',
    destination: 'Marché Mikalou',
    mode: 'bus',
    lineCode: 'Ligne 02',
    busId: 'BUS-DEMO-006',
    status: 'Validé à bord',
    priceFCFA: 150
  }
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    type: 'approach',
    title: 'Votre bus approche du point de montée !',
    message: 'Le véhicule BUS-DEMO-001 (LIGNE 01) est à 450 m de votre point de prise en charge : Total Bacongo (Quai Central).',
    timeAgo: 'Il y a 1 min',
    badge: 'ETA 2 min',
    read: false
  },
  {
    id: 'NOTIF-02',
    type: 'telemetry',
    title: 'Point de prise en charge Coaster détecté',
    message: 'Coaster COASTER-DEMO-003 arrive dans 3 min au Carrefour Deux Poteaux.',
    timeAgo: 'Il y a 4 min',
    badge: 'ETA 3 min',
    read: false
  },
  {
    id: 'NOTIF-03',
    type: 'disruption',
    title: 'Info Voirie Brazzaville',
    message: 'Ralentissement modéré signalé par les capteurs GPS à proximité du Rond-Point Moungali.',
    timeAgo: 'Il y a 18 min',
    badge: '+3 min',
    read: true
  }
];
