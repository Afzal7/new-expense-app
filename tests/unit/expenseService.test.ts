import { expect, it, describe, vi, beforeEach } from 'vitest';
import { expenseService } from '../../lib/services/expenseService';
import { Expense } from '../../lib/models';
import { ExpenseStatus } from '../../types/expense';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../lib/db', () => ({
    connectMongoose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../lib/models', () => ({
    Expense: {
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock('mongoose', () => ({
    default: {
        startSession: vi.fn(),
    },
}));

// Mock the models module
vi.mock('../../lib/models', () => ({
    Expense: {
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

// Mock mongoose
vi.mock('mongoose', () => ({
    default: {
        startSession: vi.fn(),
    },
    startSession: vi.fn(),
}));

vi.mock('mongoose', () => ({
    default: {
        startSession: vi.fn(),
    },
}));

describe('expenseService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createExpense', () => {
        it('should successfully create an expense with valid inputs', async () => {
            const validId = '507f1f77bcf86cd799439011';
            const input = {
                userId: validId,
                lineItems: [
                    { amount: 50, description: 'Coffee', date: new Date(), attachments: [] }
                ],
                isPersonal: true,
                status: ExpenseStatus.DRAFT
            };

            // Mock session
            const mockSession = {
                startTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                abortTransaction: vi.fn(),
                endSession: vi.fn(),
            };
            (mongoose.startSession as any).mockResolvedValue(mockSession);

            // Mock expense creation
            const mockExpense = {
                ...input,
                _id: validId,
                auditTrail: [{
                    timestamp: new Date(),
                    action: 'CREATE',
                    actorId: validId,
                    role: 'Employee',
                    changes: [{ field: 'all', oldValue: null, newValue: input }],
                }],
                toObject: vi.fn().mockReturnValue({
                    ...input,
                    _id: validId,
                    auditTrail: [{
                        timestamp: new Date(),
                        action: 'CREATE',
                        actorId: validId,
                        role: 'Employee',
                        changes: [{ field: 'all', oldValue: null, newValue: input }],
                    }]
                })
            };
            (Expense.create as any).mockResolvedValue([mockExpense]);

            const result = await expenseService.createExpense(input, validId, 'Employee');

            expect(result).toBeDefined();
            expect(result._id).toBe(validId);
            expect(result.auditTrail).toHaveLength(1);
            expect(result.auditTrail[0].action).toBe('CREATE');
            expect(Expense.create).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        userId: validId,
                        isPersonal: true,
                        status: ExpenseStatus.DRAFT,
                        lineItems: expect.any(Array),
                        auditTrail: expect.any(Array),
                    })
                ]),
                { session: mockSession }
            );
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw validation error for invalid input', async () => {
            const invalidInput = {
                userId: '', // Required
                lineItems: [] // Min 1
            };

            await expect(expenseService.createExpense(invalidInput as any, '507f1f77bcf86cd799439011', 'Employee'))
                .rejects.toThrow();
        });

        it('should abort transaction on error', async () => {
            const validId = '507f1f77bcf86cd799439011';
            const input = {
                userId: validId,
                lineItems: [
                    { amount: 50, description: 'Coffee', date: new Date(), attachments: [] }
                ],
                isPersonal: true,
                status: ExpenseStatus.DRAFT
            };

            // Mock session
            const mockSession = {
                startTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                abortTransaction: vi.fn(),
                endSession: vi.fn(),
            };
            (mongoose.startSession as any).mockResolvedValue(mockSession);

            // Mock expense creation to throw error
            (Expense.create as any).mockRejectedValue(new Error('Database error'));

            await expect(expenseService.createExpense(input, validId, 'Employee'))
                .rejects.toThrow('Database error');

            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should create expense with file attachments per line item', async () => {
            const validId = '507f1f77bcf86cd799439011';
            const attachment1 = { url: 'https://example.com/file1.jpg', name: 'receipt1.jpg', type: 'image/jpeg' as 'image/jpeg' };
            const attachment2 = { url: 'https://example.com/file2.pdf', name: 'invoice.pdf', type: 'application/pdf' as 'application/pdf' };
            const input = {
                userId: validId,
                lineItems: [
                    {
                        amount: 50,
                        description: 'Coffee',
                        date: new Date(),
                        attachments: [attachment1]
                    },
                    {
                        amount: 25,
                        description: 'Lunch',
                        date: new Date(),
                        attachments: [attachment2]
                    }
                ],
                isPersonal: true,
                status: ExpenseStatus.DRAFT
            };

            // Mock session
            const mockSession = {
                startTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                abortTransaction: vi.fn(),
                endSession: vi.fn(),
            };
            (mongoose.startSession as any).mockResolvedValue(mockSession);

            // Mock expense creation
            const mockExpense = {
                ...input,
                _id: validId,
                auditTrail: [{
                    timestamp: new Date(),
                    action: 'CREATE',
                    actorId: validId,
                    role: 'Employee',
                    changes: [{ field: 'all', oldValue: null, newValue: input }],
                }],
                toObject: vi.fn().mockReturnValue({
                    ...input,
                    _id: validId,
                    auditTrail: [{
                        timestamp: new Date(),
                        action: 'CREATE',
                        actorId: validId,
                        role: 'Employee',
                        changes: [{ field: 'all', oldValue: null, newValue: input }],
                    }]
                })
            };
            (Expense.create as any).mockResolvedValue([mockExpense]);

            const result = await expenseService.createExpense(input as any, validId, 'Employee');

            expect(result).toBeDefined();
            expect(result.lineItems[0].attachments).toEqual([attachment1]);
            expect(result.lineItems[1].attachments).toEqual([attachment2]);
            expect(Expense.create).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        lineItems: expect.arrayContaining([
                            expect.objectContaining({
                                attachments: [attachment1]
                            }),
                            expect.objectContaining({
                                attachments: [attachment2]
                            })
                        ])
                    })
                ]),
                { session: mockSession }
            );
        });


    });
});
