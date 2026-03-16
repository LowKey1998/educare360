
import { Database, ref, push, update, get, serverTimestamp } from 'firebase/database';
import { Transaction } from '@/lib/types';
import { notificationService } from './notifications';

export const financeService = {
  /**
   * Records a manual fee payment for a student.
   * Updates the student's balance and logs a transaction.
   */
  async recordPayment(db: Database, studentId: string, studentName: string, currentBalance: number, amount: number, method: string) {
    const newBalance = Math.max(0, currentBalance - amount);
    
    // Update student balance
    await update(ref(db, `students/${studentId}`), {
      feeBalance: newBalance
    });

    // Log transaction
    const txRef = await push(ref(db, 'transactions'), {
      studentId,
      studentName,
      amount,
      method,
      type: 'Fee Payment',
      timestamp: serverTimestamp()
    });

    // Notify Admins of manual revenue
    await notificationService.notifyRole(db, 'admin', {
      title: 'Payment Recorded',
      message: `$${amount} manual payment posted for ${studentName} via ${method}.`,
      type: 'success',
      link: '/dashboard/finance'
    });

    return txRef;
  },

  /**
   * Bulk applies a fee amount to all students in specified grades for a specific term.
   */
  async applyTermFees(db: Database, amount: number, term: string, grades: string[]) {
    const studentsSnapshot = await get(ref(db, 'students'));
    const students = studentsSnapshot.val();
    if (!students) return;

    const updates: any = {};
    let count = 0;

    Object.entries(students).forEach(([id, student]: [string, any]) => {
      if (grades.includes(student.grade)) {
        const currentBalance = parseFloat(student.feeBalance as any) || 0;
        updates[`students/${id}/feeBalance`] = currentBalance + amount;
        updates[`students/${id}/lastBillingDate`] = serverTimestamp();
        updates[`students/${id}/lastBillingTerm`] = term;
        count++;
      }
    });

    if (count > 0) {
      await update(ref(db), updates);
      
      // Log this event in history/announcements or notify admins
      await notificationService.notifyRole(db, 'admin', {
        title: 'Bulk Billing Complete',
        message: `Applied $${amount} fee for ${term} to ${count} pupils across ${grades.length} grades.`,
        type: 'info',
        link: '/dashboard/finance'
      });
    }

    return count;
  }
};
