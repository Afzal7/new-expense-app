import { NextRequest, NextResponse } from 'next/server'
import { Expense } from '@/lib/models'
import { connectMongoose } from '@/lib/db'
import { createBadRequestResponse, createNotFoundResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
    try {
        const { format, expenseIds } = await request.json()

        if (!format || !['csv', 'pdf'].includes(format)) {
            return createBadRequestResponse('Invalid format. Must be csv or pdf.')
        }

        if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
            return createBadRequestResponse('Expense IDs array is required')
        }

        await connectMongoose()

        // Get expenses for export
        const expenses = await Expense.find({
            _id: { $in: expenseIds }
        }).populate('user', 'name email').lean();
        const serializedExpenses = JSON.parse(JSON.stringify(expenses));

        if (expenses.length === 0) {
            return createNotFoundResponse('No expenses found')
        }

        // Generate file based on format
        if (format === 'csv') {
            const csvContent = generateCSV(serializedExpenses)
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="expenses-export-${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        } else if (format === 'pdf') {
            // For now, return CSV as placeholder - PDF implementation would require additional libraries
            const csvContent = generateCSV(serializedExpenses)
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="expenses-export-${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

    } catch (error) {
        return handleApiError(error, 'finance export API')
    }
}

function generateCSV(expenses: Array<{
    createdAt: Date;
    user?: { email?: string; name?: string };
    totalAmount?: number;
    lineItems?: Array<{ description?: string }>;
    status: string;
}>): string {
    const headers = ['Date', 'Employee Email', 'Employee Name', 'Amount', 'Category', 'Description', 'Status']
    const rows = expenses.map(expense => [
        new Date(expense.createdAt).toLocaleDateString(),
        expense.user?.email || '',
        expense.user?.name || '',
        expense.totalAmount?.toFixed(2) || '0.00',
        'General', // Default category since we don't have categories yet
        expense.lineItems?.[0]?.description || '',
        expense.status || ''
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return csvContent
}