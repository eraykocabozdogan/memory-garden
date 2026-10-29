import {
  CalendarHeart,
  Flower,
  Gear,
  Heart,
  type Icon,
  type IconWeight,
  Images,
  MagnifyingGlass,
  MapPin,
  Notebook,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-icons";

export function meta(_: Route.MetaArgs) {
  return [{ title: "İkon önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): the chosen icon set (decision 8-7). Phosphor, "light" by
// default (set in root.tsx) and "regular" for navigation, where thin strokes look faint.
// Rejected: Lucide (2px and 1.5px), Phosphor duotone, Tabler.

const CONCEPTS: { label: string; icon: Icon }[] = [
  { label: "Anılar", icon: Images },
  { label: "Günlük", icon: Notebook },
  { label: "Bahçe", icon: Flower },
  { label: "Özel günler", icon: CalendarHeart },
  { label: "Ayarlar", icon: Gear },
  { label: "Ekle", icon: Plus },
  { label: "Sil", icon: Trash },
  { label: "Düzenle", icon: PencilSimple },
  { label: "Ara", icon: MagnifyingGlass },
  { label: "Konum", icon: MapPin },
  { label: "Kalp", icon: Heart },
];

function IconRow({ title, note, weight }: { title: string; note: string; weight: IconWeight }) {
  return (
    <section
      aria-labelledby={`set-${weight}`}
      data-testid="icon-set"
      className="grid gap-4 rounded-lg border bg-card p-card text-card-foreground shadow-card"
    >
      <div>
        <h2 id={`set-${weight}`} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{note}</p>
      </div>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
        {CONCEPTS.map(({ label, icon: Glyph }) => (
          <li key={label} className="flex flex-col items-center gap-1 text-center">
            <Glyph className="size-6" weight={weight} aria-hidden="true" />
            <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function UiIcons() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">İkonlar: Phosphor</h1>
        <Button variant="outline" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </div>
      <IconRow title="Hafif (varsayılan)" note="Butonlar, kartlar, içerik" weight="light" />
      <IconRow title="Normal" note="Yan menü ve mobil alt menü" weight="regular" />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          <Plus aria-hidden="true" />
          Anı ekle
        </Button>
        <Button size="sm" variant="outline">
          <PencilSimple aria-hidden="true" />
          Düzenle
        </Button>
        <Button size="sm" variant="destructive">
          <Trash aria-hidden="true" />
          Sil
        </Button>
      </div>
    </main>
  );
}
