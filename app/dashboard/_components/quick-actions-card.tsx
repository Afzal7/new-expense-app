"use client";

import { Plus, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CreateOrganizationModal } from "./create-organization-modal";
import { UpgradeModal } from "./upgrade-modal";

export function QuickActionsCard() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks to get you started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <CreateOrganizationModal
            trigger={
              <Button variant="outline" className="justify-start h-auto p-3 w-full">
                <Plus className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Create Organization</div>
                  <div className="text-xs text-muted-foreground">Set up a team workspace</div>
                </div>
              </Button>
            }
          />
          <Button
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Configure Settings</div>
              <div className="text-xs text-muted-foreground">Customize your experience</div>
            </div>
          </Button>
          <UpgradeModal
            proTrigger={
              <Button variant="default" className="justify-start h-auto p-3 w-full">
                <BarChart3 className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">See your usage insights</div>
                </div>
              </Button>
            }
            freeTrigger={
              <Button variant="outline" className="justify-start h-auto p-3 w-full">
                <BarChart3 className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">See your usage insights</div>
                </div>
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}