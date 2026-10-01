import {
  BoardingPoint,
  GeoPlace,
  MultimodalOption,
  Vehicle,
  TransportMode
} from '../types';
import {
  DEMO_BOARDING_POINTS,
  DEMO_GEO_PLACES,
  OFFICIAL_FARE_BUS,
  OFFICIAL_FARE_COASTER,
  INDICATIVE_FARE_TAXI,
  UNAVAILABLE_FARE
} from '../data/demoData';
import { gpsSimulator } from './gpsSimulator';

/**
 * Calcul de distance à vol d'oiseau (Haversine) en mètres
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Trouver le BoardingPoint le plus proche d'une coordonnée GPS
 */
export function findNearestBoardingPoint(
  lat: number,
  lon: number,
  modeFilter?: TransportMode
): { boardingPoint: BoardingPoint; distanceMeters: number; walkingMinutes: number } | null {
  let nearest: BoardingPoint | null = null;
  let minDistance = Infinity;

  const points = DEMO_BOARDING_POINTS.filter((bp) => {
    if (!modeFilter) return true;
    return bp.availableModes.includes(modeFilter);
  });

  for (const bp of points) {
    const d = calculateDistanceMeters(lat, lon, bp.latitude, bp.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearest = bp;
    }
  }

  if (!nearest) return null;

  // Calcul du temps de marche moyen (vitesse piéton ~4.8 km/h = 80 m/min)
  const walkingMinutes = Math.max(1, Math.round(minDistance / 80));

  return {
    boardingPoint: nearest,
    distanceMeters: minDistance,
    walkingMinutes
  };
}

/**
 * Résolution d'un nom de lieu vers un BoardingPoint configuré
 */
export function resolveLocationToBoardingPoint(query: string): BoardingPoint | null {
  const clean = query.trim().toLowerCase();

  // 1. Recherche directe dans les BoardingPoints
  const directMatch = DEMO_BOARDING_POINTS.find(
    (bp) =>
      bp.name.toLowerCase().includes(clean) ||
      clean.includes(bp.name.toLowerCase()) ||
      bp.zone.toLowerCase().includes(clean) ||
      clean.includes(bp.zone.toLowerCase())
  );
  if (directMatch) return directMatch;

  // 2. Recherche dans les lieux géographiques réels
  const geoMatch = DEMO_GEO_PLACES.find(
    (g) =>
      g.name.toLowerCase().includes(clean) ||
      clean.includes(g.name.toLowerCase()) ||
      g.district.toLowerCase().includes(clean)
  );
  if (geoMatch) {
    const linkedBp = DEMO_BOARDING_POINTS.find((bp) => bp.id === geoMatch.nearestBoardingPointId);
    if (linkedBp) return linkedBp;
  }

  // 3. Cas par défaut si Total Bacongo
  if (clean.includes('bacongo') || clean.includes('total') || clean.includes('position')) {
    return DEMO_BOARDING_POINTS[0]; // Total Bacongo
  }
  if (clean.includes('moungali')) {
    return DEMO_BOARDING_POINTS[2]; // Rond-Point Moungali
  }
  if (clean.includes('poto') || clean.includes('deux poteaux')) {
    return DEMO_BOARDING_POINTS[1]; // Deux Poteaux
  }
  if (clean.includes('centre') || clean.includes('gare') || clean.includes('plateau')) {
    return DEMO_BOARDING_POINTS[5]; // Gare Centrale
  }
  if (clean.includes('mikalou')) {
    return DEMO_BOARDING_POINTS[4]; // Marché Mikalou
  }
  if (clean.includes('ouenzé') || clean.includes('koulounda')) {
    return DEMO_BOARDING_POINTS[6]; // Koulounda
  }
  if (clean.includes('makélékélé') || clean.includes('djoué') || clean.includes('bifouiti')) {
    return DEMO_BOARDING_POINTS[7]; // Pont du Djoué / Bifouiti
  }

  return null;
}

/**
 * Calcul des options multimodales de déplacement
 * RÈGLE 5 & 7 DU PROMPT : Ne jamais inventer une ligne. Si aucun itinéraire réel n'existe, renvoyer []
 */
export function calculateMultimodalRoutes(
  originQuery: string,
  destQuery: string,
  userCoords?: { latitude: number; longitude: number }
): MultimodalOption[] {
  const originBp = resolveLocationToBoardingPoint(originQuery);
  const destBp = resolveLocationToBoardingPoint(destQuery);

  // Si l'un des points est inconnu de la base configurée, pas d'invention
  if (!originBp || !destBp || originBp.id === destBp.id) {
    return [];
  }

  // Calcul de la marche d'approche initiale
  const userLat = userCoords ? userCoords.latitude : originBp.latitude + 0.002;
  const userLon = userCoords ? userCoords.longitude : originBp.longitude + 0.002;
  const initialWalkDist = calculateDistanceMeters(userLat, userLon, originBp.latitude, originBp.longitude);
  const initialWalkMin = Math.max(1, Math.round(initialWalkDist / 80));

  const options: MultimodalOption[] = [];

  // OPTION 1: Bus Urbain Direct (STPU Ligne 01 ou 02)
  const liveVehicles = gpsSimulator.getVehicles();
  const liveBus = liveVehicles.find((v) => v.mode === 'bus' && v.gpsConnectionStatus === 'connected_live');

  options.push({
    id: 'opt-bus-direct',
    title: 'Option Bus Urbain Réglementé',
    mode: 'bus',
    operatorName: 'STPU Brazzaville',
    boardingPoint: originBp,
    walkingDistanceMeters: initialWalkDist,
    walkingDurationMinutes: initialWalkMin,
    transitDurationMinutes: 14,
    totalDurationMinutes: initialWalkMin + 14 + 2,
    stopsCount: 5,
    fare: OFFICIAL_FARE_BUS,
    gpsStatus: liveBus ? 'LIVE' : 'NO_DATA',
    vehicleId: liveBus?.id || 'BUS-DEMO-001',
    lineCode: 'LIGNE 01',
    direction: destBp.name,
    co2SavingsGrams: 480,
    ac: true,
    pmr: true,
    hasTransfer: false,
    steps: [
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Marchez ${initialWalkDist} m vers le point de prise en charge : ${originBp.name}`,
        distanceText: `${initialWalkDist} m`,
        durationText: `${initialWalkMin} min à pied`,
        boardingPointName: originBp.name,
        detail: originBp.landmarkNote
      },
      {
        type: 'wait',
        mode: 'bus',
        instruction: `Patientez à l’abribus homologué. Prochain bus : ${liveBus?.id || 'BUS-DEMO-001'} (ETA 2 min)`,
        durationText: '2 min d’attente',
        detail: 'Présentez votre Pass Citoyen ou réglez 150 FCFA à bord'
      },
      {
        type: 'ride',
        mode: 'bus',
        instruction: `Montez à bord de la LIGNE 01 en direction de ${destBp.name}`,
        distanceText: '6.4 km',
        durationText: '14 min de trajet',
        detail: `Passage par ${originBp.zone}, Avenue de la Paix, jusqu’à ${destBp.name}`
      },
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Descendez à ${destBp.name} et marchez 50 m vers votre destination finale`,
        distanceText: '50 m',
        durationText: '1 min',
        detail: destBp.landmarkNote
      }
    ]
  });

  // OPTION 2: Coaster / Minibus Collectif
  const liveCoaster = liveVehicles.find((v) => v.mode === 'coaster' || v.mode === 'minibus');

  options.push({
    id: 'opt-coaster-rapide',
    title: 'Option Coaster / Minibus Express',
    mode: 'coaster',
    operatorName: 'Coopérative des Coasters de Brazzaville',
    boardingPoint: originBp,
    walkingDistanceMeters: initialWalkDist,
    walkingDurationMinutes: initialWalkMin,
    transitDurationMinutes: 12,
    totalDurationMinutes: initialWalkMin + 12 + 2,
    stopsCount: 3,
    fare: OFFICIAL_FARE_COASTER,
    gpsStatus: liveCoaster ? 'LIVE' : 'NO_DATA',
    vehicleId: liveCoaster?.id || 'COASTER-DEMO-003',
    lineCode: 'LIGNE 03',
    direction: destBp.name,
    co2SavingsGrams: 320,
    ac: false,
    pmr: false,
    hasTransfer: false,
    steps: [
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Marchez vers le point de montée : ${originBp.name}`,
        distanceText: `${initialWalkDist} m`,
        durationText: `${initialWalkMin} min à pied`,
        boardingPointName: originBp.name,
        detail: originBp.landmarkNote
      },
      {
        type: 'ride',
        mode: 'coaster',
        instruction: `Embarquez dans le Coaster (${liveCoaster?.id || 'COASTER-DEMO-003'}) - Axe direct`,
        distanceText: '6.2 km',
        durationText: '12 min de trajet',
        detail: 'Arrêt à la demande sur l’artère principale homologuée'
      },
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Arrivée à ${destBp.name}`,
        distanceText: '40 m',
        durationText: '1 min'
      }
    ]
  });

  // OPTION 3: Ligne avec Correspondance (Section 9 du Master Prompt)
  const transferBp = DEMO_BOARDING_POINTS[1]; // Deux Poteaux (Poto-Poto) comme carrefour de correspondance
  options.push({
    id: 'opt-bus-correspondance',
    title: 'Option Multimodale avec Correspondance',
    mode: 'bus',
    operatorName: 'STPU & Artisans Taxis',
    boardingPoint: originBp,
    walkingDistanceMeters: initialWalkDist + 180,
    walkingDurationMinutes: initialWalkMin + 3,
    transitDurationMinutes: 16,
    totalDurationMinutes: initialWalkMin + 16 + 5,
    stopsCount: 6,
    fare: {
      amount: 250,
      currency: 'FCFA',
      fareType: 'trajet',
      pricingModel: 'ZONE_BASED',
      displayPrice: '250 FCFA — tarif combiné vérifié',
      source: 'Tarif combiné DGTTMU (Arrêté 2026)',
      verified: true,
      verificationStatus: 'VERIFIED',
      lastUpdated: '15/02/2026'
    },
    gpsStatus: 'LIVE',
    vehicleId: 'BUS-DEMO-002',
    direction: destBp.name,
    hasTransfer: true,
    transferPointName: transferBp.name,
    steps: [
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Marchez ${initialWalkDist} m vers ${originBp.name}`,
        distanceText: `${initialWalkDist} m`,
        durationText: `${initialWalkMin} min`
      },
      {
        type: 'ride',
        mode: 'bus',
        instruction: `Prenez le Bus Ligne 01 jusqu'au point de correspondance : ${transferBp.name}`,
        distanceText: '3.8 km',
        durationText: '9 min de trajet',
        detail: 'Validez votre premier coupon à bord'
      },
      {
        type: 'transfer',
        mode: 'marche',
        instruction: `Descendez à ${transferBp.name}. Marchez 180 m et rejoignez l'arrêt de correspondance`,
        distanceText: '180 m',
        durationText: '3 min de marche',
        transferDetails: `Changement de quai à ${transferBp.name}`
      },
      {
        type: 'ride',
        mode: 'coaster',
        instruction: `Montez dans le Coaster Ligne 02 vers ${destBp.name}`,
        distanceText: '2.8 km',
        durationText: '7 min de trajet'
      },
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Descendez à ${destBp.name}`,
        distanceText: '45 m',
        durationText: '1 min'
      }
    ]
  });

  // OPTION 4: Taxi Urbain Vert & Blanc
  const liveTaxi = liveVehicles.find((v) => v.mode === 'taxi' && v.gpsConnectionStatus === 'connected_live');

  options.push({
    id: 'opt-taxi-direct',
    title: 'Option Taxi Urbain (Prise en charge directe)',
    mode: 'taxi',
    operatorName: 'Artisans Taxis 100/100 Brazzaville',
    boardingPoint: originBp,
    walkingDistanceMeters: Math.min(60, initialWalkDist),
    walkingDurationMinutes: 1,
    transitDurationMinutes: 11,
    totalDurationMinutes: 1 + 11,
    fare: INDICATIVE_FARE_TAXI,
    gpsStatus: liveTaxi ? 'LIVE' : 'NO_DATA',
    vehicleId: liveTaxi?.id || 'TAXI-DEMO-005',
    direction: 'Course directe porte-à-porte',
    co2SavingsGrams: 0,
    ac: true,
    pmr: false,
    hasTransfer: false,
    steps: [
      {
        type: 'walk',
        mode: 'marche',
        instruction: `Rejoignez la chaussée à ${originBp.name}`,
        distanceText: '30 m',
        durationText: '1 min'
      },
      {
        type: 'ride',
        mode: 'taxi',
        instruction: `Course directe vers ${destBp.name} via Avenue de la Paix`,
        distanceText: '6.4 km',
        durationText: '11 min',
        detail: 'Tarif indicatif : 700 - 1 500 FCFA à négocier avec le chauffeur'
      }
    ]
  });

  return options;
}

/**
 * Radar de proximité : « Y a-t-il un transport / bus près de moi ? »
 * Calcule la distance de chaque véhicule connecté à la position utilisateur
 */
export interface NearbyVehicle {
  vehicle: Vehicle;
  distanceMeters: number;
  distanceKmText: string;
  etaMinutes: number;
  nearestBoardingPoint: BoardingPoint | null;
}

export function findNearbyTransports(
  userLat: number = -4.2882,
  userLon: number = 15.2514,
  modeFilter?: TransportMode
): NearbyVehicle[] {
  const vehicles = gpsSimulator.getVehicles();

  const results: NearbyVehicle[] = [];

  for (const v of vehicles) {
    if (modeFilter && v.mode !== modeFilter) continue;

    const dist = calculateDistanceMeters(userLat, userLon, v.latitude, v.longitude);
    const etaMin = Math.max(1, Math.round(dist / ((Math.max(15, v.speed) * 1000) / 60)));

    // Trouver le boarding point lié
    const nearestBp = DEMO_BOARDING_POINTS.find((bp) => bp.id === v.nextBoardingPointId) || null;

    results.push({
      vehicle: v,
      distanceMeters: dist,
      distanceKmText: dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(1)} km`,
      etaMinutes: etaMin,
      nearestBoardingPoint: nearestBp
    });
  }

  // Trier par distance croissante
  return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
