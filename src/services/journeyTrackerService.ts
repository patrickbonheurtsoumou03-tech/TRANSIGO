import { ActiveJourneyState, MultimodalOption, ProximityAlertRule } from '../types';

export const DEFAULT_ALERT_RULES: ProximityAlertRule[] = [
  {
    id: 'ALERT-01',
    type: 'BUS_APPROACHING_500M',
    enabled: true,
    label: 'Bus à 500 m',
    description: 'Prévenir dès que le véhicule sélectionné approche à moins de 500 mètres',
  },
  {
    id: 'ALERT-02',
    type: 'BUS_ARRIVING_BOARDING_POINT',
    enabled: true,
    label: 'Bus à l’arrêt de montée',
    description: 'Alerter lors de l’accostage au point de prise en charge',
  },
  {
    id: 'ALERT-03',
    type: 'STOP_APPROACHING',
    enabled: true,
    label: 'Mon arrêt approche',
    description: 'Alerter 1 arrêt avant ma destination finale',
  },
  {
    id: 'ALERT-04',
    type: 'TRANSFER_REQUIRED',
    enabled: true,
    label: 'Correspondance imminente',
    description: 'Alerter au moment de descendre pour prendre le transport de correspondance',
  },
];

class JourneyTrackerService {
  private activeJourney: ActiveJourneyState | null = null;
  private listeners: ((state: ActiveJourneyState | null) => void)[] = [];

  getActiveJourney(): ActiveJourneyState | null {
    return this.activeJourney;
  }

  startJourney(option: MultimodalOption, destinationName: string): ActiveJourneyState {
    const now = new Date();
    const etaMinutes = option.totalDurationMinutes || 25;
    const etaDate = new Date(now.getTime() + etaMinutes * 60000);
    const etaStr = `${String(etaDate.getHours()).padStart(2, '0')}:${String(etaDate.getMinutes()).padStart(2, '0')}`;

    this.activeJourney = {
      active: true,
      option,
      destinationName,
      currentStepIndex: 0,
      startTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      etaArrivalTime: etaStr,
      currentVehicleId: option.vehicleId || 'BUS-DEMO-001',
      currentVehicleSpeed: 28,
      currentVehicleNextStop: option.boardingPoint.name,
      distanceToBoardingMeters: option.walkingDistanceMeters,
      remainingStops: option.stopsCount || 4,
      proximityAlerts: JSON.parse(JSON.stringify(DEFAULT_ALERT_RULES)),
      notificationsLog: [
        {
          time: 'À l’instant',
          message: `Trajet démarré vers ${destinationName} via ${option.title}. Marchez vers ${option.boardingPoint.name} (${option.walkingDistanceMeters} m).`,
          type: 'info',
        },
        {
          time: 'À l’instant',
          message: `Véhicule connecté en approche. ETA estimée au point de montée : ~4 min.`,
          type: 'approach',
        },
      ],
    };

    this.notify();
    return this.activeJourney;
  }

  toggleAlert(alertId: string): void {
    if (!this.activeJourney) return;
    this.activeJourney.proximityAlerts = this.activeJourney.proximityAlerts.map((a) =>
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    );
    this.notify();
  }

  advanceToNextStep(): void {
    if (!this.activeJourney) return;
    const maxSteps = this.activeJourney.option.steps.length;
    if (this.activeJourney.currentStepIndex < maxSteps - 1) {
      this.activeJourney.currentStepIndex += 1;
      const step = this.activeJourney.option.steps[this.activeJourney.currentStepIndex];
      this.activeJourney.notificationsLog.unshift({
        time: 'À l’instant',
        message: `Étape suivante : ${step.instruction}`,
        type: 'info',
      });
      if (this.activeJourney.remainingStops > 1) {
        this.activeJourney.remainingStops -= 1;
      }
      this.notify();
    } else {
      this.endJourney();
    }
  }

  triggerSimulatedAlert(type: '500m' | 'arriving' | 'next_stop'): void {
    if (!this.activeJourney) return;
    if (type === '500m') {
      this.activeJourney.distanceToBoardingMeters = 500;
      this.activeJourney.notificationsLog.unshift({
        time: 'À l’instant',
        message: `Votre bus (${this.activeJourney.currentVehicleId}) est à 500 m de ${this.activeJourney.option.boardingPoint.name}. Préparez-vous à monter.`,
        type: 'approach',
      });
    } else if (type === 'arriving') {
      this.activeJourney.distanceToBoardingMeters = 30;
      this.activeJourney.notificationsLog.unshift({
        time: 'À l’instant',
        message: `Votre bus arrive à votre point de prise en charge (${this.activeJourney.option.boardingPoint.name}). Montez à bord.`,
        type: 'alarm',
      });
    } else if (type === 'next_stop') {
      this.activeJourney.remainingStops = 1;
      this.activeJourney.notificationsLog.unshift({
        time: 'À l’instant',
        message: `Votre arrêt approche. Préparez-vous à descendre au prochain arrêt.`,
        type: 'alarm',
      });
    }
    this.notify();
  }

  endJourney(): void {
    this.activeJourney = null;
    this.notify();
  }

  subscribe(listener: (state: ActiveJourneyState | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.activeJourney));
  }
}

export const journeyTrackerService = new JourneyTrackerService();
