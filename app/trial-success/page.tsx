"use client";

import { useRouter } from "next/navigation";

export default function TrialSuccessPage() {
  const router = useRouter();
  router.push("/dashboard");

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Trial Started!</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
