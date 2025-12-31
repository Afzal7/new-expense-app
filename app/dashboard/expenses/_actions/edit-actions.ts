'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { expenseService } from '@/lib/services/expenseService';
import { expenseVisibilityService } from '@/lib/services/expenseVisibilityService';
// Removed unused import
import { ExpenseStatus } from '@/types/expense';
import { revalidatePath } from 'next/cache';

export async function updateExpenseAction(expenseId: string, formData: FormData) {
    try {
        console.log('🔄 [updateExpenseAction] Starting expense update for ID:', expenseId);

        const session = await auth.api.getSession({
            headers: await headers()
        });

        console.log('🔐 [updateExpenseAction] Session check result:', {
            hasSession: !!session,
            userId: session?.user?.id
        });

        if (!session?.user) {
            console.log('❌ [updateExpenseAction] No session found, returning error');
            return { success: false, error: 'Authentication required' };
        }

        // Log FormData contents
        const formDataEntries = Array.from(formData.entries());
        console.log('📝 [updateExpenseAction] FormData received:', formDataEntries.map(([key, value]) => ({
            key,
            value: value instanceof File ? `[File: ${value.name}]` : value
        })));

        // First get the expense to determine organization context
        console.log('🔍 [updateExpenseAction] Fetching existing expense for visibility check');
        const existingExpense = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            undefined, // organizationId - will be determined from expense
            'Employee'
        );

        console.log('✅ [updateExpenseAction] Initial expense fetch result:', {
            found: !!existingExpense,
            expenseId: existingExpense?._id,
            status: existingExpense?.status,
            organizationId: existingExpense?.organizationId
        });

        if (!existingExpense) {
            console.log('❌ [updateExpenseAction] Expense not found in initial visibility check');
            return { success: false, error: 'Expense not found or access denied' };
        }

        // Check visibility with proper organization context from the expense
        const organizationId = existingExpense.organizationId?.toString();
        console.log('🔍 [updateExpenseAction] Performing secondary visibility check with org context:', organizationId);
        const visibilityCheck = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            organizationId,
            'Employee'
        );

        console.log('✅ [updateExpenseAction] Secondary visibility check result:', !!visibilityCheck);

        if (!visibilityCheck) {
            console.log('❌ [updateExpenseAction] Expense not accessible after secondary check');
            return { success: false, error: 'Expense not found or access denied' };
        }

        // Only allow editing drafts
        console.log('📋 [updateExpenseAction] Checking expense status:', existingExpense.status);
        if (existingExpense.status !== ExpenseStatus.DRAFT) {
            console.log('❌ [updateExpenseAction] Expense is not in DRAFT status, cannot edit');
            return { success: false, error: 'Only draft expenses can be edited' };
        }

        console.log('🔄 [updateExpenseAction] Parsing FormData into object');
        const data = Object.fromEntries(formData);
        console.log('📦 [updateExpenseAction] Parsed data keys:', Object.keys(data));
        console.log('📋 [updateExpenseAction] Raw data values:', Object.fromEntries(
            Array.from(formData.entries()).map(([key, value]) => [
                key,
                value instanceof File ? `[File: ${value.name}]` : value
            ])
        ));
        console.log('📅 [updateExpenseAction] Date value:', { date: data.date, type: typeof data.date });

        const lineItems: Array<{
            amount: number;
            description: string;
            date: Date;
            attachments: string[];
        }> = [];

        // Parse line items from form data
        const lineItemKeys = Object.keys(data).filter(key => key.startsWith('lineItems['));
        console.log('📋 [updateExpenseAction] Line item keys found:', lineItemKeys);

        if (lineItemKeys.length > 0) {
            console.log('🔄 [updateExpenseAction] Processing line items');
            // Group by line item index
            const lineItemMap: Record<number, {
                amount?: string;
                description?: string;
                attachments?: Array<{ url: string; name: string; type: string }>
            }> = {};

            lineItemKeys.forEach(key => {
                console.log(`🔄 [updateExpenseAction] Processing FormData key: ${key} = ${data[key]}`);

                // Handle regular fields: lineItems[0][amount], lineItems[0][description]
                const fieldMatch = key.match(/lineItems\[(\d+)\]\[(\w+)\](?!.*attachments)/);
                if (fieldMatch) {
                    const [, indexStr, field] = fieldMatch;
                    const index = parseInt(indexStr, 10);
                    console.log(`📝 [updateExpenseAction] Matched field: index=${index}, field=${field}, value=${data[key]}`);

                    if (!lineItemMap[index]) {
                        lineItemMap[index] = { attachments: [] };
                    }

                    if (field === 'amount' || field === 'description') {
                        (lineItemMap[index] as Record<string, string>)[field] = (data[key] as string) || '';
                        console.log(`✅ [updateExpenseAction] Set ${field} for line item ${index}: ${(data[key] as string) || ''}`);
                    }
                } else {
                    console.log(`❌ [updateExpenseAction] Field key didn't match regex: ${key}`);
                }

                // Handle attachments: lineItems[0][attachments][0][url], etc.
                const attachmentMatch = key.match(/lineItems\[(\d+)\]\[attachments\]\[(\d+)\]\[(\w+)\]/);
                if (attachmentMatch) {
                    const [, itemIndexStr, attachmentIndexStr, field] = attachmentMatch;
                    const itemIndex = parseInt(itemIndexStr, 10);
                    const attachmentIndex = parseInt(attachmentIndexStr, 10);
                    console.log(`📎 [updateExpenseAction] Matched attachment: itemIndex=${itemIndex}, attachmentIndex=${attachmentIndex}, field=${field}, value=${data[key]}`);

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
            console.log('🔄 [updateExpenseAction] Converting line item map to array');
            Object.keys(lineItemMap).forEach(key => {
                const index = parseInt(key, 10);
                const item = lineItemMap[index];

                console.log(`📝 [updateExpenseAction] Processing line item ${index}:`, {
                    hasAmount: !!item.amount,
                    hasDescription: !!item.description,
                    amount: item.amount,
                    description: item.description,
                    newAttachmentsCount: item.attachments?.length || 0
                });

                if (item.amount) {
                    const amount = parseFloat(item.amount);
                    if (isNaN(amount) || amount <= 0) {
                        console.log('❌ [updateExpenseAction] Invalid amount detected:', item.amount);
                        throw new Error(`Invalid amount: ${item.amount}`);
                    }

                    // Get existing attachments for this line item
                    const existingAttachments = existingExpense.lineItems[index]?.attachments || [];
                    console.log(`📎 [updateExpenseAction] Line item ${index} existing attachments:`, existingAttachments.length);

                    // Filter out incomplete new attachments and get their URLs
                    const newAttachments = (item.attachments || []).filter(att =>
                        att.url && att.url.trim().length > 0
                    ).map(att => att.url.trim());

                    // Combine existing and new attachments
                    const allAttachments = [...existingAttachments, ...newAttachments];

                    console.log(`📎 [updateExpenseAction] Line item ${index} final attachments:`, allAttachments.length);

                    const lineItemDate = data.date ? new Date(data.date as string + 'T00:00:00') : new Date();
                    console.log(`📅 [updateExpenseAction] Line item ${index} date: ${lineItemDate.toISOString()}, from data.date: ${data.date}`);

                    lineItems.push({
                        amount,
                        description: (item.description || '').trim(),
                        date: lineItemDate,
                        attachments: allAttachments,
                    });
                }
            });
        }

        console.log('📊 [updateExpenseAction] Final line items prepared:', lineItems.map(item => ({
            amount: item.amount,
            description: item.description,
            attachmentsCount: item.attachments.length
        })));

        // Update the expense
        const updateData = {
            lineItems,
            totalAmount: lineItems.reduce((sum, item) => sum + item.amount, 0),
        };

        console.log('💾 [updateExpenseAction] Update data prepared:', {
            lineItemsCount: updateData.lineItems.length,
            totalAmount: updateData.totalAmount
        });

        console.log('📝 [updateExpenseAction] Logging mutation to audit trail');
        await expenseService.logMutation(
            expenseId,
            'UPDATE_STATUS', // Using UPDATE_STATUS for general updates
            session.user.id,
            'Employee',
            [{ field: 'lineItems', oldValue: existingExpense.lineItems, newValue: lineItems }],
            undefined,
            undefined
        );
        console.log('✅ [updateExpenseAction] Mutation logged successfully');

        console.log('💾 [updateExpenseAction] Updating expense in database');
        const updateResult = await expenseService.updateExpense(expenseId, updateData);
        console.log('✅ [updateExpenseAction] Database update result:', {
            success: !!updateResult,
            updatedId: updateResult?._id,
            lineItemsCount: updateResult?.lineItems?.length,
            totalAmount: updateResult?.totalAmount
        });

        console.log('🔄 [updateExpenseAction] Revalidating paths');
        revalidatePath('/dashboard/expenses');
        revalidatePath('/dashboard/vault');

        console.log('🎉 [updateExpenseAction] Expense update completed successfully');
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
            return { success: false, error: 'Authentication required' };
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