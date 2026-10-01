import { UserReport } from '../types';

const INITIAL_REPORTS: UserReport[] = [
  {
    id: 'REP-2026-001',
    category: 'TARIF_DIFFERENT',
    description: 'Le receveur du Coaster a demandé 200 FCFA au lieu du tarif réglementé de 150 FCFA sur Bacongo - Moungali.',
    reportedPlaceOrLine: 'LIGNE-DEMO-02 (Coaster)',
    authorName: 'Jean-Marc M.',
    authorPhone: '+242 06 612 34 56',
    timestamp: 'Il y a 25 min',
    status: 'PENDING_REVIEW',
  },
  {
    id: 'REP-2026-002',
    category: 'ROUTE_BLOQUEE',
    description: 'Travaux de voirie temporaires après le carrefour Mafouta vers Bifouiti, déviation des bus vers l’avenue des 3 Martyrs.',
    reportedPlaceOrLine: 'Arrêt Bifouiti (Ligne 01)',
    authorName: 'Sylvie M.',
    authorPhone: '+242 05 523 78 90',
    timestamp: 'Il y a 1h',
    status: 'VERIFIED',
    adminDecision: 'Déviation validée par DGTTMU et signalée sur la carte',
    reviewerNotes: 'Alerte perturbation publiée.',
  },
  {
    id: 'REP-2026-003',
    category: 'GPS_INCORRECT',
    description: 'Le bus BUS-DEMO-003 était indiqué à l’arrêt mais est passé sans marquer l’arrêt complet.',
    reportedPlaceOrLine: 'BUS-DEMO-003 • Arrêt Rond-Point Moungali',
    authorName: 'Patrice K.',
    timestamp: 'Il y a 3h',
    status: 'PENDING_REVIEW',
  },
];

class UserReportService {
  private reports: UserReport[] = [...INITIAL_REPORTS];
  private listeners: ((reports: UserReport[]) => void)[] = [];

  getReports(): UserReport[] {
    return [...this.reports];
  }

  submitReport(report: Omit<UserReport, 'id' | 'timestamp' | 'status'>): UserReport {
    const newReport: UserReport = {
      ...report,
      id: `REP-2026-${String(this.reports.length + 1).padStart(3, '0')}`,
      timestamp: 'À l’instant',
      status: 'PENDING_REVIEW',
    };
    this.reports = [newReport, ...this.reports];
    this.notify();
    return newReport;
  }

  updateReportStatus(
    id: string,
    status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED',
    decision?: string,
    notes?: string
  ): void {
    this.reports = this.reports.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            adminDecision: decision || r.adminDecision,
            reviewerNotes: notes || r.reviewerNotes,
          }
        : r
    );
    this.notify();
  }

  subscribe(listener: (reports: UserReport[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.reports]));
  }
}

export const userReportService = new UserReportService();
