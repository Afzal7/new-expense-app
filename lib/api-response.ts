import { NextResponse } from 'next/server';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
    });
}

/**
 * Create an error API response as JSON
 */
export function createErrorResponse(
    message: string,
    status: number = 500
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            error: message,
        },
        { status }
    );
}

/**
 * Create an unauthorized error response
 */
export function createUnauthorizedResponse(message = 'Authentication required'): NextResponse<ApiResponse> {
    return createErrorResponse(message, 401);
}

/**
 * Create a forbidden error response
 */
export function createForbiddenResponse(message = 'Insufficient permissions'): NextResponse<ApiResponse> {
    return createErrorResponse(message, 403);
}

/**
 * Create a not found error response
 */
export function createNotFoundResponse(message = 'Resource not found'): NextResponse<ApiResponse> {
    return createErrorResponse(message, 404);
}

/**
 * Create a bad request error response
 */
export function createBadRequestResponse(message = 'Invalid request'): NextResponse<ApiResponse> {
    return createErrorResponse(message, 400);
}

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiResponse> {
    console.error(`API Error${context ? ` (${context})` : ''}:`, error);

    if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('permission') || error.message.includes('unauthorized')) {
            return createForbiddenResponse('Access denied');
        }

        if (error.message.includes('not found')) {
            return createNotFoundResponse(error.message);
        }

        if (error.message.includes('validation') || error.message.includes('invalid')) {
            return createBadRequestResponse(error.message);
        }

        return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
}