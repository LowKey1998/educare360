
import { Database, ref, set, push, remove, update, serverTimestamp } from 'firebase/database';
import { SystemSettings, Announcement } from '@/lib/types';

export const systemService = {
  async saveSettings(db: Database, data: SystemSettings) {
    return set(ref(db, 'system_settings'), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },
  async postAnnouncement(db: Database, data: Omit<Announcement, 'id' | 'createdAt'>) {
    return push(ref(db, 'announcements'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async updateTemplateStatus(db: Database, id: string, status: string) {
    return update(ref(db, `document_templates/${id}`), { status });
  },
  async deleteTemplate(db: Database, id: string) {
    return remove(ref(db, `document_templates/${id}`));
  }
};
