
import { Database, ref, set, push, remove, update, get, serverTimestamp } from 'firebase/database';
import { SystemSettings, Announcement, DocumentTemplate } from '@/lib/types';
import { notificationService } from './notifications';
import { mailService } from './mail';

export const systemService = {
  async saveSettings(db: Database, data: SystemSettings) {
    return set(ref(db, 'system_settings'), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async postAnnouncement(db: Database, data: Omit<Announcement, 'id' | 'createdAt'>) {
    const annRef = await push(ref(db, 'announcements'), {
      ...data,
      createdAt: serverTimestamp()
    });

    // 1. Notify all parents via internal notification system
    await notificationService.notifyRole(db, 'parent', {
      title: 'New School Announcement',
      message: `A new ${data.communicationType} has been posted: "${data.content.substring(0, 50)}..."`,
      type: 'info',
      link: '/dashboard/communication'
    });

    // 2. Dispatch simulated emails to the audience
    const usersSnapshot = await get(ref(db, 'users'));
    const users = usersSnapshot.val();
    if (users) {
      const audienceEmails = Object.values(users)
        .filter((u: any) => u.role === 'parent' || u.role === 'staff') // Simplified for now
        .map((u: any) => u.email)
        .filter(Boolean);

      if (audienceEmails.length > 0) {
        await mailService.bulkEmail(db, audienceEmails, `School Update: ${data.communicationType}`, data.content);
      }
    }

    return annRef;
  },
  
  async addTemplate(db: Database, data: Omit<DocumentTemplate, 'id' | 'createdAt'>) {
    const templateRef = await push(ref(db, 'document_templates'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return templateRef;
  },

  async updateTemplateStatus(db: Database, id: string, status: string) {
    return update(ref(db, `document_templates/${id}`), { status });
  },

  async deleteTemplate(db: Database, id: string) {
    return remove(ref(db, `document_templates/${id}`));
  }
};
