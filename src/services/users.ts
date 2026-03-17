
import { Database, ref, set, remove, update, get, serverTimestamp } from 'firebase/database';
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

  async registerParent(db: Database, data: { displayName: string, email: string, password?: string }) {
    const tempId = data.email.toLowerCase().replace(/[.@]/g, '_');
    return set(ref(db, `users/${tempId}`), {
      displayName: data.displayName,
      email: data.email.toLowerCase(),
      password: data.password || 'password123', // Default prototype password
      role: 'parent',
      createdAt: serverTimestamp()
    });
  },

  async updateParentProfile(db: Database, userId: string, oldEmail: string, data: { displayName: string, email: string, password?: string }) {
    const newEmail = data.email.toLowerCase();
    const updates: any = {};

    // Update User Entry
    updates[`users/${userId}/displayName`] = data.displayName;
    updates[`users/${userId}/email`] = newEmail;
    
    if (data.password) {
      updates[`users/${userId}/password`] = data.password;
    }

    // If email changed, we MUST update all linked students to maintain the association
    if (oldEmail.toLowerCase() !== newEmail) {
      const studentsSnapshot = await get(ref(db, 'students'));
      const students = studentsSnapshot.val();
      if (students) {
        Object.entries(students).forEach(([sId, student]: [string, any]) => {
          if (student.parentEmail?.toLowerCase() === oldEmail.toLowerCase()) {
            updates[`students/${sId}/parentEmail`] = newEmail;
          }
        });
      }
    }

    return update(ref(db), updates);
  },

  async deleteUser(db: Database, id: string) {
    return remove(ref(db, `users/${id}`));
  }
};
