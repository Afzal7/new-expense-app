"use client";

import { useState } from "react";
import {
  CheckCircle,
  DollarSign,
  Users,
  BarChart3,
  Clock,
  X,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FinanceOnboardingProps {
  onComplete?: () => void;
  className?: string;
}

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to Finance Management",
    description:
      "As a finance manager, you handle reimbursement processing and financial oversight.",
    icon: DollarSign,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Your role is crucial in ensuring timely reimbursement of approved
          expenses. You'll have access to process reimbursements and view
          financial reports.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Your Responsibilities
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• Process approved reimbursements</li>
              <li>• Review expense approval workflows</li>
              <li>• Monitor financial activities</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-green-900 dark:text-green-100">
              Key Features
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 mt-2 space-y-1">
              <li>• Bulk reimbursement processing</li>
              <li>• Advanced filtering options</li>
              <li>• Complete audit trails</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "workflow",
    title: "Understanding the Expense Workflow",
    description: "Learn how expenses move through the approval process.",
    icon: Clock,
    content: (
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <span className="text-sm font-medium">Draft</span>
              <span className="text-xs text-muted-foreground text-center">
                Employee creates
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-yellow-600 font-semibold">2</span>
              </div>
              <span className="text-sm font-medium">Pre-Approval</span>
              <span className="text-xs text-muted-foreground text-center">
                Manager reviews
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-orange-600 font-semibold">3</span>
              </div>
              <span className="text-sm font-medium">Approval</span>
              <span className="text-xs text-muted-foreground text-center">
                Final approval
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-semibold">4</span>
              </div>
              <span className="text-sm font-medium">Reimbursement</span>
              <span className="text-xs text-muted-foreground text-center">
                You process
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
          <Lightbulb className="w-5 h-5 text-amber-600 mb-2" />
          <h4 className="font-medium text-amber-900 dark:text-amber-100">
            Your Role
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
            You handle Step 4 - processing reimbursements for approved expenses.
            Focus on expenses in the "Approved" state that are ready for
            payment.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "tools",
    title: "Finance Tools & Features",
    description: "Explore the tools available to finance managers.",
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select multiple expenses and process reimbursements all at once.
                Use the checkboxes and "Bulk Reimburse" button for efficiency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Advanced Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filter expenses by employee, amount range, date range, and
                organization. Use the "Advanced Filters" section to narrow down
                your view.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Audit Trails
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View complete history of expense actions. Click on any expense
                to see the detailed audit trail with timestamps and changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access finance tools directly from the dashboard. Use "Process
                Reimbursements" and "Finance Reports" shortcuts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
];

export function FinanceOnboarding({
  onComplete,
  className = "",
}: FinanceOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
    // Store completion in localStorage to not show again
    localStorage.setItem("finance-onboarding-completed", "true");
  };

  const handleSkip = () => {
    setIsVisible(false);
    // Still mark as completed to not show again
    localStorage.setItem("finance-onboarding-completed", "true");
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Card className={`relative ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <step.icon className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{step.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        {step.content}

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < onboardingSteps.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleComplete} className="bg-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
