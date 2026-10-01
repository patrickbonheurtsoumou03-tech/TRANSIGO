import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { TransigoLogo } from './TransigoLogo';
import { userService, UserProfile, UserLocationState, UserRole } from '../services/userService';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  userBalance?: number;
  onOpenOnboarding?: () => void;
  onReplaySplash?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  userBalance = 4500,
  onOpenOnboarding,
  onReplaySplash,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(userService.getUser());
  const [location, setLocation] = useState<UserLocationState>(userService.getLocation());

  useEffect(() => {
    const unsub = userService.subscribe(() => {
      setUser(userService.getUser());
      setLocation(userService.getLocation());
    });
    return unsub;
  }, []);

  const navItems: { id: PageId; label: string; icon: string; roles?: UserRole[] }[] = [
    { id: 'accueil', label: 'Accueil', icon: 'home' },
    { id: 'passager', label: 'Recherche', icon: 'search' },
    { id: 'itineraires', label: 'Itinéraires', icon: 'alt_route' },
    { id: 'carte-gps', label: 'Carte Live GPS', icon: 'explore' },
    { id: 'lignes-arrets', label: 'Lignes & Arrêts', icon: 'timeline' },
    { id: 'chauffeur', label: 'Chauffeur', icon: 'steering_wheel' },
    { id: 'flotte', label: 'Flotte', icon: 'local_shipping' },
    { id: 'administration', label: 'Supervision', icon: 'shield_person' },
  ];

  const handleNav = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setRoleMenuOpen(false);
  };

  const handleSwitchRole = (newRole: UserRole) => {
    userService.setRole(newRole);
    setRoleMenuOpen(false);
    // Suggest relevant page based on role
    if (newRole === 'CHAUFFEUR') {
      onNavigate('chauffeur');
    } else if (newRole === 'TRANSPORTEUR') {
      onNavigate('flotte');
    } else if (newRole === 'ADMIN') {
      onNavigate('administration');
    } else {
      onNavigate('passager');
    }
  };

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string; iconName: string }> = {
    PASSAGER: { label: 'Passager', bg: 'bg-[#006948]', text: 'text-white', iconName: 'person' },
    CHAUFFEUR: { label: 'Chauffeur', bg: 'bg-amber-500', text: 'text-stone-950', iconName: 'directions_bus' },
    TRANSPORTEUR: { label: 'Transporteur', bg: 'bg-blue-600', text: 'text-white', iconName: 'business' },
    ADMIN: { label: 'Admin', bg: 'bg-purple-700', text: 'text-white', iconName: 'admin_panel_settings' },
  };

  const currentRoleConfig = roleLabels[user.role] || roleLabels.PASSAGER;

  const initials = `${user.firstName?.[0] || 'T'}${user.lastName?.[0] || 'S'}`.toUpperCase();

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#eaedff] shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
      <div className="h-20 w-full px-4 md:px-8 max-w-[1720px] mx-auto flex items-center justify-between gap-3">
        {/* Brand Lockup with Official TRANSIGO Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => handleNav('accueil')}
        >
          {/* Exact Official TRANSIGO Logo */}
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white p-1 border border-[#eaedff] shadow-sm flex items-center justify-center">
            <TransigoLogo size="custom" className="h-full w-full" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#006948]">TRANSIGO</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold uppercase tracking-wider">
                Officiel
              </span>
            </div>
            <span className="text-[11px] text-[#6d7a72] -mt-0.5 font-medium truncate max-w-[190px]">
              Votre itinéraire, notre priorité
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#006948] text-white shadow-sm'
                    : 'text-[#3d4a42] hover:text-[#131b2e] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions, Role Switcher & Live GPS telemetry */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Motion System & Onboarding Quick Triggers */}
          <div className="hidden lg:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            {onReplaySplash && (
              <button
                onClick={onReplaySplash}
                title="Revoir le Splash Screen Officiel (4.5s Motion Design System)"
                className="px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:text-[#006948] bg-white rounded-lg shadow-xs hover:bg-emerald-50 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-700">play_circle</span>
                <span>Splash 4.5s</span>
              </button>
            )}
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                title="Relancer le parcours d'onboarding complet"
                className="px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:text-[#006948] bg-white rounded-lg shadow-xs hover:bg-emerald-50 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-700">person_add</span>
                <span>Onboarding</span>
              </button>
            )}
          </div>

          {/* Real GPS Indicator Badge */}
          <button
            onClick={() => userService.requestRealGeolocation()}
            title={
              location.available
                ? `GPS Actif (${location.source}) : ${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)} (±${location.accuracy}m)`
                : 'Cliquer pour autoriser votre position GPS réelle'
            }
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              location.available
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                location.available ? 'bg-emerald-600 animate-ping' : 'bg-stone-400'
              }`}
            />
            <span className="material-symbols-outlined text-[15px]">my_location</span>
            <span>{location.available ? `GPS ±${location.accuracy}m` : 'GPS Inactif'}</span>
          </button>

          {/* Interactive Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl border border-stone-200 bg-white hover:border-[#006948] shadow-xs transition-all text-xs font-bold"
              title="Changer de Rôle utilisateur (Passager, Chauffeur, Transporteur, Admin)"
            >
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${currentRoleConfig.bg} ${currentRoleConfig.text}`}>
                <span className="material-symbols-outlined text-[13px]">{currentRoleConfig.iconName}</span>
                <span>{currentRoleConfig.label}</span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-stone-500">
                arrow_drop_down
              </span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Changer de Profil
                  </span>
                  <div className="text-xs font-black text-stone-800">
                    {user.firstName} {user.lastName}
                  </div>
                </div>

                <div className="space-y-1">
                  {(['PASSAGER', 'CHAUFFEUR', 'TRANSPORTEUR', 'ADMIN'] as UserRole[]).map(
                    (roleKey) => {
                      const cfg = roleLabels[roleKey];
                      const isSelected = user.role === roleKey;
                      return (
                        <button
                          key={roleKey}
                          onClick={() => handleSwitchRole(roleKey)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-[#006948]'
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">{cfg.iconName}</span>
                            <span>{cfg.label}</span>
                          </div>
                          {isSelected && <span className="material-symbols-outlined text-[16px] text-[#006948]">check</span>}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Account Trigger */}
          <button
            onClick={() => handleNav('profil')}
            className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl transition-all border ${
              currentPage === 'profil'
                ? 'bg-[#eaedff] border-[#006948]'
                : 'bg-[#f2f3ff] border-transparent hover:bg-[#eaedff]'
            }`}
            title="Consulter mon Profil & Titres de Transport"
          >
            <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#131b2e] leading-tight truncate max-w-[100px]">
                {user.firstName}
              </span>
              <span className="text-[10px] text-[#006948] font-bold">
                {userBalance.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#131b2e] hover:bg-[#eaedff] transition-colors"
            aria-label="Ouvrir le menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#eaedff] px-4 py-4 shadow-xl flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2.5 bg-[#f2f3ff] rounded-xl flex items-center justify-between text-xs text-[#006948] font-bold mb-1">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse" />
              <span className="material-symbols-outlined text-[16px]">{currentRoleConfig.iconName}</span>
              Profil actif : {currentRoleConfig.label}
            </span>
            <span className="text-[#6d7a72] font-mono">
              {location.available ? `GPS ±${location.accuracy}m` : 'GPS Inactif'}
            </span>
          </div>

          <div className="flex gap-2 py-1">
            {onReplaySplash && (
              <button
                onClick={() => {
                  onReplaySplash();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-bold text-center bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-700">play_circle</span>
                <span>Splash 4.5s</span>
              </button>
            )}
            {onOpenOnboarding && (
              <button
                onClick={() => {
                  onOpenOnboarding();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-bold text-center bg-emerald-50 text-[#006948] hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Onboarding</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-[#006948] text-white'
                    : 'bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
