"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { useOrganization } from "@/hooks/use-organization";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { toast } from "@/lib/toast";

interface ExportFilters {
  startDate: string;
  endDate: string;
  userId: string;
  employeeId: string; // Alias for userId for backward compatibility
  dateFrom: string; // Alias for startDate
  dateTo: string; // Alias for endDate
  status: string;
}

interface ExportControlsProps {
  onExport?: (filters: ExportFilters, format: "csv" | "pdf") => Promise<void>;
}

export function ExportControls({ onExport }: ExportControlsProps) {
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: "",
    endDate: "",
    userId: "",
    employeeId: "", // Alias for userId
    dateFrom: "", // Alias for startDate
    dateTo: "", // Alias for endDate
    status: "Approved", // Default to approved for reimbursement exports
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data: organization } = useOrganization();
  const { data: orgData } = useOrganizationMembers(organization?.id || "");

  const handleFilterChange = (key: keyof ExportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setIsExporting(true);

      if (onExport) {
        await onExport(filters, format);
      } else {
        // Default export implementation
        const params = new URLSearchParams();
        params.set("format", format);

        if (filters.startDate) params.set("startDate", filters.startDate);
        if (filters.endDate) params.set("endDate", filters.endDate);
        if (filters.userId) params.set("userId", filters.userId);
        if (filters.status) params.set("status", filters.status);

        const response = await fetch(`/api/exports?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to export ${format.toUpperCase()}`);
        }

        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`${format.toUpperCase()} export completed successfully`);
      }
    } catch (error) {
      console.error(`Export ${format} error:`, error);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Expense Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="start-date">Date From</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="end-date">Date To</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Employee Filter */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select
              value={filters.userId}
              onValueChange={(value) => handleFilterChange("userId", value)}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All employees</SelectItem>
                {orgData?.members?.map((member) => (
                  <SelectItem key={member.id} value={member.user.id}>
                    {member.user.name} ({member.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Reimbursed">Reimbursed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Pre-Approval Pending">
                  Pre-Approval Pending
                </SelectItem>
                <SelectItem value="Approval Pending">
                  Approval Pending
                </SelectItem>
                <SelectItem value="Pre-Approved">Pre-Approved</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
