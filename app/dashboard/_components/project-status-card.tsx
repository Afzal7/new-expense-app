"use client";

import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample data for project status
const getProjectStatus = () => [
  { name: "Q4 Marketing Campaign", progress: 75, status: "On Track", dueDate: "Dec 31" },
  { name: "API Integration", progress: 45, status: "In Progress", dueDate: "Jan 15" },
  { name: "User Onboarding Flow", progress: 90, status: "Review", dueDate: "Dec 20" },
];

export function ProjectStatusCard() {
  const projectStatus = getProjectStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Active Projects
        </CardTitle>
        <CardDescription>Current project status and deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectStatus.map((project, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{project.name}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    project.status === "On Track"
                      ? "bg-green-100 text-green-700"
                      : project.status === "Review"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Due: {project.dueDate}
                </p>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full">
            View All Projects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
