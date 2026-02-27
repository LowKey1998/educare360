
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let database: Database;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    database = getDatabase(app);
  }
  return { app, auth, database };
}

export const getFirebaseApp = () => app;
export const getAuthInstance = () => auth;
export const getDatabaseInstance = () => database;

export { FirebaseProvider, useFirebase, useAuth, useDatabase } from './provider';
export { useUser } from './auth/use-user';
export { useUserProfile } from './auth/use-user-profile';
export { useRTDBCollection } from './database/use-collection';
export { useRTDBDoc } from './database/use-doc';
