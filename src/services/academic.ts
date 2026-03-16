
import { Database, ref, push, remove, update, serverTimestamp } from 'firebase/database';
import { Classroom, Lesson, LessonPlan, Exam, PeriodStructure, Subject } from '@/lib/types';

export const academicService = {
  async saveMarks(db: Database, subjectCode: string, marks: Record<string, number>) {
    const updates: any = {};
    Object.entries(marks).forEach(([studentId, score]) => {
      if (!isNaN(score)) {
        updates[`students/${studentId}/marks/${subjectCode}`] = score;
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

  async addLessonPlan(db: Database, data: Omit<LessonPlan, 'id' | 'createdAt'>) {
    return push(ref(db, 'lesson_plans'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async deleteLessonPlan(db: Database, id: string) {
    return remove(ref(db, `lesson_plans/${id}`));
  },

  async addExam(db: Database, data: Omit<Exam, 'id' | 'createdAt'>) {
    return push(ref(db, 'exams'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async deleteExam(db: Database, id: string) {
    return remove(ref(db, `exams/${id}`));
  },

  async logECD(db: Database, data: any) {
    return push(ref(db, 'ecd_observations'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async addPeriodStructure(db: Database, data: Omit<PeriodStructure, 'id' | 'createdAt'>) {
    return push(ref(db, 'period_structures'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async deletePeriodStructure(db: Database, id: string) {
    return remove(ref(db, `period_structures/${id}`));
  },

  async addSubject(db: Database, data: Omit<Subject, 'id' | 'createdAt'>) {
    return push(ref(db, 'subjects'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async deleteSubject(db: Database, id: string) {
    return remove(ref(db, `subjects/${id}`));
  }
};
