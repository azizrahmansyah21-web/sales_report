import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[] | string[];
  placeholder?: string;
  hasError?: boolean;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      placeholder = "-- Pilih Unit Kendaraan --",
      hasError = false,
      leftIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={hasError}
          className={cn(
            "w-full h-11 rounded-xl bg-white text-slate-900 text-sm font-normal appearance-none cursor-pointer",
            "border transition-all duration-150 outline-none pr-10",
            "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            hasError
              ? "border-red-500 focus:border-red-600 text-red-900"
              : "border-slate-300 hover:border-slate-400",
            leftIcon ? "pl-11" : "px-3.5",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            if (typeof opt === "string") {
              return (
                <option key={opt} value={opt} className="text-slate-800">
                  {opt}
                </option>
              );
            }
            return (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="text-slate-800"
              >
                {opt.label}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Down */}
        <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
