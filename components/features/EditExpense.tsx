'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { updateExpenseAction, deleteExpenseAction } from '../../app/dashboard/expenses/_actions/edit-actions';
import { useExpense } from '@/hooks/use-expense';
import { ExpenseStatus } from '@/types/expense';

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

// Type-safe helper for form field errors
const getFieldErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
        return (error as { message: string }).message;
    }
    return 'Invalid field';
};

const lineItemSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number'),
    description: z.string().optional(),
});

const editExpenseSchema = z.object({
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
    date: z.string().min(1, 'Date is required').refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
    }, 'Date must be valid and not in the future'),
});

type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

interface EditExpenseProps {
    expenseId: string;
    variant?: 'button' | 'icon';
    className?: string;
}

export function EditExpense({ expenseId, variant = 'button', className }: EditExpenseProps) {
    const [open, setOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }[]>>([[]]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPulseFeedback, setShowPulseFeedback] = useState(false);

    const orgContext = useOrganizationContext();

    // Fetch expense data
    const { data: expense, isLoading: expenseLoading, error: expenseError } = useExpense(expenseId, orgContext?.orgId);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        control,
    } = useForm<EditExpenseFormData>({
        resolver: zodResolver(editExpenseSchema),
        defaultValues: {
            lineItems: [{ amount: '0.00', description: '' }],
            date: new Date().toISOString().split('T')[0],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lineItems',
    });

    // Populate form when expense data loads
    useEffect(() => {
        if (expense && open) {
            reset({
                lineItems: expense.lineItems.map((item: Expense['lineItems'][0]) => ({
                    amount: item.amount.toString(),
                    description: item.description || '',
                })),
                date: new Date(expense.createdAt).toISOString().split('T')[0],
            });
            // Initialize uploadedFiles array
            setUploadedFiles(expense.lineItems.map(() => []));
        }
    }, [expense, open, reset]);

    // Ensure uploadedFiles array matches the number of line items
    useEffect(() => {
        setUploadedFiles(prev => {
            const newUploadedFiles = [...prev];
            // Extend array if needed
            while (newUploadedFiles.length < fields.length) {
                newUploadedFiles.push([]);
            }
            // Trim array if needed
            return newUploadedFiles.slice(0, fields.length);
        });
    }, [fields.length]);

    const onSubmit = async (data: EditExpenseFormData) => {
        setIsSubmitting(true);
        try {
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

            const result = await updateExpenseAction(expenseId, formData);

            if (result.success) {
                setShowPulseFeedback(true);
                toast.success('Expense updated successfully!');
                setTimeout(() => {
                    setOpen(false);
                    setShowPulseFeedback(false);
                }, 1200);
            } else {
                toast.error(result.error || 'Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const result = await deleteExpenseAction(expenseId);
            if (result.success) {
                toast.success('Expense deleted successfully');
                setOpen(false);
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
        setOpen(newOpen);
        if (!newOpen) {
            reset();
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

    return (
        <>
            {triggerButton}

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
                                        disabled={isSubmitting}
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
                            <div className="flex gap-2 w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1">
                                    {isSubmitting ? 'Updating...' : 'Update Expense'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {showPulseFeedback && <PulseFeedback><div /></PulseFeedback>}
        </>
    );
}