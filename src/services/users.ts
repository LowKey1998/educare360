
import { Database, ref, set, remove, update, get, serverTimestamp } from 'firebase/database';
import { UserProfile } from '@/lib/types';
import { mailService } from './mail';

export const userService = {
  async inviteUser(db: Database, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt'>) {
    const normalizedEmail = data.email?.toLowerCase();
    const tempId = normalizedEmail?.replace(/[.@]/g, '_') || 'unknown';
    
    await set(ref(db, `users/${tempId}`), {
      ...data,
      email: normalizedEmail,
      createdAt: serverTimestamp()
    });

    // Send invitation email
    if (data.email) {
      await mailService.sendEmail(db, {
        to: data.email,
        subject: 'Institutional Access Granted',
        body: `Hello ${data.displayName},\n\nYou have been assigned the role of ${data.role} at the institution. You can now sign in using your email.\n\nDepartment: ${data.department || 'General'}`
      });
    }
    
    return tempId;
  },

  async registerParent(db: Database, data: { displayName: string, email: string, password?: string }) {
    const tempId = data.email.toLowerCase().replace(/[.@]/g, '_');
    
    await set(ref(db, `users/${tempId}`), {
      displayName: data.displayName,
      email: data.email.toLowerCase(),
      password: data.password || 'password123',
      role: 'parent',
      createdAt: serverTimestamp()
    });

    // Send Welcome Email
    await mailService.sendEmail(db, {
      to: data.email,
      subject: 'Welcome to the Parent Portal',
      body: `Hello ${data.displayName},\n\nYour account has been created successfully. You can now sign in to track your children's performance, attendance, and manage fee payments.\n\nUsername: ${data.email}\nPassword: ${data.password || 'password123'}`
    });

    return tempId;
  },

  async updateParentProfile(db: Database, userId: string, oldEmail: string, data: { displayName: string, email: string, password?: string }) {
    const newEmail = data.email.toLowerCase();
    const updates: any = {};

    updates[`users/${userId}/displayName`] = data.displayName;
    updates[`users/${userId}/email`] = newEmail;
    
    if (data.password) {
      updates[`users/${userId}/password`] = data.password;
    }

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

      // Notify of email change
      await mailService.sendEmail(db, {
        to: newEmail,
        subject: 'Account Security: Email Updated',
        body: `Hello ${data.displayName},\n\nYour institutional portal email address has been updated from ${oldEmail} to ${newEmail}. If you did not authorize this change, please contact the administration immediately.`
      });
    }

    return update(ref(db), updates);
  },

  async deleteUser(db: Database, id: string) {
    return remove(ref(db, `users/${id}`));
  },

  async updateUser(db: Database, id: string, data: Partial<Omit<UserProfile, 'id' | 'uid' | 'createdAt'>>) {
    return update(ref(db, `users/${id}`), data);
  }
};
