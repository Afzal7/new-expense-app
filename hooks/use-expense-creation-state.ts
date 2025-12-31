import { useState } from 'react';

export interface ExpenseCreationState {
    uploadedFiles: Array<{ url: string; name: string; type: string }[]>;
    setUploadedFiles: React.Dispatch<React.SetStateAction<Array<{ url: string; name: string; type: string }[]>>>;
    submissionType: 'draft' | 'pre-approval' | 'submit';
    setSubmissionType: React.Dispatch<React.SetStateAction<'draft' | 'pre-approval' | 'submit'>>;
    selectedManager: string;
    setSelectedManager: React.Dispatch<React.SetStateAction<string>>;
    managers: Array<{ id: string; name: string; email: string; role: string }>;
    setManagers: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; email: string; role: string }>>>;
    hasAutoSaved: boolean;
    setHasAutoSaved: React.Dispatch<React.SetStateAction<boolean>>;
    managerEmailError: string;
    setManagerEmailError: React.Dispatch<React.SetStateAction<string>>;
    showSuccessGlow: boolean;
    setShowSuccessGlow: React.Dispatch<React.SetStateAction<boolean>>;
    showPulseFeedback: boolean;
    setShowPulseFeedback: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook to manage complex expense creation state
 * Extracts all state management from CreateExpenseDialog component
 */
export function useExpenseCreationState(): ExpenseCreationState {
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }[]>>([[]]);
    const [submissionType, setSubmissionType] = useState<'draft' | 'pre-approval' | 'submit'>('draft');
    const [selectedManager, setSelectedManager] = useState<string>('');
    const [managers, setManagers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
    const [hasAutoSaved, setHasAutoSaved] = useState(false);
    const [managerEmailError, setManagerEmailError] = useState<string>('');
    const [showSuccessGlow, setShowSuccessGlow] = useState(false);
    const [showPulseFeedback, setShowPulseFeedback] = useState(false);

    return {
        uploadedFiles,
        setUploadedFiles,
        submissionType,
        setSubmissionType,
        selectedManager,
        setSelectedManager,
        managers,
        setManagers,
        hasAutoSaved,
        setHasAutoSaved,
        managerEmailError,
        setManagerEmailError,
        showSuccessGlow,
        setShowSuccessGlow,
        showPulseFeedback,
        setShowPulseFeedback,
    };
}