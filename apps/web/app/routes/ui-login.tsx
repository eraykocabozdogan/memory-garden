import { cutoutFlowerIds } from "@memory-garden/shared/flowers/catalog";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { SilkPlate } from "~/components/art/silk-plate";
import { HerbariumLogin } from "~/components/herbarium-login";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): the login background is Curtis on silk (owner's pick over
// React Bits Silk, Grid Motion and a 3D flower). The flowers are now cut out of their plate paper
// (`pnpm flowers:cutout`), so the yellow paper no longer fills the screen. Two views remain to
// compare: a dense bouquet of 63 cut-outs (`pnpm flowers:bouquet`), a looser one of 31 that lets
// the silk show between the flowers, or one large cut-out flower on bare silk. "Başka çiçek"
// walks through the cut-outs for that last one. The layer is `inert` + aria-hidden, so nothing in
// it takes focus. "Sayfayı gizle" hides the sheet.

const BACKGROUNDS = [
  { id: "yok", name: "Yok" },
  { id: "ipek-buket", name: "İpek + yoğun buket" },
  { id: "ipek-seyrek", name: "İpek + seyrek buket" },
  { id: "ipek-tek", name: "İpek + tek çiçek" },
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export default function UiLogin() {
  const [params, setParams] = useSearchParams();
  const bg: BackgroundId = BACKGROUNDS.find((b) => b.id === params.get("bg"))?.id ?? "ipek-buket";
  const sheetHidden = params.get("sayfa") === "gizli";
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme !== "dark";
  // A random flower on every visit (owner's choice over "flower of the day" for the background).
  // `?cicek=<id>` pins one instead, so a given flower can be looked at and linked to.
  const [random] = useState(
    () => cutoutFlowerIds[Math.floor(Math.random() * cutoutFlowerIds.length)] ?? "rosa-kirmizi",
  );
  const pinned = params.get("cicek");
  const flowerId = pinned && cutoutFlowerIds.includes(pinned) ? pinned : random;
  const plate = `/flowers/cutout/${flowerId}.webp`;
  // "Reduce motion": draw one frame and stop.
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const update = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  return (
    <div className="relative min-h-svh" data-background={bg}>
      {bg !== "yok" && (
        <div
          aria-hidden="true"
          inert
          data-testid="background"
          className="fixed inset-0 z-0 overflow-hidden"
        >
          <SilkPlate
            src={
              bg === "ipek-tek"
                ? plate
                : bg === "ipek-seyrek"
                  ? "/flowers/bouquet-seyrek.webp"
                  : "/flowers/bouquet.webp"
            }
            light={light}
            fit={bg === "ipek-tek" ? "contain" : "cover"}
            still={still}
          />
        </div>
      )}
      <div className={sheetHidden ? "invisible relative z-10" : "relative z-10"}>
        <HerbariumLogin />
      </div>
      <nav
        aria-label="Arka plan seçenekleri"
        className="fixed inset-x-2 bottom-2 z-20 flex flex-wrap items-center justify-center gap-1 rounded-lg border bg-popover/95 p-2 shadow-lift backdrop-blur md:inset-x-auto md:right-4 md:bottom-4"
      >
        <span className="px-1 text-xs text-muted-foreground">Arka plan</span>
        {BACKGROUNDS.map((b) => (
          <Button
            key={b.id}
            size="xs"
            variant={b.id === bg ? "default" : "outline"}
            aria-pressed={b.id === bg}
            onClick={() => update("bg", b.id)}
          >
            {b.name}
          </Button>
        ))}
        {bg === "ipek-tek" && (
          <Button
            size="xs"
            variant="outline"
            onClick={() =>
              update(
                "cicek",
                cutoutFlowerIds[(cutoutFlowerIds.indexOf(flowerId) + 1) % cutoutFlowerIds.length] ??
                  null,
              )
            }
          >
            Başka çiçek
          </Button>
        )}
        <Button
          size="xs"
          variant={sheetHidden ? "default" : "ghost"}
          aria-pressed={sheetHidden}
          onClick={() => update("sayfa", sheetHidden ? null : "gizli")}
        >
          Sayfayı gizle
        </Button>
        <Button size="xs" variant="ghost" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </nav>
    </div>
  );
}
