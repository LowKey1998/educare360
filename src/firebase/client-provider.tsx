
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from './index';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Database } from 'firebase/database';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{ app: FirebaseApp; auth: Auth; database: Database } | null>(null);

  useEffect(() => {
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  if (!firebase) return null;

  return (
    <FirebaseProvider app={firebase.app} auth={firebase.auth} database={firebase.database}>
      {children}
    </FirebaseProvider>
  );
}
