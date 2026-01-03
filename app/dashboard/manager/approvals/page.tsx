import { Metadata } from "next";
import { ManagerApprovalsClient } from "./_components/ManagerApprovalsClient";

export const metadata: Metadata = {
  title: "Ready for Approvals | Manager Dashboard",
  description: "Review and approve pending expense requests from your team.",
};

export default function ManagerApprovalsPage() {
  return <ManagerApprovalsClient />;
}
