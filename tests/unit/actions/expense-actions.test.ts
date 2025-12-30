import { expect, it, describe, vi, beforeEach, Mock } from 'vitest';
import { createExpenseAction, getExpensesAction, getExpenseByIdAction } from '../../../app/dashboard/expenses/_actions/expense-actions';
import { expenseService } from '../../../lib/services/expenseService';
import { expenseVisibilityService } from '../../../lib/services/expenseVisibilityService';

// Mock dependencies
vi.mock('../../../lib/services/expenseService', () => ({
  expenseService: {
    createExpense: vi.fn(),
  },
}));

vi.mock('../../../lib/services/expenseVisibilityService', () => ({
  expenseVisibilityService: {
    getVisibleExpenses: vi.fn(),
    getVisibleExpense: vi.fn(),
    getPersonalDrafts: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

describe('Expense Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExpenseAction', () => {
    it('should successfully create an expense with valid form data', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpense = { _id: 'expense-123', status: 'DRAFT' };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseService.createExpense as Mock).mockResolvedValue(mockExpense);

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '25.50');
      formData.append('lineItems[0][description]', 'Lunch meeting');
      formData.append('lineItems[0][attachments][0][url]', 'https://example.com/file.jpg');
      formData.append('lineItems[0][attachments][0][name]', 'receipt.jpg');
      formData.append('lineItems[0][attachments][0][type]', 'image/jpeg');
      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'draft');
      formData.append('organizationId', 'org-123');

      const result = await createExpenseAction(formData);

      expect(result).toEqual({ success: true, data: mockExpense });
      expect(expenseService.createExpense).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          organizationId: 'org-123',
          managerId: undefined,
          status: 'DRAFT',
          isPersonal: false,
          lineItems: [{
            amount: 25.5,
            description: 'Lunch meeting',
            date: expect.any(Date),
            attachments: ['https://example.com/file.jpg']
          }]
        },
        'user-123',
        'Employee'
      );
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/expenses');
    });

    it('should create expense with pre-approval status', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpense = { _id: 'expense-123', status: 'PRE_APPROVAL_PENDING' };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseService.createExpense as Mock).mockResolvedValue(mockExpense);

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '100.00');
      formData.append('lineItems[0][description]', 'Office supplies');
      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'pre-approval');
      formData.append('managerId', 'manager-456');
      formData.append('organizationId', 'org-123');

      const result = await createExpenseAction(formData);

      expect(result).toEqual({ success: true, data: mockExpense });
      expect(expenseService.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PRE_APPROVAL_PENDING',
          managerId: 'manager-456'
        }),
        'user-123',
        'Employee'
      );
    });

    it('should create expense with submit status', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpense = { _id: 'expense-123', status: 'SUBMITTED' };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseService.createExpense as Mock).mockResolvedValue(mockExpense);

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '50.00');
      formData.append('lineItems[0][description]', 'Travel expense');
      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'submit');
      formData.append('managerId', 'manager-456');

      const result = await createExpenseAction(formData);

      expect(result).toEqual({ success: true, data: mockExpense });
      expect(expenseService.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SUBMITTED',
          managerId: 'manager-456'
        }),
        'user-123',
        'Employee'
      );
    });

    it('should handle multiple line items with attachments', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpense = { _id: 'expense-123' };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseService.createExpense as Mock).mockResolvedValue(mockExpense);

      const formData = new FormData();
      // First line item
      formData.append('lineItems[0][amount]', '25.50');
      formData.append('lineItems[0][description]', 'Lunch');
      formData.append('lineItems[0][attachments][0][url]', 'https://example.com/lunch.jpg');
      formData.append('lineItems[0][attachments][0][name]', 'lunch.jpg');
      formData.append('lineItems[0][attachments][0][type]', 'image/jpeg');

      // Second line item
      formData.append('lineItems[1][amount]', '10.00');
      formData.append('lineItems[1][description]', 'Coffee');
      formData.append('lineItems[1][attachments][0][url]', 'https://example.com/coffee.jpg');
      formData.append('lineItems[1][attachments][0][name]', 'coffee.jpg');
      formData.append('lineItems[1][attachments][0][type]', 'image/jpeg');

      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'draft');

      const result = await createExpenseAction(formData);

      expect(result.success).toBe(true);
      expect(expenseService.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          lineItems: [
            {
              amount: 25.5,
              description: 'Lunch',
              date: expect.any(Date),
              attachments: ['https://example.com/lunch.jpg']
            },
            {
              amount: 10,
              description: 'Coffee',
              date: expect.any(Date),
              attachments: ['https://example.com/coffee.jpg']
            }
          ]
        }),
        'user-123',
        'Employee'
      );
    });

    it('should prevent self-approval for pre-approval submissions', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '50.00');
      formData.append('lineItems[0][description]', 'Test expense');
      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'pre-approval');
      formData.append('managerId', 'user-123'); // Same as user ID

      const result = await createExpenseAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'You cannot select yourself as a manager'
      });
      expect(expenseService.createExpense).not.toHaveBeenCalled();
    });

    it('should prevent self-approval for submit submissions', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '50.00');
      formData.append('lineItems[0][description]', 'Test expense');
      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'submit');
      formData.append('managerId', 'user-123'); // Same as user ID

      const result = await createExpenseAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'You cannot select yourself as a manager'
      });
      expect(expenseService.createExpense).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseService.createExpense as Mock).mockRejectedValue(new Error('Invalid amount: -10'));

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '-10');
      formData.append('lineItems[0][description]', 'Invalid expense');
      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'draft');

      const result = await createExpenseAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'Invalid amount: -10'
      });
    });

    it('should return error if user is not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      (headers as any).mockResolvedValue(new Headers());

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '25.50');
      formData.append('lineItems[0][description]', 'Test expense');
      formData.append('date', '2024-01-15');

      const result = await createExpenseAction(formData);
      expect(result).toEqual({
        success: false,
        error: "Cannot read properties of null (reading 'user')"
      });
    });

    it('should filter out incomplete attachments', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpense = { _id: 'expense-123' };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseService.createExpense as Mock).mockResolvedValue(mockExpense);

      const formData = new FormData();
      formData.append('lineItems[0][amount]', '25.50');
      formData.append('lineItems[0][description]', 'Lunch');
      // Complete attachment
      formData.append('lineItems[0][attachments][0][url]', 'https://example.com/file.jpg');
      formData.append('lineItems[0][attachments][0][name]', 'file.jpg');
      formData.append('lineItems[0][attachments][0][type]', 'image/jpeg');
      // Incomplete attachment (missing URL)
      formData.append('lineItems[0][attachments][1][name]', 'incomplete.jpg');
      formData.append('lineItems[0][attachments][1][type]', 'image/jpeg');

      formData.append('date', '2024-01-15');
      formData.append('submissionType', 'draft');

      const result = await createExpenseAction(formData);

      expect(result.success).toBe(true);
      expect(expenseService.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          lineItems: [{
            amount: 25.5,
            description: 'Lunch',
            date: expect.any(Date),
            attachments: ['https://example.com/file.jpg'] // Only complete attachment
          }]
        }),
        'user-123',
        'Employee'
      );
    });
  });

  describe('getExpensesAction', () => {
    it('should fetch visible expenses for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpenses = [
        { _id: 'expense-1', status: 'DRAFT' },
        { _id: 'expense-2', status: 'SUBMITTED' }
      ];

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseVisibilityService.getVisibleExpenses as Mock).mockResolvedValue(mockExpenses);

      const result = await getExpensesAction('org-123');

      expect(result).toEqual({ success: true, data: mockExpenses });
      expect(expenseVisibilityService.getVisibleExpenses).toHaveBeenCalledWith(
        'user-123',
        'org-123',
        'Employee'
      );
    });

    it('should return error if user is not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      (headers as any).mockResolvedValue(new Headers());

      const result = await getExpensesAction();
      expect(result).toEqual({
        success: false,
        error: "Cannot read properties of null (reading 'user')"
      });
    });
  });

  describe('getExpenseByIdAction', () => {
    it('should fetch visible expense by ID', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockExpense = { _id: 'expense-123', status: 'DRAFT' };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseVisibilityService.getVisibleExpense as Mock).mockResolvedValue(mockExpense);

      const result = await getExpenseByIdAction('expense-123', 'org-123');

      expect(result).toEqual({ success: true, data: mockExpense });
      expect(expenseVisibilityService.getVisibleExpense).toHaveBeenCalledWith(
        'expense-123',
        'user-123',
        'org-123',
        'Employee'
      );
    });

    it('should return error for non-existent expense', async () => {
      const mockSession = {
        user: { id: 'user-123' }
      };

      (auth.api.getSession as any).mockResolvedValue(mockSession);
      (headers as any).mockResolvedValue(new Headers());
      (expenseVisibilityService.getVisibleExpense as Mock).mockResolvedValue(null);

      const result = await getExpenseByIdAction('non-existent', 'org-123');

      expect(result).toEqual({
        success: false,
        error: 'Expense not found or not accessible'
      });
    });
  });
});