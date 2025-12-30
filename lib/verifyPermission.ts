import { organizationService } from './services/organizationService';

/**
 * RBAC (Role-Based Access Control) helper for verifying user permissions
 * @param userId - The user's ID
 * @param requiredRole - The required role ('admin' | 'owner' | 'member' | 'employee')
 * @param organizationId - Optional organization ID for organization-specific checks
 * @returns Promise<boolean> - True if user has the required permission
 */
export async function verifyPermission(
  userId: string,
  requiredRole: string,
  organizationId?: string
): Promise<boolean> {
  // Admin role has full access across all organizations
  if (requiredRole === 'admin') {
    if (!organizationId) return false;

    const member = await organizationService.findMember(organizationId, userId);
    return member?.role === 'admin' || member?.role === 'owner';
  }

  // Owner role check
  if (requiredRole === 'owner') {
    if (!organizationId) return false;

    const member = await organizationService.findMember(organizationId, userId);
    return member?.role === 'owner';
  }

  // Member role check (includes admin, owner, member)
  if (requiredRole === 'member') {
    if (!organizationId) return false;

    const member = await organizationService.findMember(organizationId, userId);
    return !!member; // Any member role
  }

  // Employee role check (basic level for personal expenses)
  if (requiredRole === 'employee') {
    // For personal expenses (no organization), all authenticated users are employees
    return true;
  }

  return false;
}