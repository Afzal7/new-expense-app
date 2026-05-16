export function getMobilePageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/dashboard/settings") return "Settings";
  if (pathname === "/dashboard/expenses/create") return "New Expense";
  if (pathname.startsWith("/dashboard/expenses/")) return "Expense Details";
  if (pathname === "/dashboard/expenses") return "Expenses";
  if (pathname === "/dashboard/manager/approvals") return "Approvals";
  if (pathname === "/dashboard/finance/reimbursements") return "Reimbursements";
  if (pathname.includes("/organizations/")) {
    if (pathname.endsWith("/members")) return "Members";
    if (pathname.endsWith("/invitations")) return "Invitations";
    if (pathname.endsWith("/settings")) return "Settings";
    return "Organization";
  }
  return "Dashboard";
}
