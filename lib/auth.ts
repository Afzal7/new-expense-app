/**
 * Better Auth configuration with conditional providers
 * Only enables features when required environment variables are present
 */

import { stripe as stripePlugin } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";

import type { User } from "better-auth/types";
import { ObjectId } from "mongodb";
import { APP_CONFIG } from "./config";
import { db } from "./db";
import { EMAIL_TEMPLATES, generateEmailHTML, sendEmail } from "./email";
import { env } from "./env";
import { stripe } from "./stripe";

/**
 * Get the initial organization for a user (first organization they belong to)
 * Used to automatically set active organization on login
 */
async function getOrgMembership(userId: string) {
  try {
    // Find the first organization where the user is a member
    const member = await db.collection("member").findOne(
      { userId: new ObjectId(userId) },
      { sort: { createdAt: 1 } } // Get the earliest membership (first org they joined)
    );

    if (!member) {
      return null; // User has no organizations
    }

    return member;
  } catch (error) {
    console.error("Error getting initial organization:", error);
    return null;
  }
}

// Build social providers conditionally
const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}

if (env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET) {
  socialProviders.microsoft = {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: mongodbAdapter(db),

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Automatically set the first organization as active when session is created
          const membership = await getOrgMembership(session.userId);
          console.log("membership", membership);

          if (!membership) {
            // User has no organization membership yet
            console.log("No membership found for user", session.userId);
            return {
              data: session, // Return session unchanged
            };
          }

          console.log("Setting active org:", membership.organizationId);
          return {
            data: {
              activeOrganizationId: membership.organizationId,
            },
          };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendEmailVerification: async ({
      user,
      token,
    }: {
      user: User;
      token: string;
    }) => {
      const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

      if (env.isDevelopment) {
        // Email verification being sent in development
      }

      const html = generateEmailHTML.verification({
        verificationUrl,
        userName: user.name,
      });

      await sendEmail({
        to: user.email,
        subject: EMAIL_TEMPLATES.verification.subject,
        html,
        from: EMAIL_TEMPLATES.verification.from,
      });
    },
    sendResetPassword: async ({ user, token }) => {
      const encodedToken = encodeURIComponent(token);
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodedToken}`;

      if (env.isDevelopment) {
        // Password reset email being sent in development
      }

      const html = generateEmailHTML.passwordReset({
        resetUrl,
        userName: user.name,
      });

      await sendEmail({
        to: user.email,
        subject: EMAIL_TEMPLATES.passwordReset.subject,
        html,
        from: EMAIL_TEMPLATES.passwordReset.from,
      });
    },
  },

  ...(Object.keys(socialProviders).length > 0 && {
    socialProviders,
  }),

  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        if (env.isDevelopment) {
          // Delete account verification email being sent in development
        }

        // URL is already properly formatted by Better Auth
        const html = generateEmailHTML.accountDeletion({
          deleteUrl: url,
          userName: user.name,
        });

        await sendEmail({
          to: user.email,
          subject: EMAIL_TEMPLATES.accountDeletion.subject,
          html,
          from: EMAIL_TEMPLATES.accountDeletion.from,
        });
      },
    },
  },

  plugins: [
    // Organization plugin (optional feature)
    organization({
      allowUserToCreateOrganization: true,
      cancelPendingInvitationsOnReInvite: true,
      // DO NOT auto-create - organizations are optional
      createOnSignUp: { enabled: false },

      // Custom hooks for business logic not covered by built-in permissions
      organizationHooks: {
        // Organization lifecycle hooks
        beforeCreateOrganization: async ({
          organization: _organization,
          user: _user,
        }) => {
          // Basic validation can be added here if needed
        },

        afterCreateOrganization: async ({
          organization: _organization,
          member: _member,
          user: _user,
        }) => {
          // Post-creation logic can be added here if needed
        },
        // Role update validation
        beforeUpdateMemberRole: async ({
          member: _member,
          newRole: _newRole,
          user: _user,
          organization: _organization,
        }) => {
          // if (member.role === 'owner' && newRole !== 'owner') {
          //   // Check if this would leave no owners
          //   const ownerCount = await db.collection("member").countDocuments({
          //     organizationId: organization.id,
          //     role: "owner"
          //   });
          //   if (ownerCount <= 1) {
          //     throw new APIError('BAD_REQUEST', {
          //       message: 'Cannot remove the last owner. Please promote another member to owner before removing this owner.'
          //     });
          //   }
          // }
          // Prevent users from modifying their own role (unless they're an owner)
          // if (member.userId === user.id && member.role === 'owner' && newRole !== 'owner') {
          //   throw new APIError('BAD_REQUEST', {
          //     message: 'As an owner, you cannot demote yourself. Please transfer ownership to another member first.'
          //   });
          // }
        },

        // Member limits based on plan configuration
        beforeAddMember: async ({
          member: _member,
          user: _user,
          organization,
        }) => {
          // Use limits from APP_CONFIG - free plan limit by default
          // TODO: In production, check the org owner's subscription status
          // and use APP_CONFIG.plans.pro.limits.teamMembers for pro users
          const maxMembers = APP_CONFIG.plans.free.limits.teamMembers;
          // Find the organization owner from the database
          const ownerMember = await db.collection("member").findOne({
            organizationId: organization.id,
            role: "owner",
          });

          if (!ownerMember) {
            // Fallback logic if no owner found (rare edge case)
            const memberCount = await db.collection("member").countDocuments({
              organizationId: organization.id,
            });
            if (memberCount >= maxMembers) {
              throw new APIError("BAD_REQUEST", {
                message: `Limit reached. Upgrade to Pro to add more members.`,
              });
            }
            return;
          }

          const owner = ownerMember;

          // Check if owner has an active subscription
          // We access the database directly to check basic subscription status
          // The 'subscription' collection is created by Better Auth Stripe plugin
          let isPro = false;
          try {
            const sub = await db.collection("subscription").findOne({
              userId: owner.userId,
              status: { $in: ["active", "trialing"] },
            });
            if (sub) {
              isPro = true;
            }
          } catch (e) {
            console.error("Failed to check subscription status:", e);
            // Fallback to free limit on error for safety
          }

          const limit = isPro
            ? APP_CONFIG.plans.pro.limits.teamMembers
            : APP_CONFIG.plans.free.limits.teamMembers;

          const currentMemberCount = await db
            .collection("member")
            .countDocuments({
              organizationId: organization.id,
            });

          if (currentMemberCount >= limit) {
            throw new APIError("BAD_REQUEST", {
              message: `This organization has reached the maximum of ${limit} member${limit !== 1 ? "s" : ""} on the ${isPro ? "Pro" : "Free"} plan. ${!isPro ? "Upgrade to Pro to add more members." : "Contact support for higher limits."}`,
            });
          }
        },

        // Prevent self-removal
        beforeRemoveMember: async ({ member, user: _user }) => {
          if (member.userId === _user.id) {
            throw new APIError("BAD_REQUEST", {
              message:
                'You cannot remove yourself from the organization. Please use the "Leave Organization" option instead.',
            });
          }
        },

        // Invitation customization
        beforeCreateInvitation: async ({ invitation }) => {
          // Set custom expiration (7 days)
          const customExpiration = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7
          );

          return {
            data: {
              ...invitation,
              expiresAt: customExpiration,
            },
          };
        },
      },

      async sendInvitationEmail(data) {
        try {
          const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/invitations/${data.id}`;
          const html = generateEmailHTML.invitation({
            organizationName: data.organization.name,
            inviterName: data.inviter.user.name || data.inviter.user.email,
            acceptUrl,
          });

          await sendEmail({
            to: data.email,
            subject: EMAIL_TEMPLATES.invitation.subject,
            html,
            from: EMAIL_TEMPLATES.invitation.from,
          });
        } catch (error) {
          throw error;
        }
      },
    }),

    // Stripe plugin
    stripePlugin({
      stripeClient: stripe,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: false,

      subscription: {
        enabled: true,
        requireEmailVerification: false,

        plans: [
          {
            name: "free",
            // No priceId for free plan
          },
          {
            name: "pro",
            priceId: env.STRIPE_PRO_MONTHLY_PRICE_ID,
            annualDiscountPriceId: env.STRIPE_PRO_ANNUAL_PRICE_ID || undefined,
            freeTrial: { days: 14 },
          },
        ],
      },
    }),

    // Next.js cookies plugin - automatically sets cookies in server actions
    // Must be the last plugin in the array
    nextCookies(),
  ],

  secret: env.BETTER_AUTH_SECRET,
});
