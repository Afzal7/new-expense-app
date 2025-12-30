import { expect, it, describe, vi, beforeEach } from 'vitest';
import { expenseService } from '../../lib/services/expenseService';
import { organizationService, userService, subscriptionService } from '../../lib/services/organizationService';
import { expenseVisibilityService } from '../../lib/services/expenseVisibilityService';
import {
    Expense,
    Organization,
    Member,
    Subscription,
    ReactiveLinkingNotification,
    User
} from '../../lib/models';
import { ExpenseStatus } from '../../types/expense';
import { connectMongoose } from '../../lib/db';

// Mock all dependencies
vi.mock('../../lib/db', () => ({
    connectMongoose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('mongoose', () => ({
    default: {
        startSession: vi.fn(),
    },
    startSession: vi.fn(),
}));

vi.mock('../../lib/models', () => ({
    Expense: {
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        findById: vi.fn(),
        find: vi.fn(),
        updateMany: vi.fn(),
        countDocuments: vi.fn(),
    },
    Organization: {
        findById: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
    },
    Member: {
        findOne: vi.fn(),
        countDocuments: vi.fn(),
    },
    Subscription: {
        findOne: vi.fn(),
        create: vi.fn(),
    },
    ReactiveLinkingNotification: class {
        constructor(data: any) {
            Object.assign(this, data);
            (this as any).save = vi.fn().mockResolvedValue({
                ...data,
                _id: 'notif-789',
                dismissed: false,
                createdAt: new Date(),
            });
        }
        static findOne = vi.fn();
        static create = vi.fn();
        static updateOne = vi.fn();
    },
    User: {
        findById: vi.fn(),
        findOne: vi.fn(),
    },
}));

describe('Integration Tests - Mongoose Models Refactoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Expense Creation and Management Workflow', () => {
        it('should create expense, manage visibility, and handle organization context', async () => {
            // Setup: Create user and organization
            const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
            const orgId = '507f1f77bcf86cd799439012'; // Valid ObjectId format

            const mockUser = {
                _id: userId,
                name: 'John Doe',
                email: 'john@example.com',
                emailVerified: true,
            };

            const mockOrg = {
                _id: orgId,
                name: 'Test Organization',
                slug: 'test-org',
            };

            const mockMember = {
                _id: '507f1f77bcf86cd799439013',
                organizationId: orgId,
                userId: userId,
                role: 'member',
            };

            // Mock user lookup
            (User.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockUser),
            });

            // Mock organization lookup
            (Organization.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockOrg),
            });

            // Mock member lookup
            (Member.findOne as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockMember),
            });

            const now = new Date();

            // Step 1: Create personal expense
            const expenseData = {
                userId,
                isPersonal: true,
                status: ExpenseStatus.DRAFT,
                lineItems: [
                    { amount: 50, description: 'Coffee', date: now, attachments: [] }
                ],
            };
            const mockExpense = {
                ...expenseData,
                _id: 'expense-123',
                totalAmount: 50,
                auditTrail: [{
                    timestamp: now.toISOString(),
                    action: 'CREATE',
                    actorId: userId,
                    role: 'Employee',
                    changes: [{
                        field: 'status',
                        oldValue: null,
                        newValue: ExpenseStatus.DRAFT,
                    }],
                }],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
            };

            // Mock session for expense creation
            const mockSession = {
                startTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                abortTransaction: vi.fn(),
                endSession: vi.fn(),
            };

            // Mock mongoose startSession to return our mock session
            const mongoose = await import('mongoose');
            (mongoose.default.startSession as any).mockResolvedValue(mockSession);

            (Expense.create as any).mockResolvedValue([{
                ...mockExpense,
                toObject: vi.fn().mockReturnValue(mockExpense),
            }]);

            // Test expense creation
            const createdExpense = await expenseService.createExpense(expenseData, userId, 'Employee');

            expect(createdExpense).toBeDefined();
            expect(createdExpense._id).toBe('expense-123');
            expect(createdExpense.totalAmount).toBe(50);
            expect(createdExpense.auditTrail).toHaveLength(1);

            // Step 2: Test visibility - user should see their own expense
            (Expense.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockExpense),
            });

            const visibleExpense = await expenseVisibilityService.getVisibleExpense('expense-123', userId);

            expect(visibleExpense).toEqual({
                ...mockExpense,
                lineItems: [
                    { amount: 50, description: 'Coffee', date: expect.any(String), attachments: [] }
                ],
            });

            // Step 3: Test visibility with organization context
            (Expense.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue([mockExpense]),
                }),
            });

            const visibleExpenses = await expenseVisibilityService.getVisibleExpenses(userId, orgId, 'Employee');

            expect(visibleExpenses).toHaveLength(1);
            expect(visibleExpenses[0]._id).toBe('expense-123');
        });
    });

    describe('Organization Management Workflow', () => {
        it('should manage organization, members, and subscriptions', async () => {
            const userId = 'user-123';
            const orgId = 'org-456';
            const subscriptionId = 'sub-789';

            // Setup mock data
            const mockUser = {
                _id: userId,
                name: 'John Doe',
                email: 'john@example.com',
                emailVerified: true,
            };

            const mockOrg = {
                _id: orgId,
                name: 'Test Organization',
                slug: 'test-org',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockMember = {
                _id: 'member-123',
                organizationId: orgId,
                userId: userId,
                role: 'owner',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockSubscription = {
                _id: subscriptionId,
                userId: userId,
                plan: 'pro',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Mock organization lookup
            (Organization.findById as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockOrg),
            });

            // Mock member lookup
            (Member.findOne as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockMember),
            });

            // Mock member count
            (Member.countDocuments as any).mockResolvedValue(1);

            // Mock subscription lookup
            (Subscription.findOne as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockSubscription),
            });

            // Test organization lookup
            const org = await organizationService.findOrganizationById(orgId);
            expect(org).toEqual(mockOrg);

            // Test member lookup
            const member = await organizationService.findMember(orgId, userId);
            expect(member).toEqual(mockMember);

            // Test member count
            const memberCount = await organizationService.countMembersInOrganization(orgId);
            expect(memberCount).toBe(1);

            // Test subscription lookup
            const subscription = await organizationService.findActiveSubscription(userId);
            expect(subscription).toEqual(mockSubscription);

            // Test organization owner lookup
            const owner = await organizationService.findOrganizationOwner(orgId);
            expect(owner).toEqual(mockMember);
        });
    });

    describe('Reactive Linking Notification Workflow', () => {
        it('should create and manage reactive linking notifications', async () => {
            const userId = 'user-123';
            const orgId = 'org-456';
            const notificationId = 'notif-789';

            // Setup mock notification
            const mockNotification = {
                _id: notificationId,
                userId: userId,
                organizationId: orgId,
                personalDraftCount: 3,
                dismissed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Mock notification lookup
            (ReactiveLinkingNotification.findOne as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockNotification),
            });

            // Mock notification creation
            const notificationData = {
                userId: userId,
                organizationId: orgId,
                personalDraftCount: 3,
            };

            // Constructor is already mocked above

            // Test notification creation
            const createdNotification = await organizationService.createReactiveLinkingNotification(notificationData);

            expect(createdNotification).toEqual({
                ...notificationData,
                _id: 'notif-789',
                dismissed: false,
                createdAt: expect.any(Date), // Constructor returns Date object
            });

            // Test notification lookup
            const foundNotification = await organizationService.findReactiveLinkingNotification(userId, orgId);
            expect(foundNotification).toEqual(mockNotification);

            // Test notification dismissal
            (ReactiveLinkingNotification.updateOne as any).mockResolvedValue({ modifiedCount: 1 });
            const dismissed = await organizationService.dismissReactiveLinkingNotification(notificationId, userId);
            expect(dismissed).toBe(true);
        });
    });
});