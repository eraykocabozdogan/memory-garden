import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import Aurora from "~/components/backgrounds/Aurora";
import Iridescence from "~/components/backgrounds/Iridescence";
import Particles from "~/components/backgrounds/Particles";
import Silk from "~/components/backgrounds/Silk";
import { HerbariumLogin } from "~/components/herbarium-login";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): the chosen login screen, with candidate animated
// backgrounds from React Bits behind the herbarium sheet (decision 8, step 8). Colours are
// pulled into the Parchment palette and everything is slowed down; phones render at 1x pixel
// ratio and desktops at 1.5x to save battery. All four pause off-screen, in hidden tabs and
// for "reduce motion" (checked in their source).

const BACKGROUNDS = [
  { id: "yok", name: "Yok" },
  { id: "silk", name: "Silk" },
  { id: "particles", name: "Particles" },
  { id: "aurora", name: "Aurora" },
  { id: "iridescence", name: "Iridescence" },
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

// Parchment colours as hex (the WebGL components take hex, not oklch).
const CREAM = "#faf3e3";
const SAND = "#edd4ab";
const SAGE = "#94ad8f";
const GREEN = "#2a5938";
const MAUVE = "#a7777e";

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
  } else if (id === "particles") {
    layer = (
      <Particles
        particleColors={[GREEN, SAGE, MAUVE, SAND]}
        particleCount={140}
        speed={0.04}
        particleBaseSize={70}
        alphaParticles
        moveParticlesOnHover={false}
        lightMode={light}
        opacity={0.8}
        pixelRatio={dpr}
        paused={still}
      />
    );
  } else if (id === "aurora") {
    layer = (
      <Aurora
        colorStops={[SAND, SAGE, MAUVE]}
        amplitude={0.6}
        speed={0.3}
        mouseInteraction={false}
        lightMode={light}
        opacity={0.7}
        dpr={dpr}
        paused={still}
      />
    );
  } else if (id === "iridescence") {
    layer = (
      <Iridescence
        color={light ? [0.95, 0.88, 0.74] : [0.35, 0.28, 0.22]}
        speed={0.3}
        mouseReact={false}
        saturation={0.6}
        brightness={1}
        opacity={0.6}
        resolution={dpr}
        paused={still}
      />
    );
  }
  if (!layer) return null;
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0" data-testid="background">
      {layer}
    </div>
  );
}

export default function UiLogin() {
  const [params, setParams] = useSearchParams();
  const bg: BackgroundId = BACKGROUNDS.find((b) => b.id === params.get("bg"))?.id ?? "yok";
  const { resolvedTheme } = useTheme();
  const [dpr, setDpr] = useState(1);
  // Aurora freezes its clock for "reduce motion" but keeps redrawing every frame; passing
  // `paused` makes every candidate draw one frame and stop.
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
