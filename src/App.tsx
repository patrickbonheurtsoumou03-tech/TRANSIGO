import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// The 12 Official Pages of TRANSIGO Master Prompt
import { Page01Accueil } from './pages/Page01Accueil';
import { Page02Auth } from './pages/Page02Auth';
import { Page03Passager } from './pages/Page03Passager';
import { Page04Itineraires } from './pages/Page04Itineraires';
import { Page05CarteGPS } from './pages/Page05CarteGPS';
import { Page06LignesArrets } from './pages/Page06LignesArrets';
import { Page07Profil } from './pages/Page07Profil';
import { Page08Chauffeur } from './pages/Page08Chauffeur';
import { Page09Flotte } from './pages/Page09Flotte';
import { Page10Vehicule } from './pages/Page10Vehicule';
import { Page11Admin } from './pages/Page11Admin';
import { Page12ParametresAPI } from './pages/Page12ParametresAPI';
import { ActiveJourneyTracker } from './components/ActiveJourneyTracker';

// Motion Design System & Account / Onboarding Modals
import { TransigoSplashScreen } from './components/TransigoSplashScreen';
import { TransigoOnboardingModal } from './components/TransigoOnboardingModal';
import { PageTransitionWrapper } from './components/PageTransitionWrapper';
import { userService } from './services/userService';
import { testConnection } from './services/firebase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('accueil');
  const [pageParams, setPageParams] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(2450);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Splash Screen State (Only on initial launch or when replayed)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('transigo_splash_seen');
  });

  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Navigation handler with smooth scroll to top
  const handleNavigate = (page: PageId, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('transigo_splash_seen', 'true');
    // If onboarding not completed, offer it smoothly after splash
    const user = userService.getUser();
    if (!user.onboardingCompleted && !sessionStorage.getItem('transigo_onboarding_prompted')) {
      sessionStorage.setItem('transigo_onboarding_prompted', 'true');
      setShowOnboarding(true);
    }
  };

  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  // Support browser hash / popstate
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = [
        'accueil',
        'authentification',
        'passager',
        'itineraires',
        'carte-gps',
        'lignes-arrets',
        'profil',
        'chauffeur',
        'flotte',
        'vehicule',
        'administration',
        'parametres-systeme',
      ];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Firebase Firestore Connection Check & Google Maps Quota Listener
  useEffect(() => {
    testConnection();

    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-[#006948] selection:text-white">
      {/* Google Maps Platform Quota Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Motion Design Splash Screen (Target: 4.5s) */}
      {showSplash && (
        <TransigoSplashScreen onFinish={handleSplashFinish} autoStart={true} />
      )}

      {/* Onboarding & Account Profile Setup Modal */}
      <TransigoOnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          const currentRole = userService.getUser().role;
          if (currentRole === 'CHAUFFEUR') {
            handleNavigate('chauffeur');
          } else if (currentRole === 'TRANSPORTEUR') {
            handleNavigate('flotte');
          } else if (currentRole === 'ADMIN') {
            handleNavigate('administration');
          } else {
            handleNavigate('passager');
          }
        }}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Top Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userBalance={userBalance}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onReplaySplash={handleReplaySplash}
      />

      {/* Main Content: 12 Master Pages with Standard 300ms Transition */}
      <main className="flex-1 w-full overflow-x-hidden flex flex-col">
        <PageTransitionWrapper
          pageKey={currentPage}
          transitionType={currentPage === 'carte-gps' ? 'zoom' : currentPage === 'vehicule' ? 'slide' : 'arrive'}
        >
          {currentPage === 'accueil' && (
            <Page01Accueil
              onNavigate={handleNavigate}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />
          )}

          {currentPage === 'authentification' && (
            <Page02Auth
              onNavigate={handleNavigate}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />
          )}

          {currentPage === 'passager' && (
            <Page03Passager onNavigate={handleNavigate} />
          )}

          {currentPage === 'itineraires' && (
            <Page04Itineraires
              onNavigate={handleNavigate}
              searchParams={pageParams}
            />
          )}

          {currentPage === 'carte-gps' && (
            <Page05CarteGPS
              onNavigate={handleNavigate}
              selectedVehicleId={pageParams?.vehicleId}
            />
          )}

          {currentPage === 'lignes-arrets' && (
            <Page06LignesArrets onNavigate={handleNavigate} />
          )}

          {currentPage === 'profil' && (
            <Page07Profil
              onNavigate={handleNavigate}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />
          )}

          {currentPage === 'chauffeur' && (
            <Page08Chauffeur onNavigate={handleNavigate} />
          )}

          {currentPage === 'flotte' && (
            <Page09Flotte onNavigate={handleNavigate} />
          )}

          {currentPage === 'vehicule' && (
            <Page10Vehicule
              onNavigate={handleNavigate}
              vehicleId={pageParams?.id}
            />
          )}

          {currentPage === 'administration' && (
            <Page11Admin onNavigate={handleNavigate} />
          )}

          {currentPage === 'parametres-systeme' && (
            <Page12ParametresAPI onNavigate={handleNavigate} />
          )}
        </PageTransitionWrapper>
      </main>

      {/* Persistent Page 05 (Map) has its own full screen layout, but footer for others */}
      {currentPage !== 'carte-gps' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Floating Active Journey Tracker HUD */}
      <ActiveJourneyTracker onNavigate={handleNavigate} />
    </div>
  );
}
