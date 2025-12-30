/**
 * Better Auth configuration with conditional providers
 * Only enables features when required environment variables are present
 */

import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { stripe as stripePlugin } from "@better-auth/stripe";
import { organization } from "better-auth/plugins/organization";
import { nextCookies } from "better-auth/next-js";
// Removed unused Member import
import { db } from "./db";
import { organizationService, subscriptionService } from "./services/organizationService";
import { stripe } from "./stripe";
import { env } from "./env";
import { sendEmail, generateEmailHTML, EMAIL_TEMPLATES } from "./email";
import { APP_CONFIG } from "./config";

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

  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const encodedToken = encodeURIComponent(token);
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodedToken}`;

      if (env.isDevelopment) {
        console.log("[Auth] Sending password reset to:", user.email);
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
          console.log("[Auth] Sending delete account verification to:", user.email);
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
        beforeCreateOrganization: async ({ organization: _organization, user: _user }) => {
          // Basic validation can be added here if needed
        },

        afterCreateOrganization: async ({ organization: _organization, member: _member, user: _user }) => {
          // Post-creation logic can be added here if needed
        },
        // Role update validation
        beforeUpdateMemberRole: async ({ member: _member, newRole: _newRole, user: _user, organization: _organization }) => {
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
        beforeAddMember: async ({ member: _member, user: _user, organization }) => {
           // Check org owner's subscription status and set appropriate limits
           let maxMembers: number = APP_CONFIG.plans.free.limits.teamMembers;

           // Find the organization owner from the database
           const ownerMember = await organizationService.findOrganizationOwner(organization.id);

           if (!ownerMember) {
             // Fallback logic if no owner found (rare edge case)
             const memberCount = await organizationService.countMembersInOrganization(organization.id);
             if (memberCount >= maxMembers) {
               throw new APIError('BAD_REQUEST', {
                 message: `Limit reached. Upgrade to Pro to add more members.`
               });
             }
             return;
           }

           // Check if owner has an active subscription
           try {
             const sub = await subscriptionService.findActiveSubscriptionByUserId(ownerMember.userId.toString());
             if (sub) {
               maxMembers = APP_CONFIG.plans.pro.limits.teamMembers;
             }
           } catch (e) {
             console.error("Failed to check subscription status:", e);
             // Fallback to free limit on error for safety
           }

           const currentMemberCount = await organizationService.countMembersInOrganization(organization.id);

           if (currentMemberCount >= maxMembers) {
             const isPro = maxMembers > APP_CONFIG.plans.free.limits.teamMembers;
             const memberText = maxMembers === 1 ? 'member' : 'members';
             const limitText = maxMembers === Infinity ? 'unlimited' : maxMembers.toString();
             throw new APIError('BAD_REQUEST', {
               message: `This organization has reached the maximum of ${limitText} ${memberText} on the ${isPro ? 'Pro' : 'Free'} plan. ${!isPro ? 'Upgrade to Pro to add more members.' : 'Contact support for higher limits.'}`
             });
           }
        },

        // Prevent self-removal
        beforeRemoveMember: async ({ member, user: _user }) => {
          if (member.userId === _user.id) {
            throw new APIError('BAD_REQUEST', {
              message: 'You cannot remove yourself from the organization. Please use the "Leave Organization" option instead.'
            });
          }
        },

        // Invitation customization
        beforeCreateInvitation: async ({ invitation }) => {
          // Set custom expiration (7 days)
          const customExpiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

          return {
            data: {
              ...invitation,
              expiresAt: customExpiration,
            },
          };
        },

        // Reactive linking: Check for personal drafts when user joins organization
        afterAddMember: async ({ member, user: _user, organization }) => {
          try {
            // Import Expense model here to avoid circular dependencies
            const { Expense } = await import('./models');

            // Check if the user has personal drafts (organizationId: null)
            const personalDrafts = await Expense.find({
              userId: member.userId,
              organizationId: null,
              status: 'DRAFT'
            }).lean();
            const serializedDrafts = JSON.parse(JSON.stringify(personalDrafts));

            if (serializedDrafts.length > 0) {
              // Create a reactive linking notification in the database
              await organizationService.createReactiveLinkingNotification({
                userId: member.userId.toString(),
                organizationId: organization.id,
                personalDraftCount: personalDrafts.length,
              });

              console.log(`Created reactive linking notification for user ${member.userId} joining org ${organization.id} with ${serializedDrafts.length} personal drafts`);
            }
          } catch (error) {
            console.error('Error in afterAddMember reactive linking:', error);
            // Don't throw - this shouldn't block the member addition
          }
        },

      },

      async sendInvitationEmail(data) {
        try {
          const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/invitations/${data.id}`;
          // console.log("Accept URL:", acceptUrl);
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

          // console.log("Invitation email sent to:", data.email);
        } catch (error) {
          // console.error("Failed to send invitation email:", error);
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
