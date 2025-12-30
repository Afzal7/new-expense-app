'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  createdAt: Date;
}

interface Member {
  role: string;
  joinedAt: Date;
}

interface OrganizationContextType {
  orgId: string;
  organization: Organization;
  member: Member;
  isOrgPage: boolean;
  currentSection: string;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

interface OrganizationProviderProps {
  value: OrganizationContextType;
  children: ReactNode;
}

export function OrganizationProvider({ value, children }: OrganizationProviderProps) {
  return React.createElement(OrganizationContext.Provider, { value }, children);
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  const pathname = usePathname();

  // Fallback to pathname-based detection if no context provided
  if (!context) {
    const orgMatch = pathname.match(/^\/dashboard\/organizations\/([^\/]+)/);

    if (!orgMatch) return null;

    const orgId = orgMatch[1];
    const isOrgPage = pathname.startsWith(`/dashboard/organizations/${orgId}`);

    // Better section detection
    const pathParts = pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    // If we're at /dashboard/organizations/[id], it's overview
    // If we're deeper, use the last part as section
    const currentSection = pathParts.length === 3 ? 'overview' : (lastPart || 'overview');

    return {
      orgId,
      isOrgPage,
      currentSection,
    } as OrganizationContextType;
  }

  return context;
}