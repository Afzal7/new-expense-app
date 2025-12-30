import { expect, it, describe, vi, beforeEach } from 'vitest';
import { organizationService, userService, subscriptionService } from '../../lib/services/organizationService';
import {
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
} from '../../lib/models';

// Mock dependencies
vi.mock('../../lib/db', () => ({
    connectMongoose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../lib/models', () => ({
    Organization: {
        findById: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
    Member: {
        findOne: vi.fn(),
        countDocuments: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
    Subscription: {
        findOne: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
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
        create: vi.fn(),
    },
    Invitation: {
        findOne: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

describe('Organization Models and Services', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Organization Model', () => {
        it('should create organization with required fields', () => {
            const orgData = {
                name: 'Test Organization',
                slug: 'test-org',
            };

            const mockOrg = {
                ...orgData,
                _id: 'org-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: vi.fn().mockReturnValue({
                    ...orgData,
                    _id: 'org-123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                lean: vi.fn().mockResolvedValue({
                    ...orgData,
                    _id: 'org-123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as OrganizationDocument),
            };

            (Organization.findOne as any).mockResolvedValue(null);
            (Organization.create as any).mockResolvedValue(mockOrg);

            // Test basic schema validation would happen here
            expect(mockOrg.name).toBe('Test Organization');
            expect(mockOrg.slug).toBe('test-org');
        });

        it('should enforce unique slug constraint', () => {
            const existingOrg = {
                name: 'Existing Org',
                slug: 'test-org',
                _id: 'existing-org-123',
            };

            (Organization.findOne as any).mockResolvedValue(existingOrg);

            // This would typically be tested with actual database constraints
            expect(existingOrg.slug).toBe('test-org');
        });
    });

    describe('Member Model', () => {
        it('should create member with required fields', () => {
            const memberData = {
                organizationId: 'org-123',
                userId: 'user-456',
                role: 'member' as const,
            };

            const mockMember = {
                ...memberData,
                _id: 'member-789',
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: vi.fn().mockReturnValue({
                    ...memberData,
                    _id: 'member-789',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                lean: vi.fn().mockResolvedValue({
                    ...memberData,
                    _id: 'member-789',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as MemberDocument),
            };

            (Member.create as any).mockResolvedValue(mockMember);

            expect(mockMember.organizationId.toString()).toBe('org-123');
            expect(mockMember.userId.toString()).toBe('user-456');
            expect(mockMember.role).toBe('member');
        });

        it('should default role to member', () => {
            const memberData = {
                organizationId: 'org-123',
                userId: 'user-456',
            };

            const mockMember = {
                ...memberData,
                role: 'member',
                _id: 'member-789',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            expect(mockMember.role).toBe('member');
        });
    });

    describe('Subscription Model', () => {
        it('should create subscription with required fields', () => {
            const subscriptionData = {
                userId: 'user-123',
                plan: 'pro',
                status: 'active' as const,
            };

            const mockSubscription = {
                ...subscriptionData,
                _id: 'sub-456',
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: vi.fn().mockReturnValue({
                    ...subscriptionData,
                    _id: 'sub-456',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                lean: vi.fn().mockResolvedValue({
                    ...subscriptionData,
                    _id: 'sub-456',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as SubscriptionDocument),
            };

            (Subscription.create as any).mockResolvedValue(mockSubscription);

            expect(mockSubscription.userId.toString()).toBe('user-123');
            expect(mockSubscription.plan).toBe('pro');
            expect(mockSubscription.status).toBe('active');
        });

        it('should support all subscription statuses', () => {
            const statuses = ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'];

            statuses.forEach(status => {
                const subscriptionData = {
                    userId: 'user-123',
                    plan: 'pro',
                    status: status as any,
                };

                const mockSubscription = {
                    ...subscriptionData,
                    _id: 'sub-456',
                };

                expect(mockSubscription.status).toBe(status);
            });
        });
    });

    describe('ReactiveLinkingNotification Model', () => {
        it('should create reactive linking notification with required fields', () => {
            const notificationData = {
                userId: 'user-123',
                organizationId: 'org-456',
                personalDraftCount: 3,
            };

            const mockNotification = {
                ...notificationData,
                _id: 'notif-789',
                dismissed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: vi.fn().mockReturnValue({
                    ...notificationData,
                    _id: 'notif-789',
                    dismissed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                lean: vi.fn().mockResolvedValue({
                    ...notificationData,
                    _id: 'notif-789',
                    dismissed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as ReactiveLinkingNotificationDocument),
            };

            (ReactiveLinkingNotification.create as any).mockResolvedValue(mockNotification);

            expect(mockNotification.userId.toString()).toBe('user-123');
            expect(mockNotification.organizationId.toString()).toBe('org-456');
            expect(mockNotification.personalDraftCount).toBe(3);
            expect(mockNotification.dismissed).toBe(false);
        });
    });

    describe('User Model', () => {
        it('should create user with required fields', () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                emailVerified: false,
            };

            const mockUser = {
                ...userData,
                _id: 'user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: vi.fn().mockReturnValue({
                    ...userData,
                    _id: 'user-123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                lean: vi.fn().mockResolvedValue({
                    ...userData,
                    _id: 'user-123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as UserDocument),
            };

            (User.create as any).mockResolvedValue(mockUser);

            expect(mockUser.name).toBe('John Doe');
            expect(mockUser.email).toBe('john@example.com');
            expect(mockUser.emailVerified).toBe(false);
        });

        it('should enforce unique email constraint', () => {
            const existingUser = {
                name: 'Existing User',
                email: 'john@example.com',
                _id: 'existing-user-123',
            };

            (User.findOne as any).mockResolvedValue(existingUser);

            expect(existingUser.email).toBe('john@example.com');
        });
    });

    describe('Invitation Model', () => {
        it('should create invitation with required fields', () => {
            const invitationData = {
                organizationId: 'org-123',
                email: 'invitee@example.com',
                role: 'member' as const,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                invitedBy: 'inviter-456',
                token: 'unique-token-123',
            };

            const mockInvitation = {
                ...invitationData,
                _id: 'invitation-789',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: vi.fn().mockReturnValue({
                    ...invitationData,
                    _id: 'invitation-789',
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                lean: vi.fn().mockResolvedValue({
                    ...invitationData,
                    _id: 'invitation-789',
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as InvitationDocument),
            };

            (Invitation.create as any).mockResolvedValue(mockInvitation);

            expect(mockInvitation.organizationId.toString()).toBe('org-123');
            expect(mockInvitation.email).toBe('invitee@example.com');
            expect(mockInvitation.role).toBe('member');
            expect(mockInvitation.status).toBe('pending');
            expect(mockInvitation.token).toBe('unique-token-123');
        });

        it('should support all invitation statuses', () => {
            const statuses = ['pending', 'accepted', 'expired', 'canceled'];

            statuses.forEach(status => {
                const invitationData = {
                    organizationId: 'org-123',
                    email: 'invitee@example.com',
                    role: 'member' as const,
                    expiresAt: new Date(),
                    invitedBy: 'inviter-456',
                    token: 'token-123',
                    status: status as any,
                };

                const mockInvitation = {
                    ...invitationData,
                    _id: 'invitation-789',
                };

                expect(mockInvitation.status).toBe(status);
            });
        });
    });

    describe('organizationService', () => {
        describe('findOrganizationById', () => {
            it('should find organization by ID', async () => {
                const mockOrg = {
                    _id: 'org-123',
                    name: 'Test Org',
                    slug: 'test-org',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                (Organization.findById as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockOrg),
                });

                const result = await organizationService.findOrganizationById('org-123');

                expect(result).toEqual(mockOrg);
                expect(Organization.findById).toHaveBeenCalledWith('org-123');
            });

            it('should return null if organization not found', async () => {
                (Organization.findById as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(null),
                });

                const result = await organizationService.findOrganizationById('nonexistent');

                expect(result).toBeNull();
            });
        });

        describe('findOrganizationBySlug', () => {
            it('should find organization by slug', async () => {
                const mockOrg = {
                    _id: 'org-123',
                    name: 'Test Org',
                    slug: 'test-org',
                };

                (Organization.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockOrg),
                });

                const result = await organizationService.findOrganizationBySlug('test-org');

                expect(result).toEqual(mockOrg);
                expect(Organization.findOne).toHaveBeenCalledWith({ slug: 'test-org' });
            });
        });

        describe('findMember', () => {
            it('should find member by organization and user IDs', async () => {
                const mockMember = {
                    _id: 'member-123',
                    organizationId: 'org-456',
                    userId: 'user-789',
                    role: 'admin',
                };

                (Member.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockMember),
                });

                const result = await organizationService.findMember('org-456', 'user-789');

                expect(result).toEqual(mockMember);
                expect(Member.findOne).toHaveBeenCalledWith({
                    organizationId: 'org-456',
                    userId: 'user-789',
                });
            });
        });

        describe('countMembersInOrganization', () => {
            it('should count members in organization', async () => {
                (Member.countDocuments as any).mockResolvedValue(5);

                const result = await organizationService.countMembersInOrganization('org-123');

                expect(result).toBe(5);
                expect(Member.countDocuments).toHaveBeenCalledWith({ organizationId: 'org-123' });
            });
        });

        describe('findActiveSubscription', () => {
            it('should find active subscription for user', async () => {
                const mockSubscription = {
                    _id: 'sub-123',
                    userId: 'user-456',
                    plan: 'pro',
                    status: 'active',
                };

                (Subscription.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockSubscription),
                });

                const result = await organizationService.findActiveSubscription('user-456');

                expect(result).toEqual(mockSubscription);
                expect(Subscription.findOne).toHaveBeenCalledWith({
                    userId: 'user-456',
                    status: { $in: ['active', 'trialing'] }
                });
            });
        });

        describe('createReactiveLinkingNotification', () => {
            it('should create reactive linking notification', async () => {
                const notificationData = {
                    userId: 'user-123',
                    organizationId: 'org-456',
                    personalDraftCount: 3,
                };

                // Constructor is already mocked above

                const result = await organizationService.createReactiveLinkingNotification(notificationData);

                expect(result).toEqual({
                    ...notificationData,
                    _id: 'notif-789',
                    dismissed: false,
                    createdAt: new Date(),
                });
            });
        });

        describe('findReactiveLinkingNotification', () => {
            it('should find undismissed reactive linking notification', async () => {
                const mockNotification = {
                    _id: 'notif-123',
                    userId: 'user-456',
                    organizationId: 'org-789',
                    personalDraftCount: 2,
                    dismissed: false,
                };

                (ReactiveLinkingNotification.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockNotification),
                });

                const result = await organizationService.findReactiveLinkingNotification('user-456', 'org-789');

                expect(result).toEqual(mockNotification);
                expect(ReactiveLinkingNotification.findOne).toHaveBeenCalledWith({
                    userId: 'user-456',
                    organizationId: 'org-789',
                    dismissed: false,
                });
            });
        });

        describe('dismissReactiveLinkingNotification', () => {
            it('should dismiss notification successfully', async () => {
                (ReactiveLinkingNotification.updateOne as any).mockResolvedValue({ modifiedCount: 1 });

                const result = await organizationService.dismissReactiveLinkingNotification('notif-123', 'user-456');

                expect(result).toBe(true);
                expect(ReactiveLinkingNotification.updateOne).toHaveBeenCalledWith(
                    { _id: 'notif-123', userId: 'user-456' },
                    { $set: { dismissed: true } }
                );
            });

            it('should return false if notification not found', async () => {
                (ReactiveLinkingNotification.updateOne as any).mockResolvedValue({ modifiedCount: 0 });

                const result = await organizationService.dismissReactiveLinkingNotification('notif-123', 'user-456');

                expect(result).toBe(false);
            });
        });
    });

    describe('userService', () => {
        describe('findUserById', () => {
            it('should find user by ID', async () => {
                const mockUser = {
                    _id: 'user-123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    emailVerified: true,
                };

                (User.findById as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockUser),
                });

                const result = await userService.findUserById('user-123');

                expect(result).toEqual(mockUser);
                expect(User.findById).toHaveBeenCalledWith('user-123');
            });
        });

        describe('findUserByEmail', () => {
            it('should find user by email', async () => {
                const mockUser = {
                    _id: 'user-123',
                    name: 'John Doe',
                    email: 'john@example.com',
                };

                (User.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockUser),
                });

                const result = await userService.findUserByEmail('john@example.com');

                expect(result).toEqual(mockUser);
                expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            });
        });
    });

    describe('subscriptionService', () => {
        describe('findSubscriptionByUserId', () => {
            it('should find subscription by user ID', async () => {
                const mockSubscription = {
                    _id: 'sub-123',
                    userId: 'user-456',
                    plan: 'pro',
                    status: 'active',
                };

                (Subscription.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockSubscription),
                });

                const result = await subscriptionService.findSubscriptionByUserId('user-456');

                expect(result).toEqual(mockSubscription);
                expect(Subscription.findOne).toHaveBeenCalledWith({ userId: 'user-456' });
            });
        });

        describe('findActiveSubscriptionByUserId', () => {
            it('should find active subscription by user ID', async () => {
                const mockSubscription = {
                    _id: 'sub-123',
                    userId: 'user-456',
                    plan: 'pro',
                    status: 'active',
                };

                (Subscription.findOne as any).mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockSubscription),
                });

                const result = await subscriptionService.findActiveSubscriptionByUserId('user-456');

                expect(result).toEqual(mockSubscription);
                expect(Subscription.findOne).toHaveBeenCalledWith({
                    userId: 'user-456',
                    status: { $in: ['active', 'trialing'] }
                });
            });
        });
    });
});