import "@fontsource-variable/caveat";
import "@fontsource-variable/dancing-script";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/lora";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/nunito-sans";
import "@fontsource-variable/source-sans-3";
import "@fontsource/kalam/400.css";
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

const FONT_SETS = [
  { id: "bookish", name: "Bookish", note: "Lora headings, Source Sans 3 body" },
  { id: "soft", name: "Soft", note: "Fraunces headings, Nunito Sans body" },
  { id: "journal", name: "Journal", note: "Newsreader for everything" },
] as const;

const HANDS = [
  { id: "caveat", name: "Caveat" },
  { id: "kalam", name: "Kalam" },
  { id: "dancing", name: "Dancing Script" },
] as const;

type FontSetId = (typeof FONT_SETS)[number]["id"];
type HandId = (typeof HANDS)[number]["id"];

const STORAGE_KEY = "mg-ui-preview";

type Stored = { dark: boolean; fonts: FontSetId; hand: HandId };

function readStored(): Stored {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<Stored>;
    return {
      dark: parsed.dark === true,
      fonts: FONT_SETS.find((f) => f.id === parsed.fonts)?.id ?? "bookish",
      hand: HANDS.find((h) => h.id === parsed.hand)?.id ?? "caveat",
    };
  } catch {
    // Storage can be blocked or hold junk; fall back to the defaults.
    return { dark: false, fonts: "bookish", hand: "caveat" };
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
  const [fonts, setFonts] = useState<FontSetId>("bookish");
  const [hand, setHand] = useState<HandId>("caveat");

  useEffect(() => {
    const stored = readStored();
    setDark(stored.dark);
    setFonts(stored.fonts);
    setHand(stored.hand);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.fonts = fonts;
    root.dataset.hand = hand;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dark, fonts, hand }));
    } catch {
      // Not critical: the choice just will not be remembered.
    }
  }, [dark, fonts, hand]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mr-auto text-lg font-semibold">Theme preview</h1>
            <button
              type="button"
              aria-pressed={dark}
              onClick={() => setDark((v) => !v)}
              className={`${button} border border-input bg-card text-card-foreground`}
            >
              {dark ? "Dark (night paper)" : "Light"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Fonts</span>
            {FONT_SETS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={fonts === f.id}
                onClick={() => setFonts(f.id)}
                className={choiceClass(fonts === f.id)}
              >
                {f.name}
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">Handwriting</span>
            {HANDS.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-pressed={hand === h.id}
                onClick={() => setHand(h.id)}
                className={choiceClass(hand === h.id)}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
        <p className="text-muted-foreground" data-testid="theme-note">
          Parchment: cream paper, forest-green ink. Fonts:{" "}
          {FONT_SETS.find((f) => f.id === fonts)?.note}. Handwriting:{" "}
          {HANDS.find((h) => h.id === hand)?.name}.
        </p>

        <section aria-labelledby="type" className="space-y-4">
          <h2 id="type" className="text-2xl font-semibold">
            Type specimen
          </h2>
          <div className="space-y-3 rounded-lg border bg-card p-5 text-card-foreground">
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
            <button type="button" className={`$buttonbg-secondary text-secondary-foreground`}>
              Cancel
            </button>
            <button type="button" className={`$buttonbg-accent text-accent-foreground`}>
              Add flower
            </button>
            <button type="button" className={`$buttonborder border-input bg-card`}>
              Outline
            </button>
            <button type="button" className={`$buttonbg-destructive text-destructive-foreground`}>
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
            <article className="grid gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm sm:grid-cols-[8rem_1fr]">
              <img
                src="/flowers/art/anemone.webp"
                alt="Hand-coloured plate of an anemone"
                className="h-44 w-full rounded-md border object-cover object-top sm:w-32"
              />
              <div className="space-y-2">
                <p className="font-hand text-xl text-muted-foreground">12 Ekim 2026 · Kadıköy</p>
                <h3 className="text-xl font-semibold">İlk yağmurdan sonra</h3>
                <p>
                  Vapurda yan yana oturduk, çay soğuyana kadar hiç konuşmadık. Sessizlik de bir
                  anıymış.
                </p>
                <ul className="flex flex-wrap gap-2 pt-1 text-xs">
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
