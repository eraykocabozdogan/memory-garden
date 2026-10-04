"use client";

import { BookOpenText, Images, Moon, Sun, SunMoon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ThemeMode = "system" | "light" | "dark";

function applyTheme(mode: ThemeMode) {
  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = mode;
}

export function ThemeControl() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (document.documentElement.dataset.theme === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const nextMode: Record<ThemeMode, ThemeMode> = {
    system: "light",
    light: "dark",
    dark: "system",
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-testid="theme-toggle"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Temayı değiştir: sistem, açık veya koyu"
            onClick={() => {
              const current =
                (document.documentElement.dataset.theme as ThemeMode | undefined) ?? "system";
              const next = nextMode[current];
              localStorage.setItem("ikimize-theme", next);
              applyTheme(next);
            }}
          />
        }
      >
        <span className="theme-icon theme-icon-system"><SunMoon /></span>
        <span className="theme-icon theme-icon-light"><Sun /></span>
        <span className="theme-icon theme-icon-dark"><Moon /></span>
      </TooltipTrigger>
      <TooltipContent>Sistem · Açık · Koyu</TooltipContent>
    </Tooltip>
  );
}

export function Brand() {
  return (
    <div className="brand-mark" aria-label="İkimize">
      <span>ikimize</span>
      <span className="brand-dot">.</span>
    </div>
  );
}

export type MemorySection = "memories" | "diary";

type MemoryNavigationProps = {
  section: MemorySection;
};

export function DesktopSidebar({ section }: MemoryNavigationProps) {
  return (
    <aside className="desktop-sidebar">
      <Brand />
      <nav className="mt-14 space-y-2" aria-label="Ana menü">
        <Link
          href="/memories"
          className={section === "memories" ? "side-link side-link-active" : "side-link"}
          aria-current={section === "memories" ? "page" : undefined}
        >
          <Images />
          <span>Anılar</span>
        </Link>
        <Link
          href="/diary"
          className={section === "diary" ? "side-link side-link-active" : "side-link"}
          aria-current={section === "diary" ? "page" : undefined}
        >
          <BookOpenText />
          <span>Günlük</span>
        </Link>
      </nav>
      <div className="mt-auto border-t border-border/70 pt-5">
        <p className="font-handwriting text-xl text-accent-ink">Her gün, biraz daha biz.</p>
        <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
          İkimize
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({ section }: MemoryNavigationProps) {
  return (
    <nav className="mobile-nav" aria-label="Mobil ana menü">
      <Link
        href="/memories"
        className={section === "memories" ? "mobile-link mobile-link-active" : "mobile-link"}
        aria-current={section === "memories" ? "page" : undefined}
      >
        <Images />
        <span>Anılar</span>
      </Link>
      <Link
        href="/diary"
        className={section === "diary" ? "mobile-link mobile-link-active" : "mobile-link"}
        aria-current={section === "diary" ? "page" : undefined}
      >
        <BookOpenText />
        <span>Günlük</span>
      </Link>
    </nav>
  );
}
