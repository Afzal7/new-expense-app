'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
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
// Removed unused Textarea import

import { useCreateExpense } from '@/hooks/use-expense';
import { useOrganizationManagers } from '@/hooks/use-organization-managers';
import { useExpenseCreationState } from '@/hooks/use-expense-creation-state';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useOrganization } from '@/hooks/use-organization';
import { MotionPulse } from '@/components/ddd';
import { TotalDisplay } from '@/components/features/TotalDisplay';

const lineItemSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
    }, 'Amount must be a positive number'),
    description: z.string().optional(),
});

const createExpenseSchema = z.object({
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
    date: z.string().min(1, 'Date is required').refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
    }, 'Date must be valid and not in the future'),
    managerEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
});

type CreateExpenseForm = z.infer<typeof createExpenseSchema>;

interface CreateExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateExpenseDialog({ open, onOpenChange }: CreateExpenseDialogProps) {
    const { data: userOrg } = useOrganization();
    const createExpense = useCreateExpense();

    const {
        uploadedFiles,
        setUploadedFiles,
        submissionType,
        setSubmissionType,
        selectedManager,
        setSelectedManager,
        managers,
        setManagers,
        managerEmailError,
        setManagerEmailError,
        setHasAutoSaved: _setHasAutoSaved,
        showSuccessGlow: _showSuccessGlow,
        setShowSuccessGlow: _setShowSuccessGlow,
        setShowPulseFeedback: _setShowPulseFeedback,
    } = useExpenseCreationState();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<CreateExpenseForm>({
        resolver: zodResolver(createExpenseSchema),
        defaultValues: {
            lineItems: [{ amount: '', description: '' }],
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            managerEmail: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lineItems',
    });

    // Watch all amount values
    const amountValues = fields.map((_, index) => watch(`lineItems.${index}.amount`));

    const totalAmount = useMemo(() => {
        return amountValues.reduce((sum, amountValue) => {
            const amount = parseFloat(amountValue || '0');
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    }, [amountValues]);

    // Validate manager email exists in org or system
    const validateManagerEmail = useCallback(async (email: string) => {
        if (!email || email.trim() === '') {
            setManagerEmailError('');
            return;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setManagerEmailError('Invalid email format');
            return;
        }

        try {
            // Check if email exists in organization managers first
            if (userOrg?.id) {
                const managerExists = managers.some(manager => manager.email === email);
                if (!managerExists) {
                    setManagerEmailError('Manager email not found in your organization');
                    return;
                }
            } else {
                // For personal expenses, validate against system users
                // Import the validation action dynamically to avoid SSR issues
                const { validateUserEmailAction } = await import('../_actions/user-validation-actions');
                const result = await validateUserEmailAction(email);

                if (!result.success) {
                    setManagerEmailError(result.error || 'Failed to validate manager email');
                    return;
                }

                if (!result.exists) {
                    setManagerEmailError('Manager email not found in the system');
                    return;
                }
            }
            setManagerEmailError('');
        } catch (_error) {
            setManagerEmailError('Unable to validate manager email');
        }
    }, [managers, userOrg?.id, setManagerEmailError]);

    // Validate manager email when it changes
    const watchedManagerEmail = watch('managerEmail');
    useEffect(() => {
        validateManagerEmail(watchedManagerEmail || '');
    }, [watchedManagerEmail, validateManagerEmail]);

    // Fetch organization managers using TanStack Query hook
    const managersQuery = useOrganizationManagers(userOrg?.id, open && !!userOrg?.id && !!userOrg?.id.trim());

    // Update managers state when query succeeds
    useEffect(() => {
        if (managersQuery.data) {
            setManagers(managersQuery.data);
        }
    }, [managersQuery.data, setManagers]);

    // Handle error states
    useEffect(() => {
        if (managersQuery.error) {
            console.error('Failed to load managers:', managersQuery.error);
            toast.error('Failed to load managers');
        }
    }, [managersQuery.error]);

    // Ensure uploadedFiles array matches the number of line items
    useEffect(() => {
        setUploadedFiles(prev => {
            if (prev.length === fields.length) return prev;

            const newUploadedFiles = [...prev];
            // Extend array if needed
            while (newUploadedFiles.length < fields.length) {
                newUploadedFiles.push([]);
            }
            // Trim array if needed
            return newUploadedFiles.slice(0, fields.length);
        });
    }, [fields.length, setUploadedFiles]);

    const onSubmit = async (data: CreateExpenseForm) => {
        const formData = new FormData();

        // Add line items to form data
        data.lineItems.forEach((item, index) => {
            const amount = parseFloat(item.amount);
            formData.append(`lineItems[${index}][amount]`, amount.toString());
            formData.append(`lineItems[${index}][description]`, item.description || '');
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

        // Add submission options
        if (userOrg) {
            formData.append('submissionType', submissionType);
            if (selectedManager) {
                formData.append('managerId', selectedManager);
                const selectedManagerData = managers.find(m => m.id === selectedManager);
                if (selectedManagerData) {
                    formData.append('managerEmail', selectedManagerData.email);
                }
            }
            formData.append('organizationId', userOrg.id);
        }

        createExpense.mutate(formData, {
            onSuccess: (result) => {
                if (result.success) {
                    if (submissionType === 'draft') {
                        _setShowSuccessGlow(true);
                        toast.success('Expense saved as draft!');
                        reset({
                            lineItems: [{ amount: '0.00', description: '' }],
                            date: new Date().toISOString().split('T')[0],
                            managerEmail: '',
                        });
                        setUploadedFiles([[]]);
                        setSelectedManager('');
                        setSubmissionType('draft');
                        _setHasAutoSaved(false);
                        // Delay closing to show success animation
                        setTimeout(() => {
                            onOpenChange(false);
                            _setShowSuccessGlow(false);
                        }, 1200);
        } else {
            _setShowSuccessGlow(true);
            const message = submissionType === 'pre-approval'
                ? 'Pre-approval request submitted!'
                : 'Expense submitted for approval!';
            toast.success(message);
            reset();
            setUploadedFiles([[]]);
            setSelectedManager('');
            // Delay closing to show success animation
            setTimeout(() => {
                onOpenChange(false);
                _setShowSuccessGlow(false);
            }, 1200);
        }
                } else {
                    toast.error(result.error);
                }
            },
            onError: (error: Error) => {
                toast.error(error.message);
            }
        });
    };



    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
            setUploadedFiles([[]]);
            setSelectedManager('');
            _setShowSuccessGlow(false);
            _setShowPulseFeedback(false);
            _setHasAutoSaved(false);
        }
        onOpenChange(newOpen);
    };

    const dialogContent = (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Expense</DialogTitle>
                    <DialogDescription>
                        Add a new expense entry. You can add more details later.
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
                                                // Properly synchronize uploadedFiles array
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
                                                {errors.lineItems[index].amount.message}
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

                        {errors.lineItems && typeof errors.lineItems.message === 'string' && (
                            <p className="text-sm text-destructive">{errors.lineItems.message}</p>
                        )}
                    </div>

                    <TotalDisplay total={totalAmount} />

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
                            <p className="text-sm text-destructive">{errors.date.message}</p>
                        )}
                    </div>



                    {/* Manager Email Field - Progressive disclosure */}
                    {submissionType !== 'draft' && (
                        <div className="space-y-2">
                            <Label htmlFor="managerEmail">Manager Email</Label>
                            {errors.managerEmail ? (
                                <MotionPulse intensity="subtle">
                                    <Input
                                        id="managerEmail"
                                        type="email"
                                        placeholder="manager@company.com"
                                        {...register('managerEmail')}
                                        value={selectedManager ? managers.find(m => m.id === selectedManager)?.email || '' : watch('managerEmail') || ''}
                                        onChange={(e) => {
                                            setValue('managerEmail', e.target.value);
                                            // Clear selected manager if email is manually changed
                                            if (selectedManager && managers.find(m => m.id === selectedManager)?.email !== e.target.value) {
                                                setSelectedManager('');
                                            }
                                        }}
                                    />
                                </MotionPulse>
                            ) : (
                                <Input
                                    id="managerEmail"
                                    type="email"
                                    placeholder="manager@company.com"
                                    {...register('managerEmail')}
                                    value={selectedManager ? managers.find(m => m.id === selectedManager)?.email || '' : watch('managerEmail') || ''}
                                    onChange={(e) => {
                                        setValue('managerEmail', e.target.value);
                                        // Clear selected manager if email is manually changed
                                        if (selectedManager && managers.find(m => m.id === selectedManager)?.email !== e.target.value) {
                                            setSelectedManager('');
                                        }
                                    }}
                                />
                            )}
                             {(errors.managerEmail || managerEmailError) && (
                                 <p className="text-sm text-destructive">
                                     {errors.managerEmail?.message || managerEmailError}
                                 </p>
                             )}
                            <p className="text-sm text-muted-foreground">
                                Email address of the manager who will approve this expense
                            </p>
                        </div>
                    )}

                    {/* Submission Options */}
                    {userOrg && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>Submission Type</Label>
                                <Select value={submissionType} onValueChange={(value: string) => setSubmissionType(value as typeof submissionType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Save as Draft</SelectItem>
                                        <SelectItem value="pre-approval">Request Pre-Approval</SelectItem>
                                        <SelectItem value="submit">Submit for Approval</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    {submissionType === 'draft' && 'Save privately without submitting for approval'}
                                    {submissionType === 'pre-approval' && 'Request approval before making the purchase'}
                                    {submissionType === 'submit' && 'Submit for final approval and reimbursement'}
                                </p>
                            </div>

                            {(submissionType === 'pre-approval' || submissionType === 'submit') && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="manager">Select Manager</Label>
                                        <Select value={selectedManager} onValueChange={setSelectedManager}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a manager" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                 {managersQuery.isLoading ? (
                                                     <SelectItem value="" disabled>Loading managers...</SelectItem>
                                                 ) : managers.length === 0 ? (
                                                     <SelectItem value="" disabled>No managers available</SelectItem>
                                                 ) : (
                                                    managers.map(manager => (
                                                        <SelectItem key={manager.id} value={manager.id}>
                                                            {manager.name} ({manager.role})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            You cannot select yourself as a manager
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={createExpense.isPending}
                        >
                            Cancel
                        </Button>

                        {/* Save as Draft Button */}
                        <motion.div
                            animate={isValid && !managerEmailError ? {
                                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                            } : {
                                boxShadow: '0 0 0px rgba(16, 185, 129, 0)'
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSubmissionType('draft');
                                    // Trigger form submission
                                    const form = document.querySelector('form');
                                    if (form) form.requestSubmit();
                                }}
                                disabled={createExpense.isPending || !isValid || !!managerEmailError}
                            >
                                {createExpense.isPending ? 'Saving...' : 'Save as Draft'}
                            </Button>
                        </motion.div>

                        {/* Submit for Pre-approval Button (only when manager selected) */}
                        {userOrg && selectedManager && (
                            <motion.div
                                animate={isValid && !managerEmailError && selectedManager ? {
                                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                                } : {
                                    boxShadow: '0 0 0px rgba(16, 185, 129, 0)'
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setSubmissionType('pre-approval');
                                        // Trigger form submission
                                        const form = document.querySelector('form');
                                        if (form) form.requestSubmit();
                                    }}
                                    disabled={createExpense.isPending || !isValid || !!managerEmailError || !selectedManager}
                                >
                                    {createExpense.isPending ? 'Submitting...' : 'Submit for Pre-Approval'}
                                </Button>
                            </motion.div>
                        )}

                        {/* Regular Submit Button */}
                        <motion.div
                            animate={isValid && !managerEmailError && (!userOrg?.id || !!selectedManager) ? {
                                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                            } : {
                                boxShadow: '0 0 0px rgba(16, 185, 129, 0)'
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button
                                type="submit"
                                disabled={
                                    createExpense.isPending ||
                                    !isValid ||
                                    !!managerEmailError ||
                                    (!!userOrg?.id && !selectedManager)
                                }
                            >
                                {createExpense.isPending ? 'Creating...' : 'Submit for Approval'}
                            </Button>
                        </motion.div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    return dialogContent;
}