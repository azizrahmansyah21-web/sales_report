import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "interactive" | "duplicate" | "accent";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "bg-white border-slate-200/90 shadow-xs",
      subtle: "bg-slate-50/80 border-slate-200/70",
      interactive:
        "bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]",
      duplicate:
        "bg-amber-50/60 border-amber-300 shadow-2xs text-amber-950",
      accent:
        "bg-gradient-to-br from-blue-900 to-blue-800 text-white border-blue-700 shadow-md",
    };

    const paddingStyles = {
      none: "p-0",
      sm: "p-3",
      md: "p-4 md:p-5",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-colors",
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
