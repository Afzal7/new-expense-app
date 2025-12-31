'use client';

import { DashboardErrorBoundary } from "@/components/error-boundary";

export function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardErrorBoundary>
      <div className="container mx-auto px-6 py-8">
        {children}
      </div>
    </DashboardErrorBoundary>
  );
}