"use client";

import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreditCardIcon, SparklesIcon } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

export function SubscriptionBanner() {
  const router = useRouter();
  const { data: subscriptionData, isLoading } = useSubscription();

  if (isLoading || !subscriptionData?.subscription) {
    return null;
  }

  const { status, periodEnd, trialEnd } = subscriptionData.subscription;

  const endDate = trialEnd || periodEnd;
  const endDateObj = endDate ? new Date(endDate) : null;
  const now = new Date();
  const daysLeft = endDateObj
    ? Math.ceil((endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Past due - payment failed
  if (status === "past_due") {
    return (
      <Alert variant="destructive" className="mb-6">
        <CreditCardIcon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span>
            <strong>Payment failed.</strong> Please update your payment method to continue using Pro features.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/dashboard/settings")}
          >
            Update Payment
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expiring soon (7 days or less)
  if (status === "trialing" && daysLeft <= 7) {
    return (
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <SparklesIcon className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-foreground/80">
            <strong>Pro Features Active.</strong> You have {daysLeft} days left in your trial. Enjoy the power!
          </span>
          {/* Minimalist: No upsell button. Trust the auto-renew. */}
        </AlertDescription>
      </Alert>
    );
  }

  // // Trial expired or canceled subscription expired
  // if (status === "canceled" && endDateObj && endDateObj < now) {
  //   return (
  //     <Alert className="mb-6 border-gray-500 bg-gray-50">
  //       <AlertTriangleIcon className="h-4 w-4 text-gray-600" />
  //       <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
  //         <span className="text-gray-800">
  //           <strong>Your trial has ended.</strong> Upgrade to regain access to Pro features.
  //         </span>
  //         <Button
  //           size="sm"
  //           onClick={() => router.push("/dashboard/upgrade")}
  //         >
  //           Upgrade to Pro
  //         </Button>
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

  // // Subscription will cancel at period end
  // if (status === "active" && subscriptionData.subscription.cancelAtPeriodEnd && endDateObj) {
  //   return (
  //     <Alert className="mb-6 border-yellow-500 bg-yellow-50">
  //       <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
  //       <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
  //         <span className="text-yellow-800">
  //           <strong>Your subscription will end on {endDateObj.toLocaleDateString()}.</strong>
  //           {" "}Reactivate to keep Pro features.
  //         </span>
  //         <Button
  //           size="sm"
  //           onClick={() => router.push("/dashboard/upgrade")}
  //         >
  //           Reactivate
  //         </Button>
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

  return null;
}
