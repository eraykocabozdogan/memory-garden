import { flowerCatalog, scientificName } from "@memory-garden/shared/flowers/catalog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { startTransition, useState, ViewTransition } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/ui-motion";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Hareket önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2, decision 10): the same two interactions done three ways, so
// the choice is made on the owner's device rather than on paper.
//   yok    – the state simply changes
//   gecis  – the browser's own View Transitions, through React's <ViewTransition> (no package)
//   motion – the Motion library: layoutId for the shared element, AnimatePresence for the list
// Motion is imported only by this route, so it stays out of the app's bundle while the decision
// is open. If View Transitions wins, the package and this page go.

const MODES = [
  { id: "yok", name: "Yok" },
  { id: "gecis", name: "View Transitions" },
  { id: "motion", name: "Motion" },
] as const;

type Mode = (typeof MODES)[number]["id"];

const CARDS = flowerCatalog
  .filter((flower) => flower.artwork)
  .slice(0, 6)
  .map((flower) => ({
    id: flower.id,
    name: flower.name,
    latin: scientificName(flower),
    meaning: flower.meaning,
    src: flower.artwork?.src ?? "",
  }));

export default function UiMotion() {
  const [mode, setMode] = useState<Mode>("gecis");
  const [open, setOpen] = useState<string | null>(null);
  const [items, setItems] = useState(["Kuşadası, sabah", "İlk kar", "Mutfakta kahve"]);
  const [added, setAdded] = useState(0);
  const reduce = useReducedMotion();

  // React runs a view transition for updates inside a Transition; the other modes update plainly.
  const change = (update: () => void) => {
    if (mode === "gecis") startTransition(update);
    else update();
  };

  const card = CARDS.find((c) => c.id === open);
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 32 };

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl">Hareket adayları</h1>
        <p className="text-muted-foreground">
          Karar 10. Aynı iki etkileşim üç yolla: hiç animasyonsuz, tarayıcının kendi geçişleriyle
          (paket yok) ve Motion kütüphanesiyle. "Hareketi azalt" açıkken üçü de durur.
        </p>
        <nav aria-label="Hareket yöntemi" className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={m.id === mode ? "default" : "outline"}
              aria-pressed={m.id === mode}
              onClick={() => {
                setOpen(null);
                setMode(m.id);
              }}
            >
              {m.name}
            </Button>
          ))}
        </nav>
      </header>

      <Card data-testid="senaryo-kart">
        <CardHeader>
          <CardTitle className="text-base">1 · Anı kartından tam ekrana</CardTitle>
          <p className="text-sm text-muted-foreground">
            Galerideki bir anıya dokununca büyüyüp ayrıntıya dönüşmesi. Asıl zor olan hareket bu.
          </p>
        </CardHeader>
        <CardContent>
          {card ? (
            <Detail
              mode={mode}
              card={card}
              spring={spring}
              onClose={() => change(() => setOpen(null))}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CARDS.map((item) => (
                <li key={item.id}>
                  <Thumb
                    mode={mode}
                    card={item}
                    spring={spring}
                    onOpen={() => change(() => setOpen(item.id))}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card data-testid="senaryo-liste">
        <CardHeader>
          <CardTitle className="text-base">2 · Listeye anı eklemek ve silmek</CardTitle>
          <p className="text-sm text-muted-foreground">
            Yeni bir anı eklendiğinde ve silindiğinde diğerlerinin yer değiştirmesi.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <Button
              size="sm"
              onClick={() =>
                change(() => {
                  setItems((list) => [`Yeni anı ${added + 1}`, ...list]);
                  setAdded((n) => n + 1);
                })
              }
            >
              Anı ekle
            </Button>
          </div>
          <ul className="grid gap-2">
            {mode === "motion" ? (
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={spring}
                  >
                    <Row
                      item={item}
                      onRemove={() => setItems((list) => list.filter((i) => i !== item))}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            ) : (
              items.map((item) =>
                mode === "gecis" ? (
                  <ViewTransition key={item} name={`satir-${slug(item)}`}>
                    <li>
                      <Row
                        item={item}
                        onRemove={() =>
                          change(() => setItems((list) => list.filter((i) => i !== item)))
                        }
                      />
                    </li>
                  </ViewTransition>
                ) : (
                  <li key={item}>
                    <Row
                      item={item}
                      onRemove={() => setItems((list) => list.filter((i) => i !== item))}
                    />
                  </li>
                ),
              )
            )}
          </ul>
        </CardContent>
      </Card>

      <div>
        <Button size="sm" variant="ghost" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </div>
    </main>
  );
}

type CardData = (typeof CARDS)[number];
type Spring = { duration: number } | { type: "spring"; stiffness: number; damping: number };

/** A view-transition name has to be unique and valid, and Turkish letters are not. */
function slug(text: string) {
  return text.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

function Thumb({
  mode,
  card,
  spring,
  onOpen,
}: {
  mode: Mode;
  card: CardData;
  spring: Spring;
  onOpen: () => void;
}) {
  const button = (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full overflow-hidden rounded-md border bg-card text-left shadow-card"
    >
      <img src={card.src} alt={card.name} className="h-28 w-full object-cover object-top" />
      <span className="block px-2 py-1.5 text-sm">{card.name}</span>
    </button>
  );
  if (mode === "gecis") return <ViewTransition name={`kart-${card.id}`}>{button}</ViewTransition>;
  if (mode === "motion")
    return (
      <motion.div layoutId={`kart-${card.id}`} transition={spring}>
        {button}
      </motion.div>
    );
  return button;
}

function Detail({
  mode,
  card,
  spring,
  onClose,
}: {
  mode: Mode;
  card: CardData;
  spring: Spring;
  onClose: () => void;
}) {
  const panel = (
    <div className="overflow-hidden rounded-md border bg-card shadow-card">
      <img src={card.src} alt={card.name} className="h-64 w-full object-cover object-top" />
      <div className="grid gap-1 p-4">
        <p className="font-heading text-2xl">
          {card.name} <span className="text-muted-foreground italic">{card.latin}</span>
        </p>
        <p className="text-muted-foreground">{card.meaning}</p>
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
  if (mode === "gecis") return <ViewTransition name={`kart-${card.id}`}>{panel}</ViewTransition>;
  if (mode === "motion")
    return (
      <motion.div layoutId={`kart-${card.id}`} transition={spring}>
        {panel}
      </motion.div>
    );
  return panel;
}

function Row({ item, onRemove }: { item: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
      <span className="mr-auto">{item}</span>
      <Button size="xs" variant="ghost" onClick={onRemove} aria-label={`${item} sil`}>
        Sil
      </Button>
    </div>
  );
}
