'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { ExpenseStatus } from '@/types/expense';
import { EditExpense } from '@/components/features/EditExpense';
import { DeleteExpense } from '@/components/features/DeleteExpense';
import { ApproveExpense } from '@/components/features/ApproveExpense';
import { ReimburseExpense } from '@/components/features/ReimburseExpense';
import { useOrganizationById } from '@/hooks/use-organization';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

interface Expense {
    _id: string;
    totalAmount: number;
    status: ExpenseStatus;
    isPersonal: boolean;
    lineItems: Array<{
        description: string;
        amount: number;
        date: Date;
    }>;
    createdAt: Date;
}

interface ExpenseCardProps {
    expense: Expense;
    showEdit?: boolean;
    showDelete?: boolean;
    showApprove?: boolean;
    showReimburse?: boolean;
    onEditSuccess?: () => void;
    onActionSuccess?: () => void;
    className?: string;
}

export function ExpenseCard({
    expense,
    showEdit = true,
    showDelete = true,
    showApprove = false,
    showReimburse = false,
    onEditSuccess,
    onActionSuccess,
    className
}: ExpenseCardProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const orgId = pathname?.split('/')[3]; // Extract org ID from /dashboard/organizations/[id]/...
    const { data: orgData } = useOrganizationById(orgId || '');
    const currentUserMember = orgData?.members?.find(member => member.userId === session?.user?.id);
    const userRole = currentUserMember?.role;
    const getStatusBadge = () => {
        return (
            <div className="flex items-center gap-2">
                <Badge
                    variant={
                        expense.status === ExpenseStatus.APPROVED ? 'default' :
                        expense.status === ExpenseStatus.REJECTED ? 'destructive' :
                        expense.status === ExpenseStatus.SUBMITTED ? 'secondary' :
                        'outline'
                    }
                >
                    {expense.status}
                </Badge>
                {expense.isPersonal && (
                    <Badge variant="outline" className="text-xs">
                        Personal
                    </Badge>
                )}
            </div>
        );
    };

    const getActionButtons = () => {
        const isAdminOrOwner = userRole === 'admin' || userRole === 'owner';

        return (
            <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/expenses/${expense._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                    </Link>
                </Button>
                 {showEdit && (
                     <EditExpense
                         expenseId={expense._id}
                         variant="icon"
                         onSuccess={onEditSuccess}
                     />
                 )}
                {showDelete && (
                    <DeleteExpense
                        expenseId={expense._id}
                        expenseTitle={`expense #${expense._id.slice(-6)}`}
                        variant="icon"
                        onSuccess={onEditSuccess}
                    />
                )}
                {showApprove && isAdminOrOwner && (expense.status === ExpenseStatus.SUBMITTED || expense.status === ExpenseStatus.PRE_APPROVED) && (
                    <ApproveExpense
                        expenseId={expense._id}
                        expenseTitle={`expense #${expense._id.slice(-6)}`}
                        variant="icon"
                        onExpenseApproved={onActionSuccess}
                    />
                )}
                {showReimburse && isAdminOrOwner && expense.status === ExpenseStatus.APPROVED && (
                    <ReimburseExpense
                        expenseId={expense._id}
                        expenseTitle={`expense #${expense._id.slice(-6)}`}
                        variant="icon"
                        onExpenseReimbursed={onActionSuccess}
                    />
                )}
            </div>
        );
    };

    return (
        <Card className={`hover:shadow-md transition-shadow ${className || ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            ${expense.totalAmount.toFixed(2)}
                        </CardTitle>
                        <CardDescription>
                            {expense.lineItems.length} item{expense.lineItems.length !== 1 ? 's' : ''} •
                            {new Date(expense.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {expense.lineItems[0]?.description}
                        {expense.lineItems.length > 1 && ` +${expense.lineItems.length - 1} more`}
                    </div>
                    {getActionButtons()}
                </div>
            </CardContent>
        </Card>
    );
}