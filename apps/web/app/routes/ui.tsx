import { useEffect, useState } from "react";

import type { Route } from "./+types/ui";

export function meta(_: Route.MetaArgs) {
  return [{ title: "UI kitchen sink · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2). Shows every token on realistic pieces so the theme can be
// judged on real screens. Not part of the product; remove or hide once the design is settled.

const PAIRS = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "destructive-foreground"],
] as const;

const STORAGE_KEY = "mg-ui-preview";

type Stored = { dark: boolean; grain: boolean };

function readStored(): Stored {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<Stored>;
    // Grain is on by default for now; only an explicit "false" turns it off.
    return { dark: parsed.dark === true, grain: parsed.grain !== false };
  } catch {
    // Storage can be blocked or hold junk; fall back to the defaults.
    return { dark: false, grain: true };
  }
}

const button =
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const choiceClass = (active: boolean) =>
  `${button} border ${
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input bg-card text-card-foreground"
  }`;

export default function Ui() {
  const [dark, setDark] = useState(false);
  const [grain, setGrain] = useState(true);

  useEffect(() => {
    const stored = readStored();
    setDark(stored.dark);
    setGrain(stored.grain);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.grain = grain ? "on" : "off";
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dark, grain }));
    } catch {
      // Not critical: the choice just will not be remembered.
    }
  }, [dark, grain]);

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="mr-auto text-lg font-semibold">Theme preview</h1>
          <button
            type="button"
            aria-pressed={grain}
            onClick={() => setGrain((v) => !v)}
            className={choiceClass(grain)}
          >
            Paper grain: {grain ? "on" : "off"}
          </button>
          <button
            type="button"
            aria-pressed={dark}
            onClick={() => setDark((v) => !v)}
            className={choiceClass(false)}
          >
            {dark ? "Dark (night paper)" : "Light"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
        <p className="text-muted-foreground" data-testid="theme-note">
          Parchment colors, Lora + Source Sans 3 + Caveat, Paper shape (medium corners, light warm
          shadow, airy).
        </p>

        <section aria-labelledby="type" className="space-y-4">
          <h2 id="type" className="text-2xl font-semibold">
            Type specimen
          </h2>
          <div className="flex flex-col gap-stack rounded-lg border bg-card p-card text-card-foreground shadow-card">
            <h3 className="text-4xl font-semibold">Bahçemizde ilk çiçek</h3>
            <h4 className="text-xl font-medium">İlk yağmurdan sonra, vapurda</h4>
            <p className="max-w-prose text-base leading-relaxed">
              Pijamalı hasta yağız şoföre çabucak güvendi. Ğüzel şiir ışığında İstanbul; ÇÖĞŞÜİ
              çöğşüı. Bir anıyı yazmak, onu ikinci kez yaşamaktır.
            </p>
            <p className="max-w-prose text-sm text-muted-foreground">
              Small text: 12 Ekim 2026, Kadıköy · 18°C · ₺120 çay ve simit.
            </p>
            <p className="font-hand text-3xl text-primary">Seni düşündüğüm bir akşam…</p>
          </div>
        </section>

        <section aria-labelledby="swatches" className="space-y-4">
          <h2 id="swatches" className="text-2xl font-semibold">
            Tokens
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PAIRS.map(([bg, fg]) => (
              <li
                key={bg}
                className="rounded-lg border p-3 text-sm"
                style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
              >
                <span className="block text-lg font-semibold">Aa</span>
                {bg}
              </li>
            ))}
            {(["border", "input", "ring"] as const).map((token) => (
              <li
                key={token}
                className="rounded-lg border bg-card p-3 text-sm text-card-foreground"
              >
                <span
                  className="mb-2 block h-5 rounded"
                  style={{ background: `var(--${token})` }}
                  aria-hidden="true"
                />
                {token}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="reading" className="space-y-3">
          <h2 id="reading" className="text-2xl font-semibold">
            Reading
          </h2>
          <p className="max-w-prose text-lg">
            Bahçedeki ilk kar çiçeği, o kış sabahı yazdığımız notun hemen yanında açmıştı.
          </p>
          <p className="max-w-prose text-muted-foreground">
            Secondary text sits on the same paper. Ğüzel şiir ışığında İstanbul.
          </p>
          <a className="text-primary underline underline-offset-4" href="#reading">
            A link in the primary ink
          </a>
        </section>

        <section aria-labelledby="controls" className="space-y-4">
          <h2 id="controls" className="text-2xl font-semibold">
            Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={`${button} bg-primary text-primary-foreground`}>
              Save memory
            </button>
            <button type="button" className={`${button} bg-secondary text-secondary-foreground`}>
              Cancel
            </button>
            <button type="button" className={`${button} bg-accent text-accent-foreground`}>
              Add flower
            </button>
            <button type="button" className={`${button} border border-input bg-card`}>
              Outline
            </button>
            <button
              type="button"
              className={`${button} bg-destructive text-destructive-foreground`}
            >
              Delete
            </button>
          </div>
          <div className="grid max-w-md gap-2">
            <label htmlFor="ui-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="ui-title"
              placeholder="A name for this memory"
              className="h-10 rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div
            role="menu"
            aria-label="Sample menu"
            className="w-56 rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-lift"
          >
            <div
              role="menuitem"
              tabIndex={-1}
              className="rounded-md bg-accent px-3 py-2 text-accent-foreground"
            >
              Edit memory
            </div>
            <div role="menuitem" tabIndex={-1} className="rounded-md px-3 py-2">
              Move to trash
            </div>
          </div>
        </section>

        <section aria-labelledby="cards" className="space-y-4">
          <h2 id="cards" className="text-2xl font-semibold">
            Memory card and app shell
          </h2>
          <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
            <nav
              aria-label="Sample sidebar"
              className="rounded-lg border bg-sidebar p-3 text-sidebar-foreground"
            >
              <ul className="space-y-1 text-sm">
                <li className="rounded-md bg-sidebar-accent px-3 py-2 font-medium text-sidebar-accent-foreground">
                  Memories
                </li>
                <li className="px-3 py-2">Journal</li>
                <li className="px-3 py-2">Garden</li>
                <li className="px-3 py-2">Special days</li>
              </ul>
            </nav>
            <article className="grid gap-4 rounded-lg border bg-card p-card text-card-foreground shadow-card sm:grid-cols-[8rem_1fr]">
              <img
                src="/flowers/art/anemone.webp"
                alt="Hand-coloured plate of an anemone"
                className="h-44 w-full rounded-md border object-cover object-top sm:w-32"
              />
              <div className="flex flex-col gap-stack">
                <p className="font-hand text-xl text-muted-foreground">12 Ekim 2026 · Kadıköy</p>
                <h3 className="text-xl font-semibold">İlk yağmurdan sonra</h3>
                <p>
                  Vapurda yan yana oturduk, çay soğuyana kadar hiç konuşmadık. Sessizlik de bir
                  anıymış.
                </p>
                <ul className="flex flex-wrap gap-2 text-xs">
                  <li className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                    vapur
                  </li>
                  <li className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
                    yağmur
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
