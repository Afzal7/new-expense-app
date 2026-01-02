# new-expense-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-31

## Active Technologies

- TypeScript 5.x, Next.js 14+ + TanStack Query, shadcn/ui, Better Auth, Mongoose (001-expense-app-mvp)

## Project Structure

```text
src/
tests/
```

## Commands

npm run lint && npm run format:check

## Code Style

TypeScript 5.x, Next.js 14+: Follow standard conventions

## Recent Changes

- 001-expense-app-mvp: Added TypeScript 5.x, Next.js 14+ + TanStack Query, shadcn/ui, Better Auth, Mongoose

<!-- MANUAL ADDITIONS START -->

## Security Measures

### Authentication & Authorization

- **Better Auth**: Modern authentication library with email/password, OAuth (Google, Microsoft), organization management, and Stripe integration
- **Session-based auth**: All API routes require valid session authentication
- **Role-based access**: Organization members have different roles (owner, member) with appropriate permissions
- **Email verification**: Required for account activation
- **Password reset**: Secure password reset flow with tokens

### Input Validation & Sanitization

- **Zod schemas**: Comprehensive input validation for all API endpoints and forms
- **File validation**: Magic byte checking + MIME type validation for uploads
- **Search sanitization**: Prevents ReDoS attacks with regex escaping
- **Rate limiting**: 50 uploads per 15 minutes, 100 API requests per minute

### File Upload Security

- **Type restrictions**: Only images, PDFs, and documents allowed
- **Size limits**: 50MB maximum file size
- **Filename sanitization**: Removes dangerous characters and path traversal attempts
- **User isolation**: Files stored in user-specific directories
- **Signed URLs**: Time-limited (15 minutes) upload URLs

### Security Headers

- **CSP**: Content Security Policy prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Data Protection

- **Mongoose validation**: Schema-level validation prevents invalid data
- **Audit logging**: All expense changes are logged with actor information
- **Environment validation**: Strict validation of all environment variables at startup
- **No secrets in code**: All sensitive data accessed through validated env vars

### Best Practices

- **No eval/innerHTML**: Frontend is safe from XSS injection attacks
- **Secure database queries**: Using Mongoose ODM prevents injection
- **Error handling**: Controlled error messages prevent information leakage
- **HTTPS enforcement**: All external URLs must be HTTPS

<!-- MANUAL ADDITIONS END -->
