
import { Database, ref, push, update, remove, serverTimestamp, get, query, orderByChild, equalTo } from 'firebase/database';
import { AppNotification } from '@/lib/types';

export const notificationService = {
  /**
   * Adds a notification for a specific user.
   */
  async notifyUser(db: Database, userId: string, data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    return push(ref(db, `notifications/${userId}`), {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
  },

  /**
   * Notifies all users with a specific role.
   */
  async notifyRole(db: Database, role: 'admin' | 'staff' | 'parent', data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const usersSnapshot = await get(ref(db, 'users'));
    const users = usersSnapshot.val();
    if (!users) return;

    const updates: any = {};
    const notificationData = {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    };

    Object.entries(users).forEach(([uid, profile]: [string, any]) => {
      if (profile.role === role) {
        const newKey = push(ref(db, `notifications/${uid}`)).key;
        updates[`notifications/${uid}/${newKey}`] = notificationData;
      }
    });

    return update(ref(db), updates);
  },

  async markAsRead(db: Database, userId: string, notificationId: string) {
    return update(ref(db, `notifications/${userId}/${notificationId}`), { read: true });
  },

  async markAllAsRead(db: Database, userId: string) {
    const snapshot = await get(ref(db, `notifications/${userId}`));
    const notifications = snapshot.val();
    if (!notifications) return;

    const updates: any = {};
    Object.keys(notifications).forEach(id => {
      updates[`notifications/${userId}/${id}/read`] = true;
    });
    return update(ref(db), updates);
  },

  async clearNotifications(db: Database, userId: string) {
    return remove(ref(db, `notifications/${userId}`));
  },

  /**
   * Simulates resending a portal invitation.
   * In a real app, this would trigger an email via an Edge Function.
   */
  async resendPortalInvite(db: Database, email: string) {
    // Log the event in the system audit log or notifications
    // Since the user might not have a UID yet, we track these by email-hashed keys if needed
    // For now, we simulate success and log it to admins
    return this.notifyRole(db, 'admin', {
      title: 'Portal Invite Resent',
      message: `A portal registration link was resent to ${email}.`,
      type: 'info'
    });
  }
};
