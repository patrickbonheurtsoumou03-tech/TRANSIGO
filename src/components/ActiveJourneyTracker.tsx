import React, { useState, useEffect } from 'react';
import { ActiveJourneyState, PageId } from '../types';
import { journeyTrackerService } from '../services/journeyTrackerService';

interface ActiveJourneyTrackerProps {
  onNavigate: (page: PageId, params?: any) => void;
}

export const ActiveJourneyTracker: React.FC<ActiveJourneyTrackerProps> = ({ onNavigate }) => {
  const [journey, setJourney] = useState<ActiveJourneyState | null>(
    journeyTrackerService.getActiveJourney()
  );
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = journeyTrackerService.subscribe((state) => {
      setJourney(state);
    });
    return unsubscribe;
  }, []);

  if (!journey || !journey.active) {
    return null;
  }

  const currentStep = journey.option.steps[journey.currentStepIndex] || journey.option.steps[0];

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[460px] z-50 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-[#0b1329] text-white rounded-2xl shadow-2xl border border-emerald-500/40 overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#006948] to-[#044e36] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                Mode Trajet en cours • Brazzaville
              </span>
              <span className="text-sm font-bold text-white truncate max-w-[240px]">
                Vers {journey.destinationName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={minimized ? 'Agrandir' : 'Réduire'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {minimized ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            <button
              onClick={() => journeyTrackerService.endJourney()}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors"
              title="Terminer le trajet"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Minimized View */}
        {minimized ? (
          <div className="p-3 flex items-center justify-between text-xs bg-[#0f172a]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400">{journey.currentVehicleId}</span>
              <span className="text-stone-400">• Arrivée estimée : {journey.etaArrivalTime}</span>
            </div>
            <button
              onClick={() => setMinimized(false)}
              className="text-xs font-bold text-emerald-300 hover:underline"
            >
              Détails
            </button>
          </div>
        ) : (
          /* Expanded Full Tracker Content */
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Live Progress Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Arrivée</span>
                <span className="text-base font-black text-emerald-400">{journey.etaArrivalTime}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Arrêts restants</span>
                <span className="text-base font-black text-white">{journey.remainingStops} arrêts</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Vitesse Bus</span>
                <span className="text-base font-black text-amber-400">{journey.currentVehicleSpeed} km/h</span>
              </div>
            </div>

            {/* Current Step Instruction Banner */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0">
                {journey.currentStepIndex + 1}
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                  Étape en cours
                </span>
                <p className="text-xs font-medium text-stone-100">{currentStep.instruction}</p>
                {currentStep.durationText && (
                  <span className="inline-block mt-1 text-[11px] text-emerald-300 font-mono">
                    ⏱ {currentStep.durationText}
                  </span>
                )}
              </div>
            </div>

            {/* Step Progress Line */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>Vous êtes ici</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round(((journey.currentStepIndex + 1) / journey.option.steps.length) * 100)}%
                </span>
                <span>{journey.destinationName}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${((journey.currentStepIndex + 1) / journey.option.steps.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Section 11 : « Préviens-moi quand… » Alertes de proximité */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">notifications_active</span>
                  Préviens-moi quand…
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Geofencing actif</span>
              </div>
              <div className="space-y-1.5">
                {journey.proximityAlerts.map((alert) => (
                  <label
                    key={alert.id}
                    onClick={() => journeyTrackerService.toggleAlert(alert.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      alert.enabled
                        ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-500/20'
                        : 'bg-white/5 text-stone-400'
                    }`}
                  >
                    <span className="font-medium">{alert.label}</span>
                    <input
                      type="checkbox"
                      checked={alert.enabled}
                      onChange={() => {}}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Live Notifications Feed */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide block">
                Journal de suivi temps réel
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {journey.notificationsLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`text-[11px] p-2 rounded-lg flex items-start gap-2 ${
                      log.type === 'alarm'
                        ? 'bg-amber-900/40 text-amber-200 border border-amber-500/30'
                        : log.type === 'approach'
                        ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30'
                        : 'bg-white/5 text-stone-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">
                      {log.type === 'alarm' ? 'priority_high' : log.type === 'approach' ? 'radar' : 'info'}
                    </span>
                    <div className="flex-1">
                      <p>{log.message}</p>
                      <span className="text-[9px] opacity-60 font-mono">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Simulation Triggers */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
              <button
                onClick={() => journeyTrackerService.triggerSimulatedAlert('500m')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-medium text-stone-300 transition-colors"
              >
                Simuler bus à 500m
              </button>
              <button
                onClick={() => journeyTrackerService.triggerSimulatedAlert('arriving')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-medium text-emerald-300 transition-colors"
              >
                Simuler bus à quai
              </button>
              <button
                onClick={() => journeyTrackerService.triggerSimulatedAlert('next_stop')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-medium text-amber-300 transition-colors"
              >
                Simuler arrêt approche
              </button>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onNavigate('carte-gps', { vehicleId: journey.currentVehicleId });
                  setMinimized(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                Voir sur la Carte GPS
              </button>
              <button
                onClick={() => journeyTrackerService.advanceToNextStep()}
                className="py-2.5 px-3 rounded-xl bg-[#006948] hover:bg-[#0051d5] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
              >
                <span>Étape suivante</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
