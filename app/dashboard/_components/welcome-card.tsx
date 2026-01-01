"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingProgress } from "../_actions/get-onboarding-progress";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function WelcomeCard() {
  const router = useRouter();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["onboarding-progress"],
    queryFn: () => getOnboardingProgress(),
    // Keep data fresh but don't over-fetch
    staleTime: 1000 * 60,
  });

  // Skeleton / Loading State
  if (isLoading || !progress) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded-full" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { percent, completedCount, totalCount, steps, firstOrgId } = progress;
  const isComplete = percent === 100;

  return (
    <Card
      className={cn(
        "border-border/60 shadow-sm transition-all duration-300",
        isComplete
          ? "bg-gradient-to-br from-background to-primary/5 border-primary/20"
          : ""
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <div className="relative flex h-5 w-5 items-center justify-center">
                <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20 duration-1000" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
            )}
            {isComplete ? "You're all set!" : "Let's get you started"}
          </CardTitle>
          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            {percent}%
          </span>
        </div>
        <CardDescription>
          {isComplete
            ? "Great job! You've completed all setup tasks."
            : `Complete ${totalCount - completedCount} more tasks to unlock your full potential.`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-6">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.key}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-300",
                    step.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    step.completed
                      ? "text-muted-foreground line-through decoration-border"
                      : "font-medium text-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>

              {!step.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    // Routing logic based on key
                    if (step.key === "org")
                      router.push(
                        firstOrgId
                          ? `/dashboard/organizations/${firstOrgId}`
                          : "/dashboard/organizations/new"
                      );
                    if (step.key === "invite")
                      router.push(
                        firstOrgId
                          ? `/dashboard/organizations/${firstOrgId}/invitations`
                          : "/dashboard"
                      );
                    if (step.key === "subscription")
                      router.push("/dashboard/settings/billing");
                  }}
                >
                  Go <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
