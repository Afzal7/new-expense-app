const IconBriefcase = ({ className }: { className?: string }) => (
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

const IconLock = ({ className }: { className?: string }) => (
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

interface ExpenseTabControlsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  variant?: "mobile" | "desktop";
  hasOrganization?: boolean;
}

export const ExpenseTabControls = ({
  activeTab,
  onTabChange,
  variant = "desktop",
  hasOrganization = true,
}: ExpenseTabControlsProps) => {
  // Determine tab order based on organization availability
  const tabs = hasOrganization
    ? [
        {
          key: "work",
          label: "Work",
          icon: IconBriefcase,
          activeColor: "bg-[#121110]",
        },
        {
          key: "personal",
          label: "Vault",
          icon: IconLock,
          activeColor: "bg-[#FF8A65]",
        },
      ]
    : [
        {
          key: "personal",
          label: "Vault",
          icon: IconLock,
          activeColor: "bg-[#FF8A65]",
        },
        {
          key: "work",
          label: "Work",
          icon: IconBriefcase,
          activeColor: "bg-[#121110]",
        },
      ];

  if (variant === "mobile") {
    return (
      <div className="bg-white p-1 rounded-full border border-zinc-200 shadow-sm flex">
        {tabs.map(({ key, label, icon: Icon, activeColor }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === key
                ? `${activeColor} text-white shadow-md`
                : "text-zinc-500"
            }`}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm inline-flex">
      {tabs.map(({ key, label, icon: Icon, activeColor }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === key
              ? `${activeColor} text-white shadow-md`
              : "text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          <Icon className="w-4 h-4" /> {label}
        </button>
      ))}
    </div>
  );
};
