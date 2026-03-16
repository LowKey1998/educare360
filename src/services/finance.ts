
import { Database, ref, push, update, serverTimestamp } from 'firebase/database';
import { Transaction } from '@/lib/types';

export const financeService = {
  async recordPayment(db: Database, studentId: string, studentName: string, currentBalance: number, amount: number, method: string) {
    const newBalance = Math.max(0, currentBalance - amount);
    
    // Update student balance
    await update(ref(db, `students/${studentId}`), {
      feeBalance: newBalance
    });

    // Log transaction
    return push(ref(db, 'transactions'), {
      studentId,
      studentName,
      amount,
      method,
      type: 'Fee Payment',
      timestamp: serverTimestamp()
    });
  }
};
