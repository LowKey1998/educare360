
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, Database } from 'firebase/database';

export function useRTDBDoc<T = any>(db: Database | null, path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) return;

    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      setData(val ? { ...val, id: snapshot.key } : null);
      setLoading(false);
    }, (error) => {
      console.error("RTDB Doc Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading };
}
