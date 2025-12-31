import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectMongoose } from '@/lib/db';
import { Expense } from '@/lib/models';
import { ExpenseStatus } from '@/types/expense';
import { organizationService } from '@/lib/services/organizationService';
import { verifyPermission } from '@/lib/verifyPermission';
import { createSuccessResponse, createUnauthorizedResponse, createBadRequestResponse, createForbiddenResponse, createNotFoundResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return createUnauthorizedResponse();
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const employee = searchParams.get('employee');
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');
    const organizationId = searchParams.get('organizationId');

    // Check organization membership if organizationId is provided
    if (organizationId) {
      const member = await organizationService.findMember(organizationId, session.user.id);
      if (!member) {
        return createForbiddenResponse('Not a member of this organization');
      }
      // Role validation removed - using session-based access control
    }

    // Build query for expenses pending manager approval
    // Build query object
    const baseQuery = {
      $or: [
        { managerId: session.user.id, status: ExpenseStatus.SUBMITTED },
        { managerId: session.user.id, status: ExpenseStatus.PRE_APPROVAL_PENDING },
        { managerId: session.user.id, status: ExpenseStatus.PRE_APPROVED }
      ]
    };

    // Build additional filters
    const filters: Record<string, unknown> = {};
    if (organizationId) {
      filters.organizationId = organizationId;
    }
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (employee && employee !== 'all') {
      filters.userId = employee;
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      filters.createdAt = { $gte: startDate };
    }

    const query = { ...baseQuery, ...filters };

    const expenses = await Expense.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const serializedExpenses = JSON.parse(JSON.stringify(expenses));

    return createSuccessResponse(serializedExpenses);
  } catch (error) {
    return handleApiError(error, 'review queue GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const { expenseId, action, comment } = body;

    if (!expenseId || !action) {
      return createBadRequestResponse('Missing required fields');
    }

    await connectMongoose();

    // Find the expense
    const expense = await Expense.findById(expenseId).lean();
    if (!expense) {
      return createNotFoundResponse('Expense not found');
    }

    // Verify the user has permission to approve expenses (admin/owner roles)
    if (expense.organizationId) {
      const hasPermission = await verifyPermission(session.user.id, 'admin', expense.organizationId.toString());
      if (!hasPermission) {
        return createForbiddenResponse('Not authorized to approve expenses');
      }
    } else {
      return createBadRequestResponse('Cannot approve personal expenses through this endpoint');
    }

    // Prevent self-approval (user cannot review their own expenses)
    if (expense.userId === session.user.id) {
      return createForbiddenResponse('You cannot approve your own expenses');
    }

    // Determine new status based on action
    let newStatus: ExpenseStatus;
    if (action === 'approve') {
      newStatus = expense.status === ExpenseStatus.SUBMITTED
        ? ExpenseStatus.APPROVED
        : ExpenseStatus.APPROVED; // Pre-approved becomes approved
    } else if (action === 'reject') {
      newStatus = ExpenseStatus.REJECTED;
    } else if (action === 'pre-approve') {
      newStatus = ExpenseStatus.PRE_APPROVED;
    } else {
      return createBadRequestResponse('Invalid action');
    }

    // Determine user role for audit trail
    let userRole = 'Employee'; // Default role
    if (expense.organizationId) {
      const member = await organizationService.findMember(expense.organizationId.toString(), session.user.id);
      userRole = member?.role || 'Employee';
    }

    // Update the expense
    await Expense.findByIdAndUpdate(expenseId, {
      status: newStatus,
      updatedAt: new Date(),
      $push: {
        auditTrail: {
          timestamp: new Date(),
          action: action === 'approve' ? 'UPDATE_STATUS' : 'UPDATE_STATUS',
          actorId: session.user.id,
          role: userRole,
          changes: [{
            field: 'status',
            oldValue: expense.status,
            newValue: newStatus,
          }],
          metadata: comment ? { comment } : undefined,
        }
      }
    });

    return createSuccessResponse({
      expenseId,
      newStatus
    });
  } catch (error) {
    return handleApiError(error, 'review queue POST');
  }
}