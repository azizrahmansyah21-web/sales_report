import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  requiredBadge?: boolean; // Show "WAJIB" badge like in Toyota mockup
  optionalBadge?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  requiredBadge = false,
  optionalBadge = false,
  hint,
  error,
  children,
  className,
  id,
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 tracking-wide uppercase flex items-center gap-1"
        >
          {label}
          {required && !requiredBadge && (
            <span className="text-[#dc0019] text-sm leading-none" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {requiredBadge && (
          <span className="text-[10px] font-bold text-[#dc0019] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded tracking-wider uppercase">
            WAJIB
          </span>
        )}

        {optionalBadge && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-wider uppercase">
            OPSIONAL
          </span>
        )}
      </div>

      {children}

      {hint && !error && (
        <p className="text-xs text-slate-500 leading-normal">{hint}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1 leading-normal">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
