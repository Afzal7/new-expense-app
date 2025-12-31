import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpenseStatus } from '@/types/expense';

export interface FinanceFilters {
    status?: ExpenseStatus;
    dateRange?: string;
    employee?: string;
}

export interface FinanceExpense {
    _id: string;
    totalAmount: number;
    status: ExpenseStatus;
    isPersonal: boolean;
    lineItems: Array<{
        description: string;
        amount: number;
        date: Date;
        attachments?: Array<{
            url: string;
            name: string;
            type: string;
        }>;
    }>;
    createdAt: Date;
    userId: string;
    organizationId?: string;
    user?: {
        name?: string;
        email: string;
    };
}

/**
 * Hook to fetch finance expenses with proper TanStack Query patterns
 */
export function useFinanceExpenses(orgId: string, filters: FinanceFilters) {
    return useQuery({
        queryKey: ['finance-expenses', orgId, filters],
        queryFn: async (): Promise<{
            expenses: FinanceExpense[];
            totalPayout: number;
            count: number;
        }> => {
            const params = new URLSearchParams();
            params.set('organizationId', orgId);
            if (filters.status) params.set('status', filters.status);
            if (filters.dateRange) params.set('dateRange', filters.dateRange);
            if (filters.employee) params.set('employee', filters.employee);

            const response = await fetch(`/api/finance/expenses?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch expenses: ${response.statusText}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load finance data');
            }

            return result.data;
        },
        enabled: !!orgId,
    });
}

/**
 * Hook to reimburse expenses
 */
export function useReimburseExpenses() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (expenseIds: string[]) => {
            const response = await fetch('/api/finance/reimburse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expenseIds }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Reimbursement failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
        },
    });
}

/**
 * Hook to export expenses
 */
export function useExportExpenses() {
    return useMutation({
        mutationFn: async ({
            format,
            expenseIds,
            organizationId
        }: {
            format: 'csv' | 'pdf';
            expenseIds: string[];
            organizationId: string;
        }) => {
            const response = await fetch('/api/finance/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ format, expenseIds, organizationId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Export failed');
            }

            return response.blob();
        },
    });
}