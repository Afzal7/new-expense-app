"use client";

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
const IconReceipt = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17V7" />
  </svg>
);
const IconMore = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);
const IconPaperclip = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18.1 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconFile = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// --- Components ---

const AttachmentChip = ({ url, type }) => {
  // Mock logic: if it looks like an image URL, show preview, else show icon
  const isImage =
    url.includes("unsplash") || url.match(/\.(jpeg|jpg|gif|png)$/);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden hover:border-[#FF8A65] hover:shadow-sm transition-all active:scale-95"
    >
      {isImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ backgroundImage: `url(${url})` }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </>
      ) : (
        <IconFile className="w-5 h-5 text-zinc-400 group-hover:text-[#FF8A65]" />
      )}
    </a>
  );
};

const AuditTimeline = ({ logs }) => (
  <div className="relative border-l-2 border-zinc-100 ml-3 space-y-8 py-2">
    {logs.map((log, i) => (
      <div key={i} className="relative pl-6 md:pl-8">
        <div
          className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${log.action === "created" ? "bg-zinc-300" : "bg-[#D0FC42]"}`}
        />
        <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
          {new Date(log.date).toLocaleDateString()} •{" "}
          {new Date(log.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="font-bold text-sm text-[#121110]">
          {log.action === "created" && "Expense Draft Created"}
          {log.action === "submitted" && "Submitted for Approval"}
          {log.action === "approved" && "Approved by Manager"}
        </div>
        <div className="text-xs md:text-sm text-zinc-500 mt-0.5">
          by <span className="text-[#121110] font-medium">{log.actorId}</span>
        </div>
      </div>
    ))}
  </div>
);

export default function ExpenseDetailPage() {
  const expense = {
    _id: "1",
    totalAmount: 1250.0,
    state: "approved",
    description: "Trip to SF: Flights & Hotel",
    lineItems: [
      {
        amount: 850.0,
        category: "Travel",
        description: "United Airlines",
        date: "2024-10-24",
        attachments: [
          "https://images.unsplash.com/photo-1544984243-ec36126a430a?auto=format&fit=crop&q=80&w=200", // Image receipt
        ],
      },
      {
        amount: 400.0,
        category: "Lodging",
        description: "Hyatt Regency",
        date: "2024-10-25",
        attachments: [
          "https://example.com/invoice.pdf", // Generic file
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=200", // Another image
        ],
      },
    ],
    auditLog: [
      {
        action: "approved",
        date: "2024-10-25T14:00:00Z",
        actorId: "Sarah (Manager)",
      },
      {
        action: "submitted",
        date: "2024-10-24T16:30:00Z",
        actorId: "Alex (You)",
      },
      {
        action: "created",
        date: "2024-10-24T10:00:00Z",
        actorId: "Alex (You)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-24 safe-area-pb">
      {/* Sticky Mobile Header */}
      <div className="sticky top-0 z-40 bg-[#FDF8F5]/90 backdrop-blur-md border-b border-zinc-100 flex justify-between items-center px-6 py-4 md:hidden">
        <button className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors">
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm">Expense Details</span>
        <button className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors">
          <IconMore className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {/* Desktop Back Button */}
        <button className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-[#121110] font-bold text-sm mb-8 transition-colors">
          <IconArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* LEFT COL: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-zinc-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <div className="inline-block px-3 py-1 bg-[#F0FDF4] text-emerald-600 border border-emerald-100 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
                    Approved
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-[#121110]">
                    {expense.description}
                  </h1>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0">
                  <div className="text-zinc-400 text-xs md:text-sm font-medium mb-1">
                    Total Amount
                  </div>
                  <div className="font-mono text-3xl md:text-4xl font-bold tracking-tighter text-[#121110]">
                    ${expense.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Desktop Action Bar */}
              <div className="hidden md:flex gap-3 border-t border-zinc-100 pt-6">
                <button className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold py-3 rounded-xl text-sm transition-colors border border-zinc-200">
                  Edit
                </button>
                <button className="flex-1 bg-[#121110] text-white font-bold py-3 rounded-xl text-sm hover:bg-zinc-800 transition-colors shadow-lg">
                  Download PDF
                </button>
              </div>
            </div>

            {/* Line Items with Attachments */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden relative">
              {/* Decorative Top Border */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBsMTAtMTAgMTAgMTB6IiBmaWxsPSIjRkRGOEY1Ii8+PC9zdmc+')] opacity-50"></div>

              <div className="p-6 md:p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <IconReceipt className="w-5 h-5 text-zinc-400" /> Line Items
                </h3>

                <div className="space-y-6">
                  {expense.lineItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row gap-4 border-b border-zinc-50 last:border-0 pb-6 last:pb-0"
                    >
                      {/* Icon & Details */}
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 bg-[#FDF8F5] rounded-xl flex-shrink-0 flex items-center justify-center text-xl border border-zinc-100">
                          {item.category === "Travel" ? "✈️" : "🏨"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-[#121110]">
                                {item.description}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {item.date} • {item.category}
                              </div>
                            </div>
                            <div className="font-mono font-bold text-lg md:hidden block">
                              ${item.amount.toFixed(2)}
                            </div>
                          </div>

                          {/* Attachments Area */}
                          {item.attachments && item.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.attachments.map((url, idx) => (
                                <AttachmentChip key={idx} url={url} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Amount */}
                      <div className="hidden md:block text-right">
                        <div className="font-mono font-bold text-lg">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: Meta & History */}
          <div className="space-y-6">
            {/* Audit Log Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Activity</h3>
              <AuditTimeline logs={expense.auditLog} />
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Meta Data</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ID</span>
                  <span className="font-mono font-bold">#EXP-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Merchant</span>
                  <span className="font-bold">Multiple</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200 p-4 md:hidden flex gap-3 z-50">
        <button className="flex-1 bg-zinc-100 text-zinc-600 font-bold py-3.5 rounded-xl text-sm active:bg-zinc-200 transition-colors">
          Edit
        </button>
        <button className="flex-1 bg-[#121110] text-white font-bold py-3.5 rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all">
          Download PDF
        </button>
      </div>
    </div>
  );
}
