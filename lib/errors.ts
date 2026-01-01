/**
 * Error handling utilities for consistent error responses
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
    this.name = "InternalServerError";
  }
}

// API-specific errors
export class APIError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "API_ERROR"
  ) {
    super(message, statusCode, code);
    this.name = "APIError";
  }
}

export class ExternalAPIError extends APIError {
  constructor(
    message: string,
    public externalService?: string
  ) {
    super(message, 502, "EXTERNAL_API_ERROR");
    this.name = "ExternalAPIError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database error") {
    super(message, 500, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

// Authentication-specific errors
export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = "Token expired") {
    super(message);
    this.name = "TokenExpiredError";
    this.code = "TOKEN_EXPIRED";
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message: string = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsError";
    this.code = "INVALID_CREDENTIALS";
  }
}

// Validation-specific errors
export class FieldValidationError extends ValidationError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "FieldValidationError";
    this.code = "FIELD_VALIDATION_ERROR";
  }
}

export class BusinessValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = "BusinessValidationError";
    this.code = "BUSINESS_VALIDATION_ERROR";
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  includeStack: boolean = false
): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(includeStack && { stack: error.stack }),
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return Response.json(
    {
      error: {
        message,
        code: "INTERNAL_SERVER_ERROR",
        ...(includeStack && error instanceof Error && { stack: error.stack }),
      },
    },
    { status: 500 }
  );
}

/**
 * Logs errors with context
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error("[ERROR]", {
    message: errorMessage,
    stack: errorStack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Type guards for error types
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isUnauthorizedError(
  error: unknown
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Utility to handle external API errors
 */
export function handleExternalAPIError(
  error: unknown,
  serviceName: string
): ExternalAPIError {
  if (error instanceof Error) {
    return new ExternalAPIError(
      `Error from ${serviceName}: ${error.message}`,
      serviceName
    );
  }
  return new ExternalAPIError(`Unknown error from ${serviceName}`, serviceName);
}

/**
 * Utility to create field validation errors
 */
export function createFieldValidationError(
  field: string,
  message: string
): FieldValidationError {
  return new FieldValidationError(`${field}: ${message}`, field);
}

/**
 * Utility to parse and create appropriate error from external response
 */
export function parseAPIResponseError(
  response: Response,
  defaultMessage?: string
): APIError {
  const status = response.status;
  const message = defaultMessage || `API request failed with status ${status}`;

  switch (status) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    case 500:
      return new InternalServerError(message);
    default:
      return new APIError(message, status);
  }
}

/**
 * Wrapper for async operations that may throw errors
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    throw error;
  }
}
