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
// Removed unused Textarea import
import { updateExpenseAction, deleteExpenseAction } from '../_actions/edit-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useExpense } from '@/hooks/use-expense';
import { FileUpload } from '@/components/ui/file-upload';

const lineItemSchema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    description: z.string().min(1, 'Description is required'),
});

const editExpenseSchema = z.object({
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
    date: z.string().min(1, 'Date is required'),
});

type EditExpenseForm = z.infer<typeof editExpenseSchema>;

interface EditExpenseDialogProps {
    expenseId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditExpenseDialog({ expenseId, open, onOpenChange }: EditExpenseDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }[]>>([[]]);
    const router = useRouter();

    const { data: expense } = useExpense(expenseId);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<EditExpenseForm>({
        resolver: zodResolver(editExpenseSchema),
        defaultValues: {
            lineItems: [{ amount: '', description: '' }],
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
                lineItems: expense.lineItems.map((item: { amount: number; description: string; date: Date; attachments?: Array<{ url: string; name: string; type: string }> }) => ({
                    amount: item.amount.toString(),
                    description: item.description,
                })),
                date: new Date(expense.createdAt).toISOString().split('T')[0],
            });

            // Initialize uploadedFiles array for new uploads only
            // Existing attachments will be handled separately in the UI
            setUploadedFiles(expense.lineItems.map(() => []));
        }
    }, [expense, open, reset]);

    const onSubmit = async (data: EditExpenseForm) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            data.lineItems.forEach((item, index) => {
                formData.append(`lineItems[${index}][amount]`, item.amount);
                formData.append(`lineItems[${index}][description]`, item.description);
            });

            // Add new uploaded files for each line item
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
                toast.success('Expense updated successfully!');
                reset();
                setUploadedFiles([[]]);
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Failed to update expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const result = await deleteExpenseAction(expenseId);

            if (result.success) {
                toast.success('Expense deleted successfully!');
                setUploadedFiles([[]]);
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
            setUploadedFiles([[]]);
            setShowDeleteConfirm(false);
        }
        onOpenChange(newOpen);
    };

    if (showDeleteConfirm) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Expense</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this expense? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            This will permanently remove the expense and all its data.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete Expense'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>
                        Update your expense details. Only draft expenses can be edited.
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
                                onClick={() => {
                                    append({ amount: '', description: '' });
                                    setUploadedFiles([...uploadedFiles, []]);
                                }}
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
                                                 const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
                                                 setUploadedFiles(newUploadedFiles);
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
                                        {errors.lineItems?.[index]?.amount && (
                                            <p className="text-sm text-destructive">
                                                {errors.lineItems[index].amount.message}
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
                                         {errors.lineItems?.[index]?.description && (
                                             <p className="text-sm text-destructive">
                                                 {errors.lineItems[index].description.message}
                                             </p>
                                         )}
                                     </div>
                                 </div>

                                 {/* Show existing attachments */}
                                 {expense?.lineItems[index]?.attachments && expense.lineItems[index].attachments.length > 0 && (
                                     <div className="space-y-2">
                                         <Label>Existing Attachments</Label>
                                         <div className="space-y-1">
                                             {expense.lineItems[index].attachments.map((attachment: string, attachIndex: number) => (
                                                 <a
                                                     key={attachIndex}
                                                     href={attachment}
                                                     target="_blank"
                                                     rel="noopener noreferrer"
                                                     className="text-sm text-blue-600 hover:text-blue-800 underline block"
                                                 >
                                                     Receipt {attachIndex + 1}
                                                 </a>
                                             ))}
                                         </div>
                                     </div>
                                 )}

                                 <div className="space-y-2">
                                     <Label>Add New Attachments</Label>
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

                        {errors.lineItems && typeof errors.lineItems.message === 'string' && (
                            <p className="text-sm text-destructive">{errors.lineItems.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            {...register('date')}
                        />
                        {errors.date && (
                            <p className="text-sm text-destructive">{errors.date.message}</p>
                        )}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSubmitting}
                            className="sm:mr-auto"
                        >
                            Delete Expense
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Expense'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}