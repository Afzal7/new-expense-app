"use client";

import { useState } from "react";

/**
 * ============================================================================
 * DESIGN SYSTEM: "WARM TACTILE" / "FOLD"
 * ============================================================================
 * - Colors: Warm Cream (#FDF8F5) background, Deep Ink (#121110) text.
 * - Shapes: Super-rounded corners (rounded-[2rem]) for a physical card feel.
 * - Interaction: "Touch-first" targets. Drawers/Sheets for complex actions.
 * - Philosophy: "Forgiving UX" - Actions like rejection are reversible via status changes.
 */

// --- ICONS ---
// Custom SVG icons using a 2.5px stroke width to match the "Chunky/Friendly" aesthetic.
// We avoid external libraries (like Lucide) here to keep the component self-contained for the AI.
const IconArrowLeft = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconReceipt = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>;
const IconCheck = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17 4 12" /></svg>;
const IconX = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconClock = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconLock = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconEye = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconBuilding = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const IconBanknote = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>;
const IconChevronUp = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const IconThumbsUp = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>;
const IconPen = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;

// --- STATE MACHINE CONFIGURATION ---
/**
 * Maps database ENUM states to UI presentation logic.
 * 
 * DESIGN DECISIONS:
 * - Pre-approval Flow: Uses Blue/Indigo to signify "Planning" (Cool colors).
 * - Reimbursement Flow: Uses Orange (Pending) -> Lime (Approved) -> Blue (Paid).
 * - Terminal States: 'Reimbursed' is Blue because it signifies money transfer (Banking).
 */
const STATE_CONFIG = {
  DRAFT: { 
    label: 'Draft', 
    icon: IconLock, 
    color: 'text-zinc-500', bg: 'bg-zinc-100', border: 'border-zinc-200',
    description: "Visible only to employee"
  },
  PRE_APPROVAL_PENDING: { 
    label: 'Pre-Approval Pending', 
    icon: IconClock, 
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
    description: "Waiting for manager permission"
  },
  PRE_APPROVED: { 
    label: 'Pre-Approved', 
    icon: IconThumbsUp, 
    color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200',
    description: "Expense is greenlit"
  },
  APPROVAL_PENDING: { 
    label: 'Approval Pending', 
    icon: IconClock, 
    color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200',
    description: "Waiting for final review"
  },
  APPROVED: { 
    label: 'Approved', 
    icon: IconCheck, 
    color: 'text-[#121110]', bg: 'bg-[#D0FC42]', border: 'border-[#B8E630]',
    description: "Ready for payment"
  },
  REJECTED: { 
    label: 'Rejected', 
    icon: IconX, 
    color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
    description: "Returned to employee"
  },
  REIMBURSED: { 
    label: 'Reimbursed', 
    icon: IconBanknote, 
    // Uses Blue to signify completed transaction
    color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200',
    description: "Payment processed"
  },
};

// --- SUB-COMPONENTS ---

/**
 * StatusBadge:
 * Displays the current state with the appropriate color theme.
 * Used in the Header and Context Bar.
 */
const StatusBadge = ({ stateKey }) => {
  // Fallback to DRAFT if state is unknown
  const config = STATE_CONFIG[stateKey] || STATE_CONFIG.DRAFT;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

/**
 * LineItemRow:
 * Displays a single receipt/item within the expense report.
 * Handles the "Attachment vs No Attachment" visual logic.
 */
const LineItemRow = ({ item }) => {
  return (
    <div className="group flex flex-col md:flex-row gap-4 p-4 border border-zinc-100 bg-white rounded-2xl shadow-sm hover:border-zinc-300 transition-all">
      {/* Thumbnail Area */}
      <div className="w-full md:w-16 h-32 md:h-16 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 relative">
        {item.attachment ? (
            <>
                <img src={item.attachment} alt="Receipt" className="w-full h-full object-cover" />
                {/* Hover overlay for 'View' action */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer">
                    <IconEye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                </div>
            </>
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                <IconReceipt className="w-6 h-6" />
            </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
            <div>
                <div className="font-bold text-[#121110] text-lg">{item.description}</div>
                <div className="text-xs text-zinc-500 font-medium mt-1">
                    {item.date} • <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">{item.category}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="font-mono font-bold text-xl">${item.amount.toFixed(2)}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AuditLog:
 * Visualizes the history of the expense.
 * Vital for trust in financial applications.
 */
const AuditLog = ({ logs }) => (
    <div className="relative border-l-2 border-zinc-200 ml-3 pl-6 space-y-6 py-2">
        {logs.map((log, i) => (
            <div key={i} className="relative">
                {/* Timeline Node */}
                <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white ring-1 ring-zinc-200 ${i === 0 ? 'bg-[#121110]' : 'bg-zinc-300'}`} />
                <div className="text-xs text-zinc-400 font-bold mb-0.5">
                    {new Date(log.date).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                </div>
                <div className="text-sm">
                    <span className="font-bold text-[#121110]">{log.actor}</span> {log.action}
                </div>
            </div>
        ))}
    </div>
);

// --- MAIN PAGE COMPONENT ---

export default function ViewExpensePage() {
  // --- SIMULATION CONTROLS ---
  // These mimic props or context you would get from your backend/auth provider
  const [role, setRole] = useState("manager"); // ROLE: Who is viewing? ('employee' | 'manager')
  const [currentStatus, setCurrentStatus] = useState("APPROVAL_PENDING"); // STATE: Database Status
  const [isPrivate, setIsPrivate] = useState(false); // SCOPE: Is this in the Personal Vault?
  
  // --- UI STATE ---
  const [showStatusSheet, setShowStatusSheet] = useState(false); // Controls the Manager Drawer

  // --- CRITICAL BUSINESS LOGIC ---
  // 1. Is the expense locked? (Finalized states cannot be edited by normal flows)
  const isLocked = ['APPROVED', 'REIMBURSED', 'PRE_APPROVED'].includes(currentStatus);
  
  // 2. Can the Employee edit this? 
  //    - YES if it's in their Vault (Private).
  //    - YES if it's in the Org but NOT yet locked (e.g. Draft, Pending, Rejected).
  const isEditable = isPrivate || (!isPrivate && !isLocked);

  // --- MOCK DATA ---
  const expense = {
    id: "EXP-2401",
    total: 1295.50,
    merchant: "Multiple Items",
    isPrivate: isPrivate,
    lineItems: [
        { id: 1, amount: 850.00, description: "United Airlines", date: "2024-10-24", category: "Travel", attachment: "https://images.unsplash.com/photo-1544984243-ec36126a430a?auto=format&fit=crop&q=80&w=200" },
        { id: 2, amount: 445.50, description: "Hyatt Regency", date: "2024-10-25", category: "Lodging", attachment: null },
    ],
    auditLog: [
        { date: "2024-10-24T16:30:00Z", actor: "Alex User", action: "submitted report" },
        { date: "2024-10-24T10:00:00Z", actor: "Alex User", action: "created draft" },
    ]
  };

  const statusConfig = STATE_CONFIG[currentStatus];
  
  // The states a Manager can switch *TO* manually. 
  // We exclude DRAFT because a manager should never move something back to Draft (only Employee can).
  const managerOptions = [
    'APPROVAL_PENDING', 
    'APPROVED', 
    'REJECTED', 
    'REIMBURSED', 
    'PRE_APPROVAL_PENDING', 
    'PRE_APPROVED'
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-40">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#FDF8F5]/90 backdrop-blur-xl border-b border-zinc-100 px-6 py-4 flex justify-between items-center">
         <button className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors">
            <IconArrowLeft className="w-5 h-5" />
         </button>
         
         {/* DEV TOOLS: Toggle these to test different user flows */}
         <div className="flex gap-2">
             <button onClick={() => setRole(role === 'manager' ? 'employee' : 'manager')} className="text-[10px] border px-2 rounded bg-white shadow-sm">
                View: <strong>{role}</strong>
             </button>
             <button onClick={() => setIsPrivate(!isPrivate)} className="text-[10px] border px-2 rounded bg-white shadow-sm">
                Loc: <strong>{isPrivate ? 'Vault' : 'Org'}</strong>
             </button>
         </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        
        {/* 1. CONTEXT & STATUS BANNER */}
        <div className="flex justify-between items-center">
            {/* Context Indicator (Privacy) */}
            {isPrivate ? (
                <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                    <IconLock className="w-4 h-4" /> Personal Vault
                </div>
            ) : (
                <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                    <IconBuilding className="w-4 h-4" /> Acme Corp
                </div>
            )}
            {/* Status Badge (Only for Org) */}
            {!isPrivate && <StatusBadge stateKey={currentStatus} />}
        </div>

        {/* 2. HERO TOTAL */}
        <div className="text-center">
            <div className="text-zinc-400 font-bold text-sm mb-1">Total Amount</div>
            <div className="font-mono font-bold text-6xl tracking-tighter text-[#121110]">
                ${expense.total.toFixed(2)}
            </div>
        </div>

        {/* 3. LINE ITEMS LIST */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Receipts & Items</h3>
            <div className="space-y-3">
                {expense.lineItems.map((item) => (
                    <LineItemRow key={item.id} item={item} />
                ))}
            </div>
        </div>

        {/* 4. AUDIT LOG (Only visible in Org Context) */}
        {!isPrivate && (
            <div className="pt-8 border-t border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1 mb-4">History</h3>
                <AuditLog logs={expense.auditLog} />
            </div>
        )}
      </div>

      {/* --- FOOTER LOGIC: The "Brain" of the Page --- */}

      {/* SCENARIO 1: MANAGER VIEW
          - Can change status of any Org expense.
          - Uses a "Drawer" for scalable state selection.
      */}
      {!isPrivate && role === 'manager' && (
          <>
            <div className="fixed bottom-0 left-0 right-0 bg-[#FDF8F5]/95 backdrop-blur-xl border-t border-zinc-200 p-6 z-40 safe-area-pb">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    {/* Current Status Readout */}
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg} ${statusConfig.color}`}>
                            <statusConfig.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</div>
                            <div className="text-sm font-bold text-[#121110]">{statusConfig.label}</div>
                        </div>
                    </div>

                    {/* Trigger for State Drawer */}
                    <button 
                        onClick={() => setShowStatusSheet(true)}
                        className="bg-[#121110] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                        Change <IconChevronUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* STATUS DRAWER COMPONENT */}
            {showStatusSheet && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowStatusSheet(false)} />
                    
                    {/* Sheet Content */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 z-50 animate-in slide-in-from-bottom-full duration-500 pb-12 shadow-2xl">
                        <div className="max-w-xl mx-auto">
                            <div className="flex justify-center -mt-2 mb-6"><div className="w-12 h-1.5 bg-zinc-200 rounded-full" /></div>
                            <h3 className="text-lg font-bold mb-6 px-2">Update Status</h3>
                            
                            {/* Scrollable List with Padding for Ring visibility */}
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
                                {managerOptions.map((key) => {
                                    const s = STATE_CONFIG[key];
                                    const Icon = s.icon;
                                    const isActive = currentStatus === key;
                                    return (
                                        <button 
                                            key={key}
                                            onClick={() => { setCurrentStatus(key); setShowStatusSheet(false); }}
                                            className={`
                                                w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                                                ${isActive ? 'bg-zinc-50 border-black ring-1 ring-black' : 'bg-white border-zinc-100 hover:bg-zinc-50'}
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-[#121110]">{s.label}</div>
                                                <div className="text-xs text-zinc-500">{s.description}</div>
                                            </div>
                                            {isActive && <IconCheck className="w-5 h-5 text-[#121110]" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
          </>
      )}

      {/* SCENARIO 2: EMPLOYEE VIEW
          - Can Edit/Withdraw if expense is "In Play" (Draft, Pending, Rejected).
          - Read Only if expense is "Locked" (Approved, Paid).
      */}
      {role === 'employee' && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#FDF8F5]/95 backdrop-blur-xl border-t border-zinc-200 p-6 z-40 safe-area-pb">
             <div className="max-w-2xl mx-auto">
                 {isEditable ? (
                     // Case A: Actionable Footer
                     <div className="flex gap-3">
                         <button className="flex-1 bg-white border-2 border-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <IconPen className="w-4 h-4" /> Edit
                         </button>
                         
                         {isPrivate ? (
                             <button className="flex-[2] bg-[#121110] text-white py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg">
                                Submit to Org
                             </button>
                         ) : (
                             <button className="flex-[2] bg-white border-2 border-zinc-200 text-red-500 py-4 rounded-2xl font-bold text-sm hover:bg-red-50 active:scale-[0.98] transition-all">
                                Withdraw Request
                             </button>
                         )}
                     </div>
                 ) : (
                     // Case B: Read-Only Status Footer
                     <div className="text-center">
                         <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <statusConfig.icon className="w-4 h-4" />
                            {statusConfig.label} - Read Only
                         </div>
                     </div>
                 )}
             </div>
          </div>
      )}

    </div>
  );
}