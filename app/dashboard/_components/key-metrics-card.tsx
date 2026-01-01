"use client";

import { BarChart3, Users, Target, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProOnly } from "@/components/shared/pro-only";

// Sample data for key metrics
const getKeyMetrics = () => ({
  revenue: { value: "$12,450", change: "+12%", period: "vs last month" },
  users: { value: "2,847", change: "+8%", period: "active this week" },
  conversion: { value: "3.2%", change: "+0.5%", period: "vs last month" },
  satisfaction: { value: "4.8", change: "+0.2", period: "average rating" },
});

export function KeyMetricsCard() {
  const keyMetrics = getKeyMetrics();

  return (
    <ProOnly feature="advanced analytics">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Metrics
          </CardTitle>
          <CardDescription>Business performance at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {keyMetrics.revenue.value}
                  </p>
                  <p className="text-xs text-blue-700">
                    {keyMetrics.revenue.change} {keyMetrics.revenue.period}
                  </p>
                </div>
                <div className="text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-blue-900 mt-1">Revenue</p>
            </div>

            <div className="p-3 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    {keyMetrics.users.value}
                  </p>
                  <p className="text-xs text-green-700">
                    {keyMetrics.users.change} {keyMetrics.users.period}
                  </p>
                </div>
                <div className="text-green-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-green-900 mt-1">
                Active Users
              </p>
            </div>

            <div className="p-3 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {keyMetrics.conversion.value}
                  </p>
                  <p className="text-xs text-purple-700">
                    {keyMetrics.conversion.change}{" "}
                    {keyMetrics.conversion.period}
                  </p>
                </div>
                <div className="text-purple-600">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-purple-900 mt-1">
                Conversion
              </p>
            </div>

            <div className="p-3 bg-linear-to-br from-amber-50 to-amber-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {keyMetrics.satisfaction.value}
                  </p>
                  <p className="text-xs text-amber-700">
                    {keyMetrics.satisfaction.change}{" "}
                    {keyMetrics.satisfaction.period}
                  </p>
                </div>
                <div className="text-amber-600">
                  <Star className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-amber-900 mt-1">
                Satisfaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ProOnly>
  );
}
