
import { Database, ref, set, push, remove, update, serverTimestamp } from 'firebase/database';
import { SystemSettings, Announcement, DocumentTemplate } from '@/lib/types';
import { notificationService } from './notifications';

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

    // Notify all parents of the new announcement
    await notificationService.notifyRole(db, 'parent', {
      title: 'New School Announcement',
      message: `A new ${data.communicationType} has been posted: "${data.content.substring(0, 50)}..."`,
      type: 'info',
      link: '/dashboard/communication'
    });

    return annRef;
  },
  
  // Document Templates
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
