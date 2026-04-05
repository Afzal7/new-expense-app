"use client";

import { useRef, useState } from "react";

// --- Icons ---
const IconArrowLeft = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconCamera = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const IconPlus = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconX = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconPen = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const IconBriefcase = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconLock = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconReceipt = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>;
const IconCheck = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17 4 12" /></svg>;
const IconSend = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconSearch = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconCreditCard = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const IconDollarSign = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

// --- Components ---

// 1. Manager Selector
const ManagerSelector = ({ selected, onSelect }) => {
  const [search, setSearch] = useState("");
  const managers = [
    { id: 1, name: "Sarah Lin", role: "VP Sales", bg: "bg-orange-100", text: "text-orange-700" },
    { id: 2, name: "David Kim", role: "Engineering Lead", bg: "bg-blue-100", text: "text-blue-700" },
    { id: 3, name: "Elena Rodriguez", role: "Finance Dir.", bg: "bg-purple-100", text: "text-purple-700" },
    { id: 4, name: "Marcus Chen", role: "Product", bg: "bg-green-100", text: "text-green-700" },
  ];
  const filtered = managers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input 
            type="text" placeholder="Search approver..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#121110] focus:ring-1 focus:ring-[#121110]"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
        {filtered.map(m => (
            <button key={m.id} onClick={() => onSelect(m.id)} className={`flex items-center gap-3 p-2 rounded-xl border transition-all text-left group ${selected === m.id ? 'bg-[#121110] border-[#121110] text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}>
                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${selected === m.id ? 'bg-white/20 text-white' : `${m.bg} ${m.text}`}`}>{m.name[0]}</div>
                <div className="flex-1"><div className="text-sm font-bold">{m.name}</div><div className={`text-[10px] ${selected === m.id ? 'text-white/60' : 'text-zinc-400'}`}>{m.role}</div></div>
                {selected === m.id && <IconCheck className="w-5 h-5 text-[#D0FC42] pr-2" />}
            </button>
        ))}
      </div>
    </div>
  );
};

// 2. Category Picker
const CategoryPicker = ({ selected, onSelect }) => {
    const categories = [
        { id: 'Meals', icon: '🍔' },
        { id: 'Travel', icon: '✈️' },
        { id: 'Software', icon: '💻' },
        { id: 'Transport', icon: '🚕' },
        { id: 'Office', icon: '📎' },
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap
                        ${selected === cat.id 
                            ? "bg-[#121110] text-white border-[#121110] shadow-md" 
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"}
                    `}
                >
                    <span>{cat.icon}</span>
                    {cat.id}
                </button>
            ))}
        </div>
    );
};

// 3. Item Card
const ItemCard = ({ item, index, onUpdate, onRemove }) => {
  const hasAttachment = !!item.attachment;
  
  return (
    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
      
      <button onClick={onRemove} className={`absolute top-3 right-3 z-20 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${hasAttachment ? 'bg-white/80 backdrop-blur text-zinc-500 hover:bg-red-50 hover:text-red-500' : 'bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-500'}`}>
        <IconX className="w-4 h-4" />
      </button>

      {hasAttachment ? (
        <div className="relative h-32 bg-zinc-100 flex items-center justify-center overflow-hidden">
            <img src={item.attachment} alt="Receipt" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 bg-[#D0FC42] text-[#121110] text-[10px] font-bold px-2 py-1 rounded-lg">Attachment Added</div>
        </div>
      ) : (
        <div className="relative h-12 bg-[#F7F7F7] border-b border-zinc-100 flex items-center px-6">
            <div className="flex items-center gap-2 text-zinc-400">
                <IconReceipt className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">No Attachment</span>
            </div>
        </div>
      )}

      <div className="p-5 space-y-5">
         <div className="space-y-1">
            <input type="text" value={item.description} onChange={(e) => onUpdate(index, 'description', e.target.value)} placeholder="Merchant / Title" className="w-full font-bold text-xl text-[#121110] placeholder:text-zinc-300 focus:outline-none bg-transparent" autoFocus={!hasAttachment} />
            <p className="text-[10px] text-zinc-400 font-medium ml-0.5">e.g. Starbucks, Uber, Team Lunch</p>
         </div>
         <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Amount</label>
                <div className="relative flex items-center h-10 border-b border-zinc-200 focus-within:border-[#FF8A65] transition-colors">
                    <span className="font-bold text-zinc-400 mr-1">$</span>
                    <input type="number" value={item.amount} onChange={(e) => onUpdate(index, 'amount', e.target.value)} className="w-full font-mono font-bold text-lg text-[#121110] bg-transparent focus:outline-none placeholder:text-zinc-200 h-full" placeholder="0.00" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Date <span className="text-[#FF8A65]">*</span></label>
                <div className="relative flex items-center h-10 border-b border-zinc-200 focus-within:border-[#FF8A65] transition-colors">
                    <input type="date" value={item.date} onChange={(e) => onUpdate(index, 'date', e.target.value)} className="w-full font-bold text-sm text-[#121110] bg-transparent focus:outline-none h-full" required />
                </div>
             </div>
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category</label>
            <CategoryPicker selected={item.category} onSelect={(cat) => onUpdate(index, 'category', cat)} />
         </div>
      </div>
    </div>
  );
};

export default function UnifiedCreatePage() {
  const fileInputRef = useRef(null);
  const [lineItems, setLineItems] = useState([]);
  
  // Submission State
  const [showSubmitSheet, setShowSubmitSheet] = useState(false);
  const [submitType, setSubmitType] = useState("reimburse");
  const [selectedManager, setSelectedManager] = useState(null);

  // Computed Total
  const totalAmount = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // Handlers
  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newItems = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36),
        attachment: URL.createObjectURL(file),
        amount: "", description: "", date: new Date().toISOString().split('T')[0], category: "Meals"
      }));
      setLineItems([...lineItems, ...newItems]);
    }
  };

  const addManualItem = () => {
    setLineItems([...lineItems, { id: Math.random().toString(36), attachment: null, amount: "", description: "", date: new Date().toISOString().split('T')[0], category: "Meals" }]);
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const removeLineItem = (index) => setLineItems(lineItems.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-48">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#FDF8F5]/90 backdrop-blur-xl border-b border-zinc-100 px-6 py-4 flex justify-between items-center">
         <button className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors"><IconArrowLeft className="w-5 h-5" /></button>
         <span className="font-bold text-sm">New Expense</span>
         <div className="w-10" />
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8">
        
        {/* INPUT BUTTONS */}
        {lineItems.length === 0 ? (
            <div className="py-12 space-y-6 animate-in fade-in zoom-in duration-300">
                <button onClick={() => fileInputRef.current?.click()} className="w-full bg-[#121110] text-white rounded-[2.5rem] p-8 shadow-xl shadow-zinc-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#D0FC42] group-hover:text-[#121110] transition-colors"><IconCamera className="w-8 h-8" /></div>
                    <div className="text-center"><h3 className="text-xl font-bold">Scan Receipt</h3><p className="text-white/60 text-sm mt-1">AI auto-fills amount & date</p></div>
                </button>
                <button onClick={addManualItem} className="w-full bg-white border border-zinc-200 rounded-[2.5rem] p-8 hover:border-[#FF8A65] active:bg-[#FFF0E0] transition-all flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-[#FF8A65] group-hover:text-white transition-colors"><IconPen className="w-7 h-7" /></div>
                    <div className="text-center"><h3 className="text-xl font-bold">Manual Entry</h3><p className="text-zinc-400 text-sm mt-1">No receipt needed</p></div>
                </button>
            </div>
        ) : (
            // COMPACT INPUT: DISTINCT PILLS (Fixed per critique)
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-4 bg-[#121110] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-800 transition-colors"
                >
                    <IconCamera className="w-4 h-4" /> Scan
                </button>
                <button 
                    onClick={addManualItem}
                    className="flex-1 py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors"
                >
                    <IconPen className="w-4 h-4" /> Manual
                </button>
            </div>
        )}

        {/* LIST OF ITEMS */}
        <div className="space-y-6">
            {lineItems.map((item, i) => (
                <ItemCard key={item.id} index={i} item={item} onUpdate={updateLineItem} onRemove={() => removeLineItem(i)} />
            ))}
        </div>
        
        {/* Spacer for Footer */}
        {lineItems.length > 0 && <div className="h-24"></div>}
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
      </div>

      {/* FOOTER ACTIONS */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#FDF8F5]/95 backdrop-blur-xl border-t border-zinc-200 z-40 transition-transform duration-300 ${lineItems.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
         
         <div className="max-w-xl mx-auto">
             {/* Total Bar */}
             <div className="px-6 py-3 border-b border-zinc-100 flex justify-between items-center bg-[#FDF8F5]">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Expense</span>
                <span className="font-mono font-bold text-xl text-[#121110]">${totalAmount.toFixed(2)}</span>
             </div>

             {/* Buttons */}
             <div className="p-6 pt-4 flex gap-3">
                 <button className="flex-1 bg-white border-2 border-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-50 hover:border-zinc-200 active:scale-[0.98] transition-all shadow-sm flex flex-col items-center gap-1">
                    <IconLock className="w-5 h-5 text-[#FF8A65] mb-1" />
                    <span>Save to Vault</span>
                 </button>
                 
                 <button 
                    onClick={() => setShowSubmitSheet(true)}
                    className="flex-1 bg-[#121110] text-white py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-300 flex flex-col items-center gap-1"
                 >
                    <IconBriefcase className="w-5 h-5 text-[#D0FC42] mb-1" />
                    <span>Submit Report</span>
                 </button>
             </div>
         </div>
      </div>

      {/* --- SUBMISSION DRAWER --- */}
      {showSubmitSheet && (
        <>
            <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSubmitSheet(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 z-50 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="flex justify-center -mt-2 mb-2"><div className="w-12 h-1.5 bg-zinc-200 rounded-full" /></div>
                    <h2 className="text-2xl font-bold text-center">Submit to Organization</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setSubmitType('reimburse')} className={`p-4 rounded-2xl border-2 text-left transition-all ${submitType === 'reimburse' ? 'bg-[#FDF8F5] border-[#121110] ring-1 ring-[#121110]' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${submitType === 'reimburse' ? 'bg-[#121110] text-white' : 'bg-zinc-100 text-zinc-400'}`}><IconDollarSign className="w-5 h-5" /></div>
                            <div className="font-bold text-sm text-[#121110]">Reimbursement</div>
                            <div className="text-[10px] text-zinc-500 font-medium">Get paid back</div>
                        </button>
                        <button onClick={() => setSubmitType('preapproval')} className={`p-4 rounded-2xl border-2 text-left transition-all ${submitType === 'preapproval' ? 'bg-[#FDF8F5] border-[#121110] ring-1 ring-[#121110]' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${submitType === 'preapproval' ? 'bg-[#121110] text-white' : 'bg-zinc-100 text-zinc-400'}`}><IconCreditCard className="w-5 h-5" /></div>
                            <div className="font-bold text-sm text-[#121110]">Pre-approval</div>
                            <div className="text-[10px] text-zinc-500 font-medium">Get permission</div>
                        </button>
                    </div>

                    <ManagerSelector selected={selectedManager} onSelect={setSelectedManager} />

                    <button disabled={!selectedManager} className="w-full bg-[#121110] text-white py-5 rounded-2xl font-bold text-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-zinc-200">
                        <span>Send Request</span>
                        <IconSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
}