'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { expenseService } from '@/lib/services/expenseService';
import { expenseVisibilityService } from '@/lib/services/expenseVisibilityService';
// Removed unused import
import { ExpenseStatus } from '@/types/expense';
import { revalidatePath } from 'next/cache';

export async function updateExpenseAction(expenseId: string, formData: FormData) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            redirect('/login');
        }

        // First get the expense to determine organization context
        const existingExpense = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            undefined, // organizationId - will be determined from expense
            'Employee'
        );

        if (!existingExpense) {
            return { success: false, error: 'Expense not found or access denied' };
        }

        // Check visibility with proper organization context from the expense
        const organizationId = existingExpense.organizationId?.toString();
        const visibilityCheck = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            organizationId,
            'Employee'
        );

        if (!visibilityCheck) {
            return { success: false, error: 'Expense not found or access denied' };
        }

        // Only allow editing drafts
        if (existingExpense.status !== ExpenseStatus.DRAFT) {
            return { success: false, error: 'Only draft expenses can be edited' };
        }

        const data = Object.fromEntries(formData);
        const lineItems: Array<{
            amount: number;
            description: string;
            date: Date;
            attachments: string[];
        }> = [];

        // Parse line items from form data
        const lineItemKeys = Object.keys(data).filter(key => key.startsWith('lineItems['));

        if (lineItemKeys.length > 0) {
            // Group by line item index
            const lineItemMap: Record<number, {
                amount?: string;
                description?: string;
                attachments?: Array<{ url: string; name: string; type: string }>
            }> = {};

            lineItemKeys.forEach(key => {
                // Handle regular fields: lineItems[0][amount], lineItems[0][description]
                const fieldMatch = key.match(/lineItems\[(\d+)\]\[(\w+)\](?!.*attachments)/);
                if (fieldMatch) {
                    const [, indexStr, field] = fieldMatch;
                    const index = parseInt(indexStr, 10);

                    if (!lineItemMap[index]) {
                        lineItemMap[index] = { attachments: [] };
                    }

                    if (field === 'amount' || field === 'description') {
                        (lineItemMap[index] as Record<string, string>)[field] = data[key] as string;
                    }
                }

                // Handle attachments: lineItems[0][attachments][0][url], etc.
                const attachmentMatch = key.match(/lineItems\[(\d+)\]\[attachments\]\[(\d+)\]\[(\w+)\]/);
                if (attachmentMatch) {
                    const [, itemIndexStr, attachmentIndexStr, field] = attachmentMatch;
                    const itemIndex = parseInt(itemIndexStr, 10);
                    const attachmentIndex = parseInt(attachmentIndexStr, 10);

                    if (!lineItemMap[itemIndex]) {
                        lineItemMap[itemIndex] = { attachments: [] };
                    }

                    if (!lineItemMap[itemIndex].attachments) {
                        lineItemMap[itemIndex].attachments = [];
                    }

                    while (lineItemMap[itemIndex].attachments!.length <= attachmentIndex) {
                        lineItemMap[itemIndex].attachments!.push({ url: '', name: '', type: '' });
                    }

                    const value = data[key] as string;
                    if (field === 'url') {
                        lineItemMap[itemIndex].attachments![attachmentIndex].url = value;
                    } else if (field === 'name') {
                        lineItemMap[itemIndex].attachments![attachmentIndex].name = value;
                    } else if (field === 'type') {
                        lineItemMap[itemIndex].attachments![attachmentIndex].type = value;
                    }
                }
            });

            // Convert to line items array, merging with existing attachments
            Object.keys(lineItemMap).forEach(key => {
                const index = parseInt(key, 10);
                const item = lineItemMap[index];

                if (item.amount && item.description) {
                    const amount = parseFloat(item.amount);
                    if (isNaN(amount) || amount <= 0) {
                        throw new Error(`Invalid amount: ${item.amount}`);
                    }

                    // Get existing attachments for this line item
                    const existingAttachments = existingExpense.lineItems[index]?.attachments || [];

                    // Filter out incomplete new attachments and get their URLs
                    const newAttachments = (item.attachments || []).filter(att =>
                        att.url && att.url.trim().length > 0
                    ).map(att => att.url.trim());

                    // Combine existing and new attachments
                    const allAttachments = [...existingAttachments, ...newAttachments];

                    lineItems.push({
                        amount,
                        description: item.description.trim(),
                        date: new Date(data.date as string + 'T00:00:00'),
                        attachments: allAttachments,
                    });
                }
            });
        }

        // Update the expense
        const updateData = {
            lineItems,
            totalAmount: lineItems.reduce((sum, item) => sum + item.amount, 0),
        };

        await expenseService.logMutation(
            expenseId,
            'UPDATE_STATUS', // Using UPDATE_STATUS for general updates
            session.user.id,
            'Employee',
            [{ field: 'lineItems', oldValue: existingExpense.lineItems, newValue: lineItems }],
            undefined,
            undefined
        );

        // Update the expense document
        await expenseService.updateExpense(expenseId, updateData);

        revalidatePath('/dashboard/expenses');
        revalidatePath('/dashboard/vault');

        return { success: true, data: { _id: expenseId } };
    } catch (error) {
        console.error('Error updating expense:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update expense'
        };
    }
}

export async function deleteExpenseAction(expenseId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            redirect('/login');
        }

        // First get the expense to determine organization context
        const existingExpense = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            undefined, // organizationId - will be determined from expense
            'Employee'
        );

        if (!existingExpense) {
            return { success: false, error: 'Expense not found or access denied' };
        }

        // Check visibility with proper organization context from the expense
        const organizationId = existingExpense.organizationId?.toString();
        const visibilityCheck = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            organizationId,
            'Employee'
        );

        if (!visibilityCheck) {
            return { success: false, error: 'Expense not found or access denied' };
        }

        // Only allow deleting drafts
        if (existingExpense.status !== ExpenseStatus.DRAFT) {
            return { success: false, error: 'Only draft expenses can be deleted' };
        }

        // Delete the expense
        await expenseService.deleteExpense(expenseId);

        revalidatePath('/dashboard/expenses');
        revalidatePath('/dashboard/vault');

        return { success: true };
    } catch (error) {
        console.error('Error deleting expense:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete expense'
        };
    }
}