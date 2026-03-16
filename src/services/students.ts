
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
  
  /**
   * Finalizes enrollment from an accepted admission application.
   * Creates the student record and marks the admission application as 'Enrolled'.
   */
  async enrollFromAdmission(db: Database, admissionId: string, studentData: Omit<Student, 'id' | 'createdAt' | 'feeBalance' | 'attendanceRate'>) {
    const studentRef = await push(ref(db, 'students'), {
      ...studentData,
      feeBalance: 0,
      attendanceRate: 100,
      createdAt: serverTimestamp()
    });

    // Update the admission record status to hidden/processed or keep it as accepted but linked
    await update(ref(db, `admissions/${admissionId}`), {
      status: 'Accepted',
      enrolledId: studentRef.key,
      enrollmentDate: serverTimestamp()
    });

    return studentRef;
  },

  async deletePupil(db: Database, id: string) {
    return remove(ref(db, `students/${id}`));
  },
  
  async updateAttendance(db: Database, id: string, status: string) {
    return update(ref(db, `attendance/${id}`), { 
      status, 
      lastUpdated: serverTimestamp() 
    });
  },

  /**
   * Updates the parent contact email for a specific student.
   * This handles portal linking and communication.
   */
  async updateParentEmail(db: Database, studentId: string, email: string) {
    return update(ref(db, `students/${studentId}`), {
      parentEmail: email.toLowerCase().trim(),
      lastRegistryUpdate: serverTimestamp()
    });
  },

  /**
   * Updates the parent contact email for multiple students (Bulk Link).
   */
  async bulkUpdateParentEmail(db: Database, studentIds: string[], email: string) {
    const updates: any = {};
    const normalizedEmail = email.toLowerCase().trim();
    const now = serverTimestamp();

    studentIds.forEach(id => {
      updates[`students/${id}/parentEmail`] = normalizedEmail;
      updates[`students/${id}/lastRegistryUpdate`] = now;
    });

    return update(ref(db), updates);
  },

  /**
   * Updates student catering subscription status.
   */
  async updateCateringStatus(db: Database, studentId: string, subscribed: boolean) {
    return update(ref(db, `students/${studentId}`), {
      isCateringSubscribed: subscribed,
      lastRegistryUpdate: serverTimestamp()
    });
  },

  /**
   * Updates student dietary requirements.
   */
  async updateDietaryNotes(db: Database, studentId: string, notes: string) {
    return update(ref(db, `students/${studentId}`), {
      dietaryRequirements: notes,
      lastRegistryUpdate: serverTimestamp()
    });
  }
};
