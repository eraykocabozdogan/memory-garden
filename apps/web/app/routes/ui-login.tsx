import { flowerCatalog } from "@memory-garden/shared/flowers/catalog";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import DriftWall from "~/components/backgrounds/DriftWall";
import GridMotion from "~/components/backgrounds/GridMotion";
import LogoLoop from "~/components/backgrounds/LogoLoop";
import Silk from "~/components/backgrounds/Silk";
import { HerbariumLogin } from "~/components/herbarium-login";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): candidate backgrounds behind the herbarium login. The owner
// liked Silk and wants many Curtis plates in the background, so the image candidates use small
// thumbnails (public/flowers/thumb, ~7 KB each, `pnpm flowers:thumbs`) and are faded so the
// sheet stays in front. The layer is `inert` + aria-hidden: nothing in it can take focus or
// clicks (Drift Wall makes every tile a focusable button otherwise).

const BACKGROUNDS = [
  { id: "yok", name: "Yok" },
  { id: "silk", name: "Silk" },
  { id: "grid", name: "Grid Motion" },
  { id: "drift", name: "Drift Wall" },
  { id: "loop", name: "Kayan sıralar" },
  { id: "duvar", name: "Duran duvar" },
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

const CREAM = "#faf3e3";
const SAND = "#edd4ab";

// A fixed shuffle so neighbouring tiles differ but every visit looks the same.
const PLATES = flowerCatalog
  .map((flower, i) => ({ src: `/flowers/thumb/${flower.id}.webp`, order: (i * 37) % 61 }))
  .sort((a, b) => a.order - b.order)
  .map(({ src }) => src);

function rows(count: number) {
  const size = Math.ceil(PLATES.length / count);
  return Array.from({ length: count }, (_, r) => PLATES.slice(r * size, (r + 1) * size));
}

function PlateWall() {
  return (
    <div className="columns-3 gap-3 p-3 sm:columns-5 lg:columns-8">
      {PLATES.map((src) => (
        <img key={src} src={src} alt="" loading="lazy" className="mb-3 w-full rounded-sm" />
      ))}
    </div>
  );
}

function Background({
  id,
  light,
  dpr,
  still,
}: {
  id: BackgroundId;
  light: boolean;
  dpr: number;
  still: boolean;
}) {
  let layer: ReactNode = null;
  // Image layers are faded (and warmed slightly) so the sheet keeps the attention.
  let faded = true;
  if (id === "silk") {
    faded = false;
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
  } else if (id === "grid") {
    layer = (
      <GridMotion
        items={PLATES.map((src) => ({ src, alt: "" }))}
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
  } else if (id === "drift") {
    layer = (
      <DriftWall
        items={PLATES.map((image) => ({ image }))}
        columns={6}
        tileWidth={130}
        tileHeight={210}
        gap={16}
        radius={4}
        speed={18}
        lift={0}
        // Drift Wall's `dim` is the tile opacity (not a darkening amount), and each tile has
        // a dark overlay by default; keep tiles opaque and drop the overlay, the layer fades.
        dim={1}
        overlayColor="transparent"
        fade={0.3}
      />
    );
  } else if (id === "loop") {
    layer = (
      <div className="flex h-full flex-col justify-around">
        {rows(3).map((row, r) => (
          <LogoLoop
            // biome-ignore lint/suspicious/noArrayIndexKey: three fixed rows
            key={r}
            logos={row.map((src) => ({ src, alt: "" }))}
            speed={r % 2 ? 18 : 24}
            direction={r % 2 ? "right" : "left"}
            logoHeight={180}
            gap={20}
            pauseOnHover={false}
            draggable={false}
            fadeOut={false}
          />
        ))}
      </div>
    );
  } else if (id === "duvar") {
    layer = <PlateWall />;
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
  const { resolvedTheme } = useTheme();
  const [dpr, setDpr] = useState(1);
  // `paused` makes the WebGL background draw one frame and stop for "reduce motion".
  const [still, setStill] = useState(false);
  useEffect(() => {
    setDpr(window.matchMedia("(max-width: 767px)").matches ? 1 : 1.5);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="relative min-h-svh" data-background={bg}>
      <Background id={bg} light={resolvedTheme !== "dark"} dpr={dpr} still={still} />
      <div className="relative z-10">
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
            onClick={() => setParams({ bg: b.id }, { replace: true })}
          >
            {b.name}
          </Button>
        ))}
        <Button size="xs" variant="ghost" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </nav>
    </div>
  );
}
