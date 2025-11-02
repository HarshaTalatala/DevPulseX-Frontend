"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandSize = "sm" | "md" | "lg";

type Accent = "indigo" | "blue" | "violet" | "emerald" | "pink" | "none";

interface BrandProps {
  asLink?: boolean;
  href?: string;
  size?: BrandSize;
  className?: string;
  label?: string; // accessible label override
  accent?: Accent; // accent color for the slash/closing
  interactive?: boolean; // hover micro-interactions
}

const sizeClasses: Record<BrandSize, string> = {
  sm: "text-sm md:text-base",
  md: "text-base md:text-lg lg:text-xl",
  lg: "text-xl md:text-2xl lg:text-3xl",
};

const accentClasses: Record<Accent, string> = {
  indigo: "text-indigo-600 dark:text-indigo-400",
  blue: "text-blue-600 dark:text-blue-400",
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  pink: "text-pink-600 dark:text-pink-400",
  none: "text-gray-500 dark:text-gray-400",
};

export function Brand({
  asLink = true,
  href = "/dashboard",
  size = "md",
  className,
  label = "DevPulseX",
  accent = "indigo",
  interactive = true,
}: BrandProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-0 font-semibold tracking-tight relative",
        interactive && "group",
        sizeClasses[size],
        className
      )}
    >
      {/* Visible decorative tag; hidden to screen readers */}
      <span
        aria-hidden="true"
        className={cn(
          "font-mono font-semibold transition-colors",
          accentClasses[accent],
          interactive && "group-hover:brightness-110"
        )}
      >
        &lt;
      </span>
      <span
        aria-hidden="true"
        className={cn(
          // subtle gradient text like Vercel style
          "bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent",
          interactive && "transition-colors"
        )}
      >
        DevPulseX
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "font-mono font-semibold transition-colors",
          accentClasses[accent],
          interactive && "group-hover:brightness-110"
        )}
      >
        /&gt;
      </span>
      {/* animated underline */}
      {interactive && (
        <span
          aria-hidden="true"
          className="absolute left-0 -bottom-1 h-px w-0 bg-gray-300 dark:bg-gray-700 transition-all duration-300 group-hover:w-full"
        />
      )}
      {/* SR-only plain brand text */}
      <span className="sr-only">{label}</span>
    </span>
  );

  if (asLink) {
    return (
      <Link href={href} aria-label={label} className="whitespace-nowrap">
        {content}
      </Link>
    );
  }

  return content;
}
