"use client";

import { Briefcase, Lock } from "lucide-react";

interface VaultToggleProps {
  isPersonal: boolean;
  onChange: (isPersonal: boolean) => void;
}

export function VaultToggle({ isPersonal, onChange }: VaultToggleProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm inline-flex">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
            !isPersonal
              ? "bg-[#121110] text-white shadow-md"
              : "text-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Work
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
            isPersonal
              ? "bg-[#FF8A65] text-white shadow-md"
              : "text-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <Lock className="w-4 h-4" /> Personal
        </button>
      </div>
    </div>
  );
}
