"use client";

import { Lightbulb, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TipsGuidanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Tips for Success
        </CardTitle>
        <CardDescription>
          Helpful tips to get the most out of your app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Set up your organization</p>
              <p className="text-xs text-muted-foreground">
                Create a workspace to invite team members and collaborate
                effectively.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Explore features</p>
              <p className="text-xs text-muted-foreground">
                Try out different tools and features to understand what works
                best for you.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Lightbulb className="h-3 w-3 mr-2" />
            Show More Tips
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
