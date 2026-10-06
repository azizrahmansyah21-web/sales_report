import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "NEW"
  | "FOLLOW_UP"
  | "DEAL"
  | "LOST"
  | "DUPLICATE"
  | "ONLINE"
  | "OFFLINE"
  | "BRANCH"
  | "DEFAULT";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "DEFAULT",
  size = "md",
  showDot = false,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    NEW: {
      container: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
    FOLLOW_UP: {
      container: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    DEAL: {
      container: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    LOST: {
      container: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
    DUPLICATE: {
      container: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
      dot: "bg-amber-600",
    },
    ONLINE: {
      container: "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium",
      dot: "bg-emerald-500 animate-pulse",
    },
    OFFLINE: {
      container: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    BRANCH: {
      container: "bg-blue-900/10 text-blue-900 border-blue-900/20 font-semibold",
      dot: "bg-blue-800",
    },
    DEFAULT: {
      container: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-md gap-1",
    md: "text-xs px-2.5 py-1 rounded-lg gap-1.5",
  };

  const currentVariant = variantStyles[variant] || variantStyles.DEFAULT;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border select-none shrink-0",
        currentVariant.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", currentVariant.dot)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
