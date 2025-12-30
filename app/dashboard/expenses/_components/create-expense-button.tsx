'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
// Removed unused import
import { CreateExpenseDialog } from './create-expense-dialog';

export function CreateExpenseButton() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Expense
            </Button>
            <CreateExpenseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    );
}