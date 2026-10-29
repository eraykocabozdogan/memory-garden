import {
  CalendarHeart as PhCalendarHeart,
  Flower as PhFlower,
  Gear as PhGear,
  Heart as PhHeart,
  Images as PhImages,
  MagnifyingGlass as PhMagnifyingGlass,
  MapPin as PhMapPin,
  Notebook as PhNotebook,
  PencilSimple as PhPencilSimple,
  Plus as PhPlus,
  Trash as PhTrash,
} from "@phosphor-icons/react";
import {
  IconCalendarHeart,
  IconFlower,
  IconHeart,
  IconMapPin,
  IconNotebook,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import {
  CalendarHeart,
  Flower2,
  Heart,
  Images,
  MapPin,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-icons";

export function meta(_: Route.MetaArgs) {
  return [{ title: "İkon önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): the same eleven concepts drawn by each candidate icon set,
// in real context (buttons and the mobile bottom bar), so they can be compared side by side.

const CONCEPTS = [
  "Anılar",
  "Günlük",
  "Bahçe",
  "Özel günler",
  "Ayarlar",
  "Ekle",
  "Sil",
  "Düzenle",
  "Ara",
  "Konum",
  "Kalp",
] as const;

const LUCIDE = [
  Images,
  NotebookPen,
  Flower2,
  CalendarHeart,
  Settings,
  Plus,
  Trash,
  Pencil,
  Search,
  MapPin,
  Heart,
];
const PHOSPHOR = [
  PhImages,
  PhNotebook,
  PhFlower,
  PhCalendarHeart,
  PhGear,
  PhPlus,
  PhTrash,
  PhPencilSimple,
  PhMagnifyingGlass,
  PhMapPin,
  PhHeart,
];
const TABLER = [
  IconPhoto,
  IconNotebook,
  IconFlower,
  IconCalendarHeart,
  IconSettings,
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconMapPin,
  IconHeart,
];

type IconSet = {
  id: string;
  name: string;
  note: string;
  draw: (index: number, className: string) => ReactNode;
};

const SETS: IconSet[] = [
  {
    id: "lucide",
    name: "Lucide",
    note: "shadcn'in varsayılanı · 2px çizgi",
    draw: (i, className) => {
      const Icon = LUCIDE[i];
      return Icon && <Icon className={className} strokeWidth={2} aria-hidden="true" />;
    },
  },
  {
    id: "lucide-ince",
    name: "Lucide ince",
    note: "aynı set · 1.5px çizgi",
    draw: (i, className) => {
      const Icon = LUCIDE[i];
      return Icon && <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
    },
  },
  {
    id: "phosphor-light",
    name: "Phosphor hafif",
    note: "Phosphor · light ağırlık",
    draw: (i, className) => {
      const Icon = PHOSPHOR[i];
      return Icon && <Icon className={className} weight="light" aria-hidden="true" />;
    },
  },
  {
    id: "phosphor-regular",
    name: "Phosphor normal",
    note: "Phosphor · regular ağırlık",
    draw: (i, className) => {
      const Icon = PHOSPHOR[i];
      return Icon && <Icon className={className} weight="regular" aria-hidden="true" />;
    },
  },
  {
    id: "phosphor-duotone",
    name: "Phosphor iki tonlu",
    note: "Phosphor · duotone: çizgi + soluk dolgu",
    draw: (i, className) => {
      const Icon = PHOSPHOR[i];
      return Icon && <Icon className={className} weight="duotone" aria-hidden="true" />;
    },
  },
  {
    id: "tabler-ince",
    name: "Tabler ince",
    note: "Tabler · 1.5px çizgi",
    draw: (i, className) => {
      const Icon = TABLER[i];
      return Icon && <Icon className={className} stroke={1.5} aria-hidden="true" />;
    },
  },
];

const NAV = [0, 1, 2, 3, 4] as const;

function SetCard({ set }: { set: IconSet }) {
  return (
    <section
      aria-labelledby={`set-${set.id}`}
      data-testid="icon-set"
      className="grid gap-4 rounded-lg border bg-card p-card text-card-foreground shadow-card"
    >
      <div>
        <h2 id={`set-${set.id}`} className="text-lg font-semibold">
          {set.name}
        </h2>
        <p className="text-sm text-muted-foreground">{set.note}</p>
      </div>

      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
        {CONCEPTS.map((concept, i) => (
          <li key={concept} className="flex flex-col items-center gap-1 text-center">
            {set.draw(i, "size-6")}
            <span className="text-[11px] leading-tight text-muted-foreground">{concept}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          {set.draw(5, "size-4")}
          Anı ekle
        </Button>
        <Button size="sm" variant="outline">
          {set.draw(7, "size-4")}
          Düzenle
        </Button>
        <Button size="sm" variant="destructive">
          {set.draw(6, "size-4")}
          Sil
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Ara">
          {set.draw(8, "size-4")}
        </Button>
      </div>

      <nav
        aria-label={`${set.name} alt menü örneği`}
        className="grid grid-cols-5 rounded-md border bg-background"
      >
        {NAV.map((i) => (
          <span
            key={i}
            className={`flex flex-col items-center gap-1 py-2 text-xs ${
              i === 0 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {set.draw(i, "size-5")}
            {CONCEPTS[i]}
          </span>
        ))}
      </nav>
    </section>
  );
}

export default function UiIcons() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">İkon setleri</h1>
        <Button variant="outline" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </div>
      <p className="max-w-prose text-muted-foreground">
        Aynı on bir kavram, her sette aynı boyutta. Altında butonlarda ve mobil alt menüde nasıl
        durduğu.
      </p>
      {SETS.map((set) => (
        <SetCard key={set.id} set={set} />
      ))}
    </main>
  );
}
