"use client";

import { Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "./upgrade-modal";

interface UsageMetricsCardProps {
  metrics: {
    projectsCount: number;
    featuresCount: number;
    membersCount: number;
  };
}

export function UsageMetricsCard({ metrics }: UsageMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Usage Overview
        </CardTitle>
        <CardDescription>
          Your activity and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Projects</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {metrics.projectsCount || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Features Used</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {metrics.featuresCount || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {metrics.membersCount || 0}
              </p>
            </div>
          </div>
        </div>
        <UpgradeModal
          proTrigger={
            <Button variant="default" className="w-full mt-4">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          }
          freeTrigger={
            <Button variant="outline" className="w-full mt-4">
              <Download className="h-4 w-4 mr-2" />
              Export Data (Pro)
            </Button>
          }
          action={() => alert("Exporting data...")}
        />
      </CardContent>
    </Card>
  );
}