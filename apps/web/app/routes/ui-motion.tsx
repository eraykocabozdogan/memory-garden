import { flowerCatalog, scientificName } from "@memory-garden/shared/flowers/catalog";
import { startTransition, useState, ViewTransition } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/ui-motion";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Hareket önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2, decision 10): movement is the browser's own View Transitions,
// driven by React 19.3's <ViewTransition>. No animation library: the Motion candidate was
// compared here on these same two interactions and dropped, and the Motion decision is left to
// the special-components step. The update has to run inside a Transition for the browser to
// take its before/after snapshot. Timing lives in app/view-transition.css.

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

/** A view-transition name has to be unique and a valid identifier; Turkish letters are not. */
function slug(text: string) {
  return text.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

export default function UiMotion() {
  const [open, setOpen] = useState<string | null>(null);
  const [items, setItems] = useState(["Kuşadası, sabah", "İlk kar", "Mutfakta kahve"]);
  const [added, setAdded] = useState(0);

  const card = CARDS.find((c) => c.id === open);

  return (
    <main className="grid gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl">Hareket</h1>
        <p className="max-w-prose text-muted-foreground">
          Karar 10: geçişleri tarayıcının kendisi yapıyor, animasyon kütüphanesi yok. Desteklemeyen
          tarayıcıda geçiş olmaz, sayfa yine çalışır; "hareketi azalt" açıkken de kapanır.
        </p>
      </header>

      <Card data-testid="senaryo-kart">
        <CardHeader>
          <CardTitle className="text-base">1 · Anı kartından tam ekrana</CardTitle>
          <p className="text-sm text-muted-foreground">
            Galerideki bir anıya dokununca büyüyüp ayrıntıya dönüşmesi: aynı isim iki yerde
            kullanıldığı için tarayıcı kartı ayrıntıya taşıyor.
          </p>
        </CardHeader>
        <CardContent>
          {card ? (
            <ViewTransition name={`kart-${card.id}`}>
              <div className="overflow-hidden rounded-md border bg-card shadow-card">
                <img
                  src={card.src}
                  alt={card.name}
                  className="h-64 w-full object-cover object-top"
                />
                <div className="grid gap-1 p-4">
                  <p className="font-heading text-2xl">
                    {card.name} <span className="text-muted-foreground italic">{card.latin}</span>
                  </p>
                  <p className="text-muted-foreground">{card.meaning}</p>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startTransition(() => setOpen(null))}
                    >
                      Kapat
                    </Button>
                  </div>
                </div>
              </div>
            </ViewTransition>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {CARDS.map((item) => (
                <li key={item.id}>
                  <ViewTransition name={`kart-${item.id}`}>
                    <button
                      type="button"
                      onClick={() => startTransition(() => setOpen(item.id))}
                      className="block w-full overflow-hidden rounded-md border bg-card text-left shadow-card"
                    >
                      <img
                        src={item.src}
                        alt={item.name}
                        className="h-28 w-full object-cover object-top"
                      />
                      <span className="block px-2 py-1.5 text-sm">{item.name}</span>
                    </button>
                  </ViewTransition>
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
                startTransition(() => {
                  setItems((list) => [`Yeni anı ${added + 1}`, ...list]);
                  setAdded((n) => n + 1);
                })
              }
            >
              Anı ekle
            </Button>
          </div>
          <ul className="grid gap-2">
            {items.map((item) => (
              <ViewTransition key={item} name={`satir-${slug(item)}`}>
                <li className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
                  <span className="mr-auto">{item}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    aria-label={`${item} sil`}
                    onClick={() =>
                      startTransition(() => setItems((list) => list.filter((i) => i !== item)))
                    }
                  >
                    Sil
                  </Button>
                </li>
              </ViewTransition>
            ))}
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
