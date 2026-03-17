
import { Database, ref, push, update, remove, serverTimestamp, get, set } from 'firebase/database';
import { AppNotification } from '@/lib/types';
import { mailService } from './mail';

export const notificationService = {
  /**
   * Registers or updates an FCM token for a user.
   */
  async registerFCMToken(db: Database, userId: string, token: string) {
    const tokenHash = token.replace(/[.#$/[\]]/g, '_');
    return set(ref(db, `users/${userId}/fcmTokens/${tokenHash}`), {
      token,
      lastUpdated: serverTimestamp()
    });
  },

  /**
   * Adds a notification for a specific user in the database.
   */
  async notifyUser(db: Database, userId: string, data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const notificationRef = await push(ref(db, `notifications/${userId}`), {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
    return notificationRef;
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

  async resendPortalInvite(db: Database, email: string) {
    // 1. Send simulated email to parent
    await mailService.sendEmail(db, {
      to: email,
      subject: 'Complete Your Portal Registration',
      body: `Hello,\n\nYou have been invited to join the school's Parent Portal. Please use the following details to sign in and track your child's progress.\n\nPortal URL: /login\nEmail: ${email}\n\nThank you!`
    });

    // 2. Notify admin that invite was sent
    return this.notifyRole(db, 'admin', {
      title: 'Portal Invite Sent',
      message: `A portal registration email was dispatched to ${email}.`,
      type: 'success'
    });
  }
};
