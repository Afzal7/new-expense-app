"use client";

import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Sample data for system health
const getSystemHealth = () => ({
  api: { status: "healthy", uptime: "99.9%", responseTime: "120ms" },
  database: { status: "healthy", uptime: "99.8%", connections: 42 },
  storage: { status: "warning", used: "85%", available: "150GB" },
});

export function SystemHealthCard() {
  const systemHealth = getSystemHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Infrastructure status and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">API Services</p>
                <p className="text-xs text-muted-foreground">{systemHealth.api.uptime} uptime</p>
              </div>
            </div>
            <span className="text-xs font-medium text-green-700">{systemHealth.api.responseTime}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">{systemHealth.database.connections} active connections</p>
              </div>
            </div>
            <span className="text-xs font-medium text-green-700">{systemHealth.database.uptime}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Storage</p>
                <p className="text-xs text-muted-foreground">{systemHealth.storage.available} available</p>
              </div>
            </div>
            <span className="text-xs font-medium text-yellow-700">{systemHealth.storage.used} used</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}