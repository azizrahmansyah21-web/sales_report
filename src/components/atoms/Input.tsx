"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  isPassword?: boolean;
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      leftIcon,
      rightIcon,
      prefixText,
      isPassword = false,
      hasError = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative flex items-center w-full">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        {/* Prefix text (e.g. +62) */}
        {prefixText && (
          <div
            className={cn(
              "absolute flex items-center font-semibold text-slate-500 text-sm select-none pointer-events-none",
              leftIcon ? "left-10 pl-1" : "left-3.5"
            )}
          >
            {prefixText}
          </div>
        )}

        <input
          ref={ref}
          type={resolvedType}
          disabled={disabled}
          aria-invalid={hasError}
          className={cn(
            "w-full h-11 rounded-xl bg-white text-slate-900 text-sm placeholder:text-slate-400 font-normal",
            "border transition-all duration-150 outline-none",
            "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            hasError
              ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 text-red-900"
              : "border-slate-300 hover:border-slate-400",
            leftIcon && !prefixText && "pl-11",
            leftIcon && prefixText && "pl-20",
            !leftIcon && prefixText && "pl-14",
            !leftIcon && !prefixText && "px-3.5",
            (rightIcon || isPassword) ? "pr-11" : "pr-3.5",
            className
          )}
          {...props}
        />

        {/* Password Eye Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-500" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500" />
            )}
          </button>
        )}

        {/* Custom Right Icon (if not password) */}
        {!isPassword && rightIcon && (
          <div className="absolute right-3.5 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
