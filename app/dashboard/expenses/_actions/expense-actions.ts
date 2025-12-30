'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { expenseService } from '@/lib/services/expenseService';
import { expenseVisibilityService } from '@/lib/services/expenseVisibilityService';
import { organizationService } from '@/lib/services/organizationService';
import { CreateExpenseInput } from '@/lib/validations/expense';
import { ExpenseStatus } from '@/types/expense';
import { revalidatePath } from 'next/cache';

export async function createExpenseAction(formData: FormData) {
    // Track uploaded file keys for potential cleanup if transaction fails
    const uploadedFileKeys: string[] = [];

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            redirect('/login');
        }

        const data = Object.fromEntries(formData);
        console.log('FormData data:', data);

        // Extract file keys for potential cleanup if transaction fails
        Object.keys(data).forEach(key => {
            const attachmentMatch = key.match(/lineItems\[(\d+)\]\[attachments\]\[(\d+)\]\[url\]/);
            if (attachmentMatch) {
                const url = data[key] as string;
                // Extract file key from URL (assuming format: .../fileKey)
                const urlParts = url.split('/');
                const fileKey = urlParts[urlParts.length - 1];
                if (fileKey) uploadedFileKeys.push(fileKey);
            }
        });

        // Extract file keys for potential cleanup if transaction fails
        const uploadedFileKeys: string[] = [];
        Object.keys(data).forEach(key => {
            const attachmentMatch = key.match(/lineItems\[(\d+)\]\[attachments\]\[(\d+)\]\[url\]/);
            if (attachmentMatch) {
                const url = data[key] as string;
                // Extract file key from URL (assuming UploadThing format: .../fileKey)
                const urlParts = url.split('/');
                const fileKey = urlParts[urlParts.length - 1];
                if (fileKey) uploadedFileKeys.push(fileKey);
            }
        });
        const lineItems: Array<{
            amount: number;
            description: string;
            date: Date;
            attachments: Array<{ url: string; name: string; type: "image/jpeg" | "image/png" | "application/pdf" }>;
        }> = [];

        // Get submission options
        const submissionType = data.submissionType as string;
        const managerId = data.managerId as string;
        const organizationId = data.organizationId as string;

        // Parse line items from form data
        // Handle multiple line items in the format: lineItems[0][amount], lineItems[0][description], etc.
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
                        (lineItemMap[index] as Record<string, string>)[field] = (data[key] as string) || '';
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

            // Convert to line items array
            Object.values(lineItemMap).forEach((item) => {
                if (item.amount) {
                    const amount = parseFloat(item.amount);
                    if (isNaN(amount) || amount <= 0) {
                        throw new Error(`Invalid amount: ${item.amount}`);
                    }

                    // Filter out incomplete attachments and validate types
                    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] as const;
                    const validAttachments = (item.attachments || []).filter(att =>
                        att.url && att.url.trim().length > 0 &&
                        att.name && att.name.trim().length > 0 &&
                        att.type && att.type.trim().length > 0 &&
                        allowedTypes.includes(att.type as typeof allowedTypes[number])
                    ) as Array<{ url: string; name: string; type: typeof allowedTypes[number] }>;

                    lineItems.push({
                        amount,
                        description: (item.description || '').trim(),
                        date: new Date(data.date as string + 'T00:00:00'), // Ensure proper date parsing
                        attachments: validAttachments,
                    });
                }
            });
        } else {
            // Fallback for single line item (backward compatibility)
            const amount = data.amount as string;
            const description = data.description as string;
            if (amount && description && data.date) {
                lineItems.push({
                    amount: parseFloat(amount),
                    description,
                    date: new Date(data.date as string + 'T00:00:00'),
                    attachments: [],
                });
            }
        }

        // Determine expense status based on submission type
        let expenseStatus = ExpenseStatus.DRAFT;
        let assignedManagerId: string | undefined;

        if (submissionType === 'pre-approval') {
            // Prevent self-approval
            if (managerId === session.user.id) {
                return { success: false, error: 'You cannot select yourself as a manager' };
            }
            expenseStatus = ExpenseStatus.PRE_APPROVAL_PENDING;
            assignedManagerId = managerId;
        } else if (submissionType === 'submit') {
            // Prevent self-approval
            if (managerId === session.user.id) {
                return { success: false, error: 'You cannot select yourself as a manager' };
            }
            expenseStatus = ExpenseStatus.SUBMITTED;
            assignedManagerId = managerId;
        }

        // Validate required fields
        if (lineItems.length === 0) {
            return { success: false, error: 'At least one line item is required' };
        }

        // Determine user role for audit trail
        let userRole = 'Employee';
        if (organizationId) {
            const member = await organizationService.findMember(organizationId, session.user.id);
            userRole = member?.role || 'Employee';
        }

        const expenseInput: CreateExpenseInput = {
            userId: session.user.id,
            organizationId: organizationId || undefined,
            managerId: assignedManagerId,
            status: expenseStatus,
            isPersonal: !organizationId,
            lineItems,
        };

        console.log('Parsed lineItems:', lineItems);
        console.log('Creating expense with input:', {
            userId: expenseInput.userId,
            organizationId: expenseInput.organizationId,
            status: expenseInput.status,
            isPersonal: expenseInput.isPersonal,
            lineItemsCount: expenseInput.lineItems.length,
            managerId: expenseInput.managerId
        });

        const result = await expenseService.createExpense(
            expenseInput,
            session.user.id,
            userRole
        );

        console.log('Expense created successfully:', result?._id);

        if (expenseInput.isPersonal) {
            revalidatePath('/dashboard/vault');
        } else {
            revalidatePath('/dashboard/expenses');
        }
        return { success: true, data: result };
    } catch (error) {
        console.error('Error creating expense:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        // CRITICAL: Fail-safe file handling - clean up uploaded files if DB transaction failed
        // Project rule requires immediate cleanup of uploaded assets on failure
        // TODO: Implement actual file cleanup using Transloadit API or storage provider API
        // Currently files may remain orphaned if expense creation fails after upload
        if (uploadedFileKeys.length > 0) {
            console.warn(`CRITICAL: ${uploadedFileKeys.length} uploaded files may need manual cleanup due to failed expense creation`);
            // TODO: Call Transloadit delete API or storage provider cleanup
            // Example: await transloaditApi.deleteFiles(uploadedFileKeys);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create expense'
        };
    }
}

export async function getExpensesAction(organizationId?: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            redirect('/login');
        }

        // Get actual role from organization context
        let role = 'Employee'; // Default to Employee for personal expenses
        if (organizationId) {
            const member = await organizationService.findMember(organizationId, session.user.id);
            role = member?.role || 'Employee';
        }

        const expenses = await expenseVisibilityService.getVisibleExpenses(
            session.user.id,
            organizationId,
            role
        );

        return { success: true, data: expenses };
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch expenses'
        };
    }
}

export async function getExpenseByIdAction(expenseId: string, organizationId?: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            redirect('/login');
        }

        // Get actual role from organization context
        let role = 'Employee'; // Default to Employee for personal expenses
        if (organizationId) {
            const member = await organizationService.findMember(organizationId, session.user.id);
            role = member?.role || 'Employee';
        }

        const expense = await expenseVisibilityService.getVisibleExpense(
            expenseId,
            session.user.id,
            organizationId,
            role
        );

        if (!expense) {
            return { success: false, error: 'Expense not found or not accessible' };
        }

        return { success: true, data: expense };
    } catch (error) {
        console.error('Error fetching expense:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch expense'
        };
    }
}

export async function getPersonalDraftsAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            redirect('/login');
        }

        const drafts = await expenseVisibilityService.getPersonalDrafts(session.user.id);

        return { success: true, data: drafts };
    } catch (error) {
        console.error('Error fetching personal drafts:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch personal drafts'
        };
    }
}