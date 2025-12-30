import mongoose from 'mongoose';
import { ExpenseStatus } from '../types/expense';

const AttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
});

const LineItemSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: false, default: '' },
  date: { type: Date, required: true },
  attachments: [AttachmentSchema],
});

const AuditLogEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE_STATUS', 'LINK_ORG', 'ATTACH_FILE'],
    required: true
  },
  actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, required: true },
  changes: [{
    field: { type: String, required: true },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  }],
  metadata: { type: mongoose.Schema.Types.Mixed },
});

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, index: true },
  managerId: { type: mongoose.Schema.Types.ObjectId },
  status: {
    type: String,
    enum: Object.values(ExpenseStatus),
    default: ExpenseStatus.DRAFT,
    required: true
  },
  totalAmount: { type: Number, required: true, default: 0 },
  isPersonal: { type: Boolean, required: true, default: true },
  lineItems: [LineItemSchema],
  auditTrail: [AuditLogEntrySchema],
}, {
  timestamps: true,
});

// Middleware to calculate totalAmount before saving
ExpenseSchema.pre('save', function () {
  if (this.lineItems && this.lineItems.length > 0) {
    this.totalAmount = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
  } else {
    this.totalAmount = 0;
  }
});

export const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

// Re-export organization models
export {
  Organization,
  Member,
  Subscription,
  ReactiveLinkingNotification,
  User,
  Invitation,
  type OrganizationDocument,
  type MemberDocument,
  type SubscriptionDocument,
  type ReactiveLinkingNotificationDocument,
  type UserDocument,
  type InvitationDocument,
} from './models/organization';
