import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Copy } from "lucide-react";

export interface DuplicateBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  frequency?: number;
  text?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const DuplicateBadge: React.FC<DuplicateBadgeProps> = ({
  className,
  frequency = 2,
  text,
  size = "md",
  showIcon = true,
  ...props
}) => {
  const label = text || `Input ke-${frequency}`;

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-md gap-1",
    md: "text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs select-none shrink-0 tracking-tight",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showIcon && (
        <AlertTriangle
          className={cn(
            "text-amber-700 shrink-0",
            size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"
          )}
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export default DuplicateBadge;
