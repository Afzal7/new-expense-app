'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLeaveOrganization } from '@/hooks/use-organization-crud';
import { toast } from 'sonner';
import { LogOut, AlertTriangle } from 'lucide-react';
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

interface LeaveOrganizationProps {
    organizationId: string;
    organizationName: string;
    variant?: 'button' | 'icon' | 'destructive';
    className?: string;
    onOrganizationLeft?: () => void;
}

export function LeaveOrganization({
    organizationId,
    organizationName,
    variant = 'destructive',
    className,
    onOrganizationLeft
}: LeaveOrganizationProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const leaveOrgMutation = useLeaveOrganization();

    const handleLeave = async () => {
        try {
            await leaveOrgMutation.mutateAsync({ organizationId });
            toast.success('You have left the organization');
            onOrganizationLeft?.();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to leave organization');
        } finally {
            setShowConfirm(false);
        }
    };

    const triggerButton = variant === 'destructive' ? (
        <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={leaveOrgMutation.isPending}
            className={className}
        >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Organization
        </Button>
    ) : variant === 'icon' ? (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={leaveOrgMutation.isPending}
            className={className}
        >
            <LogOut className="h-4 w-4" />
        </Button>
    ) : (
        <Button
            variant="outline"
            onClick={() => setShowConfirm(true)}
            disabled={leaveOrgMutation.isPending}
            className={className}
        >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Organization
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
                            Leave Organization
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave <strong>{organizationName}</strong>?
                            You will lose access to:
                            <br /><br />
                            • All organization resources and projects
                            <br />
                            • Team collaboration features
                            <br />
                            • Shared expense workflows
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={leaveOrgMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeave}
                            disabled={leaveOrgMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {leaveOrgMutation.isPending ? 'Leaving...' : 'Leave Organization'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}