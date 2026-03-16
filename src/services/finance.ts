
import { Database, ref, push, update, serverTimestamp } from 'firebase/database';
import { Transaction } from '@/lib/types';
import { notificationService } from './notifications';

export const financeService = {
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
  }
};
