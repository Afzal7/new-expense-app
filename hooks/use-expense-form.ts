'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const lineItemSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number'),
    description: z.string().optional(),
});

const baseExpenseSchema = z.object({
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
    date: z.string().min(1, 'Date is required').refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
    }, 'Date must be valid and not in the future'),
});

export const createExpenseSchema = baseExpenseSchema.extend({
    managerEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
});

export const editExpenseSchema = baseExpenseSchema;

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type EditExpenseFormData = z.infer<typeof editExpenseSchema>;

export interface UseExpenseFormOptions {
    mode: 'create' | 'edit';
    initialData?: Partial<CreateExpenseFormData | EditExpenseFormData>;
}

export interface UseExpenseFormReturn {
    form: UseFormReturn<CreateExpenseFormData | EditExpenseFormData>;
    fields: Array<{
        id: string;
        amount: string;
        description?: string;
    }>;
    append: (value: { amount: string; description?: string }) => void;
    remove: (index: number) => void;
    uploadedFiles: Array<{ url: string; name: string; type: string }>[];
    setUploadedFiles: React.Dispatch<React.SetStateAction<Array<{ url: string; name: string; type: string }>[]>>;
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useExpenseForm({ mode, initialData }: UseExpenseFormOptions): UseExpenseFormReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const schema = mode === 'create' ? createExpenseSchema : editExpenseSchema;

    // Initialize uploadedFiles based on initialData
    const initialUploadedFiles = initialData?.lineItems
        ? new Array(initialData.lineItems.length).fill([])
        : [[]];

    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }[]>>(initialUploadedFiles);

    const form = useForm<CreateExpenseFormData | EditExpenseFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            lineItems: [{ amount: '0.00', description: '' }],
            date: new Date().toISOString().split('T')[0],
            ...(mode === 'create' ? { managerEmail: '' as const } : {}),
            ...initialData,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'lineItems',
    });

    // Update uploadedFiles when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData?.lineItems) {
            setUploadedFiles(new Array(initialData.lineItems.length).fill([]));
        }
    }, [initialData]);

    // Synchronize uploadedFiles with form fields
    const uploadedFilesRef = useRef(uploadedFiles);

    // Update ref when uploadedFiles changes
    useEffect(() => {
        uploadedFilesRef.current = uploadedFiles;
    }, [uploadedFiles]);

    const syncUploadedFiles = useCallback(() => {
        const currentFiles = uploadedFilesRef.current;
        const newUploadedFiles = [...currentFiles];
        // Extend array if needed
        while (newUploadedFiles.length < fields.length) {
            newUploadedFiles.push([]);
        }
        // Trim array if needed
        const trimmedFiles = newUploadedFiles.slice(0, fields.length);
        if (trimmedFiles.length !== currentFiles.length) {
            setUploadedFiles(trimmedFiles);
        }
    }, [fields.length]);

    // Call sync when fields change
    useEffect(() => {
        syncUploadedFiles();
    }, [syncUploadedFiles]);

    return {
        form,
        fields,
        append,
        remove,
        uploadedFiles,
        setUploadedFiles,
        isSubmitting,
        setIsSubmitting,
    };
}