"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, TrendingUpIcon, Trash2Icon } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import {
  useCancelSubscription,
  useUpgradeSubscription,
} from "@/hooks/use-subscription-mutations";
import { SUBSCRIPTION_PRICING } from "@/lib/constants";
import { deleteUser } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  // Use TanStack Query hooks
  const { data: subscriptionData, isLoading } = useSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();
  const upgradeSubscriptionMutation = useUpgradeSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);
  const [showAnnualSuccess, setShowAnnualSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEmailSent, setDeleteEmailSent] = useState(false);

  useEffect(() => {
    // Check for annual upgrade success
    const success = searchParams.get("success");
    if (success === "annual" && !hasProcessedSuccess) {
      setHasProcessedSuccess(true);
      setShowAnnualSuccess(true);
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, "", newUrl.toString());
      // Hide alert after 5 seconds
      setTimeout(() => {
        setShowAnnualSuccess(false);
        setHasProcessedSuccess(false); // Reset for future uses
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams to avoid cascading renders

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleProceedCancel = async () => {
    try {
      // Redirect to Stripe Billing Portal for cancellation
      cancelSubscriptionMutation.mutate({
        returnUrl: window.location.href,
      });
      // User will be redirected to Stripe Billing Portal
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Failed to initiate cancellation. Please try again.");
    }
  };

  const handleUpgradeToAnnual = async () => {
    try {
      upgradeSubscriptionMutation.mutate({
        plan: "pro",
        annual: true,
        successUrl: `${window.location.origin}/dashboard/settings?success=annual`,
        cancelUrl: window.location.href,
      });
    } catch (error) {
      console.error("Annual upgrade failed:", error);
      alert("Failed to upgrade to annual plan. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    setIsDeleting(true);
    try {
      await deleteUser();
      setDeleteEmailSent(true);
      toast.success(
        "Verification email sent. Check your inbox to confirm deletion."
      );
    } catch (error) {
      console.error("Delete account failed:", error);
      toast.error("Failed to initiate account deletion. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPro =
    subscriptionData?.subscription?.status === "active" ||
    subscriptionData?.subscription?.status === "trialing";
  const isTrialing = subscriptionData?.subscription?.status === "trialing";
  const trialEnd = subscriptionData?.subscription?.periodEnd
    ? new Date(subscriptionData.subscription.periodEnd)
    : null;

  return (
    <div className="space-y-6">
      {/* Annual Upgrade Success Alert */}
      {showAnnualSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">
                ✓ Switched to annual billing
              </h4>
              <p className="text-green-800 text-sm">
                You&apos;re now on the Pro Annual plan. You&apos;re saving
                $58/year!
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Plan:</span>
                <Badge variant={isPro ? "default" : "secondary"}>
                  {isPro ? (isTrialing ? "Pro Trial" : "Pro Monthly") : "Free"}
                </Badge>
              </div>
              {isTrialing && trialEnd && (
                <p className="text-sm text-muted-foreground">
                  Trial ends on {trialEnd.toLocaleDateString()}
                </p>
              )}
              {isPro && !isTrialing && (
                <p className="text-sm text-muted-foreground">
                  Next billing: {trialEnd?.toLocaleDateString()}
                </p>
              )}
            </div>
            {isPro && (
              <Button variant="destructive" onClick={handleCancelClick}>
                Cancel Subscription
              </Button>
            )}
          </div>

          {/* Annual Upgrade Suggestion */}
          {isPro && !isTrialing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUpIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">
                    💡 Save $58/year with annual billing
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Switch to annual and pay $
                    {SUBSCRIPTION_PRICING.PRO_ANNUAL.price / 100}/year instead
                    of ${SUBSCRIPTION_PRICING.PRO_MONTHLY.price / 100}/month.
                  </p>
                  <Button
                    onClick={handleUpgradeToAnnual}
                    className="mt-3"
                    size="sm"
                  >
                    Switch to Annual ($
                    {SUBSCRIPTION_PRICING.PRO_ANNUAL.price / 100}/year)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2Icon className="h-5 w-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) {
            setDeleteConfirmText("");
            setDeleteEmailSent(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account, including:
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm text-muted-foreground space-y-1 my-4">
            <li>• All your personal data</li>
            <li>• Active subscriptions will be cancelled</li>
            <li>• Organization memberships will be removed</li>
            <li>• This action cannot be undone</li>
          </ul>
          {deleteEmailSent ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">
                    Verification email sent
                  </h4>
                  <p className="text-green-800 text-sm">
                    Check your inbox and click the link to confirm account
                    deletion.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">
                  Type <span className="font-mono font-bold">DELETE</span> to
                  confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                >
                  {isDeleting ? "Processing..." : "Delete My Account"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You&apos;ll be
              redirected to Stripe&apos;s secure billing portal to complete the
              cancellation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleProceedCancel}>
              Continue to Billing Portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
