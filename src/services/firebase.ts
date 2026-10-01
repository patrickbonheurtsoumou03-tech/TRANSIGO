import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { userService, UserRole } from './userService';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID (Critical requirement)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Error Handling conformant to FirestoreErrorInfo specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by the Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or initializing.');
    }
    return false;
  }
}

// Google Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

// Configure Provider with Scopes
const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthSuccess) onAuthSuccess(user, '');
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * 1. GOOGLE SIGN-IN VIA FIREBASE AUTH
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      cachedAccessToken = await result.user.getIdToken();
    } else {
      cachedAccessToken = credential.accessToken;
    }

    // Sync user with Firestore /users/{uid}
    const user = result.user;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(
        userDocRef,
        {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Voyageur TRANSIGO',
          role: 'passager',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Firestore user sync notice (proceeding):', fsErr);
    }

    // Update local user state
    userService.updateUser({
      id: user.uid,
      email: user.email || undefined,
      firstName: user.displayName?.split(' ')[0] || 'Voyageur',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || 'TRANSIGO',
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * 2. EMAIL / PASSWORD REGISTRATION VIA FIREBASE AUTH
 */
export const firebaseRegisterWithEmail = async (
  email: string,
  pass: string,
  displayName: string,
  role: string = 'passager'
): Promise<User> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Sync with Firestore
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email || '',
        displayName: displayName || user.email,
        role: role.toLowerCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (fsErr) {
      console.warn('Firestore user registration notice:', fsErr);
    }

    // Sync local userService
    const parts = displayName.split(' ');
    userService.updateUser({
      id: user.uid,
      email: user.email || undefined,
      firstName: parts[0] || 'Voyageur',
      lastName: parts.slice(1).join(' ') || 'TRANSIGO',
    });

    return user;
  } catch (err: any) {
    console.error('Firebase Email Register error:', err);
    throw err;
  }
};

/**
 * 3. EMAIL / PASSWORD LOGIN VIA FIREBASE AUTH
 */
export const firebaseLoginWithEmail = async (
  email: string,
  pass: string
): Promise<User> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;

    // Check if user has a Firestore record
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.role) {
          const roleUpper = data.role.toUpperCase() as UserRole;
          userService.setRole(roleUpper);
        }
      }
    } catch (fsErr) {
      console.warn('Firestore fetch notice on login:', fsErr);
    }

    userService.updateUser({
      id: user.uid,
      email: user.email || undefined,
      firstName: user.displayName?.split(' ')[0] || 'Voyageur',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || 'TRANSIGO',
    });

    return user;
  } catch (err: any) {
    console.error('Firebase Email Login error:', err);
    throw err;
  }
};

/**
 * 4. PASSWORD RESET EMAIL
 */
export const firebaseResetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
