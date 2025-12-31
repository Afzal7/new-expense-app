"use client";

import { useEffect } from "react";
import {
  HomeIcon,
  SettingsIcon,
  Users,
  Mail,
  Receipt,
  Lock,
  CheckCircle,
  BarChart3,
  Settings,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import ProfileDropdown from "@/components/shadcn-studio/blocks/dropdown-profile";
import { DashboardBreadcrumb } from "@/components/shared/dashboard-breadcrumb";
import { SubscriptionStatus } from "@/components/shared/subscription-status";
import { useOrganizationContext } from "@/hooks/use-organization-context";
import { useOrganization } from "@/hooks/use-organization";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardErrorBoundary } from "@/components/error-boundary";
import { PageTransition } from "@/components/layout/page-transitions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const orgContext = useOrganizationContext();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { data: userOrg } = useOrganization();

  // Move auth check to useEffect to avoid render path side effects
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session?.user, isPending, router]);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering while redirecting unauthenticated users
  if (!session?.user) {
    return null;
  }

  return (
    <DashboardErrorBoundary>
      <div className="flex min-h-dvh w-full">
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              {/* Sidebar Header */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="flex size-10 items-center justify-center rounded-sm bg-linear-to-br from-sky-300 via-sky-500 to-sky-600">
                    <span className="text-xl text-primary-foreground">
                      {APP_CONFIG.logo.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{APP_CONFIG.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {orgContext ? "Organization" : "Dashboard"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Navigation - Always Available */}
              <SidebarGroup>
                <SidebarGroupLabel>Personal</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard"}
                      >
                        <Link href="/dashboard">
                          <HomeIcon className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard/expenses"}
                      >
                        <Link href="/dashboard/expenses">
                          <Receipt className="h-4 w-4" />
                          <span>Expenses</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard/vault"}
                      >
                        <Link href="/dashboard/vault">
                          <Lock className="h-4 w-4" />
                          <span>Private Vault</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard/review-queue"}
                      >
                        <Link href="/dashboard/review-queue">
                          <CheckCircle className="h-4 w-4" />
                          <span>Review Queue</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/dashboard/settings"}
                      >
                        <Link href="/dashboard/settings">
                          <SettingsIcon className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Organization Navigation - Always Available */}
              <SidebarGroup>
                <SidebarGroupLabel>Organization</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        disabled={!userOrg?.id}
                        isActive={pathname === `/dashboard/organizations/${userOrg?.id}`}
                      >
                        <Link href={userOrg?.id ? `/dashboard/organizations/${userOrg.id}` : "#"}>
                          <BarChart3 className="h-4 w-4" />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        disabled={!userOrg?.id}
                        isActive={pathname === `/dashboard/organizations/${userOrg?.id}/members` && !!userOrg?.id}
                      >
                        <Link href={userOrg?.id ? `/dashboard/organizations/${userOrg.id}/members` : "#"}>
                          <Users className="h-4 w-4" />
                          <span>Members</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        disabled={!userOrg?.id}
                        isActive={pathname === `/dashboard/organizations/${userOrg?.id}/invitations` && !!userOrg?.id}
                      >
                        <Link href={userOrg?.id ? `/dashboard/organizations/${userOrg.id}/invitations` : "#"}>
                          <Mail className="h-4 w-4" />
                          <span>Invitations</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        disabled={!userOrg?.id}
                        isActive={pathname === `/dashboard/organizations/${userOrg?.id}/settings` && !!userOrg?.id}
                      >
                        <Link href={userOrg?.id ? `/dashboard/organizations/${userOrg.id}/settings` : "#"}>
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-1 flex-col">
            <header className="bg-card sticky top-0 z-50 border-b">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="[&_svg]:size-5!" />
                  <Separator
                    orientation="vertical"
                    className="hidden h-4! sm:block"
                  />
                  <DashboardBreadcrumb
                    orgContext={orgContext}
                    userOrg={userOrg ?? null}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <SubscriptionStatus />
                  <ProfileDropdown
                    user={session?.user}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-9.5">
                        <Avatar className="size-9.5 rounded-md">
                          <AvatarImage
                            src={
                              session?.user?.image ||
                              "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                            }
                          />
                          <AvatarFallback>
                            {session?.user?.name
                              ? session.user.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    }
                  />
                </div>
              </div>
            </header>
            <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
              <PageTransition>{children}</PageTransition>
            </main>
            <footer>
              <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-center px-4 py-3 sm:px-6">
                <p className="text-sm text-balance text-center">
                  {`©${new Date().getFullYear()}`} {APP_CONFIG.name}. Built with
                  Next.js and Shadcn UI.
                </p>
              </div>
            </footer>
          </div>
        </SidebarProvider>
      </div>
    </DashboardErrorBoundary>
  );
}
