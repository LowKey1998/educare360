
import { Database, ref, push, remove, update, serverTimestamp } from 'firebase/database';
import { Admission } from '@/lib/types';

export const admissionService = {
  async addApplication(db: Database, data: Omit<Admission, 'id' | 'createdAt'>) {
    return push(ref(db, 'admissions'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async updateStatus(db: Database, id: string, status: string) {
    return update(ref(db, `admissions/${id}`), { status });
  },
  async deleteApplication(db: Database, id: string) {
    return remove(ref(db, `admissions/${id}`));
  }
};
