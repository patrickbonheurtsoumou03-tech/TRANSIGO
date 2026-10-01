import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
  UserCredential,
  AuthError
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication instance
export const auth: Auth = getAuth(app);

// Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Normalizes Firebase Auth error codes into clean, professional French messages without emojis.
 */
export function formatAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const authErr = error as AuthError;
    switch (authErr.code) {
      case 'auth/invalid-email':
        return "Le format de l'adresse e-mail est invalide.";
      case 'auth/user-disabled':
        return 'Ce compte utilisateur a ete desactive.';
      case 'auth/user-not-found':
        return 'Aucun compte correspondant a cette adresse e-mail.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Adresse e-mail ou mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cette adresse e-mail est deja utilisee par un autre compte.';
      case 'auth/operation-not-allowed':
        return "Cette methode d'authentification n'est pas activee dans la console Firebase.";
      case 'auth/weak-password':
        return 'Le mot de passe doit comporter au moins 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return "La fenetre d'authentification Google a ete fermee avant la fin de l'operation.";
      case 'auth/popup-blocked':
        return 'La fenetre popup a ete bloquee par le navigateur. Veuillez autoriser les popups pour ce site.';
      case 'auth/network-request-failed':
        return 'Erreur reseau. Veuillez verifier votre connexion Internet.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives infructueuses. Veuillez reessayer ulterieurement.';
      default:
        return authErr.message || "Une erreur d'authentification est survenue.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue lors de l'authentification.";
}

/**
 * Signs in a user using Email and Password.
 */
export async function signInWithEmailAndPassword(
  email: string,
  pass: string
): Promise<UserCredential> {
  try {
    return await fbSignInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    const formattedMessage = formatAuthError(error);
    console.error('Firebase Auth [signInWithEmailAndPassword]:', formattedMessage);
    throw new Error(formattedMessage);
  }
}

/**
 * Creates a new user account using Email and Password.
 */
export async function createUserWithEmailAndPassword(
  email: string,
  pass: string
): Promise<UserCredential> {
  try {
    return await fbCreateUserWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    const formattedMessage = formatAuthError(error);
    console.error('Firebase Auth [createUserWithEmailAndPassword]:', formattedMessage);
    throw new Error(formattedMessage);
  }
}

/**
 * Authenticates the user with Google Sign-In using a secure popup flow.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const formattedMessage = formatAuthError(error);
    console.error('Firebase Auth [signInWithGoogle]:', formattedMessage);
    throw new Error(formattedMessage);
  }
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    const formattedMessage = formatAuthError(error);
    console.error('Firebase Auth [signOut]:', formattedMessage);
    throw new Error(formattedMessage);
  }
}
