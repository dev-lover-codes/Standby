import React from "react";

interface GafferTapeProps {
  label: string;
  className?: string;
}

export function GafferTape({ label, className = "" }: GafferTapeProps) {
  return (
    <div className={`my-4 flex items-center gap-3 ${className}`}>
      <span className="gaffer-tape select-none text-xs sm:text-sm" aria-hidden="true">
        {label}
      </span>
      <hr className="flex-1 border-t border-[var(--line)]" />
    </div>
  );
}
