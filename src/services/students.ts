
import { Database, ref, push, remove, update, serverTimestamp } from 'firebase/database';
import { Student } from '@/lib/types';

export const studentService = {
  async enrollPupil(db: Database, data: Omit<Student, 'id' | 'createdAt' | 'feeBalance' | 'attendanceRate'>) {
    return push(ref(db, 'students'), {
      ...data,
      feeBalance: 0,
      attendanceRate: 100,
      createdAt: serverTimestamp()
    });
  },
  async deletePupil(db: Database, id: string) {
    return remove(ref(db, `students/${id}`));
  },
  async updateAttendance(db: Database, id: string, status: string) {
    return update(ref(db, `attendance/${id}`), { 
      status, 
      lastUpdated: serverTimestamp() 
    });
  }
};
