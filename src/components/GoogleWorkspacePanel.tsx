import React, { useState, useEffect } from 'react';
import {
  auth,
  googleSignIn,
  logout,
  getAccessToken
} from '../services/firebase';
import {
  googleWorkspace,
  GoogleContact,
  GmailMessage,
  DriveFile
} from '../services/googleWorkspace';

export const GoogleWorkspacePanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'gmail' | 'drive'>('contacts');

  // Contacts
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);

  // Gmail
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sendModalOpen, setSendModalOpen] = useState<boolean>(false);
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('Itinéraire TRANSIGO Brazzaville');
  const [emailBody, setEmailBody] = useState<string>(
    'Bonjour,\n\nVoici mon itinéraire de transport urbain :\n- Ligne 01 : Bacongo -> Moungali\n- Véhicule : BUS-DEMO-001\n- Tarif officiel : 200 FCFA\n\nPartagé via TRANSIGO Brazzaville.'
  );
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Drive
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [loadingDrive, setLoadingDrive] = useState<boolean>(false);
  const [driveModalOpen, setDriveModalOpen] = useState<boolean>(false);
  const [driveDocTitle, setDriveDocTitle] = useState<string>('TRANSIGO_Itineraire_Bacongo_Moungali');
  const [savingDrive, setSavingDrive] = useState<boolean>(false);
  const [driveSuccess, setDriveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setCurrentUser(u);
      const token = await getAccessToken();
      setHasToken(!!token);
      if (u) {
        loadData();
      }
    });
    return unsub;
  }, []);

  const loadData = async () => {
    loadContacts();
    loadMessages();
    loadDrive();
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const data = await googleWorkspace.getContacts();
      setContacts(data);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await googleWorkspace.getRecentMessages();
      setMessages(data);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadDrive = async () => {
    setLoadingDrive(true);
    try {
      const data = await googleWorkspace.getDriveFiles();
      setDriveFiles(data);
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await googleSignIn();
      const token = await getAccessToken();
      setHasToken(!!token);
      loadData();
    } catch (e) {
      console.error('Sign in error:', e);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setHasToken(false);
  };

  // Mandatory user confirmation for sending an email
  const handleConfirmSendEmail = async () => {
    if (!emailTo) return;
    setSendingEmail(true);
    try {
      const success = await googleWorkspace.sendEmail(emailTo, emailSubject, emailBody);
      if (success) {
        setEmailSuccess(`Email envoyé avec succès à ${emailTo}`);
        setSendModalOpen(false);
        setTimeout(() => setEmailSuccess(null), 4000);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // Mandatory user confirmation for saving to Drive
  const handleConfirmSaveDrive = async () => {
    setSavingDrive(true);
    try {
      const content = `TRANSIGO MOBILITÉ URBAINE - BRAZZAVILLE
Date: ${new Date().toLocaleDateString('fr-FR')}
Ligne: Ligne 01 • Bacongo <-> Moungali
Tarif officiel: 200 FCFA
Statut: Validé sur la plateforme officielle TRANSIGO
`;
      const file = await googleWorkspace.saveItineraryToDrive(driveDocTitle, content);
      if (file) {
        setDriveSuccess(`Fichier sauvegardé sur Google Drive (${file.name || driveDocTitle})`);
        setDriveModalOpen(false);
        loadDrive();
        setTimeout(() => setDriveSuccess(null), 4000);
      }
    } finally {
      setSavingDrive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center border border-emerald-100">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                Google Workspace • Services Connectés
              </h2>
              <p className="text-xs text-stone-500">
                Synchronisation officielle avec Google Contacts, Gmail et Google Drive.
              </p>
            </div>
          </div>

          <div>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-900">{currentUser.displayName || currentUser.email}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Session Active
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-all cursor-pointer"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Connecter mon compte Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Banner */}
        {emailSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{emailSuccess}</span>
          </div>
        )}
        {driveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{driveSuccess}</span>
          </div>
        )}

        {/* Sub-tabs Navigation */}
        <div className="grid grid-cols-3 gap-2 mt-6 p-1.5 bg-stone-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">contacts</span>
            <span>Google Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'gmail'
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">mail</span>
            <span>Gmail ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">folder</span>
            <span>Google Drive</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Contacts */}
      {activeTab === 'contacts' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Contacts de Mobilité & Sécurité
              </h3>
              <p className="text-xs text-stone-500">
                Partagez votre position en direct ou envoyez votre itinéraire en 1 clic.
              </p>
            </div>
            <button
              onClick={loadContacts}
              disabled={loadingContacts}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-all cursor-pointer"
              title="Rafraîchir les contacts"
            >
              <span className={`material-symbols-outlined text-base ${loadingContacts ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {contacts.map((contact, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {contact.displayName.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-stone-900 truncate">{contact.displayName}</div>
                    <div className="text-[11px] text-stone-500 truncate">{contact.phoneNumber || contact.email || 'Sans numéro'}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setEmailTo(contact.email || '');
                      setSendModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#006948] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">share</span>
                    <span>Partager trajet</span>
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">Brazzaville</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Gmail */}
      {activeTab === 'gmail' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Notifications & Reçus Gmail
              </h3>
              <p className="text-xs text-stone-500">
                Consultez vos confirmations de voyage et alertes trafic reçues par e-mail.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSendModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-emerald-800 transition-all"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>Envoyer un email</span>
              </button>
              <button
                onClick={loadMessages}
                disabled={loadingMessages}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-all cursor-pointer"
                title="Rafraîchir Gmail"
              >
                <span className={`material-symbols-outlined text-base ${loadingMessages ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-500/40 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">{msg.subject}</span>
                  <span className="text-[10px] text-stone-400 font-mono">{msg.date}</span>
                </div>
                <div className="text-[11px] text-stone-600 font-medium line-clamp-2">{msg.snippet}</div>
                <div className="text-[10px] text-stone-400 flex items-center gap-2">
                  <span>De : {msg.from}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Message Vérifié</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Google Drive */}
      {activeTab === 'drive' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Google Drive • Documents & Titres de Transport
              </h3>
              <p className="text-xs text-stone-500">
                Vos reçus de transport, attestations citoyennes et plans sauvegardés sur votre Drive.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDriveModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-emerald-800 transition-all"
              >
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                <span>Sauvegarder l'itinéraire</span>
              </button>
              <button
                onClick={loadDrive}
                disabled={loadingDrive}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-all cursor-pointer"
                title="Rafraîchir Drive"
              >
                <span className={`material-symbols-outlined text-base ${loadingDrive ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {driveFiles.map((file) => (
              <div key={file.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">description</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{file.name}</div>
                    <div className="text-[10px] text-stone-400">
                      {file.size} • Modifié le {file.modifiedTime || 'Récemment'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all"
                    >
                      Ouvrir
                    </a>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-mono">
                    Drive Sécurisé
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL: SEND EMAIL (Gmail) */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <h3 className="text-sm font-black text-stone-900">
                  Confirmation d'envoi Gmail
                </h3>
              </div>
              <button
                onClick={() => setSendModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Voulez-vous autoriser l'envoi de cet e-mail depuis votre compte Gmail connecté ?
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Destinataire :</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@exemple.com"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Objet :</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Corps du message :</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                onClick={() => setSendModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSendEmail}
                disabled={sendingEmail || !emailTo}
                className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Confirmer et envoyer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL: SAVE TO GOOGLE DRIVE */}
      {driveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">folder_shared</span>
                </div>
                <h3 className="text-sm font-black text-stone-900">
                  Sauvegarde Google Drive
                </h3>
              </div>
              <button
                onClick={() => setDriveModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Ce document d'itinéraire sera enregistré dans votre espace Google Drive personnel.
            </p>

            <div className="text-xs space-y-2">
              <label className="font-bold text-stone-700 block">Nom du document :</label>
              <input
                type="text"
                value={driveDocTitle}
                onChange={(e) => setDriveDocTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                onClick={() => setDriveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSaveDrive}
                disabled={savingDrive || !driveDocTitle}
                className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingDrive ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    <span>Confirmer la sauvegarde</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
