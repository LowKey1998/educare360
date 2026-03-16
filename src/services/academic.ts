
import { Database, ref, push, remove, update, serverTimestamp } from 'firebase/database';
import { Classroom, Lesson } from '@/lib/types';

export const academicService = {
  async saveMarks(db: Database, subject: string, marks: Record<string, number>) {
    const updates: any = {};
    Object.entries(marks).forEach(([studentId, score]) => {
      if (!isNaN(score)) {
        updates[`students/${studentId}/marks/${subject}`] = score;
        updates[`students/${studentId}/lastAcademicUpdate`] = serverTimestamp();
      }
    });
    return update(ref(db), updates);
  },
  async addClassroom(db: Database, data: Omit<Classroom, 'id' | 'createdAt'>) {
    return push(ref(db, 'classrooms'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async deleteClassroom(db: Database, id: string) {
    return remove(ref(db, `classrooms/${id}`));
  },
  async scheduleLesson(db: Database, data: Omit<Lesson, 'id' | 'createdAt'>) {
    return push(ref(db, 'timetable'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async deleteLesson(db: Database, id: string) {
    return remove(ref(db, `timetable/${id}`));
  },
  async logECD(db: Database, data: any) {
    return push(ref(db, 'ecd_observations'), {
      ...data,
      createdAt: serverTimestamp()
    });
  }
};
