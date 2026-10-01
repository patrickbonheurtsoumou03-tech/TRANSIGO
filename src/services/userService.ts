import { BoardingPoint, GPSConnectionStatus, TransportMode } from '../types';

export type UserRole = 'PASSAGER' | 'CHAUFFEUR' | 'TRANSPORTEUR' | 'ADMIN';

export type GeoSource = 'DEVICE_GPS' | 'BROWSER_GEOLOCATION' | 'MANUAL_FALLBACK';

export interface UserLocationState {
  available: boolean;
  permission: 'prompt' | 'granted' | 'denied';
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null; // in meters (e.g. ±12m)
  altitude: number | null;
  speed: number | null; // km/h
  heading: number | null;
  timestamp: string | null;
  source: GeoSource;
  placeName?: string;
  error?: string | null;
}

export interface StoredFavoritePlace {
  id: string;
  type: 'home' | 'work' | 'school' | 'other';
  label: string;
  customName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  nearestStop?: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipLocation: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface DriverVehicleAssociation {
  vehicleId: string;
  plate: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  capacity: number;
  assignedLineId: string;
  assignedLineName: string;
  direction: string;
  isAuthorized: boolean;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  authProvider: 'google' | 'email' | 'phone' | 'guest';
  isVerified: boolean;
  language: 'fr' | 'en';
  useLocation: boolean; // Location master switch
  favoritePlaces: StoredFavoritePlace[];
  onboardingCompleted: boolean;
  createdAt: string;
  lastLogin: string;
  // Driver specific
  driverLicenseNumber?: string;
  driverExperienceYears?: number;
  isDriverOnDuty?: boolean;
  driverVehicle?: DriverVehicleAssociation;
  gpsUpdateIntervalMs: number; // e.g. 5000ms
  // Transporter specific
  companyName?: string;
  fleetSize?: number;
}

const STORAGE_KEY_USER = 'transigo_user_profile_v3';
const STORAGE_KEY_SESSIONS = 'transigo_user_sessions_v3';

// Default initial state
const defaultProfile: UserProfile = {
  id: 'USR-BZV-2026-001',
  role: 'PASSAGER',
  firstName: 'Serge',
  lastName: 'Mabiala',
  email: 'mabiala.serge@transigo.cg',
  phone: '+242 06 912 34 56',
  photoUrl: '',
  authProvider: 'google',
  isVerified: true,
  language: 'fr',
  useLocation: true,
  favoritePlaces: [
    {
      id: 'fav-1',
      type: 'home',
      label: 'Maison',
      address: 'Total Bacongo, Rue Mbochi',
      latitude: -4.2812,
      longitude: 15.2534,
      nearestStop: 'Arrêt Total Bacongo',
    },
    {
      id: 'fav-2',
      type: 'work',
      label: 'Travail',
      address: 'Centre-Ville, Avenue Amilcar Cabral',
      latitude: -4.2678,
      longitude: 15.2831,
      nearestStop: 'Gare Centrale',
    },
  ],
  onboardingCompleted: false,
  createdAt: '2026-01-15T08:00:00Z',
  lastLogin: new Date().toISOString(),
  driverLicenseNumber: 'PC-CG-2024-8849',
  driverExperienceYears: 6,
  isDriverOnDuty: false,
  driverVehicle: {
    vehicleId: 'BUS-DEMO-001',
    plate: 'RC-1049-BZV',
    type: 'Bus Articulé Climatisé',
    brand: 'Mercedes-Benz',
    model: 'Citaro G',
    color: 'Vert & Blanc STPU',
    capacity: 75,
    assignedLineId: 'LIGNE-DEMO-01',
    assignedLineName: 'Ligne 01 • Bacongo ⇄ Moungali',
    direction: 'Rond-Point Moungali (Terminus)',
    isAuthorized: true,
  },
  gpsUpdateIntervalMs: 5000,
  companyName: 'Coopérative Express Bacongo',
  fleetSize: 12,
};

const defaultSessions: UserSession[] = [
  {
    id: 'SES-001',
    device: 'Smartphone Android (Samsung Galaxy A54)',
    browser: 'Chrome Mobile 128.0',
    os: 'Android 14',
    ipLocation: 'Brazzaville, République du Congo (MTN Congo)',
    lastActive: 'En ce moment (Session active)',
    isCurrent: true,
  },
  {
    id: 'SES-002',
    device: 'Ordinateur Portable (MacBook Air)',
    browser: 'Safari 17.4',
    os: 'macOS Sonoma',
    ipLocation: 'Brazzaville, République du Congo (Congo Telecom)',
    lastActive: 'Hier à 18:42',
    isCurrent: false,
  },
];

// Helper: Haversine distance in meters
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
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

class UserService {
  private user: UserProfile;
  private sessions: UserSession[];
  private location: UserLocationState;
  private listeners: (() => void)[] = [];
  private geoWatchId: number | null = null;

  constructor() {
    // Load user
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        this.user = { ...defaultProfile, ...JSON.parse(savedUser) };
      } catch (e) {
        this.user = defaultProfile;
      }
    } else {
      this.user = defaultProfile;
    }

    // Load sessions
    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (savedSessions) {
      try {
        this.sessions = JSON.parse(savedSessions);
      } catch (e) {
        this.sessions = defaultSessions;
      }
    } else {
      this.sessions = defaultSessions;
    }

    this.location = {
      available: false,
      permission: 'prompt',
      latitude: null,
      longitude: null,
      accuracy: null,
      altitude: null,
      speed: null,
      heading: null,
      timestamp: null,
      source: 'BROWSER_GEOLOCATION',
      placeName: undefined,
      error: null,
    };

    // Query permission if available
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          this.location.permission = result.state as 'prompt' | 'granted' | 'denied';
          result.onchange = () => {
            this.location.permission = result.state as 'prompt' | 'granted' | 'denied';
            this.notify();
          };
          this.notify();
        })
        .catch(() => {});
    }
  }

  public getUser(): UserProfile {
    return this.user;
  }

  public getSessions(): UserSession[] {
    return this.sessions;
  }

  public getLocation(): UserLocationState {
    return this.location;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private saveUser() {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user));
    } catch (e) {}
    this.notify();
  }

  private saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(this.sessions));
    } catch (e) {}
    this.notify();
  }

  public updateUser(partial: Partial<UserProfile>) {
    this.user = { ...this.user, ...partial };
    this.saveUser();
  }

  public setRole(role: UserRole) {
    this.user.role = role;
    this.saveUser();
  }

  public setLanguage(lang: 'fr' | 'en') {
    this.user.language = lang;
    this.saveUser();
  }

  public setUseLocation(enabled: boolean) {
    this.user.useLocation = enabled;
    if (!enabled) {
      this.disableGeolocation();
    }
    this.saveUser();
  }

  public setOnboardingCompleted(completed: boolean) {
    this.user.onboardingCompleted = completed;
    this.saveUser();
  }

  public setGpsUpdateInterval(ms: number) {
    this.user.gpsUpdateIntervalMs = ms;
    this.saveUser();
  }

  public addFavoritePlace(place: Omit<StoredFavoritePlace, 'id'>) {
    const newPlace: StoredFavoritePlace = {
      ...place,
      id: 'fav-' + Date.now(),
    };
    this.user.favoritePlaces = [...this.user.favoritePlaces, newPlace];
    this.saveUser();
  }

  public removeFavoritePlace(id: string) {
    this.user.favoritePlaces = this.user.favoritePlaces.filter((p) => p.id !== id);
    this.saveUser();
  }

  // Real GPS Geolocation Request
  public async requestRealGeolocation(): Promise<UserLocationState> {
    if (!this.user.useLocation) {
      this.user.useLocation = true;
      this.saveUser();
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.location = {
        ...this.location,
        available: false,
        permission: 'denied',
        error: "La géolocalisation n'est pas prise en charge par votre appareil ou navigateur.",
      };
      this.notify();
      return this.location;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const speedKmH = pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : 0;
          this.location = {
            available: true,
            permission: 'granted',
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
            speed: speedKmH,
            heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
            timestamp: new Date(pos.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            source: 'DEVICE_GPS',
            placeName: 'Position détectée par GPS',
            error: null,
          };
          this.notify();
          resolve(this.location);
        },
        (err) => {
          let errorMsg = 'Autorisation de localisation refusée.';
          if (err.code === err.TIMEOUT) {
            errorMsg = "Délai d'attente GPS dépassé.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMsg = 'Signal GPS temporairement indisponible.';
          }
          this.location = {
            ...this.location,
            available: false,
            permission: 'denied',
            error: errorMsg,
          };
          this.notify();
          resolve(this.location);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 4000,
        }
      );
    });
  }

  // Explicit user action to disable location
  public disableGeolocation() {
    this.stopDriverGpsTracking();
    this.location = {
      available: false,
      permission: 'denied',
      latitude: null,
      longitude: null,
      accuracy: null,
      altitude: null,
      speed: null,
      heading: null,
      timestamp: null,
      source: 'BROWSER_GEOLOCATION',
      placeName: undefined,
      error: 'Localisation désactivée par l’utilisateur.',
    };
    this.notify();
  }

  // Continuous driver GPS streaming for on-duty service
  public startDriverGpsTracking(
    onPositionUpdate?: (coords: { lat: number; lng: number; speed: number; heading: number | null }) => void
  ) {
    if (this.geoWatchId !== null) return;
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

    this.geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const speedKmH = pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : 0;
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const heading = pos.coords.heading ? Math.round(pos.coords.heading) : null;

        this.location = {
          available: true,
          permission: 'granted',
          latitude: lat,
          longitude: lng,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          speed: speedKmH,
          heading: heading,
          timestamp: new Date(pos.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          source: 'DEVICE_GPS',
          error: null,
        };
        this.notify();

        if (onPositionUpdate) {
          onPositionUpdate({ lat, lng, speed: speedKmH, heading });
        }
      },
      (err) => {
        console.warn('Driver GPS watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 2000,
      }
    );
  }

  public stopDriverGpsTracking() {
    if (this.geoWatchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
    }
  }

  // Check Driver GPS authorization security criteria (Section 50)
  public isDriverGpsAuthorized(): boolean {
    return (
      this.user.role === 'CHAUFFEUR' &&
      this.user.isVerified &&
      !!this.user.driverVehicle?.isAuthorized &&
      !!this.user.isDriverOnDuty &&
      this.location.permission === 'granted'
    );
  }

  // Toggle Driver Service Duty (Section 25 & 33)
  public toggleDriverDuty(onDuty: boolean) {
    this.user.isDriverOnDuty = onDuty;
    if (onDuty) {
      this.startDriverGpsTracking();
    } else {
      this.stopDriverGpsTracking();
    }
    this.saveUser();
  }

  // Update Driver Vehicle Association (Section 23 & 24)
  public updateDriverVehicle(veh: DriverVehicleAssociation) {
    this.user.driverVehicle = veh;
    this.saveUser();
  }

  // Sessions management (Section 46)
  public disconnectOtherSessions() {
    this.sessions = this.sessions.filter((s) => s.isCurrent);
    this.saveSessions();
  }

  public disconnectCurrentSession() {
    this.user.isVerified = false;
    this.saveUser();
  }

  // Fallback simulator presets for demonstration when user is outside Congo
  public setSimulatedBrazzavillePosition(name: string, lat: number, lng: number) {
    this.location = {
      available: true,
      permission: 'granted',
      latitude: lat,
      longitude: lng,
      accuracy: 8,
      altitude: 285,
      speed: 0,
      heading: 90,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      source: 'BROWSER_GEOLOCATION',
      placeName: name,
      error: null,
    };
    this.notify();
  }
}

export const userService = new UserService();
