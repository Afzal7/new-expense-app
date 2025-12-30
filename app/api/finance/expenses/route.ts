import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { expenseService } from '@/lib/services/expenseService'
import { verifyPermission } from '@/lib/verifyPermission'
import { ExpenseStatus } from '@/types/expense'

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get organization context from query params
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return NextResponse.json(
                { success: false, error: 'Organization ID required' },
                { status: 400 }
            );
        }

        // Verify user has finance/admin access to this organization
        const hasFinanceAccess = await verifyPermission(session.user.id, 'admin', organizationId);
        if (!hasFinanceAccess) {
            return NextResponse.json(
                { success: false, error: 'Finance access required' },
                { status: 403 }
            );
        }

        // Get approved expenses for the organization using service layer
        const expenses = await expenseService.getExpensesByStatusAndOrganization(
            ExpenseStatus.APPROVED,
            organizationId
        );

        // Calculate total payout
        const totalPayout = expenses.reduce((sum: number, expense: any) => sum + (expense.totalAmount || 0), 0);

        // Log finance dashboard access for audit compliance
        await expenseService.logAuditEvent(
            organizationId,
            session.user.id,
            'FINANCE_DASHBOARD_ACCESS',
            { action: 'view_approved_expenses', count: expenses.length, totalPayout },
            'admin'
        );

        return NextResponse.json({
            success: true,
            data: {
                expenses,
                totalPayout,
                count: expenses.length
            }
        });

    } catch (error) {
        console.error('Finance dashboard API error:', error);

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('permission')) {
                return NextResponse.json(
                    { success: false, error: 'Insufficient permissions' },
                    { status: 403 }
                );
            }
            if (error.message.includes('not found')) {
                return NextResponse.json(
                    { success: false, error: 'Organization not found' },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { success: false, error: 'Failed to load finance data' },
            { status: 500 }
        );
    }
}