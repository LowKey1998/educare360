"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export type UserRole = 'admin' | 'teacher' | 'parent';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Simulate auth check and role detection from URL for demo purposes
    const roleParam = searchParams.get('role') as UserRole || 'admin';
    
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'Dr. Mutendi',
        email: 'dr.mutendi@sunrise.edu',
        role: roleParam,
      });
      setLoading(false);
    }, 500);
  }, [searchParams]);

  return { user, loading };
}
