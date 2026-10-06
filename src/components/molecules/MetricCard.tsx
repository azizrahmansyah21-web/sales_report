import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  isDuplicate?: boolean; // Amber highlight mode for duplicate metrics
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  isDuplicate = false,
  progress,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 md:p-5 border transition-all duration-200 relative overflow-hidden",
        isDuplicate
          ? "bg-amber-50/70 border-amber-300 text-amber-950 shadow-xs"
          : "bg-white border-slate-200/90 text-slate-900 shadow-xs",
        className
      )}
    >
      {/* Top Header: Title & Icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            isDuplicate ? "text-amber-800" : "text-slate-500"
          )}
        >
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
              isDuplicate
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className={cn(
            "text-2xl md:text-3xl font-extrabold tracking-tight",
            isDuplicate ? "text-amber-950" : "text-slate-900"
          )}
        >
          {value}
        </span>
        {progress && (
          <span className="text-xs text-slate-500 font-medium">
            / {progress.target}
          </span>
        )}
      </div>

      {/* Progress Bar (Optional) */}
      {progress && (
        <div className="mt-2 mb-1.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress.percentage >= 80 ? "bg-emerald-500" : "bg-blue-600"
              )}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1">
            <span>Pencapaian Target</span>
            <span>{progress.percentage}%</span>
          </div>
        </div>
      )}

      {/* Trend or Subtitle */}
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}

        {subtitle && (
          <span
            className={cn(
              "text-xs leading-none",
              isDuplicate ? "text-amber-700 font-medium" : "text-slate-500"
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
