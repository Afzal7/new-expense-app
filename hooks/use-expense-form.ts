'use client';

import { useState, useMemo } from 'react';
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

// Custom validation for manager email existence
const validateManagerEmail = async (email: string | undefined, orgId?: string) => {
    if (!email || email.trim() === '') return true; // Optional field

    // For now, we'll do basic email validation
    // In a real implementation, you'd check against org members or user database
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }

    // TODO: Add actual validation against organization members or user system
    // For story implementation, we'll accept any valid email format
    return true;
};

export const createExpenseSchema = baseExpenseSchema.extend({
    managerEmail: z.string().optional().refine(async (email) => {
        return await validateManagerEmail(email);
    }, {
        message: 'Manager email must be a valid email address'
    }),
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

export function useExpenseForm({ mode, initialData: _initialData }: UseExpenseFormOptions): UseExpenseFormReturn {
    const schema = mode === 'create' ? createExpenseSchema : editExpenseSchema;

    // Compute initial uploadedFiles length based on initialData
    const initialUploadedFilesLength = useMemo(() => {
        if (_initialData?.lineItems) {
            return _initialData.lineItems.length;
        }
        return 1; // Default for create mode
    }, [_initialData]);

    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }[]>>(() =>
        new Array(initialUploadedFilesLength).fill([])
    );

    const form = useForm<CreateExpenseFormData | EditExpenseFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            lineItems: [{ amount: '0.00', description: '' }],
            date: new Date().toISOString().split('T')[0],
            ...(mode === 'create' ? { managerEmail: '' as const } : {}),
            ..._initialData,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'lineItems',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);



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