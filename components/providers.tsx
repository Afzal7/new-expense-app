/**
 * Providers component for client-side providers
 * Centralized location for all React context providers
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { FeedbackProvider } from "./providers/feedback-provider";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

// Create QueryClient with production-ready defaults
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          if (
            error instanceof Error &&
            "status" in error &&
            typeof (error as { status: unknown }).status === "number"
          ) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 3;
        },
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: process.env.NODE_ENV === "development",
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance - this ensures a new instance on each render
  // in development, but stable in production
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>
        {children}
        {/* React Query DevTools - only in development, lazy loaded to reduce bundle size */}
        {process.env.NODE_ENV === "development" && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </FeedbackProvider>
    </QueryClientProvider>
  );
}
