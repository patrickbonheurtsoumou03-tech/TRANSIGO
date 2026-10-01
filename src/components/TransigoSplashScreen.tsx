import React, { useState, useEffect } from 'react';
import officialLogoImg from '../assets/images/official_logo_1790619696586.jpg';

interface TransigoSplashScreenProps {
  onFinish: () => void;
  autoStart?: boolean;
}

export const TransigoSplashScreen: React.FC<TransigoSplashScreenProps> = ({
  onFinish,
  autoStart = true,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (!autoStart) return;

    const startTime = performance.now();
    const interval = setInterval(() => {
      const current = (performance.now() - startTime) / 1000;
      setElapsed(current);

      if (current >= 4.2 && !isFadingOut) {
        setIsFadingOut(true);
      }

      if (current >= 4.6) {
        clearInterval(interval);
        onFinish();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [autoStart, onFinish, isFadingOut]);

  // Precise timing phases (Total 4.5 seconds)
  // Step 1: Fond Propre (0 -> 0.7s)
  const isFond = elapsed >= 0;
  // Step 2: Symbole 'T' (0.7 -> 1.5s)
  const isStep2T = elapsed >= 0.7;
  // Step 3: Intégration du Bus (1.5 -> 2.3s)
  const isStep3Bus = elapsed >= 1.5;
  // Step 4: Lignes de Route & Mouvement (2.3 -> 3.0s)
  const isStep4Route = elapsed >= 2.3;
  // Step 5: Logo Officiel Complet (3.0 -> 3.7s)
  const isStep5Logo = elapsed >= 3.0;
  // Step 6: Signature de Marque (3.7 -> 4.2s)
  const isStep6Signature = elapsed >= 3.7;
  // Step 7: Stabilité & Transition Douce (4.2 -> 4.6s)
  const isStep7Stable = elapsed >= 4.2;

  const currentPhaseTitle = isStep7Stable
    ? 'Entrée dans l’application'
    : isStep6Signature
    ? 'Signature Officielle'
    : isStep5Logo
    ? 'Logo TRANSIGO Officiel'
    : isStep4Route
    ? 'Lignes de Trajectoire & Mobilité'
    : isStep3Bus
    ? 'Intégration du Transport Urbain'
    : isStep2T
    ? 'Matérialisation du T'
    : 'Initialisation Système';

  return (
    <div
      role="region"
      aria-label="Écran de démarrage TRANSIGO"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none overflow-hidden transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } bg-white text-stone-900`}
    >
      {/* Background Soft Depth Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div
          className={`w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl transition-all duration-1000 ${
            isFond ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />
        <div className="absolute w-[700px] h-[700px] rounded-full bg-[#006948]/5 blur-[120px]" />
      </div>

      {/* Top Discreet Phase Indicator & Skip Button */}
      <div className="w-full max-w-4xl px-6 pt-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2 bg-stone-50/80 backdrop-blur-md px-3 py-1 rounded-full border border-stone-200 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-[#006948] tracking-wider uppercase">
            TRANSIGO STARTUP • {elapsed.toFixed(1)}s / 4.5s
          </span>
        </div>

        <button
          onClick={onFinish}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 bg-stone-50/80 hover:bg-stone-100 backdrop-blur px-3 py-1 rounded-full border border-stone-200 transition-colors shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
          title="Passer au tableau de bord"
        >
          <span>Passer</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      {/* Center Startup Animation Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-sm px-6 text-center">
        {/* Visual Assembly Canvas */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-6">
          {/* Step 4: Movement / Route SVG Vector Lines */}
          <svg
            viewBox="0 0 200 200"
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
              isStep4Route && !isStep5Logo ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#006948"
              strokeWidth="3"
              strokeDasharray="300"
              strokeDashoffset={isStep4Route ? '0' : '300'}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <path
              d="M 30,100 A 70,70 0 1,1 170,100 A 50,50 0 1,1 50,100"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="400"
              strokeDashoffset={isStep4Route ? '0' : '400'}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out delay-100"
            />
          </svg>

          {/* Step 2: Emergence of 'T' Symbol */}
          <div
            className={`absolute z-10 flex items-center justify-center transition-all duration-600 ease-out ${
              isStep2T && !isStep5Logo
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-3'
            }`}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#006948] to-emerald-900 rounded-2xl shadow-xl flex items-center justify-center border-2 border-emerald-300/40">
              <span className="text-white font-black text-6xl tracking-tighter drop-shadow-md">
                T
              </span>
            </div>
          </div>

          {/* Step 3: Bus Arrival & Integration */}
          <div
            className={`absolute z-20 transition-all duration-700 ease-out ${
              isStep3Bus && !isStep5Logo
                ? 'opacity-100 translate-x-3 scale-100'
                : 'opacity-0 -translate-x-20 scale-75'
            }`}
          >
            <div className="bg-amber-400 text-stone-950 font-black px-3 py-1.5 rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">directions_bus</span>
              <span className="text-xs uppercase tracking-wider">MOBILITÉ</span>
            </div>
          </div>

          {/* Step 5: Full Official Logo Reveal (Authentic Asset Fidelity) */}
          <div
            className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-600 ease-out ${
              isStep5Logo
                ? `opacity-100 scale-100 ${isStep7Stable ? 'scale-[1.02]' : ''}`
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="w-52 h-52 bg-white p-3 rounded-3xl shadow-xl border border-stone-200 flex items-center justify-center">
              <img
                src={officialLogoImg}
                alt="Logo Officiel TRANSIGO"
                className="w-full h-full object-contain select-none"
              />
            </div>
          </div>
        </div>

        {/* Step 6: Official Brand Signature & Slogan */}
        <div
          className={`flex flex-col items-center transition-all duration-500 ease-out ${
            isStep6Signature ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="text-xs uppercase tracking-widest font-black text-[#006948] mb-1">
            TRANSIGO
          </div>
          <p className="text-sm font-bold text-stone-700 tracking-wide">
            Votre itinéraire, notre priorité
          </p>
          <span className="text-[11px] text-stone-400 mt-1 font-medium">
            Plateforme Numérique de Transport Urbain
          </span>
        </div>
      </div>

      {/* Bottom Minimal Progress Bar */}
      <div className="w-full max-w-md px-6 pb-8 relative z-20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span className="font-semibold text-stone-700">{currentPhaseTitle}</span>
          <span className="font-mono">{Math.min(100, Math.round((elapsed / 4.5) * 100))}%</span>
        </div>

        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-[#006948] to-emerald-800 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${Math.min(100, (elapsed / 4.5) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
