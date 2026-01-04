"use client";

import { useRef, useState } from "react";

// --- Icons ---
const IconArrowLeft = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const IconPlus = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
const IconTrash = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const IconCamera = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const IconBriefcase = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconLock = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconChevronDown = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const IconX = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const IconAlert = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

// --- Helper Components ---

const CategoryPill = ({ label, icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
      active
        ? "bg-[#121110] text-white border-[#121110] shadow-sm"
        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

// --- The Line Item Card Component ---
const LineItemCard = ({
  item,
  index,
  onChange,
  onRemove,
  expanded,
  onExpand,
}) => {
  const fileInputRef = useRef(null);

  const handleUpdate = (field, value) => {
    onChange(index, { ...item, [field]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      handleUpdate("attachments", [...item.attachments, url]);
    }
  };

  const removeAttachment = (attIndex) => {
    const newAtts = item.attachments.filter((_, i) => i !== attIndex);
    handleUpdate("attachments", newAtts);
  };

  return (
    <div
      className={`bg-white rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${expanded ? "border-zinc-300 shadow-lg ring-1 ring-zinc-100" : "border-zinc-200 shadow-sm"}`}
    >
      {/* Collapsed Header (Summary) */}
      <div
        onClick={onExpand}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${expanded ? "bg-[#FF8A65] text-white border-[#FF8A65]" : "bg-zinc-100 text-zinc-500 border-zinc-200"}`}
          >
            {index + 1}
          </div>
          <div>
            <div className="font-bold text-sm text-[#121110]">
              {item.description || "New Item"}
            </div>
            {!expanded && (
              <div className="text-xs text-zinc-400">
                {item.category} • {item.date}{" "}
                {item.attachments.length > 0 &&
                  `• 📎 ${item.attachments.length}`}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[#121110]">
            ${item.amount || "0.00"}
          </span>
          <IconChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Form */}
      {expanded && (
        <div className="p-4 pt-0 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* Amount & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={item.amount}
                  onChange={(e) => handleUpdate("amount", e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-7 pr-3 font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#FF8A65] focus:border-[#FF8A65]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                Date
              </label>
              <input
                type="date"
                value={item.date}
                onChange={(e) => handleUpdate("date", e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8A65] focus:border-[#FF8A65]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Merchant name, purpose..."
              value={item.description}
              onChange={(e) => handleUpdate("description", e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8A65] focus:border-[#FF8A65]"
            />
          </div>

          {/* Category Quick Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {["Travel", "Meals", "Software", "Office", "Transport"].map(
                (cat) => (
                  <CategoryPill
                    key={cat}
                    label={cat}
                    icon={
                      cat === "Meals"
                        ? "🍔"
                        : cat === "Travel"
                          ? "✈️"
                          : cat === "Software"
                            ? "💻"
                            : cat === "Transport"
                              ? "🚕"
                              : "🖇️"
                    }
                    active={item.category === cat}
                    onClick={() => handleUpdate("category", cat)}
                  />
                )
              )}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                Receipts
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-[#FF8A65] flex items-center gap-1 hover:text-[#E64600]"
              >
                <IconPlus className="w-3 h-3" /> Add File
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {/* Add Button Box */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-300 hover:border-[#FF8A65] hover:text-[#FF8A65] transition-colors"
              >
                <IconCamera className="w-5 h-5" />
              </button>

              {/* Previews */}
              {item.attachments.map((url, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden group"
                >
                  <img
                    src={url}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeAttachment(i)}
                      className="text-white bg-red-500 rounded-full p-1"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-between items-center border-t border-zinc-100">
            <button
              type="button"
              onClick={onRemove}
              className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <IconTrash className="w-3 h-3" /> Remove Item
            </button>
            <button
              type="button"
              onClick={onExpand} // Toggle to close
              className="text-zinc-400 text-xs font-bold hover:text-[#121110]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreateExpensePage() {
  const [isPersonal, setIsPersonal] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [totalAmount, setTotalAmount] = useState(""); // The user-editable "Hero" total
  const [lineItems, setLineItems] = useState([
    {
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "Travel",
      attachments: [],
    },
  ]);

  // Calculate strict sum of line items
  const itemsSum = lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // Sync effect: If line items change and total hasn't been set (or was matching), update it?
  // Strategy: We won't auto-update to avoid overwriting user intent,
  // but we provide a "Fix" button if they mismatch.
  const isMismatch = totalAmount !== "" && parseFloat(totalAmount) !== itemsSum;

  const addLineItem = () => {
    const newItem = {
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "Meals",
      attachments: [],
    };
    setLineItems([...lineItems, newItem]);
    setExpandedIndex(lineItems.length);
  };

  const updateLineItem = (index, updatedItem) => {
    const newItems = [...lineItems];
    newItems[index] = updatedItem;
    setLineItems(newItems);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    const newItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newItems);
    setExpandedIndex(Math.max(0, index - 1));
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#FDF8F5]/90 backdrop-blur-xl border-b border-zinc-100 flex justify-between items-center px-6 py-4">
        <button className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors">
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm">New Report</span>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8">
        {/* 1. VAULT TOGGLE */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm inline-flex">
            <button
              type="button"
              onClick={() => setIsPersonal(false)}
              className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${!isPersonal ? "bg-[#121110] text-white shadow-md" : "text-zinc-400 hover:bg-zinc-50"}`}
            >
              <IconBriefcase className="w-4 h-4" /> Work
            </button>
            <button
              type="button"
              onClick={() => setIsPersonal(true)}
              className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${isPersonal ? "bg-[#FF8A65] text-white shadow-md" : "text-zinc-400 hover:bg-zinc-50"}`}
            >
              <IconLock className="w-4 h-4" /> Personal
            </button>
          </div>
        </div>

        {/* 2. THE TOTAL HERO (Editable) */}
        <div className="mb-10 text-center animate-in fade-in zoom-in duration-300">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            Total Expense
          </p>
          <div className="relative inline-block">
            <span className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 text-3xl font-bold text-zinc-300 pointer-events-none">
              $
            </span>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-center text-6xl md:text-8xl font-mono font-bold tracking-tighter placeholder:text-zinc-200 focus:outline-none"
            />
          </div>

          {/* Mismatch Warning & Auto-Fix */}
          {isMismatch && (
            <div className="mt-2 flex items-center justify-center gap-2 text-orange-500 animate-in fade-in slide-in-from-top-1">
              <IconAlert className="w-4 h-4" />
              <span className="text-xs font-bold">
                Sum is ${itemsSum.toFixed(2)}
              </span>
              <button
                onClick={() => setTotalAmount(itemsSum.toString())}
                className="text-xs font-bold underline hover:text-orange-700"
              >
                Auto-fix
              </button>
            </div>
          )}
        </div>

        {/* 3. LINE ITEM STACK */}
        <div className="space-y-4">
          {lineItems.map((item, i) => (
            <LineItemCard
              key={i}
              index={i}
              item={item}
              onChange={updateLineItem}
              onRemove={() => removeLineItem(i)}
              expanded={expandedIndex === i}
              onExpand={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
            />
          ))}
        </div>

        {/* 4. ADD BUTTON */}
        <div className="mt-6 mb-12 flex justify-center">
          <button
            onClick={addLineItem}
            className="group flex flex-col items-center gap-2 text-zinc-400 hover:text-[#121110] transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center group-hover:border-[#FF8A65] group-hover:bg-[#FFF0E0] group-hover:text-[#FF8A65] transition-all">
              <IconPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">
              Add Item
            </span>
          </button>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FDF8F5]/90 backdrop-blur-md border-t border-zinc-200 p-4 md:p-6 z-50 safe-area-pb">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button className="flex-1 bg-white border border-zinc-200 text-[#121110] py-4 rounded-2xl font-bold text-base hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm">
            Save Draft
          </button>
          <button className="flex-[2] bg-[#121110] text-white py-4 rounded-2xl font-bold text-base hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-300">
            Submit Report ({lineItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
