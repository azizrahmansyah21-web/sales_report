import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ToyotaLogoProps {
  className?: string;
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  title?: string;
  subtitle?: string;
}

export const ToyotaLogo: React.FC<ToyotaLogoProps> = ({
  className = "",
  variant = "default",
  size = "md",
  showText = false,
  title = "Agung Toyota",
  subtitle,
}) => {
  const isWhite = variant === "white";

  const sizeConfig = {
    sm: { height: 28, width: 56, imgClass: "h-7 w-auto" },
    md: { height: 36, width: 72, imgClass: "h-9 w-auto" },
    lg: { height: 48, width: 96, imgClass: "h-12 w-auto" },
    xl: { height: 60, width: 120, imgClass: "h-15 w-auto" },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Toyota Official PNG Logo (Emblem + TOYOTA + LET'S GO BEYOND) */}
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center transition-all",
          isWhite && "brightness-0 invert"
        )}
      >
        <Image
          src="/ToyotaLogo.png"
          alt="Logo Toyota - Let's Go Beyond"
          width={currentSize.width}
          height={currentSize.height}
          priority
          style={{ width: "auto", height: "auto" }}
          className={cn(currentSize.imgClass, "object-contain shrink-0")}
        />
      </div>

      {/* Optional branding text: Tulis aja 'Agung Toyota' */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black tracking-tight uppercase text-sm sm:text-base",
              isWhite ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </span>
          {subtitle && (
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium tracking-tight mt-0.5",
                isWhite ? "text-slate-300" : "text-slate-500"
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ToyotaLogo;
