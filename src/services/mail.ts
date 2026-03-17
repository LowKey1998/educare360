
import { Database, ref, push, serverTimestamp } from 'firebase/database';

/**
 * simulated mail service for the prototype.
 * In a production environment, these would be handled by Firebase Cloud Functions
 * using a service like SendGrid, Resend, or Mailgun.
 */
export const mailService = {
  async sendEmail(db: Database, { to, subject, body, metadata = {} }: { to: string, subject: string, body: string, metadata?: any }) {
    console.log(`[SIMULATED MAIL] To: ${to} | Subject: ${subject}`);
    
    // We log to a 'mail_outbox' node in RTDB so the admin can verify "sent" emails
    return push(ref(db, 'mail_outbox'), {
      to,
      subject,
      body,
      metadata,
      status: 'Sent',
      sentAt: serverTimestamp()
    });
  },

  async bulkEmail(db: Database, recipients: string[], subject: string, body: string) {
    const promises = recipients.map(email => 
      this.sendEmail(db, { to: email, subject, body })
    );
    return Promise.all(promises);
  }
};
