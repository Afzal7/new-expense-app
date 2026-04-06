// @ts-nocheck — prototype / demo route; not type-checked in production build.
"use client";

/* 
  -----------------------------------------------------------------------------------------------
  BACKEND INTEGRATION GUIDE (FOR AI AGENT #2)
  -----------------------------------------------------------------------------------------------
  
  1. DATA MODEL (Mongoose Schema Assumptions):
     - User: { _id, name, email, plan: 'free'|'pro', role: 'owner'|'manager'|'employee', orgId? }
     - Expense: { 
         _id, 
         userId, 
         orgId, 
         amount, 
         merchant, 
         date, 
         status: 'draft'|'pending'|'approved'|'rejected'|'reimbursed',
         category: String,
         receiptUrl: String
       }
     - Organization: { _id, name, ownerId, burnRateData: [] }

  2. SERVER ACTIONS / API ENDPOINTS NEEDED:
     - GET /api/user/dashboard-stats: 
       Returns { 
         vaultTotal: Number (Sum of personal expenses current month),
         vaultTrend: Number (Percentage vs last month),
         inboxCount: Number (For managers),
         pendingReimbursement: Number (For employees),
         burnRate: Array<Number> (For owners)
       }
     
     - GET /api/expenses/analytics:
       Returns { weeklyData: [], topCategories: [] } for the InlineAnalytics component.

  3. AUTHENTICATION:
     - All queries must be scoped to `session.user.id`.
     - Use middleware to protect these routes.

  4. REAL-TIME UPDATES (Optional):
     - If using Socket.io/Pusher, listen for 'expense.created' to auto-update the 'Inbox' count.
  -----------------------------------------------------------------------------------------------
*/

import { useState } from "react";

// --- Icons ---
const IconLock = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconBriefcase = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconPlus = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconChevronRight = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconClock = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconZap = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconSparkles = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconLogOut = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const IconUser = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPieChart = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;

// --- Components ---

// 1. Sparkline (Data Viz)
const Sparkline = () => (
  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
    <path d="M0 35 C 20 35, 30 10, 50 20 C 70 30, 80 5, 100 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-50"/>
    <path d="M0 35 C 20 35, 30 10, 50 20 C 70 30, 80 5, 100 15 V 50 H 0 Z" fill="currentColor" className="opacity-10" stroke="none"/>
  </svg>
);

// 2. Bar Chart (Burn Rate)
const BurnChart = () => (
  <div className="flex items-end gap-1.5 h-12 w-full mt-auto opacity-80">
    {/* [BACKEND]: Map over 'burnRateData' array from Organization model */}
    {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
      <div key={i} className={`flex-1 rounded-sm ${i === 6 ? 'bg-[#121110]' : 'bg-zinc-200'}`} style={{ height: `${h}%` }} />
    ))}
  </div>
);

// 3. Personal Vault Card (The Anchor)
const PersonalVaultCard = () => (
  <div className="bg-[#121110] rounded-[2rem] p-6 text-white shadow-xl shadow-zinc-300 relative overflow-hidden group h-full">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A65] blur-[60px] opacity-20 rounded-full"></div>
    <div className="relative z-10 flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1"><IconLock className="w-3 h-3" /> Personal Vault</h3>
                {/* [BACKEND]: Sum of all expenses where userId = current && status != 'submitted' */}
                <div className="text-3xl font-mono font-bold tracking-tighter mt-1">$1,240.50</div>
            </div>
            <div className="bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md border border-white/5">
                <span className="text-[10px] font-bold text-[#FF8A65]">Oct '24</span>
            </div>
        </div>
        <div className="flex items-end justify-between mt-auto">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <span className="bg-[#D0FC42] text-[#121110] px-1.5 py-0.5 rounded font-bold">+12%</span>
                <span>vs Sept</span>
            </div>
            <div className="w-24 h-10 text-[#FF8A65]"><Sparkline /></div>
        </div>
    </div>
  </div>
);

// 4. Context Slot (Adaptive)
const SmartContextCard = ({ state }) => {
    
    // A: FREE USER -> Upsell (RESTORED ORIGINAL HIGH-FIDELITY DESIGN)
    if (state.plan === 'free') {
        return (
            <div className="bg-gradient-to-br from-[#121110] to-[#2C2C2C] rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer shadow-lg h-full">
                {/* Visual Physics: Noise & Blur Orbs */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 blur-[60px] opacity-30 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 blur-[60px] opacity-30 rounded-full"></div>
                
                <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-white text-[10px] font-bold">PRO</div>
                        <IconSparkles className="w-5 h-5 text-[#D0FC42]" />
                    </div>
                    <div className="space-y-2 mt-auto mb-2">
                        <div className="flex items-center gap-2 text-white"><IconZap className="w-3 h-3 text-[#D0FC42] fill-current" /><span className="text-xs font-bold">AI Receipt Autofill</span></div>
                        <div className="flex items-center gap-2 text-white"><IconBriefcase className="w-3 h-3 text-[#D0FC42]" /><span className="text-xs font-bold">Create Organizations</span></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#D0FC42] mt-1">Upgrade Now <IconChevronRight className="w-3 h-3" /></div>
                </div>
            </div>
        );
    }

    // B: PRO USER (No Org)
    if (state.plan === 'pro' && !state.hasOrg) {
        return (
            <div className="bg-[#FFF0E6] border border-[#FFD0B0] rounded-[2rem] p-6 relative overflow-hidden h-full">
                <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E66A45]"><IconZap className="w-3 h-3 fill-current" /> Pro Active</div>
                    </div>
                    <div>
                        {/* [BACKEND]: Count of expenses scanned by AI this month */}
                        <div className="text-3xl font-mono font-bold tracking-tighter text-[#121110]">24</div>
                        <div className="text-xs text-zinc-500 mt-1">Receipts scanned this month</div>
                    </div>
                    <div className="mt-2 pt-3 border-t border-[#FFD0B0]/50 flex items-center justify-between group cursor-pointer hover:opacity-75 transition-opacity">
                        <span className="text-[10px] font-bold text-[#121110] uppercase tracking-wide">Create Team</span>
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#E66A45] shadow-sm"><IconPlus className="w-3 h-3" /></div>
                    </div>
                </div>
            </div>
        );
    }

    // C: ORG OWNER
    if (state.hasOrg && state.role === 'owner') {
        return (
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm h-full relative overflow-hidden group cursor-pointer hover:border-zinc-300 transition-colors">
                <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Company Burn</h3>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                             {/* [BACKEND]: Sum of all org expenses status='paid' + 'approved' */}
                            <div className="text-3xl font-mono font-bold tracking-tighter text-[#121110]">$24.5k</div>
                            <div className="text-xs font-bold text-zinc-400">Oct</div>
                        </div>
                        <div className="mt-2"><BurnChart /></div>
                    </div>
                </div>
            </div>
        );
    }

    // D: ORG EMPLOYEE
    if (state.hasOrg && state.role === 'employee') {
        return (
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm h-full relative overflow-hidden">
                <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Owed to Me</h3>
                        <IconBriefcase className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div>
                         {/* [BACKEND]: Sum of my expenses where status='pending' or 'approved' (not paid) */}
                        <div className="text-3xl font-mono font-bold tracking-tighter text-[#121110]">$450.00</div>
                        <div className="mt-3 inline-flex items-center gap-2 bg-orange-100 px-2 py-1 rounded-lg border border-orange-200">
                            <IconClock className="w-3 h-3 text-orange-600" />
                            <span className="text-[10px] font-bold text-orange-700">Pending Approval</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // E: ORG MANAGER
    if (state.hasOrg && state.role === 'manager') {
        return (
            <div className="bg-[#121110] text-white rounded-[2rem] p-6 shadow-sm h-full relative overflow-hidden">
                <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Team Inbox</h3>
                        <div className="bg-[#D0FC42] text-[#121110] text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Action Needed</div>
                    </div>
                    <div>
                        {/* [BACKEND]: Count of expenses where status='pending' AND orgId=myOrg */}
                        <div className="text-4xl font-mono font-bold tracking-tighter">4</div>
                        <div className="text-xs text-zinc-400 mt-1">Requests waiting</div>
                    </div>
                    <button className="w-full bg-white/10 hover:bg-white/20 transition-colors text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                        Review Now <IconChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

// 5. Inline Analytics
const InlineAnalytics = () => {
    // [BACKEND]: Fetch aggregation of expenses grouped by category and by day of week
    return (
        <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <IconPieChart className="w-4 h-4" /> 
                    Analytics
                </h3>
                <div className="text-[10px] font-bold text-[#121110] bg-zinc-100 px-2 py-1 rounded-lg">Last 7 Days</div>
            </div>

            {/* Weekly Spending Chart */}
            <div>
                <div className="flex items-end justify-between h-24 gap-2">
                    {[
                        { day: 'M', h: '30%', active: false },
                        { day: 'T', h: '45%', active: false },
                        { day: 'W', h: '25%', active: false },
                        { day: 'T', h: '60%', active: false },
                        { day: 'F', h: '85%', active: true },
                        { day: 'S', h: '50%', active: false },
                        { day: 'S', h: '40%', active: false },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                            <div className="w-full relative flex items-end justify-center h-full">
                                <div 
                                    className={`w-full max-w-[12px] rounded-full transition-all duration-300 group-hover:scale-y-110 origin-bottom ${item.active ? 'bg-[#FF8A65]' : 'bg-zinc-100 group-hover:bg-zinc-200'}`} 
                                    style={{ height: item.h }} 
                                />
                            </div>
                            <span className={`text-[10px] font-bold ${item.active ? 'text-[#FF8A65]' : 'text-zinc-300'}`}>{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-zinc-100 w-full" />

            {/* Top Categories Breakdown */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Top Categories</h4>
                <div className="group cursor-pointer">
                    <div className="flex justify-between text-xs font-bold text-[#121110] mb-1">
                        <span>Food & Dining</span>
                        <span>$450</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#121110] w-[65%] rounded-full" />
                    </div>
                </div>
                {/* Additional categories simulated */}
                <div className="group cursor-pointer">
                    <div className="flex justify-between text-xs font-bold text-[#121110] mb-1">
                        <span>Transport</span>
                        <span>$120</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D0FC42] w-[30%] rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MobileDashboard() {
  // [BACKEND]: Replace this state with data fetched from useUser() or session context
  const [userState, setUserState] = useState({
    plan: "free", 
    hasOrg: false, 
    role: "employee" 
  });
  
  const [showSettings, setShowSettings] = useState(false);

  // [BACKEND]: Logic to toggle "New Expense" modal would go here
  const handleNewExpense = () => {
    console.log("Open CreateExpenseView modal");
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-32">
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-[#FDF8F5]/90 backdrop-blur-xl sticky top-0 z-30">
         <div>
            <h1 className="text-xl font-bold">Hi, Alex</h1>
            <p className="text-xs text-zinc-400">Here's your spending breakdown</p>
         </div>
         <div onClick={() => setShowSettings(!showSettings)} className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white overflow-hidden shadow-sm cursor-pointer hover:border-[#FF8A65] transition-colors">
            {/* [BACKEND]: User Avatar URL */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
         </div>
      </div>

      {/* Settings Dropdown omitted for brevity */}
      {showSettings && (
          <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)}></div>
      )}

      <div className="px-6 space-y-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PersonalVaultCard />
            <SmartContextCard state={userState} />
        </div>

        {/* Secondary Actions Toolbelt (Only for Owners) */}
        {userState.role === 'owner' && (
            <div>
                 <button className="w-full flex items-center justify-center gap-2 py-4 bg-[#FFF0E6] text-[#E66A45] border border-[#FFD0B0] rounded-[2rem] font-bold text-sm active:scale-95 transition-transform">
                    <div className="bg-white p-1 rounded-full"><IconUser className="w-3 h-3" /></div>
                    Invite Team Members
                </button>
            </div>
        )}

        {/* Inline Analytics */}
        <InlineAnalytics />
      </div>

      {/* FLOATING ACTION BUTTON (FAB) */}
      <button 
        onClick={handleNewExpense}
        className="fixed bottom-8 right-6 w-16 h-16 bg-[#121110] text-white rounded-[2rem] shadow-2xl shadow-[#121110]/30 flex items-center justify-center z-50 transition-transform active:scale-90 hover:-translate-y-1"
      >
        <IconPlus className="w-8 h-8" />
      </button>

      {/* DEBUGGERS */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity pointer-events-none sm:pointer-events-auto">
          <button onClick={() => setUserState({plan: 'free', hasOrg: false})} className="bg-black text-white text-[10px] px-2 py-1 rounded shadow pointer-events-auto">Sim: Free</button>
          <button onClick={() => setUserState({plan: 'pro', hasOrg: false})} className="bg-black text-white text-[10px] px-2 py-1 rounded shadow pointer-events-auto">Sim: Pro Solo</button>
          <button onClick={() => setUserState({plan: 'pro', hasOrg: true, role: 'employee'})} className="bg-black text-white text-[10px] px-2 py-1 rounded shadow pointer-events-auto">Sim: Org Employee</button>
          <button onClick={() => setUserState({plan: 'pro', hasOrg: true, role: 'manager'})} className="bg-black text-white text-[10px] px-2 py-1 rounded shadow pointer-events-auto">Sim: Org Manager</button>
          <button onClick={() => setUserState({plan: 'pro', hasOrg: true, role: 'owner'})} className="bg-black text-white text-[10px] px-2 py-1 rounded shadow pointer-events-auto">Sim: Owner</button>
      </div>

    </div>
  );
}