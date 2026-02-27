
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Database } from 'firebase/database';

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  database: Database;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ 
  children, 
  app, 
  auth, 
  database 
}: { 
  children: ReactNode; 
  app: FirebaseApp; 
  auth: Auth; 
  database: Database 
}) {
  return (
    <FirebaseContext.Provider value={{ app, auth, database }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within FirebaseProvider');
  return context;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useDatabase() {
  return useFirebase().database;
}
