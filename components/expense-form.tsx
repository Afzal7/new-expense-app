"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Camera,
  Pen,
  ImagePlus,
  ListPlus,
  Lock,
  Briefcase,
  DollarSign,
  CreditCard,
  Send,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { useExpenseFormSubmission } from "@/hooks/use-expense-form-submission";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useFileUpload } from "@/hooks/use-file-upload";
import { ManagerSelector } from "./expenses/ManagerSelector";
import { LineItemCard } from "./expenses/line-item-card";

import { toast } from "@/lib/toast";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import type { ExpenseFormData } from "@/lib/utils/expense-form";
import {
  calculateLineItemsTotal,
  createDefaultLineItem,
} from "@/lib/utils/expense-form";
import { ExpenseFormSchema } from "@/lib/validations/expense";
import type { Expense } from "@/types/expense";
import type { OrganizationWithMembers } from "@/hooks/use-organization-members";
import type { FieldErrors } from "react-hook-form";

interface ExpenseFormProps {
  initialData?: Expense;
  organizationId?: string;
  onSuccess: (data: Expense) => void;
  onCancel: () => void;
}

export function ExpenseForm({
  initialData,
  organizationId,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  // -- State --
  const [isPersonal, setIsPersonal] = useState(
    initialData
      ? !initialData.organizationId
      : !organizationId
  );
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [showSubmitSheet, setShowSubmitSheet] = useState(false);
  const [submitType, setSubmitType] = useState<"reimburse" | "preapproval">("reimburse");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const ACCENT_COLOR = "#D0FC42";
  const SUBMIT_TYPES = {
    REIMBURSE: "reimburse",
    PREAPPROVAL: "preapproval",
  } as const;

  // -- Hooks --
  const {
    data: organization,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganizationMembers(organizationId || "");

  const {
    submitDraft,
    submitForPreApproval,
    submitForFinalApproval,
    isSubmitting,
  } = useExpenseFormSubmission({
    expenseId: initialData?.id,
    onSuccess,
  });

  const { uploadFile, deleteFile } = useFileUpload();

  const isEdit = !!initialData;

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSubmitSheet) {
        setShowSubmitSheet(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showSubmitSheet]);

  const formMethods = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ExpenseFormSchema) as any,
    defaultValues: {
      totalAmount: initialData?.totalAmount || 0,
      managerIds: initialData?.managerIds || [],
      lineItems: initialData?.lineItems?.map((item) => ({
        amount: item.amount,
        date: new Date(item.date).toISOString().split("T")[0],
        description: item.description || "",
        category: item.category || "",
        attachments: item.attachments || [],
      })) || [],
    },
  });

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const lineItems = useWatch({ control, name: "lineItems", defaultValue: [] }) ?? [];
  const formData = watch();
  const managerIds = formData.managerIds || [];

  const hasOrganization = Boolean(organizationId);

  // Subscribes to nested line-item fields so the total updates as amounts change
  const totalAmount = useMemo(
    () => calculateLineItemsTotal(lineItems),
    [lineItems]
  );

  // -- Handlers --

  const onSaveDraft = async (): Promise<void> => {
    // Update totalAmount to match calculated total before saving.
    // "Save to Vault" on edit withdraws from org: clear approvers (API sets organizationId null).
    const dataToSave = {
      ...formData,
      totalAmount: totalAmount,
      ...(isEdit ? { managerIds: [] as string[] } : {}),
    };
    await submitDraft(dataToSave);
  };

  const onPreApproval = async (): Promise<void> => {
    // Only Manager is required by schema for pre-approval status
    if (!isPersonal && managerIds.length === 0) {
      toast.error("Please select a manager for pre-approval");
      return;
    }
    // Update totalAmount to match calculated total before submitting
    const dataToSubmit = {
      ...formData,
      totalAmount: totalAmount,
    };
    await submitForPreApproval(dataToSubmit);
  };

  const onFinalApproval = async (): Promise<void> => {
    // Only Manager is required by schema for approval-pending status
    if (!isPersonal && managerIds.length === 0) {
      toast.error("Please select a manager for approval");
      return;
    }
    // Update totalAmount to match calculated total before submitting
    const dataToSubmit = {
      ...formData,
      totalAmount: totalAmount,
    };
    await submitForFinalApproval(dataToSubmit);
  };

  const addLineItem = () => {
    append(createDefaultLineItem());
    setExpandedIndex(fields.length); // Expand the new item
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const startIndex = fields.length;
      
      // Create items with immediate preview URLs (optimistic UI)
      files.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        const newItem = createDefaultLineItem();
        // Set attachment immediately for preview, will be replaced with actual URL after upload
        newItem.attachments = [previewUrl];
        append(newItem);
      });
      
      setExpandedIndex(startIndex);
      
      // Upload files in background and replace preview URLs with actual URLs
      files.forEach(async (file, fileIndex) => {
        const itemIndex = startIndex + fileIndex;
        try {
          const { publicUrl } = await uploadFile(file);
          // Wait a bit for the form to update
          setTimeout(() => {
            const currentItem = watch(`lineItems.${itemIndex}`);
            if (currentItem?.attachments) {
              // Replace preview URL with actual URL
              const previewUrl = currentItem.attachments.find((url: string) => url.startsWith('blob:'));
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
              const updatedAttachments = currentItem.attachments.map((url: string) =>
                url.startsWith('blob:') ? publicUrl : url
              );
              setValue(`lineItems.${itemIndex}.attachments`, updatedAttachments);
            }
          }, 100);
        } catch (error) {
          console.error("Upload failed for file:", file.name, error);
          // Remove preview URL on error
          setTimeout(() => {
            const currentItem = watch(`lineItems.${itemIndex}`);
            if (currentItem?.attachments) {
              const previewUrl = currentItem.attachments.find((url: string) => url.startsWith('blob:'));
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
              const updatedAttachments = currentItem.attachments.filter(
                (url: string) => !url.startsWith('blob:')
              );
              setValue(`lineItems.${itemIndex}.attachments`, updatedAttachments);
            }
          }, 100);
        }
      });
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLineItem = async (index: number) => {
    const itemToRemove = watch(`lineItems.${index}`);
    
    // Delete attachment from server before removing item (singular attachment)
    if (itemToRemove?.attachments && itemToRemove.attachments.length > 0) {
      const attachmentUrl = itemToRemove.attachments[0];
      // Skip blob URLs (preview URLs that haven't been uploaded yet)
      if (attachmentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(attachmentUrl);
      } else {
        try {
          const urlObj = new URL(attachmentUrl);
          const fileKey = urlObj.pathname.startsWith("/") 
            ? urlObj.pathname.substring(1) 
            : urlObj.pathname;
          await deleteFile(fileKey);
        } catch (error) {
          console.error("Failed to delete attachment from server:", error);
          // Continue with removal even if delete fails
        }
      }
    }
    
    const wasOnlyLine = fields.length <= 1;
    remove(index);
    setExpandedIndex(wasOnlyLine ? 0 : Math.max(0, index - 1));
  };

  // -- Render --

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-[calc(14rem+env(safe-area-inset-bottom))]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border py-4 flex justify-between items-center">
        <button
          onClick={onCancel}
          aria-label="Back"
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-muted text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm">
          {isEdit ? "Edit Expense" : "New Expense"}
        </span>
        <div className="w-10" />
      </div>

      <div className="mx-auto w-full max-w-xl pt-3">

        {/* INPUT BUTTONS */}
        {fields.length === 0 ? (
          <div className="py-12 space-y-6 animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-xl shadow-zinc-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-4 group"
              aria-label="Scan receipt to add expense"
            >
              <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-[#D0FC42] group-hover:text-primary transition-colors">
                <Camera className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">Scan Receipt</h3>
                <p className="text-primary-foreground/60 text-sm mt-1">
                  AI auto-fills amount & date
                </p>
              </div>
            </button>
            <button
              onClick={addLineItem}
              className="w-full bg-card border border-border rounded-[2.5rem] p-8 hover:border-secondary active:bg-[#FFF0E0] transition-all flex flex-col items-center gap-4 group"
              aria-label="Add manual expense entry"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <Pen className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">Manual Entry</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  No receipt needed
                </p>
              </div>
            </button>
          </div>
        ) : (
          <>
            {/* LINE ITEM STACK */}
            <div className="space-y-6">
              {fields.map((field, i) => (
                <LineItemCard
                  key={field.id}
                  index={i}
                  form={formMethods}
                  remove={handleRemoveLineItem}
                  expanded={expandedIndex === i}
                  onExpand={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
                />
              ))}
            </div>

            {isEdit && !isPersonal && (
              <div className="mt-10 space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Approver
                </h3>
                <ManagerSelector
                  organization={organization}
                  watchedManagerIds={managerIds}
                  onSelectionChange={(ids) => setValue("managerIds", ids)}
                  errors={errors}
                  isLoading={orgLoading}
                />
                {orgError && (
                  <ErrorState
                    message="Failed to load organization members."
                    type="inline"
                    onRetry={() => window.location.reload()}
                  />
                )}
              </div>
            )}

            {/* Spacer for Footer */}
            <div className="h-24"></div>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-40 transition-transform duration-300 pb-[env(safe-area-inset-bottom)] ${
          fields.length > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-xl mx-auto w-full">
          {/* Append line items: fixed above total + actions */}
          <div className="flex gap-2 px-4 pt-3 sm:px-6 border-b border-border/80 bg-background/95">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-11 py-2.5 px-2 bg-primary text-primary-foreground rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-colors"
              aria-label="Add another line from a receipt photo"
            >
              <ImagePlus className="w-[1.125rem] h-[1.125rem] shrink-0" aria-hidden />
              <span className="leading-tight text-center">Add receipt</span>
            </button>
            <button
              type="button"
              onClick={addLineItem}
              className="flex-1 min-h-11 py-2.5 px-2 bg-card border border-border text-foreground rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              aria-label="Add another manual line item"
            >
              <ListPlus className="w-[1.125rem] h-[1.125rem] shrink-0 text-muted-foreground" aria-hidden />
              <span className="leading-tight text-center">Add line</span>
            </button>
          </div>

          {/* Total Bar */}
          <div className="border-b border-border bg-background px-4 py-3 sm:px-6 flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Expense
            </span>
            <span className="font-mono font-bold text-xl text-foreground">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 px-4 pt-4 pb-6 sm:px-6">
            <button
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className={`bg-card border-2 border-border text-foreground py-4 rounded-2xl font-bold text-sm hover:bg-muted hover:border-muted-foreground/30 active:scale-[0.98] transition-all shadow-sm flex flex-col items-center gap-1 disabled:opacity-50 ${
                hasOrganization ? "flex-1" : "w-full"
              }`}
              aria-label="Save expense to vault"
            >
              <Lock className="w-5 h-5 text-secondary mb-1" />
              <span>{isSubmitting ? "Saving..." : "Save to Vault"}</span>
            </button>

            {hasOrganization ? (
              <button
                type="button"
                onClick={() => setShowSubmitSheet(true)}
                disabled={isSubmitting || isPersonal}
                title={
                  isPersonal
                    ? "Personal expenses stay in your vault; switch to an organization expense to submit"
                    : undefined
                }
                className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-zinc-300 flex flex-col items-center gap-1 disabled:opacity-50"
                aria-label="Submit expense report"
              >
                <Briefcase className="w-5 h-5 text-[#D0FC42] mb-1" />
                <span>Submit Report</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* SUBMISSION DRAWER */}
      {showSubmitSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowSubmitSheet(false)}
            aria-label="Close submission drawer"
          />
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[2.5rem] px-4 pt-8 pb-10 sm:px-6 z-50 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
            <div className="max-w-xl mx-auto w-full space-y-8">
              <div className="flex justify-center -mt-2 mb-2">
                <div className="w-12 h-1.5 bg-muted rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-center">Submit to Organization</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSubmitType(SUBMIT_TYPES.REIMBURSE)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    submitType === SUBMIT_TYPES.REIMBURSE
                      ? "bg-background border-primary ring-1 ring-primary"
                      : "bg-card border-border hover:border-muted-foreground/30"
                  }`}
                  aria-pressed={submitType === SUBMIT_TYPES.REIMBURSE}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                      submitType === SUBMIT_TYPES.REIMBURSE
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-foreground">
                    Reimbursement
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    Get paid back
                  </div>
                </button>
                <button
                  onClick={() => setSubmitType(SUBMIT_TYPES.PREAPPROVAL)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    submitType === SUBMIT_TYPES.PREAPPROVAL
                      ? "bg-background border-primary ring-1 ring-primary"
                      : "bg-card border-border hover:border-muted-foreground/30"
                  }`}
                  aria-pressed={submitType === SUBMIT_TYPES.PREAPPROVAL}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                      submitType === SUBMIT_TYPES.PREAPPROVAL
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-foreground">
                    Pre-approval
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    Get permission
                  </div>
                </button>
              </div>

              {!isPersonal && (
                <ManagerSelector
                  organization={organization}
                  watchedManagerIds={managerIds}
                  onSelectionChange={(ids) => setValue("managerIds", ids)}
                  errors={errors}
                  isLoading={orgLoading}
                />
              )}
              {!isPersonal && orgError && (
                <div className="mb-8">
                  <ErrorState
                    message="Failed to load organization members."
                    type="inline"
                    onRetry={() => window.location.reload()}
                  />
                </div>
              )}

              <button
                disabled={
                  isSubmitting ||
                  isPersonal ||
                  (!isPersonal && managerIds.length === 0)
                }
                onClick={async () => {
                  try {
                    if (submitType === SUBMIT_TYPES.REIMBURSE) {
                      await onFinalApproval();
                    } else {
                      await onPreApproval();
                    }
                    setShowSubmitSheet(false);
                  } catch (error) {
                    // Error handling is done in the submission hooks
                    console.error("Submission error:", error);
                  }
                }}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-zinc-200"
                aria-label="Send expense request"
              >
                <span>{isSubmitting ? "Sending..." : "Send Request"}</span>
                {!isSubmitting && <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
