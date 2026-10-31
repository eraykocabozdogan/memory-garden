import { useState } from "react";
import { Link } from "react-router";

import { CountUp } from "~/components/count-up";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/ui-text";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Yazı animasyonu önizlemesi · Memory Garden" },
    { name: "robots", content: "noindex" },
  ];
}

// Design-system preview (stage 2, decision 9): the three chosen text motions on the real type
// scale. The candidates that lost (letter by letter, blur in, typewriter, sheen, rotating word,
// pen-drawn outlines) were deleted with the choice. "Tekrar oynat" remounts the cards, which
// restarts the animations.

const HEADING = "Bahçende 47 anı açtı";
const BODY = "Kuşadası'nda sabah, denizin rengi daha uyanmamıştı.";

/** 9-2: splits a line into words that carry their own stagger index. */
function Reveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={`anim-beliris ${className ?? ""}`}>
      {words.map((word, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: constant text, and the index is the stagger step.
          key={`${word}-${i}`}
          style={{ "--i": i } as React.CSSProperties}
          className="inline-block whitespace-pre"
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export default function UiText() {
  const [run, setRun] = useState(0);

  return (
    <main className="grid gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl">Yazı animasyonu</h1>
        <p className="max-w-prose text-muted-foreground">
          Karar 9: başlıklarda ve metinlerde yumuşak beliriş, el yazısı notlarda yazılma, öne çıkan
          sayılarda sayaç. Hepsi sade CSS; "hareketi azalt" açıkken hiçbiri çalışmaz.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setRun((n) => n + 1)}>
            Tekrar oynat
          </Button>
          <Button size="sm" variant="ghost" render={<Link to="/ui" />}>
            ← Önizleme
          </Button>
        </div>
      </header>

      <div key={run} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card data-testid="aday-9-2">
          <CardHeader>
            <CardTitle className="text-base">9-2 · Yumuşak beliriş</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kelimeler sırayla, hafifçe yukarı kayarak beliriyor (380 ms). Başlıklar ve metinler.
            </p>
          </CardHeader>
          <CardContent className="grid min-h-28 content-center gap-3">
            <Reveal text={HEADING} className="font-heading text-3xl" />
            <Reveal text={BODY} className="text-muted-foreground" />
          </CardContent>
        </Card>

        <Card data-testid="aday-9-3">
          <CardHeader>
            <CardTitle className="text-base">9-3 · El yazısı yazılıyor</CardTitle>
            <p className="text-sm text-muted-foreground">
              Soldan sağa yazılıyormuş gibi. Yalnızca el yazısı notlar için.
            </p>
          </CardHeader>
          <CardContent className="grid min-h-28 content-center">
            <p className="anim-elyazisi font-hand text-4xl text-muted-foreground">
              Her anı bir çiçek…
            </p>
          </CardContent>
        </Card>

        <Card data-testid="aday-9-5">
          <CardHeader>
            <CardTitle className="text-base">9-5 · Sayaç</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sayı sıfırdan hedefe akıyor. Geri sayım kartı ve öne çıkan sayılar için.
            </p>
          </CardHeader>
          <CardContent className="flex min-h-28 flex-wrap items-baseline gap-6">
            <span className="font-heading text-5xl font-semibold">
              <CountUp to={47} /> <span className="text-base text-muted-foreground">anı</span>
            </span>
            <span className="font-heading text-5xl font-semibold">
              <CountUp to={128} /> <span className="text-base text-muted-foreground">gün</span>
            </span>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
