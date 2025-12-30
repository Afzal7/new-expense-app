import mongoose from 'mongoose';

// Organization Schema (managed by Better Auth organization plugin)
const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  logo: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Member Schema (managed by Better Auth organization plugin)
const MemberSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Subscription Schema (managed by Better Auth Stripe plugin)
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  plan: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'],
    required: true
  },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Reactive Linking Notification Schema (custom feature)
const ReactiveLinkingNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  personalDraftCount: { type: Number, required: true },
  dismissed: { type: Boolean, default: false },
  linkedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// User Schema (managed by Better Auth, but we can create a model for queries)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  emailVerified: { type: Boolean, default: false },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Invitation Schema (managed by Better Auth organization plugin)
const InvitationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'canceled'],
    default: 'pending'
  },
  expiresAt: { type: Date, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true, unique: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Export models with proper typing
export const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
export const Member = mongoose.models.Member || mongoose.model('Member', MemberSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export const ReactiveLinkingNotification = mongoose.models.ReactiveLinkingNotification || mongoose.model('ReactiveLinkingNotification', ReactiveLinkingNotificationSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema);

// Type exports for TypeScript
export type OrganizationDocument = mongoose.Document & {
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type MemberDocument = mongoose.Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionDocument = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  plan: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type ReactiveLinkingNotificationDocument = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  personalDraftCount: number;
  dismissed: boolean;
  linkedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = mongoose.Document & {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InvitationDocument = mongoose.Document & {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired' | 'canceled';
  expiresAt: Date;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};