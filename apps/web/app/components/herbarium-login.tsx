import { scientificName } from "@memory-garden/shared/flowers/catalog";
import { type CSSProperties, type FormEvent, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginFlowerOfTheDay } from "~/lib/login-flower";
import { cn } from "~/lib/utils";

// The login screen (decision 8-6b): a herbarium sheet. Today's flower plate is taped to the
// sheet on the left; a museum-style label on the right names it and holds the form. Username
// + password only, no sign-up (decision G1). The form is not wired to auth yet (stage 1).
// Text motion follows decision 9: the label's rows rise softly in turn, and the handwritten
// line is written on. Both stop at "reduce motion" (app/text-anim.css).

const longDate = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

function Tape({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute z-10 h-7 w-24 bg-accent/80 shadow-sm", className)}
    />
  );
}

function Stamp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      data-testid="stamp"
      className={cn("pointer-events-none size-28 -rotate-12 text-primary opacity-60", className)}
    >
      <defs>
        <path id="stamp-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fill="currentColor" fontSize="11.5" fontWeight="600" letterSpacing="2.2">
        <textPath href="#stamp-ring">MEMORY GARDEN · HERBARYUM · 2026 ·</textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fill="currentColor" fontSize="16">
        ✿
      </text>
    </svg>
  );
}

function Field(props: { id: string; label: string; type?: string; autoComplete: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      {/* Underlined like writing on a page; the bottom border keeps 3:1 contrast (--input). */}
      <Input
        id={props.id}
        type={props.type}
        autoComplete={props.autoComplete}
        required
        className="h-9 rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus-visible:border-b-2 focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent"
      />
    </div>
  );
}

export function HerbariumLogin({ onSubmit }: { onSubmit?: (event: FormEvent) => void }) {
  // The login route is client-rendered (SPA), so "today" is known on the first render.
  const [today] = useState(() => new Date());
  const flower = loginFlowerOfTheDay(today);

  return (
    <main className="flex min-h-svh items-start justify-center p-4 md:items-center md:p-10">
      <div className="relative w-full max-w-4xl rounded-sm border bg-card p-6 shadow-card md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_20rem]">
          <figure className="grid gap-3">
            <div className="relative mx-auto w-fit">
              <Tape className="-top-3 -left-6 -rotate-[30deg]" />
              <Tape className="-top-3 -right-6 rotate-[30deg]" />
              <Tape className="-bottom-3 -left-6 rotate-[30deg]" />
              <img
                src={flower.artwork.src}
                alt={`${flower.name}: Curtis çizimi`}
                className="block max-h-[45svh] w-auto max-w-full border border-foreground/10 shadow-card md:max-h-[64svh]"
              />
            </div>
            <figcaption className="text-center font-hand text-2xl text-muted-foreground">
              <span className="anim-elyazisi">Her anı bir çiçek…</span>
            </figcaption>
          </figure>

          <div
            className="anim-beliris border-2 border-foreground/70 bg-card p-4 text-card-foreground shadow-card"
            data-testid="label"
          >
            <h1
              style={{ "--i": 0 } as CSSProperties}
              className="border-b border-foreground/40 pb-2 text-center text-xs font-semibold tracking-[0.2em] uppercase"
            >
              Memory Garden Herbaryumu
            </h1>
            <dl
              style={{ "--i": 1 } as CSSProperties}
              className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 py-3 text-sm"
            >
              <dt className="text-muted-foreground">Bitki</dt>
              <dd>
                <span className="font-heading font-semibold">{flower.name}</span>{" "}
                <span className="text-muted-foreground italic">{scientificName(flower)}</span>
              </dd>
              <dt className="text-muted-foreground">Anlamı</dt>
              <dd>{flower.meaning}</dd>
              <dt className="text-muted-foreground">Tarih</dt>
              <dd>{longDate.format(today)}</dd>
            </dl>
            <form
              style={{ "--i": 2 } as CSSProperties}
              className="grid gap-4 border-t border-foreground/40 pt-4"
              onSubmit={onSubmit ?? ((event) => event.preventDefault())}
            >
              <Field id="login-username" label="Kullanıcı adı" autoComplete="username" />
              <Field
                id="login-password"
                label="Şifre"
                type="password"
                autoComplete="current-password"
              />
              <Button type="submit" className="mt-1 w-full">
                Giriş yap
              </Button>
            </form>
          </div>
        </div>

        {/* Hangs off the sheet's top-right corner so it never covers the label's title; on
            phones it would crowd the taped corner, so it only shows on wide screens. */}
        <Stamp className="absolute -top-10 -right-10 hidden size-24 md:block" />
      </div>
    </main>
  );
}
