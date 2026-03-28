
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { useUser } from './use-user';
import { useDatabase } from '../provider';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'staff' | 'parent';
  customRoleId?: string;
  displayName?: string;
  permissions?: string[];
}

export function useUserProfile() {
  const { user, loading: authLoading } = useUser();
  const database = useDatabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !database) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const profileRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfile({
          uid: user.uid,
          email: user.email,
          ...data,
        });
      } else {
        // Fallback for first-time login if profile doesn't exist
        setProfile({
          uid: user.uid,
          email: user.email,
          role: 'admin', // Default role
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, database]);

  return { profile, loading: authLoading || loading };
}
