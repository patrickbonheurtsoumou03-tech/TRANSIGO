import React from 'react';
import officialLogoImg from '../assets/images/official_logo_1790619696586.jpg';

interface TransigoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
  showSubtitle?: boolean;
  variant?: 'full' | 'emblem';
}

/**
 * Composant officiel du Logo TRANSIGO
 * Conforme aux exigences strictes :
 * - Utilise l'image officielle exacte
 * - Préserve strictement les proportions (object-contain)
 * - Aucune modification graphique, aucune icône de substitution
 */
export const TransigoLogo: React.FC<TransigoLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'Logo Officiel TRANSIGO — Votre Itinéraire, Notre Priorité',
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10 sm:h-12 sm:w-12',
    md: 'h-12 w-12 sm:h-14 sm:w-14',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
    xl: 'h-24 w-24 sm:h-32 sm:w-32',
    custom: '',
  };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${size !== 'custom' ? sizeClasses[size] : ''} ${className}`}>
      <img
        src={officialLogoImg}
        alt={alt}
        className="w-full h-full object-contain select-none"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
