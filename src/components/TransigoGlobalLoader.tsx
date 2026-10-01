import React from 'react';
import officialLogoImg from '../assets/images/official_logo_1790619696586.jpg';

interface TransigoGlobalLoaderProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TransigoGlobalLoader: React.FC<TransigoGlobalLoaderProps> = ({
  message = 'Chargement TRANSIGO...',
  subMessage = 'Synchronisation des lignes et positions GPS en cours',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none">
      {/* Outer Pulse Container */}
      <div className="relative flex items-center justify-center mb-4">
        {/* Animated GPS Rotating Ring */}
        <div className="absolute inset-0 -m-3 rounded-full border-2 border-dashed border-emerald-400/60 animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-0 -m-1 rounded-full border border-amber-400/40 animate-[spin_5s_linear_infinite_reverse]" />

        {/* Center Logo Box */}
        <div
          className={`${sizeClasses[size]} bg-white rounded-2xl p-1.5 shadow-lg border border-emerald-100 flex items-center justify-center animate-pulse`}
        >
          <img
            src={officialLogoImg}
            alt="Chargement TRANSIGO"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Text Message */}
      <h3 className="text-stone-900 font-bold text-sm sm:text-base tracking-tight">
        {message}
      </h3>
      {subMessage && (
        <p className="text-stone-500 text-xs mt-1 max-w-xs">{subMessage}</p>
      )}
    </div>
  );
};
