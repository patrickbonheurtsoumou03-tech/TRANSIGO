import { Vehicle, VehicleStatus, ServiceStatus, GPSStatus } from '../types';
import { DEMO_VEHICLES } from '../data/demoData';
import { resolveVehicleState } from './vehicleStateMachine';

export type TelemetryListener = (vehicles: Vehicle[]) => void;

class GPSSimulator {
  private vehicles: Vehicle[] = JSON.parse(JSON.stringify(DEMO_VEHICLES));
  private listeners: Set<TelemetryListener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private isSimulating: boolean = true;

  constructor() {
    this.startSimulation();
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener([...this.vehicles]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  public getVehicle(id: string): Vehicle | undefined {
    return this.vehicles.find((v) => v.id === id);
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.getVehicle(id);
  }

  public isSimulatedMode(): boolean {
    return this.isSimulating;
  }

  public toggleSimulation(active?: boolean): boolean {
    this.isSimulating = active !== undefined ? active : !this.isSimulating;
    if (this.isSimulating && !this.timer) {
      this.startSimulation();
    } else if (!this.isSimulating && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
    return this.isSimulating;
  }

  public reset() {
    this.vehicles = JSON.parse(JSON.stringify(DEMO_VEHICLES));
    this.notify();
  }

  // Update vehicle State Machine dimensions with automatic resolution
  public setVehicleStateDimensions(
    vehicleId: string,
    params: {
      vehicleStatus?: VehicleStatus;
      serviceStatus?: ServiceStatus;
      gpsStatus?: GPSStatus;
      lastGpsTimestamp?: string;
    }
  ) {
    this.vehicles = this.vehicles.map((v) => {
      if (v.id !== vehicleId) return v;

      const vehicleStatus = params.vehicleStatus ?? v.vehicleStatus;
      const serviceStatus = params.serviceStatus ?? v.serviceStatus;
      const lastGpsTimestamp = params.lastGpsTimestamp ?? v.lastGpsTimestamp;

      const resolved = resolveVehicleState({
        vehicleStatus,
        serviceStatus,
        gpsStatus: params.gpsStatus,
        lastGpsTimestamp,
        currentTime: new Date(),
      });

      return {
        ...v,
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
        gpsAgeSeconds: resolved.gpsAgeSeconds,
        lastGpsUpdate: resolved.lastGpsUpdateFormatted,
        gpsConnectionStatus: resolved.legacyGpsStatus,
      };
    });

    this.notify();
  }

  public updateVehicleStatus(vehicleId: string, status: Vehicle['status']) {
    this.vehicles = this.vehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v));
    this.notify();
  }

  private startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.isSimulating) return;

      const now = new Date();

      this.vehicles = this.vehicles.map((v) => {
        // Handle Active & Connected Vehicles (Emit live GPS coords)
        const isEmittingGps =
          v.vehicleStatus === 'ACTIVE' &&
          (v.serviceStatus === 'ACTIVE' || v.serviceStatus === 'STARTING') &&
          (v.gpsStatus === 'LIVE' || v.gpsStatus === 'RECENT');

        let newLat = v.latitude;
        let newLng = v.longitude;
        let newSpeed = v.speed;
        let lastGpsTimestamp = v.lastGpsTimestamp;

        if (isEmittingGps) {
          // Speed fluctuation
          const speedDelta = (Math.random() - 0.5) * 4;
          newSpeed = Math.round(Math.max(18, Math.min(50, v.speed + speedDelta)));

          // Realistic movement on Brazzaville axes
          newLat = v.latitude + (Math.random() - 0.48) * 0.0003;
          newLng = v.longitude + (Math.random() - 0.48) * 0.0003;

          // Clamping to Brazzaville urban zone
          if (newLat < -4.31) newLat = -4.305;
          if (newLat > -4.22) newLat = -4.225;
          if (newLng < 15.22) newLng = 15.225;
          if (newLng > 15.31) newLng = 15.305;

          // Fresh timestamp
          lastGpsTimestamp = now.toISOString();
        }

        // Passenger occupancy variations
        let currentOcc = v.occupancy.current;
        if (Math.random() > 0.75 && v.capacity.max > 0) {
          const deltaOcc = Math.random() > 0.5 ? 1 : -1;
          currentOcc = Math.max(0, Math.min(v.capacity.max, currentOcc + deltaOcc));
        }
        const occPct = v.capacity.max > 0 ? Math.round((currentOcc / v.capacity.max) * 100) : 0;

        // Resolve State Machine
        const resolved = resolveVehicleState({
          vehicleStatus: v.vehicleStatus,
          serviceStatus: v.serviceStatus,
          lastGpsTimestamp: lastGpsTimestamp,
          currentTime: now,
        });

        return {
          ...v,
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
          gpsAgeSeconds: resolved.gpsAgeSeconds,
          lastGpsUpdate: resolved.lastGpsUpdateFormatted,
          gpsConnectionStatus: resolved.legacyGpsStatus,
          speed: isEmittingGps ? newSpeed : v.speed,
          latitude: Number(newLat.toFixed(6)),
          longitude: Number(newLng.toFixed(6)),
          occupancy: {
            current: currentOcc,
            percentage: occPct,
          },
        };
      });

      this.notify();
    }, 2500);
  }

  private notify() {
    const snapshot = [...this.vehicles];
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const gpsSimulator = new GPSSimulator();
