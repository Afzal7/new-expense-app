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
// Removed unused Textarea import

import { useCreateExpense } from '@/hooks/use-expense';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useOrganizationContext } from '@/hooks/use-organization-context';
import { SuccessGlow, PulseFeedback, MotionPulse } from '@/components/ddd';

const lineItemSchema = z.object({
     amount: z.string().min(1, 'Amount is required').refine((val) => {
         const num = parseFloat(val);
         return !isNaN(num) && num > 0;
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
    const [showSuccessGlow, setShowSuccessGlow] = useState(false);
    const [showPulseFeedback, setShowPulseFeedback] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }[]>>([[]]);
    const [submissionType, setSubmissionType] = useState<'draft' | 'pre-approval' | 'submit'>('draft');
    const [selectedManager, setSelectedManager] = useState<string>('');
    const [managers, setManagers] = useState<Array<{id: string, name: string, email: string, role: string}>>([]);
    const [loadingManagers, setLoadingManagers] = useState(false);
    const orgContext = useOrganizationContext();
    const createExpense = useCreateExpense();

    const {
         register,
         handleSubmit,
         control,
         reset,
         watch,
         setValue,
         formState: { errors },
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

    // Fetch organization managers when dialog opens
    useEffect(() => {
        if (open && orgContext?.orgId) {
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
    }, [open, orgContext?.orgId]);

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

    const onSubmit = async (data: CreateExpenseForm) => {
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

        // Add submission options
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

        createExpense.mutate(formData, {
            onSuccess: () => {
                if (submissionType === 'draft') {
                      setShowSuccessGlow(true);
                      toast.success('Expense saved as draft!');
                      reset({
                          lineItems: [{ amount: '0.00', description: '' }],
                          date: new Date().toISOString().split('T')[0],
                          managerEmail: '',
                      });
                      setUploadedFiles([[]]);
                      setSelectedManager('');
                      setSubmissionType('draft');
                       // Delay closing to show success animation
                      setTimeout(() => {
                          onOpenChange(false);
                          setShowSuccessGlow(false);
                      }, 1200);
                 } else {
                    setShowPulseFeedback(true);
                    const message = submissionType === 'pre-approval'
                        ? 'Pre-approval request submitted!'
                        : 'Expense submitted for approval!';
                      toast.success(message);
                      reset();
                      setUploadedFiles([[]]);
                      setSelectedManager('');
                       // Delay closing to show pulse animation
                      setTimeout(() => {
                          onOpenChange(false);
                          setShowPulseFeedback(false);
                      }, 800);
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
             setShowSuccessGlow(false);
             setShowPulseFeedback(false);
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



                     {/* Manager Email Field - Always visible */}
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
                         {errors.managerEmail && (
                             <p className="text-sm text-destructive">{errors.managerEmail.message}</p>
                         )}
                         <p className="text-sm text-muted-foreground">
                             Email address of the manager who will approve this expense (optional)
                         </p>
                     </div>

                     {/* Submission Options */}
                     {orgContext && (
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
                                                  {loadingManagers ? (
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={createExpense.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createExpense.isPending}>
                            {createExpense.isPending ? 'Creating...' : 'Create Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    if (showSuccessGlow) {
        return <SuccessGlow>{dialogContent}</SuccessGlow>;
    }

    if (showPulseFeedback) {
        return <PulseFeedback>{dialogContent}</PulseFeedback>;
    }

    return dialogContent;
}