import { expect, it, describe, vi, beforeEach } from 'vitest';
import { expenseVisibilityService } from '../../lib/services/expenseVisibilityService';
import { Expense } from '../../lib/models';

// Mock dependencies
vi.mock('../../lib/db', () => ({
    connectMongoose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../lib/models', () => ({
    Expense: {
        find: vi.fn(),
        findById: vi.fn(),
    },
}));

describe('expenseVisibilityService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getVisibleExpenses', () => {
        it('should return personal expenses for employees without organization context', async () => {
            const mockExpenses = [
                {
                    _id: 'expense-1',
                    userId: 'user-123',
                    organizationId: null,
                    status: 'DRAFT',
                    isPersonal: true,
                },
                {
                    _id: 'expense-2',
                    userId: 'user-123',
                    organizationId: null,
                    status: 'SUBMITTED',
                    isPersonal: true,
                },
            ];

            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockExpenses),
                }),
            });

            const result = await expenseVisibilityService.getVisibleExpenses('user-123');

            expect(result).toEqual(mockExpenses);
            expect(Expense.find).toHaveBeenCalledWith({ userId: 'user-123', organizationId: null });
        });

        it('should return personal + organization expenses for employees with organization context', async () => {
            const mockExpenses = [
                {
                    _id: 'expense-1',
                    userId: 'user-123',
                    organizationId: null,
                    status: 'DRAFT',
                    isPersonal: true,
                },
                {
                    _id: 'expense-2',
                    userId: 'user-123',
                    organizationId: 'org-456',
                    status: 'SUBMITTED',
                    isPersonal: false,
                },
            ];

            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockExpenses),
                }),
            });

            const result = await expenseVisibilityService.getVisibleExpenses('user-123', 'org-456', 'Employee');

            expect(result).toEqual(mockExpenses);
            expect(Expense.find).toHaveBeenCalledWith({
                $or: [
                    { userId: 'user-123', organizationId: null },
                    { userId: 'user-123', organizationId: 'org-456' }
                ]
            });
        });

        it('should return all organization expenses for admin users', async () => {
            const mockExpenses = [
                {
                    _id: 'expense-1',
                    userId: 'user-123',
                    organizationId: 'org-456',
                    status: 'DRAFT',
                    isPersonal: false,
                },
                {
                    _id: 'expense-2',
                    userId: 'user-456',
                    organizationId: 'org-456',
                    status: 'SUBMITTED',
                    isPersonal: false,
                },
            ];

            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockExpenses),
                }),
            });

            const result = await expenseVisibilityService.getVisibleExpenses('user-123', 'org-456', 'admin');

            expect(result).toEqual(mockExpenses);
            expect(Expense.find).toHaveBeenCalledWith({
                $or: [
                    { userId: 'user-123', organizationId: null },
                    { organizationId: 'org-456' }
                ]
            });
        });

        it('should return all organization expenses for owner users', async () => {
            const mockExpenses = [
                {
                    _id: 'expense-1',
                    userId: 'user-123',
                    organizationId: 'org-456',
                    status: 'DRAFT',
                    isPersonal: false,
                },
                {
                    _id: 'expense-2',
                    userId: 'user-456',
                    organizationId: 'org-456',
                    status: 'SUBMITTED',
                    isPersonal: false,
                },
            ];

            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockExpenses),
                }),
            });

            const result = await expenseVisibilityService.getVisibleExpenses('user-123', 'org-456', 'owner');

            expect(result).toEqual(mockExpenses);
            expect(Expense.find).toHaveBeenCalledWith({
                $or: [
                    { userId: 'user-123', organizationId: null },
                    { organizationId: 'org-456' }
                ]
            });
        });

        it('should return all organization expenses for admin/owner users', async () => {
            const mockExpenses = [
                {
                    _id: 'expense-1',
                    userId: 'user-123',
                    organizationId: 'org-456',
                    status: 'DRAFT',
                    isPersonal: false,
                },
                {
                    _id: 'expense-2',
                    userId: 'user-456',
                    organizationId: 'org-456',
                    status: 'SUBMITTED',
                    isPersonal: false,
                },
            ];

            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockExpenses),
                }),
            });

            const result = await expenseVisibilityService.getVisibleExpenses('user-123', 'org-456', 'admin');

            expect(result).toEqual(mockExpenses);
            expect(Expense.find).toHaveBeenCalledWith({
                $or: [
                    { userId: 'user-123', organizationId: null },
                    { organizationId: 'org-456' }
                ]
            });
        });
    });

    describe('getVisibleExpense', () => {
        it('should return expense if user is the owner', async () => {
            const mockExpense = {
                _id: 'expense-1',
                userId: 'user-123',
                organizationId: null,
                status: 'DRAFT',
                isPersonal: true,
            };

            (Expense.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockExpense),
            });

            const result = await expenseVisibilityService.getVisibleExpense('expense-1', 'user-123');

            expect(result).toEqual(mockExpense);
        });

        it('should return expense if user is org member and has permission', async () => {
            const mockExpense = {
                _id: 'expense-1',
                userId: 'user-456',
                organizationId: 'org-789',
                status: 'SUBMITTED',
                isPersonal: false,
            };

            (Expense.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockExpense),
            });

            const result = await expenseVisibilityService.getVisibleExpense('expense-1', 'user-123', 'org-789', 'admin');

            expect(result).toEqual(mockExpense);
        });

        it('should return null if expense not found', async () => {
            (Expense.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(null),
            });

            const result = await expenseVisibilityService.getVisibleExpense('expense-1', 'user-123');

            expect(result).toBeNull();
        });

        it('should return null if user has no permission to view expense', async () => {
            const mockExpense = {
                _id: 'expense-1',
                userId: 'user-456',
                organizationId: 'org-789',
                status: 'SUBMITTED',
                isPersonal: false,
            };

            (Expense.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockExpense),
            });

            const result = await expenseVisibilityService.getVisibleExpense('expense-1', 'user-123', 'org-999', 'Employee');

            expect(result).toBeNull();
        });
    });

    describe('getPersonalDrafts', () => {
        it('should return only personal draft expenses', async () => {
            const mockDrafts = [
                {
                    _id: 'expense-1',
                    userId: 'user-123',
                    organizationId: null,
                    status: 'DRAFT',
                    isPersonal: true,
                },
                {
                    _id: 'expense-2',
                    userId: 'user-123',
                    organizationId: null,
                    status: 'DRAFT',
                    isPersonal: true,
                },
            ];

            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockDrafts),
                }),
            });

            const result = await expenseVisibilityService.getPersonalDrafts('user-123');

            expect(result).toEqual(mockDrafts);
            expect(Expense.find).toHaveBeenCalledWith({
                userId: 'user-123',
                organizationId: null,
                status: 'DRAFT'
            });
        });

        it('should return empty array if no drafts found', async () => {
            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue([]),
                }),
            });

            const result = await expenseVisibilityService.getPersonalDrafts('user-123');

            expect(result).toEqual([]);
        });
    });
});