import {
  Organization,
  Member,
  Subscription,
  ReactiveLinkingNotification,
  User,
   type OrganizationDocument,
   type MemberDocument,
   type SubscriptionDocument,
   type ReactiveLinkingNotificationDocument,
   type UserDocument,
} from '../models';
import { connectMongoose } from '../db';

/**
 * Service layer for Organization management.
 * Provides abstraction over Mongoose models with proper typing and .lean() serialization.
 */
export const organizationService = {
  /**
   * Find organization by ID
   */
  async findOrganizationById(orgId: string): Promise<OrganizationDocument | null> {
    await connectMongoose();
    return Organization.findById(orgId).lean<OrganizationDocument>();
  },

  /**
   * Find organization by slug
   */
  async findOrganizationBySlug(slug: string): Promise<OrganizationDocument | null> {
    await connectMongoose();
    return Organization.findOne({ slug }).lean<OrganizationDocument>();
  },

  /**
   * Find member by organization and user IDs
   */
  async findMember(orgId: string, userId: string): Promise<MemberDocument | null> {
    await connectMongoose();
    return Member.findOne({
      organizationId: orgId,
      userId: userId,
    }).lean<MemberDocument>();
  },

  /**
   * Count members in organization
   */
  async countMembersInOrganization(orgId: string): Promise<number> {
    await connectMongoose();
    return Member.countDocuments({ organizationId: orgId });
  },

  /**
   * Find active subscription for user
   */
  async findActiveSubscription(userId: string): Promise<SubscriptionDocument | null> {
    await connectMongoose();
    return Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    }).lean<SubscriptionDocument>();
  },

  /**
   * Find owner of organization
   */
  async findOrganizationOwner(orgId: string): Promise<MemberDocument | null> {
    await connectMongoose();
    return Member.findOne({
      organizationId: orgId,
      role: 'owner'
    }).lean<MemberDocument>();
  },

  /**
   * Get all members of organization with user details
   */
  async getOrganizationMembers(orgId: string): Promise<Array<MemberDocument & { user: { name: string; email: string } }>> {
    await connectMongoose();
    return Member.find({ organizationId: orgId })
      .populate('userId', 'name email')
      .lean();
  },

  /**
   * Create reactive linking notification
   */
  async createReactiveLinkingNotification(data: {
    userId: string;
    organizationId: string;
    personalDraftCount: number;
  }): Promise<ReactiveLinkingNotificationDocument> {
    await connectMongoose();
    const notification = new ReactiveLinkingNotification(data);
    return notification.save();
  },

  /**
   * Find reactive linking notification
   */
  async findReactiveLinkingNotification(userId: string, organizationId: string): Promise<ReactiveLinkingNotificationDocument | null> {
    await connectMongoose();
    return ReactiveLinkingNotification.findOne({
      userId,
      organizationId,
      dismissed: false,
    }).lean<ReactiveLinkingNotificationDocument>();
  },

  /**
   * Dismiss reactive linking notification
   */
  async dismissReactiveLinkingNotification(notificationId: string, userId: string): Promise<boolean> {
    await connectMongoose();
    const result = await ReactiveLinkingNotification.updateOne(
      { _id: notificationId, userId },
      { $set: { dismissed: true } }
    );
    return result.modifiedCount > 0;
  },

  /**
   * Mark reactive linking notification as linked
   */
  async markNotificationAsLinked(notificationId: string): Promise<boolean> {
    await connectMongoose();
    const result = await ReactiveLinkingNotification.updateOne(
      { _id: notificationId },
      { $set: { dismissed: true, linkedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },
};

/**
 * Service layer for User management.
 * Provides abstraction over Mongoose models with proper typing and .lean() serialization.
 */
export const userService = {
  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<UserDocument | null> {
    await connectMongoose();
    return User.findById(userId).lean<UserDocument>();
  },

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    await connectMongoose();
    return User.findOne({ email }).lean<UserDocument>();
  },
};

/**
 * Service layer for Subscription management.
 * Provides abstraction over Mongoose models with proper typing and .lean() serialization.
 */
export const subscriptionService = {
  /**
   * Find subscription by user ID
   */
  async findSubscriptionByUserId(userId: string): Promise<SubscriptionDocument | null> {
    await connectMongoose();
    return Subscription.findOne({ userId }).lean<SubscriptionDocument>();
  },

  /**
   * Find active subscription by user ID
   */
  async findActiveSubscriptionByUserId(userId: string): Promise<SubscriptionDocument | null> {
    await connectMongoose();
    return Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    }).lean<SubscriptionDocument>();
  },
};