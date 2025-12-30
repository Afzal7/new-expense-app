import { connectMongoose } from '../db';
import { Expense } from '../models';
// Removed unused import

/**
 * Visibility service for expense queries.
 * Enforces multi-tenancy and privacy rules.
 */
export const expenseVisibilityService = {
    /**
     * Get all expenses visible to a user based on their role and organization context.
     */
    async getVisibleExpenses(
        userId: string,
        organizationId?: string,
        role: string = 'Employee'
    ) {
        await connectMongoose();

        let query: Record<string, unknown>;

        if (organizationId && (role === 'admin' || role === 'owner')) {
            // For admin and owner, show personal + all org expenses
            query = {
                $or: [
                    { userId, organizationId: null }, // Personal vault
                    { organizationId } // All organization expenses
                ]
            };
        } else if (organizationId && role === 'Employee') {
            // For employees, show personal + their own org expenses
            query = {
                $or: [
                    { userId, organizationId: null }, // Personal vault
                    { userId, organizationId } // Their own org expenses
                ]
            };
        } else {
            // If no organization context, only show personal vault
            query = { userId, organizationId: null };
        }

        const expenses = await Expense.find(query)
            .sort({ createdAt: -1 })
            .lean();
        return JSON.parse(JSON.stringify(expenses));
    },

    /**
     * Get a specific expense if visible to the user.
     */
    async getVisibleExpense(
        expenseId: string,
        userId: string,
        organizationId?: string,
        role: string = 'Employee'
    ) {
        await connectMongoose();

        const expense = await Expense.findById(expenseId).lean();
        if (!expense) return null;

        // Check visibility rules
        const isOwner = expense.userId.toString() === userId;
        const isOrgMember = organizationId && expense.organizationId?.toString() === organizationId;
        const canViewOrgExpenses = role === 'admin' || role === 'owner';

        // User can see their own expenses or org expenses if they have permission
        if (isOwner || (isOrgMember && canViewOrgExpenses)) {
            return JSON.parse(JSON.stringify(expense));
        }

        return null; // Not visible
    },

    /**
     * Get personal draft expenses for the vault dashboard.
     */
    async getPersonalDrafts(userId: string) {
        await connectMongoose();

        const drafts = await Expense.find({
            userId,
            organizationId: null, // Only personal expenses
            status: 'DRAFT'
        })
            .sort({ createdAt: -1 })
            .lean();
        return JSON.parse(JSON.stringify(drafts));
    }
};