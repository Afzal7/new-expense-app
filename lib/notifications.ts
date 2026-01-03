/**
 * Notification system for expense-related emails
 * Extends the base email system with business-specific notifications
 */

import { sendEmail } from "./email";
import { env } from "./env";
import type { Expense } from "../types/expense";

/**
 * Email templates for business notifications
 * From address configured via RESEND_FROM_EMAIL env var
 */
export const NOTIFICATION_TEMPLATES = {
  reimbursement: {
    subject: "Your expense has been reimbursed",
    from: env.RESEND_FROM_EMAIL,
  },
} as const;

/**
 * Generate HTML templates for business notifications
 */
export const generateNotificationHTML = {
  reimbursement: (data: {
    expenseId: string;
    totalAmount: number;
    organizationName?: string;
    reimbursementDate: string;
    userName?: string;
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Expense Reimbursed</h1>
      <p>Hello${data.userName ? ` ${data.userName}` : ""},</p>
      <p>Your expense has been successfully reimbursed!</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Expense ID:</strong> ${data.expenseId}</p>
        <p><strong>Amount Reimbursed:</strong> $${data.totalAmount.toFixed(2)}</p>
        ${data.organizationName ? `<p><strong>Organization:</strong> ${data.organizationName}</p>` : ""}
        <p><strong>Reimbursed Date:</strong> ${new Date(data.reimbursementDate).toLocaleDateString()}</p>
      </div>
      <p>Thank you for using our expense management system.</p>
      <p>If you have any questions, please contact support.</p>
    </div>
  `,
};

/**
 * Send reimbursement notification to the user
 */
export async function notifyReimbursement({
  expense,
  userEmail,
  userName,
  organizationName,
}: {
  expense: Expense;
  userEmail: string;
  userName?: string;
  organizationName?: string;
}) {
  try {
    const html = generateNotificationHTML.reimbursement({
      expenseId: expense.id,
      totalAmount: expense.totalAmount,
      organizationName,
      reimbursementDate: new Date().toISOString(),
      userName,
    });

    const result = await sendEmail({
      to: userEmail,
      subject: NOTIFICATION_TEMPLATES.reimbursement.subject,
      html,
      from: NOTIFICATION_TEMPLATES.reimbursement.from,
    });

    console.log(
      `[Notification] Reimbursement email sent for expense ${expense.id} to ${userEmail}`
    );
    return { success: true, emailId: result.id };
  } catch (error) {
    console.error(
      `[Notification] Failed to send reimbursement email for expense ${expense.id}:`,
      error
    );
    throw new Error(
      `Failed to send reimbursement notification: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generic notification sender (for future extensions)
 */
export async function sendNotification({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const result = await sendEmail({
      to,
      subject,
      html,
      from: from || env.RESEND_FROM_EMAIL,
    });

    return { success: true, emailId: result.id };
  } catch (error) {
    console.error(
      `[Notification] Failed to send notification to ${to}:`,
      error
    );
    throw new Error(
      `Failed to send notification: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
