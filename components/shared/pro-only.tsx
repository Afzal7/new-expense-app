"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LockIcon, SparklesIcon } from "lucide-react";
import { useFeatureGate } from "@/hooks/use-feature-gate";

interface ProOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  feature?: string;
}

export function ProOnly({
  children,
  fallback,
  showUpgradePrompt = true,
  feature = "this feature",
}: ProOnlyProps) {
  const router = useRouter();
  const { allowed, loading } = useFeatureGate();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return (
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LockIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Pro Feature</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Upgrade to Pro to unlock {feature}.
            </p>
            <Button onClick={() => router.push("/dashboard/upgrade")}>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface ProBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function ProBadge({ children, className = "" }: ProBadgeProps) {
  const router = useRouter();
  const { allowed, loading } = useFeatureGate();

  if (loading) {
    return <>{children}</>;
  }

  if (!allowed) {
    return (
      <div className={`relative group ${className}`}>
        <div className="opacity-40 blur-[1px] pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[2px] rounded-lg">
          <button
            onClick={() => router.push("/dashboard/upgrade")}
            className="flex flex-col items-center gap-2 cursor-pointer group/badge"
            aria-label="Upgrade to Pro to unlock this feature"
          >
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg group-hover/badge:scale-105 transition-transform">
              <SparklesIcon className="h-3 w-3" />
              <span>Pro</span>
            </div>
            <span className="text-xs text-muted-foreground opacity-0 group-hover/badge:opacity-100 transition-opacity">
              Click to upgrade
            </span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
