"use client";

import { CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Sample data for setup progress
const getSetupProgress = () => ({
  completed: 3,
  total: 5,
  steps: [
    { name: "Create account", completed: true },
    { name: "Set up profile", completed: true },
    { name: "Create organization", completed: true },
    { name: "Invite team members", completed: false },
    { name: "Configure settings", completed: false },
  ],
});

export function WelcomeCard() {
  const router = useRouter();
  const setupProgress = getSetupProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Welcome to Your SaaS App!
        </CardTitle>
        <CardDescription>
          Great job setting up your account. Here&apos;s your progress so far.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">
              {setupProgress.completed}/{setupProgress.total} completed
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (setupProgress.completed / setupProgress.total) * 100
                }%`,
              }}
            />
          </div>
          <div className="space-y-2">
            {setupProgress.steps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span
                  className={`text-sm ${
                    step.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
