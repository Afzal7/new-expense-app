'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteOrganization } from '@/hooks/use-organization-crud';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteOrganizationProps {
    organizationId: string;
    organizationName: string;
    variant?: 'button' | 'icon' | 'destructive';
    className?: string;
    onOrganizationDeleted?: () => void;
}

export function DeleteOrganization({
    organizationId,
    organizationName,
    variant = 'destructive',
    className,
    onOrganizationDeleted
}: DeleteOrganizationProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const deleteOrgMutation = useDeleteOrganization();

    const handleDelete = async () => {
        try {
            await deleteOrgMutation.mutateAsync({ organizationId });
            toast.success('Organization deleted successfully');
            onOrganizationDeleted?.();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete organization');
        } finally {
            setShowConfirm(false);
        }
    };

    const triggerButton = variant === 'destructive' ? (
        <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={deleteOrgMutation.isPending}
            className={className}
        >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Organization
        </Button>
    ) : variant === 'icon' ? (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={deleteOrgMutation.isPending}
            className={className}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    ) : (
        <Button
            variant="outline"
            onClick={() => setShowConfirm(true)}
            disabled={deleteOrgMutation.isPending}
            className={className}
        >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Organization
        </Button>
    );

    return (
        <>
            {triggerButton}

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Organization
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{organizationName}</strong>?
                            This action cannot be undone and will permanently remove:
                            <br /><br />
                            • All organization data and settings
                            <br />
                            • All member access and roles
                            <br />
                            • All projects and associated data
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteOrgMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteOrgMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteOrgMutation.isPending ? 'Deleting...' : 'Delete Organization'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}