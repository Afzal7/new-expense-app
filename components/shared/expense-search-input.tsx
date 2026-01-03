const IconSearch = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

interface ExpenseSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ExpenseSearchInput = ({
  value,
  onChange,
  placeholder = "Search expenses...",
  className = "relative mb-6 md:hidden mt-4",
}: ExpenseSearchInputProps) => {
  return (
    <div className={className}>
      <div className="absolute left-4 top-1/2 -translate-x-0 -translate-y-1/2 text-zinc-400">
        <IconSearch className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none shadow-sm"
      />
    </div>
  );
};
