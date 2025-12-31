import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { Expense } from '@/lib/models'
import { connectMongoose } from '@/lib/db'
import mongoose from 'mongoose'
import { verifyPermission } from '@/lib/verifyPermission'
import { createSuccessResponse, createUnauthorizedResponse, createBadRequestResponse, createForbiddenResponse, createNotFoundResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
    // Start transaction for batch reimbursement
    const dbSession = await mongoose.startSession()

    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return createUnauthorizedResponse()
        }

        const { expenseIds } = await request.json()

        if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
            return createBadRequestResponse('Expense IDs array is required')
        }

        await connectMongoose()

        // Verify all expenses exist and are in Approved state
        const expenses = await Expense.find({
            _id: { $in: expenseIds },
            status: 'Approved'
        }).populate('user', 'name email').lean()

        // Check permissions for each expense
        for (const expense of expenses) {
            const hasPermission = await verifyPermission(session.user.id, 'admin', expense.organizationId.toString());

            if (!hasPermission) {
                return createForbiddenResponse('Not authorized to reimburse expenses')
            }

            if (!expense.organizationId) {
                return createBadRequestResponse('Cannot reimburse personal expenses')
            }
        }

        if (expenses.length !== expenseIds.length) {
            return createNotFoundResponse('Some expenses not found or not in Approved state')
        }

        dbSession.startTransaction()

        // Update all expenses to Reimbursed status
        const updateResult = await Expense.updateMany(
            { _id: { $in: expenseIds }, status: 'Approved' },
            [
                {
                    $set: {
                        status: 'Reimbursed',
                        updatedAt: new Date()
                    }
                },
                {
                    $push: {
                        auditTrail: {
                            timestamp: new Date(),
                            action: 'UPDATE_STATUS',
                            actorId: session.user.id,
                            role: 'admin', // Admin/owner roles handle reimbursements
                            changes: [
                                {
                                    field: 'status',
                                    oldValue: 'Approved',
                                    newValue: 'Reimbursed'
                                }
                            ],
                            metadata: {
                                batchReimbursement: true,
                                expenseCount: expenseIds.length
                            }
                        }
                    }
                }
            ],
            { session: dbSession }
        )

        await dbSession.commitTransaction()

        return createSuccessResponse({
            updatedCount: updateResult.modifiedCount,
            expenseIds
        })

    } catch (error) {
        await dbSession.abortTransaction()
        return handleApiError(error, 'finance reimburse API')
    } finally {
        dbSession.endSession()
    }
}