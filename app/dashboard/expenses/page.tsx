import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ExpenseList } from './_components/expense-list';
import { CreateExpenseButton } from './_components/create-expense-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export default async function ExpensesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Expenses</h1>
                    <p className="text-muted-foreground">
                        Manage your expense reports and receipts
                    </p>
                </div>
                <CreateExpenseButton />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Your Expenses
                        </CardTitle>
                        <CardDescription>
                            Track and manage all your expense submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div>Loading expenses...</div>}>
                            <ExpenseList />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}