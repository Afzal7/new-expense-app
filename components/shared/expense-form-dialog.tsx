'use client';

import { useEffect, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { DatePicker } from '@/components/ui/date-picker';
import { useOrganizationContext } from '@/hooks/use-organization-context';
import { SuccessGlow, PulseFeedback, MotionPulse } from '@/components/ddd';
import { useExpenseForm, CreateExpenseFormData } from '@/hooks/use-expense-form';
import { createExpenseAction } from '../../app/dashboard/expenses/_actions/expense-actions';
import { updateExpenseAction, deleteExpenseAction } from '../../app/dashboard/expenses/_actions/edit-actions';
import { useExpense } from '@/hooks/use-expense';
import { ExpenseStatus } from '@/types/expense';

type CreateExpenseErrors = FieldErrors<CreateExpenseFormData>;

type Expense = {
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
};

interface ExpenseFormDialogProps {
    mode: 'create' | 'edit';
    expenseId?: string; // Only for edit mode
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Type-safe helper for form field errors
const getFieldErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
        return (error as { message: string }).message;
    }
    return 'Invalid field';
};

export function ExpenseFormDialog({ mode, expenseId, open, onOpenChange }: ExpenseFormDialogProps) {
    const [showSuccessGlow, setShowSuccessGlow] = useState(false);
    const [showPulseFeedback, setShowPulseFeedback] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [submissionType, _setSubmissionType] = useState<'draft' | 'pre-approval' | 'submit'>('draft');
    const [selectedManager, setSelectedManager] = useState<string>('');
    const [managers, setManagers] = useState<Array<{id: string, name: string, email: string, role: string}>>([]);
    const [_loadingManagers, setLoadingManagers] = useState(false);

    const orgContext = useOrganizationContext();

    // Load expense data for edit mode
    const { data: expense } = useExpense(expenseId || '', orgContext?.orgId);

    const {
        form,
        fields,
        append,
        remove,
        uploadedFiles,
        setUploadedFiles,
        isSubmitting,
        setIsSubmitting,
    } = useExpenseForm({
        mode,
        initialData: mode === 'edit' && expense ? {
            lineItems: expense.lineItems.map((item: Expense['lineItems'][0]) => ({
                amount: item.amount.toString(),
                description: item.description || '',
            })),
            date: new Date(expense.createdAt).toISOString().split('T')[0],
        } : undefined,
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

    // Fetch organization managers when dialog opens (create mode)
    useEffect(() => {
        if (open && mode === 'create' && orgContext?.orgId) {
            setLoadingManagers(true);
            fetch(`/api/organizations/managers?organizationId=${orgContext.orgId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error fetching managers:', data.error);
                        setManagers([]);
                    } else {
                        setManagers(data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching managers:', error);
                    setManagers([]);
                })
                .finally(() => setLoadingManagers(false));
        } else {
            setManagers([]);
        }
    }, [open, mode, orgContext?.orgId]);

    const onSubmit = async (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Add line items to form data
            data.lineItems.forEach((item: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const amount = parseFloat(item.amount);
                formData.append(`lineItems[${index}][amount]`, amount.toString());
                if (item.description) {
                    formData.append(`lineItems[${index}][description]`, item.description);
                }
            });

            // Add uploaded files to form data per line item
            uploadedFiles.forEach((lineItemFiles, lineItemIndex) => {
                lineItemFiles.forEach((file, fileIndex) => {
                    formData.append(`lineItems[${lineItemIndex}][attachments][${fileIndex}][url]`, file.url);
                    formData.append(`lineItems[${lineItemIndex}][attachments][${fileIndex}][name]`, file.name);
                    formData.append(`lineItems[${lineItemIndex}][attachments][${fileIndex}][type]`, file.type);
                });
            });

            formData.append('date', data.date);

            let result;
            if (mode === 'create') {
                // Add submission options for create
                if (orgContext) {
                    formData.append('submissionType', submissionType);
                    if (selectedManager) {
                        formData.append('managerId', selectedManager);
                        const selectedManagerData = managers.find(m => m.id === selectedManager);
                        if (selectedManagerData) {
                            formData.append('managerEmail', selectedManagerData.email);
                        }
                    }
                    formData.append('organizationId', orgContext.orgId);
                }
                result = await createExpenseAction(formData);
            } else {
                // Edit mode
                result = await updateExpenseAction(expenseId!, formData);
            }

            if (result.success) {
                if (mode === 'create' && submissionType === 'draft') {
                    setShowSuccessGlow(true);
                    toast.success('Expense saved as draft!');
                    // Reset form
                    form.reset({
                        lineItems: [{ amount: '0.00', description: '' }],
                        date: new Date().toISOString().split('T')[0],
                        managerEmail: '',
                    });
                    setUploadedFiles([[]]);
                    setSelectedManager('');
                    setTimeout(() => {
                        onOpenChange(false);
                        setShowSuccessGlow(false);
                    }, 1200);
                } else {
                    setShowPulseFeedback(true);
                    const message = mode === 'create'
                        ? (submissionType === 'pre-approval' ? 'Pre-approval request submitted!' : 'Expense submitted for approval!')
                        : 'Expense updated successfully!';
                    toast.success(message);
                    setTimeout(() => {
                        onOpenChange(false);
                        setShowPulseFeedback(false);
                    }, 1200);
                }
            } else {
                toast.error(result.error || 'Failed to save expense');
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!expenseId) return;

        setIsSubmitting(true);
        try {
            const result = await deleteExpenseAction(expenseId);
            if (result.success) {
                toast.success('Expense deleted successfully');
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset form when closing
            form.reset();
            setUploadedFiles([[]]);
            setSelectedManager('');
            setShowSuccessGlow(false);
            setShowPulseFeedback(false);
            setShowDeleteConfirm(false);
        }
        onOpenChange(newOpen);
    };

    const dialogContent = (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create New Expense' : 'Edit Expense'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new expense entry. You can add more details later.'
                            : 'Edit your expense details and attachments.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Line Items</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ amount: '0.00', description: '' })}
                            >
                                Add Item
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Item {index + 1}</h4>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                remove(index);
                                                setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor={`amount-${index}`}>Amount ($)</Label>
                                        <Input
                                            id={`amount-${index}`}
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register(`lineItems.${index}.amount`)}
                                        />
                                        {errors.lineItems && Array.isArray(errors.lineItems) && errors.lineItems[index]?.amount && (
                                            <p className="text-sm text-destructive">
                                                {getFieldErrorMessage(errors.lineItems[index].amount)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${index}`}>Description</Label>
                                        <Input
                                            id={`description-${index}`}
                                            placeholder="What was this for?"
                                            {...register(`lineItems.${index}.description`)}
                                        />
                                        {errors.lineItems && Array.isArray(errors.lineItems) && errors.lineItems[index]?.description && (
                                            <p className="text-sm text-destructive">
                                                {getFieldErrorMessage(errors.lineItems[index].description)}
                                            </p>
                                        )}
                                        {errors.lineItems?.[index]?.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.lineItems[index].description.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Receipts & Attachments</Label>
                                    <FileUpload
                                        uploadedFiles={uploadedFiles[index] || []}
                                        onUploadComplete={(files) => {
                                            const newUploadedFiles = [...uploadedFiles];
                                            newUploadedFiles[index] = files;
                                            setUploadedFiles(newUploadedFiles);
                                        }}
                                        onUploadError={(error) => toast.error(error)}
                                        onRemoveFile={(fileIndex) => {
                                            const newUploadedFiles = [...uploadedFiles];
                                            newUploadedFiles[index] = (newUploadedFiles[index] || []).filter((_, i) => i !== fileIndex);
                                            setUploadedFiles(newUploadedFiles);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {errors.lineItems && typeof (errors.lineItems as { message?: string }).message === 'string' && (
                            <p className="text-sm text-destructive">{(errors.lineItems as { message: string }).message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        {errors.date ? (
                            <MotionPulse intensity="subtle">
                                <DatePicker
                                    date={watch('date') ? new Date(watch('date')) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            setValue('date', date.toISOString().split('T')[0]);
                                        }
                                    }}
                                    placeholder="Select expense date"
                                />
                            </MotionPulse>
                        ) : (
                            <DatePicker
                                date={watch('date') ? new Date(watch('date')) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        setValue('date', date.toISOString().split('T')[0]);
                                    }
                                }}
                                placeholder="Select expense date"
                            />
                        )}
                            {errors.date && (
                                <p className="text-sm text-destructive">
                                    {typeof errors.date.message === 'string' ? errors.date.message : 'Invalid date'}
                                </p>
                            )}
                    </div>

                    {mode === 'create' && (
                        <div className="space-y-2">
                            <Label htmlFor="managerEmail">Manager Email</Label>
                            <Input
                                id="managerEmail"
                                type="email"
                                placeholder="manager@company.com"
                                {...(register as unknown as any)('managerEmail')} // eslint-disable-line @typescript-eslint/no-explicit-any
                                value={selectedManager ? managers.find(m => m.id === selectedManager)?.email || '' : (watch as unknown as any)('managerEmail') || ''} // eslint-disable-line @typescript-eslint/no-explicit-any
                                onChange={(e) => {
                                    (setValue as unknown as any)('managerEmail', e.target.value); // eslint-disable-line @typescript-eslint/no-explicit-any
                                    // Clear selected manager if email is manually changed
                                    if (selectedManager && managers.find(m => m.id === selectedManager)?.email !== e.target.value) {
                                        setSelectedManager('');
                                    }
                                }}
                            />
                            {(errors as CreateExpenseErrors).managerEmail && (
                                <p className="text-sm text-destructive">
                                    {getFieldErrorMessage((errors as CreateExpenseErrors).managerEmail)}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Email address of the manager who will approve this expense (optional)
                            </p>
                        </div>
                    )}

                    <DialogFooter className="flex-col gap-2">
                        {mode === 'edit' && (
                            <div className="flex gap-2 w-full">
                                {!showDeleteConfirm ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        Delete Expense
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                        <div className="flex gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting
                                    ? (mode === 'create' ? 'Creating...' : 'Updating...')
                                    : (mode === 'create' ? 'Create Expense' : 'Update Expense')
                                }
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            {dialogContent}
            {showSuccessGlow && <SuccessGlow><div /></SuccessGlow>}
            {showPulseFeedback && <PulseFeedback><div /></PulseFeedback>}
        </>
    );
}