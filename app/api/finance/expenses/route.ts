import { NextRequest, NextResponse } from 'next/server'
import { Expense } from '@/lib/models'
import { connectMongoose } from '@/lib/db'

export async function GET(_request: NextRequest) {
    try {
        // For now, this is a simplified implementation
        // In a real app, you'd verify authentication and roles here
        // For the story implementation, we'll return mock data

        await connectMongoose()

        // Get all approved expenses (simplified - should filter by organization)
        const expenses = await Expense.find({
            status: 'Approved'
        }).populate('user', 'name email').lean();
        const serializedExpenses = JSON.parse(JSON.stringify(expenses));

        // Calculate total payout
        const totalPayout = serializedExpenses.reduce((sum: number, expense: { totalAmount?: number }) =>
            sum + (expense.totalAmount || 0), 0
        )

        return NextResponse.json({
            success: true,
            data: {
                expenses: serializedExpenses,
                totalPayout,
                count: serializedExpenses.length
            }
        })

    } catch (error) {
        console.error('Finance dashboard API error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}