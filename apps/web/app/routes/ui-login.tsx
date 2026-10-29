import { flowerCatalog } from "@memory-garden/shared/flowers/catalog";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { FlowerFlow } from "~/components/art/flower-flow";
import { SilkPlate } from "~/components/art/silk-plate";
import GridMotion from "~/components/backgrounds/GridMotion";
import Silk from "~/components/backgrounds/Silk";
import { HerbariumLogin } from "~/components/herbarium-login";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): candidate backgrounds behind the herbarium login.
// Shortlist after the owner's feedback: Silk and Grid Motion (React Bits), plus two hand-written
// WebGL scenes: a plate printed on silk (one random plate, or a collage) and plates flowing
// over an invisible 3D flower. The layer is `inert` + aria-hidden, so nothing in it takes focus.
// "Sayfayı gizle" hides the herbarium sheet to see a background on its own.

const BACKGROUNDS = [
  { id: "yok", name: "Yok" },
  { id: "silk", name: "Silk" },
  { id: "silk-tek", name: "Silk + tek Curtis" },
  { id: "silk-kolaj", name: "Silk + kolaj" },
  { id: "cicek", name: "3D çiçek" },
  { id: "grid", name: "Grid Motion" },
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

const CREAM = "#faf3e3";
const SAND = "#edd4ab";

// A fixed shuffle of the thumbnails for Grid Motion.
const THUMBS = flowerCatalog
  .map((flower, i) => ({ src: `/flowers/thumb/${flower.id}.webp`, order: (i * 37) % 61 }))
  .sort((a, b) => a.order - b.order)
  .map(({ src }) => src);

function Background({
  id,
  light,
  dpr,
  still,
  plate,
}: {
  id: BackgroundId;
  light: boolean;
  dpr: number;
  still: boolean;
  plate: string;
}) {
  let layer: ReactNode = null;
  let faded = false;
  if (id === "silk") {
    layer = (
      <Silk
        speed={1.5}
        color={light ? SAND : "#4a3c2e"}
        sheenColor={light ? CREAM : SAND}
        lightMode={light}
        mouseInteraction={false}
        dpr={dpr}
        paused={still}
      />
    );
  } else if (id === "silk-tek") {
    layer = <SilkPlate src={plate} fit="contain" light={light} still={still} />;
  } else if (id === "silk-kolaj") {
    layer = <SilkPlate src="/flowers/collage.webp" fit="cover" light={light} still={still} />;
  } else if (id === "cicek") {
    layer = <FlowerFlow light={light} still={still} />;
  } else if (id === "grid") {
    faded = true;
    layer = (
      <GridMotion
        items={THUMBS.map((src) => ({ src, alt: "" }))}
        rows={5}
        aspectRatio={0.62}
        gap={14}
        radius={4}
        speed={10}
        spotlight={0}
        dim={0}
        fade={0.3}
        theme={light ? "light" : "dark"}
      />
    );
  }
  if (!layer) return null;
  return (
    <div
      aria-hidden="true"
      inert
      data-testid="background"
      className="fixed inset-0 z-0 overflow-hidden"
      style={
        faded ? { opacity: light ? 0.32 : 0.22, filter: "sepia(0.25) saturate(0.85)" } : undefined
      }
    >
      {layer}
    </div>
  );
}

export default function UiLogin() {
  const [params, setParams] = useSearchParams();
  const bg: BackgroundId = BACKGROUNDS.find((b) => b.id === params.get("bg"))?.id ?? "yok";
  const sheetHidden = params.get("sayfa") === "gizli";
  const { resolvedTheme } = useTheme();
  const [dpr, setDpr] = useState(1);
  // `paused`/`still` makes the WebGL backgrounds draw one frame and stop for "reduce motion".
  const [still, setStill] = useState(false);
  // "Silk + tek Curtis" shows a random plate on every visit (owner's choice over "flower of
  // the day" for a single background plate).
  const [plate] = useState(() => {
    const flower = flowerCatalog[Math.floor(Math.random() * flowerCatalog.length)];
    return flower?.artwork.src ?? "/flowers/art/viola-tricolor.webp";
  });
  useEffect(() => {
    setDpr(window.matchMedia("(max-width: 767px)").matches ? 1 : 1.5);
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
      <Background id={bg} light={resolvedTheme !== "dark"} dpr={dpr} still={still} plate={plate} />
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
