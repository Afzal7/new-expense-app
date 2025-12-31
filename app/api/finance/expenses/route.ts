import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { expenseService } from '@/lib/services/expenseService'
import { verifyPermission } from '@/lib/verifyPermission'
import { ExpenseStatus, Expense } from '@/types/expense'
import { createSuccessResponse, createUnauthorizedResponse, createBadRequestResponse, createForbiddenResponse, handleApiError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return createUnauthorizedResponse();
        }

        // Get organization context from query params
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return createBadRequestResponse('Organization ID required');
        }

        // Verify user has finance/admin access to this organization
        const hasFinanceAccess = await verifyPermission(session.user.id, 'admin', organizationId);
        if (!hasFinanceAccess) {
            return createForbiddenResponse('Finance access required');
        }

        // Get approved expenses for the organization using service layer
        const expenses = await expenseService.getExpensesByStatusAndOrganization(
            ExpenseStatus.APPROVED,
            organizationId
        );

        // Calculate total payout
        const totalPayout = expenses.reduce((sum: number, expense: Expense) => sum + (expense.totalAmount || 0), 0);

        // Log finance dashboard access for audit compliance
        await expenseService.logAuditEvent(
            organizationId,
            session.user.id,
            'FINANCE_DASHBOARD_ACCESS',
            { action: 'view_approved_expenses', count: expenses.length, totalPayout },
            'admin'
        );

        return createSuccessResponse({
            expenses,
            totalPayout,
            count: expenses.length
        });

    } catch (error) {
        return handleApiError(error, 'finance expenses API');
    }
}