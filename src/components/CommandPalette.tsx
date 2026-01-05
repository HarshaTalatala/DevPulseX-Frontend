"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CommandItem = {
  id: string;
  title: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  items: CommandItem[];
}

export default function CommandPalette({ open, setOpen, items }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  const onSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="absolute inset-0 flex items-start justify-center pt-24 px-4">
        <div className="w-full max-w-xl rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-neutral-950/90 backdrop-blur shadow-2xl overflow-hidden">
          <div className="relative flex items-center px-3">
            <Search className="absolute left-4 h-4 w-4 text-gray-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full h-11 pl-9 pr-10 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500"
            />
            <button className="absolute right-3 h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-900" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No results</div>
            ) : (
              <ul className="py-1">
                {filtered.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSelect(item.href)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300",
                          "hover:bg-gray-50 dark:hover:bg-gray-900"
                        )}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
