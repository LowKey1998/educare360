
import { Database, ref, push, remove, update, serverTimestamp } from 'firebase/database';
import { Admission } from '@/lib/types';
import { notificationService } from './notifications';

export const admissionService = {
  async addApplication(db: Database, data: Omit<Admission, 'id' | 'createdAt'>) {
    const appRef = await push(ref(db, 'admissions'), {
      ...data,
      createdAt: serverTimestamp()
    });

    // Notify Admins
    await notificationService.notifyRole(db, 'admin', {
      title: 'New Application',
      message: `New admission received for ${data.studentName} (${data.grade}).`,
      type: 'info',
      link: '/dashboard/admissions'
    });

    return appRef;
  },
  async updateStatus(db: Database, id: string, status: string) {
    return update(ref(db, `admissions/${id}`), { status });
  },
  async deleteApplication(db: Database, id: string) {
    return remove(ref(db, `admissions/${id}`));
  }
};
