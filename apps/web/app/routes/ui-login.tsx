import { SlidersHorizontal, Sprout, X } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { defaultLoginFlower, loginFlowerOfTheDay, plateNumber } from "~/lib/login-flower";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): the "herbarium sheet" login, with every detail switchable
// so the owner can compare them. Choices live in the URL so a combination can be shared.
// Username + password only, no sign-up (decision G1).

const OPTIONS = {
  yer: [
    { id: "yaprak", label: "Herbaryum yaprağı" },
    { id: "yan", label: "Yan yana" },
  ],
  tut: [
    { id: "bant", label: "Kâğıt bant" },
    { id: "kose", label: "Foto köşeliği" },
    { id: "dikis", label: "Dikiş" },
    { id: "yok", label: "Yok" },
  ],
  etiket: [
    { id: "klasik", label: "Klasik etiket" },
    { id: "sade", label: "Sade kart" },
  ],
  alan: [
    { id: "cizgi", label: "Alt çizgi" },
    { id: "kutu", label: "Kutu" },
  ],
  cicek: [
    { id: "sabit", label: "Sabit (hercai menekşe)" },
    { id: "gunun", label: "Günün çiçeği" },
  ],
} as const;

type OptionKey = keyof typeof OPTIONS;
type Choice<K extends OptionKey> = (typeof OPTIONS)[K][number]["id"];

const ORNAMENTS = [
  { id: "no", label: "Levha numarası" },
  { id: "damga", label: "Mürekkep damgası" },
  { id: "not", label: "El yazısı not" },
] as const;

type OrnamentId = (typeof ORNAMENTS)[number]["id"];

const GROUP_TITLES: Record<OptionKey, string> = {
  yer: "Yerleşim",
  tut: "Tutturma",
  etiket: "Etiket",
  alan: "Form alanları",
  cicek: "Çiçek",
};

const longDate = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

function useChoices() {
  const [params, setParams] = useSearchParams();
  const pick = <K extends OptionKey>(key: K): Choice<K> =>
    (OPTIONS[key].find((o) => o.id === params.get(key))?.id ?? OPTIONS[key][0].id) as Choice<K>;
  const ornaments = new Set<OrnamentId>(
    params.has("sus")
      ? (params.get("sus") ?? "")
          .split(",")
          .filter((o): o is OrnamentId => ORNAMENTS.some((x) => x.id === o))
      : ["no", "damga", "not"],
  );
  const set = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, value);
        return next;
      },
      { replace: true },
    );
  const toggleOrnament = (id: OrnamentId) => {
    const next = new Set(ornaments);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set("sus", [...next].join(","));
  };
  return {
    yer: pick("yer"),
    tut: pick("tut"),
    etiket: pick("etiket"),
    alan: pick("alan"),
    cicek: pick("cicek"),
    ornaments,
    set,
    toggleOrnament,
  };
}

/* ---------- mounting: how the plate is fixed to the sheet ---------- */

function Tape({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute z-10 h-7 w-24 bg-accent/80 shadow-sm backdrop-blur-[1px]", className)}
    />
  );
}

const CORNER_CLIP = {
  tl: "polygon(0 0, 100% 0, 0 100%)",
  tr: "polygon(0 0, 100% 0, 100% 100%)",
  bl: "polygon(0 0, 0 100%, 100% 100%)",
  br: "polygon(100% 0, 100% 100%, 0 100%)",
} as const;

function PhotoCorner({ at }: { at: keyof typeof CORNER_CLIP }) {
  const place = {
    tl: "-top-1 -left-1",
    tr: "-top-1 -right-1",
    bl: "-bottom-1 -left-1",
    br: "-right-1 -bottom-1",
  };
  return (
    <span
      aria-hidden="true"
      className={cn("absolute z-10 size-7 bg-foreground/75", place[at])}
      style={{ clipPath: CORNER_CLIP[at] }}
    />
  );
}

function Stitch({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={cn("absolute z-10 flex gap-1", className)}>
      <span className="h-5 w-0.5 rotate-[20deg] rounded-full bg-primary/80" />
      <span className="h-5 w-0.5 -rotate-[20deg] rounded-full bg-primary/80" />
    </span>
  );
}

function Mounted({ mode, children }: { mode: Choice<"tut">; children: ReactNode }) {
  return (
    <div className="relative mx-auto w-fit">
      {mode === "bant" && (
        <>
          <Tape className="-top-3 -left-6 -rotate-[30deg]" />
          <Tape className="-top-3 -right-6 rotate-[30deg]" />
          <Tape className="-bottom-3 -left-6 rotate-[30deg]" />
        </>
      )}
      {mode === "kose" &&
        (["tl", "tr", "bl", "br"] as const).map((at) => <PhotoCorner key={at} at={at} />)}
      {mode === "dikis" && (
        <>
          <Stitch className="top-1/4 -left-1.5" />
          <Stitch className="top-2/3 -left-1.5" />
          <Stitch className="top-1/3 -right-1.5" />
          <Stitch className="-bottom-2 left-1/2" />
        </>
      )}
      {children}
    </div>
  );
}

/* ---------- ornaments ---------- */

function Stamp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
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
      <text x="60" y="66" textAnchor="middle" fill="currentColor" fontSize="16" fontStyle="italic">
        ✿
      </text>
    </svg>
  );
}

/* ---------- the label with the form ---------- */

function Field({
  id,
  label,
  type,
  autoComplete,
  underline,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete: string;
  underline: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        className={cn(
          underline &&
            "h-9 rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus-visible:border-b-2 focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent",
        )}
      />
    </div>
  );
}

function LoginForm({ underline }: { underline: boolean }) {
  const onSubmit = (event: FormEvent) => event.preventDefault();
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <Field
        id="login-username"
        label="Kullanıcı adı"
        autoComplete="username"
        underline={underline}
      />
      <Field
        id="login-password"
        label="Şifre"
        type="password"
        autoComplete="current-password"
        underline={underline}
      />
      <Button type="submit" className="mt-1 w-full">
        Giriş yap
      </Button>
    </form>
  );
}

type FlowerShown = ReturnType<typeof defaultLoginFlower>;

function ClassicLabel({
  flower,
  plate,
  underline,
}: {
  flower: FlowerShown;
  plate?: string;
  underline: boolean;
}) {
  return (
    <div
      className="border-2 border-foreground/70 bg-card p-4 text-card-foreground shadow-card"
      data-testid="label"
    >
      <h1 className="border-b border-foreground/40 pb-2 text-center text-xs font-semibold tracking-[0.2em] uppercase">
        Memory Garden Herbaryumu
      </h1>
      <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 py-3 text-sm">
        <dt className="text-muted-foreground">Bitki</dt>
        <dd>
          <span className="font-heading font-semibold">{flower.name}</span>{" "}
          <span className="text-muted-foreground italic">{flower.path.replace(" › ", " ")}</span>
        </dd>
        <dt className="text-muted-foreground">Anlamı</dt>
        <dd>{flower.meaning}</dd>
        <dt className="text-muted-foreground">Tarih</dt>
        <dd>{longDate.format(new Date())}</dd>
        {plate && (
          <>
            <dt className="text-muted-foreground">Levha</dt>
            <dd>No. {plate}</dd>
          </>
        )}
      </dl>
      <div className="border-t border-foreground/40 pt-4">
        <LoginForm underline={underline} />
      </div>
    </div>
  );
}

function PlainLabel({ flower, underline }: { flower: FlowerShown; underline: boolean }) {
  return (
    <div
      className="rounded-lg border bg-card p-6 text-card-foreground shadow-card"
      data-testid="label"
    >
      <h1 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sprout className="size-4" aria-hidden="true" />
        </span>
        Memory Garden
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-heading text-foreground">{flower.name}</span> · {flower.meaning}
      </p>
      <div className="mt-5">
        <LoginForm underline={underline} />
      </div>
    </div>
  );
}

/* ---------- the switchable detail panel ---------- */

function DetailPanel({ choices }: { choices: ReturnType<typeof useChoices> }) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <Button className="fixed right-4 bottom-4 z-30 shadow-lift" onClick={() => setOpen(true)}>
        <SlidersHorizontal aria-hidden="true" />
        Ayrıntılar
      </Button>
    );
  }
  return (
    <aside
      aria-label="Ayrıntı seçenekleri"
      className="fixed inset-x-2 bottom-2 z-30 max-h-[55svh] overflow-auto rounded-lg border bg-popover p-3 text-popover-foreground shadow-lift md:inset-x-auto md:right-4 md:bottom-4 md:w-80"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Ayrıntılar</p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" render={<Link to="/ui" />}>
            ← Önizleme
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Paneli kapat"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>
      {(Object.keys(OPTIONS) as OptionKey[]).map((key) => (
        <fieldset key={key} className="mb-2">
          <legend className="mb-1 text-xs text-muted-foreground">{GROUP_TITLES[key]}</legend>
          <div className="flex flex-wrap gap-1">
            {OPTIONS[key].map((o) => (
              <Button
                key={o.id}
                size="xs"
                variant={choices[key] === o.id ? "default" : "outline"}
                aria-pressed={choices[key] === o.id}
                onClick={() => choices.set(key, o.id)}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset>
        <legend className="mb-1 text-xs text-muted-foreground">Süsler</legend>
        <div className="flex flex-wrap gap-1">
          {ORNAMENTS.map((o) => (
            <Button
              key={o.id}
              size="xs"
              variant={choices.ornaments.has(o.id) ? "default" : "outline"}
              aria-pressed={choices.ornaments.has(o.id)}
              onClick={() => choices.toggleOrnament(o.id)}
            >
              {o.label}
            </Button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}

/* ---------- page ---------- */

export default function UiLogin() {
  const choices = useChoices();
  // "Today" is only known in the browser; render the fixed flower until mounted.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const flower =
    choices.cicek === "gunun" && today ? loginFlowerOfTheDay(today) : defaultLoginFlower();
  const plate = choices.ornaments.has("no") ? plateNumber(flower) : undefined;
  const underline = choices.alan === "cizgi";

  const plateImage = (
    <figure className="grid gap-3">
      <Mounted mode={choices.tut}>
        <img
          src={flower.artwork.src}
          alt={`${flower.name}: Curtis çizimi`}
          className="block max-h-[45svh] w-auto max-w-full border border-foreground/10 shadow-card md:max-h-[64svh]"
        />
      </Mounted>
      {choices.ornaments.has("not") && (
        <figcaption className="text-center font-hand text-2xl text-muted-foreground">
          Her anı bir çiçek…
        </figcaption>
      )}
    </figure>
  );

  const label =
    choices.etiket === "klasik" ? (
      <ClassicLabel flower={flower} plate={plate} underline={underline} />
    ) : (
      <PlainLabel flower={flower} underline={underline} />
    );

  return (
    <main
      className="flex min-h-svh items-start justify-center p-4 pb-[60svh] md:items-center md:p-10 md:pb-10"
      data-layout={choices.yer}
      data-mount={choices.tut}
    >
      <div className="relative w-full max-w-4xl rounded-sm border bg-card p-6 shadow-card md:p-10">
        {choices.yer === "yaprak" ? (
          // Like a real herbarium sheet: the plate fills the sheet, the label sits in the
          // bottom-right corner. The plate column leaves room so the label never covers it.
          <div className="grid gap-6 md:block md:min-h-[64svh]">
            <div className="md:pr-80">{plateImage}</div>
            <div className="w-full md:absolute md:right-8 md:bottom-8 md:w-80">{label}</div>
          </div>
        ) : (
          <div className="grid items-center gap-8 md:grid-cols-[1fr_20rem]">
            {plateImage}
            {label}
          </div>
        )}

        {choices.ornaments.has("damga") && (
          <Stamp
            className={cn(
              "absolute size-20 md:size-28",
              // On phones the stamp would crowd the taped corner, so it only shows on wide screens.
              choices.yer === "yaprak" ? "hidden md:top-8 md:right-10 md:block" : "-top-6 -right-4",
            )}
          />
        )}
      </div>
      <DetailPanel choices={choices} />
    </main>
  );
}
