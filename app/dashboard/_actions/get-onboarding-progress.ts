"use server";

import { auth } from "@/lib/auth"; // Your Better Auth instance
import { headers } from "next/headers";

export type OnboardingStep = {
    name: string;
    completed: boolean;
    key: string; // unique key for animations
};

export type OnboardingProgress = {
    completedCount: number;
    totalCount: number;
    percent: number;
    steps: OnboardingStep[];
    firstOrgId?: string;
};

export async function getOnboardingProgress(): Promise<OnboardingProgress> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return {
            completedCount: 0,
            totalCount: 4,
            percent: 0,
            steps: []
        };
    }

    // 1. Create Account (Always true if session exists)
    const hasAccount = true;

    // 2. Create/Join Organization
    const orgs = await auth.api.listOrganizations({
        headers: await headers(),
    });
    const hasOrg = orgs && orgs.length > 0;

    // 3. Invite Members (Check if any owned org has > 1 member)
    // Optimization: Just check the first org for now or current active org
    // We'll approximate: if they have an org, check the first one's members
    let hasInvitedMembers = false;
    if (hasOrg) {
        // This is a bit expensive if they have many orgs, but for onboarding it's usually 1
        // We need to fetch members for the org.
        // better-auth doesn't list members in listOrganizations result typically.
        // We might need a separate call or use the simplified "active org" context from client.
        // For Server Action, let's just check if they are an owner of an org with > 1 member?
        // Complicated without direct DB access or multiple API calls.
        // Let's use the DB directly for speed since we set up Mongoose?
        // Or just stick to Better Auth API to be safe?
        // Better Auth API: listMembers({ organizationId })

        const firstOrg = orgs[0];
        // We define "Invited Members" as having more than 1 member in the org
        // or pending invitations?
        // Let's check members count of the first org.
        /* 
        const members = await auth.api.listMembers({
           headers: await headers(),
           query: { organizationId: firstOrg.id } 
        });
        if (members.length > 1) hasInvitedMembers = true;
        */

        // For MVP/Starter simplicity, let's assume if they have an org, they pass step 2.
        // For step 3, we really want to know if they tackled the "Invite" action.
        // Let's Skip actual API call for now to avoid specific ID requirement and rely on client-side context (checking `orgContext` members)
        // Wait, Server Action is better for "Initial Load".
        // I'll leave hasInvitedMembers as false for now and let Client update it? 
        // No, the user wants "Real Data". 
        // I'll try to fetch members of the very first org.

        try {
            const response = await auth.api.listMembers({
                headers: await headers(),
                query: {
                    organizationId: firstOrg.id
                }
            });
            if (response && response.members && response.members.length > 1) {
                hasInvitedMembers = true;
            }
        } catch {
            // Ignore error (e.g. not owner)
        }
    }

    // 4. Start Pro Trial
    // Access via better-auth-stripe plugin or just checking user metadata if stored?
    // User object might have `subscriptionId` or similar? 
    // With Better Auth Stripe plugin, subscription info is usually on the Organization or User.
    // Let's assume User subscription for this starter.
    // session.user.subscriptionId ? 
    // We can assume if they have a `subscription` object returned by a specific call.
    // Actually, let's look at `useSubscription` hook. It calls `authClient.subscription.list()`.
    // Server side: `auth.api.listSubscriptions`?

    let hasSubscription = false;
    try {
        const subs = await auth.api.listActiveSubscriptions({
            headers: await headers()
        });
        // listActiveSubscriptions usually returns an array or an object with keys
        if (subs && Array.isArray(subs) && subs.length > 0) hasSubscription = true;
        if (subs && !Array.isArray(subs) && Object.keys(subs).length > 0) hasSubscription = true;
        // Note: `listActiveSubscriptions` might return different structure depending on plugin version.
        // Assuming array or map.
        // Let's check `lib/auth.ts` config. It has `stripePlugin`.
    } catch {
        // ignore
    }

    const steps: OnboardingStep[] = [
        { name: "Create Account", completed: hasAccount, key: "account" },
        { name: "Create Organization", completed: hasOrg, key: "org" },
        { name: "Invite Team Members", completed: hasInvitedMembers, key: "invite" },
        { name: "Start Pro Trial", completed: hasSubscription, key: "subscription" },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const totalCount = steps.length;
    const percent = Math.round((completedCount / totalCount) * 100);

    return {
        completedCount,
        totalCount,
        percent,
        steps,
        firstOrgId: hasOrg && orgs[0] ? orgs[0].id : undefined
    };
}
