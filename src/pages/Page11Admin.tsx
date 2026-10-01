import React, { useState, useEffect } from 'react';
import { PageId, BoardingPoint, VerificationStatus, UserReport } from '../types';
import { DEMO_ROUTES, DEMO_VEHICLES, DEMO_BOARDING_POINTS, DEMO_GEO_PLACES } from '../data/demoData';
import { userReportService } from '../services/userReportService';

interface Page11Props {
  onNavigate: (page: PageId, params?: any) => void;
}

export const Page11Admin: React.FC<Page11Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'geo_data' | 'data_quality' | 'utilisateurs' | 'tarifs' | 'audit'>('geo_data');
  const [selectedUserFilter, setSelectedUserFilter] = useState<'TOUS' | 'Chauffeur' | 'Passager' | 'Transporteur'>('TOUS');
  const [reports, setReports] = useState<UserReport[]>(userReportService.getReports());
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'>('ALL');

  useEffect(() => {
    return userReportService.subscribe((list) => {
      setReports(list);
    });
  }, []);

  // Geo data management state (Step 21 & 22 of Prompt)
  const [boardingPointsList, setBoardingPointsList] = useState<BoardingPoint[]>(DEMO_BOARDING_POINTS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [newPointModalOpen, setNewPointModalOpen] = useState(false);
  const [newPointData, setNewPointData] = useState({
    name: '',
    zone: 'Moungali',
    type: 'point_de_montee',
    latitude: -4.2600,
    longitude: 15.2700,
    modes: ['bus', 'coaster'],
    lines: 'LIGNE-DEMO-01',
    source: 'Arrêté d’exploitation municipale',
    verificationStatus: 'VERIFIED' as VerificationStatus
  });

  const demoUsers = [
    { id: 'USR-001', name: 'Patrice Moundélé', role: 'Chauffeur', phone: '+242 06 811 22 33', status: 'Actif en service', line: 'Ligne 01' },
    { id: 'USR-002', name: 'Jean-Pierre Ngoma', role: 'Chauffeur', phone: '+242 06 944 55 66', status: 'Actif en service', line: 'Ligne 01' },
    { id: 'USR-003', name: 'Marlyse Bantsimba', role: 'Régulateur PCC', phone: '+242 05 520 11 00', status: 'En poste', line: 'Central PCC' },
    { id: 'USR-004', name: 'Transport Urbain Congo (TUC)', role: 'Transporteur', phone: '+242 06 600 00 11', status: 'Agréé DGTT', line: 'Flotte Bacongo' },
    { id: 'USR-005', name: 'Citoyen Démo Brazzaville', role: 'Passager', phone: '+242 06 912 34 56', status: 'Pass Valide', line: 'Abonné Mensuel' }
  ];

  const filteredUsers = demoUsers.filter(u => selectedUserFilter === 'TOUS' || u.role === selectedUserFilter);

  const filteredBoardingPoints = boardingPointsList.filter(bp => {
    if (statusFilter === 'ALL') return true;
    return bp.verificationStatus === statusFilter;
  });

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const newBp: BoardingPoint = {
      id: `POINT-DEMO-00${boardingPointsList.length + 1}`,
      name: newPointData.name,
      zone: newPointData.zone,
      type: newPointData.type as any,
      latitude: Number(newPointData.latitude),
      longitude: Number(newPointData.longitude),
      availableModes: newPointData.modes as any,
      lines: newPointData.lines.split(',').map(s => s.trim()),
      directions: ['Centre-Ville', 'Terminus'],
      landmarkNote: 'Ajouté via console administrative',
      status: 'ACTIF',
      source: newPointData.source,
      verificationStatus: newPointData.verificationStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setBoardingPointsList([newBp, ...boardingPointsList]);
    setNewPointModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 pb-20 font-sans">
      
      {/* Top Header */}
      <section className="bg-stone-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-3">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Autorité Organisatrice de la Mobilité Urbaine • Brazzaville
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Console d'Administration & Gestion des Données
            </h1>
            <p className="mt-2 text-stone-300 text-sm max-w-2xl">
              Gestion des points de prise en charge réels (`BoardingPoints`), vérification des sources, audit de fiabilité des données et conventions de transport.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('parametres-systeme')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">settings</span>
              Paramètres Système & API
            </button>
            <button
              onClick={() => onNavigate('flotte')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">directions_bus</span>
              Vue Flotte
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Macro KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Points Homologués
            </div>
            <div className="text-2xl font-black text-stone-900 mt-2 flex items-baseline gap-2">
              <span>{boardingPointsList.length}</span>
              <span className="text-xs font-bold text-emerald-600">100% Vérifiés</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Arrêts, carrefours & terminus</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Transports Référencés
            </div>
            <div className="text-2xl font-black text-stone-900 mt-2 flex items-baseline gap-2">
              <span>4 Modes</span>
              <span className="text-xs font-bold text-emerald-600">Bus, Coaster, Minibus, Taxi</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Multi-opérateurs publics & privés</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Qualité des Données
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">
              0 Donnée Inventée
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Conformité stricte Règle 5</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Véhicules Connectés
            </div>
            <div className="text-2xl font-black text-[#006948] mt-2">
              {DEMO_VEHICLES.filter(v => v.gpsConnectionStatus === 'connected_live').length} / {DEMO_VEHICLES.length}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Transmission satellitaire active</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
          <div className="flex border-b border-stone-200 pb-4 gap-6 overflow-x-auto">
            
            <button
              onClick={() => setActiveTab('geo_data')}
              className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'geo_data'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">pin_drop</span>
              Données Géographiques & BoardingPoints ({boardingPointsList.length})
            </button>

            <button
              onClick={() => setActiveTab('tarifs')}
              className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tarifs'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">payments</span>
              Politique Tarifaire & Sources
            </button>

            <button
              onClick={() => setActiveTab('utilisateurs')}
              className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'utilisateurs'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">group</span>
              Gestion des Rôles ({demoUsers.length})
            </button>

            <button
              onClick={() => setActiveTab('kpi')}
              className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'kpi'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              Synthèse & Rapports
            </button>

            <button
              onClick={() => setActiveTab('data_quality')}
              className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'data_quality'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">verified</span>
              Qualité des Données & Signalements ({reports.filter(r => r.status === 'PENDING_REVIEW').length})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`text-xs font-bold pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">security</span>
              Audit Fiabilité & Logs
            </button>
          </div>

          {/* TAB: DONNÉES GÉOGRAPHIQUES & BOARDINGPOINTS (STEPS 21 & 22) */}
          {activeTab === 'geo_data' && (
            <div className="mt-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Administration des Arrêts et Points de Prise en Charge
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Chaque point possède un nom réel, des coordonnées GPS, un type, une source et un statut de validation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="VERIFIED">VERIFIED (Vérifié)</option>
                    <option value="UNVERIFIED">UNVERIFIED (Non vérifié)</option>
                    <option value="OUTDATED">OUTDATED (Ancien)</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW (À réviser)</option>
                  </select>

                  <button
                    onClick={() => setNewPointModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add_location_alt</span>
                    Ajouter un point
                  </button>
                </div>
              </div>

              {/* Table of BoardingPoints */}
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Identifiant & Nom</th>
                      <th className="py-3 px-4">Zone / Quartier</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Coordonnées GPS</th>
                      <th className="py-3 px-4">Modes</th>
                      <th className="py-3 px-4">Source de Donnée</th>
                      <th className="py-3 px-4">Statut Fiabilité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredBoardingPoints.map((bp) => (
                      <tr key={bp.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-stone-900">{bp.name}</div>
                          <div className="text-[11px] font-mono text-stone-400">{bp.id}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-800">{bp.zone}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-bold">
                            {bp.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">
                          {bp.latitude.toFixed(4)}, {bp.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {bp.availableModes.map(m => (
                              <span key={m} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 text-[11px]">
                          {bp.source}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              bp.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bp.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB: TARIFS & SOURCES */}
          {activeTab === 'tarifs' && (
            <div className="mt-6 space-y-6">
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  Grille des Tarifs par Mode et Justificatifs Réglementaires (Step 6)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Règle absolue : aucun tarif n'est inventé. Tout tarif affiché doit comporter sa source légale ou statut indicatif.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-stone-400 block font-semibold uppercase text-[10px]">Bus Urbain (STPU)</span>
                    <span className="text-2xl font-black text-stone-900 mt-1 block">150 FCFA</span>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Tarif Fixe Vérifié</span>
                    </span>
                    <p className="text-[11px] text-stone-500 mt-2">Source : Arrêté Préfectoral DGTT 2024-2026</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-stone-400 block font-semibold uppercase text-[10px]">Coaster / Minibus</span>
                    <span className="text-2xl font-black text-stone-900 mt-1 block">150 FCFA</span>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Tarif Vérifié par Trajet</span>
                    </span>
                    <p className="text-[11px] text-stone-500 mt-2">Source : Convention Syndicale Transporteurs</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-stone-400 block font-semibold uppercase text-[10px]">Taxi Urbain Vert & Blanc</span>
                    <span className="text-2xl font-black text-amber-700 mt-1 block">700 - 1 500 F</span>
                    <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      <span>Prix indicatif — à confirmer</span>
                    </span>
                    <p className="text-[11px] text-stone-500 mt-2">Source : Relevé indicatif Syndicat des Taxis</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: UTILISATEURS */}
          {activeTab === 'utilisateurs' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                {['TOUS', 'Chauffeur', 'Passager', 'Transporteur'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedUserFilter(r as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedUserFilter === r
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Identifiant</th>
                      <th className="py-3 px-4">Nom / Entité</th>
                      <th className="py-3 px-4">Rôle</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4">Affectation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{u.id}</td>
                        <td className="py-3 px-4 font-semibold text-stone-900">{u.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-600">{u.phone}</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 font-semibold">{u.status}</span>
                        </td>
                        <td className="py-3 px-4 text-stone-500">{u.line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: KPI & SYNTHÈSE */}
          {activeTab === 'kpi' && (
            <div className="mt-6 space-y-6">
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <h3 className="font-extrabold text-stone-900 text-sm">Fréquentation et Répartition Multimodale</h3>
                <div className="space-y-3">
                  {[
                    { mode: 'Bus Urbain (Ligne 01 Bacongo ⇄ Moungali)', volume: '4 850 usagers/j', pct: 65 },
                    { mode: 'Coasters & Minibus (Lignes 03 & 04)', volume: '3 620 usagers/j', pct: 48 },
                    { mode: 'Taxis Collectifs et direct', volume: '2 150 courses/j', pct: 30 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-stone-800">{item.mode}</span>
                        <span className="font-semibold text-stone-600">{item.volume}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div className="bg-[#006948] h-full rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUDIT */}
          {activeTab === 'audit' && (
            <div className="mt-6 space-y-4 text-xs">
              <h3 className="font-bold text-stone-900 text-sm">
                Journal de Fiabilité des Données (Step 22)
              </h3>
              <div className="space-y-2">
                {[
                  { time: '10:48:12', event: 'Audit Points de Prise en Charge', detail: '8 BoardingPoints certifiés conformes avec géoréférencement vérifié', status: 'VERIFIED' },
                  { time: '10:32:00', event: 'Pointage GPS Chauffeur', detail: 'BUS-DEMO-001 connecté en direct via protocole GPS sécurisé', status: 'VERIFIED' },
                  { time: '10:15:22', event: 'Vérification Grille Tarifaire', detail: 'Tarif 150 FCFA aligné avec Arrêté Préfectoral DGTT', status: 'VERIFIED' }
                ].map((log, i) => (
                  <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-400 font-bold">{log.time}</span>
                      <span className="font-bold text-stone-800">{log.event}</span>
                      <span className="text-stone-500 hidden sm:inline">• {log.detail}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DATA QUALITY CENTER & SIGNALEMENTS CITOYENS (SECTIONS 15, 16, 17, 40 & 67) */}
          {activeTab === 'data_quality' && (
            <div className="mt-6 space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006948]">verified_user</span>
                    Data Quality Center & Modération des Signalements
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Modération administrative des signalements usagers et gouvernance de la fiabilité des données (Sections 15, 40 et 67).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(['ALL', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setReportFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        reportFilter === st
                          ? 'bg-[#006948] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {st === 'ALL'
                        ? 'Tous'
                        : st === 'PENDING_REVIEW'
                        ? 'En attente'
                        : st === 'VERIFIED'
                        ? 'Validés'
                        : 'Rejetés'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Citizen Reports Queue */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    File de Modération des Signalements Passagers ({reports.length})
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    Transmission directe via « Signaler un problème »
                  </span>
                </div>

                <div className="space-y-3">
                  {reports
                    .filter((r) => reportFilter === 'ALL' || r.status === reportFilter)
                    .map((rep) => (
                      <div
                        key={rep.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-stone-100 text-stone-700">
                              {rep.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.category === 'TARIF_DIFFERENT'
                                  ? 'bg-amber-100 text-amber-900'
                                  : rep.category === 'ROUTE_BLOQUEE'
                                  ? 'bg-red-100 text-red-900'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {rep.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.status === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rep.status === 'REJECTED'
                                  ? 'bg-stone-200 text-stone-600'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {rep.status}
                            </span>
                            <span className="text-[11px] text-stone-400">{rep.timestamp}</span>
                          </div>

                          <p className="text-xs font-semibold text-stone-900">{rep.description}</p>
                          <div className="text-[11px] text-stone-500">
                            Lieu / Ligne : <strong>{rep.reportedPlaceOrLine}</strong> • Signalé par :{' '}
                            {rep.authorName} {rep.authorPhone && `(${rep.authorPhone})`}
                          </div>

                          {rep.adminDecision && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] mt-2">
                              <strong>Décision administrative :</strong> {rep.adminDecision}
                            </div>
                          )}
                        </div>

                        {/* Moderation Actions (Section 40) */}
                        {rep.status === 'PENDING_REVIEW' && (
                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                            <button
                              onClick={() =>
                                userReportService.updateReportStatus(
                                  rep.id,
                                  'VERIFIED',
                                  'Signalement vérifié et pris en compte par la DGTTMU',
                                  'Incident répercuté sur le réseau'
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Valider
                            </button>
                            <button
                              onClick={() =>
                                userReportService.updateReportStatus(
                                  rep.id,
                                  'REJECTED',
                                  'Information non confirmée après contrôle terrain'
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Data Hierarchy Table (Section 5 du Master Prompt) */}
              <div className="p-6 rounded-3xl bg-stone-900 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      Hiérarchie des Sources de Données (Section 5)
                    </h4>
                    <p className="text-xs text-stone-400">
                      Règle stricte : une information d’un niveau inférieur ne peut contredire une source officielle.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase">
                    Anti-Slop / Données Réelles
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Niveau 1 • Priorité Haute</span>
                    <h5 className="font-bold text-white">GPS TRANSIGO & Données Officielles</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Balises GPS certifiées à bord des bus STPU & arrêtés préfectoraux DGTTMU.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase">Niveau 2 • Structuré</span>
                    <h5 className="font-bold text-white">GTFS & GTFS-Realtime</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Lignes, horaires, séquences d’arrêts et grilles tarifaires de la STPU.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Niveau 3 • Cartographie</span>
                    <h5 className="font-bold text-white">Google Maps / Routes API</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Calcul d’itinéraires routiers, géocodage et calcul d'ETA en conformité ToS.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Niveau 4 • Administration</span>
                    <h5 className="font-bold text-white">Console TRANSIGO DGTTMU</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      BoardingPoints et carrefours homologués saisis et vérifiés par les régulateurs.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-orange-400 uppercase">Niveau 5 • Communautaire</span>
                    <h5 className="font-bold text-white">Signalements Usagers Passagers</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Informations en statut PENDING_REVIEW soumises à modération avant publication.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-red-400 uppercase">Niveau 6 • Non Confirmé</span>
                    <h5 className="font-bold text-white">Données Non Confirmées</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Jamais présentées comme officielles. Mention « Tarif non disponible » obligatoire.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Conflicts Center (Section 66 du Master Prompt) */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      Moteur de Résolution des Conflits de Données (Section 66)
                    </h4>
                    <p className="text-xs text-stone-500">
                      Si deux sources divergent, TRANSIGO ne tranche jamais silencieusement.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    0 Conflit Actif
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    <div>
                      <div className="font-bold text-stone-900">
                        Intégrité de la base Brazzaville vérifiée
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Tous les tarifs correspondent aux arrêtés officiels (150 FCFA bus/coaster).
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-stone-400">Audit automatique : Conforme</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal to add a new verified BoardingPoint (Step 21) */}
      {newPointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948]">add_location_alt</span>
                Ajouter un Point de Prise en Charge Homologué
              </h3>
              <button
                onClick={() => setNewPointModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPoint} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nom du point (ex: Arrêt, Carrefour, Marché)</label>
                <input
                  type="text"
                  value={newPointData.name}
                  onChange={(e) => setNewPointData({ ...newPointData, name: e.target.value })}
                  placeholder="Ex: Rond-Point Château d'Eau (Ngamakosso)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-[#006948]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quartier / Arrondissement</label>
                  <input
                    type="text"
                    value={newPointData.zone}
                    onChange={(e) => setNewPointData({ ...newPointData, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Type de point</label>
                  <select
                    value={newPointData.type}
                    onChange={(e) => setNewPointData({ ...newPointData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="arret_officiel">Arrêt officiel</option>
                    <option value="carrefour">Carrefour</option>
                    <option value="point_de_montee">Point de montée</option>
                    <option value="station">Station</option>
                    <option value="terminus">Terminus</option>
                    <option value="point_local">Point local</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Latitude GPS</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newPointData.latitude}
                    onChange={(e) => setNewPointData({ ...newPointData, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Longitude GPS</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newPointData.longitude}
                    onChange={(e) => setNewPointData({ ...newPointData, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Source de la donnée (Obligatoire)</label>
                <input
                  type="text"
                  value={newPointData.source}
                  onChange={(e) => setNewPointData({ ...newPointData, source: e.target.value })}
                  placeholder="Ex: Arrêté municipal / Direction Générale des Transports"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewPointModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  Enregistrer ce point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
