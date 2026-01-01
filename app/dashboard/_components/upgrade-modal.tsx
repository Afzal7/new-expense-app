"use client";

import { useState, cloneElement, ReactElement, ComponentProps } from "react";
import { useUpgradeSubscription } from "@/hooks/use-subscription-mutations";
import { useFeatureGate } from "@/hooks/use-feature-gate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";

interface UpgradeModalProps {
  proTrigger: ReactElement; // Trigger for pro users (performs action)
  freeTrigger: ReactElement; // Trigger for free users (opens modal)
  action?: () => void; // Action to perform for pro users
}

export function UpgradeModal({
  proTrigger,
  freeTrigger,
  action,
}: UpgradeModalProps) {
  const { isPro } = useFeatureGate();
  const [open, setOpen] = useState(false);
  const upgradeSubscriptionMutation = useUpgradeSubscription();

  const handleConfirmUpgrade = () => {
    upgradeSubscriptionMutation.mutate({
      plan: "pro",
      successUrl: `${window.location.origin}/dashboard?upgrade=success`,
      cancelUrl: window.location.href,
    });
    setOpen(false);
  };

  // If user is pro, return the pro trigger with the action attached
  if (isPro) {
    return cloneElement(
      proTrigger as ReactElement<ComponentProps<typeof Button>>,
      {
        onClick: action,
      }
    );
  }

  // If user is not pro, return the free trigger that opens the modal
  const freeTriggerWithHandler = cloneElement(
    freeTrigger as ReactElement<ComponentProps<typeof Button>>,
    {
      onClick: () => setOpen(true),
    }
  );

  return (
    <>
      {freeTriggerWithHandler}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              Unlock unlimited features and advanced capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Features List */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground mb-3">
                What you&apos;ll get:
              </div>
              <div className="space-y-2">
                {[
                  "Unlimited projects",
                  "Advanced analytics",
                  "Priority support",
                  "Export features",
                  "Team collaboration",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trial Info */}
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-sm font-medium">14-day free trial</p>
              <p className="text-xs text-muted-foreground">Cancel anytime</p>
            </div>

            {/* CTA Button */}
            <Button onClick={handleConfirmUpgrade} className="w-full">
              Start Free Trial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
