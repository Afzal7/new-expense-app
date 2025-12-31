import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpenseStatus } from '@/types/expense';

export interface ReviewQueueExpense {
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
    managerId?: string;
    user: {
        name: string;
        email: string;
    };
    manager?: {
        name: string;
        email: string;
    };
}

/**
 * Hook to fetch review queue expenses
 */
export function useReviewQueueExpenses(organizationId?: string) {
    return useQuery({
        queryKey: ['review-queue', organizationId],
        queryFn: async (): Promise<{
            pendingPreApproval: ReviewQueueExpense[];
            pendingApproval: ReviewQueueExpense[];
        }> => {
            if (!organizationId) return { pendingPreApproval: [], pendingApproval: [] };

            const response = await fetch('/api/review-queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch review queue');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load review queue');
            }

            return result.data;
        },
        enabled: !!organizationId,
    });
}

/**
 * Hook to get detailed review queue data with filters
 */
export function useReviewQueueFiltered(organizationId?: string, filters?: {
    status?: string;
    employee?: string;
    dateRange?: string;
}) {
    return useQuery({
        queryKey: ['review-queue-filtered', organizationId, filters],
        queryFn: async (): Promise<ReviewQueueExpense[]> => {
            if (!organizationId) return [];

            const params = new URLSearchParams();
            if (filters?.status) params.set('status', filters.status);
            if (filters?.employee) params.set('employee', filters.employee);
            if (filters?.dateRange) params.set('dateRange', filters.dateRange);

            const response = await fetch(`/api/review-queue?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch filtered review queue');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load filtered review queue');
            }

            return result.data;
        },
        enabled: !!organizationId,
    });
}

/**
 * Hook to approve/reject expenses
 */
export function useApproveExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            expenseId,
            action,
            comment
        }: {
            expenseId: string;
            action: 'approve' | 'reject';
            comment?: string;
        }) => {
            const response = await fetch('/api/review-queue', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expenseId, action, comment }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Action failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-queue'] });
        },
    });
}