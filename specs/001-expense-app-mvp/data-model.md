# Data Model: Expense App MVP (User Story 1)

## Expense Entity (Embedded Document)

- **Fields**:
  - id: ObjectId
  - userId: String (Better Auth user ID)
  - organizationId: String | null
  - managerIds: Array of String (Better Auth user IDs)
  - totalAmount: Number (frozen on pre-approval)
  - state: String (Draft, Pre-Approval Pending, Pre-Approved, Approved, Rejected, Reimbursed)
  - lineItems: Array of embedded objects
    - amount: Number
    - date: Date
    - description: String (optional)
    - category: String (optional)
    - attachments: Array of String (file URLs)
  - auditLog: Array of objects
    - action: String (e.g., "created", "updated", "submitted")
    - date: Date
    - actorId: String (Better Auth user ID)
    - previousValues: Object (snapshot of changed fields before)
    - updatedValues: Object (snapshot of changed fields after)
  - createdAt: Date
  - updatedAt: Date

- **Validation Rules**:
  - Line items: Amount > 0, Date not in future
  - Sum of line item amounts can exceed totalAmount
  - Expense requires at least one line item if submitted
  - Attachments limited to 5MB, JPG/PNG/PDF
  - Private expenses have null organizationId

## User Entity

- **Note**: User entity is managed by Better Auth. No separate schema needed.

## Organization Entity

- **Note**: Organization entity is managed by Better Auth. Roles: Owner, Admin, Member.