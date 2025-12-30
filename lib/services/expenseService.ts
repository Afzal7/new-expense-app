import { Expense } from '../models';
import { CreateExpenseInput, createExpenseSchema } from '../validations/expense';
import { AuditLogEntry, ExpenseStatus } from '../../types/expense';
import mongoose from 'mongoose';
import { connectMongoose } from '../db';

/**
 * Service layer for Expense management.
 * Enforces transactional integrity and mandatory audit logging.
 */
export const expenseService = {
    /**
     * Creates a new expense entry with initial audit trail.
     */
    async createExpense(
        input: CreateExpenseInput,
        actorId: string,
        role: string
    ) {
        // 1. Validate Input
        const validatedInput = createExpenseSchema.parse(input);

        await connectMongoose();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const expenseData = {
                ...validatedInput,
                auditTrail: [{
                    timestamp: new Date(),
                    action: 'CREATE',
                    actorId,
                    role,
                    changes: [
                        {
                            field: 'status',
                            oldValue: null,
                            newValue: validatedInput.status
                        },
                        {
                            field: 'lineItemsCount',
                            oldValue: null,
                            newValue: validatedInput.lineItems.length
                        },
                        {
                            field: 'totalAmount',
                            oldValue: null,
                            newValue: validatedInput.lineItems.reduce((sum, item) => sum + item.amount, 0)
                        }
                    ],
                } as AuditLogEntry],
            };

            const [newExpense] = await Expense.create([expenseData], { session });

            await session.commitTransaction();
            return JSON.parse(JSON.stringify(newExpense.toObject()));
        } catch (error) {
            await session.abortTransaction();
            console.error('[ExpenseService] Error creating expense:', error);
            throw error;
        } finally {
            session.endSession();
        }
    },

    /**
     * Helper to log mutations to an existing expense.
     * Should be used within an existing transaction session if possible.
     */
    async logMutation(
        expenseId: string,
        action: AuditLogEntry['action'],
        actorId: string,
        role: string,
        changes: AuditLogEntry['changes'],
        metadata?: Record<string, unknown>,
        session?: mongoose.ClientSession
    ) {
        const auditEntry: AuditLogEntry = {
            timestamp: new Date(),
            action,
            actorId,
            role,
            changes,
            metadata,
        };

        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { $push: { auditTrail: auditEntry } },
            { session, new: true }
        ).lean();
        return JSON.parse(JSON.stringify(updatedExpense));
    },

    /**
     * Updates an existing expense with new data.
     */
    async updateExpense(
        expenseId: string,
        updateData: Partial<{
            lineItems: Array<{
                amount: number;
                description: string;
                date: Date;
                attachments: string[];
            }>;
            totalAmount: number;
            status: ExpenseStatus;
            managerId?: string;
        }>
    ) {
        await connectMongoose();

        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            {
                ...updateData,
                updatedAt: new Date(),
            },
            { new: true }
        ).lean();
        return JSON.parse(JSON.stringify(updatedExpense));
    },

    /**
     * Deletes an expense (only drafts should be deletable).
     */
    async deleteExpense(expenseId: string) {
        await connectMongoose();

        return await Expense.findByIdAndDelete(expenseId);
    },

    /**
     * Reimburses multiple approved expenses (batch operation)
     */
    async reimburseExpenses(
        expenseIds: string[],
        actorId: string,
        role: string
    ) {
        await connectMongoose();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Verify all expenses are in Approved state
            const expenses = await Expense.find({
                _id: { $in: expenseIds },
                status: 'Approved'
            }, null, { session }).lean();

            if (expenses.length !== expenseIds.length) {
                throw new Error('Some expenses not found or not in Approved state');
            }

            // Update all expenses to Reimbursed status with audit logging
            const result = await Expense.updateMany(
                { _id: { $in: expenseIds }, status: 'Approved' },
                [
                    {
                        $set: {
                            status: 'Reimbursed',
                            updatedAt: new Date()
                        }
                    },
                    {
                        $push: {
                            auditTrail: {
                                timestamp: new Date(),
                                action: 'UPDATE_STATUS',
                                actorId,
                                role,
                                changes: [
                                    {
                                        field: 'status',
                                        oldValue: 'Approved',
                                        newValue: 'Reimbursed'
                                    }
                                ],
                                metadata: {
                                    batchReimbursement: true,
                                    expenseCount: expenseIds.length
                                }
                            }
                        }
                    }
                ],
                { session }
            );

            await session.commitTransaction();

            return {
                success: true,
                updatedCount: result.modifiedCount,
                expenseIds
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('[ExpenseService] Error reimbursing expenses:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }
};
