'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Link, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReactiveLinkingNotification {
  _id: string;
  userId: string;
  organizationId: string;
  personalDraftCount: number;
  createdAt: Date;
  dismissed: boolean;
}

export function ReactiveLinkingModal() {
  const [notification, setNotification] = useState<ReactiveLinkingNotification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { data: userOrg } = useOrganization();
  const pathname = usePathname();
  const isOnOrgPage = pathname.includes('/organizations/');

  // Check for reactive linking notifications when on organization page
  useEffect(() => {
    if (userOrg?.id && isOnOrgPage) {
      checkForLinkingNotification();
    }
  }, [userOrg?.id, isOnOrgPage]);

  const checkForLinkingNotification = async () => {
    if (!userOrg?.id) return;

    try {
      const response = await fetch(`/api/reactive-linking?organizationId=${userOrg.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.notification && !data.notification.dismissed) {
          setNotification(data.notification);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error checking for reactive linking notification:', error);
    }
  };

  const handleLinkDrafts = async () => {
    if (!notification || !userOrg?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/reactive-linking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'link',
          organizationId: userOrg.id,
          notificationId: notification._id,
        }),
      });

      if (response.ok) {
        toast.success(`Successfully linked ${notification.personalDraftCount} personal expense${notification.personalDraftCount !== 1 ? 's' : ''} to ${userOrg.name || 'organization'}!`);
        setIsOpen(false);
        setNotification(null);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error('Failed to link drafts');
      }
    } catch (error) {
      console.error('Error linking drafts:', error);
      toast.error('Failed to link personal expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!notification) return;

    try {
      await fetch('/api/reactive-linking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'dismiss',
          notificationId: notification._id,
        }),
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }

    setIsOpen(false);
    setNotification(null);
  };

  if (!notification || !userOrg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Link className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Welcome to {userOrg?.name || 'the organization'}!</DialogTitle>
              <DialogDescription>
                We found some personal expenses you can link to your organization.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {notification.personalDraftCount} Personal Expense{notification.personalDraftCount !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-blue-700">
                  Found in your private vault
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Ready to Link
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              These expenses can now be submitted for approval and reimbursement through your organization.
            </p>
            <p>
              <strong>What happens when you link them?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Expenses become visible to your organization's managers</li>
              <li>You can submit them for approval and reimbursement</li>
              <li>All changes are logged in the audit trail</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isLoading}
            className="sm:mr-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Link Later
          </Button>
          <Button
            onClick={handleLinkDrafts}
            disabled={isLoading}
          >
            {isLoading ? 'Linking...' : `Link ${notification.personalDraftCount} Expense${notification.personalDraftCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}