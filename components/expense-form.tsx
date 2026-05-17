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
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { useSession } from "@/lib/auth-client";
import { useExpenseFormSubmission } from "@/hooks/use-expense-form-submission";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useFileUpload } from "@/hooks/use-file-upload";
import { ManagerSelector } from "./expenses/ManagerSelector";
import { LineItemCard } from "./expenses/line-item-card";
import { ExpenseSubmitToOrgSheet } from "./expenses/expense-submit-to-org-sheet";
import {
  EXPENSE_FOOTER_BTN_PRIMARY,
  EXPENSE_FOOTER_BTN_SECONDARY,
  EXPENSE_TOOLBAR_SOFT_BTN,
} from "./expenses/expense-footer-classes";

import { toast } from "@/lib/toast";
import {
  calculateLineItemsTotal,
  createDefaultLineItem,
} from "@/lib/utils/expense-form";
import { attachmentUrlToUserScopedStorageKey } from "@/lib/utils/attachment-url";
import {
  ExpenseFormSchema,
  type ExpenseFormData,
} from "@/lib/validations/expense";
import type { Expense } from "@/types/expense";

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
      ? !initialData.organizationId && !organizationId
      : !organizationId
  );
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [showSubmitSheet, setShowSubmitSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const ACCENT_COLOR = "#D0FC42";

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
  const { data: session } = useSession();

  const isEdit = !!initialData;

  const formMethods = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseFormSchema),
    defaultValues: {
      totalAmount: initialData?.totalAmount || 0,
      managerIds: initialData?.managerIds || [],
      lineItems: initialData?.lineItems?.map((item) => ({
        amount: item.amount,
        date: new Date(item.date).toISOString().split("T")[0],
        description: item.description || "",
        category: item.category?.trim() ? item.category : "",
        attachments: item.attachments || [],
      })) || [],
    },
  });

  const {
    control,
    setValue,
    watch,
    getValues,
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

  const handleRemoveLineItem = (index: number) => {
    const itemToRemove = getValues(`lineItems.${index}`);
    const userId = session?.user?.id;

    const fileKeysToDelete: string[] = [];
    for (const attachmentUrl of itemToRemove?.attachments || []) {
      if (attachmentUrl.startsWith("blob:")) {
        URL.revokeObjectURL(attachmentUrl);
        continue;
      }
      const fileKey =
        userId != null
          ? attachmentUrlToUserScopedStorageKey(attachmentUrl, userId)
          : null;
      if (fileKey) {
        fileKeysToDelete.push(fileKey);
      }
    }

    const wasOnlyLine = fields.length <= 1;
    remove(index);
    setExpandedIndex(wasOnlyLine ? 0 : Math.max(0, index - 1));

    for (const fileKey of fileKeysToDelete) {
      void deleteFile(fileKey).catch((error: unknown) => {
        console.error("Failed to delete attachment from server:", error);
      });
    }
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

      {/* FOOTER ACTIONS — only mount when there are line items (avoids off-screen focus traps) */}
      {fields.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-[60] animate-in slide-in-from-bottom-2 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl duration-300">
          <div className="mx-auto w-full max-w-xl">
            {/* Append line items: fixed above total + actions */}
            <div className="flex gap-2 border-b border-border/80 bg-background/95 px-4 pb-3 pt-3 sm:px-6 sm:pb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={EXPENSE_TOOLBAR_SOFT_BTN}
                aria-label="Add another line from a receipt photo"
              >
                <ImagePlus className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
                <span className="text-center leading-tight">Add receipt</span>
              </button>
              <button
                type="button"
                onClick={addLineItem}
                className={EXPENSE_TOOLBAR_SOFT_BTN}
                aria-label="Add another manual line item"
              >
                <ListPlus className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
                <span className="text-center leading-tight">Add line</span>
              </button>
            </div>

            {/* Total Bar */}
            <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Total Expense
              </span>
              <span className="font-mono text-xl font-bold text-foreground">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 px-4 pb-5 pt-3 sm:px-6">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting}
                className={`${EXPENSE_FOOTER_BTN_SECONDARY} ${
                  hasOrganization ? "" : "w-full flex-none"
                }`}
                aria-label="Save expense to vault"
              >
                <Lock className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
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
                  className={EXPENSE_FOOTER_BTN_PRIMARY}
                  aria-label="Submit expense to organization"
                >
                  <Briefcase className="h-4 w-4 shrink-0 text-[#D0FC42]" aria-hidden />
                  <span>Submit to org</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ExpenseSubmitToOrgSheet
        open={showSubmitSheet}
        onOpenChange={setShowSubmitSheet}
        selectedManagerIds={managerIds}
        onManagerIdsChange={(ids) => setValue("managerIds", ids)}
        organization={organization}
        orgLoading={orgLoading}
        orgError={orgError}
        isPersonal={isPersonal}
        isSubmitting={isSubmitting}
        managerErrors={errors}
        onConfirm={async (submitType) => {
          try {
            if (submitType === "reimburse") {
              await onFinalApproval();
            } else {
              await onPreApproval();
            }
            setShowSubmitSheet(false);
          } catch (error) {
            console.error("Submission error:", error);
          }
        }}
      />
    </div>
  );
}
