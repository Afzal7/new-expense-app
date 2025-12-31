import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardContent } from "./_components/dashboard-content";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const error = params.error as string;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent error={error} />
    </Suspense>
  );
}