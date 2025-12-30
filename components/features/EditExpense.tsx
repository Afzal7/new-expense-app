'use client';

import { useState, useMemo } from 'react';
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
import { X, Edit, Trash2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { DatePicker } from '@/components/ui/date-picker';
import { useOrganizationContext } from '@/hooks/use-organization-context';
import { MotionPulse, PulseFeedback } from '@/components/ddd';
import { useExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/use-expense';
import { Expense } from '@/types/expense';
import { useExpenseForm, EditExpenseFormData } from '@/hooks/use-expense-form';

// Type-safe helper for form field errors
const getFieldErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
        return (error as { message: string }).message;
    }
    return 'Invalid field';
};

interface EditExpenseProps {
    expenseId: string;
    variant?: 'button' | 'icon';
    className?: string;
    onSuccess?: () => void;
}

export function EditExpense({ expenseId, variant = 'button', className, onSuccess }: EditExpenseProps) {
    const [open, setOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPulseFeedback, setShowPulseFeedback] = useState(false);

    // Mutation hooks
    const updateExpenseMutation = useUpdateExpense();
    const deleteExpenseMutation = useDeleteExpense();

    const orgContext = useOrganizationContext();

    // Fetch expense data
    const { data: expense, isLoading: expenseLoading, error: expenseError } = useExpense(expenseId, orgContext?.orgId);

    // Transform expense data for the form
    const initialData = useMemo(() => {
        if (!expense) return undefined;

        return {
            lineItems: expense.lineItems.map((item: Expense['lineItems'][0]) => ({
                amount: item.amount.toString(),
                description: item.description || '',
            })),
            date: new Date(expense.createdAt).toISOString().split('T')[0],
        };
    }, [expense]);

    // Use the expense form hook
    const {
        form,
        fields,
        append,
        remove,
        uploadedFiles,
        setUploadedFiles,
    } = useExpenseForm({
        mode: 'edit',
        initialData,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = form;

    const onSubmit = async (data: EditExpenseFormData) => {
        const formData = new FormData();

        // Add line items to form data
        data.lineItems.forEach((item, index) => {
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

        try {
            await updateExpenseMutation.mutateAsync({ expenseId, formData });
            setShowPulseFeedback(true);
            toast.success('Expense updated successfully!');
            onSuccess?.();
            setTimeout(() => {
                setOpen(false);
                setShowPulseFeedback(false);
            }, 1200);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update expense';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteExpenseMutation.mutateAsync(expenseId);
            toast.success('Expense deleted successfully');
            setOpen(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
            toast.error(errorMessage);
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            form.reset();
            setUploadedFiles([[]]);
            setShowPulseFeedback(false);
            setShowDeleteConfirm(false);
        }
    };

    // Loading state while fetching expense
    if (expenseLoading) {
        return variant === 'button' ? (
            <Button variant="outline" size="sm" disabled className={className}>
                <Edit className="h-4 w-4 mr-1" />
                Loading...
            </Button>
        ) : (
            <Button variant="outline" size="sm" disabled className={className}>
                <Edit className="h-4 w-4" />
            </Button>
        );
    }

    // Error state
    if (expenseError) {
        return variant === 'button' ? (
            <Button
                variant="outline"
                size="sm"
                onClick={() => toast.error('Unable to load expense for editing')}
                className={className}
            >
                <Edit className="h-4 w-4 mr-1" />
                Error
            </Button>
        ) : (
            <Button
                variant="outline"
                size="sm"
                onClick={() => toast.error('Unable to load expense for editing')}
                className={className}
            >
                <Edit className="h-4 w-4" />
            </Button>
        );
    }

    const triggerButton = variant === 'button' ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
        </Button>
    ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
            <Edit className="h-4 w-4" />
        </Button>
    );

    const dialogContent = (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>
                        Update your expense details and attachments.
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
                                        {errors.lineItems?.[index]?.amount ? (
                                            <MotionPulse intensity="subtle">
                                                <Input
                                                    id={`amount-${index}`}
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...register(`lineItems.${index}.amount`)}
                                                />
                                            </MotionPulse>
                                        ) : (
                                            <Input
                                                id={`amount-${index}`}
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...register(`lineItems.${index}.amount`)}
                                            />
                                        )}
                                        {errors.lineItems?.[index]?.amount && (
                                            <p className="text-sm text-destructive">
                                                {getFieldErrorMessage(errors.lineItems?.[index]?.amount)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${index}`}>Description</Label>
                                        {errors.lineItems?.[index]?.description ? (
                                            <MotionPulse intensity="subtle">
                                                <Input
                                                    id={`description-${index}`}
                                                    placeholder="What was this for?"
                                                    {...register(`lineItems.${index}.description`)}
                                                />
                                            </MotionPulse>
                                        ) : (
                                            <Input
                                                id={`description-${index}`}
                                                placeholder="What was this for?"
                                                {...register(`lineItems.${index}.description`)}
                                            />
                                        )}
                                        {errors.lineItems?.[index]?.description && (
                                            <p className="text-sm text-destructive">
                                                {getFieldErrorMessage(errors.lineItems?.[index]?.description)}
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
                            <p className="text-sm text-destructive">{getFieldErrorMessage(errors.date)}</p>
                        )}
                    </div>

                    <DialogFooter className="flex-col gap-2">
                        <div className="flex gap-2 w-full">
                                {!showDeleteConfirm ? (
                                     <Button
                                         type="button"
                                         variant="destructive"
                                         onClick={() => setShowDeleteConfirm(true)}
                                         disabled={updateExpenseMutation.isPending || deleteExpenseMutation.isPending}
                                         className="flex-1"
                                     >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Expense
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleteExpenseMutation.isPending}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={deleteExpenseMutation.isPending}
                                            className="flex-1"
                                        >
                                            {deleteExpenseMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                                        </Button>
                                    </>
                                )}
                        </div>
                         <div className="flex gap-2 w-full">
                              <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setOpen(false)}
                                  disabled={updateExpenseMutation.isPending || deleteExpenseMutation.isPending}
                              >
                                  Cancel
                              </Button>
                              <Button type="submit" disabled={updateExpenseMutation.isPending || deleteExpenseMutation.isPending} className="flex-1">
                                  {updateExpenseMutation.isPending ? 'Updating...' : 'Update Expense'}
                              </Button>
                         </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            {triggerButton}

            {showPulseFeedback ? (
                <PulseFeedback>
                    {dialogContent}
                </PulseFeedback>
            ) : (
                dialogContent
            )}
        </>
    );
}