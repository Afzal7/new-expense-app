"use client";

import { AlertCircle } from "lucide-react";

interface ExpenseHeroProps {
  amount: number;
  onChange: (amount: number) => void;
  calculatedTotal: number;
  currency?: string;
  readOnly?: boolean;
}

export function ExpenseHero({
  amount,
  onChange,
  calculatedTotal,
  currency = "$",
  readOnly = false,
}: ExpenseHeroProps) {
  // Check for mismatch (only if we have a manually entered amount and items)
  // We consider it a mismatch if they differ by more than 0.01
  const isMismatch =
    amount > 0 &&
    calculatedTotal > 0 &&
    Math.abs(amount - calculatedTotal) > 0.01;

  return (
    <div className="px-10 mb-10 text-center animate-in fade-in zoom-in duration-300">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
        Total Expense
      </p>
      <div className="relative inline-block">
        <span className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground/20 pointer-events-none">
          {currency}
        </span>
        <input
          type="number"
          value={amount || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          readOnly={readOnly}
          className={`w-full bg-transparent text-center text-6xl md:text-8xl font-mono font-bold tracking-tighter text-foreground placeholder:text-muted-foreground/20 focus:outline-none ${
            readOnly ? "cursor-not-allowed opacity-80" : ""
          }`}
        />
      </div>

      {/* Mismatch Warning & Auto-Fix */}
      {!readOnly && isMismatch && (
        <div className="mt-2 flex items-center justify-center gap-2 text-secondary animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-bold">
            Sum is ${calculatedTotal.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => onChange(calculatedTotal)}
            className="text-xs font-bold underline hover:text-secondary/80 transition-colors"
          >
            Auto-fix
          </button>
        </div>
      )}
    </div>
  );
}
