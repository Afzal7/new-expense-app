import { Metadata } from "next";
import { ManagerReimbursementClient } from "./_components/ManagerReimbursementClient";

export const metadata: Metadata = {
  title: "Ready for Reimbursement | Manager Dashboard",
  description: "Review and process approved expenses for reimbursement.",
};

export default function ManagerReimbursementPage() {
  return <ManagerReimbursementClient />;
}
