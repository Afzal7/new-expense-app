import { Metadata } from "next";
import { ReimbursementsClient } from "./_components/ReimbursementsClient";

export const metadata: Metadata = {
  title: "Ready for Reimbursement | Finance Dashboard",
  description: "Review and process approved expenses ready for reimbursement.",
};

export default function ReimbursementsPage() {
  return <ReimbursementsClient />;
}
