import React, { useState } from 'react';
import { userReportService } from '../services/userReportService';
import { UserReport } from '../types';

interface UserReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlaceOrLine?: string;
}

export const UserReportModal: React.FC<UserReportModalProps> = ({
  isOpen,
  onClose,
  defaultPlaceOrLine = 'Arrêt Total Bacongo'
}) => {
  const [category, setCategory] = useState<UserReport['category']>('BUS_ABSENT');
  const [description, setDescription] = useState('');
  const [reportedPlaceOrLine, setReportedPlaceOrLine] = useState(defaultPlaceOrLine);
  const [authorName, setAuthorName] = useState('Passager Citoyen');
  const [authorPhone, setAuthorPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    userReportService.submitReport({
      category,
      description,
      reportedPlaceOrLine,
      authorName: authorName.trim() || 'Anonyme',
      authorPhone: authorPhone.trim() || undefined
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px]">report_problem</span>
            <div>
              <h3 className="font-bold text-base leading-tight">Signaler un problème sur le réseau</h3>
              <p className="text-xs text-red-100">Transmis immédiatement à la régulation DGTTMU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h4 className="font-bold text-lg text-stone-900">Signalement bien reçu !</h4>
            <p className="text-sm text-stone-600">
              Merci pour votre contribution citoyenne. L'équipe de supervision municipale traite votre signalement sous le statut <strong>PENDING_REVIEW</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Catégorie d'incident
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50"
              >
                <option value="BUS_ABSENT">Bus absent / Non passage</option>
                <option value="ARRET_INCORRECT">Arrêt ou point de prise en charge incorrect</option>
                <option value="TARIF_DIFFERENT">Tarif appliqué différent du tarif officiel (150 FCFA)</option>
                <option value="ROUTE_BLOQUEE">Route bloquée / Travaux / Embouteillage majeur</option>
                <option value="GPS_INCORRECT">Position GPS incorrecte sur l'application</option>
                <option value="VEHICULE_PANNE">Véhicule en panne sur la voie publique</option>
                <option value="INFO_OBSOLETE">Information obsolète sur la ligne</option>
                <option value="AUTRE">Autre anomalie de mobilité</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Lieu ou Ligne concernée
              </label>
              <input
                type="text"
                value={reportedPlaceOrLine}
                onChange={(e) => setReportedPlaceOrLine(e.target.value)}
                placeholder="Ex: Rond-point Moungali, Ligne 01, Arrêt Bifouiti..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Description précise de l'incident
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Expliquez ce qui s'est passé (heure, direction, comportement observé...)"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Votre nom (optionnel)
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={authorPhone}
                  onChange={(e) => setAuthorPhone(e.target.value)}
                  placeholder="+242 06..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Envoyer le signalement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
