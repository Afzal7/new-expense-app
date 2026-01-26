"use client";

import { useMemo, useState } from "react";

// --- Icons ---
const IconSearch = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconLock = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconBriefcase = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconInbox = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const IconUser = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCheck = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17 4 12" /></svg>;

// --- Mock Data ---
const generateExpenses = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `EXP-${i}`,
    merchant: ["Starbucks", "Uber", "United Airlines", "WeWork", "Apple Store"][i % 5],
    employee: ["Sarah Jones", "Mike Ross", "Harvey S.", "Jessica P."][i % 4], // For inbox
    amount: (Math.random() * 500).toFixed(2),
    date: new Date(Date.now() - i * 86400000).toISOString(),
    status: ["draft", "pending", "approved", "rejected", "reimbursed"][i % 5],
    category: ["Meals", "Transport", "Travel", "Office", "Tech"][i % 5],
    isPrivate: i % 2 === 0, // Split 50/50 for demo
  }));
};

// --- Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-zinc-100 text-zinc-500",
    pending: "bg-orange-100 text-orange-700",
    approved: "bg-[#D0FC42] text-[#121110]",
    rejected: "bg-red-100 text-red-700",
    reimbursed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const ExpenseCard = ({ expense, showEmployeeName }) => {
  return (
    <div className="group bg-white p-4 rounded-[1.25rem] border border-zinc-200 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all hover:border-zinc-300">
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border border-zinc-100 flex-shrink-0 ${expense.isPrivate ? 'bg-[#FFF0E0]' : 'bg-zinc-50'}`}>
            {expense.category === 'Meals' && '🍔'}
            {expense.category === 'Transport' && '🚕'}
            {expense.category === 'Travel' && '✈️'}
            {expense.category === 'Office' && '🖇️'}
            {expense.category === 'Tech' && '💻'}
        </div>

        {/* Text Details */}
        <div className="min-w-0">
            {showEmployeeName ? (
                // INBOX VIEW: Focus on WHO
                <div>
                    <div className="font-bold text-[#121110] text-sm">{expense.employee}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{expense.merchant}</div>
                </div>
            ) : (
                // MY VIEW: Focus on WHAT
                <div>
                    <div className="font-bold text-[#121110] text-base truncate">{expense.merchant}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{expense.category}</div>
                </div>
            )}
        </div>
      </div>

      {/* Right Side: Amount & Status */}
      <div className="text-right">
        <div className="font-mono font-bold text-lg text-[#121110]">${expense.amount}</div>
        <div className="flex justify-end mt-1">
            <StatusBadge status={expense.status} />
        </div>
      </div>
    </div>
  );
};

export default function StrictContextListPage() {
  const [role, setRole] = useState("manager"); // 'employee' | 'manager'
  
  // 1. TOP LEVEL CONTEXT (The God Switch)
  const [context, setContext] = useState("work"); // 'vault' | 'work'
  
  // 2. SUB LEVEL VIEW (Work Only)
  const [workView, setWorkView] = useState("inbox"); // 'mine' | 'inbox' (Default to Inbox for managers)

  // 3. SEARCH
  const [search, setSearch] = useState("");

  const allExpenses = useMemo(() => generateExpenses(20), []);

  const filteredData = allExpenses.filter(item => {
    // A. STRICT CONTEXT SEPARATION
    if (context === 'vault') {
        if (!item.isPrivate) return false;
        // Search Logic for Vault
        if (search && !item.merchant.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }

    // B. WORK CONTEXT LOGIC
    if (context === 'work') {
        if (item.isPrivate) return false; // Hide private items

        if (role === 'manager' && workView === 'inbox') {
            // Manager Inbox: Show Pending items from OTHERS
            if (item.status !== 'pending') return false; 
            // Search by Employee Name in Inbox
            if (search && !item.employee.toLowerCase().includes(search.toLowerCase())) return false;
        } else {
            // My Claims: Show MY items (All statuses)
            // Search by Merchant in My Claims
            if (search && !item.merchant.toLowerCase().includes(search.toLowerCase())) return false;
        }
        return true;
    }
    return false;
  });

  return (
    <div className={`min-h-screen font-sans pb-24 transition-colors duration-500 ${context === 'vault' ? 'bg-[#FFF8F5]' : 'bg-[#FDFDFD]'}`}>
      
      {/* --- HEADER & CONTROLS --- */}
      <div className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-500 ${context === 'vault' ? 'bg-[#FFF8F5]/95 border-orange-100' : 'bg-[#FDFDFD]/95 border-zinc-200'}`}>
         <div className="px-6 pt-6 pb-4 space-y-6">
             
             {/* 1. THE GOD SWITCH (Personal vs Work) */}
             <div className="flex justify-center">
                 <div className="bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm flex relative">
                    <button 
                        onClick={() => setContext('vault')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${context === 'vault' ? 'bg-[#FF8A65] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <IconLock className="w-4 h-4" /> Personal
                    </button>
                    <button 
                        onClick={() => { setContext('work'); if(role==='manager') setWorkView('inbox'); }}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${context === 'work' ? 'bg-[#121110] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        <IconBriefcase className="w-4 h-4" /> Work
                    </button>
                 </div>
             </div>

             {/* 2. SUB-NAV (Only for Managers in Work Mode) */}
             {context === 'work' && role === 'manager' && (
                 <div className="flex justify-start border-b border-zinc-100">
                    <button 
                        onClick={() => setWorkView('inbox')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${workView === 'inbox' ? 'border-[#121110] text-[#121110]' : 'border-transparent text-zinc-400'}`}
                    >
                        <IconInbox className="w-4 h-4" /> Inbox
                        <span className="bg-[#D0FC42] text-[#121110] text-[10px] px-1.5 py-0.5 rounded-full">4</span>
                    </button>
                    <button 
                        onClick={() => setWorkView('mine')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${workView === 'mine' ? 'border-[#121110] text-[#121110]' : 'border-transparent text-zinc-400'}`}
                    >
                        <IconUser className="w-4 h-4" /> My Claims
                    </button>
                 </div>
             )}

             {/* 3. CONTEXT-AWARE SEARCH */}
             <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder={
                        context === 'vault' ? "Search personal expenses..." : 
                        (role === 'manager' && workView === 'inbox') ? "Search by employee..." : "Search business expenses..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#121110] focus:ring-1 focus:ring-[#121110] shadow-sm transition-all"
                />
             </div>
         </div>
      </div>

      {/* --- LIST CONTENT --- */}
      <div className="px-4 md:px-6 py-6 space-y-3">
        
        {/* Section Title */}
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2 mb-2">
            {context === 'vault' && "Private Storage"}
            {context === 'work' && role === 'employee' && "My History"}
            {context === 'work' && role === 'manager' && workView === 'inbox' && "Needs Approval"}
            {context === 'work' && role === 'manager' && workView === 'mine' && "My History"}
        </h3>

        {filteredData.length > 0 ? (
            filteredData.map((item) => (
                <ExpenseCard 
                    key={item.id} 
                    expense={item} 
                    showEmployeeName={context === 'work' && role === 'manager' && workView === 'inbox'} 
                />
            ))
        ) : (
            <div className="text-center py-20 opacity-50">
                <p className="font-bold text-zinc-400">Nothing here yet</p>
            </div>
        )}
      </div>

      {/* DEBUG TOGGLE (Remove in Prod) */}
      <div className="fixed bottom-6 right-6 z-50">
          <button onClick={() => setRole(role === 'manager' ? 'employee' : 'manager')} className="bg-black text-white text-[10px] px-3 py-1 rounded-full shadow-xl opacity-50 hover:opacity-100">
              Role: {role.toUpperCase()}
          </button>
      </div>

    </div>
  );
}