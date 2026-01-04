"use client";

import { Briefcase, Lock } from "lucide-react";

interface VaultToggleProps {
  isPersonal: boolean;
  onChange: (isPersonal: boolean) => void;
}

export function VaultToggle({ isPersonal, onChange }: VaultToggleProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-card p-1.5 rounded-full border border-border shadow-sm inline-flex">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
            !isPersonal
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Work
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
            isPersonal
              ? "bg-secondary text-secondary-foreground shadow-md"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Lock className="w-4 h-4" /> Personal
        </button>
      </div>
    </div>
  );
}
