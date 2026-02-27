
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, Database } from 'firebase/database';

export function useRTDBCollection<T = any>(db: Database | null, path: string | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) return;

    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Convert RTDB object map to array
        const list = Object.entries(val).map(([id, data]) => ({
          ...(data as any),
          id,
        }));
        setData(list);
      } else {
        setData([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("RTDB Collection Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading };
}
