export enum ExpenseStatus {
    DRAFT = 'DRAFT',
    PRE_APPROVAL_PENDING = 'PRE_APPROVAL_PENDING',
    PRE_APPROVED = 'PRE_APPROVED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REIMBURSED = 'REIMBURSED'
}

export interface LineItem {
    amount: number;
    description: string;
    date: Date;
    attachments: string[]; // URLs or file keys
}

export interface AuditLogEntry {
    timestamp: Date;
    action: 'CREATE' | 'UPDATE_STATUS' | 'LINK_ORG' | 'ATTACH_FILE';
    actorId: string; // MongoDB ObjectId string
    role: string;
    changes: {
        field: string;
        oldValue: unknown;
        newValue: unknown;
    }[];
    metadata?: Record<string, unknown>;
}

export interface Expense {
    _id?: string;
    userId: string; // MongoDB ObjectId string
    organizationId?: string; // MongoDB ObjectId string
    managerId?: string; // MongoDB ObjectId string
    status: ExpenseStatus;
    totalAmount: number;
    isPersonal: boolean;
    lineItems: LineItem[];
    auditTrail: AuditLogEntry[];
    createdAt: Date;
    updatedAt: Date;
}
