
import { Database, ref, set, remove, serverTimestamp } from 'firebase/database';
import { UserProfile } from '@/lib/types';

export const userService = {
  async inviteUser(db: Database, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt'>) {
    // For demo purposes using email-based key if no UID
    const tempId = data.email?.replace(/[.@]/g, '_') || 'unknown';
    return set(ref(db, `users/${tempId}`), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async deleteUser(db: Database, id: string) {
    return remove(ref(db, `users/${id}`));
  }
};
