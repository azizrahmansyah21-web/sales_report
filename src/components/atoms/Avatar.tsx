import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  isOnline = false,
  className,
  ...props
}) => {
  // Extract initials (max 2 characters)
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-13 h-13 text-base font-bold",
    xl: "w-16 h-16 text-lg font-bold",
  };

  const dotSizes = {
    sm: "w-2.5 h-2.5 border-[1.5px]",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-4 h-4 border-2",
  };

  return (
    <div className={cn("relative inline-block select-none", className)} {...props}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center overflow-hidden border border-slate-200/90 shadow-2xs",
          "bg-gradient-to-br from-blue-700 to-blue-900 text-white",
          sizeClasses[size]
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error to display initials fallback
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {isOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-emerald-500 border-white",
            dotSizes[size]
          )}
          title="Online / Shift Aktif"
        />
      )}
    </div>
  );
};

export default Avatar;
