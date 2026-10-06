"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ToastAlertProps {
  type?: "success" | "warning" | "error" | "info";
  title?: string;
  message: string;
  isDismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({
  type = "success",
  title,
  message,
  isDismissible = true,
  onDismiss,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const config = {
    success: {
      container: "bg-emerald-50 border-emerald-300 text-emerald-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      closeBtn: "text-emerald-700 hover:bg-emerald-100",
    },
    warning: {
      container: "bg-amber-50 border-amber-300 text-amber-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      closeBtn: "text-amber-700 hover:bg-amber-100",
    },
    error: {
      container: "bg-red-50 border-red-300 text-red-950",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
      closeBtn: "text-red-700 hover:bg-red-100",
    },
    info: {
      container: "bg-blue-50 border-blue-300 text-blue-950",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      closeBtn: "text-blue-700 hover:bg-blue-100",
    },
  }[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border shadow-2xs transition-all duration-200",
        config.container,
        className
      )}
    >
      <div className="mt-0.5">{config.icon}</div>

      <div className="flex-1 text-xs md:text-sm">
        {title && <h5 className="font-bold leading-tight mb-0.5">{title}</h5>}
        <p className="leading-snug">{message}</p>
      </div>

      {isDismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            "p-1 rounded-lg transition-colors -mr-1 -mt-0.5 shrink-0",
            config.closeBtn
          )}
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ToastAlert;
