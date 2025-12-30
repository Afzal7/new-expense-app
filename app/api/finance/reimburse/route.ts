import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Expense } from '@/lib/models'
import { connectMongoose } from '@/lib/db'
import mongoose from 'mongoose'
import { verifyPermission } from '@/lib/verifyPermission'

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { expenseIds } = await request.json()

        if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Expense IDs array is required' },
                { status: 400 }
            )
        }

        await connectMongoose()

        // Verify all expenses exist and are in Approved state
        const expenses = await Expense.find({
            _id: { $in: expenseIds },
            status: 'Approved'
        }).lean();

        // Verify user has permission to reimburse all expenses (admin/owner role required)
        for (const expense of expenses) {
            if (expense.organizationId) {
                const hasPermission = await verifyPermission(session.user.id, 'admin', expense.organizationId.toString());
                if (!hasPermission) {
                    return NextResponse.json(
                        { success: false, error: 'Not authorized to reimburse expenses' },
                        { status: 403 }
                    )
                }
            } else {
                return NextResponse.json(
                    { success: false, error: 'Cannot reimburse personal expenses' },
                    { status: 400 }
                )
            }
        }
        // serializedExpenses not used in current implementation

        if (expenses.length !== expenseIds.length) {
            return NextResponse.json(
                { success: false, error: 'Some expenses not found or not in Approved state' },
                { status: 400 }
            )
        }

        // Start transaction for batch reimbursement
        const dbSession = await mongoose.startSession()
        dbSession.startTransaction()

        try {
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

            return NextResponse.json({
                success: true,
                data: {
                    updatedCount: updateResult.modifiedCount,
                    expenseIds
                }
            })

        } catch (error) {
            await dbSession.abortTransaction()
            throw error
        } finally {
            dbSession.endSession()
        }

    } catch (error) {
        console.error('Reimbursement API error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}