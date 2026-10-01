import React from 'react';
import { PageId } from '../types';
import { TransigoLogo } from './TransigoLogo';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white border-t border-[#eaedff] pt-12 pb-8 shadow-[0_-1px_8px_rgba(15,23,42,0.04)]">
      <div className="w-full px-4 md:px-8 max-w-[1720px] mx-auto flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Manifesto with Official Logo */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-white p-1 border border-stone-200 shadow-sm flex items-center justify-center">
                <TransigoLogo size="custom" className="h-full w-full" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl text-[#006948] tracking-tight">TRANSIGO</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#85f8c4] text-[#002114] rounded-full uppercase tracking-wider">
                    Brazzaville
                  </span>
                </div>
                <span className="text-xs text-stone-500 font-semibold">
                  Votre itinéraire, notre priorité
                </span>
              </div>
            </div>
            <p className="text-sm text-[#3d4a42] max-w-md leading-relaxed mt-1">
              Plateforme intelligente de transport public et de mobilité multimodale pour l'agglomération de Brazzaville.
              Télémétrie en temps réel, billettique dématérialisée et régulation de lignes.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f2f3ff] rounded-lg text-[#3d4a42] text-xs font-medium">
                <span className="material-symbols-outlined text-[#006948] text-[16px]">location_on</span>
                Brazzaville, Poto-Poto, Bacongo, Makélékélé, Talangaï, Mpila
              </div>
            </div>
          </div>

          {/* Nav: Réseau & Services */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
              Réseau & Services
            </span>
            <button
              onClick={() => onNavigate('passager')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Calculateur d'itinéraires
            </button>
            <button
              onClick={() => onNavigate('lignes-arrets')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Lignes de bus & taxis-bus
            </button>
            <button
              onClick={() => onNavigate('carte-gps')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Positions GPS en direct
            </button>
            <button
              onClick={() => onNavigate('lignes-arrets')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Gares & Pôles d'échanges
            </button>
          </div>

          {/* Nav: Espaces Professionnels */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
              Espaces Professionnels
            </span>
            <button
              onClick={() => onNavigate('chauffeur')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Portail Chauffeur
            </button>
            <button
              onClick={() => onNavigate('flotte')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Gestionnaires de Flottes
            </button>
            <button
              onClick={() => onNavigate('administration')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Console de Régulation
            </button>
            <button
              onClick={() => onNavigate('parametres-systeme')}
              className="text-left text-sm text-[#3d4a42] hover:text-[#006948] transition-colors"
            >
              Système & Passerelles API
            </button>
          </div>

          {/* Support & Sécurité */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
              Support & Sécurité
            </span>
            <span className="text-sm text-[#3d4a42]">Centre d'assistance 24/7</span>
            <span className="text-sm font-bold text-[#006948]">+242 06 000 00 00</span>
            <span className="text-sm text-[#3d4a42]">support@transigo.cg</span>
            <div className="mt-2 px-3 py-1.5 bg-[#f2f3ff] rounded-lg text-[11px] font-mono font-semibold text-[#006948]">
              Données de démonstration simulées
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-[#eaedff] text-xs text-[#6d7a72]">
          <span>© 2026 TRANSIGO Brazzaville. Tous droits réservés. République du Congo.</span>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('accueil')}
              className="hover:text-[#006948] transition-colors"
            >
              Confidentialité
            </button>
            <button
              onClick={() => onNavigate('accueil')}
              className="hover:text-[#006948] transition-colors"
            >
              Conditions d'utilisation
            </button>
            <button
              onClick={() => onNavigate('parametres-systeme')}
              className="hover:text-[#006948] transition-colors font-bold text-[#006948]"
            >
              Statut Télémétrie GPS
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
