"use client";

import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProBadge } from "@/components/shared/pro-only";

// Sample data for team activity
const getTeamActivity = () => [
  { user: "Sarah Chen", action: "Updated project timeline", time: "5 min ago", avatar: "SC" },
  { user: "Mike Johnson", action: "Completed code review", time: "15 min ago", avatar: "MJ" },
  { user: "Alex Rivera", action: "Created new task", time: "1 hour ago", avatar: "AR" },
];

export function TeamActivityCard() {
  const teamActivity = getTeamActivity();

  return (
    <ProBadge>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Activity
        </CardTitle>
        <CardDescription>
          Recent actions from your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  {activity.avatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full mt-2" size="sm">
            View Team Activity
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </ProBadge>
  );
}